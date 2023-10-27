import { defineStore } from "pinia";
import { ref } from "vue";

import { fetchy } from "@/utils/fetchy";

export const useLabelStore = defineStore(
  "label",
  () => {
    const labels = ref<Array<Record<string, string>>>([]);

    const getLabels = async () => {
      try {
        labels.value = await fetchy("/api/lists", "GET");
      } catch {
        labels.value;
      }
    };

    return {
      labels,
      getLabels,
    };
  },
  { persist: true },
);
