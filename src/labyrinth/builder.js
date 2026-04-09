import * as THREE from 'three'

export const towerPositions = []

const CELL_SIZE = 2
const loader = new THREE.TextureLoader()

const wallColour = loader.load('/textures/wall/wallColour.jpg')
const wallNormal = loader.load('/textures/wall/wallNormalGL.jpg')
const wallRough = loader.load('/textures/wall/wallRough.jpg')
const wallAO = loader.load('/textures/wall/wallAmbientOcclusion.jpg')

const towerColour = loader.load('/textures/tower/Rock035_2K-JPG_Color.jpg')
const towerNormal = loader.load('/textures/tower/Rock035_2K-JPG_NormalGL.jpg')
const towerRough = loader.load('/textures/tower/Rock035_2K-JPG_Roughness.jpg')
const towerAmbientOcclusion = loader.load('/textures/tower/Rock035_2K-JPG_AmbientOcclusion.jpg')
const towerDisplacement = loader.load('/textures/tower/Rock035_2K-JPG_Displacement.jpg')

const towerTextures = [
  towerColour,
  towerNormal,
  towerRough,
  towerAmbientOcclusion,
  towerDisplacement
]

towerTextures.forEach(tex => {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 4) // smaller tiles, repeated across each face
  tex.offset.set(Math.random(), Math.random()) // randomize per tower
})

export default function buildLabyrinth(grid) {
  const group = new THREE.Group()

  const wallGeo = new THREE.BoxGeometry(CELL_SIZE + 0.02, 2, CELL_SIZE + 0.02)
  wallGeo.attributes.uv2 = wallGeo.attributes.uv

  const wallMat = new THREE.MeshStandardMaterial({
    map: wallColour,
    normalMap: wallNormal,
    roughnessMap: wallRough,
    aoMap: wallAO,
    aoMapIntensity: 1.2,
    bumpMap: wallNormal,
    bumpScale: 0.1,
    metalness: 0.0,
    roughness: 1.0,
    envMapIntensity: 0.0,
    color: new THREE.Color(0x333333),
    emissive: new THREE.Color(0x111122),
    emissiveIntensity: 0.0
  })

  const towerMat = new THREE.MeshStandardMaterial({
    map: towerColour,
    normalMap: towerNormal,
    roughnessMap: towerRough,
    aoMap: towerAmbientOcclusion,
    displacementMap: towerDisplacement,
    displacementScale: 0.15,
    metalness: 0.0,
    roughness: 1.0,
    color: new THREE.Color(0xdddddd)
  })

  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[0].length; y++) {
      const worldX = x * CELL_SIZE
      const worldZ = y * CELL_SIZE

      if (grid[x][y]) {
        const wall = new THREE.Mesh(wallGeo, wallMat)
        wall.position.set(worldX, 1, worldZ)
        wall.castShadow = true
        wall.receiveShadow = true
        group.add(wall)
      } else {
        if (Math.random() < 0.02) {
          const height = 10 + Math.random() * 20
          const towerGeo = new THREE.CylinderGeometry(
            CELL_SIZE / 2, CELL_SIZE / 2, height, 32, 4, true
          )
          towerGeo.attributes.uv2 = towerGeo.attributes.uv

          const tower = new THREE.Mesh(towerGeo, towerMat)
          tower.position.set(worldX, height / 2, worldZ)
          tower.castShadow = true
          tower.receiveShadow = true
          group.add(tower)

          towerPositions.push({ x: worldX, z: worldZ, radius: CELL_SIZE / 2 })

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
