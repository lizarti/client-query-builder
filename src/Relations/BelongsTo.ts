import { Model } from "../Model"
import { Relation } from "./Relation"
import Builder from "../Builder"

export class BelongsTo<T extends Model> extends Relation {
  
  foreignKey: string
  otherKey: string
  pathName: string

  constructor (builder: Builder, parent: T, foreignKey: string, otherKey: string, pathName?: string) {
    super(builder, parent, pathName)
    this.foreignKey = foreignKey
    this.otherKey = otherKey
  }  

}
