<template>
  <v-col cols="2">
    <v-row no-gutters class="starship-stats">
      <v-col cols="12">
        velocity
        <!-- ({{coords.x}},{{coords.y}}) -->
      </v-col>
      <v-col cols="6" class="velocity-container">
        <v-row v-if="starship" no-gutters>
          <v-col
            v-for="i in starship.maxSpeed"
            :key="i"
            :cols="12 / starship.maxSpeed"
            class="velocity-bar"
          >
            <v-progress-linear
              v-show="velocityBars[i - 1]"
              height="15"
              :color="`orange ${i > 1 && 'lighten-' + i}`"
              :value="velocityBars[i - 1]"
              background-color="transparent"
            ></v-progress-linear>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="3" class="ml-1"> %{{ velocityPct }} </v-col>
    </v-row>
  </v-col>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "StarshipStats",
  computed: {
    ...mapState(["starship"]),
    coords() {
      return {
        x: parseInt(this.starship?.position.x),
        y: parseInt(this.starship?.position.y),
      };
    },
    velocityBars() {
      const fullBars = this.starship ? parseInt(this.starship?.speed) : 0;
      const remPct = parseInt((this.starship?.speed % 1).toFixed(2) * 100);
      const bars = [...Array(fullBars).fill(100)];
      if (remPct > 0) {
        bars.push(remPct);
      }
      return bars;
    },
    velocityPct() {
      return this.starship
        ? parseInt(
            ((this.starship?.speed).toFixed(2) * 100) / this.starship?.maxSpeed
          )
        : 0;
    },
  },
};
</script>
