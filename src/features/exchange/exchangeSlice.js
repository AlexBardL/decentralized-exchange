import { createSlice } from '@reduxjs/toolkit'


const exchangeSlice = createSlice({
	name: 'exchange',
	initialState: { contract: {}, loaded: false },
	reducers: {
      exchangeLoaded: (state, action) => {
         state.contract = action.payload
         state.loaded = true
      }
   }
})

export default exchangeSlice.reducer

export const { exchangeLoaded } = exchangeSlice.actions

// Selectors
export const selectExchange = state => state.exchange.contract
export const selectExchangeLoaded = state => state.exchange.loaded