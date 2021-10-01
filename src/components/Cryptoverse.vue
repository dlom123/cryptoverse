<template>
  <canvas ref="cv-canvas" class="cv-canvas">
    HTML5 Canvas is not supported in your browser.
  </canvas>
</template>

<script>
export default {
  name: "Canvas",
  data() {
    return {
      cryptoids: [],
      provider: {
        context: null,
      },
    };
  },
  computed: {
    canvasHeight() {
      return this.$refs["cv-canvas"].parentElement.clientHeight;
    },
    canvasWidth() {
      return this.$refs["cv-canvas"].parentElement.clientWidth;
    },
  },
  methods: {
    createCryptoverse() {
      /* Create and populate the entire Cryptoverse */
      this.loadCryptoids(); // TODO: do this in the background
    },
    drawCryptoid(img) {
      /* Draw a Cryptoid within the bounds of the Cryptoverse */

      const ctx = this.provider.context;
      const radius = this.getRandomNumber(5, 128);

      // make sure cryptoid is not partially outside of canvas bounds
      const x = this.getRandomNumber(radius, this.canvasWidth - radius);
      const y = this.getRandomNumber(radius, this.canvasHeight - radius);
      ctx.drawImage(img, x, y, radius, radius);

      // draw a circular border around the image
      ctx.strokeStyle = "lightblue";
      ctx.lineWidth = 1;
      const border = new Path2D();
      const borderRadius = radius / 2;
      border.arc(
        x + borderRadius,
        y + borderRadius,
        borderRadius,
        0,
        Math.PI * 2,
        false
      );
      ctx.stroke(border);
      return { x, y, radius };
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
          const { x, y, radius } = this.drawCryptoid(img);
          this.cryptoids.push({
            name: filename.slice(2, -4),
            image: img,
            x,
            y,
            radius,
          });
        };
      });
    },
  },
  provide() {
    return {
      provider: this.provider,
    };
  },
  mounted() {
    this.provider.context = this.$refs["cv-canvas"].getContext("2d");
    this.$refs["cv-canvas"].width =
      this.$refs["cv-canvas"].parentElement.clientWidth;
    this.$refs["cv-canvas"].height =
      this.$refs["cv-canvas"].parentElement.clientHeight;
    this.createCryptoverse();
  },
};
</script>
