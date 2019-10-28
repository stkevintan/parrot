import { Context } from '../type'

interface FnContext {
  description?: string
  name: string
  url: string
  query?: string
  body?: string
  path?: string
  response?: string
}

export const parseFns = ({ buffer, interfaceDict, env }: Context) => {
  const render = (params: FnContext) => env.render('fn.njk', params)
  for (const [name, descr] of interfaceDict.entries()) {
    buffer.push(
      render({
        url: descr.url,
        name,
        description: descr.description,
        ...descr.params
      })
    )
  }
}
