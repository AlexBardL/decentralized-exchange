import { configureStore } from '@reduxjs/toolkit'

import web3Reducer from '../features/web3/web3Slice'
import tokenReducer from '../features/token/tokenSlice'
import exchangeReducer from '../features/exchange/exchangeSlice'
import ordersReducer from '../features/orders/ordersSlice'
import balancesReducer from '../features/balances/balancesSlice'


export default configureStore({
	reducer: {
		web3: web3Reducer,
      token: tokenReducer,
      exchange: exchangeReducer,
      orders: ordersReducer,
      balances: balancesReducer
	},
   middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
         ignoredPaths: [
            'web3.connection', 'token.contract', 'exchange.contract',
            'orders.cancelledOrders', 'orders.filledOrders', 'orders.allOrders'
         ],
         ignoredActions: [
            'web3/web3Loaded',
            'token/tokenLoaded',
            'exchange/exchangeLoaded',
            'orders/cancelledOrdersLoaded',
            'orders/filledOrdersLoaded',
            'orders/allOrdersLoaded'
         ]
      }
   })
})