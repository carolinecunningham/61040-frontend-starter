<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const prompt = ref();
const emit = defineEmits(["refreshPosts"]);

const createPost = async (content: string, prompt: number) => {
  try {
    await fetchy("api/posts", "POST", {
      body: { content, prompt },
    });
  } catch (_) {
    return;
  }
  emit("refreshPosts");
  emptyForm();
};

const emptyForm = () => {
  content.value = "";
  prompt.value = -1;
};
</script>

<template>
  <form @submit.prevent="createPost(content, prompt)">
    <label for="content">Post Contents:</label>
    <textarea id="content" v-model="content" placeholder="Create a post!" required> </textarea>
    <label for="prompt">Post Category:</label>
    <select v-model="prompt">
      <option id="prompt" value="0">Celebration</option>
      <option id="prompt" value="1">Life Update</option>
      <option id="prompt" value="2">Other</option>
    </select>
    <label for="audience">Post Audience:</label>
    <!-- use vif to get audience values -->
    <button type="submit" class="pure-button-primary pure-button">Create Post</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
