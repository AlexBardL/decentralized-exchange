export const chartOptions = {
   chart: {
      animations: { enabled: false },
      toolbar: { show: false },
      width: '100px'
   },
   tooltip: {
      enabled: true,
      theme: 'dark',
      style: {
         fontSize: '12px',
         fontFamily: undefined
      },
      x: {
         show: false,
         format: 'dd MMM',
         formatter: undefined,
      },
      y: {
         show: true,
         title: 'price'
      },
      marker: {
         show: true,
      },
      items: {
         display: 'flex',
      },
      fixed: {
         enabled: false,
         // position: 'topRight',
         offsetX: 0,
         offsetY: 0,
      },
   },
   xaxis: {
      type: 'datetime',
      labels: {
         show: true,
         style: {
            colors: '#fff',
            fontSize: '9px',
            cssClass: 'apexcharts-xaxis-label',
         },
      },
   },
   yaxis: {
      labels: {
         show: true,
         minWidth: 0,
         maxWidth: 160,
         style: {
            colors: '#fff',
            fontSize: '9px',
            cssClass: 'apexcharts-yaxis-label',
         },
         offsetX: 0,
         offsetY: 0,
         rotate: 0,
      }
   },
   grid: {
      show: true,
      borderColor: '#90A4AE',
      strokeDashArray: 2,
      xaxis: {
         lines: {
             show: false
         }
      },   
      yaxis: {
         lines: {
            show: true
         }
      },  
      row: {
         colors: undefined,
         opacity: 0.5
      },  
      column: {
         colors: undefined,
         opacity: 0.5
      }
   }
 }