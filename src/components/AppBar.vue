<template>
  <v-app-bar app dense dark flat color="black" class="app-bar">
    <v-col offset="5" cols="2">
      <v-toolbar-title class="title">
        {{ title }}
      </v-toolbar-title>
    </v-col>

    <v-spacer></v-spacer>

    <v-col cols="1" class="ma-0 pa-0">
      <v-btn
        id="btn-inventory"
        icon
        @click.stop="setShowInventory(!showInventory)"
      >
        <v-icon color="blue">mdi-treasure-chest</v-icon>
      </v-btn>
    </v-col>

    <StarshipStats />
  </v-app-bar>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import StarshipStats from "@/components/StarshipStats";

export default {
  name: "AppBar",
  components: {
    StarshipStats,
  },
  computed: {
    ...mapState(["currentGalaxy", "showInventory"]),
    title() {
      return this.currentGalaxy?.name || "cryptoverse";
    },
  },
  methods: {
    ...mapMutations(["setShowInventory"]),
  },
};
</script>

<style>
</style>