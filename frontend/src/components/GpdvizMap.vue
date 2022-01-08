<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { LLMap } from 'src/map/LLMap'
import { ISensorSystem } from 'components/genmodel'

const props = defineProps<{
  system: ISensorSystem
}>()

const emit = defineEmits<{
  (e: 'gotLLMap', llmap: LLMap): void
}>()

const center = computed(() => {
  const c = props.system.center
  if (c) {
    return [c.lat, c.lon]
  } else return null
})

let llmap: LLMap | null = null

onMounted(() => {
  const zoom = 10

  llmap = new LLMap(center.value, zoom)

  if (llmap && center.value) {
    llmap.sensorSystemAdded(center.value, zoom)
  }

  emit('gotLLMap', llmap)
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
