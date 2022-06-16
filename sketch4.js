let canvas,
  video,
  poseNet,
  pose,
  frameworkReady = false;

// models
let jet, cloud;

// background image
let bg;

// graphics library context
let glContext;

// flight direction
let flightDirectionText,
  flyingMode = 'waiting for posenet...',
  flyingModeText;

let speed = 'waiting for posenet...',
  speedText,
  speedDirectionText;

let framerate, framerateText;

let averageSpeed = [];

// developer mode
let debuggerMode = false;
let debuggerText;

let gravity;
let clouds = [];

// sounds
let toilet, inflight, announcements, takeoff;

// speech recognition
let speechRec, continuous, interimResults;

// speech recognition for debugger mode
let speech = '',
  speechText;
let speechParagraph = '';

let speechRecognition, speechRecognitionText;

// developer mode
let developerMode = true;

// rain
let drops = new Array(250);
let letItRain = false;

// snow
let snow = new Array(300);
let letItSnow = false;
let snowGravity;

function preload() {
  jet = loadModel('assets/jet.obj');
  bg = loadImage('assets/bg.png');
  cloud = loadModel('assets/clouds.obj');
  toilet = loadSound('assets/toilet.mp3');
  inflight = loadSound('assets/inflight.mp3');
  announcements = loadSound('assets/announcements.mp3', soundLoaded);
  takeoff = loadSound('assets/takeoff.mp3');
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  glContext = canvas.GL;

  isGoogleChrome();

  speechRec = new p5.SpeechRec('en-US', gotSpeech);
  continuous = false;
  interimResults = false;
  speechRec.onResult = gotSpeech;
  speechRec.onEnd = restart;
  speechRec.start(continuous, interimResults);

  video = createCapture(VIDEO);
  video.size(width, height);

  poseNet = ml5.poseNet(video, poseNetLoaded);
  poseNet.on('pose', gotPoses);

  flightDirectionText = createP('flight direction:');
  flightDirectionText.class('flightDirectionText');

  flyingModeText = createP('');
  flyingModeText.class('flyingModeText');

  speedDirectionText = createP('speed direction:');
  speedDirectionText.class('speedDirectionText');

  speedText = createP('');
  speedText.class('speedText');

  framerateText = createP('');
  framerateText.class('framerateText');

  speechText = createP('');
  speechText.class('speechText');

  speechParagraph = createP('speech recognition:');
  speechParagraph.class('speechParagraph');

  debuggerText = createP('Press D to toggle debugger mode');
  debuggerText.class('debugger');

  speechRecognitionText = createP(speechRecognition);
  speechRecognitionText.class('speechRecognitionText');

  // bg.hide();
  video.hide();
  flightDirectionText.hide();
  speedDirectionText.hide();
  speechParagraph.hide();
  debuggerText.hide();
  speechRecognitionText.hide();

  gravity = createVector(0, 0, 0.1);

  for (let i = 0; i < 20; i++) {
    clouds.push(new Cloud(cloud));
  }

  for (let i = 0; i < drops.length; i++) {
    drops[i] = new Drop();
  }

  snowGravity = createVector(0, 0.03, 0);

  for (let i = 0; i < snow.length; i++) {
    snow[i] = new Snowflake();
  }
}

function draw() {
  background(175);
  image(bg, -width / 2, -height / 2, width, height);
  glContext.clear(glContext.DEPTH_BUFFER_BIT);

  // camera(0, 0, height / 2 / tan(PI / 6), 0, 0, 0, 0, 1, 0);
  let fov = PI / 3;
  let cameraZ = height / 2.0 / tan(fov / 2.0);
  perspective(fov, width / height, cameraZ / 10.0, cameraZ * 20000.0);

  if (frameworkReady) {
    ambientLight(100); // light that shines everywhere

    push();
    scale(70);
    translate(0, 4);
    rotateX(3);
    rotateZ(-smoothing(speed));
    model(jet);
    pop();

    flyAeroplane();

    for (let cloud of clouds) {
      cloud.applyForce(gravity);
      cloud.update();
      cloud.render();
    }

    if (letItRain) {
      if (letItSnow) {
        letItSnow = false;
      }
      for (let drop of drops) {
        drop.fall();
        drop.render();
      }
    }

    if (letItSnow) {
      if (letItRain) {
        letItRain = false;
      }
      for (let flake of snow) {
        flake.applyForce(snowGravity);
        flake.update();
        flake.render();
      }
    }

    if (debuggerMode) {
      flightDirectionText.show();
      speedDirectionText.show();
      flyingModeText.show();
      speedText.show();
      framerateText.show();
      flyingModeText.html(flyingMode);
      speedText.html(speed);
      framerateText.html(frameRate().toFixed(0));
      speechText.show();
      speechText.html(speech);
      speechParagraph.show();
      speechRecognitionText.show();
    } else {
      flightDirectionText.hide();
      speedDirectionText.hide();
      flyingModeText.hide();
      speedText.hide();
      framerateText.hide();
      speechText.hide();
      speechParagraph.hide();
      speechRecognitionText.hide();
    }

    if (frameRate() < 30) {
      framerateText.style('color', 'red');
      // console.log('framerate is low: ', frameRate().toFixed(0));
    } else {
      framerateText.style('color', 'white');
    }
  }
}

function restart() {
  speechRec.start(continuous, interimResults);
}

function gotSpeech() {
  if (speechRec.resultValue) {
    let said = speechRec.resultString;
    speech = said;

    if (said === 'toilet') {
      if (inflight.isPlaying()) {
        inflight.stop();
      }

      toilet.play();

      setTimeout(() => {
        inflight.loop();
      }, 7000);
    }

    if (said.includes('rain')) {
      letItRain = !letItRain;
    }

    if (said.includes('snow')) {
      letItSnow = !letItSnow;
    }
  }
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
  }
}

function modelLoaded() {
  console.log('model loaded');
}

function soundLoaded() {
  console.log('sound loaded');
  if (!developerMode) {
    setTimeout(() => {
      // announcements.play(0, 1, 1, 17, 27);
      // setTimeout(() => {
      announcements.play(0, 1, 1, 125, 30);
      setTimeout(() => {
        takeoff.play(0, 1, 1, 0, 17);
        setTimeout(() => {
          frameworkReady = true;
          debuggerText.show();
          inflight.loop();
        }, 17000);
      }, 30000);
      // }, 27000);
    }, 2000);
  } else {
    frameworkReady = true;
    setTimeout(() => {
      debuggerText.show();
    }, 0);
  }
}

function poseNetLoaded() {
  console.log('pose net ready');
}

function videoLoaded() {
  console.log('video loaded');
}

function flyAeroplane() {
  if (pose) {
    let nose = pose.nose;
    let leftWrist = pose.leftWrist;
    let rightWrist = pose.rightWrist;

    let rightWristPositionY = rightWrist.y;
    let leftWristPositionY = leftWrist.y;

    if (nose.confidence > 0.5) {
      if (rightWristPositionY > leftWristPositionY) {
        if (rightWristPositionY - leftWristPositionY > 50) {
          flyingMode = 'turning right';
          speed = (rightWristPositionY - leftWristPositionY).toFixed(2);
        } else {
          flyingMode = 'flying straight';
          speed = 0;
        }
      } else if (rightWristPositionY < leftWristPositionY) {
        if (leftWristPositionY - rightWristPositionY > 50) {
          flyingMode = 'turning left';
          speed = (rightWristPositionY - leftWristPositionY).toFixed(2);
        } else {
          flyingMode = 'flying straight';
          speed = 0;
        }
      }
    }
  }
}

function smoothing(speed) {
  if (speed === 'waiting for posenet...') {
    return;
  }

  averageSpeed.push(parseInt(speed));
  let sum = 0;
  let lastOfArray = averageSpeed.slice(-20);

  for (let i = 0; i < lastOfArray.length; i++) {
    sum += lastOfArray[i];
  }

  return sum / lastOfArray.length / 1000;
}

function keyPressed() {
  if (key === 'd') {
    debuggerMode = !debuggerMode;
    debuggerText.hide();
  }
}

function isGoogleChrome() {
  const isChromium = window.chrome;
  const winNav = window.navigator;
  const vendorName = winNav.vendor;
  const isOpera = typeof window.opr !== 'undefined';
  const isIEedge = winNav.userAgent.indexOf('Edg') > -1;
  const isIOSChrome = winNav.userAgent.match('CriOS');

  if (isIOSChrome) {
    // is Google Chrome on IOS
  } else if (isChromium !== null && typeof isChromium !== 'undefined' && vendorName === 'Google Inc.' && isOpera === false && isIEedge === false) {
    // is Google Chrome
  } else {
    // not Google Chrome
    speechRecognition = 'This browser does not support Google Speech Recognition.  Please use Google Chrome Web Browser.';
  }
}
