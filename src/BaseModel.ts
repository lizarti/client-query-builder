import { Model } from './Model';
import axios, { AxiosInstance } from "axios";

let baseUrl = 'https://jsonplaceholder.typicode.com'
let axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

export class BaseModel extends Model {

  static httpClient (): AxiosInstance {
    return axiosInstance 
  }

  static baseUrl (): string {
    return baseUrl
  }
}
