class InputController {
  constructor() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      sprint: false,
      reload: false,
      nextWeapon: false,
      previousWeapon: false
    };
    
    this.mouse = {
      x: 0,
      y: 0,
      movementX: 0,
      movementY: 0,
      leftButton: false,
      rightButton: false
    };
    
    // Properties for FPS camera control
    this.isPointerLocked = false;
    this.mouseSensitivity = 0.002;
    
    // Weapon switching delay to prevent accidental double-switching
    this.weaponSwitchDelay = false;
    
    this.setupListeners();
  }
  
  setupListeners() {
    // Keyboard events
    document.addEventListener("keydown", (event) => this.onKeyDown(event));
    document.addEventListener("keyup", (event) => this.onKeyUp(event));
    
    // Mouse events
    document.addEventListener("mousemove", (event) => this.onMouseMove(event));
    document.addEventListener("mousedown", (event) => this.onMouseDown(event));
    document.addEventListener("mouseup", (event) => this.onMouseUp(event));
    
    // Wheel event for weapon switching
    document.addEventListener("wheel", (event) => this.onWheel(event));
    
    // Pointer lock events
    document.addEventListener("pointerlockchange", () => this.onPointerLockChange());
    document.addEventListener("click", () => this.requestPointerLock());
  }
  
  // Request pointer lock on canvas click for FPS controls
  requestPointerLock() {
    if (!this.isPointerLocked) {
      const canvas = document.querySelector("canvas");
      if (canvas) {
        canvas.requestPointerLock();
      }
    }
  }
  
  // Handle pointer lock state changes
  onPointerLockChange() {
    this.isPointerLocked = document.pointerLockElement !== null;
    
    // Show/hide instructions based on pointer lock state
    const instructions = document.getElementById("instructions");
    if (instructions) {
      instructions.style.display = this.isPointerLocked ? "none" : "flex";
    }
  }
  
  onKeyDown(event) {
    switch(event.code) {
      case "KeyW": this.keys.forward = true; break;
      case "KeyS": this.keys.backward = true; break;
      case "KeyA": this.keys.left = true; break;
      case "KeyD": this.keys.right = true; break;
      case "Space": this.keys.jump = true; break;
      case "ShiftLeft": this.keys.sprint = true; break;
      case "KeyR": this.keys.reload = true; break;
      
      // Weapon selection with number keys (1-5)
      case "Digit1":
      case "Digit2":
      case "Digit3":
      case "Digit4":
      case "Digit5":
        // Trigger weapon select event
        const weaponIndex = parseInt(event.code.replace("Digit", "")) - 1;
        this.triggerWeaponSelect(weaponIndex);
        break;
        
      // Weapon cycling with Q and E
      case "KeyQ":
        if (!this.weaponSwitchDelay) {
          this.keys.previousWeapon = true;
          this.setWeaponSwitchDelay();
        }
        break;
      case "KeyE":
        if (!this.weaponSwitchDelay) {
          this.keys.nextWeapon = true;
          this.setWeaponSwitchDelay();
        }
        break;
    }
  }
  
  onKeyUp(event) {
    switch(event.code) {
      case "KeyW": this.keys.forward = false; break;
      case "KeyS": this.keys.backward = false; break;
      case "KeyA": this.keys.left = false; break;
      case "KeyD": this.keys.right = false; break;
      case "Space": this.keys.jump = false; break;
      case "ShiftLeft": this.keys.sprint = false; break;
      case "KeyR": this.keys.reload = false; break;
      case "KeyQ": this.keys.previousWeapon = false; break;
      case "KeyE": this.keys.nextWeapon = false; break;
    }
  }
  
  onMouseMove(event) {
    // Store absolute mouse position (for UI)
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Track movement delta for camera rotation (when pointer is locked)
    if (this.isPointerLocked) {
      // Apply sensitivity to make movement smoother
      this.mouse.movementX = event.movementX * this.mouseSensitivity;
      this.mouse.movementY = event.movementY * this.mouseSensitivity;
    } else {
      this.mouse.movementX = 0;
      this.mouse.movementY = 0;
    }
  }
  
  onMouseDown(event) {
    if (event.button === 0) this.mouse.leftButton = true;
    if (event.button === 2) this.mouse.rightButton = true;
    
    // Request pointer lock when clicking in game
    if (!this.isPointerLocked) {
      this.requestPointerLock();
    }
  }
  
  onMouseUp(event) {
    if (event.button === 0) this.mouse.leftButton = false;
    if (event.button === 2) this.mouse.rightButton = false;
  }
  
  /**
   * Handle mouse wheel for weapon switching
   * @param {WheelEvent} event - Mouse wheel event
   */
  onWheel(event) {
    if (!this.weaponSwitchDelay) {
      // Determine direction (positive = previous, negative = next)
      if (event.deltaY > 0) {
        this.keys.nextWeapon = true;
      } else if (event.deltaY < 0) {
        this.keys.previousWeapon = true;
      }
      
      this.setWeaponSwitchDelay();
    }
  }
  
  /**
   * Set a delay to prevent rapid weapon switching
   */
  setWeaponSwitchDelay() {
    this.weaponSwitchDelay = true;
    
    // Reset after 250ms
    setTimeout(() => {
      this.weaponSwitchDelay = false;
    }, 250);
  }
  
  /**
   * Trigger a direct weapon selection event (not used directly by player class currently)
   * @param {number} index - Weapon index to select
   */
  triggerWeaponSelect(index) {
    // Create a custom event for direct weapon selection
    const event = new CustomEvent('weaponselect', { 
      detail: { index: index } 
    });
    document.dispatchEvent(event);
  }
  
  // Reset mouse movement after each frame
  update() {
    // Reset movement values after they've been consumed in the game loop
    this.mouse.movementX = 0;
    this.mouse.movementY = 0;
    
    // Reset single-frame actions
    this.keys.nextWeapon = false;
    this.keys.previousWeapon = false;
    this.keys.reload = false;
  }
}

export default InputController;
