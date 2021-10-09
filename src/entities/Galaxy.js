import { getImgRGBs } from "../functions/helpers"

export default function Galaxy(name, coords, width, height, repCoin, ctx) {
  // Init variables
  this.name = name
  this.coords = { // Center of the galaxy
    x: coords.x,
    y: coords.y
  }
  this.width = width
  this.height = height
  this.repCoin = repCoin // The galaxy's representative coin
  this.ctx = ctx
  // Galaxy settings
  this.colorVariety = 3 // How many colors to sample from the repCoin image for drawing the galaxy
  this.rgbs = [] // Sampled RGB values that represent the galaxy visually
  this.targetArea = null // The Path2D object that represents the virtual boundaries of the galaxy

  this.generate = async () => {
    /* Generates and displays the galaxy. */

    // Get the RGB color values to use for the galaxy
    this.rgbs = await this.getRGBs()
    // this.showColors(rgbs) // For debugging purposes

    // Display the galaxy
    this.draw()
  }

  this.getRGBs = async () => {
    // Load the image file for the galaxy
    const repCoinImg = this.loadRepImg()
    await repCoinImg.decode() // After this, the image is loaded and ready
    const rgbs = getImgRGBs(repCoinImg)

    // Sample three random rgbs to use for the gradient
    const sampledRGBs = this.sampleRGBs(rgbs, this.colorVariety)

    return sampledRGBs
  }

  this.loadRepImg = () => {
    /* Returns the image for the galaxy's representative coin. */

    const repCoinImgFile = require.context("../assets/images/cryptoids", false, /.png$/)(`./${this.repCoin.filename}`);
    const img = new Image()
    img.src = repCoinImgFile;
    return img
  }

  this.sampleRGBs = (rgbs, n) => {
    /* Returns an array of `n` random RGB strings from the given `rgbs` array. */
    const sampleRGBs = [];
    for (let i = 0; i < n; i++) {
      sampleRGBs.push(
        rgbs.splice(Math.floor(Math.random() * rgbs.length), 1)
      );
    }
    // sampleRGBs.forEach((rgb) => console.log(rgb));  
    return sampleRGBs
  }

  this.showColors = (rgbs) => {
    /*
      DEBUGGING FUNCTION

      Shows the colors from an array of RGB strings.
      Used for visualizing the color spectrum for a galaxy's representative coin image.
    */

    // Draw each of the colors from the `rgbs` array onto the canvas
    this.ctx.save();
    rgbs.forEach((rgb, i) => {
      this.ctx.fillStyle = `rgba(${rgb})`;
      this.ctx.fillRect(200 + i, 200, 2, 2);
    });
    this.ctx.restore();
  }

  this.draw = () => {
    /* Draws the abstract background for the galaxy from sampled RGB values. */

    this.ctx.save();
    // Create the gradient
    const radgrad = this.ctx.createRadialGradient(
      this.coords.x,
      this.coords.y,
      this.width / (this.width / 2),
      this.coords.x,
      this.coords.y,
      this.height / 2
    );
    // Apply the sampled RGBs to the gradient
    radgrad.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    radgrad.addColorStop(0.2, `rgba(${this.rgbs[0]}, 0.7)`);
    radgrad.addColorStop(0.4, `rgba(${this.rgbs[1]}, 0.3)`);
    radgrad.addColorStop(1, "rgba(0, 0, 0, 0)");

    // Draw the gradient
    this.ctx.fillStyle = radgrad;
    const path = new Path2D();
    path.rect(
      this.coords.x - this.width / 2,
      this.coords.y - this.height / 2,
      this.width,
      this.height
    );
    this.ctx.fill(path);
    this.targetArea = path

    this.ctx.restore();
  }
}
