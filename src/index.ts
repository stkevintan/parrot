import { request } from './request'
import { writeFile } from 'fs'
import { promisify } from 'util'
import { Option, ObjectOf } from './type'
import { convert } from './convert'
import { Spec } from 'swagger-schema-official'

const write = promisify(writeFile)

export class Parrot {
  static async fromRemote(url: string, headers?: ObjectOf<string>) {
    const swagger = await request(url, headers)
    return new Parrot(swagger)
  }

  constructor(private swagger: Spec) {}

  writeSwaggerJson = async (
    path: string,
    stringify = JSON.stringify.bind(JSON)
  ) => {
    await write(path, stringify(this.swagger), { encoding: 'utf8' })
    console.log('done')
  }

  convert = (options: Option) => {
    return convert(this.swagger, options)
  }
}

export * from './type'
