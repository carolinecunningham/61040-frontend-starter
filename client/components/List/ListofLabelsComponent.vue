<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

import CreateLabelForm from "./CreateLabelForm.vue";
import MyLabelComponent from "./MyLabelComponent.vue";
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let labels = ref<Array<Record<string, string>>>([]);
let editing = ref("");

async function getLabels() {
  let labelResults;
  try {
    labelResults = await fetchy("/api/lists", "GET");
  } catch (_) {
    return;
  }
  labels.value = labelResults;
}

function updateEditing(id: string) {
  editing.value = id;
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
  <!-- {{ labels }} -->
  <section class="labels" v-if="loaded && labels.length !== 0">
    <article v-for="l in labels" :key="l._id">
      <!-- {{ l }} -->
      <MyLabelComponent v-if="editing !== l._id" :label="l" @refreshLabels="getLabels" @editPost="updateEditing" />
      <!-- <EditPostForm v-else :post="userPost" @refreshLabels="getLabels" @editPost="updateEditing" /> -->
    </article>
  </section>
  <p v-else-if="loaded">No labels found. Create a labels and you can see it here!</p>
  <p v-else>Loading...</p>

  <!-- <h2>Feed</h2>
  <div class="row">
    <h2 v-if="!searchAuthor">Posts:</h2>
    <h2 v-else>Posts by {{ searchAuthor }}:</h2>
    <SearchPostForm @getPostsByAuthor="getPosts" />
  </div>

  <section class="posts" v-if="loaded && posts.length !== 0">
    <article v-for="post in posts" :key="post._id">
      <MyLabelComponent v-if="editing !== post._id" :post="post" @refreshLabels="getLabels" @editPost="updateEditing" />
    </article>
  </section>
  <p v-else-if="loaded">No posts found</p>
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
}
</style>
