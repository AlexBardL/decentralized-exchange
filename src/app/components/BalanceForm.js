import { Tab, Tabs } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'

import { 
   selectCustomerEtherBalance, selectCustomerTokenBalance,
   selectExchangeEtherBalance, selectExchangeTokenBalance,
   depositEther, depositToken, withdrawEther, withdrawToken
} from '../../features/balances/balancesSlice'
import { formatBalance } from '../helpers'


const BalanceForm = () => {
   const customerEtherBalance = useSelector(selectCustomerEtherBalance)
   const customerTokenBalance = useSelector(selectCustomerTokenBalance)
   const exchangeEtherBalance = useSelector(selectExchangeEtherBalance)
   const exchangeTokenBalance = useSelector(selectExchangeTokenBalance)
   const dispatch = useDispatch()
   
   const [etherDeposit, setEtherDeposit] = useState('')
   const [tokenDeposit, setTokenDeposit] = useState('')
   const [etherWithdraw, setEtherWithdraw] = useState('')
   const [tokenWithdraw, setTokenWithdraw] = useState('')

   const onEtherDepositSubmit = e => {
      e.preventDefault()
      dispatch(depositEther(etherDeposit))
      setEtherDeposit('')
   }
     
   const onTokenDepositSubmit = e => {
      e.preventDefault()
      dispatch(depositToken(tokenDeposit))
      setTokenDeposit('')
   }
   
   const onEtherWithdrawSubmit = e => {
      e.preventDefault()
      dispatch(withdrawEther(etherWithdraw))
      setEtherWithdraw('')
   }
     
   const onTokenWithdrawSubmit = e => {
      e.preventDefault()
      dispatch(withdrawToken(tokenWithdraw))
      setTokenWithdraw('')
   }
   

   return (
      <Tabs defaultActiveKey='deposit' className='bg-dark text-white'>
         <Tab eventKey='deposit' title='Deposit' className='bg-dark mx-2'>
            <table className='table table-dark table-sm small balances-table'>   
               <thead>
                  <tr>
                     <th>Token</th>
                     <th>Wallet</th>
                     <th>Exchange</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td>ETH</td>
                     <td>{formatBalance(customerEtherBalance)}</td>
                     <td>{formatBalance(exchangeEtherBalance)}</td>
                  </tr>
               </tbody>
            </table>
            <form className='row' onSubmit={onEtherDepositSubmit}>
               <div className='col-7 pr-sm-2'>
                  <input 
                     type='text'
                     placeholder='ETH Amount'
                     onChange={ (e) => setEtherDeposit(e.target.value) }
                     className='form-control form-control-sm bg-dark text-white'
                     required />
               </div>
               <div className='col-5 pl-sm-0 bal-btn-div'>
                  <button type='submit' className='btn btn-primary btn-block btn-sm bal-btn'>Deposit</button>
               </div>
            </form>
            <br />
            <table className='table table-dark table-sm small balances-table'>   
               <tbody>
                  <tr>
                     <td>DEX</td>
                     <td>{formatBalance(customerTokenBalance)}</td>
                     <td>{formatBalance(exchangeTokenBalance)}</td>
                  </tr>
               </tbody>
            </table>
            <form className='row' onSubmit={onTokenDepositSubmit}>
               <div className='col-7 pr-sm-2'>
                  <input 
                     type='text'
                     placeholder='DEX Amount'
                     onChange={ (e) => setTokenDeposit(e.target.value) }
                     className='form-control form-control-sm bg-dark text-white'
                     required />
               </div>
               <div className='col-5 pl-sm-0 bal-btn-div'>
                  <button type='submit' className='btn btn-primary btn-block btn-sm bal-btn'>Deposit</button>
               </div>
            </form>
         </Tab>
         <Tab eventKey='withdraw' title='Withdraw' className='bg-dark mx-2'>
            <table className='table table-dark table-sm small balances-table'>   
               <thead>
                  <tr>
                     <th>Token</th>
                     <th>Wallet</th>
                     <th>Exchange</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td>ETH</td>
                     <td>{formatBalance(customerEtherBalance)}</td>
                     <td>{formatBalance(exchangeEtherBalance)}</td>
                  </tr>
               </tbody>
            </table>
            <form className='row' onSubmit={onEtherWithdrawSubmit}>
               <div className='col-7 pr-sm-2'>
                  <input 
                     type='text'
                     placeholder='ETH Amount'
                     onChange={ (e) => setEtherWithdraw(e.target.value) }
                     className='form-control form-control-sm bg-dark text-white'
                     required />
               </div>
               <div className='col-5 pl-sm-0 bal-btn-div'>
                  <button type='submit' className='btn btn-primary btn-block btn-sm bal-btn'>Withdraw</button>
               </div>
            </form>
            <br />
            <table className='table table-dark table-sm small balances-table'>   
               <tbody>
                  <tr>
                     <td>DEX</td>
                     <td>{formatBalance(customerTokenBalance)}</td>
                     <td>{formatBalance(exchangeTokenBalance)}</td>
                  </tr>
               </tbody>
            </table>
            <form className='row' onSubmit={onTokenWithdrawSubmit}>
               <div className='col-7 pr-sm-2'>
                  <input 
                     type='text'
                     placeholder='DEX Amount'
                     onChange={ (e) => setTokenWithdraw(e.target.value) }
                     className='form-control form-control-sm bg-dark text-white'
                     required />
               </div>
               <div className='col-5 pl-sm-0 bal-btn-div'>
                  <button type='submit' className='btn btn-primary btn-block btn-sm bal-btn'>Withdraw</button>
               </div>
            </form>
         </Tab>
      </Tabs>
   )
}

export default BalanceForm
