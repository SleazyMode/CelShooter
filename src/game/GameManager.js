import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Player from './Player.js';
import AIAssetGenerator from './AIAssetGenerator.js';
import ProceduralLevel from './ProceduralLevel.js';
import { MeleeWeapon, RangedWeapon } from './Weapon.js';
import Physics from './Physics.js';

/**
 * GameManager class
 * Manages all game systems, including player, enemies, weapons, and UI
 */
class GameManager {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    // Game state
    this.isRunning = false;
    this.isPaused = false;
    this.gameMode = 'singleplayer'; // 'singleplayer', 'multiplayer'
    this.difficulty = 'normal'; // 'easy', 'normal', 'hard'
    
    // Game objects
    this.player = null;
    this.enemies = [];
    this.weapons = [];
    this.projectiles = [];
    
    // Game systems
    this.physics = null;
    this.level = null;
    this.assetGenerator = null;
    this.inputController = null;
    this.audioManager = null;
    
    // Game UI
    this.scoreElement = document.getElementById('score');
    this.healthElement = document.getElementById('health-bar-inner');
    this.ammoElement = document.getElementById('ammo-counter');
    this.killFeedElement = document.getElementById('kill-feed');
    
    // Game settings
    this.enableBlood = true;
    this.enableGore = true;
    this.maxEnemies = 20;
    this.spawnRate = 3000; // ms between enemy spawns
    this.lastSpawnTime = 0;
    
    // Game stats
    this.score = 0;
    this.kills = 0;
    this.deaths = 0;
    
    // Bind methods to this
    this.update = this.update.bind(this);
    this.handlePlayerDeath = this.handlePlayerDeath.bind(this);
    this.handleEnemyDeath = this.handleEnemyDeath.bind(this);
    this.handleWeaponPickup = this.handleWeaponPickup.bind(this);
  }
  
  /**
   * Initialize the game
   * @param {Object} options - Game options
   */
  init(options = {}) {
    console.log('Initializing Cel-Shaded Carnage game...');
    
    // Apply options
    Object.assign(this, options);
    
    // Initialize physics
    this.physics = new Physics();
    
    // Initialize asset generator
    this.assetGenerator = new AIAssetGenerator();
    
    // Create procedural level
    this.level = new ProceduralLevel(this.scene, this.physics, this.assetGenerator);
    this.level.generate({
      levelSize: 80,
      blockCount: 25,
      wallHeight: 4
    });
    
    // Create player
    this.createPlayer();
    
    // Initialize available weapons
    this.initializeWeapons();
    
    // Add event listeners
    this.addEventListeners();
    
    console.log('Game initialized successfully!');
  }
  
  /**
   * Start the game
   */
  start() {
    if (this.isRunning) return;
    
    console.log('Starting game...');
    this.isRunning = true;
    this.isPaused = false;
    
    // Show game UI
    document.getElementById('game-ui').style.display = 'block';
    document.getElementById('game-menu').style.display = 'none';
    
    // Lock pointer
    this.renderer.domElement.requestPointerLock();
    
    console.log('Game started!');
  }
  
  /**
   * Pause the game
   */
  pause() {
    if (!this.isRunning || this.isPaused) return;
    
    console.log('Pausing game...');
    this.isPaused = true;
    
    // Show pause menu
    document.getElementById('pause-menu').style.display = 'flex';
    
    // Unlock pointer
    document.exitPointerLock();
    
    console.log('Game paused!');
  }
  
  /**
   * Resume the game
   */
  resume() {
    if (!this.isRunning || !this.isPaused) return;
    
    console.log('Resuming game...');
    this.isPaused = false;
    
    // Hide pause menu
    document.getElementById('pause-menu').style.display = 'none';
    
    // Lock pointer
    this.renderer.domElement.requestPointerLock();
    
    console.log('Game resumed!');
  }
  
  /**
   * Stop the game
   */
  stop() {
    if (!this.isRunning) return;
    
    console.log('Stopping game...');
    this.isRunning = false;
    this.isPaused = false;
    
    // Show game menu
    document.getElementById('game-ui').style.display = 'none';
    document.getElementById('game-menu').style.display = 'flex';
    
    // Unlock pointer
    document.exitPointerLock();
    
    console.log('Game stopped!');
  }
  
  /**
   * Reset the game
   */
  reset() {
    console.log('Resetting game...');
    
    // Reset player
    if (this.player) {
      this.player.reset();
    }
    
    // Clear enemies
    this.enemies.forEach(enemy => {
      this.scene.remove(enemy.mesh);
      if (enemy.body) {
        this.physics.removeBody(enemy.body);
      }
    });
    this.enemies = [];
    
    // Clear projectiles
    this.projectiles.forEach(projectile => {
      this.scene.remove(projectile.mesh);
      if (projectile.body) {
        this.physics.removeBody(projectile.body);
      }
    });
    this.projectiles = [];
    
    // Reset game stats
    this.score = 0;
    this.kills = 0;
    this.deaths = 0;
    
    // Clear kill feed
    this.killFeedElement.innerHTML = '';
    
    // Update UI
    this.updateUI();
    
    console.log('Game reset!');
  }
  
  /**
   * Create the player
   */
  createPlayer() {
    // Get spawn point
    const spawnPoint = this.level.getRandomSpawnPoint('teamA');
    
    // Create player
    this.player = new Player(this.scene, this.camera, this.physics, this.assetGenerator);
    this.player.init({
      position: spawnPoint,
      onDeath: this.handlePlayerDeath
    });
    
    console.log('Player created at position:', spawnPoint);
  }
  
  /**
   * Initialize available weapons in the game
   */
  initializeWeapons() {
    // Create melee weapons
    const knife = new MeleeWeapon({
      name: 'Combat Knife',
      damage: 25,
      cooldown: 0.5,
      range: 2,
      weight: 1,
      swingWidth: 60,
      swingDuration: 0.3
    });
    
    const axe = new MeleeWeapon({
      name: 'Fire Axe',
      damage: 75,
      cooldown: 1.5,
      range: 2.5,
      weight: 3,
      swingWidth: 90,
      swingDuration: 0.8
    });
    
    // Create ranged weapons
    const pistol = new RangedWeapon({
      name: 'Pistol',
      damage: 25,
      cooldown: 0.4,
      range: 50,
      weight: 2,
      magazineSize: 12,
      totalAmmo: 48,
      reloadTime: 1.5,
      projectileSpeed: 40,
      automatic: false,
      bulletSpread: 0.02
    });
    
    const shotgun = new RangedWeapon({
      name: 'Shotgun',
      damage: 15, // Per pellet
      cooldown: 0.9,
      range: 20,
      weight: 4,
      magazineSize: 8,
      totalAmmo: 32,
      reloadTime: 2.5,
      projectileSpeed: 35,
      automatic: false,
      bulletSpread: 0.1,
      pelletCount: 8
    });
    
    const rifle = new RangedWeapon({
      name: 'Assault Rifle',
      damage: 20,
      cooldown: 0.1,
      range: 80,
      weight: 3,
      magazineSize: 30,
      totalAmmo: 120,
      reloadTime: 2.0,
      projectileSpeed: 50,
      automatic: true,
      bulletSpread: 0.035
    });
    
    // Store weapons
    this.weapons = [knife, axe, pistol, shotgun, rifle];
    
    // Give weapons to player
    if (this.player) {
      this.player.addWeapon(pistol);
      this.player.addWeapon(knife);
    }
    
    console.log('Weapons initialized:', this.weapons.length);
  }
  
  /**
   * Add event listeners
   */
  addEventListeners() {
    // Pause game when Escape key is pressed
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (this.isRunning && !this.isPaused) {
          this.pause();
        } else if (this.isRunning && this.isPaused) {
          this.resume();
        }
      }
    });
    
    // Handle pointer lock change
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === this.renderer.domElement) {
        // Pointer is locked, game is focused
        if (this.isRunning && this.isPaused) {
          this.resume();
        }
      } else {
        // Pointer is unlocked, game is not focused
        if (this.isRunning && !this.isPaused) {
          this.pause();
        }
      }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      if (this.player) {
        this.player.updateAspect(window.innerWidth / window.innerHeight);
      }
    });
    
    console.log('Event listeners added');
  }
  
  /**
   * Spawn a new enemy
   */
  spawnEnemy() {
    // Check if max enemies reached
    if (this.enemies.length >= this.maxEnemies) return;
    
    // Get random spawn point
    const spawnPoint = this.level.getRandomSpawnPoint('teamB');
    
    // TODO: Implement proper enemy class
    // This is a placeholder for demonstration
    const enemy = {
      mesh: new THREE.Mesh(
        new THREE.CapsuleGeometry(0.5, 1.5, 4, 8),
        new THREE.MeshToonMaterial({ color: 0xff0000 })
      ),
      body: this.physics.createBox({
        position: new CANNON.Vec3(spawnPoint.x, spawnPoint.y, spawnPoint.z),
        size: new CANNON.Vec3(0.5, 1, 0.5),
        mass: 70
      }),
      health: 100,
      damage: 10,
      speed: 2 + Math.random() * 2,
      lastAttackTime: 0,
      attackCooldown: 1000,
      update: (deltaTime) => {
        // Update mesh position from physics body
        enemy.mesh.position.copy(enemy.body.position);
        enemy.mesh.quaternion.copy(enemy.body.quaternion);
        
        // Simple AI: Move towards player
        if (this.player && this.player.body) {
          const direction = new CANNON.Vec3();
          direction.copy(this.player.body.position);
          direction.vsub(enemy.body.position, direction);
          direction.normalize();
          direction.scale(enemy.speed * deltaTime, direction);
          enemy.body.position.vadd(direction, enemy.body.position);
          
          // Attack player if close enough
          const distanceToPlayer = this.player.body.position.distanceTo(enemy.body.position);
          if (distanceToPlayer < 2 && Date.now() - enemy.lastAttackTime > enemy.attackCooldown) {
            this.player.takeDamage(enemy.damage);
            enemy.lastAttackTime = Date.now();
          }
        }
      }
    };
    
    enemy.mesh.position.copy(spawnPoint);
    this.scene.add(enemy.mesh);
    this.enemies.push(enemy);
    
    console.log('Enemy spawned at position:', spawnPoint);
  }
  
  /**
   * Update game state
   * @param {number} deltaTime - Time since last update in seconds
   */
  update(deltaTime) {
    if (!this.isRunning || this.isPaused) return;
    
    // Update physics
    this.physics.update(deltaTime);
    
    // Update player
    if (this.player) {
      this.player.update(deltaTime);
    }
    
    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime);
    });
    
    // Update projectiles
    this.projectiles.forEach((projectile, index) => {
      projectile.update(deltaTime);
      
      // Check if projectile should be removed
      if (projectile.shouldRemove) {
        this.scene.remove(projectile.mesh);
        if (projectile.body) {
          this.physics.removeBody(projectile.body);
        }
        this.projectiles.splice(index, 1);
      }
    });
    
    // Spawn enemies
    if (Date.now() - this.lastSpawnTime > this.spawnRate) {
      this.spawnEnemy();
      this.lastSpawnTime = Date.now();
    }
    
    // Update UI
    this.updateUI();
  }
  
  /**
   * Update game UI
   */
  updateUI() {
    // Update score
    if (this.scoreElement) {
      this.scoreElement.textContent = this.score;
    }
    
    // Update health bar
    if (this.healthElement && this.player) {
      const healthPercent = (this.player.health / this.player.maxHealth) * 100;
      this.healthElement.style.width = `${healthPercent}%`;
      
      // Change color based on health
      if (healthPercent < 25) {
        this.healthElement.style.backgroundColor = '#ff0000';
      } else if (healthPercent < 50) {
        this.healthElement.style.backgroundColor = '#ffff00';
      } else {
        this.healthElement.style.backgroundColor = '#00ff00';
      }
    }
    
    // Update ammo counter
    if (this.ammoElement && this.player && this.player.currentWeapon) {
      const weapon = this.player.currentWeapon;
      if (weapon.type === 'ranged') {
        this.ammoElement.textContent = `${weapon.currentMagazine} / ${weapon.totalAmmo}`;
      } else {
        this.ammoElement.textContent = '∞';
      }
    }
  }
  
  /**
   * Add a message to the kill feed
   * @param {string} message - Kill feed message
   */
  addKillFeedMessage(message) {
    if (!this.killFeedElement) return;
    
    // Create kill feed item
    const item = document.createElement('div');
    item.className = 'kill-feed-item';
    item.textContent = message;
    
    // Add to kill feed
    this.killFeedElement.appendChild(item);
    
    // Remove after 5 seconds
    setTimeout(() => {
      this.killFeedElement.removeChild(item);
    }, 5000);
  }
  
  /**
   * Handle player death
   */
  handlePlayerDeath() {
    console.log('Player died!');
    
    // Increment deaths
    this.deaths++;
    
    // Add kill feed message
    this.addKillFeedMessage('You were killed!');
    
    // Respawn player after delay
    setTimeout(() => {
      // Get spawn point
      const spawnPoint = this.level.getRandomSpawnPoint('teamA');
      
      // Respawn player
      this.player.respawn(spawnPoint);
      
      console.log('Player respawned at position:', spawnPoint);
    }, 3000);
  }
  
  /**
   * Handle enemy death
   * @param {Object} enemy - Enemy that died
   * @param {Object} weapon - Weapon that killed the enemy
   */
  handleEnemyDeath(enemy, weapon) {
    console.log('Enemy killed with', weapon.name);
    
    // Remove enemy
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.scene.remove(enemy.mesh);
      if (enemy.body) {
        this.physics.removeBody(enemy.body);
      }
      this.enemies.splice(index, 1);
    }
    
    // Increment kills and score
    this.kills++;
    this.score += 100;
    
    // Add kill feed message
    this.addKillFeedMessage(`You killed an enemy with ${weapon.name}!`);
  }
  
  /**
   * Handle weapon pickup
   * @param {Object} weapon - Weapon picked up
   */
  handleWeaponPickup(weapon) {
    console.log('Picked up', weapon.name);
    
    // Give weapon to player
    if (this.player) {
      this.player.addWeapon(weapon);
      
      // Add kill feed message
      this.addKillFeedMessage(`You picked up ${weapon.name}!`);
    }
  }
  
  /**
   * Handle projectile hit
   * @param {Object} projectile - Projectile that hit
   * @param {Object} target - Target that was hit
   */
  handleProjectileHit(projectile, target) {
    // Remove projectile
    const index = this.projectiles.indexOf(projectile);
    if (index !== -1) {
      this.scene.remove(projectile.mesh);
      if (projectile.body) {
        this.physics.removeBody(projectile.body);
      }
      this.projectiles.splice(index, 1);
    }
    
    // Handle damage to target
    if (target === this.player) {
      this.player.takeDamage(projectile.damage);
    } else {
      // Assume target is an enemy
      target.health -= projectile.damage;
      
      // Check if enemy died
      if (target.health <= 0) {
        this.handleEnemyDeath(target, projectile.weapon);
      }
    }
  }
}

export default GameManager;
