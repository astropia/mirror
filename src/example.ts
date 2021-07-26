import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass'

import { randomHex } from './lib/index'
// import { ColorFactory } from './color/colorFactory'
import Mirror, { MirrorLoaded } from './index'
import './example.styl'
//
;(() => {
  const mirror = new Mirror()

  const scene = new THREE.Scene()
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  canvas.style.backgroundColor = '#666'
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
  const camera = new THREE.PerspectiveCamera(30, aspect, 1, 100)
  camera.position.set(0, 2, 13)
  camera.lookAt(0, 2.5, 0)
  camera.up.set(0, 1, 0)
  scene.add(camera)

  const controls = new OrbitControls(camera, canvas)
  controls.target = new THREE.Vector3(0, 2.5, 0)
  controls.minZoom = 0.5
  controls.maxZoom = 4
  controls.update()

  let needUpdate = 0
  let mixer: THREE.AnimationMixer | undefined
  controls.addEventListener('change', () => {
    needUpdate = 3
  })

  const composer = new EffectComposer(renderer)
  const renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)
  // const saoPass = new SAOPass(scene, camera, false, true)
  // saoPass.params.saoIntensity = 0.011
  // saoPass.params.saoKernelRadius = 128
  // saoPass.params.saoMinResolution = 0.0002
  // composer.addPass(saoPass)
  // composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.1, -0.2, 0.02))
  // ;((window as unknown) as { saoPass: SAOPass }).saoPass = saoPass

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.2)
  dirLight.position.set(0, 0, 1)
  camera.add(dirLight)

  const pointLight = new THREE.PointLight(0xffffff, 0.4, 20)
  pointLight.position.set(1, 5, 3)
  camera.add(pointLight)
  pointLight.castShadow = true
  pointLight.shadow.mapSize.width = 2048
  pointLight.shadow.mapSize.height = 2048
  pointLight.shadow.camera.near = 0.5
  pointLight.shadow.camera.far = 500
  pointLight.shadow.bias = -0.004
  pointLight.shadow.radius = 4

  const envLight = new THREE.AmbientLight(0xffffff, 0.8)
  scene.add(envLight)

  const map = [
    '/skybox/right.jpg',
    '/skybox/left.jpg',
    '/skybox/top.jpg',
    '/skybox/bottom.jpg',
    '/skybox/front.jpg',
    '/skybox/back.jpg',
  ]
  const envMap = new THREE.CubeTextureLoader().load(map)

  const box = new THREE.Mesh(
    new THREE.BoxBufferGeometry(50, 50, 50),
    new THREE.MeshStandardMaterial({ color: 0xdddddd, side: THREE.BackSide })
  )
  camera.add(box)

  mirror
    .load(
      '/assets/hunter/main.gltf',
      {
        metadata: randomHex(40),
        envMap,
      },
      () => {
        needUpdate = 3
      }
    )
    .then((result) => {
      start(result)
    })

  const clock = new THREE.Clock()
  requestAnimationFrame(render)
  function render() {
    if (mixer) {
      mixer.update(clock.getDelta())
      composer.render()
    } else if (needUpdate > 0) {
      needUpdate--
      composer.render()
    }
    envLight.intensity = Math.sin(clock.oldTime / 1000) * 0.4 + 0.4
    requestAnimationFrame(render)
  }

  function start(result: MirrorLoaded) {
    scene.add(result.group)
    needUpdate = 3

    if (result.animations.length) {
      mixer = result.mixer
      result.animations.forEach((anim) => anim.play())
    }

    document.body.addEventListener('mouseup', () => {
      needUpdate = 3
    })

    const button = document.createElement('button')
    button.innerText = 'REFRESH'
    button.id = 'mirror_refresh'
    button.onclick = () => {
      const metadata = randomHex(40)
      mirror.parse(result.group, { metadata }, () => {
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
