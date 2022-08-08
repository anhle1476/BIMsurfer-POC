export default class DebugUtils {
  static showSelectedPoint(x, y, color) {
    const debugPoint = document.createElement('div');
    debugPoint.classList.add('debug-selected-point');
    debugPoint.style.left = x + 'px';
    debugPoint.style.top = y + 'px';

    if (color) {
      debugPoint.style.backgroundColor = color;
    }

    document.body.appendChild(debugPoint);
  } 

  static cleanUpSelectedPoints() {
    const points = [...document.getElementsByClassName('debug-selected-point')];
    for (let index = 0; index < points.length; index++) {
      const point = points[index];
      point.parentElement.removeChild(point);
    }
  }
}