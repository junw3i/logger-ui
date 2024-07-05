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

interface Yield {
  [key: string]: number
}
interface FirestoreState {
  funding: ExchangeStats[]
  exchanges: ExchangeData[]
  debank: DebankData[]
  breakdown: BreakdownData
  yield: Yield
}

interface Position {
  net_size: number
  entry_price: number
  coin: string
  upnl: number
  liquidation_price: number
  position_value: number
}

export interface ExchangeData {
  accountLeverage: number
  nav: number
  positions: Position[]
  updatedAt: number
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

export interface TokenData {
  amount: number
  chain: string
  isStable: boolean
  location: string
  price: number
  symbol: string
}

export interface WalletData {
  tokens: TokenData[]
  updatedAt: number
}

export interface BreakdownData {
  walletNav: number
  farmNav: number
  tokens: {
    symbol: string
    value: number
  }[]
}

const initialState: FirestoreState = {
  funding: [],
  exchanges: [],
  debank: [],
  breakdown: {
    walletNav: 0,
    farmNav: 0,
    tokens: [],
  },
  yield: {},
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
    updateYield: (state, action) => {
      state.yield = {
        ...state.yield,
        ...action.payload,
      }
    },
  },
})

export const { updateFunding, updateExchanges, updateDebank, updateBreakdown, updateYield } = fundingSlice.actions

export default fundingSlice.reducer
