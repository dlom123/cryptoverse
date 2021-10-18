import { getRandomNumber } from "../functions/helpers";

export default function Cryptoid(ctxBg, ctxUser, coords, name, symbol, rank, filename) {
  this.ctxBg = ctxBg // Background canvas context
  this.ctxUser = ctxUser // User interaction canvas context
  this.name = name
  this.symbol = symbol
  this.rank = rank
  this.filename = filename
  this.img = new Image()
  this.radius = getRandomNumber(5, 25); // Generate cryptoid size randomly for now
  this.coords = coords
  this.targetPath = null // The Path2D object that represents the virtual boundaries of the cryptoid
  this.fontSize = Math.max(this.radius / 2, 12);

  this.load = async () => {
    await this.loadImage()
    
    this.drawCryptoid(this.img);
  }

  this.loadImage = async () => {
    const cryptoidImgFile = require.context("../assets/images/cryptoids", false, /.png$/)(`./${this.filename}`);
    this.img.src = cryptoidImgFile;
    await this.img.decode() // After this, the image is loaded and ready
  }

  this.drawCryptoid = (img) => {
    /* Draws a Cryptoid within the bounds of the Cryptoverse. */

    this.ctxBg.drawImage(
      img,
      this.coords.x - this.radius, // left edge of the image
      this.coords.y - this.radius, // top edge of the image
      this.radius * 2,
      this.radius * 2
    );

    this.ctxBg.save();
    // draw a circular border around the image
    this.ctxBg.strokeStyle = "rgba(173, 216, 230, 0.5)"; // lightblue
    this.ctxBg.lineWidth = 2;
    this.targetPath = new Path2D();
    this.targetPath.arc(
      this.coords.x, // Center of the circle
      this.coords.y, // Center of the circle
      this.radius,
      0,
      Math.PI * 2,
      false
    );
    this.ctxBg.stroke(this.targetPath);
    this.ctxBg.restore();
  }

  this.handleMouseOver = () => {
    // Change mouse pointer
    this.ctxUser.canvas.style.cursor = "pointer";

    // Show name of cryptoid
    this.ctxUser.save();
    this.ctxUser.fillStyle = "white";
    this.ctxUser.font = `${this.fontSize}px sans-serif`;
    this.ctxUser.textAlign = "center";
    this.ctxUser.fillText(
      this.name,
      this.coords.x,
      this.coords.y + this.radius + this.fontSize
    );
    this.ctxUser.restore();
  }

  this.handleMouseOut = () => {
    // Change mouse pointer
    this.ctxUser.canvas.style.cursor = "default";

    // Hide name of cryptoid
    this.ctxUser.clearRect(0, 0, this.ctxUser.canvas.width, this.ctxUser.canvas.height)

    // This is test code for trying to see how to capture an area of text
    // this.ctxUser.save();
    // this.ctxUser.font = `${this.fontSize}px sans-serif`;
    // this.ctxUser.textAlign = "center";
    // const textMetrics = this.ctxUser.measureText(this.name);

    // this.ctxUser.strokeStyle = "green";
    // this.ctxUser.strokeRect(
    //   this.coords.x - this.radius,
    //   this.coords.y + this.radius,
    //   Math.abs(textMetrics.actualBoundingBoxLeft) +
    //   Math.abs(textMetrics.actualBoundingBoxRight),
    //   textMetrics.actualBoundingBoxAscent +
    //   textMetrics.actualBoundingBoxDescent +
    //   this.fontSize
    // );
    // this.ctxUser.restore();
  }
}
