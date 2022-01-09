<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useRoute } from 'vue-router'
import { api } from 'boot/axios'
import { ISensorSystem, Notif } from 'components/genmodel'
import SysActivity from 'components/SysActivity.vue'
import GpdvizMap from 'components/GpdvizMap.vue'
import Websocket from 'components/Websocket.vue'
import { ClickEvent, LLMap } from 'src/map/LLMap'
import { VModel } from 'components/VModel'
import axios from 'axios'

const route = useRoute()

const system = ref<ISensorSystem | null>(null)

let llmap: LLMap | null = null
let vm: VModel | null = null

// TODO test
function clickListener(clickEvent: ClickEvent) {
  console.debug('clickListener: clickEvent=', clickEvent)
  const ss = system.value
  if (!ss || !ss.clickListener) {
    return
  }
  const method = 'POST'
  const url = ss.clickListener
  const data = clickEvent
  const headers: { [key: string]: string } = {
    'Content-type': 'application/json',
  }

  void (async () => {
    try {
      const response = await axios({ method, url, data, headers })
      console.debug('clickListener: response=', response)
    } catch (e) {
      console.warn(`failure in call to click listener ${url}`, e)
    }
  })()
}

function gotLLMap(_llmap: LLMap) {
  llmap = _llmap
  console.debug('gotLLMap: llmap=', llmap)

  const sysid: string = route.params.sysid
  vm = new VModel(sysid, llmap)

  if (system.value) {
    llmap.setClickListener(clickListener)
    vm.refreshSystem(system.value)
  }
}

function handleNotification(notif: Notif) {
  console.debug('handleNotification: notif=', notif)
  if (vm) {
    vm.handleNotification(notif)
  }
}

onMounted(() => {
  // (eslint has been such a pita)
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const url = `ss/${route.params.sysid}`
  console.debug(`GET '${url}'`)
  api
    .get<ISensorSystem>(url)
    .then((response) => {
      // console.debug('Got:', JSON.stringify(response.data, null, '   '))
      // console.debug('Got:', response.data)
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
    <Websocket
      :sysid="route.params.sysid"
      :handleNotification="handleNotification"
    />
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
            <GpdvizMap :system="system" @gotLLMap="gotLLMap" />
          </td>
          <td style="width: 300px; vertical-align: top">
            <SysActivity :system="system" />
          </td>
        </tr>
      </tbody>
    </table>
  </q-page>
</template>
