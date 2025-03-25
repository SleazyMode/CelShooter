import * as CANNON from "cannon-es";

/**
 * Physics class to handle all physics-related functionality
 * Uses CANNON.js for the physics simulation
 */
class Physics {
  constructor() {
    // Create physics world
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0) // Earth gravity
    });
    
    // Set default material properties
    this.defaultMaterial = new CANNON.Material('default');
    
    // Set up collision detection
    this.world.defaultContactMaterial = new CANNON.ContactMaterial(
      this.defaultMaterial,
      this.defaultMaterial,
      {
        friction: 0.1,
        restitution: 0.3, // Somewhat bouncy
        contactEquationStiffness: 1e6,
        contactEquationRelaxation: 3
      }
    );
    
    // Allow sleeping for performance
    this.world.allowSleep = true;
    
    // Set solver iterations
    this.world.solver.iterations = 10;
    
    // Collection of bodies to update
    this.bodies = [];
    
    // Collision event listeners
    this.collisionCallbacks = {};
    
    // Configure broadphase
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    
    // Performance tuning
    this.timeStep = 1 / 60; // Fixed time step
    this.maxSubSteps = 3; // Max substeps per frame
    
    // Accumulated time for simulation
    this.accumulatedTime = 0;
  }
  
  /**
   * Add a rigid body to the physics world
   * @param {CANNON.Body} body - Physics body to add
   */
  addBody(body) {
    this.world.addBody(body);
    this.bodies.push(body);
  }
  
  /**
   * Remove a rigid body from the physics world
   * @param {CANNON.Body} body - Physics body to remove
   */
  removeBody(body) {
    this.world.removeBody(body);
    
    const index = this.bodies.indexOf(body);
    if (index !== -1) {
      this.bodies.splice(index, 1);
    }
  }
  
  /**
   * Add a collision listener for two bodies
   * @param {CANNON.Body} bodyA - First body
   * @param {CANNON.Body} bodyB - Second body
   * @param {Function} callback - Function to call on collision
   */
  addCollisionListener(bodyA, bodyB, callback) {
    const key = this.getCollisionKey(bodyA, bodyB);
    this.collisionCallbacks[key] = callback;
    
    this.world.addEventListener('beginContact', (event) => {
      if ((event.bodyA === bodyA && event.bodyB === bodyB) ||
          (event.bodyA === bodyB && event.bodyB === bodyA)) {
        callback(event);
      }
    });
  }
  
  /**
   * Get a unique key for a collision pair
   * @param {CANNON.Body} bodyA - First body
   * @param {CANNON.Body} bodyB - Second body
   * @returns {string} Unique collision key
   */
  getCollisionKey(bodyA, bodyB) {
    return `${bodyA.id}_${bodyB.id}`;
  }
  
  /**
   * Create a ground plane at a specified position
   * @param {Object} options - Ground plane options
   * @returns {CANNON.Body} Ground plane body
   */
  createGround(options = {}) {
    const defaults = {
      position: new CANNON.Vec3(0, 0, 0),
      normal: new CANNON.Vec3(0, 1, 0)
    };
    const config = { ...defaults, ...options };
    
    // Create ground plane
    const groundBody = new CANNON.Body({
      mass: 0, // Static body
      material: this.defaultMaterial,
      shape: new CANNON.Plane(),
      position: config.position
    });
    
    // Set plane normal
    groundBody.quaternion.setFromVectors(new CANNON.Vec3(0, 1, 0), config.normal);
    
    // Add to world
    this.addBody(groundBody);
    
    return groundBody;
  }
  
  /**
   * Create a box body at a specified position
   * @param {Object} options - Box options
   * @returns {CANNON.Body} Box body
   */
  createBox(options = {}) {
    const defaults = {
      position: new CANNON.Vec3(0, 0, 0),
      size: new CANNON.Vec3(1, 1, 1),
      mass: 1,
      material: this.defaultMaterial
    };
    const config = { ...defaults, ...options };
    
    // Create box body
    const boxBody = new CANNON.Body({
      mass: config.mass,
      material: config.material,
      shape: new CANNON.Box(new CANNON.Vec3(
        config.size.x / 2, 
        config.size.y / 2, 
        config.size.z / 2
      )),
      position: config.position
    });
    
    // Add to world
    this.addBody(boxBody);
    
    return boxBody;
  }
  
  /**
   * Create a sphere body at a specified position
   * @param {Object} options - Sphere options
   * @returns {CANNON.Body} Sphere body
   */
  createSphere(options = {}) {
    const defaults = {
      position: new CANNON.Vec3(0, 0, 0),
      radius: 0.5,
      mass: 1,
      material: this.defaultMaterial
    };
    const config = { ...defaults, ...options };
    
    // Create sphere body
    const sphereBody = new CANNON.Body({
      mass: config.mass,
      material: config.material,
      shape: new CANNON.Sphere(config.radius),
      position: config.position
    });
    
    // Add to world
    this.addBody(sphereBody);
    
    return sphereBody;
  }
  
  /**
   * Update the physics simulation
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    // Limit delta time to avoid instability
    const dt = Math.min(deltaTime, 0.1);
    
    // Fixed time step for stability
    this.world.step(this.timeStep, dt, this.maxSubSteps);
  }
  
  /**
   * Perform a raycast from a start point in a direction
   * @param {CANNON.Vec3} from - Starting point
   * @param {CANNON.Vec3} to - End point or direction
   * @param {Object} options - Raycast options
   * @returns {Object} Raycast result
   */
  raycast(from, to, options = {}) {
    const defaults = {
      mode: CANNON.Ray.CLOSEST,
      skipBackfaces: true,
      collisionFilterMask: -1,
      collisionFilterGroup: -1
    };
    const config = { ...defaults, ...options };
    
    // Create ray
    const ray = new CANNON.Ray(from, to);
    ray.mode = config.mode;
    ray.skipBackfaces = config.skipBackfaces;
    ray.collisionFilterMask = config.collisionFilterMask;
    ray.collisionFilterGroup = config.collisionFilterGroup;
    
    // Perform raycast
    const result = {};
    ray.intersectWorld(this.world, result);
    
    return result;
  }
  
  /**
   * Reset the physics world
   */
  reset() {
    // Remove all bodies
    while (this.bodies.length > 0) {
      this.removeBody(this.bodies[0]);
    }
    
    // Reset world
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0)
    });
    
    // Re-initialize
    this.world.defaultContactMaterial = new CANNON.ContactMaterial(
      this.defaultMaterial,
      this.defaultMaterial,
      {
        friction: 0.1,
        restitution: 0.3
      }
    );
    
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.collisionCallbacks = {};
  }
}

export default Physics;
