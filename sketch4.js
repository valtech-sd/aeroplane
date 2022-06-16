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
let developerMode = false;
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

  speechRec = new p5.SpeechRec('en-US', gotSpeech);
  continuous = false;
  interimResults = false;
  speechRec.onResult = gotSpeech;
  speechRec.onEnd = restart;
  speechRec.start(continuous, interimResults);
  console.log(speechRec);

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

  debuggerText = createP('Press D for debugger mode');
  debuggerText.class('debugger');

  // bg.hide();
  video.hide();
  flightDirectionText.hide();
  speedDirectionText.hide();
  speechParagraph.hide();

  gravity = createVector(0, 0, 0.1);

  for (let i = 0; i < 20; i++) {
    clouds.push(new Cloud(cloud));
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

    if (developerMode) {
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
    } else {
      flightDirectionText.hide();
      speedDirectionText.hide();
      flyingModeText.hide();
      speedText.hide();
      framerateText.hide();
      speechText.hide();
      speechParagraph.hide();
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
  // if (!announcements.isPlaying()) {
  //   inflight.loop();
  // }
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
  // announcements.play(0, 1, 1, 17, 27);
  // setTimeout(() => {
  //   announcements.play(0, 1, 1, 125, 30);
  //   setTimeout(() => {
  //     takeoff.play(0, 1, 1, 0, 17);
  //     setTimeout(() => {
  //       frameworkReady = true;
  //       inflight.loop();
  //     }, 17000);
  //   }, 30000);
  // }, 27000);

  frameworkReady = true;
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
    developerMode = !developerMode;
    debuggerText.hide();
  }
}
