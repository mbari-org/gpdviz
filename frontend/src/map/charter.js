import each from 'lodash/each'
import sortBy from 'lodash/sortBy'
import throttle from 'lodash/throttle'

import Highcharts from 'highcharts/highstock'

export default function Charter(str, hoveredPoint, mouseOutside) {
  const strid = str.strid
  const variables = str.variables

  let seriesIndexForMouseHover = undefined

  const title = (function() {
    const t = str.chartStyle && str.chartStyle.title || (str.strid + (str.name ? ' - ' + str.name : ''));
    return '<span style="font-size: small">' + t + '</span>';
  })();
  const subtitle = str.chartStyle && str.chartStyle.subtitle;

  const yAxisList = str.chartStyle && str.chartStyle.yAxis;

  const initialSeriesData = []
  each(variables, function(varProps) {
    //console.debug("varProps=", varProps)
    const varName = varProps.name

    // FIXME should be indicated which series to use for map location
    if (varName === 'temperature' || varName === 'salinity') {
      seriesIndexForMouseHover = initialSeriesData.length
    }
    const chartStyle = varProps.chartStyle || {}

    const options = {
      yAxis: chartStyle.yAxis,
      name: varName + (varProps.units ? ' (' +varProps.units+ ')' : ''),
      data: []
      ,marker: {
        enabled: true,
        radius: 2
      }
      ,lineWidth: chartStyle.lineWidth || 1
      ,type: chartStyle.type
      ,dataGrouping: chartStyle.dataGrouping || { enabled: true, approximation: 'open'}

      //,states: {
      //  hover: {
      //    lineWidthPlus: 0
      //  }
      //}
    }
    // console.debug("varName=", varName, "options=", cloneDeep(options))

    initialSeriesData.push(options)
  })

  let chart = undefined
  let serieses = undefined

  let lastAddedX = {}  // {seriesIndex -> x}

  let needRedraw = true

  let mouseIn = false

  setInterval(() => {
    if (chart && needRedraw) {
      // console.debug("redrawing chart ", strid)
      chart.redraw()
      needRedraw = false
    }
  }, 2000)

  const mousemove = (() => {
    function throttled(e) {
      if (mouseIn && seriesIndexForMouseHover !== undefined && chart) {
        const event = chart.pointer.normalize(e) //.originalEvent)
        const point = chart.series[seriesIndexForMouseHover].searchPoint(event, true)
        // console.debug("strid=", strid, "normalizedEvent=", event, "point=", point)
        hoveredPoint(point)
      }
    }
    return throttle(throttled, 250)
  })()

  return {
    strid,
    addChartPoint,
    activateChart,
    deactivateChart
  }

  function addChartPoint(seriesIndex, timeMs, y) {
    //console.debug("addChartPoint: strid=", strid, "timeMs=", timeMs, "y=", y)

    needRedraw = true

    initialSeriesData[seriesIndex].data.push([timeMs, y])

    if (serieses) {
      const lastX = lastAddedX[seriesIndex]
      if (lastX === undefined) {
        lastAddedX[seriesIndex] = timeMs
        // console.error("strid=" +strid+ " seriesIndex=" +seriesIndex+": FIRST timeMs(" +timeMs+ ")")
      }
      else if (timeMs <= lastX) {
        console.error("strid=" +strid+ " seriesIndex=" +seriesIndex+": timeMs(" +timeMs+ ") <= lastX(" +lastX+ ") diff=" + (lastX - timeMs))
      }
      else {
        lastAddedX[seriesIndex] = timeMs
      }

      // addPoint (Object options, [Boolean redraw], [Boolean shift], [Mixed animation])
      serieses[seriesIndex].addPoint([timeMs, y], false)
    }
    // else console.error("!!! no serieses !!!!!")
  }

  function activateChart() {
    deactivateChart()
    needRedraw = true
    each(initialSeriesData, function(s) {
      s.data = sortBy(s.data, function(xy) { return xy[0] })
    })
    chart = createChart()

    if (hoveredPoint) {
      // TODO vue-based capture of chart
      const chartId = "chart-container-" + strid
      const idElm = document.getElementById(chartId)
      idElm.onmouseenter = mouseenter
      idElm.onmousemove = mousemove
      idElm.onmouseleave = mouseleave
    }
  }

  function mouseenter(e) {
    mouseIn = true
  }

  function mouseleave(e) {
    if (mouseIn) {
      mouseIn = false
      mouseOutside()
    }
  }

  function deactivateChart() {
    needRedraw = false
    lastAddedX = {}
    if (chart) chart.destroy()
    chart = undefined
    serieses = undefined
    mouseIn = false
    mouseOutside()
    if (hoveredPoint && chart && chart.container) {
      console.debug('deactivateChart')
      // TODO replace the $ stuff
      // $(chart.container).off('mouseenter', mouseenter)
      // $(chart.container).off('mousemove', mousemove)
      // $(chart.container).off('mouseleave', mouseleave)
      // like this:?
      const chartId = "chart-container-" + strid
      const idElm = document.getElementById(chartId)
      idElm.onmouseenter = undefined
      idElm.onmousemove = undefined
      idElm.onmouseleave = undefined
    }
  }

  function createChart() {
    // console.warn(str.strid, "createChart: str.chartHeightPx=", str.chartHeightPx)
    // http://stackoverflow.com/q/23624448/830737
    return new Highcharts.StockChart({
      chart: {
        renderTo: "chart-container-" + strid,
        height: str.chartHeightPx - 4,
        events: {
          load: function () {
            serieses = this.series
          },
          zoomType: 'x'
        }
      },
      xAxis: {
        type: 'datetime',
        ordinal: false
      },
      legend: { enabled: false },

      series: initialSeriesData,

      yAxis: yAxisList,

      tooltip: {
        // pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
        valueDecimals: 4
        // ,shared: true

        // why is not the <table> working?
        // ,useHTML: true
        // ,headerFormat: '<small>{point.key}</small><table>'
        // ,pointFormat: '<tr><td style="color: {series.color}">{series.name}:</td>' +
        //   '<td style="text-align: right"><b>{point.y}</b></td></tr>'
        // ,footerFormat: '</table>'
      },

      rangeSelector: {
        buttons: [{
          count: 5,
          type: 'minute',
          text: '5m'
        }, {
          count: 15,
          type: 'minute',
          text: '15m'
        }, {
          count: 1,
          type: 'hour',
          text: '1H'
        }, {
          count: 3,
          type: 'hour',
          text: '3H'
        }, {
          count: 6,
          type: 'hour',
          text: '6H'
        }, {
          count: 12,
          type: 'hour',
          text: '12H'
        }, {
          count: 1,
          type: 'day',
          text: '1D'
        }, {
          count: 7,
          type: 'day',
          text: '1W'
        }, {
          type: 'all',
          text: 'All'
        }],
        inputEnabled: false,
        selected: 2
      },

      title: { text: title },
      subtitle: { text: subtitle },

      navigator: {
        enabled: true
      },
      scrollbar: {
        enabled: true
      }

      ,plotOptions: {
        series: {
          states: {
            hover: {
              lineWidthPlus: 0
            }
          }
        }
      }
    })
  }
}
