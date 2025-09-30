'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BoxDesign } from './types';

interface BoxViewer3DProps {
  design: BoxDesign;
}

export default function BoxViewer3D({ design }: BoxViewer3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const boxRef = useRef<THREE.Object3D | null>(null);
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.4, y: -0.4 });

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Make transparent to show CSS gradient
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 15;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Improve color reproduction
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // High-key lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight1.position.set(2, 2, 2);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-2, 1, -1);
    scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight3.position.set(0, -2, 1);
    scene.add(directionalLight3);

    // Mouse event handlers
    const handleMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true;
      previousMouseRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = event.clientX - previousMouseRef.current.x;
      const deltaY = event.clientY - previousMouseRef.current.y;

      rotationRef.current.y += deltaX * 0.01;
      rotationRef.current.x += deltaY * 0.01;

      previousMouseRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const zoomSpeed = 0.1;
      camera.position.z += event.deltaY * 0.01 * zoomSpeed;
      camera.position.z = Math.max(5, Math.min(30, camera.position.z));
    };

    // Window resize handler
    const handleResize = () => {
      if (!camera || !renderer) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (boxRef.current) {
        boxRef.current.rotation.x = rotationRef.current.x;
        boxRef.current.rotation.y = rotationRef.current.y;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Effect to update the box when design changes
  useEffect(() => {
    if (!sceneRef.current || !design) return;

    // Remove existing box
    if (boxRef.current) {
      sceneRef.current.remove(boxRef.current);
      
      // Dispose of geometry and materials in the group
      boxRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    const textureLoader = new THREE.TextureLoader();
    
    // Helper function to load and configure texture
    const loadTexture = (url: string) => {
      const texture = textureLoader.load(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      return texture;
    };
    
    // Create materials for each face with textures
    // Three.js box face order: [right, left, top, bottom, front, back]
    const materials = [
      // Right face
      new THREE.MeshBasicMaterial({ 
        map: loadTexture(design.faces.right)
      }),
      // Left face  
      new THREE.MeshBasicMaterial({ 
        map: loadTexture(design.faces.left)
      }),
      // Top face
      new THREE.MeshBasicMaterial({ 
        map: loadTexture(design.faces.top)
      }),
      // Bottom face
      new THREE.MeshBasicMaterial({ 
        map: loadTexture(design.faces.bottom)
      }),
      // Front face
      new THREE.MeshBasicMaterial({ 
        map: loadTexture(design.faces.front)
      }),
      // Back face
      new THREE.MeshBasicMaterial({ 
        map: loadTexture(design.faces.back)
      })
    ];
    
    // Create box geometry with design dimensions
    const geometry = new THREE.BoxGeometry(
      design.dimensions.width,
      design.dimensions.height,
      design.dimensions.depth
    );
    
    const box = new THREE.Mesh(geometry, materials);
    
    // Add subtle edge wireframe for better visibility
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ 
      color: 0x000000, 
      opacity: 0.15, 
      transparent: true,
      linewidth: 2
    });
    const wireframe = new THREE.LineSegments(edges, edgeMaterial);
    
    const boxGroup = new THREE.Group();
    boxGroup.add(box);
    boxGroup.add(wireframe);
    
    sceneRef.current.add(boxGroup);
    boxRef.current = boxGroup;

  }, [design]);

  return (
    <div 
      ref={mountRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
      }}
    />
  );
}