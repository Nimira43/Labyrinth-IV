import * as THREE from 'three'
import createRenderer from './core/renderer.js'
import createCamera from './core/camera.js'
import createScene from './core/scene.js'
import handleResize from './utils/resize.js'
import generateLabyrinth from './labyrinth/generator.js'
import buildLabyrinth from './labyrinth/builder.js'
import updateTowers from './labyrinth/towerBeams.js'
import createPlayer from './player/playerController.js'
import { setupAudio, loadSounds } from './core/sound.js'

const renderer = createRenderer()
document.body.appendChild(renderer.domElement)

const camera = createCamera()
handleResize(renderer, camera)

const listener = setupAudio(camera)
const sounds = loadSounds(listener)

const width = 101
const height = 101

const scene = createScene(width, height)

const maze = generateLabyrinth(width, height)
const labyrinthMesh = buildLabyrinth(maze)
scene.add(labyrinthMesh)

const northArrow = new THREE.Mesh(
  new THREE.ConeGeometry(0.3, 1.2, 8),
  new THREE.MeshStandardMaterial({ color: '#ff0000', emissive: '#550000' })
)
northArrow.rotation.x = Math.PI / 2
scene.add(northArrow)

const player = createPlayer(scene, camera, maze, renderer)
const clock = new THREE.Clock()

function tick() {
  const delta = clock.getDelta()
  player.update(delta)

  northArrow.position.set(
    camera.position.x,
    camera.position.y + 2,
    camera.position.z
  )

  updateTowers(scene, camera, labyrinthMesh.children, sounds)

  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}

tick()
