<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["label"]);
const loaded = ref(false);
const emit = defineEmits(["editLabel", "refreshLabels"]);
const friend_username = ref("");

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

const assignToLabel = async (name: string) => {
  const query = { friendName: name };
  try {
    await fetchy(`/api/lists/assign/${props.label._id}`, "PUT", { query });
  } catch (e) {
    friend_username.value = "";
    return;
  }
  await getLabelItems();
  friend_username.value = "";
};

const removeFromLabel = async (name: string) => {
  const query = { friendName: name };
  try {
    await fetchy(`/api/lists/remove/${props.label._id}`, "PUT", { query });
  } catch (e) {
    return;
  }
  await getLabelItems();
};

onBeforeMount(async () => {
  await getLabelItems();
  loaded.value = true;
});
</script>

<template>
  <p class="Name">{{ props.label.name }}</p>
  <div class="delete">
    <button class="pure-button btn-small pure-button-primary" @click="deleteLabel">Delete Label</button>
  </div>
  <section class="friends" v-if="loaded && labelUsernames.length !== 0">
    <menu v-for="(username, index) in labelUsernames" :key="index">
      <li>
        {{ username }}
        <button class="pure-button btn-small pure-button-primary" @click="removeFromLabel(username.toString())">Remove Friend</button>
      </li>
    </menu>
  </section>
  <p class="friends" v-else-if="loaded">No friends are in your label.</p>
  <p v-else>Loading...</p>
  <div class="base">
    <form @submit.prevent="assignToLabel(friend_username)">
      <textarea id="username" v-model="friend_username" instruction="Enter Friend's Username" required> </textarea>
      <button class="pure-button btn-small pure-button-primary">Add Friend To Label</button>
    </form>
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

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 0.5em;
  padding: 0.5em;
  border-radius: 2px;
  resize: none;
}

.friends {
  padding-bottom: 1em;
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

.delete {
  display: flex;
  justify-content: flex-end;
}

.base article:only-child {
  margin-left: auto;
}
</style>
