import { Context } from '../type'

export const renderFns = ({ buffer, fns, renders }: Context) => {
  for (const [name, fn] of fns.entries()) {
    buffer.push(
      renders.fn({
        url: fn.url,
        name,
        method: fn.method,
        description: fn.description,
        ...fn.params
      })
    )
  }
}
