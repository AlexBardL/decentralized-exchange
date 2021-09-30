import { createSlice } from '@reduxjs/toolkit'


const tokenSlice = createSlice({
	name: 'token',
	initialState: { contract: {}, loaded: false },
	reducers: {
      tokenLoaded: (state, action) => {
         state.contract = action.payload
         state.loaded = true
      }
   }
})

export default tokenSlice.reducer

export const { tokenLoaded } = tokenSlice.actions

// Selectors
export const selectToken = state => state.token.contract
export const selectTokenLoaded = state => state.token.loaded