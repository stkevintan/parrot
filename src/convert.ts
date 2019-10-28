import { Option, Context } from './type'
import {
  writeToFile,
  apiNameMapper,
  interfaceNameMapper,
  schemaMapper
} from './utils'
import { Spec } from 'swagger-schema-official'
import { parseHeader } from './parser/header'
import { parseBody } from './parser/body'
import { parseInterfaces } from './parser/interfaces'
import nunjunks from 'nunjucks'
import { parseFns } from './parser/fns'

const defaultOption = {
  tagMapper: () => undefined,
  apiNameMapper,
  tplRoot: __dirname + '/template',
  interfaceNameMapper,
  schemaMapper,
  out: ''
}

export const convert = async (swagger: Spec, options: Option) => {
  const finalOptions: Required<Option> = { ...options, ...defaultOption }
  const buffer: string[] = []

  const env = nunjunks.configure(finalOptions.tplRoot, { autoescape: false })
  const ctx: Context = {
    swagger,
    options: finalOptions,
    buffer,
    interfaceDict: new Map(),
    env
  }

  parseHeader(ctx)
  parseInterfaces(ctx)
  parseFns(ctx)
  parseBody(ctx)

  const content = buffer.join('\n')
  if (finalOptions.out) {
    await writeToFile(finalOptions.out, content)
    console.log('write done. lines: ', buffer.length)
  }
  return content
}
