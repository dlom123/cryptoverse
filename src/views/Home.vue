<template>
  <v-container fluid class="main-container pa-0 ma-0 fill-height">
    <v-row no-gutters class="fill-height">
      <Cryptoverse />
    </v-row>
  </v-container>
</template>

<script>
import Cryptoverse from "@/components/Cryptoverse";

export default {
  name: "Home",
  components: {
    Cryptoverse,
  },
};
</script>
