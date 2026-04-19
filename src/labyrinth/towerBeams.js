import * as THREE from 'three'
import { towerPositions } from './builder.js'

const beamCooldown = 3000
const beamRange = 10
const beamDuration = 400
const chargeTime = 1000 
const towerState = new Map()

export default function updateTowers(scene, camera, wallMeshes, sounds) {

  const now = performance.now()

  towerPositions.forEach(pos => {
    let state = towerState.get(pos)
    if (!state) {
      state = { lastShot: 0, charging: false }
      towerState.set(pos, state)
    }

    const dx = camera.position.x - pos.x
    const dz = camera.position.z - pos.z
    const distSq = dx * dx + dz * dz

    if (distSq < beamRange * beamRange && now - state.lastShot > beamCooldown && !state.charging) {
      state.charging = true
      const origin = new THREE.Vector3(pos.x, pos.height / 2, pos.z)
      const direction = new THREE.Vector3(
        camera.position.x - pos.x,
        (camera.position.y + 0.5) - origin.y,
        camera.position.z - pos.z
      ).normalize()
      const target = new THREE.Vector3(
        camera.position.x,
        camera.position.y + 0.5,
        camera.position.z
      ).add(direction.clone().multiplyScalar(0.5))

      const distance = origin.distanceTo(target)
      if (distance < 2) {
        state.charging = false
        return
      }

      const raycaster = new THREE.Raycaster(origin, direction)
      const hits = raycaster.intersectObjects(wallMeshes)

      const chargeLight = new THREE.PointLight('#ffff66', 0, 10)
      chargeLight.position.copy(origin)
      scene.add(chargeLight)

      let intensity = 0
      const chargeInterval = setInterval(() => {
        intensity += 0.2
        chargeLight.intensity = intensity
        if (intensity >= 2) {
          clearInterval(chargeInterval)
          scene.remove(chargeLight)

          if (hits.length === 0) {
            shootBeam(scene, origin, target, sounds)

            playerHit(scene, camera.position)
          } else {
            shootBeam(scene, origin, hits[0].point)
          }

          state.lastShot = performance.now()
          state.charging = false
        }
      }, chargeTime / 10)
    }
  })
}

function shootBeam(scene, origin, target, sounds) {
  const points = [origin.clone(), target.clone()]
  const beamGeo = new THREE.BufferGeometry().setFromPoints(points)
  const beamMat = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 4 })
  const beam = new THREE.Line(beamGeo, beamMat)
  scene.add(beam)

  if (sounds?.towerFire?.isPlaying) sounds.towerFire.stop()
  sounds?.towerFire?.play()

  const distance = origin.distanceTo(target)
  const boltGeo = new THREE.CylinderGeometry(0.25, 0.25, distance, 16)
  boltGeo.translate(0, -distance / 2, 0)
  boltGeo.rotateX(Math.PI / 2)
  const boltMat = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 4,
    transparent: true,
    opacity: 0.8
  })
  const bolt = new THREE.Mesh(boltGeo, boltMat)
  bolt.position.copy(origin)
  bolt.lookAt(target)
  scene.add(bolt)

  setTimeout(() => scene.remove(bolt), 150)
  setTimeout(() => scene.remove(beam), 1000)
}


function playerHit(scene, position) {
  // electrical glow overlay
  const overlay = document.createElement('div')
  overlay.style.position = 'fixed'
  overlay.style.top = 0
  overlay.style.left = 0
  overlay.style.width = '100%'
  overlay.style.height = '100%'
  overlay.style.backgroundColor = 'rgba(255, 180, 50, 0.25)'
  overlay.style.pointerEvents = 'none'
  overlay.style.transition = 'opacity 1s ease-out'
  document.body.appendChild(overlay)

  document.body.style.filter = 'brightness(0.6) saturate(1.5)'
  setTimeout(() => {
    overlay.style.opacity = '0'
    document.body.style.filter = ''
    setTimeout(() => overlay.remove(), 1000)
  }, 200)

  const flashGeo = new THREE.SphereGeometry(0.4, 16, 16)
  const flashMat = new THREE.MeshBasicMaterial({
    color: 0xffaa33,
    transparent: true,
    opacity: 0.9
  })
  const flash = new THREE.Mesh(flashGeo, flashMat)
  flash.position.copy(position)
  scene.add(flash)
  setTimeout(() => scene.remove(flash), 250)
}

