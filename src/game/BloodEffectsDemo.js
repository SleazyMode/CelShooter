import * as THREE from 'three';
import AIAssetGenerator from './AIAssetGenerator.js';
import EffectsManager from './Effects.js';
import GameManager from './GameManager.js';

/**
 * BloodEffectsDemo class to demonstrate the blood effects system
 * This class shows how to:
 * 1. Set up the effects manager
 * 2. Create blood effects at different intensities
 * 3. Handle performance and cleanup
 */
class BloodEffectsDemo {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    
    // Initialize asset generator
    this.assetGenerator = new AIAssetGenerator();
    
    // Initialize effects manager directly or via GameManager
    this.gameManager = new GameManager(scene);
    this.gameManager.initializeEffects();
    
    // Direct access to effects manager for demonstration
    this.effectsManager = new EffectsManager(scene, this.assetGenerator);
    
    // Setup demo environment
    this.setupScene();
    
    // Bind methods
    this.update = this.update.bind(this);
    this.createRandomEffect = this.createRandomEffect.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    
    // Add event listeners
    window.addEventListener('keydown', this.onKeyDown);
    
    // Create demo timer
    this.autoDemo = false;
    this.demoTimer = 0;
    this.demoInterval = 0.5; // Seconds between auto-effects
  }
  
  /**
   * Set up the demo scene
   */
  setupScene() {
    // Create test surfaces for blood splatter
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: 0x999999 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 10),
      new THREE.MeshStandardMaterial({ color: 0xcccccc })
    );
    wall.position.z = -10;
    wall.position.y = 5;
    wall.receiveShadow = true;
    this.scene.add(wall);
    
    // Add instructions text
    const instructions = document.createElement('div');
    instructions.style.position = 'absolute';
    instructions.style.top = '10px';
    instructions.style.left = '10px';
    instructions.style.color = '#ffffff';
    instructions.style.fontFamily = 'Arial';
    instructions.style.fontSize = '14px';
    instructions.style.textShadow = '1px 1px 2px #000000';
    instructions.innerHTML = `
      <h2>Blood Effects Demo</h2>
      <p>Press these keys to create effects:</p>
      <ul>
        <li><strong>1</strong> - Low intensity blood impact</li>
        <li><strong>2</strong> - Medium intensity blood impact</li>
        <li><strong>3</strong> - High intensity blood impact</li>
        <li><strong>4</strong> - Blood pool</li>
        <li><strong>5</strong> - Blood drips</li>
        <li><strong>A</strong> - Toggle auto demo</li>
        <li><strong>C</strong> - Clear all effects</li>
      </ul>
      <p>Click anywhere to create a blood effect at that position</p>
    `;
    document.body.appendChild(instructions);
    
    // Add click event for creating effects at clicked position
    const canvas = this.renderer.domElement;
    canvas.addEventListener('click', (event) => {
      // Get normalized device coordinates
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      
      // Raycast to find clicked position
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.camera);
      
      const intersects = raycaster.intersectObjects(this.scene.children);
      
      if (intersects.length > 0) {
        const hit = intersects[0];
        
        // Create blood effect at hit point with random intensity
        const intensity = 0.3 + Math.random() * 0.7;
        this.effectsManager.createBloodImpact(hit.point, hit.face.normal, intensity);
      }
    });
  }
  
  /**
   * Create a random blood effect in the scene
   * @param {string} type - Type of effect to create
   * @param {number} intensity - Intensity of effect (0-1)
   */
  createRandomEffect(type = 'impact', intensity = 1.0) {
    // Random position in scene
    const x = (Math.random() - 0.5) * 18;
    const z = (Math.random() - 0.5) * 18;
    
    // Choose a surface (floor or wall)
    const onWall = Math.random() > 0.5;
    
    let position, normal;
    
    if (onWall) {
      // Position on back wall
      position = new THREE.Vector3(x, 1 + Math.random() * 8, -9.9);
      normal = new THREE.Vector3(0, 0, 1);
    } else {
      // Position on floor
      position = new THREE.Vector3(x, 0.1, z);
      normal = new THREE.Vector3(0, 1, 0);
    }
    
    // Create effect based on type
    switch (type) {
      case 'impact':
        this.effectsManager.createBloodImpact(position, normal, intensity);
        break;
      case 'pool':
        const poolPosition = new THREE.Vector3(x, 0.01, z);
        const poolNormal = new THREE.Vector3(0, 1, 0);
        this.effectsManager.createBloodSplatter(poolPosition, poolNormal, 1.0 + Math.random() * 0.5);
        break;
      case 'drip':
        if (onWall) {
          // Drips only make sense on vertical surfaces
          this.effectsManager.createBloodSplatter(position, normal, 0.3 + Math.random() * 0.3);
          // TODO: Add actual drip effect if implemented
        } else {
          this.effectsManager.createBloodImpact(position, normal, intensity);
        }
        break;
    }
  }
  
  /**
   * Handle keydown events for demo controls
   * @param {KeyboardEvent} event - Keyboard event
   */
  onKeyDown(event) {
    switch (event.key) {
      case '1':
        // Low intensity blood effect
        this.createRandomEffect('impact', 0.3);
        break;
      case '2':
        // Medium intensity blood effect
        this.createRandomEffect('impact', 0.7);
        break;
      case '3':
        // High intensity blood effect
        this.createRandomEffect('impact', 1.0);
        break;
      case '4':
        // Blood pool
        this.createRandomEffect('pool', 1.0);
        break;
      case '5':
        // Blood drips
        this.createRandomEffect('drip', 0.8);
        break;
      case 'a':
      case 'A':
        // Toggle auto demo
        this.autoDemo = !this.autoDemo;
        console.log(`Auto demo: ${this.autoDemo ? 'ON' : 'OFF'}`);
        break;
      case 'c':
      case 'C':
        // Clear all effects
        this.effectsManager.clearAllEffects();
        break;
    }
  }
  
  /**
   * Update demo state and effects
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    // Update effects manager
    this.effectsManager.update(deltaTime);
    
    // Auto demo logic
    if (this.autoDemo) {
      this.demoTimer += deltaTime;
      
      if (this.demoTimer >= this.demoInterval) {
        // Create random effect
        const effectType = Math.random() > 0.7 ? 
          (Math.random() > 0.5 ? 'pool' : 'drip') : 
          'impact';
        
        const intensity = 0.3 + Math.random() * 0.7;
        this.createRandomEffect(effectType, intensity);
        
        // Reset timer
        this.demoTimer = 0;
      }
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Remove event listeners
    window.removeEventListener('keydown', this.onKeyDown);
    
    // Clear all effects
    this.effectsManager.clearAllEffects();
  }
}

export default BloodEffectsDemo; 