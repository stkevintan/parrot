import axios, { AxiosResponse } from 'axios'

export const request = async (url: string, headers?: any) => {
  const res = await axios.get<void, AxiosResponse<any>>(url, {
    headers,
    validateStatus: status => status === 200
  })
  return res.data
}
