import type { ScheduleResult } from '../types/installment'
import type { PaymentRounding } from '../types/contractTemplate'
import dayjs from 'dayjs'

function buildSchedule(monthlyInstallment: number, periods: number) {
  return Array.from({ length: periods }, (_, i) => ({
    period: i + 1,
    dueDate: dayjs().add(i + 1, 'month').format('YYYY-MM-DD'),
    amount: monthlyInstallment,
  }))
}

// Money is kept to the satang (2 decimal places) everywhere.
export const toSatang = (amount: number) => Math.round(amount * 100) / 100

// A payment — the down payment or one installment — rounded the way the
// contract template says. Each is rounded on its own; nothing absorbs the
// difference later. The three round-up options never undercharge.
//   two_decimals  2,854.364 → 2,854.36  (normal rounding: .365 → .37)
//   whole         2,854.36  → 2,855
//   nearest_10    2,854.36  → 2,860
//   nearest_100   2,834.55  → 2,900
export function roundPayment(amount: number, rounding: PaymentRounding = 'two_decimals'): number {
  // Normal rounding to the satang. The tiny nudge absorbs float noise:
  // 2854.365 is stored as 2854.36499…, which must still round up to .37.
  if (rounding === 'two_decimals') return Math.round(amount * 100 + 1e-6) / 100
  // Strip float noise before rounding up (2854.3600000001 must not become 2855).
  const exact = toSatang(amount)
  switch (rounding) {
    case 'whole': return Math.ceil(exact)
    case 'nearest_10': return Math.ceil(exact / 10) * 10
    default: return Math.ceil(exact / 100) * 100
  }
}

// The down payment: the template's % of the device price, to the satang
// (`exact`), then rounded per the template (`amount`, what the customer
// pays). The loan — and so every installment — is worked out from the exact
// figure, so rounding the down payment up never shrinks the installments.
export function downPaymentFor(devicePrice: number, percent: number, rounding: PaymentRounding = 'two_decimals') {
  const exact = toSatang(devicePrice * percent / 100)
  return { exact, amount: roundPayment(exact, rounding), loanAmount: toSatang(devicePrice - exact) }
}

/**
 * Fix Rate Mode: flat rate interest on principal
 * Total interest = principal × flatRatePercent% × periods
 *
 * The installment is rounded per the template, and the totals come from the
 * rounded installment — what the customer actually pays — so rounding up
 * shows in the total payable and the interest (a Free Rate profit).
 */
export function calcFixRate(
  principal: number,
  flatRatePercent: number,
  periods: number,
  rounding: PaymentRounding = 'two_decimals',
): ScheduleResult {
  const exactInterest = principal * (flatRatePercent / 100) * periods
  const monthlyInstallment = roundPayment((principal + exactInterest) / periods, rounding)
  const totalPayable = toSatang(monthlyInstallment * periods)
  const totalInterest = toSatang(totalPayable - principal)

  return {
    monthlyInstallment,
    totalInterest,
    totalPayable,
    flatRatePercent,
    schedule: buildSchedule(monthlyInstallment, periods),
  }
}
