import { Post } from './Post'

Post.with('comments').find<Post>(1).then(({ data: post }) => {
  console.log({ post })
})
