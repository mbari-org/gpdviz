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
  return c ? [c.lat, c.lon] : [36.82, -122.0]
})

const zoom = computed(() => props.system.zoom || 11)

let llmap: LLMap | null = null

onMounted(() => {
  llmap = new LLMap(center.value, zoom.value)
  llmap.sensorSystemAdded(center.value, zoom.value)
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
