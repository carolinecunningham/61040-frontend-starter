<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import ListofLabelsComponent from "../components/List/ListofLabelsComponent.vue";

const { isLoggedIn, currentUsername } = storeToRefs(useUserStore());
</script>
<template>
  <main>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <h1>Your Friends</h1>
    <ListofLabelsComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
