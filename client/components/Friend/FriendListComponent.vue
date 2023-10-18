<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const loaded = ref(false);
let friends = ref<Array<Record<string, string>>>([]);
let requests = ref<Array<Record<string, string>>>([]);
const requestShown = ref(false);

async function getFriends() {
  let friendResults;
  try {
    friendResults = await fetchy("/api/friends/objects", "GET");
  } catch (_) {
    return;
  }
  friends.value = friendResults;
}

async function sendRequest(user: string) {
  try {
    const query = "/api/friends/requests/" + user;
    await fetchy(query, "POST");
  } catch (_) {
    return;
  }
}

async function getRequests() {
  let friendResults;
  try {
    friendResults = await fetchy("/api/friends/requests", "GET");
  } catch (_) {
    return;
  }
  console.log("VALUE");
  console.log(friendResults);
  requests.value = friendResults;
}

const removeFriend = async (friend: string) => {
  const query = { friend };
  try {
    await fetchy("/api/friends/", "DELETE", { query });
  } catch {
    return;
  }
  await getFriends();
};

const acceptRequest = async (friendName: string) => {
  try {
    await fetchy(`/api/friends/accept/${friendName}`, "PUT");
  } catch {
    return;
  }
  await getFriends();
  await getRequests();
};

// const getUserID = async (username: string) => {
//   try {
//     return await fetchy(`api/users/${username}`, "GET");
//   } catch {
//     return;
//   }
// };

// friendIds.value = await Promise.all(friends.value.map((friend) => getUserID(friend)));

onBeforeMount(async () => {
  await getFriends();
  await getRequests();
  loaded.value = true;
});
</script>

<template>
  <h2>Friends</h2>
  <section class="friends" v-if="loaded && friends.length !== 0">
    <menu v-for="(f, index) in friends" :key="f.username">
      <p :f="friends" @refreshFriends="getFriends">{{ index }}</p>
      <li><button class="button-error btn-small pure-button" @click="removeFriend(f)">Remove Friend</button></li>
      <!-- TODO: why does remove have User Not Found error -->
    </menu>
  </section>
  <p v-else-if="loaded">No friends found</p>
  <p v-else>Loading...</p>

  <h2>Incoming Requests</h2>
  <section v-if="loaded && requests.length !== 0">
    <menu v-for="(r, index) in requests" :key="r">
      <p r="requests" @refreshFriends="getRequests">{{ r.from }}</p>
      <li><button class="button-error btn-small pure-button" @click="acceptRequest(r.from)">Accept Request</button></li>
    </menu>
  </section>
  <p v-else-if="loaded">No pending friend requests found.</p>
  <p v-else>Loading...</p>

  <h2>Request Friend</h2>
  <form @submit.prevent="sendRequest(username)">
    <textarea id="username" v-model="username" instruction="Enter Username" required> </textarea>
    <button class="button-error btn-small pure-button">Send Friend Request</button>
  </form>

  <!-- <section v-if="loaded && requests.length !== 0">
    <menu v-for="(r, index) in requests" :key="r">
      <p :r="requests" @refreshFriends="getFriends">{{ f }}</p>
      <li><button class="button-error btn-small pure-button" @click="removeFriend(friendIds[index])">Remove Friend</button></li>
    </menu>
  </section>
  <p v-else-if="loaded">Sent friend requests found.</p>
  <p v-else>Loading...</p> -->
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

h2 {
  text-align: center;
}

form {
  display: flex;
  padding: 0.25em;
  margin: auto;
  align-items: center;
}
</style>
