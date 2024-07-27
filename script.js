document.addEventListener('DOMContentLoaded', () => {
  const videoPreview = document.getElementById('videoPreview');
  let originalMat, currentMat;
  let videoInterval;
  let isVideo = false;

  document.getElementById('fileInput').addEventListener('change', loadMedia);

  const toggles = document.querySelectorAll('input[type="checkbox"]');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      if (currentMat) {
        processImage();
      }
    });
  });

  document.getElementById('processBtn').addEventListener('click', () => {
    if (currentMat) {
      processImage();
    }
  });

  function loadMedia(event) {
    const file = event.target.files[0];
    if (file.type.startsWith('video')) {
      isVideo = true;
      const url = URL.createObjectURL(file);
      videoPreview.src = url;
      videoPreview.onloadedmetadata = () => {
        videoPreview.play();
        startVideoProcessing();
      };
    } else if (file.type.startsWith('image')) {
      isVideo = false;
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        originalMat = cv.imread(img);
        currentMat = originalMat.clone();
        processImage();
      };
    }
  }

  function startVideoProcessing() {
    if (videoInterval) {
      clearInterval(videoInterval);
    }
    videoInterval = setInterval(() => {
      const cap = new cv.VideoCapture(videoPreview);
      originalMat = new cv.Mat(videoPreview.videoHeight, videoPreview.videoWidth, cv.CV_8UC4);
      cap.read(originalMat);
      currentMat = originalMat.clone();
      processImage();
      cv.imshow('videoPreview', currentMat);
      currentMat.delete();
    }, 33); // approximately 30 fps
  }

  function processImage() {
    currentMat = originalMat.clone();
    applyFilters(currentMat);
    if (!isVideo) {
      cv.imshow('videoPreview', currentMat);
    }
  }

  function applyFilters(mat) {
    let channels = new cv.MatVector();
    cv.split(mat, channels);

    // Create a blank channel for combining
    let blank = new cv.Mat(mat.rows, mat.cols, cv.CV_8UC1, new cv.Scalar(0));

    const channelToggles = {
      'rgbRToggle': [2, blank, blank],
      'rgbGToggle': [blank, 1, blank],
      'rgbBToggle': [blank, blank, 0],
      'hsvHToggle': [0, blank, blank, cv.COLOR_BGR2HSV, cv.COLOR_HSV2BGR],
      'hsvSToggle': [blank, 1, blank, cv.COLOR_BGR2HSV, cv.COLOR_HSV2BGR],
      'hsvVToggle': [blank, blank, 2, cv.COLOR_BGR2HSV, cv.COLOR_HSV2BGR],
      'hslHToggle': [0, blank, blank, cv.COLOR_BGR2HLS, cv.COLOR_HLS2BGR],
      'hslSToggle': [blank, 2, blank, cv.COLOR_BGR2HLS, cv.COLOR_HLS2BGR],
      'hslLToggle': [blank, 1, blank, cv.COLOR_BGR2HLS, cv.COLOR_HLS2BGR],
      'xyzXToggle': [0, blank, blank, cv.COLOR_BGR2XYZ, cv.COLOR_XYZ2BGR],
      'xyzYToggle': [blank, 1, blank, cv.COLOR_BGR2XYZ, cv.COLOR_XYZ2BGR],
      'xyzZToggle': [blank, blank, 2, cv.COLOR_BGR2XYZ, cv.COLOR_XYZ2BGR],
      'labLToggle': [0, blank, blank, cv.COLOR_BGR2Lab, cv.COLOR_Lab2BGR],
      'labAToggle': [blank, 1, blank, cv.COLOR_BGR2Lab, cv.COLOR_Lab2BGR],
      'labBToggle': [blank, blank, 2, cv.COLOR_BGR2Lab, cv.COLOR_Lab2BGR]
    };

    for (const [id, values] of Object.entries(channelToggles)) {
      if (document.getElementById(id).checked) {
        let processedMat = new cv.Mat();
        if (values.length === 3) {
          let processedChannels = new cv.MatVector();
          processedChannels.push_back(channels.get(values[0]));
          processedChannels.push_back(values[1]);
          processedChannels.push_back(values[2]);
          cv.merge(processedChannels, processedMat);
        } else {
          cv.cvtColor(mat, processedMat, values[3]);
          let processedChannels = new cv.MatVector();
          cv.split(processedMat, processedChannels);
          cv.merge([processedChannels.get(values[0]), values[1], values[2]], processedMat);
          cv.cvtColor(processedMat, processedMat, values[4]);
        }
        cv.addWeighted(mat, 0.0, processedMat, 1.0, 0.0, mat);
        processedMat.delete();
      }
    }

    channels.delete();
    blank.delete();
  }
});
