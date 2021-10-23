<template>
  <div class="main-container fill-height ma-0 pa-0">
    <AppBar />
    <Cryptoverse />
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import AppBar from "@/components/AppBar";
import Cryptoverse from "@/components/Cryptoverse";

export default {
  name: "Home",
  components: {
    AppBar,
    Cryptoverse,
  },
  computed: {
    ...mapState(["showInventory"]),
  },
  methods: {
    ...mapMutations(["setShowInventory"]),
    handleGlobalKeyboard(e) {
      if (e.keyCode === 27 && this.showInventory) {
        // Escape was pressed and inventory is showing -- close inventory
        this.setShowInventory(false);
      } else if (e.keyCode === 73) {
        // "i" key was pressed -- toggle inventory
        this.setShowInventory(!this.showInventory);
      }
    },
  },
  mounted() {
    window.addEventListener("keydown", this.handleGlobalKeyboard);
  },
};
</script>
