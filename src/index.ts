import { Post } from './Post'

Post.find<Post>(1).then(({ data: post }) => {
  console.log({ post })
})
