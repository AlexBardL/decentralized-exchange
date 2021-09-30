import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'


export const depositEther = createAsyncThunk(
   'balances/depositingEther',
   async (amount, thunkAPI) => {
      const exchange = thunkAPI.getState().exchange.contract
      console.log(exchange)
      const web3 = thunkAPI.getState().web3.connection
      console.log(web3)
      const account = thunkAPI.getState().web3.account
      console.log(account)
      await exchange.methods.depositEther().send({ from: account, value: web3.utils.toWei(amount, 'ether') })
         .on('transactionHash', (hash) => { console.log(hash) })
         .on('error', (error) => {
            console.error(error)
            window.alert('There was an error!')
         })
   }
)

export const depositToken = createAsyncThunk(
   'balances/depositingToken',
   async (amount, thunkAPI) => {
      const token = thunkAPI.getState().token.contract
      const exchange = thunkAPI.getState().exchange.contract
      const web3 = thunkAPI.getState().web3.connection
      const account = thunkAPI.getState().web3.account
      amount = web3.utils.toWei(amount, 'ether')
      await token.methods.approve(exchange.options.address, amount).send({ from: account })
         .on('transactionHash', async (hash) => {
            await exchange.methods.depositToken(token.options.address, amount).send({ from: account })
               .on('transactionHash', (hash) => { console.log(hash) })
               .on('error', (error) => {
                  console.error(error)
                  window.alert('There was an error!')
               })
   })
   }
)

export const withdrawEther = createAsyncThunk(
   'balances/withdrawingEther',
   async (amount, thunkAPI) => {
      const exchange = thunkAPI.getState().exchange.contract
      const web3 = thunkAPI.getState().web3.connection
      const account = thunkAPI.getState().web3.account
      await exchange.methods.withdrawEther(web3.utils.toWei(amount, 'ether')).send({ from: account })
         .on('transactionHash', (hash) => { console.log(hash) })
         .on('error', (error) => {
            console.error(error)
            window.alert('There was an error!')
         })
   }
)

export const withdrawToken = createAsyncThunk(
   'balances/withdrawingToken',
   async (amount, thunkAPI) => {
      const token = thunkAPI.getState().token.contract
      const exchange = thunkAPI.getState().exchange.contract
      const web3 = thunkAPI.getState().web3.connection
      const account = thunkAPI.getState().web3.account
      await exchange.methods.withdrawToken(token.options.address, web3.utils.toWei(amount, 'ether')).send({ from: account })
         .on('transactionHash', (hash) => { console.log(hash) })
         .on('error', (error) => {
            console.error(error)
            window.alert('There was an error!')
         })
   }
)


const balancesSlice = createSlice({
   name: 'balances',
   initialState: {
      customerEtherBalance: 0,
      customerTokenBalance: 0,
      exchangeEtherBalance: 0,
      exchangeTokenBalance: 0,
      balancesLoading: true
   },
   reducers: {
      customerEtherBalanceLoaded: (state, action) => {
         state.customerEtherBalance = action.payload
      },
      customerTokenBalanceLoaded: (state, action) => {
         state.customerTokenBalance = action.payload
      },
      exchangeEtherBalanceLoaded: (state, action) => {
         state.exchangeEtherBalance = action.payload
      },
      exchangeTokenBalanceLoaded: (state, action) => {
         state.exchangeTokenBalance = action.payload
      },
      balancesLoading: (state) => {
         state.balancesLoading = true
      },
      balancesLoaded: (state) => {
         state.balancesLoading = false
      }
   },
   extraReducers: {
      [depositEther.pending]: (state) => {
         state.balancesLoading = true
      },
      [depositEther.rejected]: (state) => {
         state.balancesLoading = false
      },
      [depositToken.pending]: (state) => {
         state.balancesLoading = true
      },
      [depositToken.rejected]: (state) => {
         state.balancesLoading = false
      },
      [withdrawEther.pending]: (state) => {
         state.balancesLoading = true
      },
      [withdrawEther.rejected]: (state) => {
         state.balancesLoading = false
      },
      [withdrawToken.pending]: (state) => {
         state.balancesLoading = true
      },
      [withdrawToken.rejected]: (state) => {
         state.balancesLoading = false
      }
   }
})

export default balancesSlice.reducer

export const { 
   customerEtherBalanceLoaded, customerTokenBalanceLoaded,
   exchangeEtherBalanceLoaded, exchangeTokenBalanceLoaded,
   balancesLoaded, balancesLoading
} = balancesSlice.actions


// Selectors
export const selectCustomerEtherBalance = state => state.balances.customerEtherBalance
export const selectCustomerTokenBalance = state => state.balances.customerTokenBalance
export const selectExchangeEtherBalance = state => state.balances.exchangeEtherBalance
export const selectExchangeTokenBalance = state => state.balances.exchangeTokenBalance
export const selectBalancesLoading = state => state.balances.balancesLoading