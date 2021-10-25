import { getImgRGBs } from "../helpers/functions"

export default function Galaxy(id, name, coords, width, height, repCoin, ctxBg, ctxUser) {
  // Init variables
  this.id = id
  this.name = name
  this.coords = { // Center of the galaxy
    x: coords.x,
    y: coords.y
  }
  this.width = width
  this.height = height
  this.repCoin = repCoin // The galaxy's representative coin
  this.ctxBg = ctxBg
  this.ctxUser = ctxUser
  // Galaxy settings
  this.colorVariety = 3 // How many colors to sample from the repCoin image for drawing the galaxy
  this.rgbs = [] // Sampled RGB values that represent the galaxy visually
  this.path = null // The Path2D object that represents the virtual boundaries of the galaxy
  this.targetPercent = 0.2 // The percentage of the galaxy used for actions, from the middle out
  this.targetPath = null // The Path2D object that represents the actionable portion of the galaxy

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
    this.loadRepImg()
    await this.repCoin.img.decode() // After this, the image is loaded and ready
    const rgbs = getImgRGBs(this.repCoin.img)

    // Sample three random rgbs to use for the gradient
    const sampledRGBs = this.sampleRGBs(rgbs, this.colorVariety)

    /* TODO: sort sampledRGBs from lightest to darkest?
         - That way, the galaxy gradient can be darkest towards the outside
    */

    return sampledRGBs
  }

  this.loadRepImg = () => {
    /* Returns the image for the galaxy's representative coin. */
    const repCoinImgFile = require.context("../assets/images/cryptoids", false, /.png$/)(`./${this.repCoin.filename}`);
    this.repCoin.img = new Image()
    this.repCoin.img.src = repCoinImgFile;
  }

  this.sampleRGBs = (rgbs, n) => {
    /* Returns an array of `n` random RGB strings from the given `rgbs` array. */
    const sampleRGBs = [];
    for (let i = 0; i < n; i++) {
      sampleRGBs.push(
        rgbs.splice(Math.floor(Math.random() * rgbs.length), 1)
      );
    }
    return sampleRGBs
  }

  this.showColors = (rgbs) => {
    /*
      DEBUGGING FUNCTION

      Shows the colors from an array of RGB strings.
      Used for visualizing the color spectrum for a galaxy's representative coin image.
    */

    // Draw each of the colors from the `rgbs` array onto the canvas
    this.ctxBg.save();
    rgbs.forEach((rgb, i) => {
      this.ctxBg.fillStyle = `rgba(${rgb})`;
      this.ctxBg.fillRect(200 + i, 200, 2, 2);
    });
    this.ctxBg.restore();
  }

  this.draw = () => {
    /* Draws the abstract background for the galaxy from sampled RGB values. */

    const targetRadius = this.width / 2 * this.targetPercent / 2 // The radius of the actionable center of the galaxy

    this.ctxBg.save();
    // Create the gradient
    const radgrad = this.ctxBg.createRadialGradient(
      this.coords.x,
      this.coords.y,
      targetRadius,
      this.coords.x,
      this.coords.y,
      this.height / 2
    );
    // Apply the sampled RGBs to the gradient
    radgrad.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    radgrad.addColorStop(this.targetPercent, `rgba(${this.rgbs[0]}, 0.7)`);
    radgrad.addColorStop(0.4, `rgba(${this.rgbs[1]}, 0.5)`);
    radgrad.addColorStop(0.6, `rgba(${this.rgbs[2]}, 0.3)`);
    radgrad.addColorStop(1, "rgba(0, 0, 0, 0)");

    // Draw the gradient
    this.ctxBg.fillStyle = radgrad;
    const path = new Path2D();
    path.rect(
      this.coords.x - this.width / 2,
      this.coords.y - this.height / 2,
      this.width,
      this.height
    );
    this.ctxBg.fill(path);
    this.path = path
    this.ctxBg.restore();

    // Create the target area path around the core of the galaxy.
    // This is the user's entry point into the galaxy.
    this.ctxUser.save()
    this.targetPath = new Path2D()
    this.targetPath.arc(this.coords.x, this.coords.y, targetRadius, 0, 2 * Math.PI);
    this.ctxUser.restore()
  }

  this.handleMouseOver = () => {
    // Draw the dashed line bounding rect for the galaxy
    const leftX = this.coords.x - this.width / 2;
    const topY = this.coords.y - this.height / 2;
    const bottomY = this.coords.y + this.height / 2;
    const bottomYPadding = -5;

    this.ctxUser.save();
    this.ctxUser.strokeStyle = "rgba(173, 216, 230, 0.7)";
    this.ctxUser.setLineDash([4, 2]);
    this.ctxUser.lineDashOffset = 2;
    this.ctxUser.strokeRect(leftX, topY, this.width, this.height);

    // Draw the galaxy name as text
    this.ctxUser.fillStyle = "red";
    this.ctxUser.font = "32px sans-serif";
    this.ctxUser.textBaseline = "bottom";
    const textMetrics = this.ctxUser.measureText(this.name); // get text measurements for centering within galaxy
    const textOffsetX = (this.width - textMetrics.width) / 2;
    this.ctxUser.fillText(
      this.name,
      leftX + textOffsetX,
      bottomY + bottomYPadding
    );

    this.ctxUser.restore();
  }

  this.handleMouseOut = () => {
    this.ctxUser.clearRect(0, 0, this.ctxUser.canvas.width, this.ctxUser.canvas.height);
  }
}
