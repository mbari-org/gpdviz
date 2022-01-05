<script setup lang="ts">
import { wsBaseUri } from 'boot/axios'
import { computed, ref } from 'vue'
import Timeout = NodeJS.Timeout

const props = defineProps<{
  sysid: string
}>()

const label = ref<string>('Connect')
const connecting = ref<boolean>(false)

const wsOpt = ref<WebSocket | null>(null)

let keepAliveHandleOpt: Timeout | null = null

const btnClass = computed(() =>
  wsOpt.value ? 'ws-connected' : 'ws-disconnected'
)

function clicked() {
  console.debug('Clicked')
  connecting.value = true
  label.value = 'connecting...'

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
    label.value = 'Connected'
  }
  ws.onerror = (event: Event) => {
    console.error('onerror: event=', event)
    closed()
  }
  ws.onmessage = (event: MessageEvent) => {
    console.debug('onmessage: event=', event)
    // const notif = upickle.default.read[Notif](event.data.toString)
    // handleNotification(notif)
  }
  ws.onclose = () => {
    closed()
  }
}

function closed() {
  wsOpt.value = null
  label.value = 'Connect'
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
    :disable="connecting"
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
