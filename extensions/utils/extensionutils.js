export default class ExtensionUtils {

  /**
   * create a random rgb color with R, G, B ranged from 0 to 1.
   * The factor for the real color (1 or 255) will be decided in @see Viewer.setColor method
   * 
   * @returns {Array[number]} the random color with random opacity
   */
  static getRandomOpacityColor() {
    return ExtensionUtils.getRandomColor(Math.random());
  }

  /**
   * create a random rgb color with R, G, B ranged from 0 to 1.
   * The factor for the real color (1 or 255) will be decided in @see Viewer.setColor method
   * 
   * @param {number} opacity (optional) the color opacity, default value is 1
   * @returns {Array[number]} the random color
   */
  static getRandomColor(opacity = 1) {
    const random = Math.random;
    return [random(), random(), random(), opacity];
  }
}