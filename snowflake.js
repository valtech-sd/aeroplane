function getRandomSize() {
  let r = randomGaussian() * 10;
  return constrain(abs(r), 2, 36);
}

class Snowflake {
  constructor() {
    this.x = random(-width / 2, width / 2);
    this.y = random(-height / 2 - 500, -height / 2 - 10);
    this.position = createVector(this.x, this.y, 0);
    this.velocity = createVector(0, 0, 0);
    this.acceleration = createVector();
    this.radius = getRandomSize();
  }

  applyForce(force) {
    let f = force.copy();
    f.mult(this.radius);
    this.acceleration.add(f);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.radius * 0.2);

    if (this.velocity.mag() < 1) {
      this.velocity.normalize();
    }

    this.position.add(this.velocity);
    this.acceleration.mult(0);

    if (this.offScreen()) {
      this.x = random(-width / 2, width / 2);
      this.y = random(-height / 2 - 100, -height / 2 - 10);
      this.position = createVector(this.x, this.y, 0);
    }
  }

  render() {
    push();
    stroke(255);
    strokeWeight(this.radius);
    point(this.position.x, this.position.y);
    pop();
  }

  offScreen() {
    return this.position.y > height / 2 + this.radius;
  }
}
