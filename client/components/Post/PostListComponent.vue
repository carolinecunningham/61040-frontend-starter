<script setup lang="ts">
import CreatePostForm from "@/components/Post/CreatePostForm.vue";
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

import { useLabelStore } from "../../stores/label";
const { labels } = storeToRefs(useLabelStore());
const { getLabels } = useLabelStore();
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let userPosts = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let filterLabel = ref("");

async function getFeedPosts(label?: string) {
  let query: Record<string, string> = label !== undefined ? { label } : {};
  console.log(label);
  let postResults;
  try {
    postResults = await fetchy("/api/feed", "GET", { query });
  } catch (_) {
    return;
  }
  console.log(postResults);
  posts.value = postResults;
}

async function getUsersPosts() {
  const author = currentUsername.value;
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let postResults;
  try {
    postResults = await fetchy("/api/posts", "GET", { query });
  } catch (_) {
    return;
  }
  userPosts.value = postResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

async function onChange() {
  await getFeedPosts(filterLabel.value);
}

onBeforeMount(async () => {
  await getFeedPosts();
  await getUsersPosts();
  await getLabels();
  loaded.value = true;
});
</script>

<template>
  <!-- {{ posts }} -->
  <!-- {{ userPosts }} -->

  <section v-if="isLoggedIn">
    <h2>Create a post:</h2>
    <CreatePostForm @refreshPosts="getUsersPosts" />
  </section>

  <h2>Your Posts</h2>
  <section class="posts" v-if="loaded && userPosts.length !== 0">
    <article v-for="userPost in userPosts" :key="userPost._id">
      <PostComponent v-if="editing !== userPost._id" :post="userPost" @refreshPosts="getUsersPosts" @editPost="updateEditing" />
      <EditPostForm v-else :post="userPost" @refreshPosts="getUsersPosts" @editPost="updateEditing" />
    </article>
  </section>
  <p v-else-if="loaded" class="center">Create a post and you can see it here!</p>
  <p v-else>Loading...</p>

  <h2>Friends' Posts</h2>
  <div class="row">
    <!-- {{ labels }} -->
    <!-- referenced https://stackoverflow.com/questions/43461752/how-to-render-array-to-select-option-vue-js -->
    <!-- referenced https://stackoverflow.com/questions/50982408/vue-js-get-selected-option-on-change -->
    <!-- referenced https://stackoverflow.com/questions/73399884/how-to-pass-the-key-as-select-option-value-from-v-for-when-changed-vuejs -->
    <legend>Select MyLifeList to Filter On</legend>
    <select v-model="filterLabel" @change="onChange()">
      <option id="filterLabel"></option>
      <option id="filterLabel" v-for="label in labels" :key="label._id" :value="label._id">{{ label.name }}</option>
    </select>
  </div>

  <section class="posts" v-if="loaded && posts.length !== 0">
    <article v-for="post in posts" :key="post._id">
      <PostComponent v-if="editing !== post._id" :post="post" @refreshPosts="getFeedPosts" @editPost="updateEditing" />
    </article>
  </section>
  <p class="center" v-else-if="loaded">No posts found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p {
  font-family: "Verdana";
}
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
  font-family: "Verdana";
}

.center {
  text-align: center;
}

.option {
  font-family: "Verdana";
}

.posts {
  padding: 1em;
}

legend {
  margin-left: 650px;
  font-family: "Verdana";
  text-align: left;
  justify-content: space-between;
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
