import { createSlice } from '@reduxjs/toolkit'

interface CoinbaseStats {
  price: string
}

const initialState: CoinbaseStats = {
  price: '0',
}

export const coinbaseSlice = createSlice({
  name: 'coinbaseStats',
  initialState,
  reducers: {
    updateLastPrice: (state, action) => {
      state.price = action.payload.price
    },
  },
})

export const { updateLastPrice } = coinbaseSlice.actions

export default coinbaseSlice.reducer
