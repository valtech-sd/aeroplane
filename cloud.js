class Cloud {
  constructor(obj) {
    this.scale = random(2, 10).toFixed(0);
    let x = random(-width, width);
    let y = random(-height, height);
    let z = random(0, -20000);
    this.position = createVector(x, y, z);
    this.velocity = createVector(0, 0, 0);
    this.acceleration = createVector();

    this.obj = obj;
  }

  applyForce(force) {
    let f = force.copy();
    this.acceleration.add(f);
  }

  randomize() {
    this.scale = random(2, 10).toFixed(0);
    let x = random(-width, width);
    let y = random(-height, height);
    let z = -20000;
    this.position = createVector(x, y, z);
    this.velocity = createVector(0, 0, 0);
    this.acceleration = createVector(0, 0, 0);
  }

  update() {
    this.velocity.add(this.acceleration);

    this.position.add(this.velocity);
    this.acceleration.mult(0.8);

    if (this.position.z > 700) {
      this.randomize();
    }
  }

  render() {
    push();
    noStroke();
    // ambientMaterial(255, 0, 255);
    normalMaterial();
    // specularMaterial(255);
    // emissiveMaterial(255);
    translate(this.position.x * 8, -this.position.y * 4, this.position.z);
    scale(this.scale * 10);
    model(this.obj);
    pop();
  }
}
