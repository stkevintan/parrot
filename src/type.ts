import { Spec, Schema, Operation, Parameter } from 'swagger-schema-official'
import { requestMethods } from './utils'
import { Writer } from './writer'

export type ObjectOf<T> = { [key: string]: T }

export interface TagDescr {
  name: string
  description?: string
  apis: { name: string; description?: string }[]
}

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

export interface Env {
  op: Operation
  getName: (type: InterfaceType) => string
}

export type ParameterHandler<T extends Parameter = Parameter> = (
  render: (params: InterfaceContext) => string,
  data: T[],
  env: Env
) => string | undefined

export type Method = (typeof requestMethods)[number]

export type Part = 'header' | 'interface' | 'fn' | 'body'

export interface Option {
  tagMapper?: (tag: string) => string | undefined
  tplRoot?: string
  templates?: {
    [key in Part]?: string
  }
  apiNameMapper?: (path: string, method: Method) => string
  interfaceNameMapper?: (apiName: string, type: InterfaceType) => string
  responseInterceptor?: (schema: Schema) => Schema
  out?: string
  skipBodyOfGet?: boolean
}

export interface FnDescr {
  params: { [key in InterfaceType]?: string }
  description?: string
  tags: string[]
  url: string
  method: Method
}

export interface HeaderContext {
  date: string
  basePath: string
}

export interface InterfaceContext {
  name: string
  description?: string
  field?: Field
}

export interface FnContext {
  description?: string
  name: string
  url: string
  method: string
  query?: string
  body?: string
  path?: string
  response?: string
}

export interface BodyContext {
  tags: [string, TagDescr][]
}

export interface Context {
  swagger: Spec
  renders: {
    header: (params: HeaderContext) => string
    interface: (params: InterfaceContext) => string
    fn: (params: FnContext) => string
    body: (params: BodyContext) => string
  }
  fns: Map<string, FnDescr>
  options: Required<Option>
  writer: Writer
}

export type InterfaceType = 'query' | 'path' | 'body' | 'formData' | 'response'
