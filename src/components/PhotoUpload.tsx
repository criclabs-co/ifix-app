import { App, Upload, theme } from 'antd'
import type { UploadFile } from 'antd'
import { Plus } from 'lucide-react'
import { useIconColors } from '../constants/iconColors'

interface Props {
  value?: string[]
  onChange?: (urls: string[]) => void
  maxCount?: number
  // Read-only mode — existing photos stay visible, but the add tile and the
  // per-photo remove action are both withdrawn.
  disabled?: boolean
  // Lets the file picker take several photos at once (still capped at
  // maxCount). Off by default so single-photo fields keep a single pick.
  multiple?: boolean
  // Ask before removing a photo (a danger confirm) — for piles that save
  // the moment they change. See PhotoSlotCard's prop of the same name.
  confirmRemove?: boolean
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// No real backend — files are read as data URLs and kept in-memory on the
// record itself, same convention as the rest of this prototype's mock data.
export function PhotoUpload({ value = [], onChange, maxCount = 4, disabled = false, multiple = false, confirmRemove = false }: Props) {
  const { token } = theme.useToken()
  const { modal } = App.useApp()
  const iconColors = useIconColors()

  const fileList: UploadFile[] = value.map((url, i) => ({
    uid: String(i),
    name: `photo-${i + 1}`,
    status: 'done',
    url,
  }))

  return (
    <div className="ifix-photo-upload">
      <Upload
        listType="picture-card"
        fileList={fileList}
        maxCount={maxCount}
        multiple={multiple}
        disabled={disabled}
        showUploadList={{ showRemoveIcon: !disabled }}
        // antd calls this once per picked file; with several picked at once,
        // each call would only see the value from before the batch. So the
        // first file of a batch reads them all and commits once.
        beforeUpload={(file, batch) => {
          if (file === batch[0]) {
            Promise.all(batch.map(f => fileToDataUrl(f as unknown as File)))
              .then(urls => onChange?.([...value, ...urls].slice(0, maxCount)))
          }
          return false
        }}
        onRemove={file => {
          const idx = Number(file.uid)
          const commit = () => onChange?.(value.filter((_, i) => i !== idx))
          if (!confirmRemove) { commit(); return }
          // Removal happens in onOk; returning false keeps antd from also
          // dropping the file from its own list (the list is driven by value).
          modal.confirm({
            title: 'Remove this photo?',
            content: "It will be deleted from this contract's photo record. You can upload a new one afterwards.",
            okText: 'Remove',
            okButtonProps: { danger: true },
            onOk: commit,
          })
          return false
        }}
      >
        {disabled || value.length >= maxCount ? null : (
          <div>
            <div style={{ color: iconColors.secondary }}>
              <Plus size={16} strokeWidth={2.25} />
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: token.colorTextSecondary }}>Upload</div>
          </div>
        )}
      </Upload>
    </div>
  )
}
