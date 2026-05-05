import * as THREE from 'three'

export default class PowerUpKeys {
  constructor(scene, options = {}) {
    this.scene = scene
    this.keys = []
    this.totalKeys = options.totalKeys || 5
    this.areaSize = options.areaSize || 80
    this.collected = new Set()
  }

  spawnKeys() {
    for (let i = 1; i <= this.totalKeys; i++) {
      const key = this.createKey(i)
      this.keys.push(key)
      this.scene.add(key.group)
    }
  }

  createKey(keyIndex) {
    const group = new THREE.Group()
    const x = (Math.random() - 0.5) * this.areaSize
    const z = (Math.random() - 0.5) * this.areaSize
    const y = 1.2

    const geo = new THREE.SphereGeometry(0.45, 24, 24)
    const mat = new THREE.MeshStandardMaterial({
      color: '#33ff99',
      emissive: '#33ff99',
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.1
    })

    const orb = new THREE.Mesh(geo, mat)
    orb.castShadow = true
    group.add(orb)

    const glow = new THREE.PointLight('#33ff99', 1.5, 10)
    group.add(glow)

    group.position.set(x, y, z)

    group.userData = {
      id: `key_${keyIndex}`,
      keyIndex,
      collected: false,
      rotationSpeed: 2 + Math.random() * 2,
      pulseSpeed: 2 + Math.random() * 2
    }

    group.update = (delta) => {
      if (group.userData.collected) return

      group.rotation.y += delta * group.userData.rotationSpeed

      const pulse = Math.sin(performance.now() * 0.002 * group.userData.pulseSpeed)
      const scale = 1 + 0.1 * pulse
      orb.scale.set(scale, scale, scale)
      glow.intensity = 1.2 + 0.3 * pulse
    }

    return { group, orb, glow }
  }

  update(delta) {
    this.keys.forEach(k => k.group.update(delta))
  }

  tryCollect(playerPosition, radius = 1.2) {
    for (const key of this.keys) {
      const g = key.group
      if (g.userData.collected) continue

      const dist = g.position.distanceTo(playerPosition)
      if (dist < radius) {
        g.userData.collected = true
        this.collected.add(g.userData.keyIndex)
        g.visible = false

        return {
          keyIndex: g.userData.keyIndex,
          healthBoost: 10
        }
      }
    }
    return null
  }

  allKeysCollected() {
    return this.collected.size === this.totalKeys
  }
}
