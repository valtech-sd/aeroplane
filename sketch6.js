let canvas, video, poseNet, pose;
let jet;
let speed;
let averageSpeed = [];

function preload() {
  jet = loadModel('assets/jet.obj');
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  poseNet = ml5.poseNet(video);
  poseNet.on('pose', gotPoses);
}

function draw() {
  background(175);

  flyAeroplane();

  push();
  scale(70);
  translate(0, 4);
  rotateX(3);
  rotateZ(-smoothing(speed));
  model(jet);
  pop();
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
  }
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

  console.log(sum / lastOfArray.length / 1000);
  return sum / lastOfArray.length / 1000;
}
