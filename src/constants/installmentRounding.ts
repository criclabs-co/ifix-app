import type { InstallmentRounding } from '../types/contractTemplate'

export const DEFAULT_INSTALLMENT_ROUNDING: InstallmentRounding = 'two_decimals'

// The Contract Template's "Installment rounding" choices, in order, each
// with the worked example shown beside it.
export const INSTALLMENT_ROUNDING_OPTIONS: { value: InstallmentRounding; label: string; example: string }[] = [
  { value: 'two_decimals', label: 'Keep 2 decimal places', example: '2,854.365 → 2,854.36' },
  { value: 'whole', label: 'Round up to whole amount', example: '2,854.36 → 2,855' },
  { value: 'nearest_10', label: 'Round up to nearest 10', example: '2,854.36 → 2,860' },
  { value: 'nearest_100', label: 'Round up to nearest 100', example: '2,834.55 → 2,900' },
]

export const INSTALLMENT_ROUNDING_FOOTNOTE = 'Choose how each installment is rounded. Rounding up may increase the total contract value.'

export function roundingLabel(rounding: InstallmentRounding | undefined): string {
  return INSTALLMENT_ROUNDING_OPTIONS.find(o => o.value === (rounding ?? DEFAULT_INSTALLMENT_ROUNDING))!.label
}
