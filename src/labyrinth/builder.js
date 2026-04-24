import * as THREE from 'three'

export const towerPositions = []

const CELL_SIZE = 2
const loader = new THREE.TextureLoader()

// --- WALL TEXTURES ---
const wallColour = loader.load('/textures/wall/wallColour.jpg')
const wallNormal = loader.load('/textures/wall/wallNormalGL.jpg')
const wallRough = loader.load('/textures/wall/wallRough.jpg')
const wallAO = loader.load('/textures/wall/wallAmbientOcclusion.jpg')

// --- TOWER TEXTURES ---
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

export default function buildLabyrinth(grid) {
  const group = new THREE.Group()

  // --- WALL MATERIAL ---
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

  // --- TOWER MATERIAL ---
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

  // --- BUILD LOOP ---
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[0].length; y++) {
      const worldX = x * CELL_SIZE
      const worldZ = y * CELL_SIZE

      if (grid[x][y]) {
        // --- WALL STACKING ---
        const baseHeight = 2
        const hasNeighbours =
          grid[x - 1]?.[y] || grid[x + 1]?.[y] || grid[x]?.[y - 1] || grid[x]?.[y + 1]

        const stackCount = hasNeighbours
          ? Math.floor(Math.random() * 3) + 2 // 2–4 blocks near clusters
          : Math.floor(Math.random() * 4) + 1 // 1–4 blocks isolated

        const collapseChance = Math.random()
        const effectiveStack =
          collapseChance < 0.15
            ? Math.max(1, stackCount - Math.floor(Math.random() * 2 + 1))
            : stackCount

        for (let i = 0; i < effectiveStack; i++) {
          const wall = new THREE.Mesh(wallGeo, wallMat)
          wall.position.set(
            worldX + (Math.random() - 0.5) * 0.1,
            1 + i * baseHeight + (Math.random() - 0.5) * 0.05,
            worldZ + (Math.random() - 0.5) * 0.1
          )
          wall.rotation.y = (Math.random() - 0.5) * 0.1
          wall.castShadow = true
          wall.receiveShadow = true

          if (i > 0) {
            wall.material = wallMat.clone()
            wall.material.color.offsetHSL(0, 0, -0.03 * i)
          }

          if (i === effectiveStack - 1) {
            wall.scale.set(1.05, 1, 1.05)
          }

          group.add(wall)
        }

        // --- ROOF FORMATION ---
        if (hasNeighbours && Math.random() < 0.15) {
          const neighbourOffsets = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
          ]

          neighbourOffsets.forEach(([dx, dy]) => {
            if (grid[x + dx]?.[y + dy]) {
              const roofGeo = new THREE.BoxGeometry(CELL_SIZE, 0.3, CELL_SIZE)
              const roofMat = wallMat.clone()
              roofMat.color.offsetHSL(0.05, -0.1, -0.1)

              const roof = new THREE.Mesh(roofGeo, roofMat)
              roof.position.set(
                worldX + dx * CELL_SIZE / 2,
                1 + baseHeight * effectiveStack + 0.2,
                worldZ + dy * CELL_SIZE / 2
              )
              roof.rotation.y = (Math.random() - 0.5) * 0.1
              roof.castShadow = true
              roof.receiveShadow = true

              // Optional: partial roof collapse
              if (Math.random() < 0.3) {
                roof.scale.set(1, 1, 0.7)
                roof.material.color.offsetHSL(0.1, -0.2, -0.2)
              }

              group.add(roof)
            }
          })
        }
      } else {
        // --- TOWER GENERATION ---
        if (Math.random() < 0.02) {
          const height = 10 + Math.random() * 20
          const towerGeo = new THREE.CylinderGeometry(
            CELL_SIZE / 2,
            CELL_SIZE / 2,
            height,
            32,
            4,
            true
          )
          towerGeo.attributes.uv2 = towerGeo.attributes.uv

          const tower = new THREE.Mesh(towerGeo, towerMat)
          tower.position.set(worldX, height / 2, worldZ)
          tower.castShadow = true
          tower.receiveShadow = true
          group.add(tower)

          towerPositions.push({
            x: worldX,
            z: worldZ,
            radius: CELL_SIZE / 2,
            height
          })

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


