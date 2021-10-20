<template>
    <v-app-bar
      app
      dense
      dark
      flat
      color="black"
      class="app-bar"
    >
        <v-col offset="5" cols="2">
            <v-toolbar-title class="title">
                {{title}}
            </v-toolbar-title>
        </v-col>
        
        <v-spacer></v-spacer>

        <v-col cols="1" class="ma-0 pa-0">
            <v-btn icon>
                <v-icon color="blue">mdi-treasure-chest</v-icon>
            </v-btn>
        </v-col>

        <RocketStats />
    </v-app-bar>
</template>

<script>
import { mapState } from 'vuex'
import RocketStats from "@/components/RocketStats";

export default {
    name: "AppBar",
    components: {
        RocketStats
    },
    computed: {
        ...mapState(['currentGalaxy']),
        title() {
          return this.currentGalaxy?.name || 'cryptoverse'
        }
    }
}
</script>

<style>

</style>