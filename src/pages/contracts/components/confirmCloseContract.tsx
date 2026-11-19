import { Typography } from 'antd'
import type { useAppProps } from 'antd/es/app/context'
import type { Contract } from '../../../types/contract'
import type { AuthUser } from '../../../types/installment'
import { closeContract } from '../../../utils/contract'

// Confirm-then-close for a Rejected contract — shared by the desktop header
// button (LifecycleActions) and the mobile action bar's "…" menu, so both
// ask the same question before doing something that can't be undone.
export function confirmCloseContract(app: useAppProps, contract: Contract, actor: AuthUser, onChanged: () => void) {
  const { modal, message } = app
  modal.confirm({
    title: 'Close this contract?',
    content: (
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        Close <strong>{contract.contractNumber}</strong> if it won't be fixed and resubmitted. A closed contract can't be edited or resubmitted, and this can't be undone.
      </Typography.Paragraph>
    ),
    okText: 'Close Contract',
    okButtonProps: { danger: true },
    cancelText: 'Keep It',
    onOk: () => {
      closeContract(contract, actor.id)
      message.success('Contract closed')
      onChanged()
    },
  })
}
