import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { ETHER_ADDRESS } from '../../app/helpers'


export const ORDER_TYPE = {
   BUY: 'buy',
   SELL: 'sell'
}

export const fillOrder = createAsyncThunk(
   'orders/orderFilling',
   async (order, thunkAPI) => {
      const exchange = thunkAPI.getState().exchange.contract
      const account = thunkAPI.getState().web3.account
      await exchange.methods.fillOrder(order.id).send({ from: account })
         .on('transactionHash', (hash) => { console.log(hash) })
         .on('error', (error) => {
            console.error(error)
            window.alert('There was an error!')
         })
    }
)

export const cancelOrder = createAsyncThunk(
   'orders/orderCancelling',
   async (order, thunkAPI) => {
      const exchange = thunkAPI.getState().exchange.contract
      const account = thunkAPI.getState().web3.account
      await exchange.methods.cancelOrder(order.id).send({ from: account })
         .on('transactionHash', (hash) => { console.log(hash) })
         .on('error', (error) => {
            console.error(error)
            window.alert('There was an error!')
         })
   }
)

export const makeNewOrder = createAsyncThunk(
   'orders/newOrderMaking',
   async ({ orderType, amount, price }, thunkAPI) => {
      const token = thunkAPI.getState().token.contract
      const exchange = thunkAPI.getState().exchange.contract
      const web3 = thunkAPI.getState().web3.connection
      const account = thunkAPI.getState().web3.account
      let tokenGet, amountGet, tokenGive, amountGive

      switch (orderType) {
         case ORDER_TYPE.BUY: {
            tokenGet = token.options.address
            amountGet = web3.utils.toWei(amount, 'ether')
            tokenGive = ETHER_ADDRESS
            amountGive = web3.utils.toWei((amount * price).toString(), 'ether')
            break
         }
         case ORDER_TYPE.SELL: {
            tokenGet = ETHER_ADDRESS
            amountGet = web3.utils.toWei((amount * price).toString(), 'ether')
            tokenGive = token.options.address
            amountGive = web3.utils.toWei(amount, 'ether')
            break
         }
         default: return
      }
      
      await exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
         .on('transactionHash', (hash) => { console.log(hash) })
         .on('error', (error) => {
            console.error(error)
            window.alert('There was an error!')
         })
   }
)


const ordersSlice = createSlice({
	name: 'orders',
	initialState: { 
      cancelledOrders: {
         loaded: false,
         data: [],
         orderCancelling: false
      },
      filledOrders: {
         loaded: false,
         data: [],
         orderFilling: false
      },
      allOrders: {
         loaded: false,
         data: []
      },
      newOrder: {
         making: false
      }
   },
	reducers: {
      cancelledOrdersLoaded: (state, action) => {
         state.cancelledOrders.data = action.payload
         state.cancelledOrders.loaded = true
      },
      filledOrdersLoaded: (state, action) => {
         state.filledOrders.data = action.payload
         state.filledOrders.loaded = true
      },
      allOrdersLoaded: (state, action) => {
         state.allOrders.data = action.payload
         state.allOrders.loaded = true
      },
      
      orderCancelled: (state, action) => {
         state.cancelledOrders.orderCancelling = false
         state.cancelledOrders.data.push(action.payload)
      },
      orderFilled: (state, action) => {
         // Prevent duplicate orders
         const index = state.filledOrders.data.findIndex(order => order.id === action.payload.id)
         if(index === -1) {
            state.filledOrders.data.push(action.payload)
         }
         state.filledOrders.orderFilling = false
      },
      orderMade: (state, action) => {
         const index = state.allOrders.data.findIndex(order => order.id === action.payload.id)
         if(index === -1) {
            state.allOrders.data.push(action.payload)

         }
         state.newOrder.making = false
      }
   },
   extraReducers: {
      [fillOrder.pending]: (state) => {
         state.filledOrders.orderFilling = true
      },
      [fillOrder.rejected]: (state) => {
         state.filledOrders.orderFilling = false
      },
      [cancelOrder.pending]: (state) => {
         state.cancelledOrders.orderCancelling = true
      },
      [cancelOrder.rejected]: (state) => {
         state.cancelledOrders.orderCancelling = false
      },
      [makeNewOrder.pending]: (state) => {
         state.newOrder.making = true
      },
      [makeNewOrder.rejected]: (state) => {
         state.newOrder.making = false
      }
   }
})

export default ordersSlice.reducer

export const { 
   cancelledOrdersLoaded, filledOrdersLoaded, allOrdersLoaded,
   orderCancelled, orderFilled, orderMade
} = ordersSlice.actions

// Selectors
export const selectCancelledOrdersLoaded = state => state.orders.cancelledOrders.loaded
export const selectCancelledOrders = state => state.orders.cancelledOrders.data
export const selectOrderCancelling = state => state.orders.cancelledOrders.orderCancelling

export const selectFilledOrdersLoaded = state => state.orders.filledOrders.loaded
export const selectFilledOrders = state => state.orders.filledOrders.data
export const selectOrderFilling = state => state.orders.filledOrders.orderFilling

export const selectAllOrdersLoaded = state => state.orders.allOrders.loaded
export const selectAllOrders = state => state.orders.allOrders.data

export const selectOrderMaking = state => state.orders.newOrder.making