import { MeshStandardMaterial } from 'three'

import { hslToRgb } from '@/lib/index'
import { Metadata, MaterialData, genNumberBetween } from './index'

export interface MaterialDataV1 extends MaterialData {
  color?: ColorRange
  mainColor?: { id: number }
  mapBasicColor?: ColorRange & { origin?: ImageBitmap }
}

export interface ColorRange {
  offset: number
  H: [number, number]
  S: [number, number]
  L: [number, number]
}

export function praseMaterialV1(m: MeshStandardMaterial, md: Metadata, d: MaterialDataV1): void {
  const m0 = [
    Number('0x' + md.substr(0, 4)) / 65536,
    Number('0x' + md.substr(4, 4)) / 65536,
    Number('0x' + md.substr(8, 4)) / 65536,
  ]
  const m1 = [(m0[0] + 0.33) % 1, m0[1] * 0.9, Math.min(m0[2] * 1.1, 1)]
  const m2 = [(m0[0] + 0.66) % 1, m0[1] * 0.9, m0[2]]
  const m3 = [(m0[0] + 0.28) % 1, m0[1] * 0.8, m0[2] * 0.9]
  const m4 = [(m0[0] + 0.58) % 1, m0[1] * 0.8, m0[2] * 0.8]

  const mainColor = [m0, m1, m2, m3, m4]

  if (d.mainColor) {
    const c = d.mainColor
    const color = mainColor[c.id]
    m.color.setHSL(color[0], color[1], color[2])
  }

  if (d.color) {
    const c = d.color
    const rH = Number('0x' + md.substr(c.offset, 2))
    const rS = Number('0x' + md.substr(c.offset + 2, 2))
    const rL = Number('0x' + md.substr(c.offset + 4, 2))

    const h = genNumberBetween(rH, c.H, 100) / 100
    const s = genNumberBetween(rS, c.S)
    const l = genNumberBetween(rL, c.L)

    m.color.setHSL(h, s, l)

    console.log(m)
  }

  if (d.mapBasicColor && m.map) {
    const c = d.mapBasicColor
    const rH = Number('0x' + md.substr(c.offset, 2))
    const rS = Number('0x' + md.substr(c.offset + 2, 2))
    const rL = Number('0x' + md.substr(c.offset + 4, 2))

    const h = genNumberBetween(rH, c.H, 100) / 100
    const s = genNumberBetween(rS, c.S)
    const l = genNumberBetween(rL, c.L)

    const image = c.origin || (m.map.image as ImageBitmap)
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const color = hslToRgb(h, s, l)
      ctx.fillStyle = color
      ctx.fillRect(0, 0, image.width, image.height)
      ctx.drawImage(image, 0, 0)
    }
    m.map.image = canvas
    m.map.needsUpdate = true
    c.origin = image

    console.log('hsl', h, s, l)
  }
}
