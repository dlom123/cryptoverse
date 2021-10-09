<template>
  <v-col class="ma-0 pa-0">
    <canvas ref="action-canvas" class="canvas">
      <!-- the canvas used for user interactions (top-most) -->
      HTML5 Canvas is not supported in your browser.
    </canvas>
    <canvas ref="animation-canvas" class="canvas"> </canvas>
    <canvas ref="cryptoverse-canvas" class="canvas"> </canvas>
    <canvas ref="hidden-canvas" class="canvas hidden"> </canvas>
    <CryptoidDetails :cryptoid="showCryptoidDetail" />
  </v-col>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import CryptoidDetails from "./CryptoidDetails";
import Rocket from "../functions/Rocket";

export default {
  name: "Canvas",
  props: ["coins"],
  components: {
    CryptoidDetails,
  },
  data() {
    return {
      cryptoids: [],
      provider: {
        context: null,
      },
      rocket: null,
    };
  },
  computed: {
    ...mapState(["showCryptoidDetail"]),
    canvasHeight() {
      return this.$refs["cryptoverse-canvas"].parentElement.clientHeight;
    },
    canvasWidth() {
      return this.$refs["cryptoverse-canvas"].parentElement.clientWidth;
    },
    cryptoidFiles() {
      // point require() context to cryptoids image directory
      return require.context("../assets/images/cryptoids", false, /.png$/);
    },
  },
  methods: {
    ...mapMutations(["setShowCryptoidDetail"]),
    createCryptoverse() {
      /* Create and populate the entire Cryptoverse */
      // this.loadCryptoids(); // TODO: do this in the background
    },
    drawCryptoid(img) {
      /* Draws a Cryptoid within the bounds of the Cryptoverse. */

      const ctx = this.provider.cryptoverseContext;
      const radius = this.getRandomNumber(5, 64);

      // make sure cryptoid is not partially outside of canvas bounds
      const x = this.getRandomNumber(radius, this.canvasWidth - radius * 2);
      const y = this.getRandomNumber(radius, this.canvasHeight - radius * 2);
      // x,y are the top-left coordinates of the image
      ctx.drawImage(img, x, y, radius * 2, radius * 2);

      ctx.save();
      // draw a circular border around the image
      ctx.strokeStyle = "rgba(173, 216, 230, 0.5)"; // lightblue
      ctx.lineWidth = 2;
      const border = new Path2D();
      const borderRadius = radius;
      border.arc(
        x + borderRadius, // x starts at the left of the image, not the center
        y + borderRadius, // y starts at the top of the image, not the center
        borderRadius,
        0,
        Math.PI * 2,
        false
      );
      ctx.stroke(border);
      ctx.restore();
      return { x, y, radius, border };
    },
    getRandomNumber(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    },
    loadCryptoids() {
      // draw a cryptoid object for each image file that exists
      this.cryptoidFiles.keys().map((filename) => {
        const img = new Image();
        img.src = this.cryptoidFiles(filename);
        img.onload = () => {
          const { border, radius, x, y } = this.drawCryptoid(img);
          const { symbol } = this.coins.find(
            (c) => c.name === filename.slice(2, -4).replace("-", " ")
          );
          this.cryptoids.push({
            name: filename.slice(2, -4),
            symbol,
            image: img,
            x: x + radius,
            y: y + radius,
            radius,
            path: border,
          });
        };
      });
    },
    onClickCanvas(e) {
      const ctx = this.provider.cryptoverseContext;
      // Find out which cryptoids were clicked
      const clickedCryptoids = this.cryptoids.filter((cryptoid) =>
        ctx.isPointInPath(cryptoid.path, e.pageX, e.pageY)
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
      const ctx = this.provider.cryptoverseContext;
      const ctxText = this.provider.actionContext;
      // Is the mouse over any of the cryptoids?
      const mouseOverCryptoids = this.cryptoids.filter((cryptoid) =>
        ctx.isPointInPath(cryptoid.path, e.pageX, e.pageY)
      );
      if (mouseOverCryptoids.length) {
        // this.$refs["cryptoverse-canvas"].style.cursor = "pointer";
        // ctxText.fillStyle = "white";
        // mouseOverCryptoids.forEach((c) => {
        //   const fontSize = Math.max(c.radius / 2, 12);
        //   ctxText.font = `${fontSize}px sans-serif`;
        //   ctxText.textAlign = "center";
        //   ctxText.fillText(c.name, c.x, c.y + c.radius + fontSize);
        // });
      }
    },
  },
  provide() {
    return {
      provider: this.provider,
    };
  },
  mounted() {
    // Attach each canvas context to Vue provider for easy use in other components
    this.provider.cryptoverseContext =
      this.$refs["cryptoverse-canvas"].getContext("2d");
    this.provider.actionContext = this.$refs["action-canvas"].getContext("2d");
    this.provider.animationContext =
      this.$refs["animation-canvas"].getContext("2d");
    this.provider.hiddenContext = this.$refs["hidden-canvas"].getContext("2d");

    // Set dimensions of each canvas
    [
      "cryptoverse-canvas",
      "action-canvas",
      "animation-canvas",
      "hidden-canvas",
    ].forEach((c) => {
      this.$refs[c].width = this.canvasWidth;
      this.$refs[c].height = this.canvasHeight;
    });

    // Draw the Cryptoverse!
    this.createCryptoverse();

    // Register event handlers
    this.$refs["cryptoverse-canvas"].addEventListener(
      "click",
      this.onClickCanvas
    );
    this.$refs["cryptoverse-canvas"].addEventListener(
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
    this.$refs["cryptoverse-canvas"].removeEventListener(
      "click",
      this.onClickCanvas
    );
    this.$refs["cryptoverse-canvas"].removeEventListener(
      "mousemove",
      this.onMouseMoveCanvas
    );
    this.rocket.destroy();
  },
};
</script>
