<script setup lang="ts">
import FriendListComponent from "@/components/Friend/FriendListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import RecommendedUsersComponent from "../components/Friend/RecommendedUsersComponent.vue";
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <h1>Your Friends</h1>
    <FriendListComponent />
    <h1>Recommended Friends</h1>
    <RecommendedUsersComponent />
    <!-- Insert Recommended Users Here -->
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
