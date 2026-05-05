import * as THREE from 'three'
import createRenderer from './core/renderer.js'
import createCamera from './core/camera.js'
import createScene from './core/scene.js'
import handleResize from './utils/resize.js'
import generateLabyrinth from './labyrinth/generator.js'
import { buildLabyrinthAsync } from './labyrinth/builder.js'
import createPlayer from './player/playerController.js'
import { setupAudio, loadSounds } from './core/sound.js'
import GameState from './core/GameState.js'
import preloadAssets from './core/preloader.js'

const CELL_SIZE = 2

const renderer = createRenderer()
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement)

const camera = createCamera()
handleResize(renderer, camera)

const listener = setupAudio(camera)
const sounds = loadSounds(listener)

const scene = createScene(101, 101)
const clock = new THREE.Clock()
const gameState = new GameState()

let player
let labyrinthMesh
let northArrow
let framesSinceStart = 0
let exitTrigger = null
let tickHandle = null

const loadingEl = document.getElementById('loading')
const progressBar = document.getElementById('progress-bar')
const loadingText = document.getElementById('loading-text')

async function startGame() {
  loadingText.textContent = 'Loading assets…'
  progressBar.style.width = '0%'

  await preloadAssets(percent => {
    progressBar.style.width = `${percent}%`
    loadingText.textContent = `Loading assets… ${percent}%`
  })

  loadingText.textContent = 'Generating labyrinth…'
  const width = 101
  const height = 101
  const maze = generateLabyrinth(width, height)

  loadingText.textContent = 'Building labyrinth… 0%'
  progressBar.style.width = '0%'

  labyrinthMesh = await buildLabyrinthAsync(maze, percent => {
    progressBar.style.width = `${percent}%`
    loadingText.textContent = `Building labyrinth… ${percent}%`
  })
  scene.add(labyrinthMesh)

  northArrow = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 1.2, 8),
    new THREE.MeshStandardMaterial({ color: '#ff0000', emissive: '#550000' })
  )
  northArrow.rotation.x = Math.PI / 2
  scene.add(northArrow)

  player = createPlayer(scene, camera, maze, renderer)

  const exitGridX = Math.floor(width / 2)
  const exitGridY = height - 1

  exitTrigger = new THREE.Mesh(
    new THREE.BoxGeometry(2, 3, 2),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  exitTrigger.position.set(
    exitGridX * CELL_SIZE,
    1.5,
    exitGridY * CELL_SIZE
  )
  scene.add(exitTrigger)

  loadingText.textContent = 'Preparing renderer…'
  for (let i = 0; i < 5; i++) {
    await new Promise(r => requestAnimationFrame(r))
    renderer.render(scene, camera)
    progressBar.style.width = `${90 + i * 2}%`
  }

  loadingText.textContent = 'Ready. Press any key to begin.'
  progressBar.style.width = '100%'

  await new Promise(resolve => {
    const startHandler = () => {
      document.removeEventListener('keydown', startHandler)
      resolve()
    }
    document.addEventListener('keydown', startHandler)
  })

  loadingEl.style.transition = 'opacity 1s ease-out'
  loadingEl.style.opacity = '0'
  await new Promise(r => setTimeout(r, 1000))
  loadingEl.remove()

  framesSinceStart = 0
  tick()
}

function showWinModal() {
  const modal = document.createElement('div')
  modal.style.position = 'fixed'
  modal.style.inset = '0'
  modal.style.display = 'flex'
  modal.style.alignItems = 'center'
  modal.style.justifyContent = 'center'
  modal.style.background = 'rgba(0, 0, 0, 0.92)'
  modal.style.backdropFilter = 'blur(4px)'
  modal.style.color = '#fff'
  modal.style.fontFamily = 'system-ui, sans-serif'
  modal.style.fontSize = '3rem'
  modal.style.textAlign = 'center'
  modal.style.zIndex = '9999'
  modal.style.opacity = '0'
  modal.style.transition = 'opacity 1.2s ease-out'

  modal.innerHTML = `
    <div style="
      padding: 40px 60px;
      border: 2px solid rgba(255,255,255,0.15);
      background: rgba(20,20,30,0.6);
      box-shadow: 0 0 40px rgba(255,255,255,0.15);
      border-radius: 12px;
      animation: pulseGlow 3s infinite ease-in-out;
    ">
      <div style="font-size: 3.2rem; letter-spacing: 2px; margin-bottom: 10px;">
        YOU ESCAPED
      </div>
      <div style="font-size: 1.3rem; opacity: 0.8;">
        The Labyrinth releases you from its shadows.
      </div>
    </div>
  `

  document.body.appendChild(modal)

  requestAnimationFrame(() => {
    modal.style.opacity = '1'
  })

  if (tickHandle) {
    cancelAnimationFrame(tickHandle)
  }
}


function tick() {
  const delta = clock.getDelta()
  player.update(delta)
  labyrinthMesh.traverse(obj => {
    if (obj.userData.isRotatingSlab) {
      obj.rotation.y += obj.userData.rotationSpeed * obj.userData.rotationDirection * delta
    }
  })

  northArrow.position.set(
    camera.position.x,
    camera.position.y + 2,
    camera.position.z
  )

  if (exitTrigger && !gameState.portalUnlocked) {
    const dist = camera.position.distanceTo(exitTrigger.position)
    if (dist < CELL_SIZE) {
      gameState.portalUnlocked = true
      showWinModal()
      return
    }
  }

  framesSinceStart++
  renderer.render(scene, camera)
  tickHandle = requestAnimationFrame(tick)
}

requestAnimationFrame(startGame)
