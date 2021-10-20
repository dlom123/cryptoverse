<template>
  <div class="main-container fill-height ma-0 pa-0">
    <AppBar />
    <Cryptoverse />
  </div>
</template>

<script>
import AppBar from "@/components/AppBar";
import Cryptoverse from "@/components/Cryptoverse";

export default {
  name: "Home",
  components: {
    AppBar,
    Cryptoverse,
  },
};
</script>
