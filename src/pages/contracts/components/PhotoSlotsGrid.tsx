import { PhotoSlotCard } from '../../../components/PhotoSlotCard'
import type { PhotoSlotDef } from '../../../constants/unboxingPhotos'
import { slotIcon } from './unboxingSlotIcon'

interface Props<T extends object> {
  slots: PhotoSlotDef[]
  value?: T
  onChange?: (value: T) => void
  // View only: every slot read-only, empty ones read "Not added".
  readOnly?: boolean
}

// A grid of guided photo slots — used for box photos and unboxing photos,
// in the contract wizard, the Record Down Payment drawer and the Device
// Photos tab.
export function PhotoSlotsGrid<T extends object>({ slots, value, onChange, readOnly = false }: Props<T>) {
  // Slot keys are plain strings here; each caller's own type (DevicePhotos,
  // UnboxingPhotos) holds a photo URL under each of its slots' keys.
  const read = (from: T | undefined, key: string) => (from as Record<string, unknown> | undefined)?.[key] as string | undefined
  return (
    <div className="ifix-photo-slot-grid">
      {slots.map(slot => {
        return (
          <PhotoSlotCard
            key={slot.key}
            label={slot.label}
            hint={slot.hint}
            icon={slotIcon(slot)}
            value={read(value, slot.key)}
            readOnly={readOnly}
            onChange={url => onChange?.({ ...value, [slot.key]: url } as T)}
          />
        )
      })}
    </div>
  )
}
