import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {exoplanetShaders} from "./shaders/shader"

export default function ExoplanetViewer3D({ planetType = 'Hot Jupiter', className = '' }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const planetRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const mouseRef = useRef({ x: 0, y: 0, isDragging: false, lastX: 0, lastY: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    renderer.setClearColor(0x000000, 0)

    // Create planet with shader
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const shader = exoplanetShaders[planetType] || exoplanetShaders['Hot Jupiter'];
    
    const material = new THREE.ShaderMaterial({
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      uniforms: {
        time: { value: 0 }
      }
    });

    const planet = new THREE.Mesh(geometry, material);
    scene.add(planet);
    planetRef.current = planet;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    setIsLoading(false);

    // Animation loop
    let time = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      time += 0.01;
      if (material.uniforms.time) {
        material.uniforms.time.value = time;
      }

      // Auto-rotate slowly if not dragging
      if (!mouseRef.current.isDragging) {
        planet.rotation.y += 0.001;
      } else {
        planet.rotation.x = rotationRef.current.x;
        planet.rotation.y = rotationRef.current.y;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Mouse controls
    const handleMouseDown = (e) => {
      mouseRef.current.isDragging = true;
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;
    };

    const handleMouseMove = (e) => {
      if (!mouseRef.current.isDragging) return;
      
      const deltaX = e.clientX - mouseRef.current.lastX;
      const deltaY = e.clientY - mouseRef.current.lastY;
      
      rotationRef.current.y += deltaX * 0.01;
      rotationRef.current.x += deltaY * 0.01;
      
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;
    };

    const handleMouseUp = () => {
      mouseRef.current.isDragging = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.001;
      camera.position.z = Math.max(1.5, Math.min(5, camera.position.z));
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [planetType]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={containerRef} 
        className="w-full h-full min-h-[600px] bg-black rounded-lg"
        style={{ touchAction: 'none' }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <div className="text-white text-xl">Loading 3D Planet...</div>
        </div>
      )}
    </div>
  );
}

