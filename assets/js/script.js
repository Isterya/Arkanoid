const canvasNode = document.getElementById('arkanoid'),
   ctx = canvasNode.getContext('2d'),
   screens = document.querySelectorAll('.screen'),
   startButton = document.querySelector('.start-game'),
   backHomeButtons = document.querySelectorAll('.back-home'),
   winCounterElement = document.querySelector('.win-counter'),
   specialMessageElement = document.querySelector('.special-message');

const ballRadius = 10,
   paddleWidth = 75,
   paddleHeight = 10,
   brickRowCount = 5,
   brickColumnCount = 3,
   brickWidth = 75,
   brickHeight = 20,
   brickPadding = 10,
   brickOffset = 30;

let ballPositionX = canvasNode.width / 2,
   ballPositionY = canvasNode.height - 30,
   dx = 3,
   dy = -3,
   paddlePositionX = (canvasNode.width - paddleWidth) / 2,
   rightPressed = false,
   leftPressed = false,
   score = 0,
   lives = 3,
   animationFrameId;

let winCount = localStorage.getItem('winCount') ? parseInt(localStorage.getItem('winCount')) : 0;
winCounterElement.textContent = `Побед: ${winCount}`;
updateSpecialMessage(winCount);

const bricks = Array.from({ length: brickColumnCount }, () =>
   Array.from({ length: brickRowCount }, () => ({ x: 0, y: 0, status: 1 }))
);

ctx.fillStyle = '#ffcc65';
ctx.font = '16px Roboto, sans-serif';

function drawBall() {
   ctx.beginPath();
   ctx.arc(ballPositionX, ballPositionY, ballRadius, 0, Math.PI * 2);
   ctx.shadowColor = '#ffc0cb';
   ctx.shadowBlur = 15;
   ctx.fill();
   ctx.closePath();
   ctx.shadowBlur = 0;
}

function drawPaddle() {
   ctx.beginPath();
   ctx.rect(paddlePositionX, canvasNode.height - paddleHeight - 10, paddleWidth, paddleHeight);
   ctx.shadowColor = '#ffc0cb';
   ctx.shadowBlur = 15;
   ctx.fill();
   ctx.closePath();
   ctx.shadowBlur = 0;
}

function drawBricks() {
   bricks.forEach((column, columnIndex) => {
      column.forEach((brick, rowIndex) => {
         if (brick.status === 1) {
            const brickPositionX = rowIndex * (brickWidth + brickPadding) + brickOffset,
               brickPositionY = columnIndex * (brickHeight + brickPadding) + brickOffset;
            brick.x = brickPositionX;
            brick.y = brickPositionY;
            ctx.beginPath();
            ctx.rect(brickPositionX, brickPositionY, brickWidth, brickHeight);
            ctx.shadowColor = '#ffc0cb';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.closePath();
            ctx.shadowBlur = 0;
         }
      });
   });
}

function handleMouseMove(e) {
   const relativePositionX = e.clientX - canvasNode.offsetLeft;
   if (relativePositionX > 0 && relativePositionX < canvasNode.width) {
      paddlePositionX = relativePositionX - paddleWidth / 2;
   }
}

function handleTouchMove(e) {
   const relativePositionX = e.touches[0].clientX - canvasNode.offsetLeft;
   if (relativePositionX > 0 && relativePositionX < canvasNode.width) {
      paddlePositionX = relativePositionX - paddleWidth / 2;
   }
}

function handleKeyDown(e) {
   if (['Right', 'ArrowRight', 'd'].includes(e.key)) rightPressed = true;
   else if (['Left', 'ArrowLeft', 'a'].includes(e.key)) leftPressed = true;
}

function handleKeyUp(e) {
   if (['Right', 'ArrowRight', 'd'].includes(e.key)) rightPressed = false;
   else if (['Left', 'ArrowLeft', 'a'].includes(e.key)) leftPressed = false;
}

function drawScore() {
   ctx.fillText(`Счёт: ${score}`, 8, 20);
}

function drawLives() {
   ctx.fillText(`Жизней: ${lives}`, canvasNode.width - 85, 20);
}

function detectCollision() {
   bricks.forEach((column) => {
      column.forEach((brick) => {
         if (brick.status === 1) {
            if (
               ballPositionX > brick.x &&
               ballPositionX < brick.x + brickWidth &&
               ballPositionY > brick.y &&
               ballPositionY < brick.y + brickHeight
            ) {
               dy = -dy;
               brick.status = 0;
               score++;
               if (score === brickRowCount * brickColumnCount) {
                  winCount++;
                  localStorage.setItem('winCount', winCount);
                  winCounterElement.textContent = `Побед: ${winCount}`;
                  updateSpecialMessage(winCount);
                  showScreen(3);
               }
            }
         }
      });
   });
}

function resetBallAndPaddle() {
   ballPositionX = canvasNode.width / 2;
   ballPositionY = canvasNode.height - 30;
   dx = 3;
   dy = -3;
   paddlePositionX = (canvasNode.width - paddleWidth) / 2;
}

function draw() {
   ctx.clearRect(0, 0, canvasNode.width, canvasNode.height);
   drawBall();
   drawPaddle();
   drawBricks();
   drawScore();
   drawLives();
   detectCollision();

   if (ballPositionX + dx < ballRadius || ballPositionX + dx > canvasNode.width - ballRadius) {
      dx = -dx;
   }

   if (ballPositionY + dy < ballRadius) {
      dy = -dy;
   } else if (ballPositionY + dy > canvasNode.height - ballRadius) {
      if (
         ballPositionX > paddlePositionX &&
         ballPositionX < paddlePositionX + paddleWidth &&
         ballPositionY + dy >= canvasNode.height - paddleHeight - 10
      ) {
         dy = -dy;
         ballPositionY = canvasNode.height - paddleHeight - 10 - ballRadius;
      } else {
         lives--;
         if (lives === 0) {
            showScreen(2);
         } else {
            resetBallAndPaddle();
         }
      }
   }

   if (rightPressed && paddlePositionX < canvasNode.width - paddleWidth) {
      paddlePositionX += 7;
   } else if (leftPressed && paddlePositionX > 0) {
      paddlePositionX -= 7;
   }

   ballPositionX += dx;
   ballPositionY += dy;

   animationFrameId = requestAnimationFrame(draw);
}

function showScreen(index) {
   screens.forEach((screen, i) => {
      screen.classList.toggle('visible', i === index);
   });

   if (index !== 1) {
      cancelAnimationFrame(animationFrameId);
      resetBallAndPaddle();
      score = 0;
      lives = 3;
      bricks.forEach((column) => {
         column.forEach((brick) => {
            brick.status = 1;
         });
      });
   }
}

function updateSpecialMessage(wins) {
   let message = '';
   if (wins === 0) {
      message = 'Пока что Вы не побеждали...';
   } else if (wins === 5) {
      message = 'Вау, да Вы - мастер. Продолжайте в том же духе!';
   } else if (wins === 10) {
      message = 'Разработчик проекта снимает перед Вами шляпу, Вы - олицетворение усердия.';
   }
   specialMessageElement.textContent = message;
}

startButton.addEventListener('click', () => {
   showScreen(1);
   draw();
});

backHomeButtons.forEach((button) => {
   button.addEventListener('click', () => {
      showScreen(0);
   });
});

document.addEventListener('touchmove', handleTouchMove);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
