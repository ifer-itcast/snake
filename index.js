class Game {
    constructor(id, snake, food, stone) {
        this.map = document.querySelector(id);
        this.rows = 20;
        this.columns = 20;
        this.size = 20;
        this.mapData = [];
        this.snake = snake;
        this.timer = null;
        this.food = food;
        this.stone = stone;
        this.lock = true;
        this.score = 0;
        this.levelScore = 5;

        this.init();
    }
    init() {
        this.addMapStyle();
        this.renderMap();
        this.renderSnake();

        this.start();
        this.bindEvent();

        this.randomCoordinate();
        this.renderFood();
        this.renderStone();

        this.addScoreStyle();
    }
    addMapStyle() {
        this.map.className = 'game';
        this.map.style.width = this.columns * this.size + 'px';
        this.map.style.height = this.rows * this.size + 'px';
    }
    renderMap() {
        for(var i = 0; i < this.rows; i ++) {
            var row = document.createElement('div');
            row.className = 'row';
            var arr = [];
            for(var j = 0; j < this.columns; j ++) {
                var column = document.createElement('div');
                column.className = 'column';
                row.appendChild(column);
                arr.push(column);
            }
            this.map.appendChild(row);
            this.mapData.push(arr);
        }
    }

    renderSnake() {
        for(var i = 0; i < this.snake.length; i ++) {
            this.mapData[this.snake[i].row][this.snake[i].column].style.backgroundColor = i === 0 ? 'red' : 'green';
        }
    }

    start() {
        this.timer = setInterval(() => {
            this.snake.move();

            if (this.knockedEdge() || this.snake.kill() || this.knockedStone()) {
                this.gameOver(' GameOver ~');
                return;
            }

            if (this.isEatFood()) {
                this.snake.growUp();
                this.randomCoordinate();
            }

            this.clear();
            this.renderSnake();
            this.renderFood();
            this.renderStone();

            this.lock = true;
        }, 200);
    }

    clear() {
        for(var i = 0; i< this.mapData.length; i ++) {
            for(var j = 0; j < this.mapData[i].length; j ++) {
                this.mapData[i][j].style.backgroundColor = '';
            }
        }
    }

    bindEvent() {
        window.onkeydown = (...args) => {
            if(!this.lock) return false;
            var kc = args[0].keyCode;
            if(kc === 37 || kc === 38 || kc === 39 || kc === 40) {
                // 定时器存在的时候才枷锁，如果定时句柄清了，还按了上键，就会加锁，影响后续键盘的使用
                if (this.timer) this.lock = false;
                this.snake.changeDirection(kc);
            }
        };
    }
    knockedEdge() {
        if(this.snake[0].row < 0 || this.snake[0].row > 19 || this.snake[0].column < 0 || this.snake[0].column > 19) {
            return true;
        }
    }
    gameOver(txt) {
        clearInterval(this.timer);
        this.timer = null;
        console.log('%c%s', 'color: red; background-color: yellow; font-size: 50px;', txt);
    }

    randomCoordinate() {
        var row = Math.floor(Math.random() * 20);
        var column = Math.floor(Math.random() * 20);

        if (this.snake[0].row === row && this.snake[0].column === column) {
            this.randomCoordinate();
            return;
        }

        this.food.row = row;
        this.food.column = column;
    }
    renderFood() {
        this.mapData[this.food.row][this.food.column].style.backgroundColor = 'pink';
    }

    isEatFood() {
        if(this.snake[0].row === this.food.row && this.snake[0].column === this.food.column) {
            this.score ++;
            this.renderScore();
            if (this.score === 2) {
                this.gameOver('过关了 ~~');
            }
            return true;
        }
    }

    knockedStone() {
        for(var i = 0; i < this.stone.stones.length; i ++) {
            if(this.snake[0].row === this.stone.stones[i].row && this.snake[0].column === this.stone.stones[i].column) {
                return true;
            }
        }
    }

    renderStone() {
        for(var i = 0; i < this.stone.stones.length;i ++) {
            this.mapData[this.stone.stones[i].row][this.stone.stones[i].column].style.backgroundColor = '#333';
        }
    }

    addScoreStyle() {
        this.scoreDom = document.createElement('div');
        this.scoreDom.className = 'score';
        this.map.appendChild(this.scoreDom);
        this.renderScore();
    }

    renderScore() {
        this.scoreDom.innerHTML = this.score;
    }
}

class Snake extends Array{
    constructor() {
        super();
        this[0] = { row: 10, column: 10 };
        this[1] = { row: 10, column: 9 };
        this[2] = { row: 10, column: 8 };
        this.length = 3;
        this.direction = 39;
        this.tail = null;
    }

    move() {
        this.tail = this.pop();
        if (this.direction === 39) {
            this.unshift({
                row: this[0].row,
                column: this[0].column + 1
            });
        } else if (this.direction === 37) {
            this.unshift({
                row: this[0].row,
                column: this[0].column - 1
            });
        } else if(this.direction === 40) {
            this.unshift({
                row: this[0].row + 1,
                column: this[0].column
            });
        } else if(this.direction === 38) {
            this.unshift({
                row: this[0].row - 1,
                column: this[0].column
            });
        }
    }
    changeDirection(direction) {
        var sp = Math.abs(this.direction - direction);
        if (sp === 0 || sp === 2) return;
        this.direction = direction;
    }

    kill() {
        for(var i = 1; i < this.length; i ++) {
            if (this[0].row === this[i].row && this[0].column === this[i].column) {
                return true;
            }
        }
    }
    growUp() {
        this.push(this.tail);
    }
}

class Food {
    constructor(row = 0, column = 0) {
        this.row = row;
        this.column = column;
    }
}

class Stone {
    constructor() {
        this.stones = [
            { row: 8, column: 8 },
            { row: 8, column: 7 },
            { row: 8, column: 6 },
            { row: 8, column: 5 },
            { row: 8, column: 4 }
        ]
    }
}

new Game('#app', new Snake(), new Food(), new Stone());