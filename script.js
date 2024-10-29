let x;
let y;
let rowHeight;
let colWidth;
let folderImages = [];
let imageFolders = ['10', '365', 'apple', 'challenge', 'day', 'days', 'du', 'iphone', 'made', 'minecraft', 'music', 'pro', 'survival', 'video', 'vs']; // Add all your folder names here
let maxAttempts = 51; // Max number of images per folder (change based on how many you renamed)
let imagesShown = [];
let imagesShownX = [];
let imagesShownY = [];
let clickCount = 0;
// Background variables
let symbolSize = 18;
let streams = [];
let lastTime = 0;

let currentPage = 'main'; // Start with the main page
let pages = {
  main: {
    setup: setupMainPage,
    draw: drawMainPage,
    mouseClicked: mouseClickedMainPage
  },
  secondPage: {
    setup: setupSecondPage,
    draw: drawSecondPage,
    mouseClicked: mouseClickedSecondPage
  }
  // Add more pages as needed
};

let userInput = '';

function preload() {
  for (let i = 0; i < imageFolders.length; i++) {
    let folder = imageFolders[i];
    let imagesArray = [];
    
    for (let j = 1; j <= maxAttempts; j++) {
      let imagePath = `thumbnails/${folder}/image${j}.jpg`;
      let img = loadImage(imagePath, 
        // Success callback
        loadedImg => {
          loadedImg.resize(150, 0);
          imagesArray[j-1] = loadedImg;
        },
        // Error callback
        () => {
          // Skip failed loads
        }
      );
    }
    folderImages[i] = imagesArray;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  x = width;
  y = height;
  rowHeight = y / 3;
  colWidth = x / 5;
  
  setupBackground();
  
  imageMode(CENTER);
  stroke(255);
  strokeWeight(4);

  // Call the setup function for the current page
  pages[currentPage].setup();
}

function draw() {
  background(0);
  
  // Draw background
  drawBackground();

  // Draw UI elements for the current page
  pages[currentPage].draw();
}

function mouseClicked() {
  // Call the mouseClicked function for the current page
  pages[currentPage].mouseClicked();
}

function keyPressed() {
  if (key === 'c') {
    imagesShown = [];
    imagesShownX = [];
    imagesShownY = [];
  } 
  if (key === '1') {
    currentPage = 'main';
    pages[currentPage].setup();
  } else if (key === '2') {
    currentPage = 'secondPage';
    pages[currentPage].setup();
  }
}

// Background functions
function setupBackground() {
  let cols = ceil(width / symbolSize);
  // Limit maximum number of streams
  const maxStreams = Math.min(cols, 100); // Adjust this number based on performance
  streams = [];
  for (let i = 0; i < maxStreams; i++) {
    let x = i * (width / maxStreams);
    streams[i] = new Stream(x, height);
  }
}

function drawBackground() {
  let currentTime = millis();
  let elapsed = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Only update every other frame for better performance
  if (frameCount % 2 === 0) {
    for (let i = streams.length - 1; i >= 0; i--) {
      streams[i].update(elapsed);
      if (streams[i].isOffscreen()) {
        streams.splice(i, 1);
        // Only add new stream if we're below maximum
        if (streams.length < 100) {
          streams.push(new Stream(random(width), height));
        }
      }
    }
  }

  // Draw all streams
  for (let stream of streams) {
    stream.render();
  }
}

class Stream {
  constructor(x, canvasHeight) {
    this.x = x;
    this.y = random(-1000, 0);
    this.speed = random(1, 5);
    this.characters = [];
    this.totalLength = round(random(5, 15)); // Reduced max length
    this.canvasHeight = canvasHeight;
    
    // Pre-calculate character positions
    this.characterPositions = Array(this.totalLength).fill().map((_, i) => i * symbolSize);
    
    // Initialize characters
    for (let i = 0; i < this.totalLength; i++) {
      this.characters.push(this.randomChar());
    }
  }

  randomChar() {
    if (userInput === '') {
      return Math.random() < 0.5 ? '0' : '1';
    } else {
      return userInput.charAt(Math.floor(Math.random() * userInput.length));
    }
  }

  update(elapsed) {
    this.y += this.speed;
    if (this.y > height) {
      this.y = random(-1000, 0);
    }
    if (random() < 0.1) {
      this.characters[floor(random(this.characters.length))] = this.randomChar();
    }
  }

  isOffscreen() {
    return this.y - this.totalLength * symbolSize > this.canvasHeight;
  }

  render() {
    if (this.y < -this.totalLength * symbolSize || this.y > this.canvasHeight) {
      return;
    }
    
    push();
    textSize(symbolSize);
    noStroke();
    
    for (let i = 0; i < this.totalLength; i++) {
      let y = this.y + (i * symbolSize);
      if (y > 0 && y < height) {
        let alpha = map(i, 0, this.totalLength - 1, 255, 50);
        
        // Single glow effect for better performance
        fill(0, 255, 70, alpha / 2);
        text(this.characters[i], this.x, y);
        
        fill(50, 255, 120, alpha);
        text(this.characters[i], this.x, y);
      }
    }
    pop();
  }
}

// Main page functions
function setupMainPage() {
  // Setup specific to the main page
}

function drawMainPage() {
  // Draw UI elements for the main page
  for(let i = 0; i < imagesShown.length; i++) {
    image(imagesShown[i], imagesShownX[i], imagesShownY[i]);
  }
  
  textSize(18);
  for(let row = 0; row < 3; row++) {
    let useRow = (rowHeight/2) + (row * rowHeight);
    for(let col = 0; col < 5; col++) {
      let useCol = (colWidth/2) + (col * colWidth);
      if(dist(mouseX, mouseY, useCol, useRow) < x/15) {
        fill(0);
        text(imageFolders[(row*5)+col], useCol, useRow + x/15);
        ellipse(useCol, useRow, x/15, x/15);
        break;
      }
    }
  }
}

function mouseClickedMainPage() {
  let rowClicked = Math.floor(mouseY/rowHeight)*5;
  let colClicked = Math.floor(mouseX/colWidth);
  let folderNum = rowClicked + colClicked;
  let imgNum = Math.floor(random(0, 50));
  imagesShown.push(folderImages[folderNum][imgNum]);
  imagesShownX.push(mouseX);
  imagesShownY.push(mouseY);
  image(folderImages[folderNum][imgNum], mouseX, mouseY);
  clickCount++;
  if (clickCount >= 20) {
    currentPage = 'secondPage';
    pages[currentPage].setup();
  }
}

// Second page functions
function setupSecondPage() {
  // Setup specific to the second page
}

function drawSecondPage() {
  background(0);
  
  // Draw background normally
  drawBackground();

  // Draw UI elements for the second page
  fill(50, 255, 120);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Who do you think I am?", width / 2, height / 2 - 50);
  
  // Create an input box only once
  if (!this.input) {
    this.input = createInput();
    let inputWidth = 200;
    this.input.size(inputWidth);
    this.input.position(width/2 - inputWidth/2, height/2);
    this.input.style('background-color', 'black');
    this.input.style('color', 'rgb(50, 255, 120)');
    this.input.style('border', '2px solid rgb(50, 255, 120)');
  }
  
  // Create a submit button only once
  if (!this.button) {
    this.button = createButton('Submit');
    let buttonWidth = 100;
    this.button.size(buttonWidth);
    this.button.position(width/2 - buttonWidth/2, height/2 + 40);
    this.button.mousePressed(() => {
      if (this.input) {
        // Create the form data
        const formData = new FormData();
        formData.append('form-name', 'matrix-responses');
        formData.append('answer', this.input.value());
        formData.append('timestamp', new Date().toISOString());

        // Submit the form
        fetch('/', {
          method: 'POST',
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(formData).toString()
        })
        .then(() => {
          console.log('Form submitted successfully');
          // Continue with your existing transition code
          userInput = this.input.value();
          this.input.remove();
          this.button.remove();
          this.input = null;
          this.button = null;
          currentPage = 'main';
          clickCount = 0;
          imagesShown = [];
          imagesShownX = [];
          imagesShownY = [];
          setupBackground();
          pages[currentPage].setup();
        })
        .catch(error => console.log('Form submission error:', error));
      }
    });
    this.button.style('background-color', 'black');
    this.button.style('color', 'rgb(50, 255, 120)');
    this.button.style('border', '2px solid rgb(50, 255, 120)');
  }
}

function mouseClickedSecondPage() {
  // Add implementation for the second page
}
