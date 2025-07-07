# Interactive Fourier Transform Visualizer

An educational, high-performance 3D and 2D visualization tool that demonstrates the mathematical beauty of Fourier transforms through interactive real-time graphics and audio synthesis.


## 🚀 Try It Now!

**[🌐 Live Demo - Try the Fourier Transform Visualizer](https://stilesjesus.github.io/fourier_visualizer/)**

Experience the interactive visualization directly in your browser! No installation required - just click and start exploring the mathematical beauty of Fourier transforms.

✨ **Quick Start:**
1. Click the live demo link above
2. Choose between 2D or 3D visualization modes
3. Adjust wave parameters with the sliders
4. Hit play and watch mathematics come to life!

---

## 🌟 Features

### Educational Content
- **Interactive Landing Page**: Comprehensive introduction to Fourier transforms with real-world applications
- **Dual Visualization Modes**: Switch between 2D traditional view and immersive 3D visualization
- **Real-time Audio Synthesis**: Hear the mathematical concepts through synthesized sine waves
- **Educational Applications**: Examples from medical imaging, audio processing, communications, and more

### Visualization Capabilities
- **3D Mode**: 
  - Interactive camera controls with manual and auto-rotation
  - Spatial relationship visualization between time and frequency domains
  - Real-time wave synthesis in 3D space
  - Dynamic frequency bars with animated heights
  
- **2D Mode**:
  - Side-by-side time and frequency domain views
  - Combined wave visualization showing signal synthesis
  - Individual wave components with color coding
  - Properly bounded frequency domain bars

### Interactive Controls
- **Wave Parameters**: Adjust frequency (0.1-10 Hz) and amplitude (0-2) for three sine waves
- **Animation Speed**: Control visualization speed (0.1x to 3x)
- **Audio Integration**: Real-time audio synthesis with Web Audio API
- **Camera Controls**: Manual camera positioning and auto-rotation in 3D mode
- **Preset Functions**: Reset to defaults or randomize parameters

## 🚀 Getting Started

### Prerequisites
- Node.js 14.0 or higher
- npm or yarn package manager
- Modern web browser with WebGL support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/stilesjesus/fourier_visualizer.git
   cd fourier_visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production
```bash
npm run build
# or
yarn build
```

## 🎯 Usage Guide

### Getting Started
1. **Launch the Application**: Start with the landing page to learn about Fourier transforms
2. **Choose Visualization Mode**: Select either 2D or 3D visualization
3. **Adjust Parameters**: Use the control panels to modify wave properties
4. **Play Animation**: Click the play button to start the real-time visualization
5. **Enable Audio**: Toggle audio to hear the mathematical synthesis

### Understanding the Visualization

#### 2D Mode
- **Top Section**: Combined wave showing the sum of all three sine waves
- **Bottom Left**: Individual colored waves (Red, Green, Blue) in time domain
- **Bottom Right**: Frequency domain showing amplitude at each frequency

#### 3D Mode
- **Front Plane**: Individual waves in 3D space at different frequency positions
- **Back Plane**: Frequency domain bars showing amplitude
- **Yellow Grid**: Combined wave visualization in time-amplitude space

### Controls Reference
- **Frequency Sliders**: Adjust the frequency of each wave component
- **Amplitude Sliders**: Control the strength of each wave component
- **Speed Control**: Change animation playback speed
- **Camera Controls**: (3D mode) Manual angle and height adjustment
- **Audio Toggle**: Enable/disable real-time audio synthesis

## 🛠 Technology Stack

### Core Technologies
- **React 18+**: Modern functional components with hooks
- **Three.js r128**: High-performance 3D graphics rendering
- **Web Audio API**: Real-time audio synthesis
- **Tailwind CSS**: Utility-first styling framework

### Performance Optimizations
- **Object Pooling**: Reused materials and geometries for memory efficiency
- **Buffer Management**: Pre-allocated Float32Arrays for wave calculations
- **Frame Rate Limiting**: 60 FPS cap to prevent excessive CPU usage
- **Optimized Rendering**: Reduced resolution and efficient update cycles

### Key Libraries
- **Lucide React**: Modern icon components
- **Three.js**: 3D graphics and WebGL rendering
- **React Hooks**: State management and lifecycle handling

## 📚 Educational Value

### Learning Objectives
Students and educators can use this tool to understand:
- **Time vs Frequency Domain**: Visual relationship between signal representations
- **Signal Synthesis**: How complex waves are built from simple components
- **Fourier Analysis**: Decomposition of signals into frequency components
- **Real-world Applications**: Practical uses in various fields

### Curriculum Integration
Perfect for courses in:
- Digital Signal Processing
- Mathematics (Trigonometry, Calculus)
- Physics (Wave mechanics, Acoustics)
- Computer Science (Algorithms, Graphics)
- Engineering (Communications, Control Systems)

## 🎨 Real-World Applications Demonstrated

The visualizer showcases Fourier transform applications in:
- **Audio & Music**: MP3 compression, equalizers, noise cancellation
- **Medical Imaging**: MRI scanners and image reconstruction
- **Communications**: WiFi, cellular networks, digital broadcasting
- **Image Processing**: JPEG compression, edge detection, filtering
- **Finance**: Quantitative analysis, risk assessment, algorithmic trading
- **Physics & Engineering**: Quantum mechanics, structural analysis

## ⚡ Performance Features

### Optimization Techniques
- **Material Pooling**: Reused Three.js materials to reduce memory allocation
- **Geometry Buffer Reuse**: Pre-allocated buffers for wave point calculations
- **Efficient Animation Loop**: Optimized render cycle with frame rate limiting
- **Memory Management**: Proper cleanup and disposal of 3D objects

### Browser Compatibility
- Chrome 90+ (Recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔧 Development

### Project Structure
```
src/
├── components/
│   └── FourierVisualizer3D.js    # Main component
├── styles/
│   └── index.css                 # Tailwind CSS imports
└── index.js                      # Application entry point
```

### Key Functions
- `calculateWavePoints()`: Generates wave geometry data
- `build3DGrid()` / `build2DGrid()`: Creates visualization grids
- `runAnimation()`: Main animation loop
- `updateAudioSystem()`: Real-time audio synthesis

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Joseph Fourier**: For the mathematical foundation
- **Three.js Community**: For excellent 3D graphics tools
- **React Team**: For the robust framework
- **Educational Community**: For inspiration in mathematical visualization

## 📞 Support

For questions, suggestions, or issues:
- Open an issue on GitHub
- Contact: [your-email@example.com]
- Documentation: [Link to detailed docs if available]

---

**Made with ❤️ for education and mathematical understanding**

*Transform your understanding of signals and frequencies through interactive visualization*
