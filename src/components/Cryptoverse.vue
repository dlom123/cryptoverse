<template>
  <v-col class="ma-0 pa-0">
    <canvas ref="text-canvas" class="text-canvas">
      HTML5 Canvas is not supported in your browser.
    </canvas>
    <canvas ref="cv-canvas" class="cv-canvas">
      HTML5 Canvas is not supported in your browser.
    </canvas>
    <CryptoidDetails :cryptoid="showCryptoidDetail" />
  </v-col>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import CryptoidDetails from "./CryptoidDetails";

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
    };
  },
  computed: {
    ...mapState(["showCryptoidDetail"]),
    canvasHeight() {
      return this.$refs["cv-canvas"].parentElement.clientHeight;
    },
    canvasWidth() {
      return this.$refs["cv-canvas"].parentElement.clientWidth;
    },
  },
  methods: {
    ...mapMutations(["setShowCryptoidDetail"]),
    createCryptoverse() {
      /* Create and populate the entire Cryptoverse */
      this.loadCryptoids(); // TODO: do this in the background
    },
    drawCryptoid(img) {
      /* Draw a Cryptoid within the bounds of the Cryptoverse */

      const ctx = this.provider.cvContext;
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
      // point require context to cryptoids image directory
      const files = require.context(
        "../assets/images/cryptoids",
        false,
        /.png$/
      );
      // draw a cryptoid object for each image file that exists
      files.keys().map((filename) => {
        const img = new Image();
        img.src = files(filename);
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
      const ctx = this.provider.cvContext;
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
      const ctx = this.provider.cvContext;
      const ctxText = this.provider.textContext;
      // Is the mouse over any of the cryptoids?
      const mouseOverCryptoids = this.cryptoids.filter((cryptoid) =>
        ctx.isPointInPath(cryptoid.path, e.pageX, e.pageY)
      );
      if (mouseOverCryptoids.length) {
        this.$refs["cv-canvas"].style.cursor = "pointer";
        ctxText.fillStyle = "white";
        mouseOverCryptoids.forEach((c) => {
          const fontSize = Math.max(c.radius / 2, 12);
          ctxText.font = `${fontSize}px sans-serif`;
          ctxText.textAlign = "center";
          ctxText.fillText(c.name, c.x, c.y + c.radius + fontSize);
        });
      } else {
        this.$refs["cv-canvas"].style.cursor = "default";
        ctxText.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      }
    },
  },
  provide() {
    return {
      provider: this.provider,
    };
  },
  mounted() {
    this.provider.cvContext = this.$refs["cv-canvas"].getContext("2d");
    this.provider.textContext = this.$refs["text-canvas"].getContext("2d");
    const cWidth = this.$refs["cv-canvas"].parentElement.clientWidth;
    const cHeight = this.$refs["cv-canvas"].parentElement.clientHeight;
    this.$refs["cv-canvas"].width = cWidth;
    this.$refs["cv-canvas"].height = cHeight;
    this.$refs["text-canvas"].width = cWidth;
    this.$refs["text-canvas"].height = cHeight;

    this.createCryptoverse();
    this.$refs["cv-canvas"].addEventListener("click", this.onClickCanvas);
    this.$refs["cv-canvas"].addEventListener(
      "mousemove",
      this.onMouseMoveCanvas
    );
  },
  beforeDestroy() {
    this.$refs["cv-canvas"].removeEventListener("click", this.onClickCanvas);
    this.$refs["cv-canvas"].removeEventListener(
      "mousemove",
      this.onMouseMoveCanvas
    );
  },
};
</script>
