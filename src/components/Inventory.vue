<template>
  <v-overlay
    absolute
    opacity="0.7"
    :value="showInventory"
    @keypress.esc="hideInventory"
  >
    <v-container fluid class="inventory">
      <v-row>
        <v-col>
          <v-card min-width="500" max-width="500" class="card">
            <v-card-title class="title pt-2 pb-0 pl-3"
              >Items ({{ inventory.items.length }})</v-card-title
            >

            <v-row class="pa-4">
              <v-col
                v-for="(item, i) in inventory.items"
                :key="i"
                cols="2"
                class="ma-2"
              >
                <div class="d-flex">
                  <v-img max-width="60" max-height="60" :src="item.src" />
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <v-col>
          <v-card min-width="275" max-width="275" class="card">
            <v-card-title class="title pt-2 pb-0 pl-3">Ship</v-card-title>

            <v-row class="pa-4" justify="center">
              <v-col cols="auto" align="center" class="pb-2">
                <div v-if="rocket && rocket.img">
                  <v-img
                    :max-width="rocket.width"
                    :max-height="rocket.height"
                    :src="rocket.img.src"
                  />
                  <div class="mt-4">{{ rocket.type }}</div>
                </div>
              </v-col>
            </v-row>

            <v-divider color="grey"></v-divider>

            <v-row no-gutters class="pa-4 pt-0 mt-3" align="center">
              <v-col cols="5" align="end" class="pr-2"> thrust </v-col>
              <v-col cols="7">
                <v-progress-linear height="10"></v-progress-linear>
              </v-col>
              <v-col cols="5" align="end" class="pr-2"> steering </v-col>
              <v-col cols="7">
                <v-progress-linear height="10"></v-progress-linear>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card min-width="600" max-width="800" class="card">
            <v-card-title class="title pt-2 pb-0 pl-3"
              >Worlds ({{ inventory.worlds.length }}/{{
                totalCryptoids
              }})</v-card-title
            >

            <v-row class="pa-4">
              <v-col cols="12" class="worlds">
                <div class="d-flex">
                  <v-img
                    v-for="(world, i) in inventory.worlds"
                    :key="i"
                    max-width="100"
                    max-height="100"
                    :src="world.src"
                    class="mr-4 img-cryptoid rounded-circle"
                  />
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-overlay>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  name: "Inventory",
  computed: {
    ...mapState(["inventory", "rocket", "showInventory", "totalCryptoids"]),
  },
  methods: {
    ...mapMutations(["setShowInventory"]),
    hideInventory() {
      this.setShowInventory(false);
    },
  },
};
</script>
