# Parrot

Highly customizable tool to fetch the swagger json from yapi and convert it into ts modules with nunjunks template.

![NPM](https://img.shields.io/npm/l/@stkevintan/parrot?style=flat-square) &nbsp; ![GitHub top language](https://img.shields.io/github/languages/top/stkevintan/parrot?style=flat-square) &nbsp; ![npm (scoped)](https://img.shields.io/npm/v/@stkevintan/parrot?style=flat-square) &nbsp; ![David](https://img.shields.io/david/stkevintan/parrot?style=flat-square)

## Installation

```shell
npm -D @stkevintan/parrot
```

## Usage

```ts
// yapi.ts
import {Parrot} from '@stkevintan/parrot'

const {url, headers} from 'path/to/connect-config'

const tagMapper = (tag: string) => {
  switch(tag){
    case '用户': return 'user',
    case '权限': return 'auth',
    case '部门权限': return 'auth',
    default: return 'common'
  }
}

Parrot.fromRemote(url, headers).then(parrot => parrot.convert({
  out: 'src/api.ts',
  tagMapper,
  templates: {
    // custom the header template
    header: require.resolve('./header.njk')
  }
})).then((content) => {
  console.log('the content generated is': content)
})
```

Then, you can exec this file by ts-node in bash:

```shell
ts-node -O '{"module":"commonjs"}' yapi
```

Finaly, the outfile `src/api.ts` will be generated, and you can use it as an api module like following:

```ts
//src/test.ts
import { api } from './api'

api.user.getUsers({ params: {} }).then(users => {
  console.log(users)
})
```

## API Doc

## Parrot

There are two ways to get a parrot instance:

```ts
import { Parrot } from '@stkevintan/parrot'

//Option one: (get the swagger content in some way)
const swagger = fs.readFileSync('swagger.json', { encoding: 'utf8' })
const parrot = new Parrot(swagger)

// Option two: (retrive the swagger content from remote url)
Parrot.fromRemote(url, headers).then(parrot => {
  //...
})
```

## Method

### `writeSwagger(path: string, stringify = JSON.stringify): Promise<void>`

write the swagger json into file which path indicated the location of the file and stringify function can be customized. eg: write swagger content into yaml format:

```ts
import YAML from 'yamljs'
import { Parrot } from '@stkevintan/parrot'

Parrot.fromRemote(url, headers)
  .then(parrot => {
    return parrot.writeSwagger('./swagger.yaml', YAML.stringify.bind(YAML))
  })
  .then(() => {
    console.log('done')
  })
```

### `convert(option: Option): Promise<string>`

convert swagger to ts file.
the `Option` interface's definition:

```ts
export type Part = 'header' | 'interface' | 'fn' | 'body'

export type InterfaceType = 'query' | 'path' | 'body' | 'response'

export type Method = 'get' | 'put' | 'patch' | 'post' | 'delete'

export interface Option {
  tagMapper?: (tag: string) => string | undefined
  tplRoot?: string
  templates?: {
    [key in Part]?: string
  }
  apiNameMapper?: (path: string, method: Method) => string
  interfaceNameMapper?: (apiName: string, type: InterfaceType) => string
  schemaMapper?: (schema: Schema) => Schema
  out?: string
}
```

| option              | description                                                                                                    | default                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------ |
| tagMapper           | a function that map the swagger tag to a legal variable name                                                   | `tag => 'tag' + index++` |
| tplRoot             | templates directory location, which must container the four template part: `header`, `interface`, `fn`, `body` |                          |
| templates           | custom the templates                                                                                           | {}                       |
| apiNameMapper       | map the api to a legal function name                                                                           | `path` + `method`        |
| interfaceNameMapper | generate the interface name                                                                                    | `apiName` + `type`       |
| schemaMapper        | a pipeline function to tweak the return schema before generate the return interface                            | `schema => schema`       |
| out                 | the file path to write out                                                                                     |                          |

### Template

the template is using nunjunks format, and it has been divided into four parts:

| part      | description                                                            |
| --------- | ---------------------------------------------------------------------- |
| header    | the ts file header template, provided the `HeaderContext` enviroment   |
| interface | the ts interface template, provided the `InterfaceContext` environment |
| fn        | ths ts api function template, provided the `FnContext` environment     |
| body      | ths ts main module template, provided the `BodyContext` environment    |

The context definitions:

```ts
// more type definitions can be found in source: src/type.ts
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
```

you can totally rewrite all the template by providing a custom `tplRoot` in options, or you can just replace some specific part by the `templates` options.

the default templates can be found in source: [src/templates](https://github.com/stkevintan/parrot/tree/master/src/template)
