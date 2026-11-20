import { Typography, theme } from 'antd'
import type { DevicePhotos } from '../../../types/contract'
import { boxPhotoSlots } from '../../../constants/unboxingPhotos'
import { PhotoSlotsGrid } from './PhotoSlotsGrid'

interface Props {
  // The unit's IMEI, if any — a Wi-Fi-only device gets a Serial Label slot
  // instead of IMEI Label.
  imei?: string
  value?: DevicePhotos
  onChange?: (value: DevicePhotos) => void
}

// Box photos as a form control for the contract wizard (create and edit):
// the guided slots, all optional.
export function BoxPhotosInput({ imei, value, onChange }: Props) {
  const { token } = theme.useToken()
  return (
    <div>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: token.fontSizeSM }}>
        Optional, but recommended — they help a reviewer check the device. You can also add them later under Device Photos.
      </Typography.Text>
      <PhotoSlotsGrid slots={boxPhotoSlots({ imei1: imei })} value={value ?? {}} onChange={onChange} />
    </div>
  )
}
