## Snake Bot with A* Algorithm

<center><img src="https://lh3.googleusercontent.com/-9OlsnWlfcmk/YABdtG1GR4I/AAAAAAAAK1E/PveFciPdnZs0VMvWSdvTekeaFBHXsZAywCLcBGAsYHQ/image.png"/></center>


### Usage
```html
<script src="snake.js" charset="utf-8"></script>

<canvas></canvas>
<h1>Score: <span id="score">0</span> | Time: <span id="time">0</span>s</h1>

<script type="text/javascript">
    var snake = new Game({
      size: 400,
      blockSize: 15,
      fps: 25,
      utils: {
        showGrid: true,
        distance: true,
        distanceCount: true,
        distancePerpendicular: true
      },
      aStar: true
    });
    snake.play();
</script>
```

### API Documentation
this is API Documentation for function: 
```js
new Game();
```
| Key | Type | Desc |
|--|--|--|
| size | Number | Set board size in px|
| blockSize | Number | Set every block size in board|
|fps|Number|Game framerate|
|utils|Object| Show game utilities|
|aStar|Boolean|A* run configuration|


### Demo
**Automatic Mode:**
- open `auto.html` in your browser.
- click play button and let snake run with a* algorithm.

**Manual Mode:**
- open `manual.html` in your browser
- use arrow key on keyboard ⬅⬆➡⬇ to control snake.
