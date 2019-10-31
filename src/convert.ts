import { Option, Context, Part } from './type'
import {
  apiNameMapper,
  interfaceNameMapper,
  responseInterceptor
} from './utils'
import { Spec } from 'swagger-schema-official'
import { renderHeader } from './renders/header'
import { renderBody } from './renders/body'
import { renderInterfaces } from './renders/interfaces'
import nunjunks from 'nunjucks'
import { renderFns } from './renders/fns'
import fs from 'fs'
import { Writer } from './writer'

const defaultOption = {
  tagMapper: () => undefined,
  apiNameMapper,
  tplRoot: __dirname + '/template',
  templates: {},
  skipBodyOfGet: true,
  interfaceNameMapper,
  responseInterceptor,
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
          fs.readFileSync(templatePath, { encoding: 'utf8' }),
          context
        )
      : env.render(`${part}.njk`, context)
  }
}

export const convert = async (swagger: Spec, options: Option) => {
  const finalOptions: Required<Option> = { ...defaultOption, ...options }
  const writer = new Writer(options.out)

  const env = nunjunks.configure(finalOptions.tplRoot, { autoescape: false })

  const ctx: Context = {
    swagger,
    options: finalOptions,
    writer,
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

  writer.done()

  return writer.toString()
}
