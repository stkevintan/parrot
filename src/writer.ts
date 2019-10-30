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

  get content() {
    return this.buffer.join('')
  }

  done = () => {
    if (this.out) {
      this.out.end()
    }
  }
}
