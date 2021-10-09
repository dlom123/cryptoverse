export function degreesToRadians(degrees) {
  /* Returns radians from the given degrees. */
  return degrees * (Math.PI / 180);
};

export function round(num, decimals) {
  /* Returns a decimal number rounded to the given number of decimal places. */
  return Math.round(num * (10 * decimals)) / (10 * decimals)
}
