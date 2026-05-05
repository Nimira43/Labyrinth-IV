import * as THREE from 'three'

export function setupAudio(camera) {
  const listener = new THREE.AudioListener()
  camera.add(listener)
  return listener
}

export function loadSounds(listener) {
  const loader = new THREE.AudioLoader()

  const bgMusic = new THREE.Audio(listener)
  loader.load('/sounds/bg/bg-music.mp3', buffer => {
    bgMusic.setBuffer(buffer)
    bgMusic.setLoop(true)
    bgMusic.setVolume(0.4)
    bgMusic.play()
  })

  const towerFire = new THREE.Audio(listener)
  loader.load('/sounds/sfx/bolt.wav', buffer => {
    towerFire.setBuffer(buffer)
    towerFire.setVolume(0.7)
  })

  return { bgMusic, towerFire }
}
