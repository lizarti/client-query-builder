import { Model } from "../Model"
import { Relation } from "./Relation"
import Builder from "../Builder"

export class HasMany<T extends Model> extends Relation {
  
  foreignKey: string
  localKey: string
  pathName: string

  constructor (builder: Builder, parent: T, foreignKey: string, localKey: string, pathName?: string) {
    super(builder, parent, pathName)
    this.foreignKey = foreignKey
    this.localKey = localKey
  }  

}
