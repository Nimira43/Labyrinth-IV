import * as THREE from 'three'

export const towerPositions = [] 

const loader = new THREE.TextureLoader()

const wallColour = loader.load('/textures/wall/wallColour.jpg')
const wallNormal = loader.load('/textures/wall/wallNormalGL.jpg')
const wallRough = loader.load('/textures/wall/wallRough.jpg')
const wallAO = loader.load('/textures/wall/wallAmbientOcclusion.jpg')

const towerColour = loader.load('/textures/tower/towerColour.jpg')
const towerNormal = loader.load('/textures/tower/towerNormal.jpg')
const towerRough = loader.load('/textures/tower/towerRoughness.jpg')
const towerMetal = loader.load('/textures/tower/towerMetalness.jpg')

export default function buildLabyrinth(grid) {
  const group = new THREE.Group()

  const wallGeo = new THREE.BoxGeometry(2.05, 2, 2.05)
  wallGeo.attributes.uv2 = wallGeo.attributes.uv

  const wallMat = new THREE.MeshStandardMaterial({
    map: wallColour,
    normalMap: wallNormal,
    roughnessMap: wallRough,
    aoMap: wallAO,
    aoMapIntensity: 1,
    bumpMap: wallNormal,
    bumpScale: 0.1,
    metalness: 0.0,
    roughness: 1.0,
    envMapIntensity: 0.0,
    color: new THREE.Color(0x333333)
  })

  const towerMat = new THREE.MeshPhysicalMaterial({
    map: towerColour,
    normalMap: towerNormal,
    roughnessMap: towerRough,
    metalnessMap: towerMetal,
    metalness: 1.0,
    roughness: 0.1,
    envMapIntensity: 1.8,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
    reflectivity: 0.9,
    sheen: 0.6,
    sheenColor: new THREE.Color(0x3399ff),
    color: new THREE.Color(0x5533ff),
    emissive: new THREE.Color(0x111133),
    emissiveIntensity: 0.3
  })

  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[0].length; y++) {
      const worldX = x * 2
      const worldZ = y * 2

      if (grid[x][y]) {
        const wall = new THREE.Mesh(wallGeo, wallMat)
        wall.position.set(worldX, 1, worldZ)
        wall.castShadow = true
        wall.receiveShadow = true
        group.add(wall)
      } else {
        if (Math.random() < 0.02) {
          const height = 10 + Math.random() * 20
          const towerGeo = new THREE.BoxGeometry(2, height, 2)
          const tower = new THREE.Mesh(towerGeo, towerMat)
          tower.position.set(worldX, height / 2, worldZ)
          tower.castShadow = true
          tower.receiveShadow = true
          group.add(tower)

          towerPositions.push({ x: worldX, z: worldZ, radius: 1 }) // ← Add to collision list

          if (Math.random() < 0.3) {
            const glow = new THREE.PointLight('#3399ff', 1, 15)
            glow.position.set(worldX, height, worldZ)
            group.add(glow)
          }
        }
      }
    }
  }

  return group
}
