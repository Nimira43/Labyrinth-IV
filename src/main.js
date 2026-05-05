import * as THREE from 'three'
import createRenderer from './core/renderer.js'
import createCamera from './core/camera.js'
import createScene from './core/scene.js'
import handleResize from './utils/resize.js'
import generateLabyrinth from './labyrinth/generator.js'
import { buildLabyrinthAsync } from './labyrinth/builder.js'
import updateTowers from './labyrinth/towerBeams.js'
import createPlayer from './player/playerController.js'
import { setupAudio, loadSounds } from './core/sound.js'
import GameState from './core/GameState.js'
import preloadAssets from './core/preloader.js'

const renderer = createRenderer()
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

  loadingText.textContent = 'Preparing renderer…'
  renderer.shadowMap.enabled = false
  for (let i = 0; i < 10; i++) {
    await new Promise(r => requestAnimationFrame(r))
    renderer.render(scene, camera)
    progressBar.style.width = `${90 + i}%`
  }
  renderer.shadowMap.enabled = true

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

  tick()
}

function tick() {
  const delta = clock.getDelta()
  player.update(delta)

  northArrow.position.set(
    camera.position.x,
    camera.position.y + 2,
    camera.position.z
  )

  updateTowers(scene, camera, labyrinthMesh.children, sounds, gameState)

  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}

requestAnimationFrame(startGame)
