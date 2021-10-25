export function degreesToRadians(degrees) {
  /* Returns radians from the given degrees. */

  return degrees * (Math.PI / 180);
};

export function getRandomNumber(min, max) {
  /* Returns a decimal number rounded to the given number of decimal places. */

  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getImgRGBs(img) {
  /* Returns an array of all RGB pixel values from an image within opacity limits. */

  // Create a canvas element to load the image onto
  let canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  let ctx = canvas.getContext('2d')

  // Draw the reference image
  ctx.drawImage(img, 0, 0);
  // Sample pixel data from reference image
  const pixelData = Array.from(ctx.getImageData(0, 0, 128, 128).data);

  // Done with the canvas element
  canvas = null
  ctx = null

  // Build an array of RGB data from the image pixel data
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
      // Only include colors of a reasonable opacity (>=0.7)
      rgba.pop(); // Remove alpha in order to compare strictly rgb values
      if (rgba[0] > 0 || rgba[1] > 0 || rgba[2] > 0) { // Remove black pixels
        rgbs.push(rgba.join(",")); // Add to array as a string for set de-duplication later
      }
    }
  }
  rgbs = [...new Set(rgbs)]; // Remove duplicates
  return rgbs;
}

export function round(num, decimals) {
  /* Returns a decimal number rounded to the given number of decimal places. */
  return Math.round(num * (10 * decimals)) / (10 * decimals)
}
