import { assets, Metadata } from '@/parser/index'
import { AssetsUrl } from '@/parser/v1'
import { Texture, TextureLoader } from 'three'
import { ColorFactory } from './ColorFactory'

type TextureLoadedCallback = (t: Texture) => void

const textureLoading: Set<string> = new Set()
const textureStore: Map<string, Texture> = new Map()
const textureQuery: Map<string, Array<TextureLoadedCallback>> = new Map()

function clearQuery(key: string, texture: Texture) {
  textureStore.set(key, texture)
  const query = textureQuery.get(key) || []
  for (const cb of query) {
    cb(texture)
  }
}

export class TextureCenter {
  static getUrl(md: Metadata, au: AssetsUrl): string {
    if (typeof au === 'string') {
      return au
    } else {
      const n = Number('0x' + md.substr(au.offset, 2)) || 0
      const index = Math.floor((n / 256) * au.list.length)
      return au.list[index]
    }
  }

  static async fromAssetsUrl(
    md: Metadata,
    au: AssetsUrl,
    onload: TextureLoadedCallback
  ): Promise<void> {
    const url = TextureCenter.getUrl(md, au)
    const key = md + url
    const stored = textureStore.get(key)
    if (stored) {
      onload(stored)
      return
    }

    if (textureLoading.has(key)) {
      return new Promise((resolve) => {
        const query = textureQuery.get(key) || []
        query.push((t: Texture) => {
          onload(t)
          resolve()
        })
        textureQuery.set(key, query)
      })
    }

    textureLoading.add(key)

    if (/\.svg@\d+$/.test(url)) {
      let genOneColor = false,
        oneColorIndex = 0
      let svgUrl = url
      if (/^\[.+\]/.test(url)) {
        svgUrl = url.replace(/^\[.+\]/, '')
        const config = url.match(/\[(.+)\]/)
        if (config && config[1] === 'L') {
          genOneColor = true
        }
      }
      const colorGroupIndex = Number(url.match(/\.svg@(\d+)$/)?.[1]) || 0
      const oriUrl = svgUrl.replace(/@\d+$/, '')

      let svg = await fetch(assets(oriUrl)).then((res) => res.text())

      const matchColors = svg.match(/:#[0-9A-Fa-f]{3,6};/g) || []
      const colorSet: Set<string> = new Set()
      for (let i = 0; i < matchColors.length; i++) {
        colorSet.add(matchColors[i])
      }
      const colors = Array.from(colorSet.values())
      if (genOneColor) {
        const n = Number('0x' + md.substr(0, 2)) || 0
        oneColorIndex = Math.floor((n / 256) * colors.length)
      }
      for (let i = 0; i < colors.length; i++) {
        const c = colors[i]
        let newColor = '#000'
        if (!genOneColor || i === oneColorIndex) {
          newColor = ColorFactory.from(md, colorGroupIndex, i)
        }
        svg = svg.replaceAll(c, ':' + newColor + ';')
      }
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
      const blobUrl = URL.createObjectURL(blob)
      const img = new Image()
      img.src = blobUrl
      await new Promise((resolve) => {
        img.onload = resolve
      })
      const canvas = document.createElement('canvas')
      canvas.width = 2048
      canvas.height = 2048
      const context = canvas.getContext('2d')
      context?.drawImage(img, 0, 0)
      const imgBase64 = canvas.toDataURL('image/png')
      const texture = new TextureLoader().load(imgBase64)
      texture.flipY = false
      onload(texture)
      clearQuery(key, texture)
    } else {
      const texture = new TextureLoader().load(assets(url))
      texture.flipY = false
      onload(texture)
      clearQuery(key, texture)
    }
  }
}
