class Drop {
  constructor() {
    this.x = random(width / 2, -width / 2);
    this.y = random(-height / 2 - 75, -height - 50);

    this.z = random(0, 20);

    this.length = map(this.z, 0, 20, 10, 20);
    this.yspeed = map(this.z, 0, 20, 4, 10);
  }

  fall() {
    this.y = this.y + this.yspeed;
    this.grav = map(this.z, 0, 20, 0, 0.2);
    this.yspeed = this.yspeed + this.grav;

    if (this.y > height / 2) {
      this.y = random(-height / 2 - 100, -height);
      this.yspeed = map(this.z, 0, 20, 4, 10);
    }
  }

  render() {
    push();
    this.thick = map(this.z, 0, 20, 1, 3);
    stroke(138, 43, 236);
    strokeWeight(this.thick);
    line(this.x, this.y, this.x, this.y + this.length);
    pop();
  }
}
