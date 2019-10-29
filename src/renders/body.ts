import { Context, TagDescr } from '../type'

export const renderBody = ({
  swagger,
  options,
  buffer,
  fns: interfaceDict,
  renders
}: Context) => {
  if (swagger.tags === undefined) return

  // get the mapKey map
  const tagDict: Map<string, TagDescr> = new Map([
    ['common', { name: '公共接口', description: '公共接口', apis: [] }]
  ])

  for (const [index, tag] of swagger.tags.entries()) {
    const key: string = options.tagMapper(tag.name) || `tag${index}`
    const interfaces = [...interfaceDict.entries()]
    const tagDescr = tagDict.get(key)
    const currentApis = interfaces
      .filter(i => i[1].tags.includes(tag.name))
      .map(i => ({ name: i[0], description: i[1].description }))

    if (tagDescr) {
      const { apis, name, description } = tagDescr
      tagDescr.name = [name, tag.name].filter(v => v).join(', ')
      tagDescr.description = [description, tag.description || '']
        .filter(v => v)
        .join(', ')
      tagDescr.apis = apis.concat(
        currentApis.filter(api => !apis.some(api2 => api2.name === api.name))
      )
    } else {
      tagDict.set(key, {
        name: tag.name,
        description: tag.description || '',
        apis: currentApis
      })
    }
  }

  const body = renders.body({
    tags: [...tagDict.entries()]
  })
  buffer.push(body)
}
