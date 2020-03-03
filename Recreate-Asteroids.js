const ship = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  heading: -90
};

let asteroids = [];

function createAsteroid() {
    asteroid = {
        x: random(0,windowWidth),
        y: random(0, windowHeight),
        vx: random(-0.3, 0.3),
        vy: random(-0.3, 0.3),
        heading: random(0, 360),
        turnSpeed: random(-1, 1),
        numPoints: round(random(8, 14)),
        xPoints: [],
        yPoints: []
    };
    const radius = random(30, 60);
    for (let i = 0; i < asteroid.numPoints; i++) {
        const subRadius = radius + random(-10, 10);
        asteroid.xPoints.push(cos((i / asteroid.numPoints) * 360) * subRadius);
        asteroid.yPoints.push(sin((i / asteroid.numPoints) * 360) * subRadius);
    }
    return asteroid;
}

function drawAsteroid(asteroid) {
    push();
    stroke('purple');
    translate(asteroid.x, asteroid.y);
    rotate(asteroid.heading);

    beginShape();
    for (let i = 0; i < asteroid.numPoints; i++) {
        vertex(asteroid.xPoints[i], asteroid.yPoints[i]);
    }
    endShape(CLOSE);
  
    pop();
}

function drawAsteroids() {
    for (asteroid of asteroids) {
        drawAsteroid(asteroid);
    }
}

function updateAsteroid(asteroid) {
    asteroid.x += asteroid.vx;
    asteroid.y += asteroid.vy;
    asteroid.heading += asteroid.turnSpeed;
}

function updateAsteroids() {
    for (asteroid of asteroids) {
        updateAsteroid(asteroid);
    }
}

function drawShip() {
  push();
  stroke('white'); //  TRY changing the ship color to 'yellow'
  translate(ship.x, ship.y);
  rotate(ship.heading);

  // The front of the ship points along the X-axis and the right wing is
  // along the Y-axis. The center of your ship should be at 0, 0.

  // TRY changing the shape of the ship
  // Can you add a cockpit to the design?

  beginShape();
  vertex(10, 0);
  vertex(-10, 10);
  vertex(-5, 0);
  vertex(-10, -10);
  endShape(CLOSE);

  pop();
}

function checkInput() {
  let turn = 0; // 0 goes straight, -1 turns left and 1 turns right
  let accelerate = false;
  let fire = false;

  if (keyIsDown(UP_ARROW)) {
    accelerate = true;
  }
  if (keyIsDown(LEFT_ARROW)) {
    turn = -1;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    turn = 1;
  }
  if (keyIsDown(32)) {
    fire = true;
  }
  if (keyIsDown(83)) {
      asteroids.push(createAsteroid());
  }

  updateShip(turn, accelerate);
  updateWeapons(fire);
  updateAsteroids();
}

// TRY changing how your ship flies by adjusting these...
const TURN_SPEED = 3.0;
const ACCELERATION = 0.1;
const MAX_SPEED = 5.0;

function updateShip(turn, accelerate) {
  ship.heading += turn * TURN_SPEED;
  ship.x += ship.vx;
  ship.y += ship.vy;
  if (accelerate) {
    ship.vx += cos(ship.heading) * ACCELERATION;
    ship.vy += sin(ship.heading) * ACCELERATION;
    const speed = sqrt(sq(ship.vx) + sq(ship.vy));
    if (speed > MAX_SPEED) {
      ship.vx *= MAX_SPEED / speed;
      ship.vy *= MAX_SPEED / speed;
    }
  }
  wrap(ship);
}

function wrap(object) {

  // Reference:
  //   top of the screen is y = 0
  //   bottom of the screen is y = windowHeight
  //   left edge of the screen is x = 0
  //   right edge of the screen is x = windowWidth

  if (object.y < 0) {
    object.y += windowHeight;
  }
  if (object.y > windowHeight) {
    object.y -= windowHeight;
  }

  if (object.x < 0) {
    object.x += windowWidth;
  }
  if (object.x > windowWidth) {
    object.x -= windowWidth;
  }

}

function draw() {
  clear();
  background(0); // black
  stroke(255);  // white, the default color if not set elsewhere
  noFill();

  checkInput();
  drawShip();
  drawWeapons();
  drawAsteroids();
}

function centerShip() {
  ship.x = windowWidth/2;
  ship.y = windowHeight/2;
}

function setup() {
  angleMode(DEGREES);
  centerShip();
  createCanvas(windowWidth, windowHeight);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Weapon Systems
// For more information on arrays, see
//   https://www.w3schools.com/js/js_arrays.asp

const weapons = {
  chargeTime: 0, // 0 is ready to fire
  bullets: []
};

// TRY changing some properties of how the ship fires its weapons
const BULLET_RADIUS = 5;
const BULLET_SPEED = 7.0;
const CHARGE_TIME_PER_SHOT = 20;

function drawWeapons() {
  weapons.bullets.forEach((bullet) => {
    push();
    stroke('white'); // TRY changing the bullet colors
    // Can you make each bullet a different color?
    translate(bullet.x, bullet.y);
    ellipse(0, 0, BULLET_RADIUS, BULLET_RADIUS);
    pop();
  });
}

function updateWeapons(fire) {
  if (fire && weapons.chargeTime <= 0) {

    // TRY firing more than one direction when the user holds shift

    weapons.bullets.push(newBullet(ship.heading));
    weapons.chargeTime = CHARGE_TIME_PER_SHOT;
  } else if (weapons.chargeTime > 0) {
    // decrease weapon chargeTime until it is 0
    weapons.chargeTime--;
  }

  // advance bullets
  weapons.bullets.forEach((bullet) => {
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    // TRY making the bullets wrap
  });

  weapons.bullets = weapons.bullets.filter(bullet => {
    let hitAsteroid = false;
    asteroids = asteroids.filter(asteroid => {
      if (hitAsteroid)
        return true;
      const distance = sqrt(sq(bullet.x - asteroid.x) + sq((bullet.y - asteroid.y)));
      hitAsteroid = distance < asteroid.radius + BULLET_RADIUS;
      if (hitAsteroid)
        console.log("Hit Asteroid!");
      return !hitAsteroid;
    });
    return !hitAsteroid;
  });

  // keep only those bullets that are still in view
  weapons.bullets = weapons.bullets.filter(
    // TRY making the bullets dissapear after 5 seconds instead
    b => b.x >= 0 && b.y <= windowWidth && b.y >= 0 && b.y <= windowHeight
  );
}

function newBullet(heading) {
    const cosHeading = cos(heading);
    const sinHeading = sin(heading);
    return {
      x: ship.x + cosHeading * 10,
      y: ship.y + sinHeading * 10,
      vx: cosHeading * BULLET_SPEED,
      vy: sinHeading * BULLET_SPEED
    };
}

// Still looking for more to try?
// TRY adding asteroids
// TRY adding collision detection between all the things
//     - asteroids destroy your ship
//     - bullets destroy asteroids and your ship
