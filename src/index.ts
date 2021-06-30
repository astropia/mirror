import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { Metadata, praseMaterial } from '@/parser/index'

interface Options {
  metadata: Metadata
  envMap?: THREE.CubeTexture
}

export interface MirrorLoaded {
  group: THREE.Group
  mixer: THREE.AnimationMixer
  animations: THREE.AnimationAction[]
}

export default class Mirror {
  get isMirror(): boolean {
    return true
  }

  public async load(
    url: string,
    options: Options,
    onUpdate?: (m: THREE.Mesh) => void
  ): Promise<MirrorLoaded> {
    const loader = new GLTFLoader()
    const envMap = options.envMap || null
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          const mixer = new THREE.AnimationMixer(gltf.scene)
          const animations = gltf.animations.map((anim) => mixer.clipAction(anim))
          gltf.scene.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) {
              return
            }
            if (!(child.material instanceof THREE.MeshStandardMaterial)) {
              return
            }
            child.frustumCulled = false

            if (!child.material.userData.noShadow) {
              child.castShadow = true
              child.receiveShadow = true
            }
            child.material.envMap = envMap

            child.material.blending = THREE.NormalBlending

            praseMaterial(child.material, options.metadata).then(() => {
              if (onUpdate) {
                requestAnimationFrame(() => {
                  onUpdate(child)
                })
              }
            })
          })
          resolve({
            group: gltf.scene,
            mixer,
            animations,
          })
        },
        undefined,
        reject
      )
    })
  }

  public parse(model: THREE.Group, options: Options, onUpdate?: (m: THREE.Mesh) => void): void {
    const container = document.querySelector('#mirror_dev')
    if (container) {
      container.innerHTML = ''
    }

    const envMap = options.envMap || null
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return
      }
      if (!(child.material instanceof THREE.MeshStandardMaterial)) {
        return
      }

      if (!child.material.userData.noShadow) {
        child.castShadow = true
        child.receiveShadow = true
      }
      if (!child.material.envMap) {
        child.material.envMap = envMap
      }

      praseMaterial(child.material, options.metadata).then(() => {
        if (onUpdate) {
          requestAnimationFrame(() => {
            onUpdate(child)
          })
        }
      })
    })
  }
}
