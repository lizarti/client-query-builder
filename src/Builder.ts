import { Model } from './Model';
import { Query } from './Query';
import { QueryParams } from './QueryParams';
import { SingleResponse, ArrayResponse } from './Response';
import { Dispatcher } from './Dispatcher';

export default class Builder {
  
  modelClass: typeof Model

  private url: string
  private includes = []
  private filters: { [key: string ]: string } = {}
  private searchTerm: string
  private queryParams: QueryParams = {} 

  static forModel (modelClass: typeof Model): Builder {
    let instance = new Builder()
    instance.modelClass = modelClass
    instance.url = instance.resolveBaseResourcePath(modelClass)
    return instance
  }

  static forRelationship (parent: Model, modelClass: typeof Model): Builder {
    let instance = new Builder()
    instance.modelClass = modelClass
    instance.url = `${instance.resolveInstanceEndpoint(parent)}/${modelClass.resource()}`
    return instance
  }

  constructor () {

  }

  /* builder methods */

  where (name: string, value: string): Builder {
    this.filters[name] = value
    return this
  }

  with (...includes: string[]): Builder {
    this.includes.push(...includes)
    return this
  }

  search (value: string): Builder {
    this.searchTerm = value
    return this
  }
  
  /* final methods */

  find<T extends Model> (id: string | number): Promise<SingleResponse<T>> {
    this.url = `${this.url}/${id}`
    const dispather = new Dispatcher(this, this.modelClass.httpClient())
    return this.modelClass.resolveSingleResponse(dispather.dispatch('GET'))
  }

  get<T extends Model> (): Promise<ArrayResponse<T>> {
    const dispather = new Dispatcher(this, this.modelClass.httpClient())
    return this.modelClass.resolveArrayResponse(dispather.dispatch('GET'))
  }
      
  /* accessed from Model */

  getQuery (): Query {
    let query: Query = {
      url: this.url,
      params: this.resolveQueryParams()
    }
    return query
  }  

  private resolveQueryParams (): QueryParams {    
    let queryParams: QueryParams = {}
    
    const filters = this.resolveFilters()
    const includes = this.resolveIncludes()
    const search = this.resolveSearch()

    queryParams = Object.assign(queryParams, filters, includes, search)
    
    return queryParams
  }

  private resolveInstanceEndpoint (model: Model): string {
    const basePath = this.resolveBaseResourcePath(model.getModelClass())

    if (model.hasId()) {
      return `${basePath}/${model.getPrimaryKeyValue()}`
    }
    return basePath
  }

  private resolveBaseResourcePath (modelClass: typeof Model): string {      
    return `${modelClass.baseUrl()}/${modelClass.resource()}`
  }

  /*
   * QUERY PARAMS
   */

  limit (limit: number): Builder {
    return this.setQueryParam('limit', limit.toString())
  }

  private setQueryParam (param: string, value: string): Builder {
    if (!this.queryParams) {
      this.queryParams = {}
    }
    this.queryParams[param] = value
    return this
  }

  /* queryParams resolvers */

  private resolveFilters (): QueryParams {
    const filterParamName = this.modelClass.assignedParametersNames.filter

    const filters = Object.keys(this.filters).reduce((agg, name) => {
      if (filterParamName) {
        agg[`${filterParamName}[${name}]`] = this.filters[name]
      } else {
        agg[name] = this.filters[name]
      }
      return agg
     }, {})
     return filters
  }

  private resolveIncludes (): QueryParams {
    const includeParamName = this.modelClass.assignedParametersNames.include
    if (this.includes.length) {
      return {
        [includeParamName]: Array.from(new Set(this.includes)).join(',')
      }
    }
  }

  private resolveSearch(): QueryParams {
    const searchParamName = this.modelClass.assignedParametersNames.search
    if (this.searchTerm) {
      return {
        [searchParamName]: this.searchTerm
      }
    }
  }

}
