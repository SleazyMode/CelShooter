import * as THREE from "three";

class AIAssetGenerator {
  constructor() {
    this.models = {};
    this.textures = {};
    
    // Add directory paths for generated assets
    this.paths = {
      models: 'src/assets/generated_models/',
      textures: 'src/assets/generated_textures/'
    };
    
    // Define weapon templates
    this.weaponTemplates = {
      melee: ['sword', 'axe', 'hammer', 'dagger', 'mace', 'spear'],
      ranged: ['pistol', 'rifle', 'shotgun', 'smg', 'sniper', 'rocketLauncher']
    };
  }

  // Placeholder for AI character model generation
  generateCharacter(team = "teamA") {
    const model = new THREE.Group();

    // Create a simple character model
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.5, 1.5, 4, 8),
      new THREE.MeshToonMaterial({ color: team === "teamA" ? 0x3333ff : 0xff3333 })
    );
    model.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 16, 16),
      new THREE.MeshToonMaterial({ color: 0xffdbac })
    );
    head.position.y = 1.2;
    model.add(head);

    return model;
  }
  
  /**
   * Generate weapon model based on type and name
   * @param {string} type - "melee" or "ranged"
   * @param {string} name - Specific weapon name
   * @returns {THREE.Object3D} Generated weapon model
   */
  generateWeapon(type, name) {
    // Check if we already have this model cached
    const cacheKey = `weapon_${type}_${name}`;
    if (this.models[cacheKey]) {
      return this.models[cacheKey].clone();
    }
    
    // Create a new model based on type
    let model;
    
    if (type === "melee") {
      model = this.generateMeleeWeapon(name);
    } else if (type === "ranged") {
      model = this.generateRangedWeapon(name);
    } else {
      // Default fallback
      model = new THREE.Group();
      const defaultMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.5),
        new THREE.MeshToonMaterial({ color: 0x333333 })
      );
      model.add(defaultMesh);
    }
    
    // Cache the model for future use
    this.models[cacheKey] = model.clone();
    
    return model;
  }
  
  /**
   * Generate a melee weapon model
   * @param {string} name - Weapon name/type
   * @returns {THREE.Object3D} Generated melee weapon model
   */
  generateMeleeWeapon(name) {
    const model = new THREE.Group();
    const weaponColor = this.getWeaponColor(name);
    
    // Determine weapon type from name or randomly
    const weaponType = name.toLowerCase().includes('sword') ? 'sword' :
                      name.toLowerCase().includes('axe') ? 'axe' :
                      name.toLowerCase().includes('hammer') ? 'hammer' :
                      name.toLowerCase().includes('dagger') ? 'dagger' :
                      name.toLowerCase().includes('mace') ? 'mace' :
                      name.toLowerCase().includes('spear') ? 'spear' :
                      this.weaponTemplates.melee[Math.floor(Math.random() * this.weaponTemplates.melee.length)];
    
    // Generate model based on weapon type
    switch (weaponType) {
      case 'sword':
        // Create a sword with blade and handle
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.7, 0.15),
          new THREE.MeshToonMaterial({ color: 0xCCCCCC, metalness: 0.8 })
        );
        blade.position.y = 0.4;
        
        const handle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8),
          new THREE.MeshToonMaterial({ color: 0x554433 })
        );
        handle.position.y = 0.0;
        
        const guard = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.03, 0.03),
          new THREE.MeshToonMaterial({ color: 0x888888, metalness: 0.6 })
        );
        guard.position.y = 0.1;
        
        model.add(blade);
        model.add(handle);
        model.add(guard);
        break;
        
      case 'axe':
        // Create an axe with head and handle
        const axeHead = new THREE.Mesh(
          new THREE.ConeGeometry(0.2, 0.3, 4),
          new THREE.MeshToonMaterial({ color: 0xAAAAAA, metalness: 0.7 })
        );
        axeHead.position.set(0.15, 0.5, 0);
        axeHead.rotation.z = Math.PI / 2;
        
        const axeHandle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8),
          new THREE.MeshToonMaterial({ color: 0x654321 })
        );
        axeHandle.position.y = 0.2;
        
        model.add(axeHead);
        model.add(axeHandle);
        break;
        
      case 'hammer':
        // Create a hammer
        const hammerHead = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.15, 0.2),
          new THREE.MeshToonMaterial({ color: 0x777777, metalness: 0.6 })
        );
        hammerHead.position.y = 0.5;
        
        const hammerHandle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.02, 0.8, 8),
          new THREE.MeshToonMaterial({ color: 0x654321 })
        );
        hammerHandle.position.y = 0.1;
        
        model.add(hammerHead);
        model.add(hammerHandle);
        break;
        
      case 'dagger':
        // Create a dagger
        const daggerBlade = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.4, 0.1),
          new THREE.MeshToonMaterial({ color: 0xCCCCCC, metalness: 0.7 })
        );
        daggerBlade.position.y = 0.25;
        
        const daggerHandle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8),
          new THREE.MeshToonMaterial({ color: 0x553311 })
        );
        daggerHandle.position.y = 0.0;
        
        model.add(daggerBlade);
        model.add(daggerHandle);
        break;
        
      case 'mace':
        // Create a mace
        const maceHead = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 8, 8),
          new THREE.MeshToonMaterial({ color: 0x666666, metalness: 0.5 })
        );
        maceHead.position.y = 0.5;
        
        // Add spikes to the mace head
        for (let i = 0; i < 8; i++) {
          const spike = new THREE.Mesh(
            new THREE.ConeGeometry(0.03, 0.1, 4),
            new THREE.MeshToonMaterial({ color: 0x666666, metalness: 0.5 })
          );
          const angle = (i / 8) * Math.PI * 2;
          spike.position.set(
            0.15 * Math.cos(angle),
            0.5,
            0.15 * Math.sin(angle)
          );
          spike.rotation.set(
            Math.PI/2,
            0,
            -angle
          );
          model.add(spike);
        }
        
        const maceHandle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.02, 0.7, 8),
          new THREE.MeshToonMaterial({ color: 0x654321 })
        );
        maceHandle.position.y = 0.15;
        
        model.add(maceHead);
        model.add(maceHandle);
        break;
        
      case 'spear':
        // Create a spear
        const spearTip = new THREE.Mesh(
          new THREE.ConeGeometry(0.05, 0.2, 8),
          new THREE.MeshToonMaterial({ color: 0xCCCCCC, metalness: 0.7 })
        );
        spearTip.position.y = 0.85;
        
        const spearHandle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8),
          new THREE.MeshToonMaterial({ color: 0x654321 })
        );
        spearHandle.position.y = 0.0;
        
        model.add(spearTip);
        model.add(spearHandle);
        break;
        
      default:
        // Default simple weapon
        const defaultMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.6, 0.1),
          new THREE.MeshToonMaterial({ color: weaponColor })
        );
        defaultMesh.position.y = 0.3;
        model.add(defaultMesh);
    }
    
    // Add cel-shading effect
    model.traverse(obj => {
      if (obj.isMesh) {
        obj.material.flatShading = true;
        obj.castShadow = true;
      }
    });
    
    return model;
  }
  
  /**
   * Generate a ranged weapon model
   * @param {string} name - Weapon name/type
   * @returns {THREE.Object3D} Generated ranged weapon model
   */
  generateRangedWeapon(name) {
    const model = new THREE.Group();
    const weaponColor = this.getWeaponColor(name);
    
    // Determine weapon type from name or randomly
    const weaponType = name.toLowerCase().includes('pistol') ? 'pistol' :
                      name.toLowerCase().includes('rifle') ? 'rifle' :
                      name.toLowerCase().includes('shotgun') ? 'shotgun' :
                      name.toLowerCase().includes('smg') ? 'smg' :
                      name.toLowerCase().includes('sniper') ? 'sniper' :
                      name.toLowerCase().includes('rocket') ? 'rocketLauncher' :
                      this.weaponTemplates.ranged[Math.floor(Math.random() * this.weaponTemplates.ranged.length)];
    
    // Generate model based on weapon type
    switch (weaponType) {
      case 'pistol':
        // Create a pistol
        const slide = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.08, 0.25),
          new THREE.MeshToonMaterial({ color: 0x222222, metalness: 0.7 })
        );
        slide.position.set(0, 0.04, 0);
        
        const barrel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8),
          new THREE.MeshToonMaterial({ color: 0x111111, metalness: 0.8 })
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.04, -0.17);
        
        const handle = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.12, 0.08),
          new THREE.MeshToonMaterial({ color: 0x663311 })
        );
        handle.position.set(0, -0.07, 0.05);
        
        const trigger = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, 0.04, 0.02),
          new THREE.MeshToonMaterial({ color: 0x333333 })
        );
        trigger.position.set(0, -0.02, 0.02);
        
        model.add(slide);
        model.add(barrel);
        model.add(handle);
        model.add(trigger);
        break;
        
      case 'rifle':
        // Create a rifle
        const receiver = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.08, 0.5),
          new THREE.MeshToonMaterial({ color: 0x444444, metalness: 0.5 })
        );
        
        const rifleBarrel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8),
          new THREE.MeshToonMaterial({ color: 0x222222, metalness: 0.7 })
        );
        rifleBarrel.rotation.x = Math.PI / 2;
        rifleBarrel.position.set(0, 0, -0.4);
        
        const stock = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.12, 0.25),
          new THREE.MeshToonMaterial({ color: 0x663311 })
        );
        stock.position.set(0, -0.02, 0.3);
        
        const rifleHandle = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.1, 0.06),
          new THREE.MeshToonMaterial({ color: 0x663311 })
        );
        rifleHandle.position.set(0, -0.09, 0.05);
        
        const magazine = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.15, 0.06),
          new THREE.MeshToonMaterial({ color: 0x333333 })
        );
        magazine.position.set(0, -0.12, 0.0);
        
        model.add(receiver);
        model.add(rifleBarrel);
        model.add(stock);
        model.add(rifleHandle);
        model.add(magazine);
        break;
        
      case 'shotgun':
        // Create a shotgun
        const shotgunBarrel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8),
          new THREE.MeshToonMaterial({ color: 0x333333, metalness: 0.5 })
        );
        shotgunBarrel.rotation.x = Math.PI / 2;
        shotgunBarrel.position.set(0, 0, -0.3);
        
        const shotgunStock = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.12, 0.3),
          new THREE.MeshToonMaterial({ color: 0x553311 })
        );
        shotgunStock.position.set(0, -0.03, 0.3);
        
        const pump = new THREE.Mesh(
          new THREE.BoxGeometry(0.07, 0.07, 0.15),
          new THREE.MeshToonMaterial({ color: 0x553311 })
        );
        pump.position.set(0, -0.04, -0.15);
        
        model.add(shotgunBarrel);
        model.add(shotgunStock);
        model.add(pump);
        break;
        
      case 'smg':
        // Create an SMG
        const smgReceiver = new THREE.Mesh(
          new THREE.BoxGeometry(0.07, 0.07, 0.35),
          new THREE.MeshToonMaterial({ color: 0x222222, metalness: 0.7 })
        );
        
        const smgBarrel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8),
          new THREE.MeshToonMaterial({ color: 0x111111, metalness: 0.8 })
        );
        smgBarrel.rotation.x = Math.PI / 2;
        smgBarrel.position.set(0, 0, -0.25);
        
        const smgHandle = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.12, 0.06),
          new THREE.MeshToonMaterial({ color: 0x333333 })
        );
        smgHandle.position.set(0, -0.09, 0.05);
        
        const smgMagazine = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.2, 0.04),
          new THREE.MeshToonMaterial({ color: 0x444444 })
        );
        smgMagazine.position.set(0, -0.15, 0.0);
        
        model.add(smgReceiver);
        model.add(smgBarrel);
        model.add(smgHandle);
        model.add(smgMagazine);
        break;
        
      case 'sniper':
        // Create a sniper rifle
        const sniperReceiver = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.08, 0.6),
          new THREE.MeshToonMaterial({ color: 0x444444, metalness: 0.5 })
        );
        
        const sniperBarrel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8),
          new THREE.MeshToonMaterial({ color: 0x222222, metalness: 0.7 })
        );
        sniperBarrel.rotation.x = Math.PI / 2;
        sniperBarrel.position.set(0, 0, -0.55);
        
        const sniperScope = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8),
          new THREE.MeshToonMaterial({ color: 0x111111, metalness: 0.8 })
        );
        sniperScope.position.set(0, 0.08, -0.1);
        
        const sniperStock = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.12, 0.3),
          new THREE.MeshToonMaterial({ color: 0x443322 })
        );
        sniperStock.position.set(0, -0.02, 0.4);
        
        model.add(sniperReceiver);
        model.add(sniperBarrel);
        model.add(sniperScope);
        model.add(sniperStock);
        break;
        
      case 'rocketLauncher':
        // Create a rocket launcher
        const tube = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 0.8, 12),
          new THREE.MeshToonMaterial({ color: 0x556655, metalness: 0.4 })
        );
        tube.rotation.x = Math.PI / 2;
        
        const sights = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.04, 0.04),
          new THREE.MeshToonMaterial({ color: 0x333333 })
        );
        sights.position.set(0, 0.1, -0.3);
        
        const rocketLauncherHandle = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.12, 0.06),
          new THREE.MeshToonMaterial({ color: 0x444444 })
        );
        rocketLauncherHandle.position.set(0, -0.1, 0.1);
        
        model.add(tube);
        model.add(sights);
        model.add(rocketLauncherHandle);
        break;
        
      default:
        // Default simple weapon
        const defaultMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.08, 0.5),
          new THREE.MeshToonMaterial({ color: weaponColor })
        );
        model.add(defaultMesh);
    }
    
    // Add cel-shading effect
    model.traverse(obj => {
      if (obj.isMesh) {
        obj.material.flatShading = true;
        obj.castShadow = true;
      }
    });
    
    return model;
  }
  
  /**
   * Get a color appropriate for a given weapon
   * @param {string} name - Weapon name
   * @returns {number} Hex color value
   */
  getWeaponColor(name) {
    const name_lower = name.toLowerCase();
    
    // Special weapon colors based on name
    if (name_lower.includes('fire') || name_lower.includes('flame')) {
      return 0xdd3311; // Fire red
    } else if (name_lower.includes('ice') || name_lower.includes('frost')) {
      return 0x88ccff; // Ice blue
    } else if (name_lower.includes('poison') || name_lower.includes('toxic')) {
      return 0x55dd22; // Toxic green
    } else if (name_lower.includes('shadow') || name_lower.includes('dark')) {
      return 0x332244; // Dark purple
    } else if (name_lower.includes('light') || name_lower.includes('holy')) {
      return 0xffffaa; // Light yellow
    }
    
    // Default colors by weapon type
    return 0x444444; // Generic metal color
  }
  
  /**
   * Generate weapon texture
   * @param {string} type - "melee" or "ranged"
   * @param {string} name - Weapon name
   * @returns {THREE.Texture} Generated texture
   */
  generateWeaponTexture(type, name) {
    // Check if we already have this texture cached
    const cacheKey = `texture_weapon_${type}_${name}`;
    if (this.textures[cacheKey]) {
      return this.textures[cacheKey].clone();
    }
    
    // Create a canvas for the texture
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");
    
    // Fill background
    context.fillStyle = "#888888";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add different patterns based on weapon type
    if (type === "melee") {
      if (name.toLowerCase().includes('sword')) {
        this.drawMetalTexture(context, "#cccccc");
      } else if (name.toLowerCase().includes('axe')) {
        this.drawMetalTexture(context, "#aaaaaa");
        this.drawWoodTexture(context, "#654321", 0.5);
      } else {
        this.drawMetalTexture(context, "#999999");
      }
    } else if (type === "ranged") {
      this.drawMetalTexture(context, "#333333");
      this.drawWoodTexture(context, "#554433", 0.3);
    }
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    // Cache the texture
    this.textures[cacheKey] = texture;
    
    return texture;
  }

  // Placeholder for AI-generated texture
  generateTexture(type) {
    // In a real implementation, this would interact with an AI model
    // to generate custom textures. For now, we return a simple procedural texture
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    // Background color
    context.fillStyle = "#888888";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Add some noise
    if (type === "ground") {
      this.drawNoise(context, "#777777", 0.3);
      this.drawNoise(context, "#999999", 0.1);
    } else if (type === "wall") {
      // Add brick pattern
      this.drawBricks(context);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
  
  /**
   * Draw metal texture on canvas
   */
  drawMetalTexture(context, baseColor, strength = 0.2) {
    // Draw a metallic texture
    context.fillStyle = baseColor;
    
    // Add grain
    for (let y = 0; y < 512; y += 1) {
      for (let x = 0; x < 512; x += 1) {
        const value = Math.random() * strength;
        const r = parseInt(baseColor.substr(1, 2), 16);
        const g = parseInt(baseColor.substr(3, 2), 16);
        const b = parseInt(baseColor.substr(5, 2), 16);
        
        const newR = Math.min(255, Math.max(0, r * (1 + value - strength/2)));
        const newG = Math.min(255, Math.max(0, g * (1 + value - strength/2)));
        const newB = Math.min(255, Math.max(0, b * (1 + value - strength/2)));
        
        context.fillStyle = `rgb(${newR},${newG},${newB})`;
        context.fillRect(x, y, 1, 1);
      }
    }
    
    // Add some scratches
    context.strokeStyle = "#ffffff";
    context.globalAlpha = 0.1;
    context.lineWidth = 1;
    
    for (let i = 0; i < 20; i++) {
      context.beginPath();
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const length = 30 + Math.random() * 100;
      const angle = Math.random() * Math.PI * 2;
      
      context.moveTo(x, y);
      context.lineTo(
        x + Math.cos(angle) * length,
        y + Math.sin(angle) * length
      );
      context.stroke();
    }
    
    context.globalAlpha = 1.0;
  }
  
  /**
   * Draw wood texture on canvas
   */
  drawWoodTexture(context, baseColor, alpha = 1.0) {
    context.globalAlpha = alpha;
    
    // Draw wood grain
    for (let y = 0; y < 512; y += 20) {
      context.fillStyle = baseColor;
      context.fillRect(0, y, 512, 20);
      
      // Draw grain lines
      context.fillStyle = "#000000";
      context.globalAlpha = 0.1 * alpha;
      
      for (let i = 0; i < 5; i++) {
        const yOffset = y + i * 4;
        context.fillRect(0, yOffset, 512, 1);
      }
      
      context.globalAlpha = alpha;
    }
    
    // Add some knots
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 5 + Math.random() * 15;
      
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = "#442211";
      context.fill();
      
      context.beginPath();
      context.arc(x, y, radius * 0.7, 0, Math.PI * 2);
      context.fillStyle = "#553322";
      context.fill();
    }
    
    context.globalAlpha = 1.0;
  }

  drawNoise(context, color, density) {
    context.fillStyle = color;
    for (let y = 0; y < 512; y += 4) {
      for (let x = 0; x < 512; x += 4) {
        if (Math.random() < density) {
          context.fillRect(x, y, 4, 4);
        }
      }
    }
  }

  drawBricks(context) {
    context.fillStyle = "#aa4444";
    for (let y = 0; y < 512; y += 32) {
      const offset = (y % 64 === 0) ? 0 : 32;
      for (let x = offset; x < 512; x += 64) {
        context.fillRect(x, y, 60, 28);
      }
    }
  }

  /**
   * Generate a blood splatter texture for effects
   * @param {string} type - Type of blood texture ('particle', 'splatter', 'drip', 'pool')
   * @returns {THREE.Texture} Generated blood texture
   */
  generateBloodTexture(type = 'splatter') {
    // Check if we already have this texture cached
    const cacheKey = `texture_blood_${type}`;
    if (this.textures[cacheKey]) {
      return this.textures[cacheKey].clone();
    }
    
    // Create a canvas for the texture
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");
    
    // Clear canvas with transparency
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Generate different types of blood textures
    switch (type) {
      case 'particle':
        this.generateBloodParticleTexture(context);
        break;
      case 'splatter':
        this.generateBloodSplatterTexture(context);
        break;
      case 'drip':
        this.generateBloodDripTexture(context);
        break;
      case 'pool':
        this.generateBloodPoolTexture(context);
        break;
      default:
        this.generateBloodSplatterTexture(context);
    }
    
    // Create THREE.js texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    // Cache the texture
    this.textures[cacheKey] = texture;
    
    return texture;
  }
  
  /**
   * Generate a blood particle texture (round drops)
   * @param {CanvasRenderingContext2D} context - Canvas context to draw on
   */
  generateBloodParticleTexture(context) {
    const width = context.canvas.width;
    const height = context.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create gradient for smooth edges
    const gradient = context.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, width * 0.4
    );
    
    // Deep red center fading to transparent
    gradient.addColorStop(0, 'rgba(180, 0, 0, 1.0)');
    gradient.addColorStop(0.7, 'rgba(140, 0, 0, 0.9)');
    gradient.addColorStop(1, 'rgba(100, 0, 0, 0.0)');
    
    // Draw blood drop
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(centerX, centerY, width * 0.4, 0, Math.PI * 2);
    context.fill();
    
    // Add some texture/noise for less uniform look
    context.globalCompositeOperation = 'multiply';
    context.fillStyle = 'rgba(100, 0, 0, 0.2)';
    
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 5 + Math.random() * 30;
      
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }
    
    // Reset composite operation
    context.globalCompositeOperation = 'source-over';
  }
  
  /**
   * Generate a blood splatter texture with irregular splats
   * @param {CanvasRenderingContext2D} context - Canvas context to draw on
   */
  generateBloodSplatterTexture(context) {
    const width = context.canvas.width;
    const height = context.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Set blood color with cel-shaded look (less shading)
    context.fillStyle = 'rgba(180, 0, 0, 0.9)';
    
    // Main splatter blob
    this.drawSplatterBlob(context, centerX, centerY, width * 0.2);
    
    // Add random secondary splatters
    const splatCount = 5 + Math.floor(Math.random() * 8);
    
    for (let i = 0; i < splatCount; i++) {
      const distance = Math.random() * width * 0.3;
      const angle = Math.random() * Math.PI * 2;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const size = 10 + Math.random() * (width * 0.1);
      
      this.drawSplatterBlob(context, x, y, size);
    }
    
    // Add spray/droplets
    context.fillStyle = 'rgba(150, 0, 0, 0.8)';
    const dropletCount = 40 + Math.floor(Math.random() * 60);
    
    for (let i = 0; i < dropletCount; i++) {
      const distance = Math.random() * width * 0.45;
      const angle = Math.random() * Math.PI * 2;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const size = 1 + Math.random() * 4;
      
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }
  }
  
  /**
   * Draw a single blood splatter blob with irregular edges
   * @param {CanvasRenderingContext2D} context - Canvas context
   * @param {number} x - Center x position
   * @param {number} y - Center y position
   * @param {number} radius - Approximate radius
   */
  drawSplatterBlob(context, x, y, radius) {
    context.beginPath();
    
    // Create irregular blob using bezier splines
    const points = 8 + Math.floor(Math.random() * 6);
    const angleStep = Math.PI * 2 / points;
    
    // First point
    let angle = 0;
    let r = radius * (0.7 + Math.random() * 0.6);
    let startX = x + Math.cos(angle) * r;
    let startY = y + Math.sin(angle) * r;
    context.moveTo(startX, startY);
    
    // Create each segment
    for (let i = 0; i < points; i++) {
      // Next point coordinates
      angle += angleStep;
      r = radius * (0.5 + Math.random() * 0.8);
      
      const endX = x + Math.cos(angle) * r;
      const endY = y + Math.sin(angle) * r;
      
      // Control point
      const controlAngle = angle - angleStep / 2;
      const controlDistance = radius * (0.7 + Math.random() * 1.3);
      
      const controlX = x + Math.cos(controlAngle) * controlDistance;
      const controlY = y + Math.sin(controlAngle) * controlDistance;
      
      // Draw curve segment
      context.quadraticCurveTo(controlX, controlY, endX, endY);
    }
    
    context.closePath();
    context.fill();
    
    // Add a slightly darker outline for cel-shaded look
    context.strokeStyle = 'rgba(100, 0, 0, 0.7)';
    context.lineWidth = 2;
    context.stroke();
  }
  
  /**
   * Generate a blood drip texture with streams/drips
   * @param {CanvasRenderingContext2D} context - Canvas context to draw on
   */
  generateBloodDripTexture(context) {
    const width = context.canvas.width;
    const height = context.canvas.height;
    
    // Start with blood pool at top
    context.fillStyle = 'rgba(160, 0, 0, 0.9)';
    context.beginPath();
    context.ellipse(
      width / 2, height * 0.2,
      width * 0.3, height * 0.1,
      0, 0, Math.PI * 2
    );
    context.fill();
    
    // Add drip streams
    const dripCount = 3 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < dripCount; i++) {
      this.drawBloodDrip(
        context,
        width * (0.3 + Math.random() * 0.4),
        height * 0.2,
        height * (0.5 + Math.random() * 0.4)
      );
    }
  }
  
  /**
   * Draw a single blood drip stream
   * @param {CanvasRenderingContext2D} context - Canvas context
   * @param {number} startX - Starting X position
   * @param {number} startY - Starting Y position
   * @param {number} length - Drip length
   */
  drawBloodDrip(context, startX, startY, length) {
    const width = 5 + Math.random() * 15;
    
    // Define drip path
    context.beginPath();
    context.moveTo(startX - width/2, startY);
    
    // Create a wavy drip path
    const segments = 6 + Math.floor(Math.random() * 6);
    const segmentLength = length / segments;
    
    for (let i = 1; i <= segments; i++) {
      const y = startY + i * segmentLength;
      const xOffset = (Math.random() - 0.5) * 20;
      
      // Control points for bezier curve
      const cp1x = startX + (Math.random() - 0.5) * 20;
      const cp1y = startY + (i - 0.5) * segmentLength;
      
      const cp2x = startX + (Math.random() - 0.5) * 20;
      const cp2y = startY + (i - 0.3) * segmentLength;
      
      // End point with randomized width
      const currentWidth = width * (segments - i) / segments;
      
      context.lineTo(startX + xOffset - currentWidth/2, y);
      context.lineTo(startX + xOffset + currentWidth/2, y);
    }
    
    // Complete the path back to start
    context.lineTo(startX + width/2, startY);
    context.closePath();
    
    // Fill with blood color gradient
    const gradient = context.createLinearGradient(startX, startY, startX, startY + length);
    gradient.addColorStop(0, 'rgba(180, 0, 0, 0.9)');
    gradient.addColorStop(1, 'rgba(100, 0, 0, 0.7)');
    
    context.fillStyle = gradient;
    context.fill();
    
    // Add darker outline for cel-shaded look
    context.strokeStyle = 'rgba(80, 0, 0, 0.8)';
    context.lineWidth = 1;
    context.stroke();
    
    // Add a blood droplet at the end
    const dropY = startY + length;
    const dropSize = width * 0.7;
    
    context.beginPath();
    context.arc(startX, dropY, dropSize, 0, Math.PI * 2);
    context.fillStyle = 'rgba(150, 0, 0, 0.9)';
    context.fill();
  }
  
  /**
   * Generate a blood pool texture
   * @param {CanvasRenderingContext2D} context - Canvas context to draw on
   */
  generateBloodPoolTexture(context) {
    const width = context.canvas.width;
    const height = context.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Main pool
    context.fillStyle = 'rgba(140, 0, 0, 0.9)';
    
    // Create irregular pool shape
    context.beginPath();
    
    // Use many points for a very irregular shape
    const points = 15 + Math.floor(Math.random() * 10);
    const baseRadius = Math.min(width, height) * 0.4;
    
    // First point
    let angle = 0;
    let radius = baseRadius * (0.9 + Math.random() * 0.2);
    let startX = centerX + Math.cos(angle) * radius;
    let startY = centerY + Math.sin(angle) * radius;
    context.moveTo(startX, startY);
    
    // Create each segment with bezier curves for smooth edges
    for (let i = 0; i < points; i++) {
      angle += (Math.PI * 2) / points;
      
      // Vary the radius more dramatically for pools
      radius = baseRadius * (0.7 + Math.random() * 0.6);
      
      const endX = centerX + Math.cos(angle) * radius;
      const endY = centerY + Math.sin(angle) * radius;
      
      // Add two control points for smoother, more irregular curves
      const cp1Angle = angle - ((Math.PI * 2) / points) * 0.7;
      const cp1Radius = baseRadius * (0.7 + Math.random() * 0.9);
      const cp1X = centerX + Math.cos(cp1Angle) * cp1Radius;
      const cp1Y = centerY + Math.sin(cp1Angle) * cp1Radius;
      
      const cp2Angle = angle - ((Math.PI * 2) / points) * 0.3;
      const cp2Radius = baseRadius * (0.7 + Math.random() * 0.9);
      const cp2X = centerX + Math.cos(cp2Angle) * cp2Radius;
      const cp2Y = centerY + Math.sin(cp2Angle) * cp2Radius;
      
      // Draw curve segment with two control points (cubic bezier)
      context.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
    }
    
    context.closePath();
    
    // Create a radial gradient for the pool
    const gradient = context.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, baseRadius
    );
    gradient.addColorStop(0, 'rgba(180, 0, 0, 0.9)');
    gradient.addColorStop(0.7, 'rgba(130, 0, 0, 0.9)');
    gradient.addColorStop(1, 'rgba(100, 0, 0, 0.7)');
    
    context.fillStyle = gradient;
    context.fill();
    
    // Add darker outline for cel-shaded look
    context.strokeStyle = 'rgba(80, 0, 0, 0.7)';
    context.lineWidth = 3;
    context.stroke();
    
    // Add lighter "reflections" for a wet look
    context.globalCompositeOperation = 'lighten';
    
    // Add a few highlight areas
    for (let i = 0; i < 5; i++) {
      const highlightX = centerX + (Math.random() - 0.5) * baseRadius;
      const highlightY = centerY + (Math.random() - 0.5) * baseRadius;
      const highlightSize = 10 + Math.random() * 30;
      
      const highlightGradient = context.createRadialGradient(
        highlightX, highlightY, 0,
        highlightX, highlightY, highlightSize
      );
      highlightGradient.addColorStop(0, 'rgba(255, 50, 50, 0.2)');
      highlightGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      context.fillStyle = highlightGradient;
      context.beginPath();
      context.arc(highlightX, highlightY, highlightSize, 0, Math.PI * 2);
      context.fill();
    }
    
    // Reset composite operation
    context.globalCompositeOperation = 'source-over';
  }
}

export default AIAssetGenerator;
