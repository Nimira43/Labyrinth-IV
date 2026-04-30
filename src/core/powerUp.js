import * as THREE from 'three'

export default function createPowerUp(scene, areaSize = 100) {
  const x = (Math.random() - 0.5) * areaSize
  const z = (Math.random() - 0.5) * areaSize
  const y = 1.2

  const geo = new THREE.SphereGeometry(0.4, 32, 32)
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#33ff99'),
    emissive: new THREE.Color('#33ff99'),
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.1
  })

  const orb = new THREE.Mesh(geo, mat)
  orb.position.set(x, y, z)
  orb.castShadow = true
  orb.receiveShadow = false

  const glow = new THREE.PointLight('#33ff99', 1.5, 10)
  glow.position.set(x, y, z)
  scene.add(glow)
  scene.add(orb)
  
  orb.userData = {
    id: `powerup_${Math.floor(Math.random() * 10000)}`,
    pulseSpeed: 2 + Math.random() * 2,
    rotationSpeed: 2 + Math.random() * 3
  }

  orb.update = function (delta) {
    orb.rotation.y += delta * orb.userData.rotationSpeed
    const pulse = Math.sin(performance.now() * 0.002 * orb.userData.pulseSpeed)
    orb.scale.setScalar(1 + 0.1 * pulse)
    glow.intensity = 1.2 + 0.3 * pulse
  }

  return orb
}
