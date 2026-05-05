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
  tex.repeat.set(2, 4)
  tex.offset.set(Math.random(), Math.random())
})

export async function buildLabyrinthAsync(grid, onProgress = () => { }) {
  const group = new THREE.Group()

  const wallGeo = new THREE.BoxGeometry(CELL_SIZE + 0.02, 2, CELL_SIZE + 0.02)
  wallGeo.attributes.uv2 = wallGeo.attributes.uv

  const wallMatBase = new THREE.MeshStandardMaterial({
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

  const wallMatVariants = []
  for (let i = 0; i < 4; i++) {
    const mat = wallMatBase.clone()
    mat.color.offsetHSL(0, 0, -0.03 * i)
    wallMatVariants.push(mat)
  }

  const roofGeo = new THREE.BoxGeometry(CELL_SIZE, 0.3, CELL_SIZE)
  const roofMatBase = wallMatBase.clone()
  roofMatBase.color.offsetHSL(0.05, -0.1, -0.1)

  const roofMatCollapsed = roofMatBase.clone()
  roofMatCollapsed.color.offsetHSL(0.1, -0.2, -0.2)

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

  const towerGeoTemplate = new THREE.CylinderGeometry(
    CELL_SIZE / 2,
    CELL_SIZE / 2,
    1,
    32,
    4,
    true
  )
  towerGeoTemplate.attributes.uv2 = towerGeoTemplate.attributes.uv

  const width = grid.length
  const height = grid[0].length
  const totalCells = width * height
  let processed = 0

  const YIELD_EVERY = 400

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {

      const worldX = x * CELL_SIZE
      const worldZ = y * CELL_SIZE

      if (x === Math.floor(width / 2) && y === height - 1) {
        continue
      }

      if (grid[x][y]) {

        const baseHeight = 2
        const hasNeighbours =
          grid[x - 1]?.[y] ||
          grid[x + 1]?.[y] ||
          grid[x]?.[y - 1] ||
          grid[x]?.[y + 1]

        const stackCount = hasNeighbours
          ? Math.floor(Math.random() * 3) + 2
          : Math.floor(Math.random() * 4) + 1

        const collapseChance = Math.random()
        const effectiveStack =
          collapseChance < 0.15
            ? Math.max(1, stackCount - (1 + Math.floor(Math.random() * 2)))
            : stackCount

        for (let i = 0; i < effectiveStack; i++) {
          const mat = wallMatVariants[Math.min(i, wallMatVariants.length - 1)]
          const wall = new THREE.Mesh(wallGeo, mat)

          wall.position.set(
            worldX + (Math.random() - 0.5) * 0.1,
            1 + i * baseHeight + (Math.random() - 0.5) * 0.05,
            worldZ + (Math.random() - 0.5) * 0.1
          )

          wall.rotation.y = (Math.random() - 0.5) * 0.1
          wall.castShadow = true
          wall.receiveShadow = true

          if (i === effectiveStack - 1) {
            wall.scale.set(1.05, 1, 1.05)
          }

          group.add(wall)
        }

        if (Math.random() < (hasNeighbours ? 0.45 : 0.25)) {
          const offsets = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
          ]

          offsets.forEach(([dx, dy]) => {
            if (grid[x + dx]?.[y + dy]) {
              const collapsed = Math.random() < 0.35
              const roof = new THREE.Mesh(
                roofGeo,
                collapsed ? roofMatCollapsed : roofMatBase
              )
              roof.userData.isRotatingSlab = true
              roof.userData.rotationSpeed = 0.1 + Math.random() * 0.3
              roof.userData.rotationDirection = Math.random() < 0.5 ? 1 : -1

              roof.position.set(
                worldX + dx * CELL_SIZE * 0.5,
                1 + baseHeight * effectiveStack + 0.2 + (Math.random() * 0.3),
                worldZ + dy * CELL_SIZE * 0.5
              )

              roof.rotation.y = (Math.random() - 0.5) * 0.4
              roof.castShadow = true
              roof.receiveShadow = true

              if (collapsed) {
                roof.scale.set(1, 1, 0.7)
              }

              group.add(roof)
            }
          })
        }

      } else {
        if (Math.random() < 0.03) {
          const float = new THREE.Mesh(roofGeo, roofMatBase)

          float.userData.isRotatingSlab = true
          float.userData.rotationSpeed = 0.2 + Math.random() * 0.4

          float.position.set(
            worldX + (Math.random() - 0.5) * CELL_SIZE,
            3 + Math.random() * 6,
            worldZ + (Math.random() - 0.5) * CELL_SIZE
          )
          float.rotation.y = Math.random() * Math.PI
          float.castShadow = true
          float.receiveShadow = true
          group.add(float)
        }

        if (Math.random() < 0.02) {
          const heightVal = 10 + Math.random() * 20

          const tower = new THREE.Mesh(towerGeoTemplate, towerMat)
          tower.scale.y = heightVal
          tower.position.set(worldX, heightVal / 2, worldZ)

          tower.castShadow = true
          tower.receiveShadow = true
          group.add(tower)

          towerPositions.push({
            x: worldX,
            z: worldZ,
            radius: CELL_SIZE / 2,
            height: heightVal
          })
        }
      }

      processed++
      if (processed % YIELD_EVERY === 0) {
        const percent = Math.floor((processed / totalCells) * 100)
        onProgress(percent)
        await new Promise(r => requestAnimationFrame(r))
      }
    }
  }

  onProgress(100)
  return group
}

export default function buildLabyrinth(grid) {
  return new THREE.Group()
}
