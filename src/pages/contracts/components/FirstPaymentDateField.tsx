import dayjs from 'dayjs'
import { Typography, theme } from 'antd'
import { DatePicker } from '../../../components/AppDatePicker'
import { firstPaymentDateHint } from '../../../utils/contract'

interface Props {
  // YYYY-MM-DD, supplied by Form.Item.
  value?: string
  onChange?: (value: string | undefined) => void
}

// The first installment's due date (not the down payment's — that's paid
// at activation). Today at the earliest: a date already past would make the
// first installment overdue the moment the contract went live. Underneath,
// how the later installments follow from it.
export function FirstPaymentDateField({ value, onChange }: Props) {
  const { token } = theme.useToken()
  return (
    <div>
      <DatePicker
        style={{ width: '100%' }}
        value={value ? dayjs(value) : null}
        onChange={d => onChange?.(d && !Array.isArray(d) ? d.format('YYYY-MM-DD') : undefined)}
        disabledDate={d => d.isBefore(dayjs(), 'day')}
        allowClear={false}
      />
      <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: token.fontSizeSM }}>
        {firstPaymentDateHint(value)}
      </Typography.Text>
    </div>
  )
}
