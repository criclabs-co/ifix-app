import { Typography, theme } from 'antd'
import type { DeviceSnapshot, UnboxingPhotos } from '../../../types/contract'
import { PhotoUpload } from '../../../components/PhotoUpload'
import { MAX_OTHER_UNBOXING_PHOTOS, unboxingSlots } from '../../../constants/unboxingPhotos'
import { PhotoSlotsGrid } from './PhotoSlotsGrid'

interface Props {
  device: Pick<DeviceSnapshot, 'imei1'>
  value?: UnboxingPhotos
  onChange?: (value: UnboxingPhotos) => void
  // A line above the slots (what these are for / that they're optional).
  intro?: string
  // Confirm before a photo is removed — on for the Device Photos tab, where
  // each change saves straight away.
  confirmRemove?: boolean
}

// The guided unboxing-photo slots plus an "Other" pile for extras, as one
// form control — used in the Record Down Payment drawer and the Device
// Photos tab's "Add photos" drawer. Every slot is optional.
export function UnboxingPhotosField({ device, value = {}, onChange, intro, confirmRemove = false }: Props) {
  const { token } = theme.useToken()
  const otherCount = value.other?.length ?? 0

  return (
    <div>
      {intro && (
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: token.fontSizeSM }}>{intro}</Typography.Text>
      )}
      <PhotoSlotsGrid
        slots={unboxingSlots(device)}
        value={value}
        onChange={v => onChange?.({ ...value, ...v })}
        confirmRemove={confirmRemove}
      />

      <div style={{ marginTop: 16 }}>
        <Typography.Text style={{ display: 'block', marginBottom: 8 }}>Other</Typography.Text>
        <PhotoUpload
          value={value.other ?? []}
          onChange={other => onChange?.({ ...value, other })}
          maxCount={MAX_OTHER_UNBOXING_PHOTOS}
          multiple
          confirmRemove={confirmRemove}
        />
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: token.fontSizeSM }}>
          {otherCount > 0 ? `Any other angles — ${otherCount} of ${MAX_OTHER_UNBOXING_PHOTOS}.` : `Any other angles — up to ${MAX_OTHER_UNBOXING_PHOTOS}.`}
        </Typography.Text>
      </div>
    </div>
  )
}
