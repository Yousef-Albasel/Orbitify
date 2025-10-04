'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Database, Globe, TrendingUp, Target, Thermometer, Clock, Ruler, Maximize2, Search, Filter } from 'lucide-react';
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
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('click', handleClick);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [planets, onPlanetSelect]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[700px] rounded-2xl" style={{ touchAction: 'none' }}>
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
        const rows = text.split('\n').slice(1);
        
        const parsedData = rows
          .filter(row => row.trim())
          .map(row => {
            const cols = row.split(',');
            return {
              kepId: cols[0],
              koiName: cols[1],
              keplerName: cols[2],
              disposition: cols[4],
              orbitalPeriod: parseFloat(cols[15]) || 0,
              planetRadius: parseFloat(cols[19]) || 0,
              equilibriumTemp: parseFloat(cols[20]) || 0,
              transitDuration: parseFloat(cols[17]) || 0,
              stellarRadius: parseFloat(cols[24]) || 0,
              insolationFlux: parseFloat(cols[21]) || 0,
              stellarTemp: parseFloat(cols[23]) || 0
            };
          })
          .filter(p => p.disposition === 'CONFIRMED' && p.keplerName && p.orbitalPeriod > 0);

        setKeplerData(parsedData);

        // Group by star system
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

        // Calculate stats
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
        console.error('Error stack:', error.stack);
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
      {/* Background */}
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

          {/* 3D Visualization */}
          <div className="col-span-9">
            <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              {selectedStar && (
                <StarSystemViewer
                  planets={selectedStar.planets}
                  starName={selectedStar.name}
                  onPlanetSelect={setSelectedPlanet}
                  selectedPlanet={selectedPlanet}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Planet Details Panel */}
      {selectedPlanet && (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 w-96 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl z-20 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{selectedPlanet.keplerName}</h3>
            <button 
              onClick={() => setSelectedPlanet(null)}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-all"
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