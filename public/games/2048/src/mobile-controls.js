(function (global) {
  function getSwipeDirection(options) {
    const deltaX = options.endX - options.startX;
    const deltaY = options.endY - options.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const threshold = options.threshold || 24;

    if (absX < threshold && absY < threshold) {
      return null;
    }

    if (absX >= absY) {
      return deltaX > 0 ? "right" : "left";
    }

    return deltaY > 0 ? "down" : "up";
  }

  function shouldShowTouchControls(options) {
    return Boolean((options.maxTouchPoints || 0) > 0 || options.anyPointerCoarse);
  }

  global.Mobile2048Controls = {
    getSwipeDirection,
    shouldShowTouchControls,
  };
})(globalThis);
