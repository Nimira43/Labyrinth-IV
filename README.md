# Labyrinth IV

Labyrinth IV is a minimalist, atmospheric maze‑walking game where the player wanders through a procedurally generated stone labyrinth filled with strange architectural anomalies. There are no enemies, no combat, no puzzles — just the player, the maze, and the unsettling sense that the structure is quietly alive.

---

## Features

### Procedurally Generated Maze

A depth‑first maze generator creates a unique 101×101 labyrinth on every run.  

### Dynamic Wall Architecture

Walls are built as stacked stone blocks with:

- randomised heights
- subtle positional offsets  
- collapsed segments  
- variant materials for visual depth  

The result is a maze that feels ancient, uneven, and hand‑built.

### Floating & Rotating Slabs

Throughout the labyrinth, stone slabs appear:

- attached to walls  
- collapsed between corridors  
- floating freely in open spaces  

Each slab rotates slowly at its own speed and direction, giving the environment a dreamlike, uncanny motion.

### Tower Structures

Occasional tall stone towers rise from open cells, adding vertical landmarks and breaking up the maze’s silhouette.

### First‑Person Exploration

A simple WASD + mouse first‑person controller allows the player to walk the maze at human scale.  
Collision detection prevents walking through walls.

### North Arrow

A floating red arrow hovers above the player, always pointing north to help with orientation.

### Exit & Win Condition

A single exit gap is carved into the far wall.  
Reaching it triggers a clean, atmospheric win modal and ends the run.

### No UI, No HUD

The world is intentionally minimal.  
No health, no keys, no distractions — just the maze.

---

## Tech Stack

- **Three.js** — rendering, materials, geometry  
- **Custom maze generator** — DFS with extra carves  
- **Custom builder** — procedural wall/tower/slab construction  
- **Vanilla JS** — no frameworks  
- **Modular ES6 structure** — clean separation of logic  

---

## Project Structure

```md

/core
  camera.js
  controls.js
  preloader.js
  renderer.js
  scene.js
  sound.js
  GameState.js  

/labyrinth
  generator.js 
  builder.js    

/player
  playerController.js

/utils
  resize.js

main.js     
```

---

## How It Works

1. **Assets load**
2. **Maze is generated**
3. **Builder constructs the 3D labyrinth mesh**
4. **Player controller is created**
5. **Exit trigger is placed**
6. **Game loop begins**
7. **Slabs rotate, player moves, win condition checks**
8. **Reaching the exit shows the win modal**
