import { useRef, useState } from 'react'
import { Button, Image, Typography, theme } from 'antd'
import { Camera, RefreshCw, Trash2, Upload } from 'lucide-react'
import { useIconColors } from '../constants/iconColors'
import { useIsMobile } from './useIsMobile'

interface Props {
  label: string
  // What to shoot, shown in the empty slot ("Settings → About → IMEI").
  hint: string
  icon: React.ReactNode
  value?: string
  onChange?: (url: string | undefined) => void
  // View only — no add/replace/remove controls; an empty slot just reads
  // "Not added".
  readOnly?: boolean
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// A guided photo slot — a labelled card that says what to shoot, then holds
// that one photo. An empty slot takes a photo three ways: Upload, a photo
// dragged onto it (desktop), or Camera, which opens the device camera
// directly and so is offered on mobile only (on desktop it would just open
// the same file picker as Upload). No real backend: the photo is kept as a
// data URL on the record.
export function PhotoSlotCard({ label, hint, icon, value, onChange, readOnly = false }: Props) {
  const { token } = theme.useToken()
  const iconColors = useIconColors()
  const isMobile = useIsMobile()
  const uploadRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const editable = !readOnly
  // Dropping onto a filled slot replaces its photo, same as Replace.
  const acceptsDrop = editable
  const [dragOver, setDragOver] = useState(false)

  async function take(file: File | undefined) {
    if (file && file.type.startsWith('image/')) onChange?.(await fileToDataUrl(file))
  }

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    take(file)
  }

  // Drag-and-drop onto an empty slot. dragleave also fires when moving over
  // the card's own children, so only a leave to outside the card counts.
  const dropHandlers = acceptsDrop ? {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; if (!dragOver) setDragOver(true) },
    onDragLeave: (e: React.DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragOver(false) },
    onDrop: (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); take(e.dataTransfer.files?.[0]) },
  } : {}

  return (
    <div
      {...dropHandlers}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
        border: `${dragOver ? 1 : 0.5}px ${dragOver ? 'dashed' : 'solid'} ${dragOver ? token.colorPrimary : token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        minWidth: 0,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 40,
        padding: '0 12px',
        background: token.colorFillQuaternary,
        borderBottom: `0.5px solid ${token.colorBorderSecondary}`,
        color: iconColors.secondary,
      }}>
        {icon}
        <Typography.Text strong ellipsis style={{ fontSize: token.fontSizeSM }}>{label}</Typography.Text>
      </div>

      {/* The body grows to fill the card (flex: 1) so an empty slot stretches
          to the same height as its neighbours, and a photo is pinned inside
          it (absolute, cropped) so it can never push the card taller. */}
      <div style={{
        position: 'relative',
        flex: '1 0 auto',
        aspectRatio: '4 / 3',
        overflow: 'hidden',
        background: value ? token.colorFillTertiary : dragOver ? token.colorPrimaryBg : undefined,
      }}>
        {value ? (
          <>
            <Image
              src={value}
              alt={label}
              width="100%"
              height="100%"
              rootClassName="ifix-photo-slot-image"
              style={{ objectFit: 'cover' }}
            />
            {dragOver && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: token.colorPrimaryBg, color: token.colorPrimary, fontSize: token.fontSizeSM,
              }}>
                <Upload size={16} strokeWidth={2.25} />
                Drop to replace
              </div>
            )}
          </>
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '0 12px',
            textAlign: 'center',
          }}>
            <span style={{ color: dragOver ? token.colorPrimary : iconColors.secondary, opacity: dragOver ? 1 : 0.6, display: 'flex' }}>
              {dragOver ? <Upload size={16} strokeWidth={2.25} /> : icon}
            </span>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM, color: dragOver ? token.colorPrimary : undefined }}>
              {readOnly ? 'Not added' : dragOver ? 'Drop to add' : hint}
            </Typography.Text>
          </div>
        )}
      </div>

      {/* Same footer height filled or empty, so cards in a row line up:
          Camera/Upload while empty; Replace and Remove once there's a photo
          (photos are optional, so a wrong or blurry one can always be fixed). */}
      {editable && (
        <div style={{ display: 'flex', gap: 8, padding: 8, borderTop: `0.5px solid ${token.colorBorderSecondary}` }}>
          {value ? (
            <>
              {/* Replace opens the plain picker — on a phone that already
                  offers the camera or the photo library. */}
              <Button block icon={<RefreshCw size={16} strokeWidth={2.25} />} onClick={() => uploadRef.current?.click()}>Replace</Button>
              <Button
                aria-label={`Remove ${label} photo`}
                icon={<Trash2 size={16} strokeWidth={2.25} />}
                onClick={() => onChange?.(undefined)}
                style={{ flex: 'none' }}
              />
            </>
          ) : (
            <>
              {/* Mobile: the camera is the main way in, so it gets the full
                  button and Upload shrinks to an icon — two labelled buttons
                  don't fit side by side in a half-width card on a phone. */}
              {isMobile && (
                <Button block icon={<Camera size={16} strokeWidth={2.25} />} onClick={() => cameraRef.current?.click()}>Camera</Button>
              )}
              <Button
                block={!isMobile}
                aria-label={`Upload ${label} photo`}
                icon={<Upload size={16} strokeWidth={2.25} />}
                onClick={() => uploadRef.current?.click()}
                style={isMobile ? { flex: 'none' } : undefined}
              >
                {isMobile ? null : 'Upload'}
              </Button>
            </>
          )}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={pick} />
          <input ref={uploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pick} data-slot={label} />
        </div>
      )}
    </div>
  )
}
