'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Database, Globe, TrendingUp, Target, Thermometer, Clock, Ruler, Maximize2, Search, Filter, BarChart3, Activity } from 'lucide-react';
import * as THREE from 'three';

const StarSystemViewer = ({ planets, onPlanetSelect, selectedPlanet, starName }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const planetsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, isDragging: false, lastX: 0, lastY: 0 });
  const cameraRotationRef = useRef({ theta: 0, phi: Math.PI / 3 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current || !planets.length) return;

    const container = containerRef.current;



    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    
    const radius = 60;
    camera.position.set(
      radius * Math.sin(cameraRotationRef.current.phi) * Math.cos(cameraRotationRef.current.theta),
      radius * Math.cos(cameraRotationRef.current.phi),
      radius * Math.sin(cameraRotationRef.current.phi) * Math.sin(cameraRotationRef.current.theta)
    );
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Central Star
    const starGeometry = new THREE.SphereGeometry(4, 32, 32);
    const starMaterial = new THREE.MeshBasicMaterial({
      color: 0xffdd88,
      emissive: 0xffdd88,
      emissiveIntensity: 1.5
    });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(star);

    // Star glow layers
    for (let i = 1; i <= 3; i++) {
      const glowGeometry = new THREE.SphereGeometry(4 + i * 0.8, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffdd88,
        transparent: true,
        opacity: 0.15 / i
      });
      const starGlow = new THREE.Mesh(glowGeometry, glowMaterial);
      scene.add(starGlow);
    }

    // Create planets
    const planetMeshes = [];
    planets.forEach((planet, index) => {
      const orbitRadius = 12 + (Math.sqrt(planet.orbitalPeriod) * 3);
      
      // Orbit line
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitPoints = [];
      for (let i = 0; i <= 128; i++) {
        const angle = (i / 128) * Math.PI * 2;
        orbitPoints.push(
          Math.cos(angle) * orbitRadius,
          0,
          Math.sin(angle) * orbitRadius
        );
      }
      orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
      const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: 0x4488ff,
        transparent: true,
        opacity: 0.2
      });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbitLine);

      // Planet
      const planetRadius = Math.max(0.8, Math.min(planet.planetRadius * 0.2, 3));
      const planetGeometry = new THREE.SphereGeometry(planetRadius, 32, 32);
      
      let planetColor = 0x4488ff;
      if (planet.equilibriumTemp > 1500) planetColor = 0xff4444;
      else if (planet.equilibriumTemp > 1000) planetColor = 0xff8844;
      else if (planet.equilibriumTemp > 600) planetColor = 0xffbb44;
      else if (planet.equilibriumTemp > 300) planetColor = 0x44ccff;
      else planetColor = 0x4466ff;
      
      const planetMaterial = new THREE.MeshPhongMaterial({
        color: planetColor,
        emissive: planetColor,
        emissiveIntensity: 0.3,
        shininess: 50
      });
      
      const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
      planetMesh.userData = { 
        planet, 
        orbitRadius, 
        angle: (index / planets.length) * Math.PI * 2,
        index 
      };
      scene.add(planetMesh);
      planetMeshes.push(planetMesh);

      // Planet glow
      const glowGeo = new THREE.SphereGeometry(planetRadius * 1.3, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color: planetColor,
        transparent: true,
        opacity: 0.2
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      planetMesh.add(glow);
    });

    planetsRef.current = planetMeshes;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffdd88, 2, 200);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    setIsLoading(false);

    // Animation
    let time = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      time += 0.005;
      star.rotation.y += 0.001;

      planetMeshes.forEach((planetMesh) => {
        const speed = 0.05 / Math.sqrt(planetMesh.userData.planet.orbitalPeriod);
        planetMesh.userData.angle += speed;
        
        planetMesh.position.x = Math.cos(planetMesh.userData.angle) * planetMesh.userData.orbitRadius;
        planetMesh.position.z = Math.sin(planetMesh.userData.angle) * planetMesh.userData.orbitRadius;
        
        planetMesh.rotation.y += 0.008;
      });

      renderer.render(scene, camera);
    };
    animate();

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
      
      cameraRotationRef.current.theta -= deltaX * 0.005;
      cameraRotationRef.current.phi -= deltaY * 0.005;
      cameraRotationRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraRotationRef.current.phi));
      
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
      const newRadius = currentRadius + e.deltaY * 0.05;
      const clampedRadius = Math.max(20, Math.min(150, newRadius));
      
      camera.position.multiplyScalar(clampedRadius / currentRadius);
      camera.lookAt(0, 0, 0);
    };

    // Click to select planet
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event) => {
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planetMeshes);

      if (intersects.length > 0) {
        const planet = intersects[0].object.userData.planet;
        onPlanetSelect(planet);
      }
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('click', handleClick);

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseUp);
        canvas.removeEventListener('wheel', handleWheel);
        canvas.removeEventListener('click', handleClick);
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (renderer) {
        renderer.dispose();
        // Safely remove the renderer's DOM element
        const rendererElement = renderer.domElement;
        if (rendererElement) {
          container.removeChild(rendererElement);
        }
      }
    };
  }, [planets, onPlanetSelect, starName]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[700px] rounded-2xl relative" style={{ touchAction: 'none' }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-xl">Loading Star System...</div>
        </div>
      )}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-3 rounded-xl text-white border border-white/20">
        <div className="font-bold text-lg mb-1">{starName}</div>
        <div className="text-sm text-white/60">Drag to rotate • Scroll to zoom • Click planets</div>
      </div>
    </div>
  );
};

const SystemAnalysis = ({ system }) => {
  const planets = system.planets;
  
  const avgOrbitalPeriod = (planets.reduce((sum, p) => sum + p.orbitalPeriod, 0) / planets.length).toFixed(2);
  const avgRadius = (planets.reduce((sum, p) => sum + p.planetRadius, 0) / planets.length).toFixed(2);
  const avgTemp = (planets.reduce((sum, p) => sum + p.equilibriumTemp, 0) / planets.length).toFixed(0);
  const avgStellarRadius = (planets.reduce((sum, p) => sum + p.stellarRadius, 0) / planets.length).toFixed(3);
  
  const shortestPeriod = planets.reduce((min, p) => p.orbitalPeriod < min.orbitalPeriod ? p : min);
  const longestPeriod = planets.reduce((max, p) => p.orbitalPeriod > max.orbitalPeriod ? p : max);
  const hottestPlanet = planets.reduce((max, p) => p.equilibriumTemp > max.equilibriumTemp ? p : max);
  const largestPlanet = planets.reduce((max, p) => p.planetRadius > max.planetRadius ? p : max);
  
  const tempCategories = {
    ultraHot: planets.filter(p => p.equilibriumTemp > 1500).length,
    hot: planets.filter(p => p.equilibriumTemp > 1000 && p.equilibriumTemp <= 1500).length,
    warm: planets.filter(p => p.equilibriumTemp > 600 && p.equilibriumTemp <= 1000).length,
    temperate: planets.filter(p => p.equilibriumTemp > 300 && p.equilibriumTemp <= 600).length,
    cool: planets.filter(p => p.equilibriumTemp <= 300).length
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          System Overview
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="text-white/60 text-xs mb-1">Total Planets</div>
            <div className="text-2xl font-bold">{planets.length}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="text-white/60 text-xs mb-1">Avg Stellar Radius</div>
            <div className="text-2xl font-bold">{avgStellarRadius} R☉</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="text-white/60 text-xs mb-1">Avg Orbital Period</div>
            <div className="text-2xl font-bold">{avgOrbitalPeriod}</div>
            <div className="text-white/40 text-xs">days</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="text-white/60 text-xs mb-1">Avg Temperature</div>
            <div className="text-2xl font-bold">{avgTemp}</div>
            <div className="text-white/40 text-xs">Kelvin</div>
          </div>
        </div>
      </div>

      {/* Temperature Distribution */}
      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-orange-400" />
          Temperature Distribution
        </h3>
        <div className="space-y-2">
          {tempCategories.ultraHot > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-32 text-sm text-white/60">Ultra Hot (1500K)</div>
              <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
                <div 
                  className="bg-red-500 h-full flex items-center justify-end pr-2 text-xs font-bold"
                  style={{ width: `${(tempCategories.ultraHot / planets.length) * 100}%` }}
                >
                  {tempCategories.ultraHot}
                </div>
              </div>
            </div>
          )}
          {tempCategories.hot > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-32 text-sm text-white/60">Hot (1000-1500K)</div>
              <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
                <div 
                  className="bg-orange-500 h-full flex items-center justify-end pr-2 text-xs font-bold"
                  style={{ width: `${(tempCategories.hot / planets.length) * 100}%` }}
                >
                  {tempCategories.hot}
                </div>
              </div>
            </div>
          )}
          {tempCategories.warm > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-32 text-sm text-white/60">Warm (600-1000K)</div>
              <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
                <div 
                  className="bg-yellow-500 h-full flex items-center justify-end pr-2 text-xs font-bold"
                  style={{ width: `${(tempCategories.warm / planets.length) * 100}%` }}
                >
                  {tempCategories.warm}
                </div>
              </div>
            </div>
          )}
          {tempCategories.temperate > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-32 text-sm text-white/60">Temperate (300-600K)</div>
              <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
                <div 
                  className="bg-cyan-500 h-full flex items-center justify-end pr-2 text-xs font-bold"
                  style={{ width: `${(tempCategories.temperate / planets.length) * 100}%` }}
                >
                  {tempCategories.temperate}
                </div>
              </div>
            </div>
          )}
          {tempCategories.cool > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-32 text-sm text-white/60">Cool (300K)</div>
              <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full flex items-center justify-end pr-2 text-xs font-bold"
                  style={{ width: `${(tempCategories.cool / planets.length) * 100}%` }}
                >
                  {tempCategories.cool}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notable Planets */}
      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Notable Planets
        </h3>
        <div className="space-y-2">
          <div className="bg-gradient-to-r from-purple-500/20 to-transparent border border-purple-500/30 rounded-lg p-3">
            <div className="text-xs text-purple-300 mb-1">Closest to Star</div>
            <div className="font-bold">{shortestPeriod.keplerName}</div>
            <div className="text-sm text-white/60">{shortestPeriod.orbitalPeriod.toFixed(2)} day orbit</div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500/20 to-transparent border border-blue-500/30 rounded-lg p-3">
            <div className="text-xs text-blue-300 mb-1">Farthest from Star</div>
            <div className="font-bold">{longestPeriod.keplerName}</div>
            <div className="text-sm text-white/60">{longestPeriod.orbitalPeriod.toFixed(2)} day orbit</div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500/20 to-transparent border border-orange-500/30 rounded-lg p-3">
            <div className="text-xs text-orange-300 mb-1">Hottest Planet</div>
            <div className="font-bold">{hottestPlanet.keplerName}</div>
            <div className="text-sm text-white/60">{hottestPlanet.equilibriumTemp}K</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500/20 to-transparent border border-green-500/30 rounded-lg p-3">
            <div className="text-xs text-green-300 mb-1">Largest Planet</div>
            <div className="font-bold">{largestPlanet.keplerName}</div>
            <div className="text-sm text-white/60">{largestPlanet.planetRadius.toFixed(2)} R⊕</div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-pink-400" />
          Key Insights
        </h3>
        <div className="space-y-2 text-sm text-white/80">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
            <div>
              This system contains <strong>{planets.length} confirmed planets</strong> discovered by the Kepler mission
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2"></div>
            <div>
              Orbital periods range from <strong>{shortestPeriod.orbitalPeriod.toFixed(2)} to {longestPeriod.orbitalPeriod.toFixed(2)} days</strong>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2"></div>
            <div>
              Temperature range spans from <strong>{Math.min(...planets.map(p => p.equilibriumTemp))}K to {Math.max(...planets.map(p => p.equilibriumTemp))}K</strong>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2"></div>
            <div>
              Planet sizes vary from <strong>{Math.min(...planets.map(p => p.planetRadius)).toFixed(2)} to {Math.max(...planets.map(p => p.planetRadius)).toFixed(2)} Earth radii</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ExoplanetExplorer() {
  const [keplerData, setKeplerData] = useState([]);
  const [selectedStar, setSelectedStar] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [starSystems, setStarSystems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/kepler_data.csv');
        const text = await response.text();
        
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const getCol = (cols, name) => {
          const index = headers.indexOf(name.toLowerCase());
          return index !== -1 ? cols[index]?.trim() : '';
        };
        
        const parsedData = lines
          .slice(1)
          .filter(row => row.trim())
          .map(row => {
            const cols = row.split(',');
            return {
              kepId: getCol(cols, 'kepid'),
              koiName: getCol(cols, 'kepoi_name'),
              keplerName: getCol(cols, 'kepler_name'),
              disposition: getCol(cols, 'koi_disposition'),
              orbitalPeriod: parseFloat(getCol(cols, 'koi_period')) || 0,
              planetRadius: parseFloat(getCol(cols, 'koi_prad')) || 0,
              equilibriumTemp: parseFloat(getCol(cols, 'koi_teq')) || 0,
              transitDuration: parseFloat(getCol(cols, 'koi_duration')) || 0,
              stellarRadius: parseFloat(getCol(cols, 'koi_srad')) || 0,
              insolationFlux: parseFloat(getCol(cols, 'koi_insol')) || 0,
              stellarTemp: parseFloat(getCol(cols, 'koi_steff')) || 0
            };
          })
          .filter(p => p.disposition === 'CONFIRMED' && p.keplerName && p.orbitalPeriod > 0);
          
        setKeplerData(parsedData);

        const systemsMap = {};
        parsedData.forEach(planet => {
          const starMatch = planet.keplerName.match(/Kepler-(\d+)/);
          if (starMatch) {
            const starNum = starMatch[1];
            const starName = `Kepler-${starNum}`;
            if (!systemsMap[starName]) {
              systemsMap[starName] = [];
            }
            systemsMap[starName].push(planet);
          }
        });

        const systems = Object.entries(systemsMap)
          .filter(([_, planets]) => planets.length >= 2)
          .map(([name, planets]) => ({
            name,
            planetCount: planets.length,
            planets: planets.sort((a, b) => a.orbitalPeriod - b.orbitalPeriod)
          }))
          .sort((a, b) => b.planetCount - a.planetCount)
          .slice(0, 50);

        setStarSystems(systems);
        if (systems.length > 0) {
          setSelectedStar(systems[0]);
        }

        const totalPlanets = parsedData.length;
        const avgOrbital = parsedData.reduce((sum, p) => sum + p.orbitalPeriod, 0) / totalPlanets;
        const avgRadius = parsedData.reduce((sum, p) => sum + p.planetRadius, 0) / totalPlanets;
        const avgTemp = parsedData.reduce((sum, p) => sum + p.equilibriumTemp, 0) / totalPlanets;
        const hottest = parsedData.reduce((max, p) => p.equilibriumTemp > max.equilibriumTemp ? p : max);
        const largest = parsedData.reduce((max, p) => p.planetRadius > max.planetRadius ? p : max);

        setStats({
          totalPlanets,
          totalSystems: systems.length,
          avgOrbitalPeriod: avgOrbital.toFixed(2),
          avgPlanetRadius: avgRadius.toFixed(2),
          avgTemperature: avgTemp.toFixed(0),
          hottest,
          largest
        });

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSystems = starSystems.filter(system =>
    system.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Loading Kepler Data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 2 + 0.5 + 'px',
              height: Math.random() * 2 + 0.5 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.7 + 0.2,
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 3 + 2 + 's',
            }}
          />
        ))}
      </div>

      <div className="fixed top-20 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 p-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight">Kepler Explorer</h1>
          </div>
          <p className="text-white/50 text-lg font-light ml-16">
            Interactive visualization of confirmed exoplanets from the Kepler mission
          </p>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <span className="text-white/60 text-sm">Confirmed Planets</span>
                </div>
                <div className="text-3xl font-bold">{stats.totalPlanets}</div>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span className="text-white/60 text-sm">Multi-Planet Systems</span>
                </div>
                <div className="text-3xl font-bold">{stats.totalSystems}</div>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-pink-400" />
                  <span className="text-white/60 text-sm">Avg Orbital Period</span>
                </div>
                <div className="text-3xl font-bold">{stats.avgOrbitalPeriod}</div>
                <div className="text-white/40 text-xs mt-1">days</div>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Thermometer className="w-5 h-5 text-orange-400" />
                  <span className="text-white/60 text-sm">Avg Temperature</span>
                </div>
                <div className="text-3xl font-bold">{stats.avgTemperature}</div>
                <div className="text-white/40 text-xs mt-1">Kelvin</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 px-8 pb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
          {/* Star Systems List */}
          <div className="col-span-3">
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search systems..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {filteredSystems.map((system) => (
                  <button
                    key={system.name}
                    onClick={() => {
                      setSelectedStar(system);
                      setSelectedPlanet(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedStar?.name === system.name
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-semibold text-sm">{system.name}</div>
                    <div className="text-xs text-white/60 mt-1">
                      {system.planetCount} planets
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3D Visualization and Analysis */}
          <div className="col-span-6">
            <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-4 backdrop-blur-sm mb-6">
              {selectedStar && (
                <StarSystemViewer
                  key={selectedStar.name}
                  planets={selectedStar.planets}
                  starName={selectedStar.name}
                  onPlanetSelect={setSelectedPlanet}
                  selectedPlanet={selectedPlanet}
                />
              )}
            </div>
          </div>

          {/* System Analysis */}
          <div className="col-span-3">
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm max-h-[800px] overflow-y-auto">
              {selectedStar && <SystemAnalysis system={selectedStar} />}
            </div>
          </div>
        </div>
      </div>

      {/* Planet Details Panel */}
      {selectedPlanet && (
        <div className="fixed left-8 bottom-8 w-96 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl z-20 max-h-[500px] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{selectedPlanet.keplerName}</h3>
            <button 
              onClick={() => setSelectedPlanet(null)}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-all text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-white/60 text-sm">KOI Name</span>
              <span className="font-semibold text-sm">{selectedPlanet.koiName}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-white/60 text-sm">Orbital Period</span>
              <span className="font-semibold text-sm">{selectedPlanet.orbitalPeriod.toFixed(3)} days</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-white/60 text-sm">Planet Radius</span>
              <span className="font-semibold text-sm">{selectedPlanet.planetRadius.toFixed(2)} R⊕</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-white/60 text-sm">Equilibrium Temp</span>
              <span className="font-semibold text-sm">{selectedPlanet.equilibriumTemp}K</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-white/60 text-sm">Transit Duration</span>
              <span className="font-semibold text-sm">{selectedPlanet.transitDuration.toFixed(2)} hrs</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-white/60 text-sm">Stellar Radius</span>
              <span className="font-semibold text-sm">{selectedPlanet.stellarRadius.toFixed(3)} R☉</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-white/60 text-sm">Insolation Flux</span>
              <span className="font-semibold text-sm">{selectedPlanet.insolationFlux.toFixed(2)} F⊕</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="text-sm text-blue-200">
              <strong>Classification:</strong> {
                selectedPlanet.equilibriumTemp > 1500 ? 'Ultra Hot' :
                selectedPlanet.equilibriumTemp > 1000 ? 'Hot Jupiter' :
                selectedPlanet.equilibriumTemp > 600 ? 'Warm Planet' :
                selectedPlanet.equilibriumTemp > 300 ? 'Temperate' : 'Cool Planet'
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}