import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { exoplanetShaders } from './shaders/shader';
export default function ExoplanetViewer3D({ planetType = 'Hot Jupiter', className = '' }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const planetRef = useRef(null);
  const starRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const mouseRef = useRef({ x: 0, y: 0, isDragging: false, lastX: 0, lastY: 0 });
  const cameraRotationRef = useRef({ theta: 0, phi: Math.PI / 2 });

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
    
    const radius = 3;
    camera.position.set(
      radius * Math.sin(cameraRotationRef.current.phi) * Math.cos(cameraRotationRef.current.theta),
      radius * Math.cos(cameraRotationRef.current.phi),
      radius * Math.sin(cameraRotationRef.current.phi) * Math.sin(cameraRotationRef.current.theta)
    );
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    renderer.setClearColor(0x000000, 0);
    scene.background = null;

    // Create star (glowing sphere) - fixed position relative to camera
    const starGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const starMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffdd88,
      emissive: 0xffdd88,
      emissiveIntensity: 2
    });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    const starDistance = 8;
    star.position.set(starDistance, starDistance * 0.3, starDistance * 0.3);
    // scene.add(star);
    starRef.current = star;

    // Add glow effect to star
    const glowGeometry = new THREE.SphereGeometry(0.7, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffdd88,
      transparent: true,
      opacity: 0.3
    });
    const starGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    star.add(starGlow);

    // Create planet with shader
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const shader = exoplanetShaders[planetType] || exoplanetShaders['Hot Jupiter'];
    
    const material = new THREE.ShaderMaterial({
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      uniforms: {
        time: { value: 0 },
        starPosition: { value: star.position }
      }
    });

    const planet = new THREE.Mesh(geometry, material);
    scene.add(planet);
    planetRef.current = planet;

    // Ambient light (very subtle)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    scene.add(ambientLight);

    setIsLoading(false);

    // Animation loop
    let time = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      time += 0.01;
      if (material.uniforms.time) {
        material.uniforms.time.value = time;
      }

      // Rotate planet around its axis
      planet.rotation.y += 0.003;

      // Orbit planet around the star over time
      const orbitRadius = 0; // Keep planet at center, but we'll rotate the star position
      const orbitSpeed = 0.002;
      const starOrbitRadius = 8;
      
      // Move star in a circular orbit around the planet
      star.position.x = starOrbitRadius * Math.cos(time * orbitSpeed);
      star.position.y = starOrbitRadius * 0.3;
      star.position.z = starOrbitRadius * Math.sin(time * orbitSpeed);

      // Update star position uniform for shader lighting
      if (material.uniforms.starPosition) {
        material.uniforms.starPosition.value.copy(star.position);
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

    // Mouse controls - orbit camera around planet
    const handleMouseDown = (e) => {
      mouseRef.current.isDragging = true;
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;
    };

    const handleMouseMove = (e) => {
      if (!mouseRef.current.isDragging) return;
      
      const deltaX = e.clientX - mouseRef.current.lastX;
      const deltaY = e.clientY - mouseRef.current.lastY;
      
      cameraRotationRef.current.theta -= deltaX * 0.01;
      cameraRotationRef.current.phi -= deltaY * 0.01;
      
      // Clamp phi to prevent camera from flipping
      cameraRotationRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraRotationRef.current.phi));
      
      // Update camera position
      const radius = camera.position.length();
      camera.position.set(
        radius * Math.sin(cameraRotationRef.current.phi) * Math.cos(cameraRotationRef.current.theta),
        radius * Math.cos(cameraRotationRef.current.phi),
        radius * Math.sin(cameraRotationRef.current.phi) * Math.sin(cameraRotationRef.current.theta)
      );
      camera.lookAt(0, 0, 0);
      
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;
    };

    const handleMouseUp = () => {
      mouseRef.current.isDragging = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const currentRadius = camera.position.length();
      const newRadius = currentRadius + e.deltaY * 0.003;
      const clampedRadius = Math.max(1.5, Math.min(8, newRadius));
      
      camera.position.multiplyScalar(clampedRadius / currentRadius);
      camera.lookAt(0, 0, 0);
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
      starGeometry.dispose();
      starMaterial.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
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
        className="w-full h-full min-h-[600px] rounded-lg"
        style={{ touchAction: 'none' }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <div className="text-white text-xl">Loading 3D Planet...</div>
        </div>
      )}
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-2 rounded">
        <div>These are conceptual textures taken from the original NASA exoplanets catalog.</div>
      </div>
    </div>
  );
}