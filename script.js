document.addEventListener('DOMContentLoaded', () => {
  const videoPreview = document.getElementById('videoPreview');
  const fileInput = document.getElementById('fileInput');
  let videoInterval;
  let isVideo = false;

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const fileURL = URL.createObjectURL(file);

    if (file.type.startsWith('video')) {
      isVideo = true;
      videoPreview.src = fileURL;
      videoPreview.play();
      videoPreview.onplay = () => {
        if (videoInterval) clearInterval(videoInterval);
        videoInterval = setInterval(processVideo, 33); // 30 FPS
      };
      videoPreview.onpause = () => {
        if (videoInterval) clearInterval(videoInterval);
      };
    }
  });

  const toggles = document.querySelectorAll('input[type="checkbox"]');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', processVideo);
  });

  function processVideo() {
    if (!isVideo) return;

    const cap = new cv.VideoCapture(videoPreview);
    const frame = new cv.Mat(videoPreview.height, videoPreview.width, cv.CV_8UC4);
    cap.read(frame);

    let processed = frame.clone();

    if (document.getElementById('rgbRToggle').checked) {
      processed = extractChannel(processed, 'RGB-R');
    }
    if (document.getElementById('rgbGToggle').checked) {
      processed = extractChannel(processed, 'RGB-G');
    }
    if (document.getElementById('rgbBToggle').checked) {
      processed = extractChannel(processed, 'RGB-B');
    }
    // Add more conditions for other toggles

    cv.imshow('videoPreview', processed);
    frame.delete();
    processed.delete();
  }

  function extractChannel(mat, channel) {
    const channels = new cv.MatVector();
    cv.split(mat, channels);

    let result;
    switch (channel) {
      case 'RGB-R':
        result = channels.get(0);
        break;
      case 'RGB-G':
        result = channels.get(1);
        break;
      case 'RGB-B':
        result = channels.get(2);
        break;
      // Add more cases for other channels
    }

    const finalMat = new cv.Mat();
    cv.merge(channels, finalMat);
    return finalMat;
  }
});
