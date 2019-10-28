import { Option, Context, HeaderContext, Part } from './type'
import {
  writeToFile,
  apiNameMapper,
  interfaceNameMapper,
  schemaMapper
} from './utils'
import { Spec } from 'swagger-schema-official'
import { renderHeader } from './renders/header'
import { renderBody } from './renders/body'
import { renderInterfaces } from './renders/interfaces'
import nunjunks from 'nunjucks'
import { renderFns } from './renders/fns'
import { readFileSync } from 'fs'

const defaultOption = {
  tagMapper: () => undefined,
  apiNameMapper,
  tplRoot: __dirname + '/template',
  templates: {},
  interfaceNameMapper,
  schemaMapper,
  out: ''
}

const createRender = (
  part: Part,
  env: nunjunks.Environment,
  templates: Option['templates'] = {}
) => {
  return (context: any) => {
    const templatePath = templates[part]
    return templatePath
      ? nunjunks.renderString(
          readFileSync(templatePath, { encoding: 'utf8' }),
          context
        )
      : env.render(`${part}.njk`, context)
  }
}

export const convert = async (swagger: Spec, options: Option) => {
  const finalOptions: Required<Option> = { ...defaultOption, ...options }
  const buffer: string[] = []

  const env = nunjunks.configure(finalOptions.tplRoot, { autoescape: false })

  const ctx: Context = {
    swagger,
    options: finalOptions,
    buffer,
    fns: new Map(),
    renders: {
      header: createRender('header', env, options.templates),
      fn: createRender('fn', env, options.templates),
      body: createRender('body', env, options.templates),
      interface: createRender('interface', env, options.templates)
    }
  }

  renderHeader(ctx)
  renderInterfaces(ctx)
  renderFns(ctx)
  renderBody(ctx)

  const content = buffer.join('\n')
  if (finalOptions.out) {
    await writeToFile(finalOptions.out, content)
    console.log('write done. lines: ', buffer.length)
  }
  return content
}
