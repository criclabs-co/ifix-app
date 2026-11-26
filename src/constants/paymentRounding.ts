import type { PaymentRounding } from '../types/contractTemplate'

export const DEFAULT_PAYMENT_ROUNDING: PaymentRounding = 'two_decimals'

// The Contract Template's "Payment rounding" choices, in order, each
// with the worked example shown beside it. One option rounds both the down
// payment and every installment.
export const PAYMENT_ROUNDING_OPTIONS: { value: PaymentRounding; label: string; example: string }[] = [
  { value: 'two_decimals', label: 'Round to 2 decimals', example: '2,854.364 → 2,854.36' },
  { value: 'whole', label: 'Round up to whole amount', example: '2,854.36 → 2,855' },
  { value: 'nearest_10', label: 'Round up to nearest 10', example: '2,854.36 → 2,860' },
  { value: 'nearest_100', label: 'Round up to nearest 100', example: '2,834.55 → 2,900' },
]

export const PAYMENT_ROUNDING_FOOTNOTE = 'Choose how the down payment and each installment are rounded. Rounding up may increase the total contract value.'

export function roundingLabel(rounding: PaymentRounding | undefined): string {
  return PAYMENT_ROUNDING_OPTIONS.find(o => o.value === (rounding ?? DEFAULT_PAYMENT_ROUNDING))!.label
}
