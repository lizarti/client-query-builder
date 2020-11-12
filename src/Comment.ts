import { BaseModel } from './BaseModel'
import { QueryParamsConfig } from './Model'
import { Post } from './Post'

export class Comment extends BaseModel {
  postId: number
  id: number
  name: string
  email: string
  body: string

  static queryParametersNames: QueryParamsConfig = {
    include: '_expand'
  }

  static resource () {
    return 'comments'
  }

  $post () {
    return this.belongsTo(Post, 'postId', 'id')
  }
}
