let canvas, video, poseNet, pose;

let jet;

let bg;

let glContext;

let flyingMode = 'waiting for posenet...',
  flyingModeText,
  speed = 'waiting for posenet...',
  speedText,
  flightDirectionText,
  speedDirectionText;

let framerate, framerateText;

let averageSpeed = [];

function preload() {
  jet = loadModel('assets/jet.obj', modelLoaded);
  // bg = createVideo('assets/beach.mp4', videoLoaded);
  bg = loadImage('assets/bg.png');
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  glContext = canvas.GL;

  video = createCapture(VIDEO);
  video.size(width, height);

  poseNet = ml5.poseNet(video, poseNetLoaded);
  poseNet.on('pose', gotPoses);

  flightDirectionText = createP('flight direction:');
  flightDirectionText.position(90, 10);
  flightDirectionText.style('color', 'white');

  flyingModeText = createP('');
  flyingModeText.position(200, 10);
  flyingModeText.style('color', 'white');

  speedDirectionText = createP('speed direction:');
  speedDirectionText.position(90, 60);
  speedDirectionText.style('color', 'white');

  speedText = createP('');
  speedText.position(200, 40);
  speedText.style('font-size', '28px');
  speedText.style('color', 'white');

  framerateText = createP('');
  framerateText.position(1000, 10);
  framerateText.style('font-size', '28px');
  framerateText.style('color', 'white');

  // bg.hide();
  video.hide();
}

function draw() {
  image(bg, -width / 2, -height / 2, width, height);
  glContext.clear(glContext.DEPTH_BUFFER_BIT);

  camera(0, 0, height / 2 / tan(PI / 6), 0, 0, 0, 0, 1, 0);

  // let fov = PI / 3;
  // let cameraZ = height / 2.0 / tan(fov / 2.0);
  // perspective(fov, width / height, cameraZ / 10.0, cameraZ * 10.0);

  ambientLight(255); // light that shines everywhere

  // fill(150, 0, 255);
  // normalMaterial();
  // noStroke()

  push();
  // ambientMaterial(0, 0, 255);
  scale(70);
  translate(0, 4);
  rotateX(3);
  rotateZ(-smoothing(speed));
  model(jet);
  pop();

  flyAeroplane();

  flyingModeText.html(flyingMode);
  speedText.html(speed);
  framerateText.html(frameRate().toFixed(0));

  if (frameRate() < 30) {
    framerateText.style('color', 'red');
    console.log('framerate is low: ', frameRate().toFixed(0));
  } else {
    framerateText.style('color', 'white');
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

function poseNetLoaded() {
  console.log('pose net ready');
}

function videoLoaded() {
  console.log('video loaded');
  // bg.loop();
  // bg.speed(3);
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
