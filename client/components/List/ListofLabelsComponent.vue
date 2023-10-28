<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";

import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

import CreateLabelForm from "./CreateLabelForm.vue";
import MyLabelComponent from "./MyLabelComponent.vue";
const { isLoggedIn } = storeToRefs(useUserStore());

let labels = ref<Array<Record<string, string>>>([]);

const loaded = ref(false);
let editing = ref("");

function updateEditing(id: string) {
  editing.value = id;
}

async function getLabels() {
  let labelResults;
  try {
    labelResults = await fetchy("/api/lists", "GET");
  } catch (_) {
    return;
  }
  labels.value = labelResults;
}

onBeforeMount(async () => {
  await getLabels();
  loaded.value = true;
});
</script>

<template>
  <!-- {{ posts }} -->
  <!-- {{ userPosts }} -->

  <section v-if="isLoggedIn">
    <h2>Create a label:</h2>
    <CreateLabelForm @refreshLabels="getLabels" />
  </section>

  <h2>Your Labels</h2>
  <section class="labels" v-if="loaded && labels.length !== 0">
    <article v-for="l in labels" :key="l._id">
      <MyLabelComponent v-if="editing !== l._id" :label="l" @refreshLabels="getLabels" @editLabel="updateEditing" />
    </article>
  </section>
  <p v-else-if="loaded" class="center">No labels found. Create a labels and you can see it here!</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.center {
  text-align: center;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: #f7f0f5;
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.labels {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}

h2 {
  text-align: center;
  font-family: "Verdana";
}

button {
  background-color: #7fb285;
  font-family: "Verdana";
}
</style>
