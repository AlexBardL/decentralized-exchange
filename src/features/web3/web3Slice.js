import { createSlice } from '@reduxjs/toolkit'


const web3Slice = createSlice({
	name: 'web3',
	initialState: { connection: {}, account: undefined },
	reducers: {
      web3Loaded: (state, action) => {
         state.connection = action.payload
      },
      accountLoaded: (state, action) => {
         state.account = action.payload
      }
   }
})

export default web3Slice.reducer

export const { web3Loaded, accountLoaded } = web3Slice.actions


// Selectors
export const selectWeb3 = state => state.web3.connection
export const selectAccount = state => state.web3.account