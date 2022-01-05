<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { api } from 'boot/axios'
import { ISensorSystemSummary } from 'components/genmodel'
// import ExampleComponent from 'components/CompositionComponent.vue';

const columns = [
  { name: 'sysid', label: 'ID', field: 'sysid', align: 'left' },
  { name: 'name', label: 'Name', field: 'name', align: 'left' },
  { name: 'streamIds', label: 'Streams', field: 'streamIds', align: 'left' },
]

const initialPagination = {
  // sortBy: 'sysid',
  rowsPerPage: 0,
  // rowsNumber: xx if getting data from a server
}

const rows = ref<ISensorSystemSummary[]>([])

onMounted(() => {
  api
    .get<ISensorSystemSummary[]>('ss')
    .then((response) => {
      console.debug('ss =>', response.data)
      rows.value = response.data
    })
    .catch((e) => {
      console.error(e)
    })
})
</script>

<template>
  <q-page>
    <q-table
      title="Registered sensor systems"
      :rows="rows"
      :columns="columns"
      row-key="name"
      :pagination="initialPagination"
      separator="cell"
      dense
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="sysid" :props="props">
            <router-link :to="`/${props.row.sysid}`">
              {{ props.row.sysid }}
            </router-link>
          </q-td>
          <q-td key="name" :props="props">
            {{ props.row.name }}
            <q-tooltip v-if="props.row.description">
              {{ props.row.description }}
            </q-tooltip>
          </q-td>
          <q-td
            key="streamIds"
            :props="props"
            style="white-space: break-spaces"
          >
            {{ props.row.streamIds.join(', ') }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>
