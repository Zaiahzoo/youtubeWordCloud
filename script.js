let x = window.innerWidth
let y = window.innerHeight
let rowHeight = y / 3
let colWidth = x / 5

let folderImages = [];
let imageFolders = ['10', '365', 'apple', 'challenge', 'day', 'days', 'du', 'iphone', 'made', 'minecraft', 'music', 'pro', 'survival', 'video', 'vs']; // Add all your folder names here
let maxAttempts = 51; // Max number of images per folder (change based on how many you renamed)
let imagesShown = []
let imagesShownX = []
let imagesShownY = []

function preload() {
  // Loop through each folder
  for (let i = 0; i < imageFolders.length; i++) {
    let folder = imageFolders[i];
    let imagesArray = [];
    let stopLoading = false; // Flag to stop loading images

    // Try loading images in each folder until one fails
    for (let j = 1; j <= maxAttempts && !stopLoading; j++) {
      let imagePath = `thumbnails/${folder}/image${j}.jpg`; // Assuming jpg format
      
      loadImage(imagePath,
        function(successImg) {
          // If the image loads successfully, add to the array
          successImg.resize(150, 0);
          imagesArray.push(successImg);
        },
        function() {
          // When loading fails, set the stop flag to true
          console.log(`No more images in ${folder} after image${j - 1}`);
          stopLoading = true;
        }
      );
    }

    // Store the array of images for the current folder
    folderImages.push(imagesArray);
  }
}

function setup()
{
  createCanvas(window.innerWidth, window.innerHeight)
  stroke(255)
  strokeWeight(4)
  imageMode(CENTER)
}

function draw()
{
  background(255)

  for(let i = 0; i < imagesShown.length; i++)
    {
      image(imagesShown[i], imagesShownX[i], imagesShownY[i])
    }
  
  for(let row = 0; row < 3; row++)
  {
    let useRow = (rowHeight/2) + (row * rowHeight)
    for(let col = 0; col < 5; col++)
    {
      let useCol = (colWidth/2) + (col * colWidth)
      if(dist(mouseX, mouseY, useCol, useRow) < x/15)
      {
        fill(0)
        text(imageFolders[(row*5)+col], useCol, useRow + x/15)
        ellipse(useCol, useRow, x/15, x/15)
        break
      }
      
    }
  }
  
}

function mouseClicked()
{
  let rowClicked = Math.floor(mouseY/rowHeight)*5
  let colClicked = Math.floor(mouseX/colWidth)
  let folderNum = rowClicked + colClicked
  let imgNum = Math.floor(random(0, 50))
  imagesShown.push(folderImages[folderNum][imgNum])
  imagesShownX.push(mouseX)
  imagesShownY.push(mouseY)
  image(folderImages[folderNum][imgNum], mouseX, mouseY)
}

function keyPressed()
{
  if(key === 'c')
  {
    imagesShown = []
    imagesShownX = []
    imagesShownY = []
  }
}