import type { DeviceSnapshot, UnboxingPhotos } from '../types/contract'

// Post-unboxing photos — the device out of its box, taken in front of the
// customer at handover. Optional everywhere: activation never waits on them.
// Guided slots tell staff what to shoot; "Other" takes any extras, up to
// MAX_UNBOXING_PHOTOS in total.
export const MAX_UNBOXING_PHOTOS = 10

export type UnboxingSlotKey = 'frontScreen' | 'backCover' | 'idScreen' | 'boxContents'

export interface UnboxingSlot {
  key: UnboxingSlotKey
  label: string
  hint: string
  icon: 'screen' | 'back' | 'barcode' | 'box'
}

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
