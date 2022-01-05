<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { setupLLMap } from 'src/map/llmap.js'
import { LLMap } from 'components/models'
import { ISensorSystem } from 'components/genmodel'

const props = defineProps<{
  system: ISensorSystem
}>()

const center = computed(() => {
  const c = props.system.center
  if (c) {
    return [c.lat, c.lon]
  } else return null
})

let llmap: LLMap | null = null

const prepareSystem = (llmap: LLMap, center: number[], zoom: number) => {
  llmap.sensorSystemAdded(center, zoom)
}

onMounted(() => {
  const zoom = 10
  llmap = setupLLMap('mapid', center.value, zoom)

  if (llmap && center.value) {
    prepareSystem(llmap, center.value, zoom)
    llmap.sensorSystemAdded(center.value, zoom)
  }
})
</script>

<template>
  <!--  <pre>center={{ center }}</pre>-->
  <div id="mapid" style="height: 400px">
    <div id="absoluteCharts"></div>
  </div>
  <pre>system={{ system }}</pre>
</template>

<style src="leaflet/dist/leaflet.css" />
<!--<style src="leaflet-measure/dist/leaflet-measure.css" />-->
