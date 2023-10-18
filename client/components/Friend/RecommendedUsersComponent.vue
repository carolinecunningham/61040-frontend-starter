<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const loaded = ref(false);
let recommendedFriends = ref<Array<Record<string, string>>>([]);

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
}

async function sendRequest(user: string) {
  try {
    const query = "api/friends/requests/" + user;
    await fetchy(query, "POST");
  } catch (_) {
    return;
  }
}

// TODO: unique post prompting feature --> show commonalitities

onBeforeMount(async () => {
  await getRecommendedFriends();
  loaded.value = true;
});
</script>

<!-- todo: why has a user been recommended to you? -->

<template>
  <section class="friends" v-if="loaded && recommendedFriends.length !== 0">
    <menu v-for="(f, index) in recommendedFriends" :key="index">
      <p :f="recommendedFriends" @refreshFriends="updateFriends">{{ index }}</p>
      <p :f="recommendedFriends" @refreshFriends="updateFriends">{{ f }}</p>
    </menu>
  </section>
  <p v-else-if="loaded">No recommedended friends found.</p>
  <p v-else>Loading...</p>
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
  background-color: var(--base-bg);
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

menu {
  background-color: var(--base-bg);
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0.25em;
  margin: 0;
}
</style>
