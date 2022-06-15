let cloud;
let clouds = [];
let gravity;

function preload() {
  cloud = loadModel('assets/clouds.obj');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  gravity = createVector(0, 0.003, 0.007);

  for (let i = 0; i < 200; i++) {
    clouds.push(new Cloud(cloud));
  }
}

function draw() {
  background(175);

  ambientLight(255);

  for (let cloud of clouds) {
    cloud.applyForce(gravity);
    cloud.update();
    cloud.render();
  }
}
