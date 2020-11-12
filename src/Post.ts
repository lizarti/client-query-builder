import { BaseModel } from "./BaseModel"
import { Comment } from "./Comment"
import { QueryParamsConfig } from "./Model"
import { User } from "./User"

export class Post extends BaseModel {
  
  id: number
  
  static resource () {
    return 'posts'
  }

  static queryParametersNames: QueryParamsConfig = {
    filter: null,
    include: '_embed'
  }

  $comments () {
    return this.hasMany(Comment, 'userId', 'id')
  }

  $user () {
    return this.belongsTo(User, 'userId', 'id')
  }

}
