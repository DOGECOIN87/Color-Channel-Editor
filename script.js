document.addEventListener('DOMContentLoaded', () => {
  const videoPreview = document.getElementById('videoPreview');
  const imagePreview = document.getElementById('imagePreview');
  let videoInterval;
  let isVideo = false;

  document.getElementById('fileInput').addEventListener('change', loadMedia);

  const toggles = document.querySelectorAll('input[type="checkbox"]');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      if (isVideo) {
        processVideoFrame();
      } else {
        processImage();
      }
    });
  });

  document.getElementById('processBtn').addEventListener('click', () => {
    if (isVideo) {
      processVideoFrame();
    } else {
      processImage();
    }
  });

  function loadMedia(event) {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);

    if (file.type.startsWith('video/')) {
      isVideo = true;
      videoPreview.style.display = 'block';
      imagePreview.innerHTML = ''; // Clear previous image
      videoPreview.src = url;
      videoPreview.play();
      videoPreview.onloadeddata = () => {
        startVideoProcessing();
      };
    } else if (file.type.startsWith('image/')) {
      isVideo = false;
      videoPreview.style.display = 'none';
      const img = new Image();
      img.src = url;
      img.onload = () => {
        processImage(img);
      };
      imagePreview.appendChild(img); // Display the loaded image
    }
  }

  function startVideoProcessing() {
    if (videoInterval) {
      clearInterval(videoInterval);
    }

    videoInterval = setInterval(() => {
      processVideoFrame();
    }, 100); // Process video frame every 100ms
  }

  function processVideoFrame() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = videoPreview.videoWidth;
    canvas.height = videoPreview.videoHeight;
    ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const mat = cv.matFromImageData(imageData);

    applyFilters(mat);

    ctx.putImageData(new ImageData(new Uint8ClampedArray(mat.data), mat.cols, mat.rows), 0, 0);
    mat.delete();

    imagePreview.innerHTML = ''; // Clear previous canvas
    imagePreview.appendChild(canvas); // Display the processed frame
  }

  function processImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const mat = cv.matFromImageData(imageData);

    applyFilters(mat);

    ctx.putImageData(new ImageData(new Uint8ClampedArray(mat.data), mat.cols, mat.rows), 0, 0);
    mat.delete();

    imagePreview.innerHTML = ''; // Clear previous canvas
    imagePreview.appendChild(canvas); // Display the processed image
  }

  function applyFilters(mat) {
    // Add your filter processing logic here based on the toggles
    // Example:
    if (document.getElementById('rgbRToggle').checked) {
      // Process RGB-R channel
    }
    if (document.getElementById('rgbGToggle').checked) {
      // Process RGB-G channel
    }
    // Add other filters as needed
  }
});
