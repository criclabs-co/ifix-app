import { App, Image, Space, Typography, theme } from 'antd'
import dayjs from 'dayjs'
import { Smartphone } from 'lucide-react'
import type { Contract, DevicePhotos, UnboxingPhotos } from '../../../types/contract'
import type { AuthUser } from '../../../types/installment'
import { PhotoSlotCard } from '../../../components/PhotoSlotCard'
import { MOCK_USER_ACCOUNTS } from '../../../constants/mockUsers'
import {
  UNBOXING_SLOT_COUNT, boxPhotoSlots, filledSlotCount, photosLocked, unboxingPhotoCount, unboxingSlots,
} from '../../../constants/unboxingPhotos'
import { setBoxPhotos, setUnboxingPhotos } from '../../../utils/contract'
import { Callout } from '../../../components/Callout'
import { UnboxingPhotosField } from '../components/UnboxingPhotosField'
import { PhotoSlotsGrid } from '../components/PhotoSlotsGrid'

interface Props {
  contract: Contract
  actor: AuthUser
  // Whether this viewer can add photos (canManageContract scope).
  canAdd: boolean
  // Unboxing happens at handover, when the down payment activates the
  // contract — before that, only the box photos exist.
  activated: boolean
  onChanged: () => void
}

const icon16 = { size: 16, strokeWidth: 2.25 }

function countBox(photos: DevicePhotos | undefined) {
  return photos ? Object.values(photos).filter(Boolean).length : 0
}

// The device's photo record, in the order it happened: the sealed box,
// captured at contract creation, then the device out of the box, captured
// with the customer at handover. Both sets are optional (preferred, never
// blocking), so this is also where either is added later — the contract's
// reminder callout links here when one is missing.
//
// Each change saves right away: drop or upload into an empty slot, Replace
// or Remove a filled one. Optional photos are there to help, so a wrong or
// blurry one can always be fixed while the contract is open.
export function DevicePhotosTab({ contract, actor, canAdd, activated, onChanged }: Props) {
  const { message } = App.useApp()

  const boxSlots = boxPhotoSlots(contract.device)
  const box = contract.devicePhotos
  const boxCount = countBox(box)

  const unboxing = contract.unboxingPhotos ?? {}
  const total = unboxingPhotoCount(unboxing)
  const slotsFilled = filledSlotCount(unboxing)
  const updatedBy = MOCK_USER_ACCOUNTS.find(u => u.id === contract.unboxingPhotosUpdatedBy)?.name

  function toast(before: number, after: number) {
    message.success(after < before ? 'Photo removed' : 'Photo saved')
  }

  function changeBox(next: DevicePhotos) {
    setBoxPhotos(contract, next)
    toast(boxCount, countBox(next))
    onChanged()
  }

  function changeUnboxing(next: UnboxingPhotos) {
    setUnboxingPhotos(contract, next, actor.id)
    toast(total, unboxingPhotoCount(next))
    onChanged()
  }

  return (
    <>
      {/* Settled or Closed: the record is final for everyone, so say why
          the add/replace/remove controls are gone. */}
      {photosLocked(contract) && (
        <Callout
          type="info"
          message="Photos are final"
          description={`This contract is ${contract.status}, so its photos can no longer be added, replaced or removed.`}
          style={{ marginBottom: 16 }}
        />
      )}

      <Panel title="Box Photos" subtitle={boxCount === 0 ? 'Optional · none added yet' : `${boxCount} of ${boxSlots.length} added`}>
        <Image.PreviewGroup>
          <PhotoSlotsGrid readOnly={!canAdd} confirmRemove slots={boxSlots} value={box} onChange={changeBox} />
        </Image.PreviewGroup>
      </Panel>

      {activated && (
        <Panel
          title="Unboxing Photos"
          subtitle={total === 0
            ? 'Optional · none added yet'
            : `${slotsFilled} of ${UNBOXING_SLOT_COUNT} added${unboxing.other?.length ? ` · ${unboxing.other.length} other` : ''}`}
          footer={contract.unboxingPhotosUpdatedAt
            ? `Last updated ${dayjs(contract.unboxingPhotosUpdatedAt).format('YYYY-MM-DD')}${updatedBy ? ` by ${updatedBy}` : ''}`
            : undefined}
        >
          <Image.PreviewGroup>
            {canAdd ? (
              <UnboxingPhotosField device={contract.device} value={unboxing} onChange={changeUnboxing} confirmRemove />
            ) : (
              <>
                <PhotoSlotsGrid readOnly slots={unboxingSlots(contract.device)} value={unboxing} />
                {!!unboxing.other?.length && (
                  <div className="ifix-photo-slot-grid" style={{ marginTop: 8 }}>
                    {unboxing.other.map((url, i) => (
                      <PhotoSlotCard key={`other-${i}`} readOnly label={`Other ${i + 1}`} hint="" icon={<Smartphone {...icon16} />} value={url} />
                    ))}
                  </div>
                )}
              </>
            )}
          </Image.PreviewGroup>
        </Panel>
      )}
    </>
  )
}

// Detail-view panel: title (and subtitle) left, action right, inside the
// panel's own 56px header row (see CLAUDE.md "Panel header actions").
function Panel({ title, subtitle, action, footer, children }: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  footer?: string
  children: React.ReactNode
}) {
  const { token } = theme.useToken()
  return (
    <div className="ifix-table-panel" style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        height: 56,
        paddingLeft: 16,
        paddingRight: action ? 8 : 16,
        boxShadow: `inset 0 -0.5px 0 0 ${token.colorBorderSecondary}`,
      }}>
        <Space size={8} align="baseline" style={{ minWidth: 0 }}>
          <Typography.Text strong style={{ fontSize: 15 }}>{title}</Typography.Text>
          {subtitle && <Typography.Text type="secondary">{subtitle}</Typography.Text>}
        </Space>
        {action}
      </div>
      <div style={{ padding: 16 }}>
        {children}
        {footer && (
          <Typography.Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: token.fontSizeSM }}>{footer}</Typography.Text>
        )}
      </div>
    </div>
  )
}
