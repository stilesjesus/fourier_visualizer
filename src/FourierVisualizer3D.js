import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

const FourierVisualizer3D = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationIdRef = useRef(null);
  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const gainNodesRef = useRef([]);
  const masterGainRef = useRef(null);
  
  const lastFrameTime = useRef(0);
  
  const materialPoolRef = useRef({
    lineMap: new Map(),
    meshMap: new Map(),
    spriteMap: new Map()
  });
  
  const waveBuffersRef = useRef({
    points1: new Float32Array(303),
    points2: new Float32Array(303),
    points3: new Float32Array(303),
    pointsCombined: new Float32Array(303)
  });
  
  const objectsRef = useRef({
    waves3D: [],
    bars3D: [],
    waves2D: [],
    bars2D: [],
    grids: null,
    texts: null
  });
  
  const stateRef = useRef({
    time: 0,
    cameraAngle: 0,
    cameraHeight: 5,
    animationSpeed: 0.5,
    frequency1: 1,
    amplitude1: 1,
    frequency2: 3,
    amplitude2: 0.5,
    frequency3: 5,
    amplitude3: 0.3
  });

  // 2D layout offset to center combined wave under "2D View" button (adjusted to shift right)
  const LAYOUT_OFFSET_X = -2;

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [viewMode, setViewMode] = useState('landing');
  const [autoRotate, setAutoRotate] = useState(false);
  const [cameraAngle, setCameraAngle] = useState(0);
  const [cameraHeight, setCameraHeight] = useState(5);
  const [animationSpeed, setAnimationSpeed] = useState(0.5);
  const [frequency1, setFrequency1] = useState(1);
  const [amplitude1, setAmplitude1] = useState(1);
  const [frequency2, setFrequency2] = useState(3);
  const [amplitude2, setAmplitude2] = useState(0.5);
  const [frequency3, setFrequency3] = useState(5);
  const [amplitude3, setAmplitude3] = useState(0.3);

  useEffect(() => {
    stateRef.current.cameraAngle = cameraAngle;
    stateRef.current.cameraHeight = cameraHeight;
    stateRef.current.animationSpeed = animationSpeed;
    stateRef.current.frequency1 = frequency1;
    stateRef.current.amplitude1 = amplitude1;
    stateRef.current.frequency2 = frequency2;
    stateRef.current.amplitude2 = amplitude2;
    stateRef.current.frequency3 = frequency3;
    stateRef.current.amplitude3 = amplitude3;
  }, [cameraAngle, cameraHeight, animationSpeed, frequency1, amplitude1, frequency2, amplitude2, frequency3, amplitude3]);

  const createLandingPage = () => {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 text-white">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Interactive Fourier Transform Visualizer
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Explore the mathematical beauty that transforms signals between time and frequency domains, 
            revolutionizing everything from digital music to medical imaging.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setViewMode('2d')}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition-colors"
            >
              Start 2D Visualization
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-lg font-semibold transition-colors"
            >
              Start 3D Visualization
            </button>
          </div>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-blue-400">What is a Fourier Transform?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                The Fourier Transform is a mathematical technique that decomposes a signal into its constituent frequencies. 
                It reveals the hidden frequency components that make up any complex waveform, converting between the 
                <strong className="text-white"> time domain</strong> (how a signal changes over time) and the 
                <strong className="text-white"> frequency domain</strong> (what frequencies are present).
              </p>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Think of it as a mathematical "prism" that separates a complex signal into its pure frequency components, 
                just like how a glass prism separates white light into a rainbow of colors.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-yellow-400">Key Concepts</h3>
              <ul className="space-y-2 text-gray-300">
                <li><strong>Time Domain:</strong> Shows how signals change over time</li>
                <li><strong>Frequency Domain:</strong> Shows what frequencies make up the signal</li>
                <li><strong>Amplitude:</strong> The strength or intensity of each frequency</li>
                <li><strong>Synthesis:</strong> Combining multiple frequencies to create complex signals</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">Real-World Applications</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-blue-200">Audio & Music</h3>
              <p className="text-gray-300 text-sm">
                MP3 compression, audio equalizers, noise cancellation, and digital audio effects.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-900 to-green-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-green-200">Medical Imaging</h3>
              <p className="text-gray-300 text-sm">
                MRI scanners use Fourier transforms to convert radio wave data into detailed images.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-purple-200">Image Processing</h3>
              <p className="text-gray-300 text-sm">
                JPEG compression, edge detection, and image filtering use frequency domain manipulation.
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-900 to-red-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-red-200">Communications</h3>
              <p className="text-gray-300 text-sm">
                WiFi, cellular networks, and digital television broadcasting.
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-yellow-200">Finance</h3>
              <p className="text-gray-300 text-sm">
                Quantitative analysis, risk assessment, and algorithmic trading.
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-indigo-200">Physics & Engineering</h3>
              <p className="text-gray-300 text-sm">
                Quantum mechanics, structural analysis, and control systems.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-pink-400">Explore the Visualization</h2>
          <div className="bg-gray-800 p-8 rounded-lg">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-400">2D Mode</h3>
                <p className="text-gray-300 mb-4">
                  Traditional side-by-side view showing time domain and frequency domain. 
                  Perfect for understanding the basic relationship between signals and their frequency components.
                </p>
                <button
                  onClick={() => setViewMode('2d')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Try 2D Mode
                </button>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-purple-400">3D Mode</h3>
                <p className="text-gray-300 mb-4">
                  Interactive 3D visualization with spatial relationships. 
                  Includes audio synthesis to hear the mathematical concepts.
                </p>
                <button
                  onClick={() => setViewMode('3d')}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Try 3D Mode
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  const getPooledMaterial = useCallback((type, color, options = {}) => {
    const key = `${color}_${JSON.stringify(options)}`;
    const pool = materialPoolRef.current[type + 'Map'];
    
    if (!pool.has(key)) {
      let mat;
      switch (type) {
        case 'line':
          mat = new THREE.LineBasicMaterial({ color, ...options });
          break;
        case 'mesh':
          mat = new THREE.MeshBasicMaterial({ color, ...options });
          break;
        case 'sprite':
          mat = new THREE.SpriteMaterial({ ...options });
          break;
        default:
          mat = new THREE.MeshBasicMaterial({ color, ...options });
      }
      pool.set(key, mat);
    }
    return pool.get(key);
  }, []);

  const updateGeometryBuffer = useCallback((geom, points) => {
    const positions = geom.attributes.position.array;
    for (let i = 0; i < points.length; i++) {
      positions[i] = points[i];
    }
    geom.attributes.position.needsUpdate = true;
  }, []);

  const calculateWavePoints = useCallback((func, offsetZ, currentTime, buffer) => {
    const resolution = 100;
    let idx = 0;
    
    for (let i = 0; i <= resolution; i++) {
      const t = (i / resolution) * 4 * Math.PI;
      const x = (t / (4 * Math.PI)) * 10 - 5;
      const y = Math.max(0, func(t + currentTime));
      const z = offsetZ;
      
      buffer[idx] = x;
      buffer[idx + 1] = y;
      buffer[idx + 2] = z;
      idx += 3;
    }
    
    return buffer;
  }, []);

  const build3DGrid = useCallback(() => {
    const gridGroup = new THREE.Group();
    const gridLineMaterial = getPooledMaterial('line', 0x444444, { opacity: 0.6, transparent: true });
    const mainLineMaterial = getPooledMaterial('line', 0xffffff, { linewidth: 2 });
    const verticalGridMaterial = getPooledMaterial('line', 0xffff00, { opacity: 0.5, transparent: true });
    
    // Horizontal grid lines (time-frequency plane)
    for (let f = 0; f <= 10; f += 1) {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute([-5, 0, f, 5, 0, f], 3));
      gridGroup.add(new THREE.Line(geom, gridLineMaterial));
    }
    
    for (let t = -5; t <= 5; t += 1) {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute([t, 0, 0, t, 0, 10], 3));
      gridGroup.add(new THREE.Line(geom, gridLineMaterial));
    }
    
    // Vertical grid plane for combined wave (yellow grid)
    // Vertical lines (time direction) at different Y levels
    for (let x = -5; x <= 5; x += 1) {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute([x, 0, -2.5, x, 2.5, -2.5], 3));
      gridGroup.add(new THREE.Line(geom, verticalGridMaterial));
    }
    
    // Horizontal lines (amplitude direction) at different Y levels
    for (let y = 0; y <= 2.5; y += 0.5) {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute([-5, y, -2.5, 5, y, -2.5], 3));
      gridGroup.add(new THREE.Line(geom, verticalGridMaterial));
    }
    
    // Main axes
    const timeGeom = new THREE.BufferGeometry();
    timeGeom.setAttribute('position', new THREE.Float32BufferAttribute([-5, 0, 0, 5, 0, 0], 3));
    gridGroup.add(new THREE.Line(timeGeom, mainLineMaterial));
    
    const freqGeom = new THREE.BufferGeometry();
    freqGeom.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 10], 3));
    gridGroup.add(new THREE.Line(freqGeom, mainLineMaterial));
    
    // Amplitude axis on the vertical grid plane
    const ampGeom = new THREE.BufferGeometry();
    ampGeom.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -2.5, 0, 2, -2.5], 3));
    gridGroup.add(new THREE.Line(ampGeom, mainLineMaterial));
    
    return gridGroup;
  }, [getPooledMaterial]);

  const build3DLabels = useCallback(() => {
    const textGroup = new THREE.Group();
    
    const createText = (text, position, scale = [4, 1, 1], color = '#ffffff') => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 128;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.font = 'bold 48px Arial'; // Bigger font for 3D labels too
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = getPooledMaterial('sprite', 0xffffff, { 
        map: texture, 
        transparent: true,
        alphaTest: 0.1 
      });
      
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.copy(position);
      sprite.scale.set(scale[0], scale[1], scale[2]);
      return sprite;
    };
    
    // Main domain labels
    textGroup.add(createText('Individual Waves', new THREE.Vector3(-7, 1, 5), [6, 1.5, 1]));
    textGroup.add(createText('Frequency Domain', new THREE.Vector3(6, -1.2, 5), [6, 1.5, 1]));
    
    // Combined wave area labels
    textGroup.add(createText('Combined Wave', new THREE.Vector3(0, 3, -1.5), [6, 1.5, 1]));
    textGroup.add(createText('Time-Amplitude View', new THREE.Vector3(0, -2, -1.5), [5, 1.2, 1]));
    
    // Axis labels
    textGroup.add(createText('Time (t)', new THREE.Vector3(6, -0.7, 0), [5, 1.2, 1]));
    textGroup.add(createText('Frequency (Hz)', new THREE.Vector3(0, -0.7, 11.5), [5, 1.2, 1]));
    textGroup.add(createText('Amplitude', new THREE.Vector3(-2, 2.5, -2.5), [5, 1.2, 1], '#ffff00'));
    
    // Amplitude scale markers on the yellow grid
    textGroup.add(createText('0', new THREE.Vector3(-0.7, -0.5, -2.5), [2, 0.8, 1], '#ffff00'));
    textGroup.add(createText('1', new THREE.Vector3(-0.7, 1, -2.5), [2, 0.8, 1], '#ffff00'));
    textGroup.add(createText('2', new THREE.Vector3(-0.7, 2, -2.5), [2, 0.8, 1], '#ffff00'));
    
    // Frequency scale markers
    textGroup.add(createText('0', new THREE.Vector3(-0.7, -0.5, 0), [2, 0.8, 1]));
    textGroup.add(createText('5', new THREE.Vector3(-0.7, -0.5, 5), [2, 0.8, 1]));
    textGroup.add(createText('10', new THREE.Vector3(-0.7, -0.5, 10), [2, 0.8, 1]));
    
    return textGroup;
  }, [getPooledMaterial]);

  const build2DGrid = useCallback(() => {
    const gridGroup = new THREE.Group();
    const yellowLineMaterial = getPooledMaterial('line', 0xffff00, { opacity: 0.3, transparent: true });
    
    // Combined wave grid (top - full width, more spacing from bottom) - ADJUSTED RIGHT
    for (let i = -10; i <= 10; i += 1) {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute([i + LAYOUT_OFFSET_X, 6, 0, i + LAYOUT_OFFSET_X, 12, 0], 3));
      gridGroup.add(new THREE.Line(geom, yellowLineMaterial));
    }
    
    for (let i = 6; i <= 12; i += 1) {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute([-10 + LAYOUT_OFFSET_X, i, 0, 10 + LAYOUT_OFFSET_X, i, 0], 3));
      gridGroup.add(new THREE.Line(geom, yellowLineMaterial));
    }
    
    // Individual waves grid (bottom left, shifted left for better balance) - ADJUSTED RIGHT
    for (let i = -10; i <= -1; i += 1) {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute([i + LAYOUT_OFFSET_X, -6, 0, i + LAYOUT_OFFSET_X, 0, 0], 3));
      gridGroup.add(new THREE.Line(geom, yellowLineMaterial));
    }
    
    for (let i = -6; i <= 0; i += 1) {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute([-10 + LAYOUT_OFFSET_X, i, 0, -1 + LAYOUT_OFFSET_X, i, 0], 3));
      gridGroup.add(new THREE.Line(geom, yellowLineMaterial));
    }
    
    // Frequency domain grid (bottom right, adjusted for better spacing) - ADJUSTED RIGHT
    for (let i = 1; i <= 10; i += 1) {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute([i + LAYOUT_OFFSET_X, -6, 0, i + LAYOUT_OFFSET_X, 0, 0], 3));
      gridGroup.add(new THREE.Line(geom, yellowLineMaterial));
    }
    
    for (let i = -6; i <= 0; i += 1) {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute([1 + LAYOUT_OFFSET_X, i, 0, 10 + LAYOUT_OFFSET_X, i, 0], 3));
      gridGroup.add(new THREE.Line(geom, yellowLineMaterial));
    }
    
    return gridGroup;
  }, [getPooledMaterial]);

  const build2DAxes = useCallback(() => {
    const axGroup = new THREE.Group();
    const whiteLineMaterial = getPooledMaterial('line', 0xffffff, { linewidth: 2 });
    
    // Combined wave axes (top - with more vertical spacing) - ADJUSTED RIGHT
    const combinedXGeom = new THREE.BufferGeometry();
    combinedXGeom.setAttribute('position', new THREE.Float32BufferAttribute([-9 + LAYOUT_OFFSET_X, 9, 0, 9 + LAYOUT_OFFSET_X, 9, 0], 3));
    axGroup.add(new THREE.Line(combinedXGeom, whiteLineMaterial));
    
    const combinedYGeom = new THREE.BufferGeometry();
    combinedYGeom.setAttribute('position', new THREE.Float32BufferAttribute([-10 + LAYOUT_OFFSET_X, 6, 0, -10 + LAYOUT_OFFSET_X, 12, 0], 3));
    axGroup.add(new THREE.Line(combinedYGeom, whiteLineMaterial));
    
    // Individual waves axes (bottom left, better balanced) - ADJUSTED RIGHT
    const timeXGeom = new THREE.BufferGeometry();
    timeXGeom.setAttribute('position', new THREE.Float32BufferAttribute([-9 + LAYOUT_OFFSET_X, -3, 0, -2 + LAYOUT_OFFSET_X, -3, 0], 3));
    axGroup.add(new THREE.Line(timeXGeom, whiteLineMaterial));
    
    const timeYGeom = new THREE.BufferGeometry();
    timeYGeom.setAttribute('position', new THREE.Float32BufferAttribute([-10 + LAYOUT_OFFSET_X, -6, 0, -10 + LAYOUT_OFFSET_X, 0, 0], 3));
    axGroup.add(new THREE.Line(timeYGeom, whiteLineMaterial));
    
    // Frequency domain axes (bottom right, better balanced) - ADJUSTED RIGHT
    const freqXGeom = new THREE.BufferGeometry();
    freqXGeom.setAttribute('position', new THREE.Float32BufferAttribute([2 + LAYOUT_OFFSET_X, -6, 0, 9 + LAYOUT_OFFSET_X, -6, 0], 3));
    axGroup.add(new THREE.Line(freqXGeom, whiteLineMaterial));
    
    const freqYGeom = new THREE.BufferGeometry();
    freqYGeom.setAttribute('position', new THREE.Float32BufferAttribute([1 + LAYOUT_OFFSET_X, -6, 0, 1 + LAYOUT_OFFSET_X, 0, 0], 3));
    axGroup.add(new THREE.Line(freqYGeom, whiteLineMaterial));
    
    return axGroup;
  }, [getPooledMaterial]);

  const build2DLabels = useCallback(() => {
    const labelGroup = new THREE.Group();
    
    const makeLabel = (text, position, rotation = 0, isTitle = false) => {
      const can = document.createElement('canvas');
      const context = can.getContext('2d');
      can.width = 768;
      can.height = 192;
      
      context.clearRect(0, 0, 768, 192);
      
      if (isTitle) {
        context.strokeStyle = '#ffffff';
        context.lineWidth = 4;
        context.strokeRect(30, 30, 708, 132);
        context.fillStyle = '#ffffff';
        context.font = 'bold 80px Arial'; // Bigger font for titles
      } else {
        context.fillStyle = '#ffffff';
        context.font = 'bold 90px Arial'; // Bigger font for labels
      }
      
      context.textAlign = 'center';
      context.fillText(text, 384, 120);
      
      const tex = new THREE.CanvasTexture(can);
      const labelSpriteMat = getPooledMaterial('sprite', 0xffffff, { 
        map: tex, 
        transparent: true,
        alphaTest: 0.1 
      });
      const labelSpr = new THREE.Sprite(labelSpriteMat);
      labelSpr.position.copy(position);
      labelSpr.scale.set(8, 2, 1); // Larger scale for bigger visualization
      if (rotation !== 0) {
        labelSpr.material.rotation = rotation;
      }
      return labelSpr;
    };
    
    // Combined wave labels (top section - with more spacing) - ADJUSTED RIGHT
    labelGroup.add(makeLabel('Time (t)', new THREE.Vector3(0 + LAYOUT_OFFSET_X, 5, 0)));
    labelGroup.add(makeLabel('Combined Wave', new THREE.Vector3(0 + LAYOUT_OFFSET_X, 3.5, 0), 0, true));
    labelGroup.add(makeLabel('Amplitude', new THREE.Vector3(-11 + LAYOUT_OFFSET_X, 9, 0), Math.PI/2));
    
    // Individual waves labels (bottom left - better balanced) - ADJUSTED RIGHT
    labelGroup.add(makeLabel('Time (t)', new THREE.Vector3(-5.5 + LAYOUT_OFFSET_X, -7, 0)));
    labelGroup.add(makeLabel('Individual Waves', new THREE.Vector3(-5.5 + LAYOUT_OFFSET_X, -8.5, 0), 0, true));
    labelGroup.add(makeLabel('Amplitude', new THREE.Vector3(-11 + LAYOUT_OFFSET_X, -3, 0), Math.PI/2));
    
    // Frequency domain labels (bottom right - better balanced) - ADJUSTED RIGHT
    labelGroup.add(makeLabel('Frequency (Hz)', new THREE.Vector3(5.5 + LAYOUT_OFFSET_X, -7, 0)));
    labelGroup.add(makeLabel('Frequency Domain', new THREE.Vector3(5.5 + LAYOUT_OFFSET_X, -8.5, 0), 0, true));
    labelGroup.add(makeLabel('Magnitude', new THREE.Vector3(0 + LAYOUT_OFFSET_X, -3, 0), Math.PI/2));
    
    return labelGroup;
  }, [getPooledMaterial]);

  const setupObjects = useCallback(() => {
    const objects = objectsRef.current;
    
    if (viewMode === '3d') {
      // Create 3D wave lines
      for (let i = 0; i < 4; i++) {
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(303);
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffffff];
        const mat = getPooledMaterial('line', colors[i]);
        const line = new THREE.Line(geom, mat);
        
        objects.waves3D.push(line);
        sceneRef.current?.add(line);
      }
      
      // Create 3D frequency bars
      for (let i = 0; i < 3; i++) {
        const geom = new THREE.BoxGeometry(0.3, 1, 0.3);
        const colors = [0xff4444, 0x44ff44, 0x4444ff];
        const mat = getPooledMaterial('mesh', colors[i], { transparent: true, opacity: 0.8 });
        const bar = new THREE.Mesh(geom, mat);
        
        objects.bars3D.push(bar);
        sceneRef.current?.add(bar);
      }
      
      if (!objects.grids) {
        objects.grids = build3DGrid();
        sceneRef.current?.add(objects.grids);
      }
      
      if (!objects.texts) {
        objects.texts = build3DLabels();
        sceneRef.current?.add(objects.texts);
      }
    } else if (viewMode === '2d') {
      if (!objects.grids) {
        objects.grids = build2DGrid();
        sceneRef.current?.add(objects.grids);
      }
      
      // Create 2D time graph lines (individual waves only - 3 lines)
      for (let i = 0; i < 3; i++) {
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(303); // Smaller for left section
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const colors = [0xff4444, 0x44ff44, 0x4444ff];
        const mat = getPooledMaterial('line', colors[i]);
        const line = new THREE.Line(geom, mat);
        
        objects.waves2D.push(line);
        sceneRef.current?.add(line);
      }
      
      // Create combined wave line (1 line for center section)
      const combinedGeom = new THREE.BufferGeometry();
      const combinedPositions = new Float32Array(603); // Longer for center section
      combinedGeom.setAttribute('position', new THREE.BufferAttribute(combinedPositions, 3));
      const combinedMat = getPooledMaterial('line', 0xffffff);
      const combinedLine = new THREE.Line(combinedGeom, combinedMat);
      objects.waves2D.push(combinedLine); // Add as 4th element
      sceneRef.current?.add(combinedLine);
      
      // Create 2D frequency bars
      for (let i = 0; i < 3; i++) {
        const geom = new THREE.BoxGeometry(0.8, 1, 0.1); // Slightly smaller width
        const colors = [0xff4444, 0x44ff44, 0x4444ff];
        const mat = getPooledMaterial('mesh', colors[i], { transparent: true, opacity: 0.8 });
        const bar = new THREE.Mesh(geom, mat);
        
        objects.bars2D.push(bar);
        sceneRef.current?.add(bar);
      }
      
      if (!objects.texts) {
        const axGroup = build2DAxes();
        const labelGroup = build2DLabels();
        objects.texts = new THREE.Group();
        objects.texts.add(axGroup);
        objects.texts.add(labelGroup);
        sceneRef.current?.add(objects.texts);
      }
    }
  }, [getPooledMaterial, viewMode, build3DGrid, build3DLabels, build2DGrid, build2DAxes, build2DLabels]);

  const initAudioSystem = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.connect(audioContextRef.current.destination);
      masterGainRef.current.gain.value = 0.1;
      
      for (let i = 0; i < 3; i++) {
        const gainNode = audioContextRef.current.createGain();
        gainNode.connect(masterGainRef.current);
        gainNodesRef.current[i] = gainNode;
      }
    }
  }, []);

  const updateAudioSystem = useCallback(() => {
    if (!audioContextRef.current || !audioEnabled || !isPlaying) return;
    
    const currentTime = audioContextRef.current.currentTime;
    const state = stateRef.current;
    const frequencies = [state.frequency1, state.frequency2, state.frequency3];
    const amplitudes = [state.amplitude1, state.amplitude2, state.amplitude3];
    
    frequencies.forEach((freq, i) => {
      if (oscillatorsRef.current[i]) {
        oscillatorsRef.current[i].frequency.setValueAtTime(freq * 110, currentTime);
        gainNodesRef.current[i].gain.setValueAtTime(amplitudes[i] * 0.1, currentTime);
      }
    });
  }, [audioEnabled, isPlaying]);

  const startAudioSystem = useCallback(() => {
    if (!audioContextRef.current) return;
    
    oscillatorsRef.current.forEach(osc => osc && osc.stop());
    oscillatorsRef.current = [];
    
    const state = stateRef.current;
    const frequencies = [state.frequency1, state.frequency2, state.frequency3];
    const amplitudes = [state.amplitude1, state.amplitude2, state.amplitude3];
    
    frequencies.forEach((freq, i) => {
      const osc = audioContextRef.current.createOscillator();
      osc.connect(gainNodesRef.current[i]);
      osc.type = 'sine';
      osc.frequency.value = freq * 110;
      gainNodesRef.current[i].gain.value = amplitudes[i] * 0.1;
      osc.start();
      oscillatorsRef.current[i] = osc;
    });
  }, []);

  const stopAudioSystem = useCallback(() => {
    oscillatorsRef.current.forEach(osc => {
      if (osc) {
        osc.stop();
      }
    });
    oscillatorsRef.current = [];
  }, []);

  const runAnimation = useCallback(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;

    const now = performance.now();
    const deltaTime = now - lastFrameTime.current;
    
    // 60 fps limit
    if (deltaTime < 16.67) {
      if (isPlaying) {
        animationIdRef.current = requestAnimationFrame(runAnimation);
      }
      return;
    }
    
    lastFrameTime.current = now;
    
    const state = stateRef.current;
    const currentTime = state.time * 0.001;

    if (viewMode === '3d' && objectsRef.current.waves3D.length > 0) {
      const waveLines = objectsRef.current.waves3D;
      
      calculateWavePoints(
        t => Math.max(0, Math.min(state.amplitude1 * Math.sin(state.frequency1 * t), 2)),
        state.frequency1, currentTime, waveBuffersRef.current.points1
      );
      calculateWavePoints(
        t => Math.max(0, Math.min(state.amplitude2 * Math.sin(state.frequency2 * t), 2)),
        state.frequency2, currentTime, waveBuffersRef.current.points2
      );
      calculateWavePoints(
        t => Math.max(0, Math.min(state.amplitude3 * Math.sin(state.frequency3 * t), 2)),
        state.frequency3, currentTime, waveBuffersRef.current.points3
      );
      calculateWavePoints(
        t => Math.max(0, Math.min(
          state.amplitude1 * Math.sin(state.frequency1 * t) + 
          state.amplitude2 * Math.sin(state.frequency2 * t) + 
          state.amplitude3 * Math.sin(state.frequency3 * t), 2
        )),
        -1.5, currentTime, waveBuffersRef.current.pointsCombined
      );
      
      updateGeometryBuffer(waveLines[0].geometry, waveBuffersRef.current.points1);
      updateGeometryBuffer(waveLines[1].geometry, waveBuffersRef.current.points2);
      updateGeometryBuffer(waveLines[2].geometry, waveBuffersRef.current.points3);
      updateGeometryBuffer(waveLines[3].geometry, waveBuffersRef.current.pointsCombined);
      
      const frequencyBars = objectsRef.current.bars3D;
      const frequencies = [state.frequency1, state.frequency2, state.frequency3];
      const amplitudes = [state.amplitude1, state.amplitude2, state.amplitude3];
      
      frequencies.forEach((freq, i) => {
        const bar = frequencyBars[i];
        if (bar) {
          const animatedHeight = amplitudes[i] * (1 + 0.2 * Math.sin(currentTime * 2 + i));
          const barHeight = Math.min(animatedHeight, 2);
          
          bar.scale.y = barHeight;
          bar.position.set(5, barHeight / 2, Math.min(freq, 10));
        }
      });
      
      const radius = 7;
      const angle = autoRotate ? currentTime * 0.5 : state.cameraAngle;
      cameraRef.current.position.x = radius * Math.cos(angle);
      cameraRef.current.position.z = radius * Math.sin(angle) + 4;
      cameraRef.current.position.y = state.cameraHeight;
      cameraRef.current.lookAt(0, 0, 4);
    } else if (viewMode === '2d') {
      const timeLines = objectsRef.current.waves2D;
      if (timeLines.length > 0) {
        const resolution = 100;
        
        // Individual waves buffers (bottom left) - ADJUSTED RIGHT
        const individualBuffers = [
          new Float32Array(303), // 101 points * 3 components
          new Float32Array(303), 
          new Float32Array(303)
        ];
        
        // Generate individual wave data for bottom left section (better balanced)
        for (let i = 0; i <= resolution; i++) {
          const t = (i / resolution) * 4 * Math.PI;
          const x = (t / (4 * Math.PI)) * 8 - 9.5 + LAYOUT_OFFSET_X; // ADJUSTED RIGHT
          
          const y1 = Math.min(state.amplitude1 * Math.sin(state.frequency1 * t + currentTime), 2.0);
          const y2 = Math.min(state.amplitude2 * Math.sin(state.frequency2 * t + currentTime), 2.0);
          const y3 = Math.min(state.amplitude3 * Math.sin(state.frequency3 * t + currentTime), 2.0);
          
          const idx = i * 3;
          individualBuffers[0][idx] = x;
          individualBuffers[0][idx + 1] = y1 - 3; // Centered in bottom section
          individualBuffers[0][idx + 2] = 0.1;
          
          individualBuffers[1][idx] = x;
          individualBuffers[1][idx + 1] = y2 - 3;
          individualBuffers[1][idx + 2] = 0.2;
          
          individualBuffers[2][idx] = x;
          individualBuffers[2][idx + 1] = y3 - 3;
          individualBuffers[2][idx + 2] = 0.3;
        }
        
        // Update individual wave geometries
        timeLines.slice(0, 3).forEach((line, i) => {
          if (line && individualBuffers[i]) {
            updateGeometryBuffer(line.geometry, individualBuffers[i]);
          }
        });
        
        // Combined wave buffer (top section - longer) - ADJUSTED RIGHT
        const combinedResolution = 200;
        const combinedBuffer = new Float32Array(603); // 201 points * 3 components
        
        // Generate combined wave data for top section (with better spacing)
        for (let i = 0; i <= combinedResolution; i++) {
          const t = (i / combinedResolution) * 8 * Math.PI; // Longer time span
          const x = (t / (8 * Math.PI)) * 18 - 9 + LAYOUT_OFFSET_X; // ADJUSTED RIGHT
          
          const y1 = state.amplitude1 * Math.sin(state.frequency1 * t + currentTime);
          const y2 = state.amplitude2 * Math.sin(state.frequency2 * t + currentTime);
          const y3 = state.amplitude3 * Math.sin(state.frequency3 * t + currentTime);
          const yCombined = Math.min(Math.max(y1 + y2 + y3, -3.0), 3.0);
          
          const idx = i * 3;
          combinedBuffer[idx] = x;
          combinedBuffer[idx + 1] = yCombined + 9; // Centered in top section with more spacing
          combinedBuffer[idx + 2] = 0.4;
        }
        
        // Update combined wave geometry
        if (timeLines[3]) {
          updateGeometryBuffer(timeLines[3].geometry, combinedBuffer);
        }
      }
      
      const freqBars = objectsRef.current.bars2D;
      const frequencies = [state.frequency1, state.frequency2, state.frequency3];
      const amplitudes = [state.amplitude1, state.amplitude2, state.amplitude3];
      
      frequencies.forEach((freq, i) => {
        const bar = freqBars[i];
        if (bar) {
          const animatedHeight = amplitudes[i] * (1 + 0.1 * Math.sin(currentTime * 2 + i));
          // Limit bar height to fit within frequency domain grid bounds (6 units: y = -6 to y = 0)
          const maxBarHeight = 5.8; // Leave small margin for better visual appearance
          const barHeight = Math.min(animatedHeight * 2.5, maxBarHeight);
          const xPos = Math.min(freq * 0.7 + 3.5, 8.5) + LAYOUT_OFFSET_X; // ADJUSTED RIGHT
          
          bar.scale.y = Math.max(barHeight, 0.1);
          // Position bars to start from bottom of grid (-6) and extend upward
          bar.position.set(xPos, -6 + barHeight / 2, 0);
        }
      });
      
      cameraRef.current.position.set(0, 0, 18); // Updated for zoomed view
      cameraRef.current.lookAt(0, 0, 0);
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);

    if (isPlaying) {
      stateRef.current.time += 50 * state.animationSpeed;
      animationIdRef.current = requestAnimationFrame(runAnimation);
    }
  }, [isPlaying, viewMode, autoRotate, calculateWavePoints, updateGeometryBuffer]);

  useEffect(() => {
    if (!mountRef.current || viewMode === 'landing') return;

    if (sceneRef.current) {
      objectsRef.current.waves3D.forEach(wave => sceneRef.current.remove(wave));
      objectsRef.current.bars3D.forEach(bar => sceneRef.current.remove(bar));
      objectsRef.current.waves2D.forEach(wave => sceneRef.current.remove(wave));
      objectsRef.current.bars2D.forEach(bar => sceneRef.current.remove(bar));
      if (objectsRef.current.grids) sceneRef.current.remove(objectsRef.current.grids);
      if (objectsRef.current.texts) sceneRef.current.remove(objectsRef.current.texts);
      
      objectsRef.current = {
        waves3D: [],
        bars3D: [],
        waves2D: [],
        bars2D: [],
        grids: null,
        texts: null
      };
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, 1400 / 1000, 0.1, 1000);
    if (viewMode === '2d') {
      camera.position.set(0, 0, 18); // Maintain the zoomed view
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.set(7, stateRef.current.cameraHeight, 11);
      camera.lookAt(0, 0, 4);
    }
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(1000, 700); // Bigger 3D view too
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    setupObjects();
    runAnimation();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      
      objectsRef.current = {
        waves3D: [],
        bars3D: [],
        waves2D: [],
        bars2D: [],
        grids: null,
        texts: null
      };
    };
  }, [viewMode, runAnimation, setupObjects]);

  useEffect(() => {
    updateAudioSystem();
  }, [updateAudioSystem, frequency1, amplitude1, frequency2, amplitude2, frequency3, amplitude3]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!audioEnabled) return;
    
    if (!isPlaying) {
      initAudioSystem();
      startAudioSystem();
    } else {
      stopAudioSystem();
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (audioEnabled) {
      stopAudioSystem();
    } else if (isPlaying) {
      initAudioSystem();
      startAudioSystem();
    }
  };

  const reset = () => {
    setFrequency1(1);
    setAmplitude1(1);
    setFrequency2(3);
    setAmplitude2(0.5);
    setFrequency3(5);
    setAmplitude3(0.3);
  };

  const randomize = () => {
    setFrequency1(Math.random() * 9.9 + 0.1);
    setAmplitude1(Math.random() * 2);
    setFrequency2(Math.random() * 9.9 + 0.1);
    setAmplitude2(Math.random() * 2);
    setFrequency3(Math.random() * 9.9 + 0.1);
    setAmplitude3(Math.random() * 2);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-900 text-white min-h-screen">
      {viewMode === 'landing' ? (
        createLandingPage()
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6 text-center">Optimized Fourier Transform Visualizer</h1>
          
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('landing')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => setViewMode('2d')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === '2d' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                2D View
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === '3d' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                3D View
              </button>
            </div>
            
            <div className="w-32">
              <label className="block text-sm mb-1 text-center">Speed: {animationSpeed.toFixed(1)}x</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            {viewMode === '3d' && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setAutoRotate(false)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      !autoRotate ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    Manual
                  </button>
                  <button
                    onClick={() => setAutoRotate(true)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      autoRotate ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    Auto Rotate
                  </button>
                </div>
                <div className="flex gap-4">
                  {!autoRotate && (
                    <div className="w-32">
                      <label className="block text-sm mb-1 text-center">Camera Angle</label>
                      <input
                        type="range"
                        min="0"
                        max={Math.PI * 2}
                        step="0.1"
                        value={cameraAngle}
                        onChange={(e) => setCameraAngle(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                  <div className="w-32">
                    <label className="block text-sm mb-1 text-center">Camera Height</label>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="0.5"
                      value={cameraHeight}
                      onChange={(e) => setCameraHeight(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6 w-full max-w-4xl">
            <div ref={mountRef} className="border-2 border-gray-700 rounded-lg overflow-hidden w-full" />
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={togglePlay}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                audioEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              Audio
            </button>
            
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RotateCcw size={20} />
              Reset
            </button>
            
            <button
              onClick={randomize}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Random
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-red-400">Wave 1 (Red)</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Frequency: {frequency1.toFixed(1)} Hz</label>
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={frequency1}
                    onChange={(e) => setFrequency1(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Amplitude: {amplitude1.toFixed(1)}</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={amplitude1}
                    onChange={(e) => setAmplitude1(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-green-400">Wave 2 (Green)</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Frequency: {frequency2.toFixed(1)} Hz</label>
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={frequency2}
                    onChange={(e) => setFrequency2(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Amplitude: {amplitude2.toFixed(1)}</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={amplitude2}
                    onChange={(e) => setAmplitude2(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-blue-400">Wave 3 (Blue)</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Frequency: {frequency3.toFixed(1)} Hz</label>
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={frequency3}
                    onChange={(e) => setFrequency3(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Amplitude: {amplitude3.toFixed(1)}</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={amplitude3}
                    onChange={(e) => setAmplitude3(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 max-w-2xl text-center text-gray-300">
            <h3 className="text-lg font-semibold mb-2 text-green-400">Performance Optimized</h3>
            <p className="text-sm">
              This version uses object pooling, buffer reuse, frame rate limiting, and reduced resolution 
              for dramatically improved performance and lower RAM usage.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default FourierVisualizer3D;