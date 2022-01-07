<script setup lang="ts">
import { computed } from 'vue'
import { IDataStream, ISensorSystem } from 'components/genmodel'

import keys from 'lodash/keys'
import sortBy from 'lodash/sortBy'

defineProps<{
  system: ISensorSystem
}>()

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
          <li
            v-for="(str, strid) in system.streams"
            :key="strid"
            class="q-mb-xs"
          >
            <div>
              <span class="text-bold">{{ str.strid }}</span>
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
  </div>
</template>
