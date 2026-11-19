import { useRef } from 'react'
import { Button, Image, Typography, theme } from 'antd'
import { Camera, Upload, X } from 'lucide-react'
import { useIconColors } from '../constants/iconColors'
import { useIsMobile } from './useIsMobile'

interface Props {
  label: string
  // What to shoot, shown in the empty slot ("Settings → About → IMEI").
  hint: string
  icon: React.ReactNode
  value?: string
  onChange?: (url: string | undefined) => void
  // View only — no add/remove controls; an empty slot just reads "Not added".
  readOnly?: boolean
  // An already-saved photo: shown, but can't be removed (saved photos are
  // add-only, like payment slips).
  locked?: boolean
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
// that one photo. Camera opens the device camera directly, so it's offered
// on mobile only (on desktop it would just open the same file picker as
// Upload). No real backend: the photo is kept as a data URL on the record.
export function PhotoSlotCard({ label, hint, icon, value, onChange, readOnly = false, locked = false }: Props) {
  const { token } = theme.useToken()
  const iconColors = useIconColors()
  const isMobile = useIsMobile()
  const uploadRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const editable = !readOnly && !locked

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) onChange?.(await fileToDataUrl(file))
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 8,
      overflow: 'hidden',
      border: `0.5px solid ${token.colorBorderSecondary}`,
      background: token.colorBgContainer,
      minWidth: 0,
    }}>
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

      <div style={{ position: 'relative', aspectRatio: '4 / 3', background: value ? token.colorFillTertiary : undefined }}>
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
            <span style={{ color: iconColors.secondary, opacity: 0.6, display: 'flex' }}>{icon}</span>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {readOnly ? 'Not added' : hint}
            </Typography.Text>
          </div>
        )}
      </div>

      {/* Same footer height filled or empty, so cards in a row line up:
          Camera/Upload while empty, Remove once a (not yet saved) photo is in. */}
      {editable && (
        <div style={{ display: 'flex', gap: 8, padding: 8, borderTop: `0.5px solid ${token.colorBorderSecondary}` }}>
          {value ? (
            <Button block icon={<X size={16} strokeWidth={2.25} />} onClick={() => onChange?.(undefined)}>Remove</Button>
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
