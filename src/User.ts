import { BaseModel } from "./BaseModel"
import { Post } from "./Post"
import { QueryParamsConfig } from "./Model"

export class User extends BaseModel {
  
  id: number
  
  static resource () {
    return 'users'
  }

  static queryParametersNames: QueryParamsConfig = {
    filter: null,
    include: '_embed'
  }

  $posts () {
    return this.hasMany(Post, 'userId', 'id')
  }

}
