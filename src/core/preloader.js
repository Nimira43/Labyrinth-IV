import * as THREE from 'three'

export default async function preloadAssets(onProgress) {
  const loader = new THREE.TextureLoader()
  const audioLoader = new THREE.AudioLoader()

  const textures = [
    '/textures/wall/wallColour.jpg',
    '/textures/wall/wallNormalGL.jpg',
    '/textures/wall/wallRough.jpg',
    '/textures/wall/wallAmbientOcclusion.jpg',
    '/textures/tower/Rock035_2K-JPG_Color.jpg',
    '/textures/tower/Rock035_2K-JPG_NormalGL.jpg',
    '/textures/tower/Rock035_2K-JPG_Roughness.jpg',
    '/textures/tower/Rock035_2K-JPG_AmbientOcclusion.jpg',
    '/textures/tower/Rock035_2K-JPG_Displacement.jpg'
  ]

  const sounds = [
    '/sounds/bg/bg-music.mp3',
  ]

  const total = textures.length + sounds.length
  let loaded = 0

  const updateProgress = () => {
    loaded++
    const percent = Math.floor((loaded / total) * 100)
    onProgress(percent)
  }

  const texturePromises = textures.map(
    path =>
      new Promise(resolve => {
        loader.load(path, () => {
          updateProgress()
          resolve()
        })
      })
  )

  const soundPromises = sounds.map(
    path =>
      new Promise(resolve => {
        audioLoader.load(path, () => {
          updateProgress()
          resolve()
        })
      })
  )

  await Promise.all([...texturePromises, ...soundPromises])
}
