<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const loaded = ref(false);
const request_username = ref("");

const { currentUsername } = storeToRefs(useUserStore());

let friends = ref<Array<Record<string, string>>>([]);
let requests = ref<Array<Record<string, string>>>([]);
let sentRequests = ref<Array<Record<string, string>>>([]);
let incomingRequests = ref<Array<Record<string, string>>>([]);

const emit = defineEmits(["recommendedUsersUpdate"]);

async function getFriends() {
  let friendResults;
  try {
    friendResults = await fetchy("/api/friends/objects", "GET");
  } catch (_) {
    return;
  }
  friends.value = friendResults;
}

async function getRequests() {
  let queriedRequests;
  try {
    const query = "/api/friends/requests";
    queriedRequests = await fetchy(query, "GET");
    console.log(queriedRequests);
  } catch (_) {
    return;
  }
  requests.value = queriedRequests;
  sentRequests.value = queriedRequests.filter((key: any) => key.from === currentUsername.value);
  incomingRequests.value = queriedRequests.filter((key: any) => key.to === currentUsername.value);
  emit("recommendedUsersUpdate");
}

async function sendRequest(username: string) {
  try {
    await fetchy(`/api/friends/requests/${username}`, "POST");
  } catch (_) {
    return;
  }
  await getRequests();
}

const removeFriend = async (friend: string) => {
  // parameter not query
  // query --> searching for something, GET, filtering
  // parameter: going to specific page (signified by colon)
  // body: passed in as JSON to request, avoid overloaded URL
  try {
    await fetchy(`/api/friends/${friend}`, "DELETE");
  } catch {
    return;
  }
  await getFriends();
};

const rejectRequest = async (friendName: string) => {
  try {
    await fetchy(`/api/friends/reject/${friendName}`, "PUT");
  } catch {
    return;
  }
  await getRequests();
};

const acceptRequest = async (friendName: string) => {
  try {
    await fetchy(`/api/friends/accept/${friendName}`, "PUT");
  } catch {
    return;
  }
  await getRequests();
  await getFriends();
};

const removeSentRequest = async (friendName: string) => {
  try {
    await fetchy(`/api/friends/requests/${friendName}`, "DELETE");
  } catch {
    return;
  }
  await getRequests();
};

onBeforeMount(async () => {
  await getFriends();
  await getRequests();
  loaded.value = true;
});
</script>

<template>
  <h2>Friends</h2>
  <section class="friends" v-if="loaded && Object.keys(friends).length !== 0">
    <menu v-for="f in Object.keys(friends)" :key="f">
      <p :f="friends" @refreshFriends="getFriends">{{ f }}</p>
      <li><button class="pure-button btn-small pure-button-primary" @click="removeFriend(f)">Remove Friend</button></li>
    </menu>
  </section>
  <p v-else-if="loaded">You currently have no friends</p>
  <p v-else>Loading...</p>

  <h2>Incoming Requests</h2>
  <section v-if="loaded && incomingRequests[0] !== undefined">
    <menu v-for="r in Object.values(incomingRequests)" :key="r.from">
      <p r="requests" @refreshFriends="getRequests">{{ r.from }}</p>
      <li><button class="pure-button btn-small pure-button-primary" @click="acceptRequest(r.from)">Accept Request</button></li>
      <li><button class="pure-button btn-small pure-button-primary" @click="rejectRequest(r.from)">Reject Request</button></li>
    </menu>
  </section>
  <p v-else-if="loaded">No pending friend requests found.</p>
  <p v-else>Loading...</p>

  <h2>Sent Requests</h2>
  <section v-if="loaded && sentRequests[0] !== undefined">
    <menu v-for="r in Object.values(sentRequests)" :key="r.to">
      <p r="requests" @refreshFriends="getRequests">{{ r.to }}</p>
      <li><button class="pure-button btn-small pure-button-primary" @click="removeSentRequest(r.to)">Remove Request</button></li>
    </menu>
  </section>
  <p v-else-if="loaded">No pending friend requests found.</p>
  <p v-else>Loading...</p>

  <h2>Request Friend</h2>
  <div class="center">
    <form @submit.prevent="sendRequest(request_username)">
      <textarea id="username" v-model="request_username" instruction="Enter Username" required> </textarea>
      <button class="pure-button btn-small pure-button-primary">Send Friend Request</button>
    </form>
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
.center {
  text-align: center;
  display: flex;
  align-items: center;
}
</style>
