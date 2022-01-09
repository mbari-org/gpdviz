<script setup lang="ts">
import { computed } from 'vue'
import { IDataStream, ISensorSystem } from 'components/genmodel'

import keys from 'lodash/keys'
import sortBy from 'lodash/sortBy'
import values from 'lodash/values'

const props = defineProps<{
  system: ISensorSystem
}>()

const sortedStreams = computed(() =>
  sortBy(values(props.system.streams), str => str.strid)
)

const observationsSummary = computed(() => (ds: IDataStream) => {
  const isoTimes = sortBy(keys(ds.observations))
  // console.debug('lastObservation: isoTimes=', isoTimes);
  return {
    numObservations: isoTimes.length,
    latest: isoTimes[0],
  }
})
</script>

<template>
  <div>
    <div style="font-size: small; color: gray">
      <div v-if="system.center">
        Center lat,lon:
        {{ system.center.lat.toFixed(5) }},
        {{ system.center.lon.toFixed(5) }}
      </div>
      <div v-if="system.clickListener">
        clickListener: {{ system.clickListener }}
      </div>
      <!--        <pre>system={{ system }}</pre>-->
    </div>
    <div>
      <ul style="margin-left: -20px">
        <li v-for="str in sortedStreams" :key="str.strid" class="q-mb-xs">
          <div>
            <span class="text-bold">
              {{ str.strid }}
              <q-tooltip v-if="str.mapStyle || str.chartStyle">
                <pre v-if="str.mapStyle">mapStyle = {{ str.mapStyle }}</pre>
                <pre v-if="str.chartStyle">chartStyle = {{ str.chartStyle }}</pre>
              </q-tooltip>
            </span>
            <ul v-if="str.variables">
              <li v-for="(v, v_index) in str.variables" :key="v_index">
                {{ v.name }}
                <span v-if="v.units">({{ v.units }})</span>
              </li>
            </ul>
          </div>
          <div v-if="str.observations">
            <div>
              Observations: {{ observationsSummary(str).numObservations }}
            </div>
            <div>Latest: {{ observationsSummary(str).latest }}</div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
