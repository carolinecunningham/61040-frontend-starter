<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

import { storeToRefs } from "pinia";

import { useLabelStore } from "../../stores/label";
const { labels } = storeToRefs(useLabelStore());
const { getLabels } = useLabelStore();

const content = ref("");
const prompt = ref();
const audienceLabel = ref();

const emit = defineEmits(["refreshPosts"]);

const createPost = async (content: string, prompt: number, audienceLabel?: string) => {
  let body;
  if (audienceLabel) {
    body = { content, prompt, audienceLabel };
  } else {
    body = { content, prompt };
  }
  try {
    await fetchy("/api/posts", "POST", {
      body: body,
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
  <form @submit.prevent="createPost(content, prompt, audienceLabel)">
    <label for="content">Post Contents:</label>
    <textarea id="content" v-model="content" placeholder="Create a post!" required> </textarea>
    <label for="prompt">Post Category:</label>
    <select v-model="prompt">
      <option id="prompt" value="0">Celebration</option>
      <option id="prompt" value="1">Life Update</option>
      <option id="prompt" value="2">Other</option>
    </select>
    <label for="audienceLabel">Post Audience:</label>
    <select v-model="audienceLabel">
      <option id="audienceLabel"></option>
      <option id="audienceLabel" v-for="label in labels" :key="label._id" :value="label._id">{{ label.name }}</option>
    </select>
    <button type="submit" class="pure-button-primary pure-button">Create Post</button>
  </form>
</template>

<style scoped>
form {
  background-color: #f7f0f5;
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

label {
  font-family: "Verdana";
}

button {
  font-family: "Verdana";
  background-color: #7fb285;
}

textarea {
  font-family: "Verdana";
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
