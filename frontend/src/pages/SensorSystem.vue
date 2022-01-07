<script setup lang="ts">
import {onMounted, ref} from 'vue'

import {useRoute} from 'vue-router'
import {api} from 'boot/axios'
import {ISensorSystem, Notif} from 'components/genmodel'
import SysActivity from 'components/SysActivity.vue'
import GpdvizMap from 'components/GpdvizMap.vue'
import Websocket from 'components/Websocket.vue'
import {LLMap} from 'components/models';

const route = useRoute()
const system = ref<ISensorSystem | null>(null)

let llmap: LLMap | null = null

function gotLLMap(theLLmap: LLMap) {
  llmap = theLLmap
  console.debug('gotLLMap: llmap=', llmap)
}

function handleNotification(notif: Notif) {
  console.debug('handleNotification: notif=', notif)
  switch (notif.type) {
    case 'SensorSystemAdded':
      // TODO
      break
    case 'SensorSystemDeleted':
      // TODO
      break
    case 'SensorSystemUpdated':
      // TODO
      break
    case 'SensorSystemRefresh':
      // TODO
      break
    case 'DataStreamAdded':
      // TODO
      break
    case 'DataStreamDeleted':
      // TODO
      break
    case 'VariableDefAdded':
      // TODO
      break
    case 'ObservationsAdded':
  }
}

onMounted(() => {
  // (eslint has been such a pita)
  api
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    .get<ISensorSystem>(`ss/${route.params.sysid}`)
    .then((response) => {
      system.value = response.data
    })
    .catch((e) => {
      console.error(e)
    })
})
</script>

<template>
  <q-page>
    <!--    <pre> {{ system }}</pre>-->
    <Websocket :sysid="route.params.sysid" :handleNotification="handleNotification"/>
    <div
      class="full-width row q-gutter-x-md justify-center"
      style="text-align: center; background-color: #ebfaf5"
    >
      <div class="text-bold row">
        <code>{{ $route.params.sysid }}</code>
        <div v-if="system && system.name">- {{ system.name }}</div>
      </div>
      <div v-if="system && system.description">{{ system.description }}</div>
    </div>

    <table style="width: 100%">
      <tbody>
      <tr v-if="system">
        <td style="vertical-align: top">
          <GpdvizMap :system="system" @gotLLMap="gotLLMap"/>
        </td>
        <td style="width: 300px; vertical-align: top">
          <SysActivity :system="system"/>
        </td>
      </tr>
      </tbody>
    </table>
  </q-page>
</template>
