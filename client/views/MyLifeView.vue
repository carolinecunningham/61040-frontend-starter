<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import ListofLabelsComponent from "../components/List/ListofLabelsComponent.vue";

const { isLoggedIn, currentUsername } = storeToRefs(useUserStore());
</script>
<template>
  <main>
    <section>
      <h1 v-if="isLoggedIn">Your MyLifeLists</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <ListofLabelsComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
  font-family: "Verdana";
}
</style>
