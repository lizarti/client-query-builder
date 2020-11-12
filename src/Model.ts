import { AxiosInstance, AxiosResponse } from "axios"
import Builder from "./Builder"
import { Response, SingleResponse, ArrayResponse } from './Response'
import { Request } from './Request'
import { Query } from "./Query"
import { HasMany } from "./Relations/HasMany"
import { Relation } from "./Relations/Relation"
import { BelongsTo } from "./Relations/BelongsTo"


export interface QueryParamsConfig {
  filter?: string
  include?: string
  embed?: string
  expand?: string
  fields?: string
  search?: string

}

export interface ModelConfig {
  httpClient?: AxiosInstance
  baseUrl?: () => string
  resource: () => string
  queryParametersNames: QueryParamsConfig
} 

const defaultQueryParametersNames: QueryParamsConfig = {
  filter: 'filter',
  include: 'include',
  fields: 'fields',
  search: 'q',
  embed: 'embed',
  expand: 'expand'
}

export class Model {

  static currentBuilder: Builder = null
  static queryParametersNames: QueryParamsConfig = {}
  static primaryKey = 'id'

  builder: Builder

  fromModel: Model

  constructor (attributes?: object) {
    Object.assign(this, attributes)
    this.builder = Builder.forModel(this.getModelClass())
  }

  /* 
   * request methods
   */

  /* static */

  static find<T extends Model> (id: string | number): Promise<SingleResponse<T>> {
    
    const builder = Builder.forModel(this)

    return builder.find(id)
  }

  static get<T extends Model> (): Promise<ArrayResponse<T>> {        
        
    const builder = Builder.forModel(this)
    return builder.get()
  }

  static resolveSingleResponse<T extends Model>(axiosResponsePromise: Promise<AxiosResponse>): Promise<SingleResponse<T>> {
    return new Promise<SingleResponse<T>>((resolve, reject) => {
      axiosResponsePromise.then(axiosResponse => {
        resolve(this.buildResponse(axiosResponse) as SingleResponse<T>)
      }).catch(reject)
    })
  }

  static resolveArrayResponse<T extends Model>(axiosResponsePromise: Promise<AxiosResponse>): Promise<ArrayResponse<T>> {
    return new Promise<ArrayResponse<T>>((resolve, reject) => {
      axiosResponsePromise.then(axiosResponse => {
        resolve(this.buildResponse(axiosResponse) as ArrayResponse<T>)
      }).catch(reject)
    })
  }
  
  /* instance */

  save<T extends Model>(): Promise<Response<T>> {
    if (this.hasId()) {
      return this.update()
    } else {
      return this.create()
    }
  }
  
  create<T extends Model>(): Promise<Response<T>> {
    const request = new Request(this.getModelClass().httpClient())
    return new Promise<Response<T>>((resolve, reject) => {
      request.post(this.builder.getQuery(), this).then(axiosResponse => {
        resolve(this.getModelClass().buildResponse(axiosResponse))
      }).catch(reject)
    })
  }

  update<T extends Model>(): Promise<Response<T>> {
    const request = new Request(this.getModelClass().httpClient())
    return new Promise<Response<T>>((resolve, reject) => {
      request.put(this.builder.getQuery(), this).then(axiosResponse => {
        resolve(this.getModelClass().buildResponse(axiosResponse))
      }).catch(reject)
    })
  }

  hasId (): boolean {
    const key = this.getModelClass().getPrimaryKey()
    return this[key] !== undefined && this[key] !== null
  }

  /* builder methods */

  static where (name: string, value: string): Builder {
    return Builder.forModel(this).where(name, value)
  }

  static with (...includes: string[]): Builder {
    return Builder.forModel(this).with(...includes)
  }

  static search (value: string): Builder {
    return Builder.forModel(this).search(value)
  }

  /* utils */

  static hydrate<T extends Model> (data: object | object[]): T | Array<T> {
    if (Array.isArray(data)) {
      return data.map(item => {
        const createdModel = this.newModel(item) as T
        this.mapRelations(createdModel)

        return createdModel
      })
    }
    const createdModel = this.newModel(data) as T
    this.mapRelations(createdModel)
    return createdModel
  }

  static mapRelations<T extends Model> (data: T) {
    const relationsNames = Object.getOwnPropertyNames(this.prototype).filter(k => k.startsWith('$')).map(relation => relation.slice(1))
    Object.keys(data).forEach(key => {
      if (relationsNames.includes(key)) {
        const relation = data[`$${key}`]() as Relation
        data[key] = relation.builder.modelClass.hydrate(data[key])
      }
    })
  }

  static buildResponse<T extends Model> (axiosResponse: AxiosResponse): Response<T> {
    
    let response = {
      response: axiosResponse
    } as Response<T>

    let mapped: Response<T> = this.mapResponse(axiosResponse)
    if (mapped) {
      response.data = this.hydrate<T>(mapped.data)
      response.message = mapped.message
    } else {
      response.data = this.hydrate<T>(axiosResponse.data)
    }

    if (response.data) {
      if ((response.data as T[]).length) {
        return response
      }
      return response
    }

    return response as Response<T>
  } 

  /* config */

  static resource (): string {
    throw new Error(`The static resource method must me implemented!`)
  }
   
  static baseUrl (): string {
    throw new Error(`The static baseUrl method must me implemented!`)
  }

  static httpClient (): AxiosInstance {
    throw new Error(`The static httpClient method must me implemented with an Axios instance!`)
  }

  static mapResponse<T extends Model> (axiosResponse: AxiosResponse): Response<T> {
    return null
  }

  static getPrimaryKey (): string {
    return this.primaryKey
  }

  static get assignedParametersNames (): QueryParamsConfig {
    return Object.assign(defaultQueryParametersNames, this.queryParametersNames)
  }

  getPrimaryKeyValue (): number | string {
    if (this.hasId()) {
      const key = this.getModelClass().getPrimaryKey()
      return this[key]
    }
  }

  /* helpers */  

  getModelClass (): typeof Model {
    return this.constructor as typeof Model
  }  

  fill (attributes: object) {
    Object.assign(this, attributes)
    return this
  }

  static newModel (attributes: object) {
    const instance = new this()
    Object.assign(instance, attributes)
    return instance
  }

  /* relations */

  hasMany (relatedClass: typeof Model, foreignKey?: string, localKey?: string): HasMany<Model> {
    /* related builder */
    const builder = Builder.forRelationship(this, relatedClass)

    if (!foreignKey) {
      foreignKey = `${relatedClass.name.toLowerCase()}_${this.getModelClass().getPrimaryKey()}`
    }
    if (!localKey) {
      localKey = this.getModelClass().getPrimaryKey()
    }
    return new HasMany(builder, this, foreignKey, localKey)
  }

  belongsTo (relatedClass: typeof Model, foreignKey: string, otherKey: string): BelongsTo<Model> {
    const builder = Builder.forRelationship(this, relatedClass)

    if (!foreignKey) {
      foreignKey = `${relatedClass.name.toLowerCase()}_${this.getModelClass().getPrimaryKey()}`
    }
    if (!otherKey) {
      otherKey = this.getModelClass().getPrimaryKey()
    }
    return new BelongsTo(builder, this, foreignKey, otherKey)
  }

  associate<T extends Model> (associated: T): T {
    this.builder = Builder.forRelationship(associated, this.getModelClass())
    return this as unknown as T
  }
  /* factory */
  
  static factory (modelName: String, config: ModelConfig): typeof Model {
    
    const builtModel = function (attributes?) {
      if (attributes) {
        Object.assign(this, attributes)
      }
    }

    Object.defineProperty(builtModel, 'name', { value: modelName });

    builtModel.prototype = Object.create(this.prototype)
    builtModel.prototype.constructor = builtModel
    Object.setPrototypeOf(builtModel, this)

    /* config */
    Object.assign(builtModel, config)

    return builtModel as unknown as typeof Model
  }  

}