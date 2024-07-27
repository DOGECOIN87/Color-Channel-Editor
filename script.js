document.addEventListener('DOMContentLoaded', () => {
  const videoPreview = document.getElementById('videoPreview');
  const fileInput = document.getElementById('fileInput');
  let originalMat;
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
    if (document.getElementById('hsvHToggle').checked) {
      processed = extractChannel(processed, 'HSV-H');
    }
    if (document.getElementById('hsvSToggle').checked) {
      processed = extractChannel(processed, 'HSV-S');
    }
    if (document.getElementById('hsvVToggle').checked) {
      processed = extractChannel(processed, 'HSV-V');
    }
    if (document.getElementById('hslHToggle').checked) {
      processed = extractChannel(processed, 'HSL-H');
    }
    if (document.getElementById('hslSToggle').checked) {
      processed = extractChannel(processed, 'HSL-S');
    }
    if (document.getElementById('hslLToggle').checked) {
      processed = extractChannel(processed, 'HSL-L');
    }
    if (document.getElementById('xyzXToggle').checked) {
      processed = extractChannel(processed, 'XYZ-X');
    }
    if (document.getElementById('xyzYToggle').checked) {
      processed = extractChannel(processed, 'XYZ-Y');
    }
    if (document.getElementById('xyzZToggle').checked) {
      processed = extractChannel(processed, 'XYZ-Z');
    }
    if (document.getElementById('labLToggle').checked) {
      processed = extractChannel(processed, 'Lab-L');
    }
    if (document.getElementById('labAToggle').checked) {
      processed = extractChannel(processed, 'Lab-a');
    }
    if (document.getElementById('labBToggle').checked) {
      processed = extractChannel(processed, 'Lab-b');
    }
    if (document.getElementById('cmykCToggle').checked) {
      processed = extractChannel(processed, 'CMYK-C');
    }
    if (document.getElementById('cmykMToggle').checked) {
      processed = extractChannel(processed, 'CMYK-M');
    }
    if (document.getElementById('cmykYToggle').checked) {
      processed = extractChannel(processed, 'CMYK-Y');
    }
    if (document.getElementById('cmykKToggle').checked) {
      processed = extractChannel(processed, 'CMYK-K');
    }

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
      case 'HSV-H':
      case 'HSV-S':
      case 'HSV-V':
        let hsv = new cv.Mat();
        cv.cvtColor(mat, hsv, cv.COLOR_RGB2HSV);
        cv.split(hsv, channels);
        result = channels.get(channel === 'HSV-H' ? 0 : channel === 'HSV-S' ? 1 : 2);
        hsv.delete();
        break;
      case 'HSL-H':
      case 'HSL-S':
      case 'HSL-L':
        let hsl = new cv.Mat();
        cv.cvtColor(mat, hsl, cv.COLOR_RGB2HLS);
        cv.split(hsl, channels);
        result = channels.get(channel === 'HSL-H' ? 0 : channel === 'HSL-S' ? 2 : 1);
        hsl.delete();
        break;
      case 'XYZ-X':
      case 'XYZ-Y':
      case 'XYZ-Z':
        let xyz = new cv.Mat();
        cv.cvtColor(mat, xyz, cv.COLOR_RGB2XYZ);
        cv.split(xyz, channels);
        result = channels.get(channel === 'XYZ-X' ? 0 : channel === 'XYZ-Y' ? 1 : 2);
        xyz.delete();
        break;
      case 'Lab-L':
      case 'Lab-a':
      case 'Lab-b':
        let lab = new cv.Mat();
        cv.cvtColor(mat, lab, cv.COLOR_RGB2Lab);
        cv.split(lab, channels);
        result = channels.get(channel === 'Lab-L' ? 0 : channel === 'Lab-a' ? 1 : 2);
        lab.delete();
        break;
      case 'CMYK-C':
      case 'CMYK-M':
      case 'CMYK-Y':
      case 'CMYK-K':
        // For CMYK, we need to convert RGB to CMYK manually
        const cmyk = convertRGBToCMYK(mat);
        result = cmyk.get(channel === 'CMYK-C' ? 0 : channel === 'CMYK-M' ? 1 : channel === 'CMYK-Y' ? 2 : 3);
        cmyk.delete();
        break;
      default:
        result = mat;
    }

    channels.delete();
    return result;
  }

  function convertRGBToCMYK(mat) {
    const cmyk = new cv.MatVector();
    const k = new cv.Mat(mat.rows, mat.cols, cv.CV_8UC1);
    const c = new cv.Mat(mat.rows, mat.cols, cv.CV_8UC1);
    const m = new cv.Mat(mat.rows, mat.cols, cv.CV_8UC1);
    const y = new cv.Mat(mat.rows, mat.cols, cv.CV_8UC1);

    for (let i = 0; i < mat.rows; i++) {
      for (let j = 0; j < mat.cols; j++) {
        let R = mat.ucharPtr(i, j)[0];
        let G = mat.ucharPtr(i, j)[1];
        let B = mat.ucharPtr(i, j)[2];

        let K = 1 - Math.max(R / 255, G / 255, B / 255);
        let C = (1 - (R / 255) - K) / (1 - K);
        let M = (1 - (G / 255) - K) / (1 - K);
        let Y = (1 - (B / 255) - K) / (1 - K);

        k.ucharPtr(i, j)[0] = K * 255;
        c.ucharPtr(i, j)[0] = C * 255;
        m.ucharPtr(i, j)[0] = M * 255;
        y.ucharPtr(i, j)[0] = Y * 255;
      }
    }

    cmyk.push_back(c);
    cmyk.push_back(m);
    cmyk.push_back(y);
    cmyk.push_back(k);

    return cmyk;
  }
});
