#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ElizaImageProcessor = require('./image-to-ascii');
const ElizaVideoProcessor = require('./video-to-ascii');
const ElizaLogoUtils = require('./logo-utils');

class ElizaAsciiArt {
  constructor() {
    this.imageProcessor = new ElizaImageProcessor();
    this.videoProcessor = new ElizaVideoProcessor();
    this.logoUtils = new ElizaLogoUtils();
    
    this.createDirectories();
  }

  createDirectories() {
    const dirs = ['input', 'output', 'output_video', 'output_txt'];
    dirs.forEach(dir => {
      const dirPath = path.join(__dirname, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  displayHelp() {
    console.log(`
Eliza ASCII Art Generator
========================

Transform your images and videos into stunning ASCII art!

USAGE:
  node index.js <command> [options]

COMMANDS:
  image-to-ascii    Convert image/GIF to ASCII art
  video-to-ascii    Convert video to ASCII art
  video-to-text     Convert video to ASCII text
  add-logo          Add logo to image
  resize            Resize image
  help              Show this help message

EXAMPLES:
  node index.js image-to-ascii input/image.png
  node index.js video-to-ascii input/video.mp4
  node index.js add-logo input/image.png input/logo.png
  node index.js resize input/image.png --width 800

OPTIONS:
  --output, -o      Output path
  --width, -w       Output width
  --height, -h      Output height
  --font-size, -f   Font size (default: 12)
  --distance, -d    Character distance (default: -3)
  --color, -c       ASCII color (default: #00ff22)

`);
  }

  parseArgs() {
    const args = process.argv.slice(2);
    const command = args[0];
    const options = {};
    const inputs = [];

    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--') || arg.startsWith('-')) {
        const key = arg.replace(/^-+/, '');
        const value = args[i + 1];
        
        switch (key) {
          case 'output':
          case 'o':
            options.output = value;
            i++;
            break;
          case 'width':
          case 'w':
            options.width = parseInt(value);
            i++;
            break;
          case 'height':
          case 'h':
            options.height = parseInt(value);
            i++;
            break;
          case 'font-size':
          case 'f':
            options.fontSize = parseInt(value);
            i++;
            break;
          case 'distance':
          case 'd':
            options.distance = parseInt(value);
            i++;
            break;
          case 'color':
          case 'c':
            options.color = value;
            i++;
            break;
          default:
            console.log(`Unknown option: ${arg}`);
      } else {
        inputs.push(arg);
      }
    }

    return { command, inputs, options };
  }

  async run() {
    console.log('Eliza ASCII Art Generator v1.0.0\n');
    
    const { command, inputs, options } = this.parseArgs();

    try {
      switch (command) {
        case 'image-to-ascii':
          await this.handleImageToAscii(inputs, options);
          break;
        
        case 'video-to-ascii':
          await this.handleVideoToAscii(inputs, options);
          break;
        
        case 'video-to-text':
          await this.handleVideoToText(inputs, options);
          break;
        
        case 'add-logo':
          await this.handleAddLogo(inputs, options);
          break;
        
        case 'resize':
          await this.handleResize(inputs, options);
          break;
        
        case 'help':
        case undefined:
          this.displayHelp();
          break;
        
        default:
          console.log(`Unknown command: ${command}`);
          console.log('Use "node index.js help" for usage information.');
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  }

  async handleImageToAscii(inputs, options) {
    if (inputs.length === 0) {
      console.log('Please provide an input image path');
      return;
    }

    const inputPath = inputs[0];
    const outputFolder = options.output || path.join(__dirname, 'output');
    
    console.log(`Converting ${inputPath} to ASCII art...`);
    
    const processingOptions = {
      fontSize: options.fontSize || 12,
      distance: options.distance || -3,
      outputHeight: options.height || 700,
      color: options.color || '#00ff22'
    };

    if (inputPath.toLowerCase().endsWith('.gif')) {
      await this.imageProcessor.gifToAsciiFrames(inputPath, outputFolder, processingOptions);
    } else {
      await this.imageProcessor.imageToAsciiArt(inputPath, outputFolder, processingOptions);
    }
    
    console.log('Conversion completed!');
  }

  async handleVideoToAscii(inputs, options) {
    if (inputs.length === 0) {
      console.log('Please provide an input video path');
      return;
    }

    const inputPath = inputs[0];
    const outputFolder = options.output || path.join(__dirname, 'output_video');
    
    console.log(`Converting ${inputPath} to ASCII art video...`);
    
    const processingOptions = {
      fontSize: options.fontSize || 8,
      distance: options.distance || -3,
      outputHeight: options.height || 700,
      color: options.color || '#00ff22'
    };

    const frameCount = await this.videoProcessor.videoToAsciiArt(inputPath, outputFolder, processingOptions);
    console.log(`Creating final video...`);
    
    const outputVideo = path.join(outputFolder, 'ascii_art_video.mp4');
    await this.videoProcessor.createMP4(inputPath, outputFolder, outputVideo);
    
    console.log('Video conversion completed!');
  }

  async handleVideoToText(inputs, options) {
    if (inputs.length === 0) {
      console.log('Please provide an input video path');
      return;
    }

    const inputPath = inputs[0];
    const outputFolder = options.output || path.join(__dirname, 'output_txt');
    
    console.log(`Converting ${inputPath} to ASCII text...`);
    
    const processingOptions = {
      fontSize: options.fontSize || 7,
      density: 1,
      outputHeight: options.height || 100,
      framesPerFile: 100
    };

    await this.videoProcessor.videoToAsciiText(inputPath, outputFolder, processingOptions);
    console.log('Text conversion completed!');
  }

  async handleAddLogo(inputs, options) {
    if (inputs.length < 2) {
      console.log('Please provide input image and logo paths');
      return;
    }

    const imagePath = inputs[0];
    const logoPath = inputs[1];
    const outputPath = options.output || imagePath.replace(/\.[^/.]+$/, '_with_logo.png');
    
    console.log(`Adding logo to ${imagePath}...`);
    
    const logoOptions = {
      logoPosition: 'bottom-right',
      logoScale: 0.1,
      margin: 20
    };

    await this.logoUtils.addLogoToPNG(imagePath, logoPath, outputPath, logoOptions);
    console.log('Logo added successfully!');
  }

  async handleResize(inputs, options) {
    if (inputs.length === 0) {
      console.log('Please provide an input image path');
      return;
    }

    const inputPath = inputs[0];
    const outputPath = options.output || inputPath.replace(/\.[^/.]+$/, '_resized.png');
    
    console.log(`Resizing ${inputPath}...`);
    
    const resizeOptions = {
      width: options.width,
      height: options.height
    };

    await this.logoUtils.resizeImage(inputPath, outputPath, resizeOptions);
    console.log('Image resized successfully!');
  }
}

if (require.main === module) {
  const cli = new ElizaAsciiArt();
  cli.run();
}

module.exports = ElizaAsciiArt;
