import {
  Context,
  Field,
  InterfaceType,
  ParameterHandler,
  Method
} from '../type'
import { requestMethods, isRef, getInterfaceDesc, getEnumType } from '../utils'

import {
  QueryParameter,
  BodyParameter,
  PathParameter,
  Schema
} from 'swagger-schema-official'

export const renderInterfaces = ({
  swagger,
  options,
  buffer,
  fns,
  renders
}: Context) => {
  for (const [pathname, path] of Object.entries(swagger.paths)) {
    for (const key of Object.keys(path)) {
      if (requestMethods.includes(key as any)) {
        const method = key as Method
        const apiName = options.apiNameMapper(pathname, method)
        const op = path[method]!
        const interfaceDesc = fns.get(apiName) || {
          description: getInterfaceDesc(op),
          tags: op.tags || [],
          method,
          url: pathname,
          params: {}
        }
        const getName = (type: InterfaceType) => {
          return (interfaceDesc.params[type] = options.interfaceNameMapper(
            apiName,
            type
          ))
        }

        if (op.parameters !== undefined) {
          const queries: QueryParameter[] = []
          const bodies: BodyParameter[] = []
          const paths: PathParameter[] = []
          for (const parameter of op.parameters) {
            if (isRef(parameter)) {
              // not impl
            } else if (parameter.in === 'query') {
              queries.push(parameter)
            } else if (parameter.in === 'body') {
              bodies.push(parameter)
            } else if (parameter.in === 'path') {
              paths.push(parameter)
            }
          }

          const env = { op, getName }
          const chunks = [
            queryHandler(renders.interface, queries, env),
            pathHandler(renders.interface, paths, env),
            bodyHandler(renders.interface, bodies, env)
          ]
          chunks.forEach(chunk => chunk !== undefined && buffer.push(chunk))
        }
        // response type
        const res = op.responses['200']
        if (isRef(res)) {
          // not impl
        } else if (res.schema) {
          const schema = options.schemaMapper(res.schema)
          buffer.push(
            renders.interface({
              name: getName('response'),
              field: schema2Field(schema)
            })
          )
        }
        fns.set(apiName, interfaceDesc)
      }
    }
  }
}

// query
const queryHandler: ParameterHandler<QueryParameter> = (
  render,
  queries,
  { op, getName }
) => {
  const properties: Field[] = queries
    .map(query => {
      const { description, name, required, type } = query
      // const name = getFieldName(query)
      //Notice: swagger from yapi's query should only has type string without enum
      if (type === 'string') {
        return <Field>{ name, required, type: 'string', description }
      }
      return undefined
    })
    .filter((x): x is Field => x !== undefined)

  return properties.length
    ? render({
        name: getName('query'),
        description: getInterfaceDesc(op),
        field: { name: 'root', type: 'object', properties }
      })
    : undefined
}

// param
// https://github.com/YMFE/yapi/blob/master/exts/yapi-plugin-export-swagger2-data/controller.js#L177
const pathHandler: ParameterHandler<PathParameter> = (
  render,
  paths,
  { op, getName }
) => {
  const properties = paths
    .map(path => {
      const { type, name, required, description } = path
      if (type === 'string') {
        // only string
        return <Field>{ name, required, type: 'string', description }
      }
      return undefined
    })
    .filter((x): x is Field => x !== undefined)

  return properties.length
    ? render({
        name: getName('path'),
        description: getInterfaceDesc(op),
        field: { name: 'root', type: 'object', properties }
      })
    : undefined
}

// body
const bodyHandler: ParameterHandler<BodyParameter> = (
  render,
  bodies,
  { op, getName }
) => {
  // bodies only parser the first one.
  if (bodies[0] === undefined || bodies[0].schema === undefined)
    return undefined
  const name = getName('body')
  const description = getInterfaceDesc(op)
  const schema = bodies[0].schema

  return render({
    name,
    description,
    field: schema2Field(schema)
  })
}

const schema2Field = (schema: Schema, name: string = 'root'): Field => {
  const { description } = schema
  if (schema.type === 'object') {
    const { properties = {}, required = [] } = schema
    return {
      name,
      description,
      type: 'object',
      properties: Object.keys(properties).map(name => {
        const schema = schema2Field(properties[name], name)
        schema.required = required.includes(name)
        return schema
      })
    }
  }
  if (schema.type === 'array') {
    return {
      name,
      description,
      type: 'array',
      // yapi cannot generate oneof
      items: schema2Field(schema.items as Schema)
    }
  }

  const enumType = getEnumType(schema)
  if (enumType !== undefined) return { name, type: enumType, description }
  const type: string | undefined =
    schema.type === 'integer' ? 'number' : schema.type
  return { name, type: type || 'unknown', description }
}
