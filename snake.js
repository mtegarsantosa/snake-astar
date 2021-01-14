function Utils(params) {
  var blockSize = params.blockSize;
  var ctx = document.querySelector("canvas").getContext("2d");

  function drawStroke(start, end, color) {
    ctx.beginPath();
    ctx.setLineDash([5, 3]);
    ctx.moveTo((start[0] * blockSize) + (blockSize / 2), (start[1] * blockSize) + (blockSize / 2));
    ctx.lineTo((end[0] * blockSize) + (blockSize / 2), (end[1] * blockSize) + (blockSize / 2));
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  this.distance = (line1, line2, color) => {
    drawStroke(line1, line2, color);
  }
  this.distanceCount = (line1, line2, color) => {
    let d = Math.sqrt(Math.abs(line1[1] - line2[1]) + Math.abs(line1[0] - line2[0]));
    ctx.fillStyle = color;
    ctx.font = "15px Arial";
    ctx.fillText(d, line2[0] * blockSize, (line2[1] * blockSize) - 10);
  }
  this.distancePerpendicular = (line1, line2, line3, line4, color) => {
    ctx.fillStyle = color;
    ctx.font = "15px Arial";
    drawStroke(line1, line2, color);
    ctx.fillText([line2], line2[0] * blockSize, (line2[1] * blockSize) - 30);

    drawStroke(line3, line4, color);
    ctx.fillText([line4], line4[0] * blockSize, (line4[1] * blockSize) + 30);
  }
}

function Game(params) {
  if (typeof params.utils === "object") {
    var utils = params.utils;
  } else {
    var utils = {
      showGrid: false,
      distance: false,
      distancePerependicular: false
    }
  }

  var interval, timeInterval;

  var aStar = params.aStar; // is run AStar true/false
  var aStarBlock = []; // Astar recomendation for next move [x, y]
  var aStarBlockIndex = 0; // Index for looping aStar
  var move = []; // Snake next move [x, y]
  var ctx = document.querySelector("canvas").getContext("2d"); // Get canvas
  var size = params.size; // Size of board px
  var blockSize = params.blockSize; // Size of block px
  var totalBlock = Math.floor(size / blockSize); // Total rows and cols block
  var fps = params.fps; // Framerate
  var snake = [
    [1, 0],
    [0, 0]
  ]; // Snake body
  var direction = aStar ? false : 39; // Snake direction in keycode
  var food = []; // Food position [x, y]
  var scoreEl = document.querySelector("#score"); // HTML display score
  var score = 0; // Score

  // Sound Effect
  var eatedSound, gameOverSound;
  function setSound() {
    eatedSound = new Sound("sound/eated.mp3");
    gameOverSound = new Sound("sound/gameover.mp3");
  }

  function Sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function() {
      this.sound.play();
    }
    this.stop = function() {
      this.sound.pause();
    }
  }

  function gameOver() {
    clearInterval(interval);
    clearInterval(timeInterval);
    gameOverSound.play();
  }

  function drawBoard() {
    ctx.canvas.width = ctx.canvas.height = size;
    ctx.canvas.style.border = "1px solid #DDD";
  }

  function drawGrid() {
    for (var x = 0; x < totalBlock; x++) {
      for (var y = 0; y < totalBlock; y++) {
        ctx.strokeStyle = "#DDD";
        ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
      }
    }
  }

  function drawRect(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, blockSize, blockSize);
  }

  function drawSnake() {
    for (var i = 1; i < snake.length; i++) {
      ctx.strokeStyle = "#DDD";
      ctx.strokeRect(snake[i][0] * blockSize, snake[i][1] * blockSize, blockSize, blockSize);
      drawRect(snake[i][0] * blockSize, snake[i][1] * blockSize, "#000");
    }
    drawRect(snake[0][0] * blockSize, snake[0][1] * blockSize, "green");
  }

  function randomFood() {
    food = [
      Math.floor(Math.random() * totalBlock),
      Math.floor(Math.random() * totalBlock)
    ];
    snake.map((x) => {
      if (JSON.stringify(x) === JSON.stringify(food)) {
        randomFood();
      }
    });
  }

  function drawFood() {
    drawRect(food[0] * blockSize, food[1] * blockSize, "red");
  }

  function eated() {
    eatedSound.play();
    score += 1;
    scoreEl.innerHTML = score;
    snake.push(food);
  }

  function snakeMove() {
    document.onkeydown = function(e) {
      if (direction - e.keyCode !== 2 && direction - e.keyCode !== -2) {
        direction = e.keyCode;
      }
    }
    move = [snake[0][0], snake[0][1]];
    if (aStar) {
      if (aStarBlock[0] - move[1] == 1)
        direction = 40;
      else if (aStarBlock[0] - move[1] == -1)
        direction = 38;
      else if (aStarBlock[1] - move[0] == 1)
        direction = 39;
      else if (aStarBlock[1] - move[0] == -1)
        direction = 37;
    }
    switch (direction) {
      case 37: move[0] -= 1; break;
      case 38: move[1] -= 1; break;
      case 39: move[0] += 1; break;
      case 40: move[1] += 1; break;
    }
    if (move[0] > (totalBlock - 1) || move[1] > (totalBlock - 1) || move[0] < 0 || move[1] < 0) {
      gameOver();
    }
    snake.map((x) => {
      if (JSON.stringify(move) === JSON.stringify(x)) {
        gameOver();
      }
    });
    if (JSON.stringify(move) === JSON.stringify(food)) {
      eated();
      randomFood();
    }
    snake.unshift(move);
    snake.pop();
  }

  function runAStar(snakePos) {
    var board = [];
    for (var i = 0; i < totalBlock; i++) {
      board.push([]);
    }
    for (var i = 0; i < totalBlock; i++) {
      for (var j = board[i].length; j < totalBlock; j++) {
        board[i].push(1);
      }
    }
    for (var i = 0; i < snake.length; i++) {
      board[snake[i][1]][[snake[i][0]]] = 0;
    }
    board = new Graph(board);
    var start = board.grid[snakePos[1]][snakePos[0]];
    var end = board.grid[food[1]][food[0]];
    var result = astar.search(board, start, end);
    if (board.length == 0) {
    }
    aStarBlock = result.length > 0 ? aStarBlock = [result[0].x, result[0].y] : [0, 0];
  }

  // INIT
  setSound();
  utils.showGrid && drawGrid();
  drawSnake();
  randomFood();
  drawFood();
  runAStar(snake[0]);

  var utilities = new Utils({
    blockSize: blockSize
  }); // Show utilites

  function update() {
    snakeMove();
    drawBoard();
    utils.showGrid && drawGrid();
    drawSnake();
    drawFood();
    utils.distance && utilities.distance(snake[0], food, "blue");
    utils.distanceCount && utilities.distanceCount(snake[0], food, "blue");
    utils.distancePerpendicular && utilities.distancePerpendicular(snake[0], [food[0], snake[0][1]], snake[0], [snake[0][0], food[1]], "blue");
    aStar && runAStar(move);
  }

  this.play = () => {
    interval = setInterval(update, 1000 / fps);
    timeInterval = setInterval(function(){
      var timeEl = document.querySelector("#time");
      var time = (+timeEl.innerHTML+1);
      timeEl.innerHTML = time;
    }, 1000);
  }
  this.pause = () => {
    clearInterval(interval);
    clearInterval(timeInterval);
  }
}

// ASTAR ALGORITM
(function(definition) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = definition();
  } else if (typeof define === 'function' && define.amd) {
    define([], definition);
  } else {
    var exports = definition();
    window.astar = exports.astar;
    window.Graph = exports.Graph;
  }
})(function() {

  function pathTo(node) {
    var curr = node;
    var path = [];
    while (curr.parent) {
      path.unshift(curr);
      curr = curr.parent;
    }
    return path;
  }

  function getHeap() {
    return new BinaryHeap(function(node) {
      return node.f;
    });
  }

  var astar = {
    search: function(graph, start, end, options) {
      graph.cleanDirty();
      options = options || {};
      var heuristic = options.heuristic || astar.heuristics.manhattan,
        closest = options.closest || false;

      var openHeap = getHeap(),
        closestNode = start;
      var closedList = [];
      start.h = heuristic(start, end);

      openHeap.push(start);

      while (openHeap.size() > 0) {

        var currentNode = openHeap.pop();

        if (currentNode === end) {
          while (closedList.length > 0) closedList.pop().closed = false;
          return pathTo(currentNode);
        }

        currentNode.closed = true;
        closedList.push(currentNode);

        var neighbors = graph.neighbors(currentNode);

        for (var i = 0, il = neighbors.length; i < il; ++i) {
          var neighbor = neighbors[i];

          if (neighbor.closed || neighbor.isWall()) {
            continue;
          }

          var gScore = currentNode.g + neighbor.getCost(currentNode),
            beenVisited = neighbor.visited;

          if (!beenVisited || gScore < neighbor.g) {

            neighbor.visited = true;
            neighbor.parent = currentNode;
            neighbor.h = neighbor.h || heuristic(neighbor, end);
            neighbor.g = gScore;
            neighbor.f = neighbor.g + neighbor.h;
            graph.markDirty(neighbor);
            if (closest) {
              if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
                closestNode = neighbor;
              }
            }

            if (!beenVisited) {
              openHeap.push(neighbor);
            } else {
              openHeap.rescoreElement(neighbor);
            }
          }
        }
      }
      while (closedList.length > 0) closedList.pop().closed = false;

      if (closest) {
        return pathTo(closestNode);
      }

      return [];
    },
    heuristics: {
      manhattan: function(pos0, pos1) {
        var d1 = Math.abs(pos1.x - pos0.x);
        var d2 = Math.abs(pos1.y - pos0.y);
        return d1 + d2;
      },
      diagonal: function(pos0, pos1) {
        var D = 1;
        var D2 = Math.sqrt(2);
        var d1 = Math.abs(pos1.x - pos0.x);
        var d2 = Math.abs(pos1.y - pos0.y);
        return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
      }
    },
    cleanNode: function(node) {
      node.f = 0;
      node.g = 0;
      node.h = 0;
      node.visited = false;
      node.closed = false;
      node.parent = null;
    }
  };


  function Graph(gridIn, options) {
    options = options || {};
    this.nodes = [];
    this.diagonal = !!options.diagonal;
    this.grid = [];
    for (var x = 0; x < gridIn.length; x++) {
      this.grid[x] = [];

      for (var y = 0, row = gridIn[x]; y < row.length; y++) {
        var node = new GridNode(x, y, row[y]);
        this.grid[x][y] = node;
        this.nodes.push(node);
      }
    }
    this.init();
  }

  Graph.prototype.init = function() {
    this.dirtyNodes = [];
    for (var i = 0; i < this.nodes.length; i++) {
      astar.cleanNode(this.nodes[i]);
    }
  };

  Graph.prototype.cleanDirty = function() {
    for (var i = 0; i < this.dirtyNodes.length; i++) {
      astar.cleanNode(this.dirtyNodes[i]);
    }
    this.dirtyNodes = [];
  };

  Graph.prototype.markDirty = function(node) {
    this.dirtyNodes.push(node);
  };

  Graph.prototype.neighbors = function(node) {
    var ret = [];
    var x = node.x;
    var y = node.y;
    var grid = this.grid;

    if (grid[x - 1] && grid[x - 1][y]) {
      ret.push(grid[x - 1][y]);
    }

    if (grid[x + 1] && grid[x + 1][y]) {
      ret.push(grid[x + 1][y]);
    }

    if (grid[x] && grid[x][y - 1]) {
      ret.push(grid[x][y - 1]);
    }

    if (grid[x] && grid[x][y + 1]) {
      ret.push(grid[x][y + 1]);
    }

    if (this.diagonal) {
      if (grid[x - 1] && grid[x - 1][y - 1]) {
        ret.push(grid[x - 1][y - 1]);
      }

      if (grid[x + 1] && grid[x + 1][y - 1]) {
        ret.push(grid[x + 1][y - 1]);
      }

      if (grid[x - 1] && grid[x - 1][y + 1]) {
        ret.push(grid[x - 1][y + 1]);
      }

      if (grid[x + 1] && grid[x + 1][y + 1]) {
        ret.push(grid[x + 1][y + 1]);
      }
    }

    return ret;
  };

  Graph.prototype.toString = function() {
    var graphString = [];
    var nodes = this.grid;
    for (var x = 0; x < nodes.length; x++) {
      var rowDebug = [];
      var row = nodes[x];
      for (var y = 0; y < row.length; y++) {
        rowDebug.push(row[y].weight);
      }
      graphString.push(rowDebug.join(" "));
    }
    return graphString.join("\n");
  };

  function GridNode(x, y, weight) {
    this.x = x;
    this.y = y;
    this.weight = weight;
  }

  GridNode.prototype.toString = function() {
    return "[" + this.x + " " + this.y + "]";
  };

  GridNode.prototype.getCost = function(fromNeighbor) {
    if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
      return this.weight * 1.41421;
    }
    return this.weight;
  };

  GridNode.prototype.isWall = function() {
    return this.weight === 0;
  };

  function BinaryHeap(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  BinaryHeap.prototype = {
    push: function(element) {
      this.content.push(element);

      this.sinkDown(this.content.length - 1);
    },
    pop: function() {
      var result = this.content[0];
      var end = this.content.pop();
      if (this.content.length > 0) {
        this.content[0] = end;
        this.bubbleUp(0);
      }
      return result;
    },
    remove: function(node) {
      var i = this.content.indexOf(node);

      var end = this.content.pop();

      if (i !== this.content.length - 1) {
        this.content[i] = end;

        if (this.scoreFunction(end) < this.scoreFunction(node)) {
          this.sinkDown(i);
        } else {
          this.bubbleUp(i);
        }
      }
    },
    size: function() {
      return this.content.length;
    },
    rescoreElement: function(node) {
      this.sinkDown(this.content.indexOf(node));
    },
    sinkDown: function(n) {
      var element = this.content[n];

      while (n > 0) {

        var parentN = ((n + 1) >> 1) - 1;
        var parent = this.content[parentN];
        if (this.scoreFunction(element) < this.scoreFunction(parent)) {
          this.content[parentN] = element;
          this.content[n] = parent;
          n = parentN;
        }
        else {
          break;
        }
      }
    },
    bubbleUp: function(n) {
      var length = this.content.length;
      var element = this.content[n];
      var elemScore = this.scoreFunction(element);

      while (true) {
        var child2N = (n + 1) << 1;
        var child1N = child2N - 1;
        var swap = null;
        var child1Score;
        if (child1N < length) {
          var child1 = this.content[child1N];
          child1Score = this.scoreFunction(child1);

          if (child1Score < elemScore) {
            swap = child1N;
          }
        }

        if (child2N < length) {
          var child2 = this.content[child2N];
          var child2Score = this.scoreFunction(child2);
          if (child2Score < (swap === null ? elemScore : child1Score)) {
            swap = child2N;
          }
        }

        if (swap !== null) {
          this.content[n] = this.content[swap];
          this.content[swap] = element;
          n = swap;
        }
        else {
          break;
        }
      }
    }
  };

  return {
    astar: astar,
    Graph: Graph
  };

});
// END ASTAR ALGORITM
