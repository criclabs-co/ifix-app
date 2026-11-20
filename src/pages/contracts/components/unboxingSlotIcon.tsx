import { Aperture, Barcode, Package, PackageCheck, Smartphone } from 'lucide-react'
import type { PhotoSlotDef } from '../../../constants/unboxingPhotos'

const SLOT_ICONS: Record<PhotoSlotDef['icon'], React.ReactNode> = {
  screen: <Smartphone size={16} strokeWidth={2.25} />,
  back: <Aperture size={16} strokeWidth={2.25} />,
  barcode: <Barcode size={16} strokeWidth={2.25} />,
  box: <Package size={16} strokeWidth={2.25} />,
  seal: <PackageCheck size={16} strokeWidth={2.25} />,
}

export function slotIcon(slot: PhotoSlotDef) {
  return SLOT_ICONS[slot.icon]
}
