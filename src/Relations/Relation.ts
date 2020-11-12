import { Query } from "../Query";
import { Model } from "../Model";
import { ArrayResponse } from "../Response";
import Builder from "../Builder";

export abstract class Relation { 

  builder: Builder
  parent: Model
  pathname: string

  constructor (builder: Builder, parent: Model, pathname?: string) {
    this.builder = builder
    this.parent = parent
    this.pathname = pathname
  }

  getResourceName () {
    return this.builder.modelClass && (this.pathname || this.builder.modelClass.resource())
  }

  getQuery (): Query {
    return this.builder.getQuery()
  }

  get<T extends Model> (): Promise<ArrayResponse<T>> {
    return this.builder.get()
  }

  search (value: string): Builder {
    return this.builder.search(value)
  }

  with (...includes: string[]): Builder {
    return this.builder.with(...includes)
  }
  
}
