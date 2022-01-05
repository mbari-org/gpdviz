<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useRoute } from 'vue-router'
import { api } from 'boot/axios'
import { System } from 'components/models'
import SysActivity from 'components/SysActivity.vue'
import GpdvizMap from 'components/GpdvizMap.vue'
import Websocket from 'components/Websocket.vue'

const route = useRoute()
const system = ref<System | null>(null)

onMounted(() => {
  // (eslint has been such a pita)
  api
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    .get<System>(`ss/${route.params.sysid}`)
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
    <Websocket :sysid="route.params.sysid" />
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
            <GpdvizMap :system="system" />
          </td>
          <td style="width: 300px; vertical-align: top">
            <SysActivity :system="system" />
          </td>
        </tr>
      </tbody>
    </table>
  </q-page>
</template>