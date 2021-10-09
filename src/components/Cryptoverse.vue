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
      this.plotGalaxies();
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
    getImgRGBs(img) {
      const ctxHidden = this.provider.hiddenContext;
      // "Draw" the reference image
      ctxHidden.drawImage(img, 0, 0);
      // Sample pixel data from reference image
      const pixelData = Array.from(ctxHidden.getImageData(0, 0, 128, 128).data);
      let rgbs = [];
      while (pixelData.length > 0) {
        const rgba = pixelData.splice(0, 4);
        /*
              rgba[0] = red
              rgba[1] = green
              rgba[2] = blue
              rgba[3] = alpha
        */
        if (rgba.at(-1) > 178) {
          // only include colors at a reasonable opacity (>=0.7)
          rgba.pop(); // remove alpha in order to compare strictly rgb values
          if (rgba[0] > 0 || rgba[1] > 0 || rgba[2] > 0) {
            // remove black pixels
            rgbs.push(rgba.join(",")); // add to array as a string for set de-duplication later
          }
        }
      }
      rgbs = [...new Set(rgbs)]; // remove duplicates
      return rgbs;
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
      const mouseOverGalaxy = this.galaxies.filter((galaxy) =>
        ctx.isPointInPath(galaxy.path, e.pageX, e.pageY)
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
      if (mouseOverGalaxy.length) {
        mouseOverGalaxy.forEach((g) => {
          // Draw the dashed line bounding rect for the galaxy
          const leftX = g.coords.x - g.width / 2;
          const topY = g.coords.y - g.height / 2;
          const bottomY = g.coords.y + g.height / 2;
          const bottomYPadding = -5;
          ctxText.save();
          ctxText.strokeStyle = "rgba(173, 216, 230, 0.7)";
          ctxText.setLineDash([4, 2]);
          ctxText.lineDashOffset = 2;
          ctxText.strokeRect(leftX, topY, g.width, g.height);
          // Draw the galaxy name as text
          ctxText.fillStyle = "red";
          ctxText.font = "32px sans-serif";
          ctxText.textBaseline = "bottom";
          const textMetrics = ctxText.measureText(g.name); // get text measurements for centering within galaxy
          const textOffsetX = (g.width - textMetrics.width) / 2;
          ctxText.fillText(
            g.name,
            leftX + textOffsetX,
            bottomY + bottomYPadding
          );
          ctxText.restore();
        });
      } else {
        this.$refs["cryptoverse-canvas"].style.cursor = "default";
        ctxText.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      }
    },
    plotGalaxies() {
      // Create the bounding area for each galaxy
      this.allGalaxies.forEach((g) => {
        const ctxGalaxies = this.provider.cryptoverseContext;
        /* Draw the abstract background for the galaxy */

        // Load the image for the galaxy's representative coin
        const repCoinImg = this.cryptoidFiles(`./${g.repCoin.filename}`);
        const img = new Image();
        img.src = repCoinImg;
        img.onload = () => {
          const rgbs = this.getImgRGBs(img);

          // this.showColors(rgbs); // for debugging

          // Sample three random rgbs to use for the gradient
          const sampleRGBs = [];
          for (let i = 0; i < 3; i++) {
            sampleRGBs.push(
              rgbs.splice(Math.floor(Math.random() * rgbs.length), 1)
            );
          }
          // sampleRGBs.forEach((rgb) => console.log(rgb));

          // Draw abstract galaxy from sampled colors
          ctxGalaxies.save();
          // ctxGalaxies.fillStyle = `rgba(${rgbs[40]}, 0.3)`;
          // ctxGalaxies.fillRect(leftX, topY, g.width, g.height);
          const radgrad = ctxGalaxies.createRadialGradient(
            g.coords.x,
            g.coords.y,
            g.width / (g.width / 2),
            g.coords.x,
            g.coords.y,
            g.height / 2
          );
          radgrad.addColorStop(0, "rgba(255, 255, 255, 0.8)");
          radgrad.addColorStop(0.2, `rgba(${sampleRGBs[0]}, 0.7)`);
          radgrad.addColorStop(0.4, `rgba(${sampleRGBs[1]}, 0.3)`);
          radgrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctxGalaxies.fillStyle = radgrad;
          const path = new Path2D();
          path.rect(
            g.coords.x - g.width / 2,
            g.coords.y - g.height / 2,
            g.width,
            g.height
          );
          ctxGalaxies.fill(path);
          this.galaxies.push({
            ...g,
            path,
          });
          ctxGalaxies.restore();
        };
      });
    },
    showColors(rgbs) {
      const ctxGalaxies = this.provider.cryptoverseContext;
      // show the colors from the image
      ctxGalaxies.save();
      rgbs.forEach((rgb, i) => {
        ctxGalaxies.fillStyle = `rgba(${rgb})`;
        ctxGalaxies.fillRect(200 + i, 200, 2, 2);
      });
      ctxGalaxies.restore();
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
