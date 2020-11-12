import { Model } from './Model';
import { AxiosResponse } from 'axios';

export interface Response<T extends Model> {
  data?: T | T[]
  message?: string
  response?: AxiosResponse
}

export interface SingleResponse<T extends Model> extends Response<T> {
  data: T
}

export interface ArrayResponse<T extends Model> extends Response<T> {
  data: T[]
}