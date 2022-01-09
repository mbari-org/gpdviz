<script setup lang="ts">
import { wsBaseUri } from 'boot/axios'
import { Notif } from 'components/genmodel'
import {computed, onUnmounted, ref} from 'vue'
import Timeout = NodeJS.Timeout

const props = defineProps<{
  sysid: string
  handleNotification(notif: Notif): void
}>()

const connecting = ref<boolean>(false)

const wsOpt = ref<WebSocket | null>(null)

let keepAliveHandleOpt: Timeout | null = null

const connected = computed(() => !!wsOpt.value)

const label = computed(() =>
  connected.value ? 'Connected' : connecting.value ? 'Connecting' : 'Connect'
)

const btnClass = computed(() =>
  connected.value ? 'ws-connected' : 'ws-disconnected'
)

onUnmounted(() => {
  if (connected.value) {
    closed()
  }
})

function clicked() {
  console.debug('Clicked')
  connecting.value = true

  const uri = `${wsBaseUri}/${props.sysid}`
  console.debug(`uri: ${uri}`)
  const ws = new WebSocket(uri)

  ws.onopen = () => {
    wsOpt.value = ws
    keepAliveHandleOpt = setInterval(() => {
      if (wsOpt.value) {
        console.log('ping')
        wsOpt.value.send('keep-alive')
      }
    }, 40 * 1000)
    connecting.value = false
  }

  ws.onerror = (event: Event) => {
    console.error('onerror: event=', event)
    closed()
  }

  ws.onmessage = (event: MessageEvent) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const obj = JSON.parse(event.data as string)
    // console.debug('onmessage: obj=', obj)
    const notif = obj as Notif
    props.handleNotification(notif)
  }

  ws.onclose = () => {
    closed()
  }
}

function closed() {
  wsOpt.value = null
  if (keepAliveHandleOpt) {
    clearInterval(keepAliveHandleOpt)
  }
  keepAliveHandleOpt = null
  // updateButtons()
  console.warn('Connection closed')
}
</script>

<template>
  <q-btn
    :label="label"
    :disable="connecting || connected"
    :class="btnClass"
    no-caps
    dense
    @click="clicked"
  />
</template>

<style scoped>
.ws-connected {
  background: rgba(168, 255, 174, 0.7);
}

.ws-disconnected {
  background: rgba(255, 0, 0, 0.23);
}
</style>
