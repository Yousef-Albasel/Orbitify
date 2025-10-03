export const exoplanetShaders = {
  'Gas Giant': {
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      void main() {
        // Gas Giant - orange/red bands like Jupiter
        float bands = sin(vUv.y * 25.0 + time * 0.1) * 0.5 + 0.5;
        vec3 color1 = vec3(0.95, 0.45, 0.25); // Orange
        vec3 color2 = vec3(0.85, 0.35, 0.15); // Darker orange/red
        vec3 baseColor = mix(color1, color2, bands);

        // Simple lighting
        vec3 lightDir = normalize(vec3(5.0, 3.0, 5.0));
        float diffuse = max(dot(vNormal, lightDir), 0.2);
        
        vec3 finalColor = baseColor * (0.4 + diffuse * 0.6);

        // Atmospheric rim
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float rim = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
        finalColor += vec3(0.9, 0.5, 0.3) * rim * 0.3;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  },
  
  'Neptune-like': {
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      float noise(vec2 st) {
        return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        float bands = sin(vUv.y * 25.0 + time * 0.1) * 0.5 + 0.5;
        vec3 color1 = vec3(0.4, 0.85, 0.95); // Cyan
        vec3 color2 = vec3(0.15, 0.5, 0.8);  // Deep blue
        vec3 baseColor = mix(color1, color2, bands);

        // Simple lighting
        vec3 lightDir = normalize(vec3(5.0, 3.0, 5.0));
        float diffuse = max(dot(vNormal, lightDir), 0.2);
        
        vec3 finalColor = baseColor * (0.4 + diffuse * 0.6);

        // Atmospheric rim
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float rim = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
        finalColor += vec3(0.9, 0.5, 0.3) * rim * 0.3;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  },

  'Super-Earth': {
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      float noise(vec2 st) {
        return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        // Super-Earth - rocky terrain with browns and grays
        float terrain = noise(vUv * 25.0);
        vec3 baseColor;
        
        if (terrain < 0.3) {
          baseColor = vec3(0.25, 0.35, 0.2);  // Dark green-brown
        } else if (terrain < 0.6) {
          baseColor = vec3(0.55, 0.45, 0.35); // Brown
        } else {
          baseColor = vec3(0.7, 0.65, 0.6);   // Light gray-brown
        }

        // Simple lighting
        vec3 lightDir = normalize(vec3(5.0, 3.0, 5.0));
        float diffuse = max(dot(vNormal, lightDir), 0.2);
        
        vec3 finalColor = baseColor * (0.4 + diffuse * 0.6);

        // Subtle atmospheric rim
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float rim = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
        finalColor += vec3(0.6, 0.7, 0.8) * rim * 0.2;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  },

  'Hot Jupiter': {
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      void main() {
        // Hot Jupiter - intense heat, red/orange/yellow
        float bands = sin(vUv.y * 30.0 + time * 0.15) * 0.5 + 0.5;
        vec3 color1 = vec3(1.0, 0.3, 0.1);   // Bright red-orange
        vec3 color2 = vec3(0.9, 0.6, 0.2);   // Yellow-orange
        vec3 baseColor = mix(color1, color2, bands);

        // Simple lighting
        vec3 lightDir = normalize(vec3(5.0, 3.0, 5.0));
        float diffuse = max(dot(vNormal, lightDir), 0.3);
        
        vec3 finalColor = baseColor * (0.5 + diffuse * 0.5);

        // Intense atmospheric glow
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float rim = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.5);
        finalColor += vec3(1.0, 0.5, 0.2) * rim * 0.5;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  }
};