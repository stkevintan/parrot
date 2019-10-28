import { readFile, writeFile } from 'fs'
import { promisify } from 'util'
import {
  BaseSchema,
  Reference,
  Operation,
  Schema
} from 'swagger-schema-official'
import { InterfaceType } from './type'

const tryRead = promisify(readFile)
const tryWrite = promisify(writeFile)

export const readFromFile = async (path: string, fail = '') => {
  try {
    return await tryRead(path, { encoding: 'utf8' })
  } catch (err) {
    return fail
  }
}

export const writeToFile = async (path: string, content: string) => {
  return await tryWrite(path, content, { encoding: 'utf8' })
}

export const requestMethods = ['get', 'post', 'patch', 'put', 'delete'] as const
export type Method = (typeof requestMethods)[number]

// helper fn
export const identity = <T>(x: T) => x
export const noop = () => {}

export function isRef(x: any): x is Reference {
  return '$ref' in x
}

// parser fn
export const getInterfaceDesc = (op: Operation) => {
  const desc = `${op.summary ||
    (op.tags === undefined ? '' : op.tags.join())} ${op.description ||
    ''}`.trim()
  return desc ? desc : undefined
}

export const getEnumType = (schema: BaseSchema) => {
  if (schema.enum === undefined) return undefined
  // uniq, sort
  let enums = [...new Set(schema.enum)]
  switch (schema.type) {
    case 'string':
      enums = (<string[]>enums).map(item => `"${item}"`)
      break

    case 'integer':
    case 'number':
      enums = (<number[]>enums).map(item => `${item}`)
      break
    case 'boolean':
      enums = (<boolean[]>enums).map(item => (item ? 'true' : 'false'))
      break
  }
  return enums.join('|')
}

export const apiNameMapper = (path: string, method: Method) => {
  const seg = path
    .replace(/(^\/)|(\/$)|[{}]/g, '')
    .replace(/[\/_-](\w)/g, (_, word: string) => word.toUpperCase())
    .replace(/^\w/, (word: string) => word.toUpperCase())
  return `${method}${seg}`
}

export const interfaceNameMapper = (apiName: string, type: InterfaceType) => {
  return `${apiName}${type.replace(/^\w/, word => word.toUpperCase())}`
}

export const schemaMapper = (schema: Schema): Schema => {
  if (schema.type !== 'object') return schema
  if (!schema.properties) return schema
  if (schema.properties.code && schema.properties.data) {
    return schema.properties.data
  }
  return schema
}
