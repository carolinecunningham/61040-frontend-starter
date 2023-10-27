<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <template v-if="isLoggedIn">
      <h1>Your Feed</h1>
      <PostListComponent />
    </template>
    <template v-else>
      <p class="center">Keeping in touch with people you care about -- it's easier with MyLife. To get started, please click "login" to register or log back in.</p>
    </template>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

.center {
  text-align: center;
}
</style>
