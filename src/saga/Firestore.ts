import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import {
  ExchangeData,
  updateFunding,
  updateExchanges,
  DebankData,
  updateDebank,
  WalletData,
  updateBreakdown,
  updateYield,
} from './store/Firestore'
import { put } from 'redux-saga/effects'
import dayjs from 'dayjs'

interface FundingData {
  btc: { rate: number; oi: number }
  eth: { rate: number; oi: number }
  sol: { rate: number; oi: number }
  updatedAt: number
}

async function getFunding() {
  const querySnapshot = await getDocs(collection(db, 'funding'))
  const dataList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as FundingData) }))
  dataList.sort((a, b) => a.id.localeCompare(b.id))
  const millionedData = dataList.map((row) => {
    return {
      id: row.id,
      btc: { rate: row.btc ? row.btc.rate : 0, oi: row.btc?.oi / 1000000 },
      eth: { rate: row.eth ? row.eth.rate : 0, oi: row.eth?.oi / 1000000 },
      sol: { rate: row.sol ? row.sol.rate : 0, oi: row.sol?.oi / 1000000 },
      updatedAt: row.updatedAt,
    }
  })
  return millionedData
}

export function* fundingSaga() {
  try {
    const funding = yield getFunding()
    yield put(updateFunding(funding))
  } catch (error) {
    console.error(error)
  }
}

async function getHyperliquid() {
  const querySnapshot = await getDocs(collection(db, 'exchanges'))
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ExchangeData) }))
}

/* calculates the annual funding cost */
function calculateFunding(net_size, notional, rate) {
  const notionalValue = net_size > 0 ? notional : -notional
  return -(notionalValue * rate) / 100
}
export function* hlSaga() {
  try {
    const data = yield getHyperliquid()
    const now = dayjs().unix()
    const yieldInfo = {}
    const filteredData = data.filter((exchange) => now - exchange.updatedAt < 3600 * 2)
    const computedData = filteredData.map((exchange) => {
      const { positions } = exchange
      let fundingAmount = 0
      for (const position of positions) {
        const { net_size, position_value, funding } = position
        fundingAmount += calculateFunding(net_size, position_value, funding)
      }
      yieldInfo[exchange.id] = fundingAmount

      return { ...exchange, fundingAmount }
    })

    yield put(updateYield(yieldInfo))
    yield put(updateExchanges(computedData))
  } catch (error) {
    console.error(error)
  }
}

async function getDebank() {
  const querySnapshot = await getDocs(collection(db, 'debank'))
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as DebankData) }))
}

export function* debankSaga() {
  try {
    const data = yield getDebank()
    yield put(updateDebank(data))
  } catch (error) {
    console.error(error)
  }
}

async function getWallets() {
  const querySnapshot = await getDocs(collection(db, 'wallets'))
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as WalletData[]) }))
}

function isETH(symbol: string): boolean {
  if (symbol.toLowerCase().includes('eth')) return true
  if (symbol.includes('Re7LRT')) return true
  return false
}

export function* walletsSaga() {
  try {
    const data = yield getWallets()
    const unixThreshold = dayjs().unix() - 3600 * 2
    const tokenList = []
    const tokensMap = {}
    for (const wallet of data) {
      const { updatedAt, tokens } = wallet
      if (updatedAt > unixThreshold) {
        tokens.forEach((token) => {
          tokenList.push({ ...token, address: wallet.id })
        })
      }
    }
    tokenList.forEach((token) => {
      const { symbol, amount, price, isStable } = token
      const symbol_ = isStable ? 'USD' : symbol

      if (tokensMap[symbol_]) {
        tokensMap[symbol_].amount += amount
        tokensMap[symbol_].price = price
      } else {
        tokensMap[symbol_] = { amount, price }
      }
    })

    // convert map to array
    const tokens = Object.keys(tokensMap).map((symbol) => {
      return { symbol, ...tokensMap[symbol], value: tokensMap[symbol].amount * tokensMap[symbol].price }
    })
    tokens.sort((a, b) => b.value - a.value)

    const aggregated = {}
    tokens.forEach((token) => {
      const { symbol, value } = token
      const s = isETH(symbol) ? 'ETH' : symbol
      if (aggregated[s]) {
        aggregated[s] += value
      } else {
        aggregated[s] = value
      }
    })
    let walletNav = 0
    const aggregatedTokens = Object.keys(aggregated).map((symbol) => {
      walletNav += aggregated[symbol]
      return { symbol, value: aggregated[symbol] }
    })

    aggregatedTokens.sort((a, b) => b.value - a.value)

    // get farm data
    let farmValue = 0
    for (const token of tokenList) {
      if (token.location !== 'wallet') {
        farmValue += token.amount * token.price
      }
    }

    yield put(
      updateBreakdown({
        walletNav,
        farmNav: farmValue,
        tokens: aggregatedTokens,
      })
    )
  } catch (error) {
    console.error(error)
  }
}
