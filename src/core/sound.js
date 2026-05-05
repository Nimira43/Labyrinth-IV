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
  })

  document.body.addEventListener('click', () => {
    if (!bgMusic.isPlaying) bgMusic.play()
  })

  return { bgMusic }
}

