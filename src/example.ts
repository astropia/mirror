import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { randomHex } from './lib/index'
import Mirror from './index'
import './example.styl'
//
;(() => {
  const mirror = new Mirror()

  const scene = new THREE.Scene()
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  canvas.style.backgroundColor = '#333'
  const ctx = canvas.getContext('webgl')
  if (!ctx) {
    return
  }
  const renderer = new THREE.WebGLRenderer({ canvas, context: ctx })
  renderer.setSize(innerWidth, innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  const aspect = innerWidth / innerHeight
  const camera = new THREE.PerspectiveCamera(30, aspect, 0.1, 100)
  camera.position.set(0, 3, 10)
  camera.lookAt(0, 0, 0)
  camera.up.set(0, 1, 0)

  const controls = new OrbitControls(camera, canvas)
  controls.target = new THREE.Vector3(0, 3, 0)
  controls.minZoom = 0.5
  controls.maxZoom = 4
  controls.update()
  let needUpdate = false
  controls.addEventListener('change', () => {
    needUpdate = true
  })

  // const dirLight = new THREE.DirectionalLight(0xffffff, 0.1)
  // dirLight.position.set(0, 0, 1)
  // scene.add(dirLight)

  // const pointLight = new THREE.PointLight(0xffffff, 0.3, 10)
  // pointLight.position.set(0, 3, 5)
  // scene.add(pointLight)

  const envLight = new THREE.AmbientLight(0xffffff, 1.0)
  scene.add(envLight)

  const map = [
    '/dev/skybox/right.jpg',
    '/dev/skybox/left.jpg',
    '/dev/skybox/top.jpg',
    '/dev/skybox/bottom.jpg',
    '/dev/skybox/front.jpg',
    '/dev/skybox/back.jpg',
  ]
  const envMap = new THREE.CubeTextureLoader().load(map)

  mirror
    .load('/dev/gltf/doctor3-script.gltf', {
      metadata: '53b6af24750e52f57f567d4f4be822c209ad6767',
      envMap,
    })
    .then((model) => {
      start(model)
    })

  requestAnimationFrame(render)
  function render() {
    if (needUpdate) {
      renderer.render(scene, camera)
      needUpdate = false
    }
    requestAnimationFrame(render)
  }

  function start(model: THREE.Group) {
    scene.add(model)
    needUpdate = true

    document.onclick = () => {
      const metadata = randomHex(40)
      mirror.parse(model, { metadata })
      needUpdate = true
    }
  }
})()
