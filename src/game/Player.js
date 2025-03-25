import * as THREE from "three"; import * as CANNON from "cannon-es";
import { Weapon, MeleeWeapon, RangedWeapon } from "./Weapon.js";
import EffectsManager from "./Effects.js";

/**
 * Player class representing the first-person character
 * Handles movement, collision, camera controls, and player state
 */
class Player {
  constructor(scene, physics, camera, assetGenerator = null) {
    // Game state
    this.health = 100;
    this.ammo = { current: 30, reserve: 90 };
    this.team = "teamA";
    
    // References to key systems
    this.scene = scene;
    this.physics = physics;
    this.camera = camera;
    this.assetGenerator = assetGenerator;
    
    // Create effects manager for blood and impact effects
    this.effectsManager = new EffectsManager(scene);
    
    // Movement properties
    this.moveSpeed = 5.0;
    this.jumpForce = 7.0;
    this.gravity = -20.0;
    this.canJump = true;
    this.movementDirection = new THREE.Vector3();
    
    // Look/rotation properties
    this.rotationSpeed = 1.5;
    this.lookVerticalMin = -Math.PI * 0.4; // -85 degrees
    this.lookVerticalMax = Math.PI * 0.4;  // 85 degrees
    this.currentLookVertical = 0;
    
    // Weapon handling
    this.weapons = [];
    this.currentWeaponIndex = 0;
    this.weaponContainer = null;
    
    // Player mesh and physics
    this.initialize();
    
    // Initialize weapons
    this.initializeWeapons();
  }
  
  /**
   * Set up player mesh, collider, and camera positioning
   */
  initialize() {
    // Create a player body container
    this.playerBody = new THREE.Group();
    this.scene.add(this.playerBody);
    
    // Add a mesh for the player body (visible in 3rd person, hidden in 1st person)
    const playerGeometry = new THREE.CapsuleGeometry(0.5, 1.0, 4, 8);
    const playerMaterial = new THREE.MeshToonMaterial({ 
      color: this.team === "teamA" ? 0x0044FF : 0xFF0000,
      transparent: true,
      opacity: 0.0  // Invisible in first person
    });
    this.playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
    this.playerMesh.position.y = 0.75; // Center of capsule
    this.playerBody.add(this.playerMesh);
    
    // Create weapon container (attached to camera)
    this.weaponContainer = new THREE.Group();
    
    // Create physics body (capsule)
    this.initPhysics();
    
    // Set up camera
    this.cameraHeight = 1.7; // Eye height
    this.updateCameraPosition();
    
    // Add weapon container to camera
    this.camera.add(this.weaponContainer);
    
    // Position weapon container
    this.weaponContainer.position.set(0.3, -0.3, -0.5);
    
    // Initial position
    this.position = new THREE.Vector3(0, 2, 0);
    this.updatePosition(this.position);
  }
  
  /**
   * Initialize the player's weapons
   */
  initializeWeapons() {
    // Add a variety of weapons to the player's inventory
    
    // Add ranged weapons
    this.addWeapon(new RangedWeapon({
      name: "Assault Rifle",
      damage: 20,
      cooldown: 0.1,
      range: 100,
      startAmmo: 30,
      maxAmmo: 30,
      reserveAmmo: 90,
      reloadTime: 2.0,
      accuracy: 0.9,
      recoil: 0.1,
      assetGenerator: this.assetGenerator
    }));
    
    this.addWeapon(new RangedWeapon({
      name: "Shotgun",
      damage: 80,
      cooldown: 0.8,
      range: 20,
      startAmmo: 8,
      maxAmmo: 8,
      reserveAmmo: 24,
      reloadTime: 2.5,
      accuracy: 0.7,
      recoil: 0.3,
      assetGenerator: this.assetGenerator
    }));
    
    this.addWeapon(new RangedWeapon({
      name: "Sniper Rifle",
      damage: 120,
      cooldown: 1.2,
      range: 200,
      startAmmo: 5,
      maxAmmo: 5,
      reserveAmmo: 15,
      reloadTime: 3.0,
      accuracy: 0.99,
      recoil: 0.4,
      assetGenerator: this.assetGenerator
    }));
    
    // Add melee weapons
    this.addWeapon(new MeleeWeapon({
      name: "Combat Knife",
      damage: 40,
      cooldown: 0.5,
      range: 2.0,
      attackType: "thrust",
      knockback: 1.0,
      assetGenerator: this.assetGenerator
    }));
    
    this.addWeapon(new MeleeWeapon({
      name: "Fire Axe",
      damage: 75,
      cooldown: 1.2,
      range: 2.5,
      attackType: "swing",
      knockback: 3.0,
      assetGenerator: this.assetGenerator
    }));
    
    // Equip the first weapon
    this.equipWeapon(0);
  }
  
  /**
   * Add a weapon to the player's inventory
   * @param {Weapon} weapon - The weapon to add
   * @returns {number} The index of the added weapon
   */
  addWeapon(weapon) {
    // Add weapon to inventory
    this.weapons.push(weapon);
    return this.weapons.length - 1;
  }
  
  /**
   * Get the currently equipped weapon
   * @returns {Weapon} The current weapon
   */
  getCurrentWeapon() {
    if (this.weapons.length === 0) {
      return null;
    }
    
    return this.weapons[this.currentWeaponIndex];
  }
  
  /**
   * Equip a weapon by index
   * @param {number} index - Index of the weapon to equip
   * @returns {boolean} Whether the weapon was equipped successfully
   */
  equipWeapon(index) {
    if (index < 0 || index >= this.weapons.length) {
      return false;
    }
    
    // Remove current weapon model
    while (this.weaponContainer.children.length > 0) {
      this.weaponContainer.remove(this.weaponContainer.children[0]);
    }
    
    // Set new weapon index
    this.currentWeaponIndex = index;
    
    // Get the weapon to equip
    const weaponToEquip = this.getCurrentWeapon();
    
    if (weaponToEquip) {
      // Attach weapon to weapon container
      weaponToEquip.attachTo(
        this.weaponContainer,
        new THREE.Vector3(0, 0, 0),
        new THREE.Euler(0, 0, 0)
      );
      
      // If it's a ranged weapon, update player ammo UI
      if (weaponToEquip.type === 'ranged') {
        this.updateAmmoUI(weaponToEquip.ammo.current, weaponToEquip.ammo.reserve);
      } else {
        // Clear ammo UI for melee weapons
        this.updateAmmoUI('-', '-');
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Cycle to the next weapon
   * @returns {boolean} Whether a new weapon was equipped
   */
  nextWeapon() {
    if (this.weapons.length <= 1) {
      return false;
    }
    
    const newIndex = (this.currentWeaponIndex + 1) % this.weapons.length;
    return this.equipWeapon(newIndex);
  }
  
  /**
   * Cycle to the previous weapon
   * @returns {boolean} Whether a new weapon was equipped
   */
  previousWeapon() {
    if (this.weapons.length <= 1) {
      return false;
    }
    
    const newIndex = (this.currentWeaponIndex - 1 + this.weapons.length) % this.weapons.length;
    return this.equipWeapon(newIndex);
  }
  
  /**
   * Update the ammo UI display
   * @param {number|string} current - Current ammo
   * @param {number|string} reserve - Reserve ammo
   */
  updateAmmoUI(current, reserve) {
    // This would update the UI elements in the game
    // For demo purposes, just log to console
    console.log(`Ammo: ${current}/${reserve}`);
    
    // Update actual UI elements if they exist
    const ammoCounter = document.getElementById('ammo-counter');
    if (ammoCounter) {
      ammoCounter.textContent = `${current} / ${reserve}`;
    }
  }
  
  /**
   * Use the currently equipped weapon
   * @returns {boolean} Whether the weapon was used successfully
   */
  useWeapon() {
    const weapon = this.getCurrentWeapon();
    if (!weapon) return false;
    
    // Get the camera direction for weapon use
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.camera.quaternion);
    
    // Get the position to fire from (camera position)
    const position = new THREE.Vector3();
    this.camera.getWorldPosition(position);
    
    // Use the weapon with hit callback
    const result = weapon.use(position, direction, (hit) => {
      this.handleWeaponHit(hit);
    });
    
    // If it's a ranged weapon, update ammo UI
    if (result && weapon.type === 'ranged') {
      this.updateAmmoUI(weapon.ammo.current, weapon.ammo.reserve);
    }
    
    return result;
  }
  
  /**
   * Handle weapon hit callback
   * @param {object} hit - Hit result data
   */
  handleWeaponHit(hit) {
    if (!hit) return;
    
    // Check if we hit an enemy or object
    if (hit.object && hit.object.userData && hit.object.userData.isEnemy) {
      // Apply damage to enemy
      hit.object.userData.takeDamage(hit.damage);
      
      // Calculate intensity based on damage and weapon type
      const weapon = this.getCurrentWeapon();
      let intensity = hit.damage / 100; // Base intensity on damage (0-1 scale)
      
      // Increase intensity for headshots or critical hits
      if (hit.critical) {
        intensity = Math.min(1.0, intensity * 1.5);
      }
      
      // Create blood effect at hit point with appropriate intensity
      this.createBloodEffect(hit.point, hit.normal, intensity);
    } else {
      // Hit a non-enemy object
      // Create impact effect (sparks, dust, etc.)
      this.createImpactEffect(hit.point, hit.normal);
    }
  }
  
  /**
   * Create a blood effect
   * @param {THREE.Vector3} position - Effect position
   * @param {THREE.Vector3} normal - Surface normal
   * @param {number} intensity - Effect intensity (0-1)
   */
  createBloodEffect(position, normal = new THREE.Vector3(0, 1, 0), intensity = 1.0) {
    // Use effects manager to create a complete blood impact effect
    this.effectsManager.createBloodImpact(position, normal, intensity);
  }
  
  /**
   * Create impact effect for non-enemy hits
   * @param {THREE.Vector3} position - Impact position
   * @param {THREE.Vector3} normal - Surface normal
   */
  createImpactEffect(position, normal) {
    // Simple impact effect (unchanged for now)
    const impact = new THREE.Mesh(
      new THREE.CircleGeometry(0.05, 8),
      new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    
    // Orient the impact mark to face along the normal
    impact.lookAt(normal.add(position));
    impact.position.copy(position);
    
    this.scene.add(impact);
    
    // Remove after a short delay
    setTimeout(() => {
      this.scene.remove(impact);
    }, 10000);
  }
  
  /**
   * Reload the current weapon
   * @returns {boolean} Whether reload was initiated
   */
  reloadWeapon() {
    const weapon = this.getCurrentWeapon();
    
    if (weapon && weapon.type === 'ranged') {
      const result = weapon.reload();
      
      if (result) {
        // Show reload animation or effects
        console.log('Reloading weapon...');
      }
      
      return result;
    }
    
    return false;
  }
  
  /**
   * Initialize physics body for player
   */
  initPhysics() {
    if (!this.physics) return;
    
    // Create a capsule body
    const radius = 0.5;
    const height = 1.0;
    
    // CANNON.js doesn't have a built-in capsule, so we'll use a sphere with offset
    // A better approach would be to use a compound shape of cylinder + 2 spheres
    this.physicsBody = new CANNON.Body({
      mass: 80, // Player mass in kg
      material: new CANNON.Material({
        friction: 0.1,
        restitution: 0.0 // No bounce
      })
    });
    
    // Create the main body sphere
    const sphereShape = new CANNON.Sphere(radius);
    this.physicsBody.addShape(sphereShape, new CANNON.Vec3(0, 0, 0));
    
    // Create the foot sphere for better collision
    const footSphere = new CANNON.Sphere(radius);
    this.physicsBody.addShape(footSphere, new CANNON.Vec3(0, -height/2, 0));
    
    // Set the physics body properties
    this.physicsBody.linearDamping = 0.9; // Add some air resistance to movement
    this.physicsBody.angularDamping = 0.9; // Prevent excessive rotation
    this.physicsBody.fixedRotation = true; // Don't rotate the player capsule
    this.physicsBody.updateMassProperties();
    
    // Add to physics world
    this.physics.world.addBody(this.physicsBody);
    
    // Add contact event to detect when player is on ground
    this.onGround = false;
    this.physicsBody.addEventListener("collide", this.handleCollision.bind(this));
  }
  
  /**
   * Handle collision events to determine when player is on ground
   */
  handleCollision(event) {
    const contact = event.contact;
    
    // Check if the contact is below the player (for ground detection)
    if (contact.ni.y > 0.5) {
      this.onGround = true;
      this.canJump = true;
    }
  }
  
  /**
   * Update camera position based on player position
   */
  updateCameraPosition() {
    if (!this.camera) return;
    
    // Position camera at player's eye height
    this.camera.position.copy(this.playerBody.position);
    this.camera.position.y += this.cameraHeight;
    
    // Camera already rotated by player rotation
    this.playerBody.add(this.camera);
  }
  
  /**
   * Update player position and physics
   */
  updatePosition(position) {
    // Update mesh position
    this.playerBody.position.copy(position);
    
    // Update physics body position
    if (this.physicsBody) {
      this.physicsBody.position.copy(position);
    }
    
    // Store position
    this.position.copy(position);
  }
  
  /**
   * Handle player input and movement
   * @param {InputController} input - The input controller
   * @param {number} deltaTime - Time since last frame
   */
  update(input, deltaTime) {
    if (!input) return;
    
    // Get player direction based on camera facing
    const playerDirection = new THREE.Vector3();
    this.camera.getWorldDirection(playerDirection);
    playerDirection.y = 0; // Keep movement on XZ plane
    playerDirection.normalize();
    
    // Calculate right vector
    const rightVector = new THREE.Vector3();
    rightVector.crossVectors(playerDirection, new THREE.Vector3(0, 1, 0)).normalize();
    
    // Reset movement direction
    this.movementDirection.set(0, 0, 0);
    
    // Apply WASD input to movement direction
    if (input.keys.forward) {
      this.movementDirection.add(playerDirection);
    }
    if (input.keys.backward) {
      this.movementDirection.sub(playerDirection);
    }
    if (input.keys.right) {
      this.movementDirection.add(rightVector);
    }
    if (input.keys.left) {
      this.movementDirection.sub(rightVector);
    }
    
    // Normalize if we're moving diagonally
    if (this.movementDirection.lengthSq() > 0) {
      this.movementDirection.normalize();
      
      // Apply speed modifier
      this.movementDirection.multiplyScalar(input.keys.sprint ? this.moveSpeed * 1.5 : this.moveSpeed);
    }
    
    // Apply movement to physics
    if (this.physicsBody) {
      // Get current velocity
      const velocity = this.physicsBody.velocity;
      
      // Set horizontal velocity directly (better control feeling)
      velocity.x = this.movementDirection.x;
      velocity.z = this.movementDirection.z;
      
      // Apply jump
      if (input.keys.jump && this.canJump && this.onGround) {
        velocity.y = this.jumpForce;
        this.canJump = false;
        this.onGround = false;
      }
      
      // Update physics body
      this.physicsBody.velocity.copy(velocity);
    }
    
    // Update position from physics (if available)
    if (this.physicsBody) {
      this.playerBody.position.copy(this.physicsBody.position);
      this.position.copy(this.physicsBody.position);
    }
    
    // Handle mouse look
    this.updateLook(input.mouse.movementX, input.mouse.movementY, deltaTime);
    
    // Handle weapon actions
    if (input.mouse.leftButton) {
      this.useWeapon();
    }
    
    if (input.keys.reload) {
      this.reloadWeapon();
    }
    
    // Update current weapon
    const currentWeapon = this.getCurrentWeapon();
    if (currentWeapon) {
      currentWeapon.update(deltaTime);
    }
    
    // Handle weapon switching
    if (input.keys.nextWeapon) {
      this.nextWeapon();
    }
    
    if (input.keys.previousWeapon) {
      this.previousWeapon();
    }
    
    // Update effects manager
    if (this.effectsManager) {
      this.effectsManager.update(deltaTime);
    }
  }
  
  /**
   * Handle player looking (mouse movement)
   * @param {number} deltaX - Mouse X movement 
   * @param {number} deltaY - Mouse Y movement
   * @param {number} deltaTime - Time since last frame
   */
  updateLook(deltaX, deltaY, deltaTime) {
    // Horizontal rotation (rotate player body)
    if (deltaX !== 0) {
      this.playerBody.rotation.y -= deltaX * this.rotationSpeed * deltaTime;
    }
    
    // Vertical rotation (rotate camera only)
    if (deltaY !== 0) {
      // Update current look angle
      this.currentLookVertical += deltaY * this.rotationSpeed * deltaTime;
      
      // Clamp to min/max angles
      this.currentLookVertical = Math.max(
        this.lookVerticalMin, 
        Math.min(this.lookVerticalMax, this.currentLookVertical)
      );
      
      // Apply to camera
      this.camera.rotation.x = this.currentLookVertical;
    }
  }
  
  /**
   * Apply damage to player
   * @param {number} amount - Damage amount
   */
  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      console.log("Player died");
    }
  }
  
  /**
   * Shoot using the current weapon
   * @returns {boolean} Whether shot was fired successfully
   */
  shoot() {
    return this.useWeapon();
  }
  
  /**
   * Reload the current weapon
   */
  reload() {
    this.reloadWeapon();
  }
}

export default Player;
