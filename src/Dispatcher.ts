import { Model } from './Model'
import { Request } from './Request'
import Builder from './Builder'
import { AxiosInstance, AxiosResponse } from 'axios'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
export class Dispatcher<T extends Model> {

  builder: Builder
  httpClient: AxiosInstance
  httpMethod: HttpMethod = 'GET'

  constructor (builder: Builder, httpClient: AxiosInstance) {
    this.builder = builder
    this.httpClient = httpClient
  }

  dispatch (method: HttpMethod): Promise<AxiosResponse> {
    const request = new Request(this.httpClient)
    const query = this.builder.getQuery()

    const lowerCasedMethod = method.toLowerCase()
    return request[lowerCasedMethod](query)
  }
}