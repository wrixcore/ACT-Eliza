const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { createCanvas, loadImage } = require('canvas');
const { promisify } = require('util');

class ElizaVideoProcessor {
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

  async extractFrames(videoPath, outputFolder) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
      }

      ffmpeg(videoPath)
        .output(`${outputFolder}/frame_%03d.png`)
        .on('end', () => {
          const files = fs.readdirSync(outputFolder).filter(f => f.startsWith('frame_') && f.endsWith('.png'));
          resolve(files.length);
        })
        .on('error', reject)
        .run();
    });
  }

  async processFrame(framePath, outputPath, options = {}) {
    const {
      fontSize = 8,
      distance = -3,
      outputHeight = 700,
      color = '#00ff22'
    } = options;

    try {
      const image = await loadImage(framePath);
      
      const aspectRatio = image.width / image.height;
      const outputWidth = Math.floor(outputHeight * aspectRatio);
      
      const canvas = createCanvas(outputWidth, outputHeight);
      const ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, outputWidth, outputHeight);
      
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
      fs.writeFileSync(outputPath, buffer);
      
    } catch (error) {
      console.error(`Error processing frame ${framePath}:`, error);
      throw error;
    }
  }

  async videoToAsciiArt(videoPath, outputFolder, options = {}) {
    const {
      fontSize = 8,
      distance = -3,
      outputHeight = 700,
      color = '#00ff22'
    } = options;

    console.log('Extracting frames from video...');
    const framesFolder = path.join(outputFolder, 'temp_frames');
    const asciiFolder = path.join(outputFolder, 'ascii_frames');
    
    if (!fs.existsSync(asciiFolder)) {
      fs.mkdirSync(asciiFolder, { recursive: true });
    }

    try {
      const frameCount = await this.extractFrames(videoPath, framesFolder);
      console.log(`Extracted ${frameCount} frames`);

      console.log('Processing frames to ASCII art...');
      const frameFiles = fs.readdirSync(framesFolder).filter(f => f.endsWith('.png')).sort();
      
      for (let i = 0; i < frameFiles.length; i++) {
        const framePath = path.join(framesFolder, frameFiles[i]);
        const outputPath = path.join(asciiFolder, `ascii_${frameFiles[i]}`);
        
        await this.processFrame(framePath, outputPath, options);
        
        if ((i + 1) % 10 === 0) {
          console.log(`Processed ${i + 1}/${frameFiles.length} frames`);
        }
      }

      console.log('All frames processed successfully');
      return frameFiles.length;
      
    } catch (error) {
      console.error('Error processing video:', error);
      throw error;
    }
  }

  async createMP4(videoPath, outputFolder, outputPath) {
    return new Promise((resolve, reject) => {
      const asciiFolder = path.join(outputFolder, 'ascii_frames');
      const inputPattern = path.join(asciiFolder, 'ascii_frame_%03d.png');
      
      ffmpeg()
        .input(inputPattern)
        .inputFPS(30)
        .input(videoPath)
        .outputOptions([
          '-c:v libx264',
          '-pix_fmt yuv420p',
          '-c:a aac',
          '-shortest'
        ])
        .output(outputPath)
        .on('end', () => {
          console.log(`ASCII video saved to: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', reject)
        .run();
    });
  }

  async videoToAsciiText(videoPath, outputFolder, options = {}) {
    const {
      fontSize = 7,
      density = 1,
      outputHeight = 100,
      framesPerFile = 100
    } = options;

    console.log('Converting video to ASCII text...');
    const framesFolder = path.join(outputFolder, 'temp_frames');
    
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    try {
      const frameCount = await this.extractFrames(videoPath, framesFolder);
      console.log(`Extracted ${frameCount} frames`);
      
      const frameFiles = fs.readdirSync(framesFolder).filter(f => f.endsWith('.png')).sort();
      const frameData = [];
      
      for (const frameFile of frameFiles) {
        const framePath = path.join(framesFolder, frameFile);
        const asciiText = await this.frameToText(framePath, options);
        frameData.push(asciiText);
      }

      let fileNum = 0;
      for (let i = 0; i < frameData.length; i += framesPerFile) {
        const fileName = path.join(outputFolder, `ascii_frames_${fileNum}.txt`);
        const fileContent = frameData.slice(i, i + framesPerFile).join('\n\n');
        fs.writeFileSync(fileName, fileContent);
        fileNum++;
      }

      console.log(`ASCII text files saved to: ${outputFolder}`);
      return fileNum;
      
    } catch (error) {
      console.error('Error converting video to text:', error);
      throw error;
    }
  }

  async frameToText(framePath, options = {}) {
    const {
      fontSize = 7,
      density = 1,
      outputHeight = 100
    } = options;

    try {
      const image = await loadImage(framePath);

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
      
      return asciiText;
      
    } catch (error) {
      console.error('Error converting frame to text:', error);
      throw error;
    }
  }
}

module.exports = ElizaVideoProcessor;

if (require.main === module) {
  const processor = new ElizaVideoProcessor();
  
  const inputVideo = path.join(__dirname, 'input', 'input.mp4');
  const outputFolder = path.join(__dirname, 'output_video');
  
  processor.videoToAsciiArt(inputVideo, outputFolder, {
    fontSize: 8,
    distance: -3,
    outputHeight: 700,
    color: '#00ff22'
  }).then(frameCount => {
    console.log(`Processed ${frameCount} frames`);
    
    const outputVideo = path.join(outputFolder, 'ascii_art_video.mp4');
    return processor.createMP4(inputVideo, outputFolder, outputVideo);
  }).catch(console.error);
}
