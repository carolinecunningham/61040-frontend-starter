<script setup lang="ts">
import FriendListComponent from "@/components/Friend/FriendListComponent.vue";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const loaded = ref(false);

let recommendedFriends = ref<Array<Record<string, string>>>([]);
let friendsDisplay = ref<Array<Record<string, string>>>([]);

let startingIdx = 0;
const numToShow = 2;
let totalNumSuggestions = 0;

async function getRecommendedFriends(maxQuantity?: string) {
  let query: Record<string, string> = maxQuantity !== undefined ? { maxQuantity } : {};
  let friendResults;
  try {
    // TODO: figure fetchy out, appends
    friendResults = await fetchy("/api/filter/recommendedUsers/", "GET", { query });
  } catch (_) {
    return;
  }
  recommendedFriends.value = friendResults;
  totalNumSuggestions = Object.keys(recommendedFriends.value).length;
}

async function updateShown(startIdx: number, numShowInput: number) {
  let startingNum = new Number(startIdx);
  let numShow = new Number(numShowInput);

  const startingIndex = startingNum.toString();
  const numDisplay = numShow.toString();

  let query: Record<string, string> = { startingIndex, numDisplay };

  let friendResults;
  try {
    friendResults = await fetchy("/api/filter/recommendedUsers/", "PUT", { query });
  } catch (_) {
    return;
  }
  startingIdx = startIdx + numShowInput;
  friendsDisplay.value = friendResults;
}

function moreSuggestionsLeft() {
  return !(startingIdx + numToShow > totalNumSuggestions);
}

async function updateFriendsRecs() {
  await getRecommendedFriends();
  // await updateShown(startingIdx, numToShow);
}

onBeforeMount(async () => {
  await getRecommendedFriends();
  await updateShown(startingIdx, numToShow);
  loaded.value = true;
});
</script>

<template>
  <FriendListComponent @recommendedUsersUpdate="updateFriendsRecs"></FriendListComponent>
  <h2>Recommended Friends</h2>
  <section class="friends" v-if="loaded && friendsDisplay.length !== 0">
    <menu v-for="(f, index) in friendsDisplay" :key="index">
      <p :f="friendsDisplay">{{ index }}</p>
      <p :f="friendsDisplay">{{ f }}</p>
    </menu>
  </section>
  <p v-else-if="loaded">No recommended friends found.</p>
  <p v-else>Loading...</p>
  <div v-if="moreSuggestionsLeft()" class="center">
    <button class="pure-button btn-small pure-button-primary" @click="updateShown(startingIdx, numToShow)">Next Page of Suggestions</button>
  </div>
  <div v-else class="center">
    <button class="pure-button btn-small pure-button-primary" @click="updateShown(0, numToShow)">Back to Beginning</button>
  </div>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
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
  padding: 0.5em;
}

.friends {
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
  font-family: Verdana;
}

.center {
  text-align: center;
}

menu {
  background-color: #f7f0f5;
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0.25em;
  margin: 0;
}

button {
  background-color: #7fb285;
  font-family: "Verdana";
}
</style>
