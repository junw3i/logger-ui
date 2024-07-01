import BigNumber from 'bignumber.js'

export function dollarValue(value: number, dp: number) {
  const bn = new BigNumber(value)
  if (bn.isNegative()) {
    return `-$${bn.abs().toFormat(dp)}`
  }
  return `$${bn.toFormat(dp)}`
}
