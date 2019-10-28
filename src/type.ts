import { Spec, Schema } from 'swagger-schema-official'
import { Environment } from 'nunjucks'

export type ObjectOf<T> = { [key: string]: T }

export interface ArrayField extends CommonField {
  type: 'array'
  items: Field
}

export interface ObjectField extends CommonField {
  type: 'object'
  properties: Field[]
}

export interface CommonField {
  name: string
  type: string
  description?: string
  required?: boolean
}
export type Field = CommonField | ObjectField | ArrayField

export interface Option {
  tagMapper?: (tag: string) => string | undefined
  tplRoot?: string
  apiNameMapper?: (path: string, method: string) => string
  interfaceNameMapper?: (apiName: string, type: InterfaceType) => string
  schemaMapper?: (schema: Schema) => Schema
  out?: string
}

export interface InterfaceDescr {
  params: { [key in InterfaceType]?: string }
  description?: string
  tags: string[]
  url: string
}

export interface Context {
  swagger: Spec
  interfaceDict: Map<string, InterfaceDescr>
  options: Required<Option>
  buffer: string[]
  env: Environment
}

export type InterfaceType = 'query' | 'path' | 'body' | 'response'
