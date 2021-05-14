import { hslToRgb } from '@/lib/index'

type Byte = string
type Byte3 = string
type SineCurveParams = [number, number, number]

const TAU = 2 * Math.PI

const numberFromHashWithRange = (hash: Byte, [min, max]: [number, number]): number => {
  return (Number('0x' + hash) / 256) * (max - min) + min
}

class SineCurve {
  private A: number
  private phi: number
  private omega: number

  constructor(input: SineCurveParams) {
    this.A = input[0]
    this.phi = input[1]
    this.omega = input[2]
  }

  static fromHash(hash: Byte3): SineCurve {
    return new SineCurve([
      numberFromHashWithRange(hash.substr(0, 2), [-1, 1]), // A
      numberFromHashWithRange(hash.substr(2, 2), [1, 6]), // Phi
      numberFromHashWithRange(hash.substr(4, 2), [0, TAU]), // Omega
    ])
  }

  valueAt(x: number): number {
    return this.A * Math.sin((x + this.omega) * this.phi)
  }
}

const smoothValue = (zeroPoint: number, offset: number): number => {
  const x = offset
  return x * x * ((x + 1) * 0.25 + (0.5 - zeroPoint)) + zeroPoint
}

export class ColorFactory {
  static from(hash: string, group: number, index: number): string {
    hash = hash.substr(group) + hash.substr(0, group)

    const H0 = numberFromHashWithRange(hash.substr(0, 2), [0, 1])
    const S0 = numberFromHashWithRange(hash.substr(2, 2), [0, 1])
    const L0 = numberFromHashWithRange(hash.substr(4, 2), [0, 1])

    const deltaH = numberFromHashWithRange(hash.substr(6, 2), [0, 1])
    const scH = SineCurve.fromHash(hash.substr(8, 6))
    const scS = SineCurve.fromHash(hash.substr(14, 6))
    const scL = SineCurve.fromHash(hash.substr(20, 6))

    const n = index
    const nH = (H0 + n * deltaH + scH.valueAt(n) / 4 + 1) % 1
    const nS = smoothValue(S0, scS.valueAt(n))
    const nL = smoothValue(L0, scL.valueAt(n))

    return hslToRgb(nH, nS, nL)
  }
}
