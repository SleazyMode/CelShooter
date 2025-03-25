import * as THREE from 'three';

/**
 * Effects manager for particle systems and visual effects
 * Handles blood splats, impact effects, and other particle-based visuals
 */
class EffectsManager {
  constructor(scene, assetGenerator = null) {
    this.scene = scene;
    this.assetGenerator = assetGenerator;
    
    // Storage for all active effects
    this.activeEffects = [];
    
    // Effect counters and limits for performance
    this.maxParticleSystems = 20;
    this.maxDecals = 50;
    this.particleCount = 0;
    this.decalCount = 0;
    
    // Load textures
    this.textures = {
      blood: null,
      bloodSplatter: null,
      bloodDrip: null,
      bloodPool: null,
      spark: null,
      smoke: null
    };
    
    this.loadTextures();
  }
  
  /**
   * Load all effect textures
   */
  loadTextures() {
    const textureLoader = new THREE.TextureLoader();
    
    // Use AIAssetGenerator if available, otherwise generate locally
    if (this.assetGenerator && typeof this.assetGenerator.generateBloodTexture === 'function') {
      // Load textures from AIAssetGenerator
      this.textures.blood = this.assetGenerator.generateBloodTexture('particle');
      this.textures.bloodSplatter = this.assetGenerator.generateBloodTexture('splatter');
      this.textures.bloodDrip = this.assetGenerator.generateBloodTexture('drip');
      this.textures.bloodPool = this.assetGenerator.generateBloodTexture('pool');
    } else {
      // Generate textures locally
      this.generateBloodTexture();
    }
  }
  
  /**
   * Generate a blood particle texture using Canvas API
   */
  generateBloodTexture() {
    // Create canvas for blood particle
    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 64;
    particleCanvas.height = 64;
    const particleContext = particleCanvas.getContext('2d');
    
    // Draw blood particle (soft red circle with irregular edges)
    const centerX = particleCanvas.width / 2;
    const centerY = particleCanvas.height / 2;
    const radius = 24;
    
    // Radial gradient for blood drop
    const gradient = particleContext.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );
    gradient.addColorStop(0, 'rgba(220, 0, 0, 1.0)');
    gradient.addColorStop(0.7, 'rgba(180, 0, 0, 0.9)');
    gradient.addColorStop(1, 'rgba(160, 0, 0, 0.0)');
    
    particleContext.fillStyle = gradient;
    particleContext.beginPath();
    particleContext.arc(centerX, centerY, radius, 0, Math.PI * 2);
    particleContext.fill();
    
    // Create texture from canvas
    this.textures.blood = new THREE.CanvasTexture(particleCanvas);
    
    // Create canvas for blood splatter
    const splatterCanvas = document.createElement('canvas');
    splatterCanvas.width = 256;
    splatterCanvas.height = 256;
    const splatterContext = splatterCanvas.getContext('2d');
    
    // Clear canvas
    splatterContext.fillStyle = 'rgba(0, 0, 0, 0)';
    splatterContext.fillRect(0, 0, splatterCanvas.width, splatterCanvas.height);
    
    // Draw blood splatter (random splatter shape)
    this.drawRandomSplatter(splatterContext, 'rgba(180, 0, 0, 1.0)', 12);
    
    // Create texture from canvas
    this.textures.bloodSplatter = new THREE.CanvasTexture(splatterCanvas);
  }
  
  /**
   * Draw a random blood splatter pattern on the given canvas context
   * @param {CanvasRenderingContext2D} context - Canvas context
   * @param {string} color - CSS color string
   * @param {number} complexity - Number of splatter elements
   */
  drawRandomSplatter(context, color, complexity) {
    const width = context.canvas.width;
    const height = context.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Main splat in center
    context.fillStyle = color;
    this.drawSplatterBlob(context, centerX, centerY, 40 + Math.random() * 30);
    
    // Random smaller blobs
    for (let i = 0; i < complexity; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 60;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const size = 5 + Math.random() * 25;
      
      this.drawSplatterBlob(context, x, y, size);
    }
    
    // Add small droplets
    for (let i = 0; i < complexity * 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 90;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const size = 2 + Math.random() * 5;
      
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }
    
    // Add connecting drips between blobs
    context.beginPath();
    for (let i = 0; i < complexity / 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance1 = 20 + Math.random() * 30;
      const distance2 = distance1 + 20 + Math.random() * 30;
      
      const x1 = centerX + Math.cos(angle) * distance1;
      const y1 = centerY + Math.sin(angle) * distance1;
      const x2 = centerX + Math.cos(angle) * distance2;
      const y2 = centerY + Math.sin(angle) * distance2;
      
      context.moveTo(x1, y1);
      context.quadraticCurveTo(
        (x1 + x2) / 2 + (Math.random() - 0.5) * 15,
        (y1 + y2) / 2 + (Math.random() - 0.5) * 15,
        x2, y2
      );
    }
    context.lineWidth = 3 + Math.random() * 4;
    context.stroke();
  }
  
  /**
   * Draw a single blood splatter blob with irregular edges
   * @param {CanvasRenderingContext2D} context - Canvas context
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {number} radius - Base radius of blob
   */
  drawSplatterBlob(context, x, y, radius) {
    context.beginPath();
    
    // Create irregular blob using multiple bezier curves
    const points = 8 + Math.floor(Math.random() * 4);
    const angleStep = Math.PI * 2 / points;
    
    // First point
    let angle = 0;
    let r = radius * (0.8 + Math.random() * 0.4);
    let startX = x + Math.cos(angle) * r;
    let startY = y + Math.sin(angle) * r;
    context.moveTo(startX, startY);
    
    // Draw each curve segment
    for (let i = 0; i < points; i++) {
      // Current point
      angle += angleStep;
      r = radius * (0.7 + Math.random() * 0.6);
      const endX = x + Math.cos(angle) * r;
      const endY = y + Math.sin(angle) * r;
      
      // Control point (with random offset)
      const cpAngle = angle - angleStep / 2;
      const cpDistance = radius * (1.0 + Math.random() * 0.8);
      const cpX = x + Math.cos(cpAngle) * cpDistance;
      const cpY = y + Math.sin(cpAngle) * cpDistance;
      
      // Draw curve
      context.quadraticCurveTo(cpX, cpY, endX, endY);
    }
    
    // Connect to starting point
    context.closePath();
    context.fill();
  }
  
  /**
   * Create a blood particle system at the specified position
   * @param {THREE.Vector3} position - Position of impact
   * @param {THREE.Vector3} normal - Surface normal at impact
   * @param {number} intensity - Intensity of blood effect (0-1)
   */
  createBloodParticles(position, normal = new THREE.Vector3(0, 1, 0), intensity = 1.0) {
    if (this.particleCount >= this.maxParticleSystems) {
      this.removeOldestEffect('particle');
    }
    
    // Create particle system geometry
    const particleCount = 30 + Math.floor(intensity * 50);
    const particles = new THREE.BufferGeometry();
    
    // Arrays for particle positions and velocities
    const positionArray = new Float32Array(particleCount * 3);
    const velocityArray = new Float32Array(particleCount * 3);
    const sizeArray = new Float32Array(particleCount);
    const timeArray = new Float32Array(particleCount);
    
    // Set initial positions and velocities
    for (let i = 0; i < particleCount; i++) {
      // Calculate spread based on normal direction
      const spread = 0.2 + Math.random() * 0.3;
      
      // Random angle around normal
      const randomAngle = Math.random() * Math.PI * 2;
      
      // Create perpendicular axes to normal
      const perp1 = new THREE.Vector3(1, 0, 0);
      if (Math.abs(normal.dot(perp1)) > 0.99) {
        perp1.set(0, 1, 0);
      }
      
      const perp2 = new THREE.Vector3().crossVectors(normal, perp1).normalize();
      perp1.crossVectors(normal, perp2).normalize();
      
      // Random vector in hemisphere around normal
      const randomVec = new THREE.Vector3()
        .addScaledVector(normal, 0.5 + Math.random() * 0.5) // Mostly in normal direction
        .addScaledVector(perp1, Math.cos(randomAngle) * spread)
        .addScaledVector(perp2, Math.sin(randomAngle) * spread)
        .normalize();
      
      // Position around impact point with small randomness
      positionArray[i * 3] = position.x + (Math.random() - 0.5) * 0.05;
      positionArray[i * 3 + 1] = position.y + (Math.random() - 0.5) * 0.05;
      positionArray[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.05;
      
      // Velocity in random direction, faster along normal
      const speed = 1.0 + Math.random() * 3.0 * intensity;
      velocityArray[i * 3] = randomVec.x * speed;
      velocityArray[i * 3 + 1] = randomVec.y * speed;
      velocityArray[i * 3 + 2] = randomVec.z * speed;
      
      // Random size
      sizeArray[i] = 0.02 + Math.random() * 0.08;
      
      // Random lifetime
      timeArray[i] = 0.5 + Math.random() * 1.0;
    }
    
    // Add attributes to geometry
    particles.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    particles.setAttribute('velocity', new THREE.BufferAttribute(velocityArray, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));
    particles.setAttribute('time', new THREE.BufferAttribute(timeArray, 1));
    
    // Create particle material
    const material = new THREE.PointsMaterial({
      size: 0.1,
      map: this.textures.blood,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      vertexColors: false,
      color: new THREE.Color(0xcc0000)
    });
    
    // Create particle system
    const particleSystem = new THREE.Points(particles, material);
    this.scene.add(particleSystem);
    
    // Create effect object to track
    const effect = {
      type: 'particle',
      object: particleSystem,
      lifetime: 2.0,
      age: 0,
      update: (deltaTime) => {
        // Update age
        effect.age += deltaTime;
        
        // Update positions based on velocity
        const positions = particles.attributes.position.array;
        const velocities = particles.attributes.velocity.array;
        
        for (let i = 0; i < particleCount; i++) {
          // Update position
          positions[i * 3] += velocities[i * 3] * deltaTime;
          positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime;
          positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime;
          
          // Add gravity
          velocities[i * 3 + 1] -= 5.0 * deltaTime;
        }
        
        // Update material opacity based on age
        const lifePercent = effect.age / effect.lifetime;
        material.opacity = 0.8 * (1.0 - lifePercent);
        
        // Mark attributes as needing update
        particles.attributes.position.needsUpdate = true;
        particles.attributes.velocity.needsUpdate = true;
        
        // Return true if effect should be removed
        return effect.age >= effect.lifetime;
      }
    };
    
    this.activeEffects.push(effect);
    this.particleCount++;
    
    return particleSystem;
  }
  
  /**
   * Create a blood splatter decal on a surface
   * @param {THREE.Vector3} position - Position of impact
   * @param {THREE.Vector3} normal - Surface normal at impact
   * @param {number} size - Size of splatter
   */
  createBloodSplatter(position, normal, size = 0.5) {
    if (this.decalCount >= this.maxDecals) {
      this.removeOldestEffect('decal');
    }
    
    // Create plane aligned with surface
    const splatterPlane = new THREE.PlaneGeometry(size, size);
    
    // Create material with random UV rotation for variety
    const material = new THREE.MeshBasicMaterial({
      map: this.textures.bloodSplatter,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      color: new THREE.Color(0xaa0000)
    });
    
    // Create mesh
    const splatter = new THREE.Mesh(splatterPlane, material);
    
    // Position and orient to face normal
    splatter.position.copy(position);
    splatter.position.addScaledVector(normal, 0.01); // Small offset to prevent z-fighting
    
    // Face along normal direction
    splatter.lookAt(position.clone().add(normal));
    
    // Random rotation around normal axis
    splatter.rotateZ(Math.random() * Math.PI * 2);
    
    // Add to scene
    this.scene.add(splatter);
    
    // Create effect object to track
    const effect = {
      type: 'decal',
      object: splatter,
      lifetime: 30.0, // Blood stays longer
      age: 0,
      update: (deltaTime) => {
        // Update age
        effect.age += deltaTime;
        
        // Fade out near end of lifetime
        if (effect.age > effect.lifetime * 0.8) {
          const fadePercent = (effect.age - effect.lifetime * 0.8) / (effect.lifetime * 0.2);
          material.opacity = 0.9 * (1.0 - fadePercent);
        }
        
        // Return true if effect should be removed
        return effect.age >= effect.lifetime;
      }
    };
    
    this.activeEffects.push(effect);
    this.decalCount++;
    
    return splatter;
  }
  
  /**
   * Remove the oldest effect of a specific type
   * @param {string} type - Effect type to remove ('particle' or 'decal')
   */
  removeOldestEffect(type) {
    let oldestIndex = -1;
    let oldestAge = 0;
    
    // Find oldest effect of specified type
    for (let i = 0; i < this.activeEffects.length; i++) {
      const effect = this.activeEffects[i];
      if (effect.type === type && effect.age > oldestAge) {
        oldestAge = effect.age;
        oldestIndex = i;
      }
    }
    
    // Remove it if found
    if (oldestIndex >= 0) {
      const effect = this.activeEffects[oldestIndex];
      this.scene.remove(effect.object);
      
      this.activeEffects.splice(oldestIndex, 1);
      
      if (type === 'particle') this.particleCount--;
      if (type === 'decal') this.decalCount--;
    }
  }
  
  /**
   * Create a complete blood impact effect (particles + splatter)
   * @param {THREE.Vector3} position - Impact position
   * @param {THREE.Vector3} normal - Surface normal
   * @param {number} intensity - Effect intensity (0-1)
   */
  createBloodImpact(position, normal, intensity = 1.0) {
    // Create particle effect
    this.createBloodParticles(position, normal, intensity);
    
    // Create splatter on surface
    this.createBloodSplatter(position, normal, 0.3 + intensity * 0.7);
    
    // Add multiple splatters for more intense hits
    if (intensity > 0.7) {
      const extraSplatters = Math.floor((intensity - 0.7) * 6);
      
      for (let i = 0; i < extraSplatters; i++) {
        // Random position near impact
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        );
        
        // Project offset to be parallel to surface
        offset.sub(normal.clone().multiplyScalar(offset.dot(normal)));
        
        const splatPos = position.clone().add(offset);
        this.createBloodSplatter(splatPos, normal, 0.2 + Math.random() * 0.3);
      }
    }
  }
  
  /**
   * Update all active effects
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    // Update each effect and remove completed ones
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      const completed = effect.update(deltaTime);
      
      if (completed) {
        this.scene.remove(effect.object);
        
        // Update counts
        if (effect.type === 'particle') this.particleCount--;
        if (effect.type === 'decal') this.decalCount--;
        
        // Remove from array
        this.activeEffects.splice(i, 1);
      }
    }
  }
  
  /**
   * Clear all active effects
   */
  clearAllEffects() {
    for (const effect of this.activeEffects) {
      this.scene.remove(effect.object);
    }
    
    this.activeEffects = [];
    this.particleCount = 0;
    this.decalCount = 0;
  }
}

export default EffectsManager; 