import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { Metadata, praseMaterial } from '@/parser/index'

interface Options {
  metadata: Metadata
  envMap?: THREE.CubeTexture
}

export default class Mirror {
  get isMirror(): boolean {
    return true
  }

  public async load(url: string, options: Options): Promise<THREE.Group> {
    const loader = new GLTFLoader()
    const envMap = options.envMap || null
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          gltf.scene.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) {
              return
            }
            if (!(child.material instanceof THREE.MeshStandardMaterial)) {
              return
            }

            child.material.envMap = envMap

            praseMaterial(child.material, options.metadata)
          })
          resolve(gltf.scene)
        },
        undefined,
        reject
      )
    })
  }

  public parse(model: THREE.Group, options: Options): void {
    const envMap = options.envMap || null
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return
      }
      if (!(child.material instanceof THREE.MeshStandardMaterial)) {
        return
      }

      if (!child.material.envMap) {
        child.material.envMap = envMap
      }

      praseMaterial(child.material, options.metadata)
    })
  }
}
