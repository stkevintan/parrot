# Parrot

fetch the swagger json from yapi and convert it into ts module with nunjunks template.


## Installation

```shell
npm -D @stkevintan/parrot
```

## Example

```ts
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
    header: require.resolve('./header.njk')
  }
})).then((content) => {
  console.log('the content generated is': content)
})
```