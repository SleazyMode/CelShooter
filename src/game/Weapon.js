import * as THREE from "three";

/**
 * Base Weapon class for all weapon types
 * Handles common weapon functionality and properties
 */
class Weapon {
  constructor(params = {}) {
    // Basic weapon properties
    this.name = params.name || "Unknown Weapon";
    this.type = params.type || "unknown"; // "melee" or "ranged"
    this.damage = params.damage || 20;
    this.cooldown = params.cooldown || 0.5; // Time in seconds between attacks
    this.lastUsed = 0; // Timestamp of last use
    this.range = params.range || 2.0; // Effective range (different meaning for melee vs ranged)
    this.weight = params.weight || 1.0; // Affects player movement
    
    // Visual properties
    this.model = null;
    this.modelPath = params.modelPath || null; // Path to custom model
    this.particleSystem = null;
    this.soundEffects = {
      use: params.soundUse || null,
      reload: params.soundReload || null,
      impact: params.soundImpact || null
    };
    
    // Effects
    this.effects = params.effects || [];
    
    // Create weapon model
    this.createModel(params.assetGenerator);
  }
  
  /**
   * Create weapon visual model
   * If assetGenerator is provided, use it to generate model
   */
  createModel(assetGenerator = null) {
    // Create a weapon group
    this.model = new THREE.Group();
    
    if (assetGenerator && assetGenerator.generateWeapon) {
      // Use AI generator to create model
      const generatedModel = assetGenerator.generateWeapon(this.type, this.name);
      if (generatedModel) {
        this.model.add(generatedModel);
        return;
      }
    }
    
    // Fallback to basic model
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.5),
      new THREE.MeshToonMaterial({ color: 0x333333 })
    );
    this.model.add(body);
  }
  
  /**
   * Update weapon state and animations
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    // Base update logic for animations, effects, etc.
    // Implemented by subclasses
  }
  
  /**
   * Check if weapon can be used based on cooldown
   * @returns {boolean}
   */
  canUse() {
    const now = performance.now() / 1000;
    return now - this.lastUsed >= this.cooldown;
  }
  
  /**
   * Base use method - must be implemented by subclasses
   * @param {Vector3} position - Start position
   * @param {Vector3} direction - Direction of use
   * @returns {boolean} Whether use was successful
   */
  use(position, direction) {
    if (!this.canUse()) return false;
    
    // Record time of use
    this.lastUsed = performance.now() / 1000;
    
    // Play sound effect if available
    if (this.soundEffects.use) {
      this.soundEffects.use.play();
    }
    
    return true;
  }
  
  /**
   * Calculate weapon damage with modifiers
   * @param {object} modifiers - Damage modifiers
   * @returns {number} Final damage amount
   */
  calculateDamage(modifiers = {}) {
    let finalDamage = this.damage;
    
    // Apply modifiers
    if (modifiers.critical) {
      finalDamage *= 2;
    }
    
    if (modifiers.distance) {
      // Damage falloff based on distance
      const falloff = Math.max(0, 1 - (modifiers.distance / this.range));
      finalDamage *= falloff;
    }
    
    return Math.round(finalDamage);
  }
  
  /**
   * Attach weapon to player or object
   * @param {THREE.Object3D} parent - Object to attach to
   * @param {THREE.Vector3} position - Relative position
   * @param {THREE.Euler} rotation - Relative rotation
   */
  attachTo(parent, position = new THREE.Vector3(), rotation = new THREE.Euler()) {
    if (parent && this.model) {
      this.model.position.copy(position);
      this.model.rotation.copy(rotation);
      parent.add(this.model);
    }
  }
  
  /**
   * Show impact effects at point of impact
   * @param {THREE.Vector3} position - Impact position
   * @param {THREE.Vector3} normal - Surface normal
   */
  showImpactEffect(position, normal) {
    // Base method for showing impact effects
    // Implemented by subclasses
  }
}

/**
 * MeleeWeapon class for close combat weapons
 * Extends base Weapon with melee-specific functionality
 */
class MeleeWeapon extends Weapon {
  constructor(params = {}) {
    // Set melee type before calling super
    params.type = "melee";
    
    // Default melee properties
    params.damage = params.damage || 40;
    params.cooldown = params.cooldown || 0.8;
    params.range = params.range || 2.5;
    
    super(params);
    
    // Melee-specific properties
    this.swingWidth = params.swingWidth || 90; // Swing arc in degrees
    this.swingDuration = params.swingDuration || 0.3; // Swing animation duration
    this.isSwinging = false;
    this.swingProgress = 0;
    
    // Melee weapon properties
    this.knockback = params.knockback || 2.0;
    this.attackType = params.attackType || "swing"; // swing, thrust, etc.
    
    // Animation properties
    this.initialRotation = new THREE.Euler();
    this.targetRotation = new THREE.Euler();
  }
  
  /**
   * Swing or attack with the melee weapon
   * @param {THREE.Vector3} position - Player position
   * @param {THREE.Vector3} direction - Direction player is facing
   * @param {function} hitCallback - Callback for hit detection
   * @returns {boolean} Whether swing was initiated
   */
  use(position, direction, hitCallback) {
    if (!super.use(position, direction)) return false;
    
    // Start swing animation
    this.isSwinging = true;
    this.swingProgress = 0;
    
    // Store initial and target rotations for animation
    this.initialRotation.copy(this.model.rotation);
    this.targetRotation.set(
      this.initialRotation.x - Math.PI * 0.25, // Swing down
      this.initialRotation.y,
      this.initialRotation.z + (this.attackType === "swing" ? Math.PI * 0.5 : 0) // Side swing
    );
    
    // Perform hit detection
    this.performHitDetection(position, direction, hitCallback);
    
    return true;
  }
  
  /**
   * Perform hit detection for the melee attack
   * @param {THREE.Vector3} position - Starting position for detection
   * @param {THREE.Vector3} direction - Direction of attack
   * @param {function} hitCallback - Callback when hit detected
   */
  performHitDetection(position, direction, hitCallback) {
    // Create a raycaster for hit detection
    const raycaster = new THREE.Raycaster();
    raycaster.set(position, direction);
    raycaster.far = this.range;
    
    // Check for hits in an arc around the forward direction
    const arcSteps = 5; // Number of rays in the arc
    const arcAngle = THREE.MathUtils.degToRad(this.swingWidth);
    
    // Create a collection of raycasts in an arc
    const hits = [];
    
    // Center ray
    raycaster.set(position, direction);
    hits.push(...raycaster.intersectObjects([])); // Add scene objects here
    
    // Arc rays
    for (let i = 1; i <= arcSteps; i++) {
      // Left side of arc
      const leftAngle = (i / arcSteps) * (arcAngle / 2);
      const leftDir = direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), leftAngle);
      raycaster.set(position, leftDir);
      hits.push(...raycaster.intersectObjects([])); // Add scene objects here
      
      // Right side of arc
      const rightAngle = -(i / arcSteps) * (arcAngle / 2);
      const rightDir = direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rightAngle);
      raycaster.set(position, rightDir);
      hits.push(...raycaster.intersectObjects([])); // Add scene objects here
    }
    
    // Process hits
    if (hits.length > 0) {
      // Sort by distance
      hits.sort((a, b) => a.distance - b.distance);
      
      // Get closest hit within range
      const closestHit = hits[0];
      
      if (closestHit.distance <= this.range) {
        // Apply damage to hit object
        const damage = this.calculateDamage({
          distance: closestHit.distance
        });
        
        // Show impact effect
        this.showImpactEffect(closestHit.point, closestHit.face.normal);
        
        // Callback with hit details
        if (typeof hitCallback === 'function') {
          hitCallback({
            object: closestHit.object,
            point: closestHit.point,
            normal: closestHit.face.normal,
            damage: damage,
            knockback: this.knockback
          });
        }
      }
    }
  }
  
  /**
   * Update the melee weapon animation
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    super.update(deltaTime);
    
    // Update swing animation if active
    if (this.isSwinging) {
      this.swingProgress += deltaTime / this.swingDuration;
      
      if (this.swingProgress >= 1.0) {
        // Finish swing
        this.isSwinging = false;
        this.swingProgress = 0;
        
        // Reset rotation
        this.model.rotation.copy(this.initialRotation);
      } else {
        // Interpolate rotation during swing
        const t = this.swingProgress;
        
        // Ease in-out for natural swing
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        
        // Apply rotation
        this.model.rotation.x = THREE.MathUtils.lerp(
          this.initialRotation.x, 
          this.targetRotation.x, 
          ease
        );
        
        this.model.rotation.z = THREE.MathUtils.lerp(
          this.initialRotation.z, 
          this.targetRotation.z, 
          ease
        );
      }
    }
  }
  
  /**
   * Show impact effect for melee hit
   * @param {THREE.Vector3} position - Impact position
   * @param {THREE.Vector3} normal - Surface normal
   */
  showImpactEffect(position, normal) {
    // Create impact effect
    // This could be a spark, blood splatter, etc.
    
    // Create a small flash at impact point
    const light = new THREE.PointLight(0xffffaa, 1, 2);
    light.position.copy(position);
    
    // Add light to scene temporarily
    if (this.model.parent) {
      const scene = this.model.parent.parent;
      scene.add(light);
      
      // Remove after short delay
      setTimeout(() => {
        scene.remove(light);
      }, 100);
    }
  }
}

/**
 * RangedWeapon class for firearms and projectile weapons
 * Extends base Weapon with ranged-specific functionality
 */
class RangedWeapon extends Weapon {
  constructor(params = {}) {
    // Set ranged type before calling super
    params.type = "ranged";
    
    // Default ranged properties
    params.damage = params.damage || 25;
    params.cooldown = params.cooldown || 0.1;
    params.range = params.range || 100;
    
    super(params);
    
    // Ammunition properties
    this.ammo = {
      current: params.startAmmo || 30,
      max: params.maxAmmo || 30,
      reserve: params.reserveAmmo || 90,
      type: params.ammoType || "standard"
    };
    
    // Firing properties
    this.fireMode = params.fireMode || "semi"; // "semi", "auto", "burst"
    this.burstCount = params.burstCount || 3;
    this.reloadTime = params.reloadTime || 2.0;
    this.isReloading = false;
    this.reloadProgress = 0;
    this.accuracy = params.accuracy || 0.95; // 1.0 = perfect accuracy
    this.recoil = params.recoil || 0.1;
    
    // Projectile properties (if not using raycasts)
    this.projectileSpeed = params.projectileSpeed || 500;
    this.useProjectile = params.useProjectile || false;
    
    // Visual effects
    this.muzzleFlash = null;
    this.createMuzzleFlash();
  }
  
  /**
   * Create muzzle flash effect
   */
  createMuzzleFlash() {
    // Create a simple muzzle flash light
    this.muzzleFlash = new THREE.PointLight(0xffaa00, 2, 2);
    this.muzzleFlash.position.set(0, 0, -0.5); // Position at end of weapon
    this.muzzleFlash.visible = false;
    this.model.add(this.muzzleFlash);
  }
  
  /**
   * Fire the ranged weapon
   * @param {THREE.Vector3} position - Firing position
   * @param {THREE.Vector3} direction - Firing direction
   * @param {function} hitCallback - Callback for hit detection
   * @returns {boolean} Whether shot was fired
   */
  use(position, direction, hitCallback) {
    if (this.isReloading) return false;
    if (this.ammo.current <= 0) {
      this.reload();
      return false;
    }
    
    if (!super.use(position, direction)) return false;
    
    // Consume ammo
    this.ammo.current--;
    
    // Apply accuracy deviation
    const spread = (1 - this.accuracy) * 0.1;
    const deviation = new THREE.Vector3(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread
    );
    
    // Final firing direction with spread
    const finalDirection = direction.clone().add(deviation).normalize();
    
    // Show muzzle flash
    this.showMuzzleFlash();
    
    if (this.useProjectile) {
      // Create and launch projectile
      this.launchProjectile(position, finalDirection, hitCallback);
    } else {
      // Use instant raycast for hitscan weapons
      this.performRaycast(position, finalDirection, hitCallback);
    }
    
    return true;
  }
  
  /**
   * Show muzzle flash effect
   */
  showMuzzleFlash() {
    if (this.muzzleFlash) {
      this.muzzleFlash.visible = true;
      
      // Hide after short delay
      setTimeout(() => {
        if (this.muzzleFlash) {
          this.muzzleFlash.visible = false;
        }
      }, 50);
    }
  }
  
  /**
   * Perform raycast for instant hit weapons
   * @param {THREE.Vector3} position - Starting position
   * @param {THREE.Vector3} direction - Direction of raycast
   * @param {function} hitCallback - Callback when hit detected
   */
  performRaycast(position, direction, hitCallback) {
    const raycaster = new THREE.Raycaster();
    raycaster.set(position, direction);
    raycaster.far = this.range;
    
    // Perform raycast against scene objects
    const hits = raycaster.intersectObjects([]); // Add scene objects here
    
    if (hits.length > 0) {
      const hit = hits[0];
      
      // Calculate damage with distance modifier
      const damage = this.calculateDamage({
        distance: hit.distance
      });
      
      // Show bullet impact effect
      this.showImpactEffect(hit.point, hit.face.normal);
      
      // Call hit callback
      if (typeof hitCallback === 'function') {
        hitCallback({
          object: hit.object,
          point: hit.point,
          normal: hit.face.normal,
          damage: damage
        });
      }
    }
  }
  
  /**
   * Launch physical projectile
   * @param {THREE.Vector3} position - Starting position
   * @param {THREE.Vector3} direction - Direction to launch
   * @param {function} hitCallback - Callback when hit detected
   */
  launchProjectile(position, direction, hitCallback) {
    // Create projectile mesh (simple sphere)
    const projectile = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    
    // Position at weapon muzzle
    projectile.position.copy(position);
    
    // Add to scene
    if (this.model.parent && this.model.parent.parent) {
      const scene = this.model.parent.parent;
      scene.add(projectile);
      
      // Store properties for update
      projectile.userData.direction = direction.clone();
      projectile.userData.speed = this.projectileSpeed;
      projectile.userData.distance = 0;
      projectile.userData.maxDistance = this.range;
      projectile.userData.damage = this.damage;
      projectile.userData.hitCallback = hitCallback;
      
      // Add to projectiles list for update
      // (This would need to be managed in a projectile manager)
    }
  }
  
  /**
   * Reload the weapon
   * @returns {boolean} Whether reload was initiated
   */
  reload() {
    if (this.isReloading || this.ammo.current === this.ammo.max || this.ammo.reserve <= 0) {
      return false;
    }
    
    // Start reload process
    this.isReloading = true;
    this.reloadProgress = 0;
    
    // Play reload sound if available
    if (this.soundEffects.reload) {
      this.soundEffects.reload.play();
    }
    
    return true;
  }
  
  /**
   * Update weapon state
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    super.update(deltaTime);
    
    // Update reload progress
    if (this.isReloading) {
      this.reloadProgress += deltaTime / this.reloadTime;
      
      if (this.reloadProgress >= 1.0) {
        // Finish reload
        this.isReloading = false;
        
        // Calculate ammo to reload
        const ammoNeeded = this.ammo.max - this.ammo.current;
        const ammoAvailable = Math.min(ammoNeeded, this.ammo.reserve);
        
        // Transfer ammo from reserve to magazine
        this.ammo.current += ammoAvailable;
        this.ammo.reserve -= ammoAvailable;
      }
    }
  }
  
  /**
   * Show impact effect for bullet hit
   * @param {THREE.Vector3} position - Impact position
   * @param {THREE.Vector3} normal - Surface normal
   */
  showImpactEffect(position, normal) {
    // Create impact effect based on weapon type
    // Could be spark, dust cloud, blood splatter, etc.
    
    // Create a small flash at impact point
    const light = new THREE.PointLight(0xffffaa, 1, 2);
    light.position.copy(position);
    
    // Add light to scene temporarily
    if (this.model.parent && this.model.parent.parent) {
      const scene = this.model.parent.parent;
      scene.add(light);
      
      // Remove after short delay
      setTimeout(() => {
        scene.remove(light);
      }, 100);
    }
  }
  
  /**
   * Get current ammo status
   * @returns {object} Object with current and reserve ammo
   */
  getAmmoStatus() {
    return {
      current: this.ammo.current,
      reserve: this.ammo.reserve,
      max: this.ammo.max
    };
  }
}

export { Weapon, MeleeWeapon, RangedWeapon };
