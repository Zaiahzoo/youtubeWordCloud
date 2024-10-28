let symbolSize = 18;
let timeElapsed = 0.0;
let cols;
let rows;
let streams = [];

String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}


function setupBackground() {
  cols = ceil(width / symbolSize);
  rows = ceil(height / symbolSize);
  
  streams = [];
  for (let i = 0; i < cols; i++) {
    let x = i * symbolSize;
    streams[i] = new Stream(x);
    streams[i].prepare();
  }
}

function drawBackground() {
  background(0);

  for (let i = 0; i < streams.length; i++) {
    streams[i].update(timeElapsed);
    streams[i].render();
  }
}

function windowResizedBackground() {
  setupBackground();
}


class Stream
{
    constructor(x)
    {
        this.x = x;
        this.y = 0;
        this.length = 1;
        this.text = "";
        this.interval = 0.05;
        this.time = 0.0;
    }
    
    prepare() 
    {
        this.y = random(-1000, 0);
        this.length = round(random(5, rows));
        this.text = this.getRandomString(this.length);
        this.interval = random(0.01, 0.08);
    }
    
    getRandomString(len)
    {
        let st = "";
        for (let i = 0; i < len; i++)
        {
            st += (this.randomChar());
            
        }
        return st;
    }
    
    
    
    shiftString(s)
    {
        return s.charAt(s.length-1) + s.substring(0, s.length -1);
    }
    
    randomChar()
    {
        return String.fromCharCode(
          0x30A0 + round(random(0, 96))
        );
    }
    
    flicker()
    {
        let r = round(random(0, 2));
        
        if (r == 0)
        {
            let idx = round( random(2, this.text.length) );
            this.text = this.text.replaceAt(idx, this.randomChar());            
        }
    }
    
    update(elapsed)
    {
        if (this.time >= this.interval)
        {
         	this.y += symbolSize;
            this.time = 0;
            
            this.text = this.shiftString(this.text);
        }
      
        if (this.y - (this.text.length * symbolSize) > height)
        {
            this.prepare();
        }
        
        this.flicker();
        
        this.time += elapsed;
        
    }
    
    
    render()
    {
        colorMode(HSB, 360, 100, 100);
        
        for (let i = 0; i < this.text.length; i++) {
            let _y = this.y + (i * symbolSize);
            
            // Only render if the character is within the canvas
            if (_y > 0 && _y < height) {
                let col = color(132, 92, 82);
                
                let brightVal = map(this.interval, 0.01, 0.08, 100, 20);
                col = color(132, 92, brightVal);
                
                let c = this.text[i];
                
                if (i < 4) {
                    col = color(132, 20, brightVal + 20);
                }
                
                if (i > this.text.length - (this.text.length / 4)) {
                    col = color(132, 92, brightVal - 20);
                }
                
                if (i == 0) {
                    c = this.randomChar();
                    col = color(0, 0, 100);
                }
                
                textSize(symbolSize);
                fill(col);
                text(c, this.x, _y);
            }
        }
    }
}
