import * as THREE from 'three'

export default function buildLabyrinth(grid) {
  const group = new THREE.Group()

  const wallMat = new THREE.MeshStandardMaterial({
    color: '#030526',     
    metalness: 0.8,
    roughness: 0.2,
    emissive: '#050225'
  })

  const towerMat = new THREE.MeshStandardMaterial({
    color: '#001133',    
    metalness: 0.9,
    roughness: 0.1,
    emissive: '#000022'
  })

  const wallGeo = new THREE.BoxGeometry(2, 2, 2)

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

