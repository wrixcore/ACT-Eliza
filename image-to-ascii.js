const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');
const GIFEncoder = require('gifencoder');
const { promisify } = require('util');

class ElizaImageProcessor {
  constructor() {
    this.asciiChars = [' ', "'", ':', 'i', 'I', 'J', '$'];
    this.brightnessLevels = [51, 102, 140, 170, 200, 210, 255];
  }

  brightnessToChar(brightness) {
    for (let i = 0; i < this.brightnessLevels.length; i++) {
      if (brightness < this.brightnessLevels[i]) {
        return this.asciiChars[i];
      }
    }
    return this.asciiChars[this.asciiChars.length - 1];
  }

  async imageToAsciiArt(imagePath, outputFolder, options = {}) {
    const {
      fontSize = 12,
      distance = -3,
      outputHeight = 700,
      color = '#00ff22'
    } = options;

    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    try {
      const image = await loadImage(imagePath);
      
      const aspectRatio = image.width / image.height;
      const outputWidth = Math.floor(outputHeight * aspectRatio);
      
      const canvas = createCanvas(outputWidth, outputHeight);
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, outputWidth, outputHeight);
      
      const tempCanvas = createCanvas(outputWidth, outputHeight);
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(image, 0, 0, outputWidth, outputHeight);
      const imageData = tempCtx.getImageData(0, 0, outputWidth, outputHeight);
      
      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = color;
      
      const charSpacing = fontSize + distance;
      
      for (let y = 0; y < outputHeight; y += charSpacing) {
        for (let x = 0; x < outputWidth; x += charSpacing) {
          const pixelIndex = (y * outputWidth + x) * 4;
          const r = imageData.data[pixelIndex];
          const g = imageData.data[pixelIndex + 1];
          const b = imageData.data[pixelIndex + 2];
          const a = imageData.data[pixelIndex + 3];
          
          if (a > 0) {
            const brightness = (r + g + b) / 3;
            const char = this.brightnessToChar(brightness);
            
            if (char !== ' ') {
              ctx.fillText(char, x, y);
            }
          }
        }
      }
      
      const buffer = canvas.toBuffer('image/png');
      const outputPath = path.join(outputFolder, 'ascii_art.png');
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`ASCII art saved to: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }

  async gifToAsciiFrames(gifPath, outputFolder, options = {}) {
    const {
      fontSize = 12,
      distance = -3,
      outputHeight = 700,
      color = '#00ff22'
    } = options;

    console.log('Processing GIF (simplified - first frame only)');
    
    try {
      await this.imageToAsciiArt(gifPath, outputFolder, options);
      console.log('GIF frame processed successfully');
    } catch (error) {
      console.error('Error processing GIF:', error);
      throw error;
    }
  }

  async imageToAsciiText(imagePath, outputPath, options = {}) {
    const {
      fontSize = 7,
      density = 1,
      outputHeight = 100
    } = options;

    try {
      const image = await loadImage(imagePath);
      
      const aspectRatio = image.width / image.height;
      const outputWidth = Math.floor(outputHeight * aspectRatio);
      
      const canvas = createCanvas(outputWidth, outputHeight);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, outputWidth, outputHeight);
      const imageData = ctx.getImageData(0, 0, outputWidth, outputHeight);
      
      let asciiText = '';
      const charSpacing = fontSize + density;
      
      for (let y = 0; y < outputHeight; y += charSpacing) {
        for (let x = 0; x < outputWidth; x += charSpacing) {
          const pixelIndex = (y * outputWidth + x) * 4;
          const r = imageData.data[pixelIndex];
          const g = imageData.data[pixelIndex + 1];
          const b = imageData.data[pixelIndex + 2];
          const a = imageData.data[pixelIndex + 3];
          
          if (a > 0) {
            const brightness = (r + g + b) / 3;
            const char = this.brightnessToChar(brightness);
            asciiText += char;
          } else {
            asciiText += ' ';
          }
        }
        asciiText += '\n';
      }
      
      fs.writeFileSync(outputPath, asciiText);
      console.log(`ASCII text saved to: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error('Error converting to ASCII text:', error);
      throw error;
    }
  }
}

module.exports = ElizaImageProcessor;

if (require.main === module) {
  const processor = new ElizaImageProcessor();
  
  const inputPath = path.join(__dirname, 'input', 'input.gif');
  const outputFolder = path.join(__dirname, 'output');
  
  processor.imageToAsciiArt(inputPath, outputFolder, {
    fontSize: 12,
    distance: -3,
    outputHeight: 700,
    color: '#00ff22'
  }).catch(console.error);
}
