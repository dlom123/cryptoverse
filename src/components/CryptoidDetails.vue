<template>
  <v-fade-transition>
    <v-dialog
      width="500"
      overlay-color="blue"
      :value="showCryptoidDetail"
      @click:outside="closeDialog"
      @keydown="closeDialog"
    >
      <v-card v-if="showCryptoidDetail" class="mx-auto">
        <v-img :src="bgImg" max-height="160">
          <v-card-title>
            <v-container>
              <v-row>
                <v-col cols="12" align="center" class="pa-0">
                  <v-avatar size="128">
                    <v-img
                      :src="showCryptoidDetail.img.src"
                      class="img-cryptoid"
                    ></v-img>
                  </v-avatar>
                </v-col>
              </v-row>
            </v-container>
          </v-card-title>
        </v-img>
        <v-card-text class="pt-4">
          <v-row no-gutters>
            <v-col cols="12">
              <h1>{{ toTitleCase(showCryptoidDetail.name) }}</h1>
            </v-col>
            <v-col cols="12">
              {{ showCryptoidDetail.symbol }}
            </v-col>
          </v-row>
          <!-- <v-row no-gutters class="mt-4">
            <v-col cols="12"> x: {{ showCryptoidDetail.coords.x }} </v-col>
            <v-col cols="12"> y: {{ showCryptoidDetail.coords.y }} </v-col>
          </v-row> -->
        </v-card-text>
        <!-- <v-card-actions>
          <v-btn
            color="orange lighten-2"
            text
          >
            Explore
          </v-btn>

          <v-spacer></v-spacer>

          <v-btn
            icon
            @click="show = !show"
          >
            <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          </v-btn>
        </v-card-actions> -->
      </v-card>
    </v-dialog>
  </v-fade-transition>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  name: "CryptoidDetails",
  computed: {
    ...mapState(["showCryptoidDetail"]),
    bgImg() {
      return require.context("../assets/images/", false, /.png$/)("./bg.png");
    },
  },
  methods: {
    ...mapMutations(["setShowCryptoidDetail"]),
    closeDialog(e) {
      // Close if the escape key was pressed or the mouse was clicked outside of the dialog
      (e.keyCode === 27 || !e.keyCode) && this.setShowCryptoidDetail(null);
    },
    toTitleCase(str) {
      const acronyms = ["usd", "xrp"];
      return str
        .replace("-", " ")
        .split(" ")
        .map((word) =>
          acronyms.includes(word.toLowerCase())
            ? word.toUpperCase()
            : word[0].toUpperCase() + word.substr(1)
        )
        .join(" ");
    },
  },
};
</script>
