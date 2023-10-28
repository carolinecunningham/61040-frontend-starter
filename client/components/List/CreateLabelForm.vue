<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const labelName = ref("");
const prompt = ref();
const emit = defineEmits(["refreshLabels"]);

const createLabel = async (name: string) => {
  try {
    await fetchy("api/lists", "POST", {
      body: { name },
    });
  } catch (_) {
    return;
  }
  emit("refreshLabels");
  emptyForm();
};

const emptyForm = () => {
  labelName.value = "";
};
</script>

<template>
  <form @submit.prevent="createLabel(labelName)">
    <label for="labelName">MyLifeList Name:</label>
    <textarea id="content" v-model="labelName" placeholder="Enter name of new list!" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button-small">Create MyLifeList</button>
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

textarea {
  font-family: "Verdana";
  font-size: inherit;
  height: 1em;
  padding: 0.5em;
  border-radius: 2px;
  resize: none;
}

button {
  background-color: #7fb285;
  font-family: "Verdana";
}
</style>
