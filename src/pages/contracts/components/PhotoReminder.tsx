import { Button } from 'antd'
import { ImagePlus } from 'lucide-react'
import { Callout } from '../../../components/Callout'

interface Props {
  box: boolean
  unboxing: boolean
  // Opens the Device Photos tab; omitted when the viewer can't add photos
  // (the reminder still shows, just without the button).
  onUpload?: () => void
}

// Box and unboxing photos are preferred but optional — nothing waits on
// them — so instead of blocking, the contract keeps a reminder up until at
// least one photo of each missing set is added (see missingPhotoSets).
export function PhotoReminder({ box, unboxing, onUpload }: Props) {
  if (!box && !unboxing) return null
  const what = box && unboxing ? 'Box and unboxing photos' : box ? 'Box photos' : 'Unboxing photos'
  return (
    <Callout
      type="warning"
      message={`${what} haven't been uploaded`}
      description="They're optional, but they keep a record of the device's condition. Upload them so they aren't forgotten."
      action={onUpload && (
        <Button icon={<ImagePlus size={16} strokeWidth={2.25} />} onClick={onUpload}>Upload Photos</Button>
      )}
    />
  )
}
