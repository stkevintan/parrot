import { Context } from '../type'

export const parseHeader = (ctx: Context) => {
  const header = ctx.env.render('header.njk', {
    generateTime: new Date().toDateString(),
    basePath: ctx.swagger.basePath
  })

  ctx.buffer.push(header)
}
