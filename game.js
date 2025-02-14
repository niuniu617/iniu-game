// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏参数
const CELL_SIZE = 40;
const GAME_SPEED = 200; // 移动速度（数值越大越慢）
canvas.width = 800;
canvas.height = 600;

// 加载图片
const images = {
    dragon: {
        up: new Image(),
        down: new Image(),
        left: new Image(),
        right: new Image()
    },
    cow: new Image()
};

// 游戏状态
let snake = {
    body: [{x: 400, y: 300}],
    direction: 'right',
    nextDirection: 'right'
};
let food = {x: 0, y: 0};
let score = 0;
let gameLoopInterval;

// 强化版图片加载
function loadImage(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            console.log(`图片加载成功: ${path}`);
            resolve(img);
        };
        img.onerror = (err) => {
            console.error(`图片加载失败: ${path}`, err);
            reject(err);
        };
    });
}

async function loadAllImages() {
    try {
        images.dragon.up = await loadImage('./images/dragon_up.png');
        images.dragon.down = await loadImage('./images/dragon_down.png');
        images.dragon.left = await loadImage('./images/dragon_left.png');
        images.dragon.right = await loadImage('./images/dragon_right.png');
        images.cow = await loadImage('./images/cow_head.png');
        console.log('所有图片加载完成');
        startGame();
    } catch (error) {
        alert('图片加载失败，请检查控制台！');
        console.error('图片加载错误:', error);
    }
}

// 生成食物
function generateFood() {
    let isValidPosition = false;
    do {
        food.x = Math.floor(Math.random() * (canvas.width/CELL_SIZE)) * CELL_SIZE;
        food.y = Math.floor(Math.random() * (canvas.height/CELL_SIZE)) * CELL_SIZE;
        isValidPosition = !snake.body.some(segment => 
            segment.x === food.x && segment.y === food.y
        );
    } while (!isValidPosition);
}

// 游戏逻辑
function update() {
    // 更新方向
    snake.direction = snake.nextDirection;

    // 计算新头部位置
    let head = {...snake.body[0]};
    switch(snake.direction) {
        case 'up': head.y -= CELL_SIZE; break;
        case 'down': head.y += CELL_SIZE; break;
        case 'left': head.x -= CELL_SIZE; break;
        case 'right': head.x += CELL_SIZE; break;
    }

    // 穿墙逻辑
    if (head.x < 0) head.x = canvas.width - CELL_SIZE;
    else if (head.x >= canvas.width) head.x = 0;
    if (head.y < 0) head.y = canvas.height - CELL_SIZE;
    else if (head.y >= canvas.height) head.y = 0;

    // 自身碰撞检测
    if (snake.body.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    // 添加新头部
    snake.body.unshift(head);

    // 吃食物检测
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = `得分: ${score}`;
        generateFood();
    } else {
        snake.body.pop();
    }
}

function draw() {
    // 清空画布
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制食物
    ctx.drawImage(images.cow, food.x, food.y, CELL_SIZE, CELL_SIZE);

    // 绘制龙
    snake.body.forEach((segment, index) => {
        if(index === 0) { // 头部
            ctx.drawImage(images.dragon[snake.direction], segment.x, segment.y, CELL_SIZE, CELL_SIZE);
        } else { // 身体
            ctx.fillStyle = '#3498db';
            ctx.fillRect(segment.x + 2, segment.y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        }
    });
}

function gameOver() {
    clearInterval(gameLoopInterval);
    alert(`撞到自己啦！最终得分: ${score}`);
}

function startGame() {
    if(gameLoopInterval) clearInterval(gameLoopInterval);
    generateFood();
    gameLoopInterval = setInterval(() => {
        update();
        draw();
    }, GAME_SPEED);
}

// 事件监听
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp': if(snake.direction !== 'down') snake.nextDirection = 'up'; break;
        case 'ArrowDown': if(snake.direction !== 'up') snake.nextDirection = 'down'; break;
        case 'ArrowLeft': if(snake.direction !== 'right') snake.nextDirection = 'left'; break;
        case 'ArrowRight': if(snake.direction !== 'left') snake.nextDirection = 'right'; break;
    }
});

document.querySelector('.restart').addEventListener('click', () => {
    snake = {
        body: [{x: 400, y: 300}],
        direction: 'right',
        nextDirection: 'right'
    };
    score = 0;
    document.getElementById('score').textContent = `得分: 0`;
    generateFood();
    startGame();
});

// 按钮控制
const directionControls = {
    'up': () => { if(snake.direction !== 'down') snake.nextDirection = 'up'; },
    'down': () => { if(snake.direction !== 'up') snake.nextDirection = 'down'; },
    'left': () => { if(snake.direction !== 'right') snake.nextDirection = 'left'; },
    'right': () => { if(snake.direction !== 'left') snake.nextDirection = 'right'; }
};

document.querySelectorAll('.btn').forEach(btn => {
    const direction = btn.classList[1];
    if (directionControls[direction]) {
        btn.addEventListener('click', directionControls[direction]);
        btn.addEventListener('touchstart', directionControls[direction]); // 移动端支持
    }
});

// 初始化游戏
loadAllImages();