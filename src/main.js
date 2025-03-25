import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Stats from 'stats.js';

// Import game modules
import GameManager from './game/GameManager.js';
import Player from './game/Player.js';
import InputController from './game/InputController.js';
import AIAssetGenerator from './game/AIAssetGenerator.js';
import ProceduralLevel from './game/ProceduralLevel.js';
import BloodEffectsDemo from './game/BloodEffectsDemo.js';
import Physics from './game/Physics.js';

// Initialize stats for performance monitoring (only visible during development)
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
stats.dom.style.position = 'absolute';
stats.dom.style.left = '0px';
stats.dom.style.top = '0px';
document.body.appendChild(stats.dom);

// Game settings
const gameSettings = {
  enableCelShading: true,
  enableBloodEffects: true,
  effectsQuality: 'high', // low, medium, high
  soundVolume: 0.8,
  mouseSensitivity: 1.0,
  showFps: true
};

// Global variables
let renderer, scene, camera;
let gameManager, player, inputController, physics;
let assetGenerator;
let levelGenerator;
let lastTime = performance.now();
let isGameStarted = false;

// DOM Elements
const healthFill = document.getElementById('health-fill');
const ammoCounter = document.getElementById('ammo-counter');
const redScore = document.getElementById('red-score');
const blueScore = document.getElementById('blue-score');
const instructions = document.getElementById('instructions');

// Initialize the game
init();

function init() {
  // Setup the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Light blue sky
  scene.fog = new THREE.Fog(0x87CEEB, 20, 100); // Add fog for distance fade

  // Setup the camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 5);

  // Setup the renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // Initialize game systems
  physics = new Physics();
  assetGenerator = new AIAssetGenerator();
  gameManager = new GameManager(scene);
  gameManager.setEffectsLevel(gameSettings.effectsQuality);
  gameManager.setBloodEffects(gameSettings.enableBloodEffects);
  
  // Initialize input controller
  inputController = new InputController();
  
  // Create the player
  player = new Player(scene, physics, camera, assetGenerator);
  
  // Set up the level
  levelGenerator = new ProceduralLevel(scene, physics, assetGenerator);
  levelGenerator.generate({
    levelSize: 50,
    blockCount: 20,
    wallHeight: 3,
    teamASpawnPoint: new THREE.Vector3(-20, 2, 0),
    teamBSpawnPoint: new THREE.Vector3(20, 2, 0)
  });

  // Add lights
  setupLights();

  // Update UI
  updateHealthUI(player.health);
  updateScoreUI(0, 0);
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize);
  
  // Event listener for starting the game
  renderer.domElement.addEventListener('click', startGame);
  
  // Start animation loop
  animate();
}

function setupLights() {
  // Main ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Main directional light (sun)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(20, 30, 20);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 100;
  directionalLight.shadow.camera.left = -50;
  directionalLight.shadow.camera.right = 50;
  directionalLight.shadow.camera.top = 50;
  directionalLight.shadow.camera.bottom = -50;
  scene.add(directionalLight);
  
  // Add a hemisphere light for more natural outdoor lighting
  const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x444444, 0.5);
  scene.add(hemisphereLight);
}

function startGame() {
  if (isGameStarted) return;
  
  // Hide instructions
  instructions.style.display = 'none';
  
  // Start the game
  gameManager.startGame();
  isGameStarted = true;
  
  // Remove the click event listener
  renderer.domElement.removeEventListener('click', startGame);
}

function onWindowResize() {
  // Update camera aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  // Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateHealthUI(health) {
  // Update health bar width based on health percentage
  const healthPercent = Math.max(0, health) / 100;
  healthFill.style.width = `${healthPercent * 100}%`;
}

function updateAmmoUI(current, reserve) {
  // Update ammo counter text
  if (ammoCounter) {
    ammoCounter.textContent = `${current} / ${reserve}`;
  }
}

function updateScoreUI(teamAScore, teamBScore) {
  // Update team scores
  if (redScore) redScore.textContent = teamBScore;
  if (blueScore) blueScore.textContent = teamAScore;
}

// Main animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Calculate delta time
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
  lastTime = currentTime;
  
  // Start stats measurement
  if (gameSettings.showFps) {
    stats.begin();
  }
  
  // Update physics
  physics.update(deltaTime);
  
  // Update player
  if (isGameStarted) {
    player.update(inputController, deltaTime);
    
    // Update UI
    updateHealthUI(player.health);
    
    // Get current weapon ammo status
    const weapon = player.getCurrentWeapon();
    if (weapon && weapon.type === 'ranged') {
      const ammoStatus = weapon.getAmmoStatus();
      updateAmmoUI(ammoStatus.current, ammoStatus.reserve);
    }
  }
  
  // Update game manager
  gameManager.update(deltaTime);
  
  // Reset input controller states that should only last one frame
  inputController.update();
  
  // Render the scene
  renderer.render(scene, camera);
  
  // End stats measurement
  if (gameSettings.showFps) {
    stats.end();
  }
}

// For quick debugging during development
window.THREE = THREE;
window.scene = scene;
window.camera = camera;
window.player = player;
window.gameManager = gameManager;

console.log('Cel-Shaded Carnage FPS initialized');

// Export any important game objects for console debugging
export { scene, camera, player, gameManager, inputController, physics };
