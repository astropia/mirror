import * as THREE from 'three'

import { MaterialDataV1, praseMaterialV1 } from './v1'

export type Metadata = string
export interface MaterialData {
  version: number
}

export function genNumberBetween(k: number, [min, max]: [number, number], cycle = 0): number {
  if (cycle && min > max) {
    max += cycle
  }
  const r = min + ((max - min) * k) / 255
  return cycle ? r % cycle : r
}

export function praseMaterial(m: THREE.MeshStandardMaterial, md: Metadata): void {
  const data = m.userData as MaterialData
  switch (data.version) {
    case 1:
      return praseMaterialV1(m, md, data as MaterialDataV1)
    default:
      return
  }
}
