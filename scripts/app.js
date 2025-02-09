const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// консты
const ARROW_SPEED = 10;
const CRATE_SPEED = 2;
const ICE_CUBE_SPEED = 2;
const GAME_ACCELERATION = 0.2;
const GAME_ACCELERATION_INTERVAL = 3500;
const DEFAULT_KNIGHT_SPEED = 2;
const CRATE_DAMAGE = 3;
const ARROW_DAMAGE = 5;
let CURRENT_ACCELERATION = 0;
setInterval(() => {
  CURRENT_ACCELERATION += GAME_ACCELERATION;
}, [GAME_ACCELERATION_INTERVAL]);

const keys = {
  KeyA: false,
  KeyD: false,
  KeyW: false,
  KeyS: false,
};

let thisTime = Date.now();
const startTime = Date.now();

const sprite = new Image();
sprite.src = "./assets/run.png";

const frameWidth = 128; // Ширина одного кадра
const frameHeight = 128; // Высота
const totalFrames = 7; // Сколько всего кадров
let frameDelay = 10;
let currentFrame = 0;
let facingRight = true;
let frameCounter = 0;
const knight = {
  x: 150,
  y: canvas.height / 2 - frameHeight,
  hp: 100,
  speed: DEFAULT_KNIGHT_SPEED,
  width: 128,
  height: 128,
};
const heartImage = new Image();
heartImage.src = "./assets/heart.png";
heartImage.width = 40;
heartImage.height = 40;

const iceCubeImage = new Image();
iceCubeImage.src = "./assets/ice-cube.png";
iceCubeImage.width = 40;
iceCubeImage.height = 40;

const crateImage = new Image();
crateImage.src = "./assets/crate.png";
crateImage.width = 50;
crateImage.height = 50;

const arrowImage = new Image();
arrowImage.src = "./assets/arrow.png";
arrowImage.width = 70;
arrowImage.height = 30;

const iceCubes = [];
const crates = [];
const arrows = [];
const hearts = [];

let gameOver = false;

// * отвечает за ускорение, можно поставить разные функции РУПД или ускорение тоже ускоряется и тд
const getSpeed = (obstacleType) => {
  switch (obstacleType) {
    case "arrow":
      return ARROW_SPEED + CURRENT_ACCELERATION;
    case "ice-cube":
      return ICE_CUBE_SPEED + CURRENT_ACCELERATION;
    case "crate":
      return CRATE_SPEED + CURRENT_ACCELERATION;
  }
};
const checkCollision = (item) => {
  const padding = 30;
  return (
    knight.x + padding < item.x + item.width &&
    knight.x + knight.width - padding > item.x &&
    knight.y + padding < item.y + item.height &&
    knight.y + knight.height - padding > item.y
  );
};
const generateObstacles = () => {
  if (Math.random() < 0.015) {
    arrows.push({
      x: canvas.width,
      y: generateKnightRelativePosition(100),
      width: arrowImage.width,
      height: 50,
    });
  }
  if (Math.random() < 0.02 && crates.length < 20) {
    crates.push({
      x: canvas.width,
      y: canvas.height * Math.random(),
      width: crateImage.width,
      height: crateImage.height,
    });
  }
  if (Math.random() < 0.02 && iceCubes.length < 10) {
    iceCubes.push({
      x: canvas.width,
      y: canvas.height * Math.random(),
      width: iceCubeImage.width,
      height: iceCubeImage.height,
    });
  }
  if (Date.now() - thisTime > 2500) {
    thisTime = Date.now();
    hearts.push({
      x: canvas.width,
      y: Math.random() * canvas.height,
      width: heartImage.width,
      height: heartImage.height,
    });
  }
  hearts.forEach((heart, index) => {
    if (heart.x > -100) heart.x -= getSpeed("ice-cube");
    else {
      hearts.splice(index, 1);
    }
  });
  iceCubes.forEach((iceCube, index) => {
    if (iceCube.x > -100) iceCube.x -= getSpeed("ice-cube");
    else {
      iceCubes.splice(index, 1);
    }
  });
  crates.forEach((crate, index) => {
    if (crate.x > -100) crate.x -= getSpeed("crate");
    else {
      crates.splice(index, 1);
    }
  });
  arrows.forEach((arrow, index) => {
    if (arrow.x > -100) arrow.x -= getSpeed("arrow");
    else {
      arrows.splice(index, 1);
    }
  });

  hearts.forEach((heart, index) => {
    if (checkCollision(heart)) {
      hearts.splice(index, 1);
      knight.hp += 5;
    }
  });
  iceCubes.forEach((iceCube, index) => {
    if (checkCollision(iceCube)) {
      knight.speed = DEFAULT_KNIGHT_SPEED / 2;
      let backInterval = setInterval(() => {
        knight.speed = DEFAULT_KNIGHT_SPEED;
        clearInterval(backInterval);
      }, [3000]);
      console.log("Ударился о куб");
      iceCubes.splice(index, 1);
    }
  });
  crates.forEach((crate, index) => {
    if (checkCollision(crate)) {
      knight.hp -= CRATE_DAMAGE;
      console.log("Ударился о ящик");
      crates.splice(index, 1);
    }
  });
  arrows.forEach((arrow, index) => {
    if (checkCollision(arrow)) {
      knight.speed = DEFAULT_KNIGHT_SPEED * 0.3;
      knight.hp -= ARROW_DAMAGE;
      let backInterval = setInterval(() => {
        knight.speed = DEFAULT_KNIGHT_SPEED;
        clearInterval(backInterval);
      }, [500]);
      arrows.splice(index, 1);
      console.log("Ударился о стрелу");
    }
  });
};

const generateKnightRelativePosition = (precision) => {
  const knightCenter = knight.y + knight.height / 2;
  const offset = (Math.random() - 0.5) * precision * 15; // разброс
  return knightCenter + offset;
};
document.addEventListener("keydown", (event) => {
  if (keys.hasOwnProperty(event.code)) {
    keys[event.code] = true;
  }
});

document.addEventListener("keyup", (event) => {
  if (keys.hasOwnProperty(event.code)) {
    keys[event.code] = false;
  }
});

function gameLoop() {
  if (gameOver || knight.hp <= 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Игра закончена", canvas.width / 2 - 100, canvas.height / 2);
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  generateObstacles();
  $("#hp").html(knight.hp);
  $("#speed").html(knight.speed);
  $("#objects-counter").html(arrows.length + crates.length + iceCubes.length);

  hearts.forEach((heart) =>
    ctx.drawImage(heartImage, heart.x, heart.y, heart.width, heart.height)
  );

  crates.forEach((crate) =>
    ctx.drawImage(crateImage, crate.x, crate.y, crate.width, crate.height)
  );
  iceCubes.forEach((iceCube) =>
    ctx.drawImage(
      iceCubeImage,
      iceCube.x,
      iceCube.y,
      iceCube.width,
      iceCube.height
    )
  );
  arrows.forEach((arrow) => {
    ctx.drawImage(arrowImage, arrow.x, arrow.y, arrow.width, arrow.height);

    ctx.restore();
  });

  if (keys.KeyA) {
    knight.x -= knight.speed;
    facingRight = false;
  }
  if (keys.KeyD) {
    knight.x += knight.speed;
    facingRight = true;
  }
  if (keys.KeyW) knight.y -= knight.speed;
  if (keys.KeyS) knight.y += knight.speed;

  if (knight.x < 0) knight.x = 0;
  if (knight.x + frameWidth > canvas.width)
    knight.x = canvas.width - frameWidth;
  if (knight.y < 0) knight.y = 0;
  if (knight.y + frameHeight > canvas.height)
    knight.y = canvas.height - frameHeight;

  ctx.save();

  if (!facingRight) {
    ctx.scale(-1, 1);
    ctx.drawImage(
      sprite,
      currentFrame * frameWidth,
      0,
      frameWidth,
      frameHeight,
      -knight.x - frameWidth / 2,
      knight.y,
      frameWidth,
      frameHeight
    );
  } else {
    ctx.drawImage(
      sprite,
      currentFrame * frameWidth,
      0,
      frameWidth,
      frameHeight,
      knight.x,
      knight.y,
      frameWidth,
      frameHeight
    );
  }

  ctx.restore(); // Восстанавливаем состояние холста

  if (frameCounter % frameDelay === 0) {
    if (keys.KeyA || keys.KeyD || keys.KeyW || keys.KeyS) {
      currentFrame = (currentFrame + 1) % totalFrames;
    }
  }
  frameCounter++;

  requestAnimationFrame(gameLoop);
}

sprite.onload = gameLoop;
