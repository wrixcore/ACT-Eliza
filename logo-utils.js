const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

class ElizaLogoUtils {
  async addLogoToPNG(imagePath, logoPath, outputPath, options = {}) {
    const {
      logoPosition = 'bottom-right',
      logoScale = 0.1,
      margin = 20
    } = options;

    try {
      const image = await loadImage(imagePath);
      const logo = await loadImage(logoPath);
      
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(image, 0, 0);
      
      const logoWidth = Math.floor(canvas.width * logoScale);
      const logoHeight = Math.floor((logo.height / logo.width) * logoWidth);
      
      let logoX, logoY;
      switch (logoPosition) {
        case 'bottom-right':
          logoX = canvas.width - logoWidth - margin;
          logoY = canvas.height - logoHeight - margin;
          break;
        case 'bottom-left':
          logoX = margin;
          logoY = canvas.height - logoHeight - margin;
          break;
        case 'top-right':
          logoX = canvas.width - logoWidth - margin;
          logoY = margin;
          break;
        case 'top-left':
          logoX = margin;
          logoY = margin;
          break;
        default:
          logoX = canvas.width - logoWidth - margin;
          logoY = canvas.height - logoHeight - margin;
      }
      
      ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
      
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`Logo added to PNG: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error('Error adding logo to PNG:', error);
      throw error;
    }
  }

  async addLogoToGIF(gifPath, logoPath, outputPath, options = {}) {
    console.log('GIF logo overlay - simplified implementation');
    console.log('For full GIF processing, consider using additional libraries like gif-frames or jimp');
    
    try {
      await this.addLogoToPNG(gifPath, logoPath, outputPath.replace('.gif', '.png'), options);
      console.log('Processed first frame with logo (saved as PNG)');
      
    } catch (error) {
      console.error('Error adding logo to GIF:', error);
      throw error;
    }
  }

  createTextWatermark(text, options = {}) {
    const {
      fontSize = 24,
      fontFamily = 'monospace',
      color = '#ffffff',
      opacity = 0.5,
      padding = 20
    } = options;

    const tempCanvas = createCanvas(100, 100);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = `${fontSize}px ${fontFamily}`;
    const textMetrics = tempCtx.measureText(text);
    
    const canvas = createCanvas(
      textMetrics.width + padding * 2,
      fontSize + padding * 2
    );
    const ctx = canvas.getContext('2d');
    
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    
    ctx.fillText(text, padding, fontSize + padding / 2);
    
    return canvas;
  }

  async addTextWatermark(imagePath, text, outputPath, options = {}) {
    const {
      position = 'bottom-right',
      margin = 20,
      ...watermarkOptions
    } = options;

    try {
      const image = await loadImage(imagePath);
      
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(image, 0, 0);
      
      const watermarkCanvas = this.createTextWatermark(text, watermarkOptions);
      
      let watermarkX, watermarkY;
      switch (position) {
        case 'bottom-right':
          watermarkX = canvas.width - watermarkCanvas.width - margin;
          watermarkY = canvas.height - watermarkCanvas.height - margin;
          break;
        case 'bottom-left':
          watermarkX = margin;
          watermarkY = canvas.height - watermarkCanvas.height - margin;
          break;
        case 'top-right':
          watermarkX = canvas.width - watermarkCanvas.width - margin;
          watermarkY = margin;
          break;
        case 'top-left':
          watermarkX = margin;
          watermarkY = margin;
          break;
        case 'center':
          watermarkX = (canvas.width - watermarkCanvas.width) / 2;
          watermarkY = (canvas.height - watermarkCanvas.height) / 2;
          break;
        default:
          watermarkX = canvas.width - watermarkCanvas.width - margin;
          watermarkY = canvas.height - watermarkCanvas.height - margin;
      }

      ctx.drawImage(watermarkCanvas, watermarkX, watermarkY);
      
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`Text watermark added: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error('Error adding text watermark:', error);
      throw error;
    }
  }

  async resizeImage(imagePath, outputPath, options = {}) {
    const {
      width,
      height,
      maxWidth,
      maxHeight,
      quality = 1.0
    } = options;

    try {
      const image = await loadImage(imagePath);
      
      let newWidth = image.width;
      let newHeight = image.height;
      
      if (width && height) {
        newWidth = width;
        newHeight = height;
      } else if (width) {
        newWidth = width;
        newHeight = (image.height / image.width) * width;
      } else if (height) {
        newHeight = height;
        newWidth = (image.width / image.height) * height;
      } else if (maxWidth || maxHeight) {
        const scaleX = maxWidth ? maxWidth / image.width : 1;
        const scaleY = maxHeight ? maxHeight / image.height : 1;
        const scale = Math.min(scaleX, scaleY);
        
        newWidth = Math.floor(image.width * scale);
        newHeight = Math.floor(image.height * scale);
      }
      
      const canvas = createCanvas(newWidth, newHeight);
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(image, 0, 0, newWidth, newHeight);
      
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`Image resized: ${outputPath} (${newWidth}x${newHeight})`);
      return outputPath;
      
    } catch (error) {
      console.error('Error resizing image:', error);
      throw error;
    }
  }
}

module.exports = ElizaLogoUtils;

if (require.main === module) {
  const logoUtils = new ElizaLogoUtils();
  
  const inputImage = path.join(__dirname, 'input', 'image.png');
  const logoImage = path.join(__dirname, 'input', 'logo.png');
  const outputPath = path.join(__dirname, 'output', 'image_with_logo.png');
  
  logoUtils.addLogoToPNG(inputImage, logoImage, outputPath, {
    logoPosition: 'bottom-right',
    logoScale: 0.1,
    margin: 20
  }).catch(console.error);
}
