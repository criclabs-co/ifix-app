import { Typography, theme } from 'antd'
import type { DeviceSnapshot, UnboxingPhotos } from '../../../types/contract'
import { PhotoSlotCard } from '../../../components/PhotoSlotCard'
import { PhotoUpload } from '../../../components/PhotoUpload'
import { MAX_OTHER_UNBOXING_PHOTOS, unboxingSlots } from '../../../constants/unboxingPhotos'
import { slotIcon } from './unboxingSlotIcon'

interface Props {
  device: Pick<DeviceSnapshot, 'imei1'>
  value?: UnboxingPhotos
  onChange?: (value: UnboxingPhotos) => void
  // Photos already saved on the contract (the "add later" case) — their
  // slots show the saved photo, locked, and only the empty ones take input.
  saved?: UnboxingPhotos
  // A line above the slots (what these are for / that they're optional).
  intro?: string
}

// The guided unboxing-photo slots plus an "Other" pile for extras, as one
// form control — used in the Record Down Payment drawer and the Device
// Photos tab's "Add photos" drawer. Every slot is optional.
export function UnboxingPhotosField({ device, value = {}, onChange, saved, intro }: Props) {
  const { token } = theme.useToken()
  const savedOther = saved?.other?.length ?? 0
  const otherRoom = MAX_OTHER_UNBOXING_PHOTOS - savedOther

  return (
    <div>
      {intro && (
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: token.fontSizeSM }}>{intro}</Typography.Text>
      )}
      <div className="ifix-photo-slot-grid">
        {unboxingSlots(device).map(slot => {
          const savedPhoto = saved?.[slot.key]
          return (
            <PhotoSlotCard
              key={slot.key}
              label={slot.label}
              hint={slot.hint}
              icon={slotIcon(slot)}
              value={savedPhoto ?? value[slot.key]}
              locked={!!savedPhoto}
              onChange={url => onChange?.({ ...value, [slot.key]: url })}
            />
          )
        })}
      </div>

      {otherRoom > 0 && (
        <div style={{ marginTop: 16 }}>
          <Typography.Text style={{ display: 'block', marginBottom: 8 }}>Other</Typography.Text>
          <PhotoUpload
            value={value.other ?? []}
            onChange={other => onChange?.({ ...value, other })}
            maxCount={otherRoom}
            multiple
          />
          <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: token.fontSizeSM }}>
            {savedOther > 0 ? `Any other angles — ${otherRoom} more.` : `Any other angles — up to ${otherRoom}.`}
          </Typography.Text>
        </div>
      )}
    </div>
  )
}
