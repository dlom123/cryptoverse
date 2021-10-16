<template>
  <v-container
    fluid
    :class="['main-container', 'pa-0', 'ma-0', 'fill-height', viewClass]"
  >
    <v-row no-gutters class="fill-height">
      <v-col id="cryptoverse" class="ma-0 pa-0">
        <canvas ref="bg-canvas" class="canvas">
          <!-- the canvas used for the non-interactive backdrop (bottom-most) -->
          HTML5 Canvas is not supported in your browser.
        </canvas>
        <canvas ref="animation-canvas" class="canvas">
          <!-- the canvas used for animations -->
        </canvas>
        <canvas ref="user-canvas" class="canvas">
          <!-- the canvas used for user interactions (top-most) -->
        </canvas>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import store from "@/store";
import { Galaxy, Rocket, System } from "@/entities";
import allGalaxies from "@/data/galaxies.json";
import allCryptoids from "@/data/cryptoids.json";

export default {
  name: "Canvas",
  data() {
    return {
      isMouseOverCryptoid: false,
      isMouseOverGalaxy: false,
      provider: {
        context: null,
      },
      mouseIsOver: {
        // Object containing everything the mouse is currently over
        cryptoids: [],
        galaxies: [],
      },
      rocket: null,
      unsubscribe: null,
    };
  },
  computed: {
    ...mapState(["currentGalaxy", "galaxies"]),
    canvasHeight() {
      return this.$refs["bg-canvas"].parentElement.clientHeight;
    },
    canvasWidth() {
      return this.$refs["bg-canvas"].parentElement.clientWidth;
    },
    viewClass() {
      return {
        cryptoverse: !this.currentGalaxy,
        galaxy: this.currentGalaxy,
      };
    },
  },
  methods: {
    ...mapMutations(["setGalaxies", "setShowCryptoidDetail"]),
    createCryptoverse() {
      /* Creates and populates the entire Cryptoverse. */

      // Clear away any background items
      const ctxBg = this.provider.bgContext;
      ctxBg.clearRect(0, 0, ctxBg.canvas.width, ctxBg.canvas.height);

      this.plotGalaxies();
    },
    createGalaxy() {
      /* Creates and populates the current galaxy. */

      // Clear away any background items
      const ctxBg = this.provider.bgContext;
      ctxBg.clearRect(0, 0, ctxBg.canvas.width, ctxBg.canvas.height);

      // Collect the cryptoids that belong to this system
      const galaxyCryptoids = allCryptoids.filter(
        (c) => c.galaxyId === this.currentGalaxy.id
      );

      // Draw the galaxy's system
      const system = new System(
        {
          animation: this.provider.animationContext,
          bg: this.provider.bgContext,
          user: this.provider.userContext,
        },
        this.currentGalaxy.id,
        this.currentGalaxy.name,
        this.currentGalaxy.repCoin,
        galaxyCryptoids
      );
      system.generate();

      // this.plotCryptoids();
    },
    handleSceneChange(galaxy) {
      /* Changes scenes. */

      if (!galaxy) {
        // Show the entire cryptoverse
        this.createCryptoverse();
      } else {
        // Show the galaxy view
        this.createGalaxy();
      }
    },
    onClickCanvas(e) {
      const ctxUser = this.provider.userContext;
      // Find out which cryptoids were clicked
      const clickedCryptoids = this.cryptoids.filter((cryptoid) =>
        ctxUser.isPointInPath(cryptoid.targetArea, e.pageX, e.pageY)
      );
      const clickedCryptoid = clickedCryptoids.pop();
      if (clickedCryptoid) {
        if (clickedCryptoids.length > 0) {
          // Overlapping cryptoids were clicked.
          console.log("Leeloo Dallas multi-click!", clickedCryptoids);
        } else {
          // A single cryptoid was clicked. Display its details.
          this.setShowCryptoidDetail(clickedCryptoid);
        }
      }
    },
    onMouseMoveCanvas(e) {
      const ctxUser = this.provider.userContext;

      if (this.currentGalaxy) {
        // Is the mouse over any of the cryptoids?
        const previousMouseOverCryptoids = this.mouseIsOver.cryptoids; // Store the previous mouseover to use in mouseout
        this.mouseIsOver.cryptoids = this.cryptoids.filter((cryptoid) =>
          ctxUser.isPointInPath(cryptoid.targetArea, e.pageX, e.pageY)
        );
        if (this.mouseIsOver.cryptoids.length && !this.isMouseOverCryptoid) {
          this.isMouseOverCryptoid = true;
          this.mouseIsOver.cryptoids.forEach((cryptoid) => {
            cryptoid.handleMouseOver();
          });
        } else if (
          !this.mouseIsOver.cryptoids.length &&
          this.isMouseOverCryptoid
        ) {
          this.isMouseOverCryptoid = false;
          previousMouseOverCryptoids.forEach((cryptoid) => {
            cryptoid.handleMouseOut();
          });
        }
      }

      // Is the mouse over any of the galaxies?
      const previousMouseOverGalaxies = this.mouseIsOver.galaxies; // Store the previous mouseover to use in mouseout
      this.mouseIsOver.galaxies = this.galaxies.filter((galaxy) => {
        if (galaxy.path) {
          // Make sure the galaxy has fully loaded its path
          return ctxUser.isPointInPath(galaxy.path, e.pageX, e.pageY);
        }
      });
      if (this.mouseIsOver.galaxies.length && !this.isMouseOverGalaxy) {
        this.isMouseOverGalaxy = true;
        this.mouseIsOver.galaxies.forEach((galaxy) => {
          galaxy.handleMouseOver();
        });
      } else if (!this.mouseIsOver.galaxies.length && this.isMouseOverGalaxy) {
        this.isMouseOverGalaxy = false;
        previousMouseOverGalaxies.forEach((galaxy) => {
          galaxy.handleMouseOut();
        });
      }
    },
    plotGalaxies() {
      /* Places each galaxy in its position within the cryptoverse. */

      const galaxies = [];
      // Create the bounding area for each galaxy
      allGalaxies.forEach((g) => {
        const galaxy = new Galaxy(
          g.id,
          g.name,
          g.coords, // center of galaxy
          g.width,
          g.height,
          g.repCoin,
          this.provider.bgContext,
          this.provider.userContext
        );
        galaxy.generate();

        // Build an array of galaxy objects
        galaxies.push(galaxy);
      });

      this.setGalaxies(galaxies);
    },
  },
  provide() {
    return {
      provider: this.provider,
    };
  },
  mounted() {
    // Attach each canvas context to Vue provider for easy use in other components
    this.provider.bgContext = this.$refs["bg-canvas"].getContext("2d");
    this.provider.animationContext =
      this.$refs["animation-canvas"].getContext("2d");
    this.provider.userContext = this.$refs["user-canvas"].getContext("2d");

    // Set dimensions of each canvas
    ["bg-canvas", "animation-canvas", "user-canvas"].forEach((c) => {
      this.$refs[c].width = this.canvasWidth;
      this.$refs[c].height = this.canvasHeight;
    });

    // Draw the Cryptoverse!
    this.createCryptoverse();

    // Register event handlers
    this.provider.userContext.canvas.addEventListener(
      "click",
      this.onClickCanvas
    );
    this.provider.userContext.canvas.addEventListener(
      "mousemove",
      this.onMouseMoveCanvas
    );

    // Prep the Rocket!
    const animationContext = this.provider.animationContext;
    this.rocket = new Rocket(
      animationContext,
      animationContext.canvas.width / 2,
      animationContext.canvas.height / 2
    );
    this.rocket.spawn(); // Hello, rocket!

    // Subscribe to state mutations
    this.unsubscribe = store.subscribe((mutation, state) => {
      if (mutation.type === "setCurrentGalaxy") {
        // Handle scene changes when the current galaxy is changed
        this.handleSceneChange(mutation.payload); // Pass along the current galaxy, if any
      }
    });
  },
  beforeDestroy() {
    this.provider.userContext.canvas.removeEventListener(
      "click",
      this.onClickCanvas
    );
    this.provider.userContext.canvas.removeEventListener(
      "mousemove",
      this.onMouseMoveCanvas
    );
    this.rocket.destroy();

    // Unsubscribe from mutations
    this.unsubscribe();
  },
};
</script>
