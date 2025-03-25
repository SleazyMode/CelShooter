import * as THREE from "three";
import * as CANNON from "cannon-es";

/**
 * ProceduralLevel class that generates procedural levels
 * Creates a random arena or maze-like layout with random blocks, ramps, and platforms
 */
class ProceduralLevel {
  constructor(scene, physics, assetGenerator = null) {
    this.scene = scene;
    this.physics = physics;
    this.assetGenerator = assetGenerator;
    
    // Level properties
    this.levelSize = 50;
    this.blockCount = 20;
    this.wallHeight = 3;
    this.teamASpawnPoint = new THREE.Vector3(-20, 2, 0);
    this.teamBSpawnPoint = new THREE.Vector3(20, 2, 0);
    
    // Storage for level objects
    this.blocks = [];
    this.ramps = [];
    this.platforms = [];
    this.spawnPoints = {
      teamA: [],
      teamB: []
    };
    
    // Materials
    this.materials = {
      ground: null,
      wall: null,
      block: null,
      ramp: null,
      platform: null,
      teamA: null,
      teamB: null
    };
    
    this.initializeMaterials();
  }
  
  /**
   * Initialize materials for level objects
   */
  initializeMaterials() {
    // Ground material
    this.materials.ground = new THREE.MeshToonMaterial({
      color: 0x666666,
      flatShading: true
    });
    
    // Wall material
    this.materials.wall = new THREE.MeshToonMaterial({
      color: 0x444444,
      flatShading: true
    });
    
    // Block material
    this.materials.block = new THREE.MeshToonMaterial({
      color: 0x555555,
      flatShading: true
    });
    
    // Ramp material
    this.materials.ramp = new THREE.MeshToonMaterial({
      color: 0x777777,
      flatShading: true
    });
    
    // Platform material
    this.materials.platform = new THREE.MeshToonMaterial({
      color: 0x888888,
      flatShading: true
    });
    
    // Team materials
    this.materials.teamA = new THREE.MeshToonMaterial({
      color: 0x3333ff,
      flatShading: true
    });
    
    this.materials.teamB = new THREE.MeshToonMaterial({
      color: 0xff3333,
      flatShading: true
    });
    
    // Use texture from asset generator if available
    if (this.assetGenerator) {
      if (typeof this.assetGenerator.generateTexture === 'function') {
        const groundTexture = this.assetGenerator.generateTexture('ground');
        this.materials.ground.map = groundTexture;
        
        const wallTexture = this.assetGenerator.generateTexture('wall');
        this.materials.wall.map = wallTexture;
      }
    }
  }
  
  /**
   * Generate a procedural level with the specified options
   * @param {Object} options - Generation options
   */
  generate(options = {}) {
    // Apply options
    this.levelSize = options.levelSize || this.levelSize;
    this.blockCount = options.blockCount || this.blockCount;
    this.wallHeight = options.wallHeight || this.wallHeight;
    this.teamASpawnPoint = options.teamASpawnPoint || this.teamASpawnPoint;
    this.teamBSpawnPoint = options.teamBSpawnPoint || this.teamBSpawnPoint;
    
    // Clear existing level
    this.clearLevel();
    
    // Create ground
    this.createGround();
    
    // Create outer walls
    this.createOuterWalls();
    
    // Create random blocks
    this.createRandomBlocks();
    
    // Create random ramps
    this.createRandomRamps();
    
    // Create random platforms
    this.createRandomPlatforms();
    
    // Create team spawn points
    this.createTeamSpawnPoints();
    
    // Apply additional visual effects
    this.applyVisualEffects();
    
    console.log(`Generated level with size ${this.levelSize}x${this.levelSize}`);
    console.log(`- ${this.blocks.length} blocks`);
    console.log(`- ${this.ramps.length} ramps`);
    console.log(`- ${this.platforms.length} platforms`);
    console.log(`- ${this.spawnPoints.teamA.length} Team A spawn points`);
    console.log(`- ${this.spawnPoints.teamB.length} Team B spawn points`);
  }
  
  /**
   * Clear the current level
   */
  clearLevel() {
    // Remove all blocks, ramps, and platforms
    [...this.blocks, ...this.ramps, ...this.platforms].forEach(object => {
      this.scene.remove(object.mesh);
      if (object.body) {
        this.physics.removeBody(object.body);
      }
    });
    
    // Reset arrays
    this.blocks = [];
    this.ramps = [];
    this.platforms = [];
    this.spawnPoints = {
      teamA: [],
      teamB: []
    };
  }
  
  /**
   * Create the ground plane
   */
  createGround() {
    // Create ground mesh
    const groundGeometry = new THREE.PlaneGeometry(this.levelSize, this.levelSize, 10, 10);
    const groundMesh = new THREE.Mesh(groundGeometry, this.materials.ground);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);
    
    // Create ground physics body
    this.physics.createGround({
      position: new CANNON.Vec3(0, 0, 0)
    });
  }
  
  /**
   * Create outer walls around the level
   */
  createOuterWalls() {
    const wallThickness = 1;
    const wallHeight = this.wallHeight;
    const halfSize = this.levelSize / 2;
    
    // North wall
    this.createBox(
      0, wallHeight / 2, -halfSize - wallThickness / 2,
      this.levelSize + wallThickness * 2, wallHeight, wallThickness,
      this.materials.wall
    );
    
    // South wall
    this.createBox(
      0, wallHeight / 2, halfSize + wallThickness / 2,
      this.levelSize + wallThickness * 2, wallHeight, wallThickness,
      this.materials.wall
    );
    
    // East wall
    this.createBox(
      halfSize + wallThickness / 2, wallHeight / 2, 0,
      wallThickness, wallHeight, this.levelSize,
      this.materials.wall
    );
    
    // West wall
    this.createBox(
      -halfSize - wallThickness / 2, wallHeight / 2, 0,
      wallThickness, wallHeight, this.levelSize,
      this.materials.wall
    );
  }
  
  /**
   * Create random blocks throughout the level
   */
  createRandomBlocks() {
    const halfSize = this.levelSize / 2 - 5; // Inset from edges
    const maxBlockSize = 4;
    const minBlockSize = 1;
    const safeZoneRadius = 5; // Safe zone around spawn points
    
    for (let i = 0; i < this.blockCount; i++) {
      // Generate random position
      const x = (Math.random() * 2 - 1) * halfSize;
      const z = (Math.random() * 2 - 1) * halfSize;
      
      // Skip if too close to spawn points
      if (this.isInSafeZone(x, z, safeZoneRadius)) {
        continue;
      }
      
      // Random size
      const width = minBlockSize + Math.random() * (maxBlockSize - minBlockSize);
      const height = minBlockSize + Math.random() * (this.wallHeight - minBlockSize);
      const depth = minBlockSize + Math.random() * (maxBlockSize - minBlockSize);
      
      // Create block
      const block = this.createBox(
        x, height / 2, z,
        width, height, depth,
        this.materials.block
      );
      
      this.blocks.push(block);
    }
  }
  
  /**
   * Create random ramps throughout the level
   */
  createRandomRamps() {
    const halfSize = this.levelSize / 2 - 5;
    const rampCount = Math.floor(this.blockCount / 4);
    const maxRampLength = 6;
    const minRampLength = 3;
    const safeZoneRadius = 5;
    
    for (let i = 0; i < rampCount; i++) {
      // Generate random position
      const x = (Math.random() * 2 - 1) * halfSize;
      const z = (Math.random() * 2 - 1) * halfSize;
      
      // Skip if too close to spawn points
      if (this.isInSafeZone(x, z, safeZoneRadius)) {
        continue;
      }
      
      // Random size
      const width = 2 + Math.random() * 2;
      const length = minRampLength + Math.random() * (maxRampLength - minRampLength);
      const height = 1 + Math.random() * (this.wallHeight - 1);
      
      // Random rotation (0, 90, 180, 270 degrees)
      const rotation = Math.floor(Math.random() * 4) * Math.PI / 2;
      
      // Create ramp
      const ramp = this.createRamp(
        x, height / 2, z,
        width, length, height,
        rotation,
        this.materials.ramp
      );
      
      this.ramps.push(ramp);
    }
  }
  
  /**
   * Create random platforms throughout the level
   */
  createRandomPlatforms() {
    const halfSize = this.levelSize / 2 - 5;
    const platformCount = Math.floor(this.blockCount / 3);
    const safeZoneRadius = 5;
    
    for (let i = 0; i < platformCount; i++) {
      // Generate random position
      const x = (Math.random() * 2 - 1) * halfSize;
      const z = (Math.random() * 2 - 1) * halfSize;
      
      // Skip if too close to spawn points
      if (this.isInSafeZone(x, z, safeZoneRadius)) {
        continue;
      }
      
      // Random size
      const width = 2 + Math.random() * 4;
      const depth = 2 + Math.random() * 4;
      const height = 2 + Math.random() * (this.wallHeight - 2);
      const thickness = 0.5;
      
      // Create platform
      const platform = this.createBox(
        x, height, z,
        width, thickness, depth,
        this.materials.platform
      );
      
      this.platforms.push(platform);
    }
  }
  
  /**
   * Create team spawn points
   */
  createTeamSpawnPoints() {
    // Team A spawn area (blue)
    this.createSpawnArea(
      this.teamASpawnPoint.x,
      this.teamASpawnPoint.y,
      this.teamASpawnPoint.z,
      'teamA'
    );
    
    // Team B spawn area (red)
    this.createSpawnArea(
      this.teamBSpawnPoint.x,
      this.teamBSpawnPoint.y,
      this.teamBSpawnPoint.z,
      'teamB'
    );
  }
  
  /**
   * Create a spawn area for a team
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} z - Z position
   * @param {string} team - Team identifier ('teamA' or 'teamB')
   */
  createSpawnArea(x, y, z, team) {
    const spawnAreaSize = 8;
    const spawnPointCount = 5;
    const material = team === 'teamA' ? this.materials.teamA : this.materials.teamB;
    
    // Create spawn platform
    const platform = this.createBox(
      x, y - 0.5, z,
      spawnAreaSize, 0.1, spawnAreaSize,
      material
    );
    
    // Add spawn points
    for (let i = 0; i < spawnPointCount; i++) {
      // Random position within spawn area
      const offsetX = (Math.random() * 2 - 1) * (spawnAreaSize / 2 - 1);
      const offsetZ = (Math.random() * 2 - 1) * (spawnAreaSize / 2 - 1);
      
      // Create spawn point marker (for debugging)
      const marker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8),
        material
      );
      marker.position.set(x + offsetX, y, z + offsetZ);
      this.scene.add(marker);
      
      // Store spawn point position
      this.spawnPoints[team].push(new THREE.Vector3(x + offsetX, y, z + offsetZ));
    }
  }
  
  /**
   * Apply additional visual effects to the level
   */
  applyVisualEffects() {
    // Add ambient particles or other effects
    // For simplicity, we're not implementing this now
  }
  
  /**
   * Check if a position is within safe zones (near spawn points)
   * @param {number} x - X position
   * @param {number} z - Z position
   * @param {number} radius - Safe zone radius
   * @returns {boolean} Whether position is in a safe zone
   */
  isInSafeZone(x, z, radius) {
    // Check Team A spawn point
    const distA = Math.sqrt(
      Math.pow(x - this.teamASpawnPoint.x, 2) +
      Math.pow(z - this.teamASpawnPoint.z, 2)
    );
    
    // Check Team B spawn point
    const distB = Math.sqrt(
      Math.pow(x - this.teamBSpawnPoint.x, 2) +
      Math.pow(z - this.teamBSpawnPoint.z, 2)
    );
    
    return distA < radius || distB < radius;
  }
  
  /**
   * Create a box with mesh and physics body
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} z - Z position
   * @param {number} width - Box width
   * @param {number} height - Box height
   * @param {number} depth - Box depth
   * @param {THREE.Material} material - Box material
   * @returns {Object} Object with mesh and physics body
   */
  createBox(x, y, z, width, height, depth, material) {
    // Create mesh
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    
    // Create physics body
    const body = this.physics.createBox({
      position: new CANNON.Vec3(x, y, z),
      size: new CANNON.Vec3(width, height, depth),
      mass: 0 // Static body
    });
    
    return { mesh, body };
  }
  
  /**
   * Create a ramp with mesh and physics body
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} z - Z position
   * @param {number} width - Ramp width
   * @param {number} length - Ramp length
   * @param {number} height - Ramp height
   * @param {number} rotation - Y-axis rotation in radians
   * @param {THREE.Material} material - Ramp material
   * @returns {Object} Object with mesh and body
   */
  createRamp(x, y, z, width, length, height, rotation, material) {
    // Create custom geometry for the ramp
    const geometry = new THREE.BufferGeometry();
    
    // Define the vertices
    const vertices = new Float32Array([
      // Bottom face
      -width/2, 0, -length/2,
      width/2, 0, -length/2,
      width/2, 0, length/2,
      -width/2, 0, length/2,
      
      // Top face sloped
      -width/2, 0, -length/2,
      width/2, 0, -length/2,
      width/2, height, length/2,
      -width/2, height, length/2,
      
      // Side faces
      -width/2, 0, -length/2,
      -width/2, 0, length/2,
      -width/2, height, length/2,
      
      width/2, 0, -length/2,
      width/2, 0, length/2,
      width/2, height, length/2,
    ]);
    
    // Define the faces (indices)
    const indices = [
      // Bottom face
      0, 1, 2,
      0, 2, 3,
      
      // Sloped face
      4, 7, 6,
      4, 6, 5,
      
      // Left side
      8, 9, 10,
      
      // Right side
      11, 13, 12,
      
      // Back
      0, 5, 1,
      0, 4, 5,
      
      // Front
      3, 2, 6,
      3, 6, 7
    ];
    
    // Set vertices and indices
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    
    // Calculate normals
    geometry.computeVertexNormals();
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotation;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    
    // For physics, we use a box for simplicity
    // In a real game, you'd want to use a proper triangle mesh or compound shape
    const body = this.physics.createBox({
      position: new CANNON.Vec3(x, y, z),
      size: new CANNON.Vec3(width, height / 2, length),
      mass: 0 // Static body
    });
    
    // Apply rotation to physics body
    const quat = new CANNON.Quaternion();
    quat.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotation);
    body.quaternion = quat;
    
    return { mesh, body };
  }
  
  /**
   * Get a random spawn point for a team
   * @param {string} team - Team identifier ('teamA' or 'teamB')
   * @returns {THREE.Vector3} Spawn point position
   */
  getRandomSpawnPoint(team) {
    const spawnPoints = this.spawnPoints[team];
    if (spawnPoints.length === 0) {
      console.warn(`No spawn points available for ${team}`);
      return team === 'teamA' ? this.teamASpawnPoint : this.teamBSpawnPoint;
    }
    
    return spawnPoints[Math.floor(Math.random() * spawnPoints.length)].clone();
  }
}

export default ProceduralLevel;
