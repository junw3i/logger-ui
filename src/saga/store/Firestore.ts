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

const initialState: FirestoreState = {
  funding: [],
  exchanges: [],
  debank: [],
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
  },
})

export const { updateFunding, updateExchanges, updateDebank } = fundingSlice.actions

export default fundingSlice.reducer
