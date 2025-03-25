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