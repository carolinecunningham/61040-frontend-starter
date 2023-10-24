<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["label"]);
const loaded = ref(false);
const emit = defineEmits(["editLabel", "refreshLabels"]);

const labelUsernames = ref<Array<Record<string, string>>>([]);

const getLabelItems = async () => {
  let labelItems;
  try {
    labelItems = await fetchy(`api/lists/usernames/${props.label._id}`, "GET");
  } catch {
    console.log("ERROR");
    return;
  }
  labelUsernames.value = labelItems;
};

const deleteLabel = async () => {
  try {
    await fetchy(`api/lists/${props.label._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshLabels");
};

onBeforeMount(async () => {
  await getLabelItems();
  loaded.value = true;
});
</script>

<template>
  <p class="Name">{{ props.label.name }}</p>
  <section class="friends" v-if="loaded && labelUsernames.length !== 0">
    <p>Friends:</p>
    <article v-for="(username, index) in labelUsernames" :key="index">
      <p>{{ username }}</p>
    </article>
  </section>
  <p v-else-if="loaded">No friends are in your label.</p>
  <p v-else>Loading...</p>
  <div class="base">
    <li><button class="btn-small pure-button" @click="emit('editLabel', props.label._id)">Edit</button></li>
    <li><button class="button-error btn-small pure-button" @click="deleteLabel">Delete</button></li>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.Name {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.friends {
  padding: 1em;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}
</style>
