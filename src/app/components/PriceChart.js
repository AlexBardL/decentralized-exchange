import Chart from 'react-apexcharts'
import { useSelector } from 'react-redux'

import { chartOptions } from '../../features/orders/PriceChart.config'
import { selectFilledOrdersLoaded, selectFilledOrders } from '../../features/orders/ordersSlice'
import { buildPriceChart } from '../../features/orders/formattingOrders'

import Spinner from './Spinner'


const PriceChart = () => {
   const filledOrdersReady = useSelector(selectFilledOrdersLoaded)
   const priceChart = buildPriceChart(useSelector(selectFilledOrders))
   
   const showPriceChart = priceChart => {
      return(
         <div className='price-chart'>
            <div className='price'>
               <h5 className='mt-3'>DEX/ETH &nbsp; {priceSymbol(priceChart.lastPriceChange)} &nbsp; {priceChart.lastPrice}</h5>
            </div>
            <Chart options={chartOptions} series={priceChart.series} type='candlestick' width='100%' height='100%' />
         </div>
      )
   }

   const priceSymbol = (lastPriceChange) => {
      let output
      if(lastPriceChange === '+') {
         output = <span className='text-success'>&#9650;</span>
      } else {
         output = <span className='text-danger'>&#9660;</span>
      }
      return output
   }


   return (
      <div className='card bg-dark text-white'>
         <div className='card-header'>
            Price Chart
         </div>
         <div className='card-body'>
            {filledOrdersReady ? showPriceChart(priceChart) : <Spinner />}
         </div>
      </div>
   )
}

export default PriceChart
