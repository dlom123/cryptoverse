<template>
  <v-col cols="2">
    <v-row no-gutters class="rocket-stats">
      <v-col cols="12">
        velocity
        <!-- ({{coords.x}},{{coords.y}}) -->
      </v-col>
      <v-col cols="6" class="velocity-container">
        <v-row v-if="rocket" no-gutters>
          <v-col
            v-for="i in rocket.maxSpeed"
            :key="i"
            :cols="12 / rocket.maxSpeed"
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
  name: "RocketStats",
  computed: {
    ...mapState(["rocket"]),
    coords() {
      return {
        x: parseInt(this.rocket?.position.x),
        y: parseInt(this.rocket?.position.y),
      };
    },
    velocityBars() {
      const fullBars = this.rocket ? parseInt(this.rocket?.speed) : 0;
      const remPct = parseInt((this.rocket?.speed % 1).toFixed(2) * 100);
      const bars = [...Array(fullBars).fill(100)];
      if (remPct > 0) {
        bars.push(remPct);
      }
      return bars;
    },
    velocityPct() {
      return this.rocket
        ? parseInt(
            ((this.rocket?.speed).toFixed(2) * 100) / this.rocket?.maxSpeed
          )
        : 0;
    },
  },
};
</script>
