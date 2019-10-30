import { Context } from '../type'

export const renderFns = ({ writer, fns, renders }: Context) => {
  for (const [name, fn] of fns.entries()) {
    writer.push(
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
