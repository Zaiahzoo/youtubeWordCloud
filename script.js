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
let questions = [
  "Who do you think I am?",
  "How old am I?",
  "What do I do in my free time?",
  "Where do I live?",
  "What am I interested in?"
]
let currentQuestion;

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
  
};

let userInput = '';

let previousAnswers = ['0', '1']; // Default to binary if no submissions exist

let loading = true; // Flag to indicate loading state
let loadingText = "Welcome to the YouTube Matrix... Figure out who I am based on my YouTube viewing patterns."; // Text to display
let currentText = ""; // Text currently displayed
let typingSpeed = 50; // Speed of typing in milliseconds
let lastTypedTime = 0; // Time of the last character typed
let textIndex = 0; // Current index of the text being typed

let inputField; // Declare input field variable
let submitButton; // Declare submit button variable

async function fetchSubmissions() {
  try {
    const response = await fetch('/.netlify/functions/get-submissions');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.submissions && data.submissions.length > 0) {
      // Add new submissions to our array
      previousAnswers = data.submissions.map(sub => sub.answer);
      console.log('Loaded submissions:', previousAnswers);
    }
  } catch (error) {
    console.log('Error fetching submissions:', error);
    // Keep using default binary values
    previousAnswers = ['0', '1'];
  }
}

async function loadImages() {
  for (let i = 0; i < imageFolders.length; i++) {
    let folder = imageFolders[i];
    let imagesArray = [];

    // Create an array of promises for loading images
    const loadPromises = [];
    for (let j = 1; j <= maxAttempts; j++) {
      let imagePath = `thumbnails/${folder}/image${j}.jpg`;
      loadPromises.push(new Promise((resolve) => {
        loadImage(imagePath, 
          loadedImg => {
            loadedImg.resize(150, 0);
            imagesArray[j - 1] = loadedImg;
            resolve(); // Resolve the promise when the image is loaded
          },
          () => {
            // Skip failed loads
            resolve(); // Resolve even if the image fails to load
          }
        );
      }));
    }

    // Wait for all images in the folder to load
    await Promise.all(loadPromises);
    folderImages[i] = imagesArray;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Start loading images and submissions
  Promise.all([fetchSubmissions(), loadImages()]).then(() => {
    loading = false; // Set loading to false when done
  });
  
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
  if (loading) {
    drawLoadingScreen(); // Call the loading screen function
    handleTyping(); // Handle the typing effect
  } else {
    background(0);
    
    // Set stroke based on the current page
    if (currentPage === 'main') {
      stroke(255); // White stroke for the main page
      strokeWeight(4); // Thicker stroke for the main page
    } else if (currentPage === 'secondPage') {
      stroke(255); // White stroke for the second page
      strokeWeight(2); // Thinner stroke for the second page
    }

    // Draw background
    drawBackground();

    // Draw UI elements for the current page
    pages[currentPage].draw();
  }
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
    
    // Pre-calculate positions for better performance
    this.characterPositions = Array(this.totalLength).fill().map((_, i) => i * symbolSize);
    
    // Setup stream type and content
    if (userInput !== '') {
      this.streamType = Math.random() < 0.3 ? 'userInput' : 
                       (Math.random() < 0.5 ? 'submission' : 'binary');
    } else {
      this.streamType = Math.random() < 0.3 ? 'submission' : 'binary';
    }
    
    // If it's a submission stream, pick one submission
    if (this.streamType === 'submission' && previousAnswers.length > 0) {
      this.selectedSubmission = previousAnswers[Math.floor(Math.random() * previousAnswers.length)];
    }
    
    // Fill the stream with appropriate characters
    for (let i = 0; i < this.totalLength; i++) {
      this.characters.push(this.randomChar());
    }
  }

  randomChar() {
    switch(this.streamType) {
      case 'userInput':
        return userInput.charAt(Math.floor(Math.random() * userInput.length));
      case 'submission':
        if (this.selectedSubmission) {
          return this.selectedSubmission.charAt(Math.floor(Math.random() * this.selectedSubmission.length));
        }
        // Fall through to binary if no submission available
      default:
        return Math.random() < 0.5 ? '0' : '1';
    }
  }

  render() {
    if (this.y < -this.totalLength * symbolSize || this.y > this.canvasHeight) {
      return;
    }
    
    push();
    textSize(symbolSize);
    noStroke();
    
    // Only render visible characters
    const startIndex = Math.max(0, Math.floor(-this.y / symbolSize));
    const endIndex = Math.min(this.totalLength, Math.ceil((this.canvasHeight - this.y) / symbolSize));
    
    for (let i = startIndex; i < endIndex; i++) {
      let y = this.y + this.characterPositions[i];
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

  update(elapsed) {
    this.y += this.speed;
  }

  isOffscreen() {
    return this.y > this.canvasHeight;
  }

  reset() {
    this.y = 0;
    // Reselect stream type
    if (userInput !== '') {
      this.streamType = Math.random() < 0.3 ? 'userInput' : 
                       (Math.random() < 0.5 ? 'submission' : 'binary');
    } else {
      this.streamType = Math.random() < 0.3 ? 'submission' : 'binary';
    }
    
    // If it's a submission stream, pick one submission
    if (this.streamType === 'submission' && previousAnswers.length > 0) {
      this.selectedSubmission = previousAnswers[Math.floor(Math.random() * previousAnswers.length)];
    }
    
    // Refill characters
    this.characters = [];
    for (let i = 0; i < this.totalLength; i++) {
      this.characters.push(this.randomChar());
    }
  }
}

// Main page functions
function setupMainPage() {
  // Clear any existing input field and button
  if (inputField) {
    inputField.remove(); // Remove the input field
    inputField = null; // Set to null to indicate it's removed
  }
  
  if (submitButton) {
    submitButton.remove(); // Remove the submit button
    submitButton = null; // Set to null to indicate it's removed
  }

  // Setup specific to the main page
  // Add any additional setup code for the main page here
}

function drawMainPage() {
  // Draw UI elements for the main page
  for (let i = 0; i < imagesShown.length; i++) {
    image(imagesShown[i], imagesShownX[i], imagesShownY[i]);
  }
  
  textSize(18);
  for (let row = 0; row < 3; row++) {
    let useRow = (rowHeight / 2) + (row * rowHeight);
    for (let col = 0; col < 5; col++) {
      let useCol = (colWidth / 2) + (col * colWidth);
      if (dist(mouseX, mouseY, useCol, useRow) < x / 15) {
        fill(0);
        text(imageFolders[(row * 5) + col], useCol, useRow + x / 15);
        ellipse(useCol, useRow, x / 15, x / 15);
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
  currentQuestion = random(questions)
}

function drawSecondPage() {
  // Call the background drawing function
  drawBackground(); // Ensure the background is drawn first
  
  // Draw UI elements for the second page
  fill(50, 255, 120);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(currentQuestion, width / 2, height / 2 - 50);
  
  // Create input field if it doesn't exist
  if (!inputField) {
    inputField = createInput();
    inputField.position(width / 2 - 100, height / 2);
    inputField.size(200);
    inputField.style('background-color', 'black');
    inputField.style('color', 'rgb(50, 255, 120)');
    inputField.style('border', '2px solid rgb(50, 255, 120)');
  }
  
  // Create submit button if it doesn't exist
  if (!submitButton) {
    submitButton = createButton('Submit');
    submitButton.position(width / 2 - 50, height / 2 + 40);
    submitButton.size(100);
    submitButton.mousePressed(handleSubmit); // Call handleSubmit on click
    submitButton.style('background-color', 'black');
    submitButton.style('color', 'rgb(50, 255, 120)');
    submitButton.style('border', '2px solid rgb(50, 255, 120)');
  }
}

function mouseClickedSecondPage() {
  // Add implementation for the second page
}

// Function to handle form submission
function handleSubmit() {
  if (inputField) {
    const formData = new FormData();
    formData.append('form-name', 'matrix-responses');
    formData.append('answer', inputField.value());
    formData.append('timestamp', new Date().toISOString());

    fetch('/', {
      method: 'POST',
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString()
    })
    .then(() => {
      console.log('Form submitted successfully');
      // Clear input field after submission
      inputField.value('');

      // Switch back to the main page
      currentPage = 'main'; // Set the current page to 'main'
      clickCount = 0; // Reset click count if needed
      imagesShown = []; // Clear shown images if needed
      imagesShownX = [];
      imagesShownY = [];
      setupBackground(); // Call setupBackground if needed
      pages[currentPage].setup(); // Call the setup function for the main page
    })
    .catch(error => console.log('Form submission error:', error));
  }
}

// Function to draw the loading screen
function drawLoadingScreen() {
  background(0); // Black background
  fill(50, 255, 120); // Set the fill color to match the scrolling text
  noStroke(); // Ensure no stroke is applied to the text
  textSize(32);
  textAlign(CENTER, CENTER);
  text(currentText, width / 2, height / 2); // Display the current text
}

// Function to handle the typing effect
function handleTyping() {
  if (millis() - lastTypedTime > typingSpeed && textIndex < loadingText.length) {
    // Check if the next characters form an ellipsis
    if (loadingText.substr(textIndex, 3) === '...') {
      currentText += '...\n'; // Add the ellipsis and a newline
      textIndex += 3; // Move the index forward by 3
    } else {
      const nextChar = loadingText.charAt(textIndex); // Get the next character

      // Check for other punctuation
      if (['.', '!', '?', ','].includes(nextChar)) {
        // Check if this is the last character
        if (textIndex < loadingText.length - 1) {
          currentText += nextChar + '\n'; // Add the punctuation and a newline
        } else {
          currentText += nextChar; // Just add the punctuation without a newline
        }
      } else {
        currentText += nextChar; // Add the next character
      }

      textIndex++; // Move to the next character
    }

    lastTypedTime = millis(); // Update the last typed time
  }
}