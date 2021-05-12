import { MeshStandardMaterial } from 'three'

import { hslToRgb } from '@/lib/index'
import { Metadata, MaterialData, genNumberBetween } from './index'

enum DevMode {
  Range = 'RANGE',
}

export type RangeValue = [number, number] | number | DevMode.Range

export interface MaterialDataV1 extends MaterialData {
  color?: ColorRange
  mainColor?: { id: number }
  mapBasicColor?: ColorRange & { origin?: ImageBitmap }
  map?: boolean
}

export interface ColorRange {
  offset: number
  H: RangeValue
  S: RangeValue
  L: RangeValue
}

function _dev_RangeCtrl(label: string, onchange: (value: number) => void) {
  const container = document.querySelector('#mirror_dev')
  if (!container) {
    return
  }
  const title = document.createElement('span')
  title.innerText = label
  const value = document.createElement('span')
  value.innerText = (1).toFixed(4)
  const range = document.createElement('input')
  range.type = 'range'
  range.setAttribute('min', '0')
  range.setAttribute('max', '1')
  range.setAttribute('step', 'any')
  range.onchange = () => {
    onchange(Number(range.value))
    value.innerText = Number(range.value).toFixed(4)
  }
  const div = document.createElement('div')
  div.appendChild(title)
  div.appendChild(range)
  div.appendChild(value)
  container.appendChild(div)
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

    let h = 1,
      s = 1,
      l = 1

    const update = () => {
      m.color.setHSL(h, s, l)
    }

    if (c.H === DevMode.Range) {
      _dev_RangeCtrl('H', (v) => {
        h = v
        update()
      })
    } else {
      h = genNumberBetween(rH, c.H, 1)
    }

    if (c.S === DevMode.Range) {
      _dev_RangeCtrl('S', (v) => {
        s = v
        update()
      })
    } else {
      s = genNumberBetween(rS, c.S)
    }

    if (c.L === DevMode.Range) {
      _dev_RangeCtrl('L', (v) => {
        l = v
        update()
      })
    } else {
      l = genNumberBetween(rL, c.L)
    }

    update()
  }

  if (d.mapBasicColor && m.map) {
    const c = d.mapBasicColor
    const rH = Number('0x' + md.substr(c.offset, 2))
    const rS = Number('0x' + md.substr(c.offset + 2, 2))
    const rL = Number('0x' + md.substr(c.offset + 4, 2))

    let h = 1,
      s = 1,
      l = 1

    const update = () => {
      if (!m.map) {
        return
      }
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
    }

    if (c.H === DevMode.Range) {
      _dev_RangeCtrl('H', (v) => {
        h = v
        update()
      })
    } else {
      h = genNumberBetween(rH, c.H, 1)
    }

    if (c.S === DevMode.Range) {
      _dev_RangeCtrl('S', (v) => {
        s = v
        update()
      })
    } else {
      s = genNumberBetween(rS, c.S)
    }

    if (c.L === DevMode.Range) {
      _dev_RangeCtrl('L', (v) => {
        l = v
        update()
      })
    } else {
      l = genNumberBetween(rL, c.L)
    }

    update()
  }

  if (d.map) (window as any).m = m
}
