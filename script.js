document.addEventListener('DOMContentLoaded', () => {
  const videoPreview = document.getElementById('videoPreview');
  const fileInput = document.getElementById('fileInput');
  const toggles = document.querySelectorAll('input[type="checkbox"]');
  const processBtn = document.getElementById('processBtn');
  let originalMat, currentMat, videoInterval;
  let isVideo = false;

  fileInput.addEventListener('change', loadMedia);
  toggles.forEach(toggle => toggle.addEventListener('change', processImage));
  processBtn.addEventListener('click', processImage);

  function loadMedia(event) {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);

    if (file.type.startsWith('video/')) {
      isVideo = true;
      videoPreview.src = url;
      videoPreview.style.display = 'block';
      videoPreview.play();
      videoPreview.addEventListener('play', () => {
        videoInterval = setInterval(() => {
          if (!videoPreview.paused && !videoPreview.ended) {
            processFrame();
          }
        }, 1000 / 30);
      });
      videoPreview.addEventListener('pause', () => clearInterval(videoInterval));
      videoPreview.addEventListener('ended', () => clearInterval(videoInterval));
    } else {
      isVideo = false;
      const img = new Image();
      img.src = url;
      img.onload = () => {
        originalMat = cv.imread(img);
        processImage();
      };
    }
  }

  function processFrame() {
    const cap = new cv.VideoCapture(videoPreview);
    const frame = new cv.Mat(videoPreview.height, videoPreview.width, cv.CV_8UC4);
    cap.read(frame);
    originalMat = frame;
    processImage();
  }

  function processImage() {
    if (!originalMat) return;

    currentMat = originalMat.clone();
    let displayMat;

    if (document.getElementById('rgbToggle').checked) {
      displayMat = currentMat.clone();
    }
    if (document.getElementById('hsvToggle').checked) {
      cv.cvtColor(currentMat, currentMat, cv.COLOR_RGB2HSV);
    }
    if (document.getElementById('hsvHToggle').checked) {
      cv.extractChannel(currentMat, currentMat, 0);
    }
    if (document.getElementById('hsvSToggle').checked) {
      cv.extractChannel(currentMat, currentMat, 1);
    }
    if (document.getElementById('hsvVToggle').checked) {
      cv.extractChannel(currentMat, currentMat, 2);
    }
    if (document.getElementById('hslToggle').checked) {
      cv.cvtColor(currentMat, currentMat, cv.COLOR_RGB2HLS);
    }
    if (document.getElementById('xyzToggle').checked) {
      cv.cvtColor(currentMat, currentMat, cv.COLOR_RGB2XYZ);
    }
    if (document.getElementById('labToggle').checked) {
      cv.cvtColor(currentMat, currentMat, cv.COLOR_RGB2Lab);
    }
    if (document.getElementById('lutToggle').checked) {
      // Custom LUT processing logic
    }
    if (document.getElementById('cmykCToggle').checked) {
      cv.cvtColor(currentMat, currentMat, cv.COLOR_RGB2CMYK);
      cv.extractChannel(currentMat, currentMat, 0);
    }
    if (document.getElementById('cmykMToggle').checked) {
      cv.cvtColor(currentMat, currentMat, cv.COLOR_RGB2CMYK);
      cv.extractChannel(currentMat, currentMat, 1);
    }
    if (document.getElementById('cmykYToggle').checked) {
      cv.cvtColor(currentMat, currentMat, cv.COLOR_RGB2CMYK);
      cv.extractChannel(currentMat, currentMat, 2);
    }
    if (document.getElementById('cmykKToggle').checked) {
      cv.cvtColor(currentMat, currentMat, cv.COLOR_RGB2CMYK);
      cv.extractChannel(currentMat, currentMat, 3);
    }

    cv.imshow('videoPreview', currentMat);
    currentMat.delete();
  }
});
