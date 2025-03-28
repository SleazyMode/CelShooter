PROMPTS USED

1. Create a new folder called `cel-shaded-fps` and initialize a Node.js project inside it.
2. Set up basic dependencies:
   - three (for rendering)
   - vite or parcel (or another bundler of your choice)
   - ammo.js or cannon.js (for physics)
   - dat.gui or stats.js (optional, if you want debug/GUI)
3. Confirm the package.json includes scripts to run and build the project.

Output the resulting folder structure and package.json so I can verify.




Now, in the `cel-shaded-fps` project, create the following files:

- An `index.html` that:
  - Includes a canvas or an element where the Three.js renderer can attach.
  - Loads the bundled JavaScript (via Vite/Parcel dev server).

- A `src/` directory with:
  - `main.js` (entry point)
  - `game/` folder containing placeholder files:
    - `GameManager.js`
    - `Player.js`
    - `Weapon.js`
    - `ProceduralLevel.js`
    - `Physics.js`
    - `InputController.js`
    - `AIAssetGenerator.js` (placeholder for generating 3D assets/textures using AI)

In your code:
1. Initialize a minimal Three.js scene in `main.js`.
2. Create a PerspectiveCamera, a simple directional or ambient light, and a basic box or sphere to test rendering.
3. Render this scene.

Then provide me with the new folder structure and the contents of each file.




We want the game to generate **all** assets automatically using AI (or placeholders if real text-to-3D calls are not possible). Implement the following logic in `AIAssetGenerator.js`:

1. A function `generateWeaponModel(weaponName)` that attempts to produce a glTF or glb file for that weapon (e.g., "Cel-Shaded Sword", "Cel-Shaded Assault Rifle"). If a real text-to-3D pipeline is not available, mock this process by creating procedural Three.js geometry or placeholders. Save or reference the output in `assets/generated_models/`.

2. A function `generateTexture(texturePrompt)` that attempts to produce a stylized texture. For instance, "blood_splatter.png" or "cartoon_wall.png." Save them in `assets/generated_textures/`.

3. On build or startup, automatically generate:
   - At least 3 melee weapons (e.g., a knife, an axe, a futuristic sword).
   - At least 3 ranged weapons (e.g., pistol, assault rifle, rocket launcher).
   - Some random environmental textures for the floors/walls of the levels.

Show me the new code in `AIAssetGenerator.js` and how you integrate it into the build process.





Enable a cel-shaded/cartoon style by doing the following:

1. Use Three.js's `MeshToonMaterial` or create a custom shader material that mimics flat coloring with strong outlines.
2. Add an outline pass or cartoon edge detection pass, if feasible.
3. In `GameManager.js`, create a specialized material loader that:
   - Applies this toon/cel-shaded style to any generated 3D models from `AIAssetGenerator.js`.
   - Ensures the environment (floors, walls) also have a stylized cartoon look.

Please show me the updated code in:
- `GameManager.js` (how you load and apply the materials)
- Any custom shader code, if used.
- A demonstration of at least one AI-generated model with a cel-shaded look in the scene.





Implement a **procedural level generation** system in `ProceduralLevel.js`:

1. The system should generate a random arena or maze-like layout each time the game starts.
   - Use random blocks, ramps, platforms, walls.
   - Assign basic collision shapes via ammo.js or cannon.js.
   - Optionally apply AI-generated textures on walls/floors.

2. Add spawn points for two teams (Red vs. Blue) at opposite ends of the map.

3. Update `GameManager.js` to call this `ProceduralLevel` generation method at startup, then place the player(s) at spawn points.

Output the relevant code in `ProceduralLevel.js`, including how you generate geometry, apply collision, and place spawn points.





In `Player.js`, implement a first-person controller:

1. Capsule collider for the player body (with ammo.js or cannon.js).
2. WASD for movement, space to jump, mouse for looking around.
3. A camera locked to the player's "head" position.
4. Include basic gravity and friction so the player doesn't float.

When you move the mouse:
- The Y-axis rotates the camera up/down (clamp between -85 and +85 degrees).
- The X-axis rotates the player’s body left/right.

Show me how `InputController.js` connects to `Player.js` to handle user input, and how the camera is updated each frame.





Expand `Weapon.js` to handle both **melee** and **ranged** weapons:

1. **Weapon Base Class**: Contains attributes like damage, cooldown, ammo (for ranged), or range (for melee).
2. **MeleeWeapon** subclass:
   - `swing()` or `attack()` method that checks collisions (short raycast or overlap) with enemies.
   - Possibly a short animation or timed event.
3. **RangedWeapon** subclass:
   - `fire()` method that does raycast or spawns a projectile.
   - Muzzle flash, bullet impact, blood splatter.
4. Integrate the generated 3D models from `AIAssetGenerator.js` so each weapon has a unique mesh.

Add code that allows the player to switch between multiple weapons. Show the relevant code in `Weapon.js`, plus any updates to `Player.js` to manage equipping and using weapons.





Implement a simple team deathmatch mode:

1. Two teams: Red and Blue. Each player is randomly assigned a team.
2. Keep track of kills and deaths in a global scoreboard in `GameManager.js`.
3. Display a minimal HUD showing:
   - Player’s health
   - Currently equipped weapon
   - Team scores (e.g. “Red: 3 | Blue: 1”)

When a player dies:
- Show a brief death camera or fade-out.
- Respawn them at a team spawn point after 3 seconds.

Update the relevant files and show me the scoreboard, HUD, and the kill-tracking logic in code.





Add exaggerated blood effects and particles:

1. In `AIAssetGenerator.js`, generate a cartoonish "blood splatter" texture or sprite sheet if not already created.
2. On each successful hit:
   - Spawn a short-lived particle system spraying red particles outward.
   - Optionally place a decal or 'blood splat' on floors/walls at point of impact. (Use Three.js `DecalGeometry` or a sprite.)
3. Ensure performance is managed by limiting total particles or removing them after a short time.

Show me how you implement the blood effect in a new `Effects.js` file or integrated in `GameManager.js`, including the spawning and cleanup logic.





Finally, tie everything together so the game can be tested and played locally:

1. In the package.json scripts, include "dev" or "start" to run Vite/Parcel.
2. Provide instructions on how to launch the game in a browser (e.g., localhost:3000).
3. Summarize any known limitations or next steps (like advanced AI to handle text-to-3D asset generation).
4. Output the final `index.html` and all relevant source files, so I can copy them into my environment and run the game.

This should complete the "Cel-Shaded Carnage" FPS with procedural levels, multiple weapons, and a team deathmatch mode.





# Cel-Shaded Carnage FPS

A stylized, cel-shaded first-person shooter with exaggerated blood effects, weapon system, and procedurally generated levels.

![Cel-Shaded Carnage FPS](screenshot.png)

## Features

- **Stylized Graphics**: Cel-shaded rendering with black outlines for a comic-like appearance
- **Comprehensive Weapon System**: 
  - Melee weapons (knives, axes) with swinging animations
  - Ranged weapons (pistols, shotguns, rifles) with realistic behavior
  - Weapon switching and management
- **Exaggerated Blood Effects**:
  - Dynamic blood splatters on surfaces
  - Particle-based blood sprays
  - Performance-optimized decal system
- **Procedural Level Generation**:
  - Random arena layouts with blocks, ramps and platforms
  - Team-based spawn areas
- **Physics Integration**:
  - CANNON.js-based physics for realistic movement
  - Collision detection and response
- **Game Systems**:
  - Score tracking
  - Health and ammo UI
  - Kill feed
  - Menu and pause functionality

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cel-shaded-fps.git
cd cel-shaded-fps
```

2. Install dependencies:
```bash
npm install
```

## Development

To start the development server:

```bash
npm run dev
```

This will launch a Vite development server, and the game will be available at http://localhost:3000.

## Controls

- **WASD**: Movement
- **Mouse**: Look around
- **Left Mouse Button**: Fire/Attack
- **R**: Reload
- **1-5**: Select weapon
- **Q/E or Mouse Wheel**: Cycle through weapons
- **Space**: Jump
- **Shift**: Sprint
- **Escape**: Pause game

## Architecture

The game is built with the following structure:

- `src/main.js`: Main entry point, initializes the game
- `src/game/`:
  - `Player.js`: Player controller and interactions
  - `Weapon.js`: Base weapon class and specific weapon implementations
  - `AIAssetGenerator.js`: Procedural texture and model generation
  - `Physics.js`: Physics simulation wrapper
  - `ProceduralLevel.js`: Level generation
  - `Effects.js`: Blood and particle effects system
  - `GameManager.js`: Overall game state management
  - `InputController.js`: Input handling

## Known Limitations & Future Improvements

1. **Enemy AI**: Currently implements basic pathfinding - future updates will include more advanced behavior
2. **Multiplayer**: Planned for future releases
3. **Additional Weapons**: More weapon types in development
4. **Performance Optimization**: Ongoing improvements for blood effects and physics
5. **Mobile Support**: Currently desktop-only, mobile support planned

## Blood Effects Demo

A dedicated demo for the blood effects system is available:

```javascript
// Include in your scene setup
import BloodEffectsDemo from './game/BloodEffectsDemo';

// Initialize demo
const bloodDemo = new BloodEffectsDemo(renderer, scene, camera);

// Update in animation loop
function animate() {
  requestAnimationFrame(animate);
  bloodDemo.update(deltaTime);
  renderer.render(scene, camera);
}
```

## Building for Production

To create a production build:

```bash
npm run build
```

The compiled assets will be available in the `dist/` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- Three.js for 3D rendering
- CANNON.js for physics
- Vite for development and building 
