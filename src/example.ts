import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { randomHex } from './lib/index'
// import { ColorFactory } from './color/colorFactory'
import Mirror from './index'
import './example.styl'
//
;(() => {
  const mirror = new Mirror()

  const scene = new THREE.Scene()
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  canvas.style.backgroundColor = '#ddd'
  const ctx = canvas.getContext('webgl')
  if (!ctx) {
    return
  }
  const renderer = new THREE.WebGLRenderer({ canvas, context: ctx })
  renderer.setSize(innerWidth, innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.VSMShadowMap // default THREE.PCFShadowMap

  const aspect = innerWidth / innerHeight
  const camera = new THREE.PerspectiveCamera(30, aspect, 0.1, 100)
  camera.position.set(0, 3, 10)
  camera.lookAt(0, 0, 0)
  camera.up.set(0, 1, 0)
  scene.add(camera)

  const controls = new OrbitControls(camera, canvas)
  controls.target = new THREE.Vector3(0, 3, 0)
  controls.minZoom = 0.5
  controls.maxZoom = 4
  controls.update()
  let needUpdate = 0
  controls.addEventListener('change', () => {
    needUpdate = 3
  })

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.3)
  dirLight.position.set(0, 0, 1)
  camera.add(dirLight)

  // const pointLight = new THREE.PointLight(0xffffff, 0.5, 10)
  // pointLight.position.set(0, 3, 5)
  // scene.add(pointLight)
  // pointLight.castShadow = true
  // pointLight.shadow.mapSize.width = 2048
  // pointLight.shadow.mapSize.height = 2048
  // pointLight.shadow.camera.near = 0.5
  // pointLight.shadow.camera.far = 500
  // pointLight.shadow.bias = -0.004
  // pointLight.shadow.radius = 4

  const envLight = new THREE.AmbientLight(0xffffff, 0.9)
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
    // .load('/dev/gltf/doctor3-script.gltf', {
    .load(
      '/assets/citizen/main.gltf',
      {
        metadata: randomHex(40),
        envMap,
      },
      () => {
        needUpdate = 3
      }
    )
    .then((model) => {
      start(model)
    })

  requestAnimationFrame(render)
  function render() {
    if (needUpdate > 0) {
      needUpdate--
      renderer.render(scene, camera)
    }
    requestAnimationFrame(render)
  }

  function start(model: THREE.Group) {
    scene.add(model)
    needUpdate = 3

    document.body.addEventListener('mouseup', () => {
      needUpdate = 3
    })

    const button = document.createElement('button')
    button.innerText = 'REFRESH'
    button.id = 'mirror_refresh'
    button.onclick = () => {
      const metadata = randomHex(40)
      mirror.parse(model, { metadata }, () => {
        needUpdate = 3
      })
      needUpdate = 3
    }
    document.body.appendChild(button)
  }
})()
//
// ;(() => {
//   const basicHash = randomHex(40)
//   for (let i = 0; i < 5; i++) {
//     const container = document.createElement('div')
//     container.style.display = 'flex'
//     if (i) {
//       container.style.marginTop = '10px'
//     }
//     for (let j = 0; j < 10; j++) {
//       const color = ColorFactory.from(basicHash, i, j)
//       const div = document.createElement('div')
//       div.innerHTML = j.toString()
//       div.style.width = '40px'
//       div.style.height = '40px'
//       div.style.backgroundColor = color
//       div.style.color = '#fff'
//       container.appendChild(div)
//     }
//     document.querySelector('#mirror_dev')?.appendChild(container)
//   }
// })()
