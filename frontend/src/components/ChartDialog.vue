<script setup lang="ts">

import {Chart} from 'highcharts-vue'
import {computed, ref} from 'vue'
import {IDataStream} from 'components/genmodel';

import get from 'lodash/get'
import each from 'lodash/each'

const props = withDefaults(defineProps<{
  str: IDataStream
  withOpenButton: boolean
}>(), {
  withOpenButton: false,
})

const dialogOpened = ref(false)

const attrs = computed(() => {
  const str = props.str
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const t: string = get(str, 'str.chartStyle.title',
    str.strid + (str.name ? ' - ' + str.name : '')
  )
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const title: string = '<span style="font-size: small">' + t + '</span>'
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const subtitle: string = get(str, 'str.chartStyle.subtitle', '')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const yAxisList: string = get(str, 'str.chartStyle.yAxis', '')

  return {
    title,
    subtitle,
    yAxisList,
  }
})

const chartData = computed(() => {
  const str = props.str

  // const strid = str.strid
  const variables = str.variables

  // let seriesIndexForMouseHover: number | undefined = undefined

  const initialSeriesData: {[key: string]: unknown}[] = []
  each(variables, varProps => {
    //console.debug("varProps=", varProps)
    const varName = varProps.name

    // FIXME should be indicated which series to use for map location
    // if (varName === 'temperature' || varName === 'salinity') {
    //   seriesIndexForMouseHover = initialSeriesData.length
    // }

    const chartStyle = varProps.chartStyle || {}

    const options: {[key: string]: unknown} = {
      yAxis: get(chartStyle, 'yAxis'),
      name: varName + (varProps.units ? ' (' + varProps.units + ')' : ''),
      data: []
      , marker: {
        enabled: true,
        radius: 2
      },
      lineWidth: get(chartStyle, 'lineWidth', 1),
      type: get(chartStyle, 'type'),
      dataGrouping: get(chartStyle, 'dataGrouping',
        {enabled: true, approximation: 'open'}
      ),

      //states: {
      //  hover: {
      //    lineWidthPlus: 0
      //  }
      //}
    }
    // console.debug("varName=", varName, "options=", cloneDeep(options))

    initialSeriesData.push(options)
  })

  return initialSeriesData
})

const chartOptions = {
  chart: {
    // renderTo: "chart-container-" + strid,
    // height: str.chartHeightPx - 4,
    events: {
      zoomType: 'x'
    }
  },
  xAxis: {
    type: 'datetime',
    ordinal: false
  },
  legend: { enabled: false },

  series: [{
    data: (() => {
      const a = []
      for (let i = 0; i < 200; i++) {
        a.push([i, Math.random()])
      }
      return a
    })()
  }],

  yAxis: attrs.value.yAxisList,

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

  title: { text: attrs.value.title },
  subtitle: { text: attrs.value.subtitle },

  navigator: {
    enabled: true
  },
  scrollbar: {
    enabled: true
  },

  plotOptions: {
    series: {
      states: {
        hover: {
          lineWidthPlus: 1
        }
      }
    }
  },
}

</script>

<template>
  <div>
    <q-btn
      v-if="props.withOpenButton"
      icon="show_chart"
      @click="dialogOpened = true"
      dense round
      size="sm"
    />

    <q-dialog
      v-model="dialogOpened"
      no-backdrop-dismiss
      position="top"
      full-width
    >
      <q-card>
        <q-toolbar>
          <q-toolbar-title />
          <q-btn
            round dense size="sm"
            color="primary"
            @click="dialogOpened = false"
            icon="close"
          />
        </q-toolbar>

        <Chart
          :options="chartOptions"
          class="hc"
        />
      </q-card>
    </q-dialog>
  </div>
</template>

<style>
.hc {
  height: 300px;
  background: #ebfaf5;
}
</style>
