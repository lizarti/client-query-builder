import { AxiosResponse, AxiosInstance } from "axios"
import { Query } from "./Query"

export class Request {
  
  httpClient: AxiosInstance

  constructor (httpClient: AxiosInstance) {
    this.httpClient = httpClient
  }

  get (query: Query): Promise<AxiosResponse> {
    return this.httpClient.request({
      method: 'get',
      url: query.url,
      params: query.params
    })
  }

  post (query: Query, data: any): Promise<AxiosResponse> {
    return this.httpClient.request({
      method: 'post',
      url: query.url,
      params: query.params,
      data
    })
  }

  put (query: Query, data: any): Promise<AxiosResponse> {
    return this.httpClient.request({
      method: 'put',
      url: query.url,
      params: query.params,
      data
    })
  }
}
