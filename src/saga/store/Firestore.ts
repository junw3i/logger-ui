import { createSlice } from '@reduxjs/toolkit'

interface Rate {
  oi: number
  rate: number
}
interface ExchangeStats {
  btc?: Rate
  eth?: Rate
  sol?: Rate
  id: string
  updatedAt: number
}

interface FirestoreState {
  funding: ExchangeStats[]
  exchanges: ExchangeData[]
  debank: DebankData[]
  breakdown: BreakdownData
  ta: []
  impliedSkew: {
    '7': Skew
    '30': Skew
    '60': Skew
    '90': Skew
    '180': Skew
  }
  mirrors: MirrorData[]
}

interface Position {
  net_size: number
  entry_price: number
  coin: string
  upnl: number
  liquidation_price: number
  position_value: number
  funding: number
  mark_price: number
}

export interface ExchangeData {
  id: string
  accountLeverage: number
  nav: number
  positions: Position[]
  updatedAt: number
  assets: TokenData[]
  exchange?: string
}

interface ChainData {
  id: string
  usdValue: number
}

export interface DebankData {
  totalValue: number
  chains: ChainData[]
  updatedAt: number
}

interface StochData {
  last3: [number, number, number]
  tf: number
}

export interface StochDataFull {
  data: StochData[]
  id: string
  updatedAt: number
}

export interface MACDData {
  macd: number
  signal: number
  tf: number
}

export interface MACDDataFull {
  data: MACDData[]
  id: string
  updatedAt: number
}

interface Skew {
  diff: number
  call: number
  put: number
  d: number
}
export interface ImpliedSkewData {
  0: Skew
  1: Skew
  2: Skew
  3: Skew
  4: Skew
  id: string
  updatedAt: number
}

export interface TokenData {
  amount: number
  chain: string
  isStable: boolean
  location?: string
  price: number
  symbol: string
}

export interface WalletData {
  tokens: TokenData[]
  updatedAt: number
}

export interface BreakdownData {
  walletNav: number
  tokens: {
    symbol: string
    value: number
  }[]
  topExposures: {
    symbol: string
    value: string
    percent: number
  }[]
}

export interface TrendData {
  direction: string
  start: number
}

const initialState: FirestoreState = {
  funding: [],
  exchanges: [],
  debank: [],
  breakdown: {
    walletNav: 0,
    tokens: [],
    topExposures: [],
  },
  ta: [],
  impliedSkew: {
    '7': {
      diff: 0,
      call: 0,
      put: 0,
      d: 0,
    },
    '30': {
      diff: 0,
      call: 0,
      put: 0,
      d: 0,
    },
    '60': {
      diff: 0,
      call: 0,
      put: 0,
      d: 0,
    },
    '90': {
      diff: 0,
      call: 0,
      put: 0,
      d: 0,
    },
    '180': {
      diff: 0,
      call: 0,
      put: 0,
      d: 0,
    },
  },
  mirrors: [],
}

interface MirrorPosition {
  coin: string
  entry_price: number
  mark_price: number
  notional: number
  percent: number
  scale: number
  size: number
  upnl: number
}
export interface MirrorData {
  account_value: number
  day: [number, number]
  week: [number, number]
  month: [number, number]
  long_exposure: number
  short_exposure: number
  total_exposure: number
  positions: MirrorPosition[]
  last_updated: number
  id: string
}

export const fundingSlice = createSlice({
  name: 'fundingStats',
  initialState,
  reducers: {
    updateFunding: (state, action) => {
      state.funding = action.payload
    },
    updateExchanges: (state, action) => {
      state.exchanges = action.payload
    },
    updateDebank: (state, action) => {
      state.debank = action.payload
    },
    updateBreakdown: (state, action) => {
      state.breakdown = action.payload
    },
    updateImpliedSkew: (state, action) => {
      state.impliedSkew = action.payload
    },
    updateTA: (state, action) => {
      state.ta = action.payload
    },
    updateMirrors: (state, action) => {
      state.mirrors = action.payload
    },
  },
})

export const {
  updateFunding,
  updateExchanges,
  updateDebank,
  updateBreakdown,
  updateImpliedSkew,
  updateTA,
  updateMirrors,
} = fundingSlice.actions

export default fundingSlice.reducer
