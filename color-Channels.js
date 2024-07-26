function applyColorChannelToggles() {
  if (!document.getElementById('rgbToggle').checked) {
    cv.cvtColor(currentMat, currentMat, cv.COLOR_RGBA2GRAY);
    cv.cvtColor(currentMat, currentMat, cv.COLOR_GRAY2RGBA);
  }

  if (!document.getElementById('hsvToggle').checked) {
    let hsv = new cv.Mat();
    cv.cvtColor(currentMat, hsv, cv.COLOR_RGBA2HSV);
    cv.inRange(hsv, new cv.Scalar(0, 0, 0), new cv.Scalar(180, 255, 255), hsv);
    cv.cvtColor(hsv, currentMat, cv.COLOR_GRAY2RGBA);
    hsv.delete();
  }

  if (!document.getElementById('hsvHToggle').checked) {
    let hsv = new cv.Mat();
    cv.cvtColor(currentMat, hsv, cv.COLOR_RGBA2HSV);
    let channels = new cv.MatVector();
    cv.split(hsv, channels);
    channels.get(0).setTo(new cv.Scalar(0));
    cv.merge(channels, hsv);
    cv.cvtColor(hsv, currentMat, cv.COLOR_HSV2RGBA);
    hsv.delete();
    channels.delete();
  }

  if (!document.getElementById('hsvSToggle').checked) {
    let hsv = new cv.Mat();
    cv.cvtColor(currentMat, hsv, cv.COLOR_RGBA2HSV);
    let channels = new cv.MatVector();
    cv.split(hsv, channels);
    channels.get(1).setTo(new cv.Scalar(0));
    cv.merge(channels, hsv);
    cv.cvtColor(hsv, currentMat, cv.COLOR_HSV2RGBA);
    hsv.delete();
    channels.delete();
  }

  if (!document.getElementById('hsvVToggle').checked) {
    let hsv = new cv.Mat();
    cv.cvtColor(currentMat, hsv, cv.COLOR_RGBA2HSV);
    let channels = new cv.MatVector();
    cv.split(hsv, channels);
    channels.get(2).setTo(new cv.Scalar(0));
    cv.merge(channels, hsv);
    cv.cvtColor(hsv, currentMat, cv.COLOR_HSV2RGBA);
    hsv.delete();
    channels.delete();
  }

  // Add more color channel toggle logic here for other color spaces
}
