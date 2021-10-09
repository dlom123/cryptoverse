<template>
  <v-col id="cryptoverse" class="ma-0 pa-0">
    <canvas ref="bg-canvas" class="canvas">
      <!-- the canvas used for user interactions (top-most) -->
      HTML5 Canvas is not supported in your browser.
    </canvas>
    <canvas ref="animation-canvas" class="canvas"> </canvas>
    <canvas ref="user-canvas" class="canvas"></canvas>

    <CryptoidDetails :cryptoid="showCryptoidDetail" />
  </v-col>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import CryptoidDetails from "./CryptoidDetails";
import { Galaxy, Rocket } from "@/entities";
import { getRandomNumber } from "@/functions/helpers";

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
      provider: {
        context: null,
      },
      mouseOverGalaxy: null,
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
    cryptoidFiles() {
      // point require() context to cryptoids image directory
      return require.context("../assets/images/cryptoids", false, /.png$/);
    },
  },
  methods: {
    ...mapMutations(["setShowCryptoidDetail"]),
    createCryptoverse() {
      /* Create and populate the entire Cryptoverse */
      this.plotGalaxies();
      // this.loadCryptoids(); // TODO: do this in the background
    },
    drawCryptoid(img) {
      /* Draws a Cryptoid within the bounds of the Cryptoverse. */

      const ctx = this.provider.bgContext;
      const radius = getRandomNumber(5, 64);

      // make sure cryptoid is not partially outside of canvas bounds
      const x = getRandomNumber(radius, this.canvasWidth - radius * 2);
      const y = getRandomNumber(radius, this.canvasHeight - radius * 2);
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
            targetArea: border,
          });
        };
      });
    },
    onClickCanvas(e) {
      const ctx = this.provider.bgContext;
      // Find out which cryptoids were clicked
      const clickedCryptoids = this.cryptoids.filter((cryptoid) =>
        ctx.isPointInPath(cryptoid.targetArea, e.pageX, e.pageY)
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
      const ctx = this.provider.bgContext;
      const ctxUser = this.provider.userContext;
      // Is the mouse over any of the cryptoids?
      const mouseOverCryptoids = this.cryptoids.filter((cryptoid) =>
        ctxUser.isPointInPath(cryptoid.targetArea, e.pageX, e.pageY)
      );
      const mouseOverGalaxy = this.galaxies.filter((galaxy) => {
        console.log("mouse galaxy");
        return ctx.isPointInPath(galaxy.targetArea, e.pageX, e.pageY);
      });
      if (mouseOverCryptoids.length) {
        // this.$refs["bg-canvas"].style.cursor = "pointer";
        // ctxUser.fillStyle = "white";
        // mouseOverCryptoids.forEach((c) => {
        //   const fontSize = Math.max(c.radius / 2, 12);
        //   ctxUser.font = `${fontSize}px sans-serif`;
        //   ctxUser.textAlign = "center";
        //   ctxUser.fillText(c.name, c.x, c.y + c.radius + fontSize);
        // });
      }
      if (mouseOverGalaxy.length) {
        mouseOverGalaxy.forEach((g) => {
          // Draw the dashed line bounding rect for the galaxy
          const leftX = g.coords.x - g.width / 2;
          const topY = g.coords.y - g.height / 2;
          const bottomY = g.coords.y + g.height / 2;
          const bottomYPadding = -5;
          ctxUser.save();
          ctxUser.strokeStyle = "rgba(173, 216, 230, 0.7)";
          ctxUser.setLineDash([4, 2]);
          ctxUser.lineDashOffset = 2;
          ctxUser.strokeRect(leftX, topY, g.width, g.height);
          // Draw the galaxy name as text
          ctxUser.fillStyle = "red";
          ctxUser.font = "32px sans-serif";
          ctxUser.textBaseline = "bottom";
          const textMetrics = ctxUser.measureText(g.name); // get text measurements for centering within galaxy
          const textOffsetX = (g.width - textMetrics.width) / 2;
          ctxUser.fillText(
            g.name,
            leftX + textOffsetX,
            bottomY + bottomYPadding
          );
          ctxUser.restore();
        });
      } else {
        this.$refs["bg-canvas"].style.cursor = "default";
        ctxUser.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      }
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
