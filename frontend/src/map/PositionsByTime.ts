import { ILatLon } from 'components/genmodel'

import sortBy from 'lodash/sortBy'

export class PositionsByTime {
  strTimePoss: { [key: string]: StrTimePos }

  constructor() {
    this.strTimePoss = {}
  }

  set(strid: string, timeMs: number, position: ILatLon) {
    let strTimePos = this.strTimePoss[strid]
    if (!strTimePos) {
      strTimePos = new StrTimePos()
      this.strTimePoss[strid] = strTimePos
    }
    strTimePos.push(new TimePos(timeMs, position))
  }

  get(strid: string, timeMs: number): ILatLon | undefined {
    const stp = this.strTimePoss[strid]
    if (!stp) {
      return undefined
    }
    const list = stp.sort()
    let ii = 0
    let mid = 0
    let break_ = false
    let kk = list.length - 1
    while (ii < kk && !break_) {
      mid = Math.floor((ii + kk) / 2)
      const mid_timeMs = list[mid].timeMs
      if (timeMs < mid_timeMs) {
        kk = mid
      } else if (timeMs > mid_timeMs) {
        ii = mid + 1
      } else break_ = true
    }
    // TODO: revise the above to avoid the following special handling,
    // which for now solves the issue of returning the position
    // of list(list.size - 2) instead of list(list.size - 1):
    if (mid >= list.length - 2 && timeMs >= list[list.length - 1].timeMs)
      return list[list.length - 1].position
    else return list[mid].position
  }

  reset(strid: string) {
    delete this.strTimePoss[strid]
  }

  resetAll() {
    this.strTimePoss = {}
  }
}

export const positionsByTime = new PositionsByTime()

class TimePos {
  constructor(public timeMs: number, public position: ILatLon) {}
}

class StrTimePos {
  list: TimePos[]
  sorted: boolean

  constructor() {
    this.list = []
    this.sorted = false
  }

  push(tp: TimePos) {
    this.sorted = false
    this.list.splice(0, 0, tp)
  }

  sort() {
    if (!this.sorted) {
      this.list = sortBy(this.list, (tp) => tp.timeMs)
      this.sorted = true
    }
    return this.list
  }
}
