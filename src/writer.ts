import fs from 'fs'

export class Writer {
  private out?: fs.WriteStream
  private buffer: string[]
  constructor(private path?: string) {
    this.buffer = []
    if (path) {
      this.out = fs.createWriteStream(path)
    }
  }
  push = (str?: string) => {
    if (str === undefined) return
    this.buffer.push(str)
    if (this.out) {
      this.out.write(str)
    }
  }

  valueOf = () => {
    return this.buffer.join('')
  }

  toString = () => {
    return this.valueOf()
  }

  done = () => {
    if (this.out) {
      this.out.end()
    }
  }
}
