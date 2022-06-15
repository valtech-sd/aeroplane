let canvas,
  video,
  poseNet,
  poses = [],
  flyingMode = 'calculating...',
  flyingModeText,
  speed = 'calculating...',
  speedText,
  flightDirectionText,
  speedDirectionText;

function setup() {
  canvas = createCanvas(800, 560);
  canvas.position((windowWidth - width) / 2, 300);

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  poseNet = ml5.poseNet(video, 'single', modelReady);
  poseNet.on('pose', function (results) {
    poses = results;
  });

  flightDirectionText = createP('flight direction:');
  flightDirectionText.position(90, 10);

  flyingModeText = createP('');
  flyingModeText.position(200, 10);

  speedDirectionText = createP('speed direction:');
  speedDirectionText.position(90, 60);

  speedText = createP('');
  speedText.position(200, 40);
}

function modelReady() {
  console.log('pose net ready');
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  background(255, 240);
  pop();

  // right zone
  noStroke();
  fill(200, 150, 176, 100);
  rectMode(CENTER);
  rect(700, height / 2, width / 3, height);

  // left zone
  noStroke();
  fill(200, 150, 176, 100);
  rectMode(CENTER);
  rect(100, 280, width / 3, height);

  flyAeroplane();
  drawSkeleton();

  flyingModeText.html(flyingMode);
  speedText.html(speed);
  speedText.style('font-size', '28px');
}

function flyAeroplane() {
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;

    let nose = pose.keypoints[0];
    let leftWrist = pose.keypoints[9];
    let rightWrist = pose.keypoints[10];

    let rightWristPositionX = rightWrist.position.x;
    let rightWristPositionY = rightWrist.position.y;
    let leftWristPositionX = leftWrist.position.x;
    let leftWristPositionY = leftWrist.position.y;

    if (nose.score > 0.5) {
      // right and left wrist are in their respective zones
      // if (
      //   width - rightWristPositionX > width - width / 3 &&
      //   rightWristPositionX > 0 &&
      //   width - leftWristPositionX < width - 600 &&
      //   leftWristPositionX < 800
      // ) {
      // right zone
      if (rightWristPositionY > height / 2) {
        // right bottom
      } else {
        // right top
      }

      // left zone
      if (leftWristPositionY > height / 2) {
        // left bottom
      } else {
        // left top
      }

      if (rightWristPositionY > leftWristPositionY) {
        if (rightWristPositionY - leftWristPositionY > 50) {
          console.log('turning right');
          flyingMode = 'turning right';
          speed = (rightWristPositionY - leftWristPositionY).toFixed(2);
        } else {
          console.log('flying straight');
          flyingMode = 'flying straight';
          speed = 0;
        }
      } else if (rightWristPositionY < leftWristPositionY) {
        if (leftWristPositionY - rightWristPositionY > 50) {
          console.log('turning left');
          flyingMode = 'turning left';
          speed = (rightWristPositionY - leftWristPositionY).toFixed(2);
        } else {
          console.log('flying straight');
          flyingMode = 'flying straight';
          speed = 0;
        }
      }
    }

    if (width - leftWristPositionX < width - 600 && leftWristPositionX < 800) {
    }
  }
  // }
}

function drawSkeleton() {
  for (let i = 0; i < poses.length; i++) {
    const pose = poses[i].pose;

    const nose = pose.keypoints[0];
    const leftEye = pose.keypoints[1];
    const rightEye = pose.keypoints[2];
    const leftEar = pose.keypoints[3];
    const rightEar = pose.keypoints[4];
    const leftShoulder = pose.keypoints[5];
    const rightShoulder = pose.keypoints[6];
    const leftElbow = pose.keypoints[7];
    const rightElbow = pose.keypoints[8];
    const leftWrist = pose.keypoints[9];
    const rightWrist = pose.keypoints[10];
    const leftHip = pose.keypoints[11];
    const rightHip = pose.keypoints[12];
    const leftKnee = pose.keypoints[13];
    const rightKnee = pose.keypoints[14];
    const leftAnkle = pose.keypoints[15];
    const rightAnkle = pose.keypoints[16];

    if (nose.score > 0.5) {
      strokeWeight(5);
      strokeCap(ROUND);
      stroke('black');
      fill('rgb(52, 252, 164)');

      // head
      const faceRadius = dist(width - nose.position.x, nose.position.y, width - leftEar.position.x, leftEar.position.y);
      ellipse(width - nose.position.x, nose.position.y, faceRadius, faceRadius + 60);

      // shoulders
      line(width - rightShoulder.position.x, rightShoulder.position.y, width - rightElbow.position.x, rightElbow.position.y);
      //line joining left shoulder to elbow
      line(width - leftShoulder.position.x, leftShoulder.position.y, width - leftElbow.position.x, leftElbow.position.y);

      // top arm
      line(width - rightElbow.position.x, rightElbow.position.y, width - rightWrist.position.x, rightWrist.position.y);
      line(width - leftElbow.position.x, leftElbow.position.y, width - leftWrist.position.x, leftWrist.position.y);

      // elbows
      ellipse(width - leftElbow.position.x, leftElbow.position.y, 30, 30);
      ellipse(width - rightElbow.position.x, rightElbow.position.y, 30, 30);

      // wrists
      ellipse(width - rightWrist.position.x, rightWrist.position.y, 30, 30);
      ellipse(width - leftWrist.position.x, leftWrist.position.y, 30, 30);

      // body
      quad(
        width - rightShoulder.position.x,
        rightShoulder.position.y,
        width - leftShoulder.position.x,
        leftShoulder.position.y,
        width - leftHip.position.x,
        leftHip.position.y,
        width - rightHip.position.x,
        rightHip.position.y
      );

      // top legs
      line(width - rightHip.position.x, rightHip.position.y, width - rightKnee.position.x, rightKnee.position.y);
      line(width - leftHip.position.x, leftHip.position.y, width - leftKnee.position.x, leftKnee.position.y);

      // bottom legs
      line(width - rightKnee.position.x, rightKnee.position.y, width - rightAnkle.position.x, rightAnkle.position.y);
      line(width - leftKnee.position.x, leftKnee.position.y, width - leftAnkle.position.x, leftAnkle.position.y);

      // hips
      ellipse(width - rightHip.position.x, rightHip.position.y, 30, 30);
      ellipse(width - leftHip.position.x, leftHip.position.y, 30, 30);

      // knees
      ellipse(width - rightKnee.position.x, rightKnee.position.y, 30, 30);
      ellipse(width - leftKnee.position.x, leftKnee.position.y, 30, 30);

      // ankles
      ellipse(width - leftAnkle.position.x, leftAnkle.position.y, 30, 30);
      ellipse(width - rightAnkle.position.x, rightAnkle.position.y, 30, 30);
    }
  }
}
