import * as THREE from 'three'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import { towerPositions } from '../labyrinth/builder.js'

const CELL_SIZE = 2
const PLAYER_RADIUS = 0.45

export default function createPlayer(scene, camera, mazeGrid, renderer) {
  const controls = new PointerLockControls(camera, renderer.domElement)
  document.body.addEventListener('click', () => controls.lock())

  scene.add(camera)

  const speed = 5
  const keys = { w: false, a: false, s: false, d: false }

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase()
    if (keys.hasOwnProperty(k)) keys[k] = true
  })

  window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase()
    if (keys.hasOwnProperty(k)) keys[k] = false
  })

  let startX = 1
  let startZ = 1
  outer: for (let x = 0; x < mazeGrid.length; x++) {
    for (let z = 0; z < mazeGrid[0].length; z++) {
      if (!mazeGrid[x][z]) {
        startX = x
        startZ = z
        break outer
      }
    }
  }

  camera.position.set(startX * CELL_SIZE, 1.6, startZ * CELL_SIZE)

  const headLight = new THREE.PointLight('#ffffff', 0.6, 10)
  camera.add(headLight)

  function worldToGrid(x, z) {
    const gx = Math.floor((x + CELL_SIZE / 2) / CELL_SIZE)
    const gz = Math.floor((z + CELL_SIZE / 2) / CELL_SIZE)
    return { gx, gz }
  }

  function isWallCell(gx, gz) {
    if (
      gx < 0 ||
      gz < 0 ||
      gx >= mazeGrid.length ||
      gz >= mazeGrid[0].length
    ) {
      return true
    }
    return mazeGrid[gx][gz]
  }

  function isBlockedArea(x, z, radius = PLAYER_RADIUS) {
    const samples = [
      [x + radius, z],
      [x - radius, z],
      [x, z + radius],
      [x, z - radius]
    ]

    return samples.some(([sx, sz]) => {
      const { gx, gz } = worldToGrid(sx, sz)
      return isWallCell(gx, gz)
    })
  }

  function isNearTower(x, z, buffer = 0.6) {
    return towerPositions.some(pos => {
      const dx = x - pos.x
      const dz = z - pos.z
      const distSq = dx * dx + dz * dz
      const minDist = pos.radius + buffer
      return distSq < minDist * minDist
    })
  }

  function update(delta) {
    if (!controls.isLocked) return

    const move = new THREE.Vector3()

    if (keys.w) move.z -= 1
    if (keys.s) move.z += 1
    if (keys.a) move.x -= 1
    if (keys.d) move.x += 1

    if (move.lengthSq() === 0) return

    move.normalize().multiplyScalar(speed * delta)
    move.applyQuaternion(camera.quaternion)

    const nextX = camera.position.x + move.x
    const nextZ = camera.position.z + move.z

    if (
      !isBlockedArea(nextX, camera.position.z) &&
      !isNearTower(nextX, camera.position.z)
    ) {
      camera.position.x = nextX
    }

    if (
      !isBlockedArea(camera.position.x, nextZ) &&
      !isNearTower(camera.position.x, nextZ)
    ) {
      camera.position.z = nextZ
    }
  }

  return { update }
}

