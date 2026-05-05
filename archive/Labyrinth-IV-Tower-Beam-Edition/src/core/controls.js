import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export default function createControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement)
  controls.enableDamping = true
  return controls
}
