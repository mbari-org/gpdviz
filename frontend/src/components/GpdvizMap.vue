<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { LLMap } from 'src/map/LLMap'
import { ISensorSystem } from 'components/genmodel'
import { ChartDiv } from 'components/VModel'

const props = defineProps<{
  system: ISensorSystem
  absoluteCharts: ChartDiv[]
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
  emit('gotLLMap', llmap)
})
</script>

<template>
  <div>
    <div id="mapid" style="height: 400px">
      <div id="absoluteCharts">
        <div v-for="(c, index) in absoluteCharts" :key="index">
          <div
            :id="c.id"
            class="absoluteChart"
            :style="{ 'min-width': c.minWidthStr, 'height': c.heightStr }"
          />
        </div>
      </div>
    </div>
    <pre>absoluteCharts={{ absoluteCharts }}</pre>
    <pre>system={{ system }}</pre>
  </div>
</template>

<style src="leaflet/dist/leaflet.css" />
<!--<style src="leaflet-measure/dist/leaflet-measure.css" />-->

<style scoped>
.absoluteChart {
  z-index: 999999;
  background: rgba(255, 255, 255, 0.7);
  position: absolute;
  top: 80px;
  left: 0;
  padding: 5px;
  border: 1px solid grey;
  display: none;
  width: 400px !important;
  height: 400px !important;
}
</style>
