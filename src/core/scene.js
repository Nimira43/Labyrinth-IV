import * as THREE from 'three'

export default function createScene(width, height) {

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#1a0a00') 
  scene.fog = new THREE.Fog('#1a0a00', 10, 120)

  const light = new THREE.DirectionalLight('#ffffff', 2)
  light.position.set(10, 20, 10)
  light.castShadow = true
  scene.add(light)

  const ambient = new THREE.AmbientLight('#666')
  scene.add(ambient)
  const torchLight = new THREE.PointLight('#ff9933', 1, 10)
  torchLight.position.set(1, 2, 1)
  scene.add(torchLight)

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 2 + 10, height * 2 + 10),
    new THREE.MeshStandardMaterial({ color: '#222' })
  )
  floor.position.set((width * 2) / 2, 0, (height * 2) / 2)

  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  return scene
}

