import type { Contract, DevicePhotos, DeviceSnapshot, UnboxingPhotos } from '../types/contract'

// Post-unboxing photos — the device out of its box, taken in front of the
// customer at handover. Optional everywhere: activation never waits on them.
// Guided slots tell staff what to shoot; "Other" takes any extras, up to
// MAX_UNBOXING_PHOTOS in total.
export const MAX_UNBOXING_PHOTOS = 10

export type UnboxingSlotKey = 'frontScreen' | 'backCover' | 'idScreen' | 'boxContents'

// One guided photo slot: what it's called, what to shoot, and its icon.
export interface PhotoSlotDef<K extends string = string> {
  key: K
  label: string
  hint: string
  icon: 'screen' | 'back' | 'barcode' | 'box' | 'seal'
}

export type UnboxingSlot = PhotoSlotDef<UnboxingSlotKey>

// The ID screen proves which unit was handed over — the IMEI on a device
// that has one, the serial number on a Wi-Fi-only one (same rule as the
// IMEI label photo at contract creation).
export function unboxingSlots(device: Pick<DeviceSnapshot, 'imei1'>): UnboxingSlot[] {
  return [
    { key: 'frontScreen', label: 'Front Screen', hint: 'Display after unboxing', icon: 'screen' },
    { key: 'backCover', label: 'Back Cover', hint: 'Back panel & camera', icon: 'back' },
    device.imei1
      ? { key: 'idScreen', label: 'IMEI Screen', hint: 'Settings → About → IMEI', icon: 'barcode' }
      : { key: 'idScreen', label: 'Serial Number Screen', hint: 'Settings → About → Serial Number', icon: 'barcode' },
    { key: 'boxContents', label: 'Box Contents', hint: 'Accessories & full contents', icon: 'box' },
  ]
}

export const UNBOXING_SLOT_COUNT = 4
export const MAX_OTHER_UNBOXING_PHOTOS = MAX_UNBOXING_PHOTOS - UNBOXING_SLOT_COUNT

export function filledSlotCount(photos: UnboxingPhotos | undefined): number {
  if (!photos) return 0
  return (['frontScreen', 'backCover', 'idScreen', 'boxContents'] as const).filter(k => photos[k]).length
}

export function unboxingPhotoCount(photos: UnboxingPhotos | undefined): number {
  return filledSlotCount(photos) + (photos?.other?.length ?? 0)
}

// Box photos — the sealed box, taken at contract creation. Optional too
// (preferred, never blocking), so they can also be added later from the
// contract's Device Photos tab.
export type BoxSlotKey = keyof DevicePhotos

export function boxPhotoSlots(device: Pick<DeviceSnapshot, 'imei1'>): PhotoSlotDef<BoxSlotKey>[] {
  return [
    { key: 'front', label: 'Box Front', hint: 'Front of the sealed box', icon: 'box' },
    { key: 'back', label: 'Box Back', hint: 'Back of the box', icon: 'box' },
    device.imei1
      ? { key: 'imeiLabel', label: 'IMEI Label', hint: 'Sticker with the serial number & IMEI', icon: 'barcode' }
      : { key: 'imeiLabel', label: 'Serial Label', hint: 'Sticker with the serial number', icon: 'barcode' },
    { key: 'sealWrap', label: 'Seal / Wrap', hint: 'Factory seal or shrink wrap', icon: 'seal' },
  ]
}

export function hasAnyBoxPhoto(photos: DevicePhotos | undefined): boolean {
  return !!photos && Object.values(photos).some(Boolean)
}

// Which photo sets still need a reminder: box photos at any point, unboxing
// photos once the contract is activated (that's when the device is handed
// over). "Missing" means none at all — a partly filled set doesn't nag.
// A Closed or Settled contract is done, so it never asks.
export function missingPhotoSets(contract: Contract, activated: boolean): { box: boolean; unboxing: boolean } {
  if (contract.status === 'closed' || contract.status === 'settled') return { box: false, unboxing: false }
  return {
    box: !hasAnyBoxPhoto(contract.devicePhotos),
    unboxing: activated && unboxingPhotoCount(contract.unboxingPhotos) === 0,
  }
}
