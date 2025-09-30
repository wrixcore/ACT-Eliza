# Eliza Encoder

Transform your images and videos into stunning encoded art with the power of Eliza technology!

[![Website](https://img.shields.io/badge/Website-act--eliza.com-green?style=for-the-badge)](https://act-eliza.com/)
[![X (Twitter)](https://img.shields.io/badge/X-@actEliza-1DA1F2?style=for-the-badge&logo=x&logoColor=white)](https://x.com/actEliza)
[![GitHub](https://img.shields.io/badge/GitHub-wrixcore-181717?style=for-the-badge&logo=github)](https://github.com/wrixcore/ACT-Eliza)

## Features

### Image to Encoded Art
- Convert images or GIFs into stunning encoded art
- Process GIF frames individually with full animation support  
- Customizable output with adjustable font sizes, character spacing, and dimensions
- Multiple color schemes including the signature Eliza green

### Video to Encoded Art
- Transform videos into encoded art sequences
- Preserve audio in final MP4 output
- Batch frame processing with progress tracking
- Synchronized output maintaining original video timing


### Text Export
- Export encoded art as plain text files
- Batch video processing with configurable frames per file
- Perfect for terminal display and text-based applications

## Quick Start

### Installation

```bash
git clone https://github.com/wrixcore/ACT-Eliza
cd ACT-Eliza

npm install

mkdir -p input output output_video output_txt
```

### Dependencies

This project requires the following Node.js packages:
- `canvas` - For image processing and rendering
- `fluent-ffmpeg` - For video processing
- `gifencoder` - For GIF creation

Optional dependencies:
- `gif-frames` - Enhanced GIF processing
- `jimp` - Additional image manipulation

### System Requirements
- Node.js 16.0.0 or higher
- FFmpeg installed on your system (for video processing)

## Usage Examples

### Convert Image to Encoded Art
```bash
node index.js image-to-ascii input/image.png

node index.js image-to-ascii input/image.png --font-size 10 --height 600 --color "#00ff22"
```

### Convert Video to Encoded Art
```bash
node index.js video-to-ascii input/video.mp4

node index.js video-to-ascii input/video.mp4 --output custom_output/
```


### Convert Video to Text
```bash
node index.js video-to-text input/video.mp4 --height 50
```

## API Usage

### Programmatic Usage

```javascript
const ElizaImageProcessor = require('./image-to-ascii');
const ElizaVideoProcessor = require('./video-to-ascii');
const imageProcessor = new ElizaImageProcessor();
await imageProcessor.imageToAsciiArt('input.png', 'output/', {
  fontSize: 12,
  distance: -3,
  outputHeight: 700,
  color: '#00ff22'
});

const videoProcessor = new ElizaVideoProcessor();
await videoProcessor.videoToAsciiArt('input.mp4', 'output_video/', {
  fontSize: 8,
  distance: -3,
  outputHeight: 700
});
```

## Configuration Options

### Image Processing
- `fontSize` - Size of encoded characters (default: 12)
- `distance` - Character spacing (default: -3)
- `outputHeight` - Output image height in pixels (default: 700)
- `color` - Encoded character color (default: '#00ff22')

### Video Processing
- `fontSize` - Encoded character size (default: 8)
- `distance` - Character spacing (default: -3)
- `outputHeight` - Frame height (default: 700)
- `framesPerFile` - Frames per text file for text export (default: 100)


## Encoded Character Mapping

The Eliza encoded art uses a carefully crafted brightness-to-character mapping:

| Brightness Range | Character | Visual Weight |
|-----------------|-----------|---------------|
| 0-50            | `' '`     | Empty space   |
| 51-101          | `"'"`     | Very light    |
| 102-139         | `':`      | Light         |
| 140-169         | `'i'`     | Medium light  |
| 170-199         | `'I'`     | Medium        |
| 200-209         | `'J'`     | Medium heavy  |
| 210-255         | `'$'`     | Heavy         |

## Project Structure

```
ACT-Eliza/
├── index.js
├── image-to-ascii.js
├── video-to-ascii.js
├── package.json
├── README.md
├── input/
├── output/
├── output_video/
└── output_txt/
```

## Advanced Features

### Batch Processing
Process multiple files at once:

```bash
for file in input/*.png; do
  node index.js image-to-ascii "$file"
done
```

### Custom Color Schemes
Create your own color schemes by modifying the color option:

```bash
node index.js image-to-ascii input.png --color "#ff0000"

node index.js image-to-ascii input.png --color "#0066ff"
```

### High Resolution Output
For detailed encoded art, use larger dimensions:

```bash
node index.js image-to-ascii input.png --height 1200 --font-size 8 --distance -2
```

## Performance Tips

1. Video Processing: For large videos, consider reducing output height to improve processing speed
2. Memory Usage: Process videos in smaller chunks for better memory management
3. Quality vs Speed: Higher resolution outputs require more processing time
4. File Formats: PNG files generally process faster than JPEG for encoded conversion

## Contributing

We welcome contributions to the Eliza Encoder! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
git clone https://github.com/wrixcore/ACT-Eliza
cd ACT-Eliza

npm install

npm run start
```


## Connect with us

- Website: [act-eliza.com](https://act-eliza.com/)
- X (Twitter): [@actEliza](https://x.com/actEliza)
- Developer: [@wrixcore](https://x.com/wrixcore)
- Developer Website: [wrix.dev](https://wrix.dev/)

## Acknowledgments

- Inspired by the original Python implementation from zo-eth
- Built by the Eliza team
- Special thanks to the encoded art community for inspiration
- Canvas API for powerful image processing capabilities

## Bug Reports

Found a bug? Please report it on our [GitHub Issues](https://github.com/wrixcore/ACT-Eliza/issues) page with:

1. Description of the issue
2. Steps to reproduce  
3. Expected vs actual behavior
4. System information (Node.js version, OS, etc.)
5. Sample files if applicable

## Feature Requests

Have an idea for a new feature? We'd love to hear it! Submit feature requests through:

- GitHub Issues with the "enhancement" label
- X (Twitter) mentions [@actEliza](https://x.com/actEliza)
