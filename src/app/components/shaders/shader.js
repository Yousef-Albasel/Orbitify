export const exoplanetShaders = {
  'Gas Giant': {
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 starPosition;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec3 vPosition;

      // Perlin noise functions
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

      float noise(vec3 P) {
        vec3 i0 = mod289(floor(P)), i1 = mod289(i0 + vec3(1.0));
        vec3 f0 = fract(P), f1 = f0 - vec3(1.0), f = fade(f0);
        vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x), iy = vec4(i0.yy, i1.yy);
        vec4 iz0 = i0.zzzz, iz1 = i1.zzzz;
        vec4 ixy = permute(permute(ix) + iy), ixy0 = permute(ixy + iz0), ixy1 = permute(ixy + iz1);
        vec4 gx0 = ixy0 * (1.0 / 7.0), gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
        vec4 gx1 = ixy1 * (1.0 / 7.0), gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
        gx0 = fract(gx0); gx1 = fract(gx1);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.0));
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);
        gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);
        vec3 g0 = vec3(gx0.x,gy0.x,gz0.x), g1 = vec3(gx0.y,gy0.y,gz0.y),
             g2 = vec3(gx0.z,gy0.z,gz0.z), g3 = vec3(gx0.w,gy0.w,gz0.w),
             g4 = vec3(gx1.x,gy1.x,gz1.x), g5 = vec3(gx1.y,gy1.y,gz1.y),
             g6 = vec3(gx1.z,gy1.z,gz1.z), g7 = vec3(gx1.w,gy1.w,gz1.w);
        vec4 norm0 = taylorInvSqrt(vec4(dot(g0,g0), dot(g2,g2), dot(g1,g1), dot(g3,g3)));
        vec4 norm1 = taylorInvSqrt(vec4(dot(g4,g4), dot(g6,g6), dot(g5,g5), dot(g7,g7)));
        g0 *= norm0.x; g2 *= norm0.y; g1 *= norm0.z; g3 *= norm0.w;
        g4 *= norm1.x; g6 *= norm1.y; g5 *= norm1.z; g7 *= norm1.w;
        vec4 nz = mix(vec4(dot(g0, vec3(f0.x, f0.y, f0.z)), dot(g1, vec3(f1.x, f0.y, f0.z)),
                           dot(g2, vec3(f0.x, f1.y, f0.z)), dot(g3, vec3(f1.x, f1.y, f0.z))),
                      vec4(dot(g4, vec3(f0.x, f0.y, f1.z)), dot(g5, vec3(f1.x, f0.y, f1.z)),
                           dot(g6, vec3(f0.x, f1.y, f1.z)), dot(g7, vec3(f1.x, f1.y, f1.z))),
                      f.z);
        return 2.2 * mix(mix(nz.x,nz.z,f.y), mix(nz.y,nz.w,f.y), f.x);
      }

      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for(int i = 0; i < 5; i++) {
          value += amplitude * noise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        // Gas Giant - orange/red bands with procedural variation
        float bands = sin(vUv.y * 25.0 + time * 0.1) * 0.5 + 0.5;
        
        // Add turbulence with noise
        vec3 noisePos = vPosition * 3.0;
        float turbulence = fbm(noisePos + vec3(time * 0.05, 0.0, 0.0));
        float detailNoise = noise(vPosition * 8.0) * 0.3;
        
        // Modify bands with turbulence
        bands = bands + turbulence * 0.3 + detailNoise;
        
        vec3 color1 = vec3(0.95, 0.45, 0.25); // Orange
        vec3 color2 = vec3(0.85, 0.35, 0.15); // Darker orange/red
        vec3 color3 = vec3(0.98, 0.55, 0.35); // Light orange
        
        // Mix colors based on noise
        vec3 baseColor = mix(color1, color2, bands);
        baseColor = mix(baseColor, color3, turbulence * 0.2);

        // Dynamic lighting based on star position
        vec3 lightDir = normalize(starPosition - vWorldPosition);
        float diffuse = max(dot(vNormal, lightDir), 0.0);
        
        // Add ambient lighting
        float ambient = 0.15;
        vec3 finalColor = baseColor * (ambient + diffuse * 0.85);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  },
  
  'Neptune-like': {
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 starPosition;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec3 vPosition;

      // Perlin noise functions
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

      float noise(vec3 P) {
        vec3 i0 = mod289(floor(P)), i1 = mod289(i0 + vec3(1.0));
        vec3 f0 = fract(P), f1 = f0 - vec3(1.0), f = fade(f0);
        vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x), iy = vec4(i0.yy, i1.yy);
        vec4 iz0 = i0.zzzz, iz1 = i1.zzzz;
        vec4 ixy = permute(permute(ix) + iy), ixy0 = permute(ixy + iz0), ixy1 = permute(ixy + iz1);
        vec4 gx0 = ixy0 * (1.0 / 7.0), gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
        vec4 gx1 = ixy1 * (1.0 / 7.0), gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
        gx0 = fract(gx0); gx1 = fract(gx1);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.0));
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);
        gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);
        vec3 g0 = vec3(gx0.x,gy0.x,gz0.x), g1 = vec3(gx0.y,gy0.y,gz0.y),
             g2 = vec3(gx0.z,gy0.z,gz0.z), g3 = vec3(gx0.w,gy0.w,gz0.w),
             g4 = vec3(gx1.x,gy1.x,gz1.x), g5 = vec3(gx1.y,gy1.y,gz1.y),
             g6 = vec3(gx1.z,gy1.z,gz1.z), g7 = vec3(gx1.w,gy1.w,gz1.w);
        vec4 norm0 = taylorInvSqrt(vec4(dot(g0,g0), dot(g2,g2), dot(g1,g1), dot(g3,g3)));
        vec4 norm1 = taylorInvSqrt(vec4(dot(g4,g4), dot(g6,g6), dot(g5,g5), dot(g7,g7)));
        g0 *= norm0.x; g2 *= norm0.y; g1 *= norm0.z; g3 *= norm0.w;
        g4 *= norm1.x; g6 *= norm1.y; g5 *= norm1.z; g7 *= norm1.w;
        vec4 nz = mix(vec4(dot(g0, vec3(f0.x, f0.y, f0.z)), dot(g1, vec3(f1.x, f0.y, f0.z)),
                           dot(g2, vec3(f0.x, f1.y, f0.z)), dot(g3, vec3(f1.x, f1.y, f0.z))),
                      vec4(dot(g4, vec3(f0.x, f0.y, f1.z)), dot(g5, vec3(f1.x, f0.y, f1.z)),
                           dot(g6, vec3(f0.x, f1.y, f1.z)), dot(g7, vec3(f1.x, f1.y, f1.z))),
                      f.z);
        return 2.2 * mix(mix(nz.x,nz.z,f.y), mix(nz.y,nz.w,f.y), f.x);
      }

      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for(int i = 0; i < 5; i++) {
          value += amplitude * noise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        float bands = sin(vUv.y * 25.0 + time * 0.1) * 0.5 + 0.5;
        
        // Add swirling atmospheric detail
        vec3 noisePos = vPosition * 4.0;
        float turbulence = fbm(noisePos + vec3(time * 0.03, time * 0.02, 0.0));
        float swirls = noise(vPosition * 6.0 + vec3(time * 0.04, 0.0, 0.0)) * 0.4;
        
        bands = bands + turbulence * 0.25 + swirls;
        
        vec3 color1 = vec3(0.4, 0.85, 0.95); // Cyan
        vec3 color2 = vec3(0.15, 0.5, 0.8);  // Deep blue
        vec3 color3 = vec3(0.25, 0.65, 0.88); // Medium blue
        
        vec3 baseColor = mix(color1, color2, bands);
        baseColor = mix(baseColor, color3, turbulence * 0.3);

        // Dynamic lighting based on star position
        vec3 lightDir = normalize(starPosition - vWorldPosition);
        float diffuse = max(dot(vNormal, lightDir), 0.0);
        
        float ambient = 0.15;
        vec3 finalColor = baseColor * (ambient + diffuse * 0.85);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  },
  
  'Hot Jupiter': {
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 starPosition;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec3 vPosition;

      // Perlin noise functions
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

      float noise(vec3 P) {
        vec3 i0 = mod289(floor(P)), i1 = mod289(i0 + vec3(1.0));
        vec3 f0 = fract(P), f1 = f0 - vec3(1.0), f = fade(f0);
        vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x), iy = vec4(i0.yy, i1.yy);
        vec4 iz0 = i0.zzzz, iz1 = i1.zzzz;
        vec4 ixy = permute(permute(ix) + iy), ixy0 = permute(ixy + iz0), ixy1 = permute(ixy + iz1);
        vec4 gx0 = ixy0 * (1.0 / 7.0), gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
        vec4 gx1 = ixy1 * (1.0 / 7.0), gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
        gx0 = fract(gx0); gx1 = fract(gx1);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.0));
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);
        gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);
        vec3 g0 = vec3(gx0.x,gy0.x,gz0.x), g1 = vec3(gx0.y,gy0.y,gz0.y),
             g2 = vec3(gx0.z,gy0.z,gz0.z), g3 = vec3(gx0.w,gy0.w,gz0.w),
             g4 = vec3(gx1.x,gy1.x,gz1.x), g5 = vec3(gx1.y,gy1.y,gz1.y),
             g6 = vec3(gx1.z,gy1.z,gz1.z), g7 = vec3(gx1.w,gy1.w,gz1.w);
        vec4 norm0 = taylorInvSqrt(vec4(dot(g0,g0), dot(g2,g2), dot(g1,g1), dot(g3,g3)));
        vec4 norm1 = taylorInvSqrt(vec4(dot(g4,g4), dot(g6,g6), dot(g5,g5), dot(g7,g7)));
        g0 *= norm0.x; g2 *= norm0.y; g1 *= norm0.z; g3 *= norm0.w;
        g4 *= norm1.x; g6 *= norm1.y; g5 *= norm1.z; g7 *= norm1.w;
        vec4 nz = mix(vec4(dot(g0, vec3(f0.x, f0.y, f0.z)), dot(g1, vec3(f1.x, f0.y, f0.z)),
                           dot(g2, vec3(f0.x, f1.y, f0.z)), dot(g3, vec3(f1.x, f1.y, f0.z))),
                      vec4(dot(g4, vec3(f0.x, f0.y, f1.z)), dot(g5, vec3(f1.x, f0.y, f1.z)),
                           dot(g6, vec3(f0.x, f1.y, f1.z)), dot(g7, vec3(f1.x, f1.y, f1.z))),
                      f.z);
        return 2.2 * mix(mix(nz.x,nz.z,f.y), mix(nz.y,nz.w,f.y), f.x);
      }

      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for(int i = 0; i < 5; i++) {
          value += amplitude * noise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        float bands = sin(vUv.y * 20.0 + time * 0.15) * 0.5 + 0.5;
        
        // Hot turbulent atmosphere
        vec3 noisePos = vPosition * 5.0;
        float turbulence = fbm(noisePos + vec3(time * 0.08, time * 0.05, 0.0));
        float hotSpots = noise(vPosition * 10.0 + vec3(time * 0.1, 0.0, 0.0)) * 0.5;
        
        bands = bands + turbulence * 0.4 + hotSpots;
        
        vec3 color1 = vec3(0.95, 0.3, 0.1);   // Hot orange
        vec3 color2 = vec3(0.7, 0.15, 0.05);  // Dark red
        vec3 color3 = vec3(1.0, 0.5, 0.2);    // Bright orange
        vec3 color4 = vec3(0.6, 0.1, 0.02);   // Very dark red
        
        vec3 baseColor = mix(color1, color2, bands);
        baseColor = mix(baseColor, color3, hotSpots * 0.4);
        baseColor = mix(baseColor, color4, (1.0 - turbulence) * 0.2);

        // Dynamic lighting based on star position
        vec3 lightDir = normalize(starPosition - vWorldPosition);
        float diffuse = max(dot(vNormal, lightDir), 0.0);
        
        // Higher ambient for self-illuminating hot planet
        float ambient = 0.25;
        vec3 finalColor = baseColor * (ambient + diffuse * 0.75);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  },

    'Terrestrial': {
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
  uniform float time;
  uniform vec3 starPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vPosition;

  // Simple 3D noise (Perlin-ish)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

  float noise(vec3 P) {
    vec3 i0 = floor(P), i1 = i0 + vec3(1.0);
    vec3 f0 = fract(P), f = fade(f0);
    vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x);
    vec4 iy = vec4(i0.yyy, i1.yyy);
    vec4 iz0 = i0.zzzz, iz1 = i1.zzzz;
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    vec4 gx0 = fract(ixy0 * (1.0 / 41.0));
    vec4 gy0 = fract(floor(ixy0 * (1.0 / 41.0)) * (1.0 / 41.0)) - 0.5;
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    vec3 g0 = vec3(gx0.x, gy0.x, gz0.x);
    vec3 g1 = vec3(gx0.y, gy0.y, gz0.y);
    vec3 g2 = vec3(gx0.z, gy0.z, gz0.z);
    vec3 g3 = vec3(gx0.w, gy0.w, gz0.w);
    vec4 norm = taylorInvSqrt(vec4(dot(g0,g0), dot(g1,g1), dot(g2,g2), dot(g3,g3)));
    g0 *= norm.x; g1 *= norm.y; g2 *= norm.z; g3 *= norm.w;
    vec4 nz = mix(vec4(dot(g0, f0), dot(g1, f0 - vec3(1.0,0.0,0.0)),
                       dot(g2, f0 - vec3(0.0,1.0,0.0)),
                       dot(g3, f0 - vec3(1.0,1.0,0.0))),
                  vec4(dot(g0, f0 - vec3(0.0,0.0,1.0)),
                       dot(g1, f0 - vec3(1.0,0.0,1.0)),
                       dot(g2, f0 - vec3(0.0,1.0,1.0)),
                       dot(g3, f0 - vec3(1.0,1.0,1.0))),
                  f.z);
    return mix(mix(nz.x, nz.z, f.y), mix(nz.y, nz.w, f.y), f.x);
  }

  void main() {
    // Sample noise in 3D around the sphere
    float n = noise(vPosition * 2.0);

    // Use noise to create patchy color distribution
    float patches = smoothstep(0.2, 0.8, n);

    // Color palette - dark red tones
    vec3 deepRed   = vec3(0.25, 0.05, 0.05);
    vec3 darkRed   = vec3(0.4, 0.1, 0.1);
    vec3 mediumRed = vec3(0.6, 0.15, 0.15);
    vec3 brightRed = vec3(0.85, 0.2, 0.2);

    // Map patches into blended reds
    vec3 baseColor;
    if (patches < 0.3) {
      baseColor = mix(deepRed, darkRed, patches / 0.3);
    } else if (patches < 0.6) {
      baseColor = mix(darkRed, mediumRed, (patches - 0.3) / 0.3);
    } else {
      baseColor = mix(mediumRed, brightRed, (patches - 0.6) / 0.4);
    }

    // Dynamic lighting
    vec3 lightDir = normalize(starPosition - vWorldPosition);
    float diffuse = max(dot(vNormal, lightDir), 0.0);

    float ambient = 0.25;
    vec3 finalColor = baseColor * (ambient + diffuse * 0.75);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`
    },

  'Super Earth': {
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 starPosition;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec3 vPosition;

      // Simplex noise functions for smoother, more flowing patterns
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      // Ridged noise for cloud-like patterns
      float ridgedNoise(vec2 p) {
        return 1.0 - abs(snoise(p));
      }

      // Multi-octave noise for flowing patterns
      float fbm(vec2 p, float flowOffset) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        // Add flow direction based on latitude
        vec2 flow = vec2(flowOffset, 0.0);
        
        for(int i = 0; i < 6; i++) {
          value += amplitude * ridgedNoise((p + flow) * frequency);
          frequency *= 2.1;
          amplitude *= 0.48;
          flow *= 1.8;
        }
        return value;
      }

      void main() {
        // Convert 3D position to 2D texture coordinates with wrapping
        float u = atan(vPosition.z, vPosition.x) / (2.0 * 3.14159265) + 0.5;
        float v = asin(vPosition.y) / 3.14159265 + 0.5;
        vec2 coord = vec2(u, v);
        
        // Create flowing horizontal bands
        float latitude = v;
        float flowSpeed = time * 0.02;
        
        // Different flow speeds at different latitudes (like Jupiter's bands)
        float latitudeFlow = sin(latitude * 8.0) * 0.5;
        float flowOffset = flowSpeed + latitudeFlow;
        
        // Large scale atmospheric bands
        vec2 bandCoord = coord * vec2(1.0, 12.0);
        bandCoord.x += flowOffset;
        float bands = fbm(bandCoord, flowOffset * 2.0);
        
        // Medium scale swirls and turbulence
        vec2 turbCoord = coord * vec2(3.0, 18.0);
        turbCoord.x += flowOffset * 1.5;
        float turbulence = fbm(turbCoord, flowOffset);
        
        // Fine detail streaks
        vec2 detailCoord = coord * vec2(8.0, 35.0);
        detailCoord.x += flowOffset * 0.8;
        float streaks = ridgedNoise(detailCoord) * 0.5;
        
        // Add rotational swirls
        vec2 swirlCenter = vec2(0.3 + sin(time * 0.03) * 0.2, 0.5 + cos(time * 0.025) * 0.2);
        vec2 toCenter = coord - swirlCenter;
        float swirlDist = length(toCenter);
        float swirlAngle = atan(toCenter.y, toCenter.x);
        vec2 swirlCoord = vec2(
          swirlDist * 15.0,
          swirlAngle + swirlDist * 8.0 + flowOffset
        );
        float swirl = ridgedNoise(swirlCoord) * smoothstep(0.4, 0.0, swirlDist);
        
        // Combine all noise layers
        float combinedNoise = bands * 0.45 + turbulence * 0.35 + streaks * 0.15 + swirl * 0.3;
        
        // Color palette - orange/coral/white tones
        vec3 deepOrange = vec3(0.95, 0.35, 0.15);   // Deep orange-red
        vec3 brightOrange = vec3(1.0, 0.55, 0.25);  // Bright orange
        vec3 coral = vec3(1.0, 0.65, 0.45);         // Coral
        vec3 paleOrange = vec3(1.0, 0.78, 0.6);     // Pale orange
        vec3 white = vec3(0.98, 0.95, 0.92);        // Off-white clouds
        vec3 cream = vec3(0.95, 0.88, 0.75);        // Cream
        
        // Create layered coloring based on noise
        vec3 baseColor;
        if (combinedNoise < 0.3) {
          baseColor = mix(deepOrange, brightOrange, combinedNoise / 0.3);
        } else if (combinedNoise < 0.5) {
          float t = (combinedNoise - 0.3) / 0.2;
          baseColor = mix(brightOrange, coral, t);
        } else if (combinedNoise < 0.7) {
          float t = (combinedNoise - 0.5) / 0.2;
          baseColor = mix(coral, paleOrange, t);
        } else if (combinedNoise < 0.85) {
          float t = (combinedNoise - 0.7) / 0.15;
          baseColor = mix(paleOrange, cream, t);
        } else {
          float t = (combinedNoise - 0.85) / 0.15;
          baseColor = mix(cream, white, t);
        }
        
        // Add subtle color variation
        float colorShift = snoise(coord * 25.0 + vec2(time * 0.01, 0.0)) * 0.08;
        baseColor += vec3(colorShift, colorShift * 0.5, colorShift * 0.3);

        // Dynamic lighting based on star position
        vec3 lightDir = normalize(starPosition - vWorldPosition);
        float diffuse = max(dot(vNormal, lightDir), 0.0);
        
        // Atmospheric rim lighting
        float rim = 1.0 - max(dot(vNormal, normalize(-vWorldPosition)), 0.0);
        rim = pow(rim, 2.5) * 0.2;
        
        float ambient = 0.2;
        vec3 finalColor = baseColor * (ambient + diffuse * 0.8) + vec3(1.0, 0.7, 0.5) * rim;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  }
};