import { Context } from '../type'
export const renderHeader = (ctx: Context) => {
  const header = ctx.renders.header({
    date: new Date().toDateString(),
    basePath: ctx.swagger.basePath || '/'
  })

  ctx.writer.push(header)
}
