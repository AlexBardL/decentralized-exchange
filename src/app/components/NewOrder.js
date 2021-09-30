import { Tab, Tabs } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'

import { makeNewOrder, selectOrderMaking } from '../../features/orders/ordersSlice'
import { selectAccount } from '../../features/web3/web3Slice'
import { ORDER_TYPE } from '../../features/orders/ordersSlice' 

import Spinner from './Spinner'


const NewOrder = () => {
   const dispatch = useDispatch()
   const newOrderMaking = useSelector(selectOrderMaking)
   const account = useSelector(selectAccount)

   const [buyOrderAmount, setBuyOrderAmount] = useState('')
   const [buyOrderPrice, setBuyOrderPrice] = useState('')
   const [sellOrderAmount, setSellOrderAmount] = useState('')
   const [sellOrderPrice, setSellOrderPrice] = useState('')

   const submitBuyOrder = (e) => {
      e.preventDefault()
      dispatch(makeNewOrder({ orderType: ORDER_TYPE.BUY, amount: buyOrderAmount, price: buyOrderPrice }))
      setBuyOrderAmount('')
      setBuyOrderPrice('')
   }

   const submitSellOrder = (e) => {
      e.preventDefault()
      dispatch(makeNewOrder({ orderType: ORDER_TYPE.SELL, amount: sellOrderAmount, price: sellOrderPrice }))
      setSellOrderAmount('')
      setSellOrderPrice('')
   }

   const showBuyTotal = buyOrderAmount && buyOrderPrice
   const showSellTotal = sellOrderAmount && sellOrderPrice
   
   const showForm = () => {
      return (
         <Tabs defaultActiveKey='buy' className='bg-dark text-white'>
            <Tab eventKey='buy' title='Buy' className='bg-dark mx-2'>
               <form onSubmit={ submitBuyOrder }>
                  <div className='form-group'>
                     <label className='my-1'>Buy Amount (DEX)</label>
                     <div className='input-group'>
                        <input
                           type='text'
                           className='form-control form-control-sm bg-dark text-white mb-2'
                           placeholder='Buy Amount'
                           onChange={ (e) => setBuyOrderAmount(e.target.value) }
                           required
                        />
                     </div>
                  </div>
                  <div className='form-group small'>
                     <label className='my-1'>Buy Price</label>
                     <div className='input-group'>
                        <input
                           type='text'
                           className='form-control form-control-sm bg-dark text-white mb-3'
                           placeholder='Buy Price'
                           onChange={ (e) => setBuyOrderPrice(e.target.value) }
                           required
                        />
                     </div>
                  </div>
                  <div className='d-grid gap-2 col-8 mx-auto'>
                     <button type='submit' className='btn btn-primary btn-sm'>Send Buy Order</button>
                  </div>
                  { showBuyTotal ? <small>Total: {buyOrderAmount * buyOrderPrice} ETH</small> : null }
               </form>
            </Tab>
            <Tab eventKey='sell' title='Sell' className='bg-dark mx-2'>
               <form onSubmit={ submitSellOrder }>
                  <div className='form-group'>
                     <label className='my-1'>Buy Sell (DEX)</label>
                     <div className='input-group'>
                        <input
                           type='text'
                           className='form-control form-control-sm bg-dark text-white mb-2'
                           placeholder='Sell amount'
                           onChange={ (e) => setSellOrderAmount(e.target.value) }
                           required
                        />
                     </div>
                  </div>
                  <div className='form-group small'>
                     <label className='my-1'>Sell Price</label>
                     <div className='input-group'>
                        <input
                        type='text'
                        className='form-control form-control-sm bg-dark text-white mb-3'
                        placeholder='Sell Price'
                        onChange={ (e) => setSellOrderPrice(e.target.value) }
                        required
                        />
                     </div>
                  </div>
                  <div className='d-grid gap-2 col-8 mx-auto'>
                     <button type='submit' className='btn btn-primary btn-sm'>Send Sell Order</button>
                  </div>
                  { showSellTotal ? <small>Total: {sellOrderAmount * sellOrderPrice} ETH</small> : null }
               </form>
            </Tab>
         </Tabs>
      )
   }
    
   
   return (
      <div className='card bg-dark text-white'>
         <div className='card-header'>
            New Order
         </div>
         <div className='card-body'>
            { 
               !account ?
                  <div className='d-flex justify-content-center mt-5'>
                     <span className='h5'>Please connect your Wallet</span>
                  </div>
               :
                  (!newOrderMaking && account) ? showForm() : <Spinner /> 
            }
         </div>
      </div>
   )
}

export default NewOrder