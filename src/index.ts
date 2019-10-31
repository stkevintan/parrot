import { request } from './request'
import { writeFile } from 'fs'
import { promisify } from 'util'
import { Option, ObjectOf } from './type'
import { convert } from './convert'
import { Spec } from 'swagger-schema-official'

const write = promisify(writeFile)

export class Parrot {
  static async fromHTTP(url: string, headers?: ObjectOf<string>) {
    const swagger = await request(url, headers)
    return new Parrot(swagger)
  }

  constructor(private swagger: Spec) {}

  writeSwagger = async (
    path: string,
    options: {
      stringify?: (value: any) => string
      encoding?: string | null | undefined
      mode?: string | number | undefined
      flag?: string | undefined
    } = {}
  ) => {
    const stringify =
      typeof options.stringify === 'function'
        ? options.stringify
        : JSON.stringify.bind(JSON)
    await write(path, stringify(this.swagger), options)
  }

  convert = (options: Option) => {
    return convert(this.swagger, options)
  }
}

export * from './type'
