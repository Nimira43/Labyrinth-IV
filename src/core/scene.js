import * as THREE from 'three'

const loader = new THREE.TextureLoader()
const groundColour = loader.load('/textures/ground/groundColour.jpg')
const groundNormal = loader.load('/textures/ground/groundNormalGL.jpg')
const groundRough = loader.load('/textures/ground/groundRough.jpg')
const groundAO = loader.load('/textures/ground/groundAmbientOcclusion.jpg')
const groundDisplacement = loader.load('/textures/ground/groundDisplacement.jpg')

groundColour.wrapS = groundColour.wrapT = THREE.RepeatWrapping
groundNormal.wrapS = groundNormal.wrapT = THREE.RepeatWrapping
groundRough.wrapS = groundRough.wrapT = THREE.RepeatWrapping
groundAO.wrapS = groundAO.wrapT = THREE.RepeatWrapping
groundDisplacement.wrapS = groundDisplacement.wrapT = THREE.RepeatWrapping

groundColour.repeat.set(50, 50)
groundNormal.repeat.set(50, 50)
groundRough.repeat.set(50, 50)
groundAO.repeat.set(50, 50)
groundDisplacement.repeat.set(50, 50)

export default function createScene(width, height) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#1a0a00')
  scene.fog = new THREE.Fog('#1a0a00', 8, 90)   

  const light = new THREE.DirectionalLight('#ffffff', 0.95) // was 0.7
  light.position.set(20, 40, 20)
  light.castShadow = true
  light.shadow.mapSize.width = 2048
  light.shadow.mapSize.height = 2048

  const cam = light.shadow.camera
  cam.near = 1
  cam.far = 200
  cam.left = -200
  cam.right = 200
  cam.top = 200
  cam.bottom = -200

  light.shadow.bias = -0.0005
  light.shadow.normalBias = 0.02

  scene.add(light)

  const skyGlow = new THREE.HemisphereLight('#442200', '#000000', 0.35) // was 0.25
  scene.add(skyGlow)

  const ambient = new THREE.AmbientLight('#666666', 0.9) // was 0.6
  scene.add(ambient)

  const torchLight = new THREE.PointLight('#ff9933', 1.2, 12) // was 0.8
  torchLight.position.set(1, 2, 1)
  scene.add(torchLight)

  const rimLight = new THREE.PointLight('#3399ff', 0.25, 60) // subtle lift
  rimLight.position.set(width, 30, height)
  scene.add(rimLight)

  const floorGeo = new THREE.PlaneGeometry(width * 2 + 10, height * 2 + 10, 256, 256)
  floorGeo.computeVertexNormals()
  floorGeo.attributes.uv2 = floorGeo.attributes.uv

  const floorMat = new THREE.MeshStandardMaterial({
    map: groundColour,
    normalMap: groundNormal,
    roughnessMap: groundRough,
    aoMap: groundAO,
    aoMapIntensity: 1,
    displacementMap: groundDisplacement,
    displacementScale: 0.05,
    metalness: 0.0,
    roughness: 1.0,
    envMapIntensity: 0.0,
    color: new THREE.Color(0x555555) // was 0x444444
  })

  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.position.set((width * 2) / 2, 0, (height * 2) / 2)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  return scene
}






