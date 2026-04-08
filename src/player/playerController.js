import * as THREE from 'three'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import { towerPositions } from '../labyrinth/builder.js'

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

  camera.position.set(startX * 2, 1.6, startZ * 2)

  const headLight = new THREE.PointLight('#ffffff', 0.6, 10)
  camera.add(headLight)

  function isBlockedArea(x, z, radius = 0.45) {
    const samples = [
      [x + radius, z],
      [x - radius, z],
      [x, z + radius],
      [x, z - radius]
    ]
    return samples.some(([sx, sz]) => {
      const gx = Math.floor((sx + 1.025) / 2.05)
      const gz = Math.floor((sz + 1.025) / 2.05)
      return mazeGrid[gx]?.[gz] ?? true
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
