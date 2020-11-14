import { Post } from './Post'

Post.limit(2).offset(10).get().then(({ data: post }) => {
  console.log({ post })
})