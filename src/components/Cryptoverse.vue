<template>
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

    <CryptoidDetails :cryptoid="showCryptoidDetail" />
  </v-col>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import CryptoidDetails from "@/components/CryptoidDetails";
import { Cryptoid, Galaxy, Rocket } from "@/entities";

export default {
  name: "Canvas",
  props: ["coins", "allGalaxies"],
  components: {
    CryptoidDetails,
  },
  data() {
    return {
      cryptoids: [],
      galaxies: [],
      isMouseOverCryptoid: false,
      provider: {
        context: null,
      },
      mouseIsOver: {
        // Object containing everything the mouse is currently over
        cryptoids: [],
        galaxies: [],
      },
      rocket: null,
    };
  },
  computed: {
    ...mapState(["showCryptoidDetail"]),
    canvasHeight() {
      return this.$refs["bg-canvas"].parentElement.clientHeight;
    },
    canvasWidth() {
      return this.$refs["bg-canvas"].parentElement.clientWidth;
    },
  },
  methods: {
    ...mapMutations(["setShowCryptoidDetail"]),
    createCryptoverse() {
      /* Create and populate the entire Cryptoverse */
      this.plotGalaxies();
      // this.loadCryptoids();
    },
    loadCryptoids() {
      this.coins.forEach((coin) => {
        const cryptoid = new Cryptoid(
          this.provider.bgContext,
          this.provider.userContext,
          coin
        );
        cryptoid.load();

        // Maintain an array of all existing cryptoids
        this.cryptoids.push(cryptoid);
      });
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
      const ctxBg = this.provider.bgContext;
      const ctxUser = this.provider.userContext;
      // Is the mouse over any of the cryptoids?
      const previousMouseOverCryptoids = this.mouseIsOver.cryptoids;
      this.mouseIsOver.cryptoids = this.cryptoids.filter((cryptoid) =>
        ctxUser.isPointInPath(cryptoid.targetArea, e.pageX, e.pageY)
      );
      this.mouseIsOver.galaxies = this.galaxies.filter((galaxy) => {
        return ctxBg.isPointInPath(galaxy.targetArea, e.pageX, e.pageY);
      });
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
      // if (mouseOverGalaxy.length && !this.isMouseOverGalaxy) {
      //   this.isMouseOver.push("galaxy");
      //   mouseOverGalaxy.forEach((g) => {
      //     // Draw the dashed line bounding rect for the galaxy
      //     const leftX = g.coords.x - g.width / 2;
      //     const topY = g.coords.y - g.height / 2;
      //     const bottomY = g.coords.y + g.height / 2;
      //     const bottomYPadding = -5;
      //     ctxUser.save();
      //     ctxUser.strokeStyle = "rgba(173, 216, 230, 0.7)";
      //     ctxUser.setLineDash([4, 2]);
      //     ctxUser.lineDashOffset = 2;
      //     ctxUser.strokeRect(leftX, topY, g.width, g.height);
      //     // Draw the galaxy name as text
      //     ctxUser.fillStyle = "red";
      //     ctxUser.font = "32px sans-serif";
      //     ctxUser.textBaseline = "bottom";
      //     const textMetrics = ctxUser.measureText(g.name); // get text measurements for centering within galaxy
      //     const textOffsetX = (g.width - textMetrics.width) / 2;
      //     ctxUser.fillText(
      //       g.name,
      //       leftX + textOffsetX,
      //       bottomY + bottomYPadding
      //     );
      //     ctxUser.restore();
      //   });
      // } else if (!mouseOverGalaxy.length && this.isMouseOverGalaxy) {
      //   ctxUser.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      //   this.isMouseOverGalaxy = false;
      // }
    },
    plotGalaxies() {
      // Create the bounding area for each galaxy
      this.allGalaxies.forEach((g) => {
        const galaxy = new Galaxy(
          g.name,
          g.coords,
          g.width,
          g.height,
          g.repCoin,
          this.provider.bgContext
        );
        galaxy.generate();

        // Maintain an array of all existing galaxies
        this.galaxies.push(galaxy);
      });
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
    this.$refs["user-canvas"].addEventListener("click", this.onClickCanvas);
    this.$refs["user-canvas"].addEventListener(
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
  },
  beforeDestroy() {
    this.$refs["bg-canvas"].removeEventListener("click", this.onClickCanvas);
    this.$refs["bg-canvas"].removeEventListener(
      "mousemove",
      this.onMouseMoveCanvas
    );
    this.rocket.destroy();
  },
};
</script>
