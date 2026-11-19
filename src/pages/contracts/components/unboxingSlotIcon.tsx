import { Aperture, Barcode, Package, Smartphone } from 'lucide-react'
import type { UnboxingSlot } from '../../../constants/unboxingPhotos'

const SLOT_ICONS: Record<UnboxingSlot['icon'], React.ReactNode> = {
  screen: <Smartphone size={16} strokeWidth={2.25} />,
  back: <Aperture size={16} strokeWidth={2.25} />,
  barcode: <Barcode size={16} strokeWidth={2.25} />,
  box: <Package size={16} strokeWidth={2.25} />,
}

export function slotIcon(slot: UnboxingSlot) {
  return SLOT_ICONS[slot.icon]
}
