let currentMat;
let originalMat;
let isVideo = false;
let videoInterval;

function loadMedia() {
  if (isVideo) {
    clearInterval(videoInterval);
    videoInterval = setInterval(updatePreview, 1000 / 30); // 30 fps
  } else {
    updatePreview();
  }
}

function updatePreview() {
  const canvas = document.createElement('canvas');
  canvas.width = videoPreview.videoWidth || videoPreview.width;
  canvas.height = videoPreview.videoHeight || videoPreview.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  originalMat = cv.matFromImageData(imageData);
  currentMat = originalMat.clone();

  applyColorChannelToggles();

  cv.imshow('videoPreview', currentMat);
  originalMat.delete();
  currentMat.delete();
}

function processVideo() {
  if (!originalMat) {
    alert('Please upload a file first');
    return;
  }

  // Process the video using OpenCV.js
  // This is a placeholder for the actual video processing logic
  console.log('Processing video...');
  alert('Video processing complete!');
}
