import { useState } from 'react'
import { App, Button, Drawer, Image, Space, Typography, theme } from 'antd'
import dayjs from 'dayjs'
import { Barcode, ImagePlus, Package, PackageCheck, Smartphone } from 'lucide-react'
import type { Contract, UnboxingPhotos } from '../../../types/contract'
import type { AuthUser } from '../../../types/installment'
import { PhotoSlotCard } from '../../../components/PhotoSlotCard'
import { useAppWindowContainer } from '../../../contexts/AppWindowContext'
import { MOCK_USER_ACCOUNTS } from '../../../constants/mockUsers'
import { MAX_OTHER_UNBOXING_PHOTOS, UNBOXING_SLOT_COUNT, filledSlotCount, unboxingPhotoCount, unboxingSlots } from '../../../constants/unboxingPhotos'
import { addUnboxingPhotos } from '../../../utils/contract'
import { UnboxingPhotosField } from '../components/UnboxingPhotosField'
import { slotIcon } from '../components/unboxingSlotIcon'

interface Props {
  contract: Contract
  actor: AuthUser
  // Whether this viewer can add unboxing photos (canManageContract scope).
  canAdd: boolean
  // Unboxing happens at handover, when the down payment activates the
  // contract — before that, only the box photos exist.
  activated: boolean
  onChanged: () => void
}

const icon16 = { size: 16, strokeWidth: 2.25 }

// The device's photo record, in the order it happened: the sealed box,
// captured at contract creation, then the device out of the box, captured
// with the customer at handover. Box photos are read-only here (they're
// edited through the contract's own Edit flow while that's allowed);
// unboxing photos are optional and add-only, so this is also where they're
// asked for when none were taken at activation.
export function DevicePhotosTab({ contract, actor, canAdd, activated, onChanged }: Props) {
  const { message } = App.useApp()
  const appWindow = useAppWindowContainer()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<UnboxingPhotos>({})

  const box = contract.devicePhotos
  const unboxing = contract.unboxingPhotos ?? {}
  const total = unboxingPhotoCount(unboxing)
  const slotsFilled = filledSlotCount(unboxing)
  const draftCount = unboxingPhotoCount(draft)
  const canAddMore = canAdd && (slotsFilled < UNBOXING_SLOT_COUNT || (unboxing.other?.length ?? 0) < MAX_OTHER_UNBOXING_PHOTOS)
  const updatedBy = MOCK_USER_ACCOUNTS.find(u => u.id === contract.unboxingPhotosUpdatedBy)?.name

  function save() {
    addUnboxingPhotos(contract, draft, actor.id)
    setOpen(false)
    message.success(`${draftCount} photo${draftCount === 1 ? '' : 's'} added`)
    onChanged()
  }

  return (
    <>
      <Panel title="Box Photos" subtitle="Taken when the contract was created">
        <Image.PreviewGroup>
          <div className="ifix-photo-slot-grid">
            <PhotoSlotCard readOnly label="Box Front" hint="" icon={<Package {...icon16} />} value={box.front} />
            <PhotoSlotCard readOnly label="Box Back" hint="" icon={<Package {...icon16} />} value={box.back} />
            <PhotoSlotCard readOnly label={contract.device.imei1 ? 'IMEI Label' : 'Serial Label'} hint="" icon={<Barcode {...icon16} />} value={box.imeiLabel} />
            <PhotoSlotCard readOnly label="Seal / Wrap" hint="" icon={<PackageCheck {...icon16} />} value={box.sealWrap} />
          </div>
        </Image.PreviewGroup>
      </Panel>

      {activated && (
        <Panel
          title="Unboxing Photos"
          subtitle={total === 0
            ? 'Optional · none added yet'
            : `${slotsFilled} of ${UNBOXING_SLOT_COUNT} added${unboxing.other?.length ? ` · ${unboxing.other.length} other` : ''}`}
          action={canAddMore && (
            // Primary while there are none, so the missing photos read as
            // something to do rather than an empty corner.
            <Button
              type={total === 0 ? 'primary' : 'default'}
              icon={<ImagePlus {...icon16} />}
              onClick={() => { setDraft({}); setOpen(true) }}
            >
              {total === 0 ? 'Upload Photos' : 'Add Photos'}
            </Button>
          )}
          footer={contract.unboxingPhotosUpdatedAt
            ? `Last added ${dayjs(contract.unboxingPhotosUpdatedAt).format('YYYY-MM-DD')}${updatedBy ? ` by ${updatedBy}` : ''}`
            : undefined}
        >
          <Image.PreviewGroup>
            <div className="ifix-photo-slot-grid">
              {unboxingSlots(contract.device).map(slot => (
                <PhotoSlotCard key={slot.key} readOnly label={slot.label} hint={slot.hint} icon={slotIcon(slot)} value={unboxing[slot.key]} />
              ))}
              {unboxing.other?.map((url, i) => (
                <PhotoSlotCard key={`other-${i}`} readOnly label={`Other ${i + 1}`} hint="" icon={<Smartphone {...icon16} />} value={url} />
              ))}
            </div>
          </Image.PreviewGroup>
        </Panel>
      )}

      <Drawer
        title="Add unboxing photos"
        open={open}
        onClose={() => setOpen(false)}
        destroyOnHidden
        width={420}
        getContainer={appWindow ?? undefined}
        footer={
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="primary" disabled={draftCount === 0} onClick={save}>
              {draftCount > 0 ? `Add ${draftCount} Photo${draftCount === 1 ? '' : 's'}` : 'Add Photos'}
            </Button>
          </Space>
        }
      >
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Fill any empty slot. Photos can't be removed once added.
        </Typography.Paragraph>
        <UnboxingPhotosField device={contract.device} value={draft} onChange={setDraft} saved={contract.unboxingPhotos} />
      </Drawer>
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
