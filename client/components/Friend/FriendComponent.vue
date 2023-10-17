<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const props = defineProps(["Friends"]);
const emit = defineEmits(["removeFriend", "updateFriends"]);
const { currentUsername } = storeToRefs(useUserStore());
console.log("PROMPS");
console.log(props.Friends);
</script>

<template>
  <!-- <p>{{ props.Friend }}</p> -->
  <div class="base">
    <li><button class="btn-small pure-button" @click="emit('removeFriend', props.friend._id)">Remove Friend</button></li>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.author {
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
