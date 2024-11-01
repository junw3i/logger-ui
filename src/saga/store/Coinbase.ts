import { createSlice } from '@reduxjs/toolkit'

interface CoinbaseStats {
  prices: {
    ETH: string
    BTC: string
    SOL: string
  }
}

const initialState: CoinbaseStats = {
  prices: {
    ETH: '0',
    BTC: '0',
    SOL: '0',
  },
}

export const coinbaseSlice = createSlice({
  name: 'coinbaseStats',
  initialState,
  reducers: {
    updateLastPrice: (state, action) => {
      state.prices = action.payload
    },
  },
})

export const { updateLastPrice } = coinbaseSlice.actions

export default coinbaseSlice.reducer
