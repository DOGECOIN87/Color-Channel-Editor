document.addEventListener('DOMContentLoaded', () => {
  const videoPreview = document.getElementById('videoPreview');
  let originalMat, currentMat;
  let videoInterval;
  let isVideo = false;

  document.getElementById('fileInput').addEventListener('change', loadMedia);

  const toggles = document.querySelectorAll('input[type="checkbox"]');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      processImage();
    });
  });

  document.getElementById('processBtn').addEventListener('click', () => {
    processImage();
  });
});
