<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername } = storeToRefs(useUserStore());
</script>
<template>
  <main>
    <h1>Welcome {{ currentUsername }}</h1>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
