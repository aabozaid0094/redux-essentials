import { createSlice, nanoid, createAsyncThunk } from '@reduxjs/toolkit'
import { client } from '../../api/client'
// import { sub } from 'date-fns'

const initialState = {
  items: [
    // { id: '1', title: 'First Post!', content: 'Hello!', user: '', date: sub(new Date(), { minutes: 10 }).toISOString(), reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 } },
    // { id: '2', title: 'Second Post', content: 'More text', user: '', date: sub(new Date(), { minutes: 5 }).toISOString(), reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 } }
  ],
  status: 'idle',
  error: null
}

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await client.get('/fakeApi/posts')
  return response.data
})

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload
      const existingPost = state.items.find(post => post.id === postId)
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    },
    postAdded: {
      reducer(state, action) {
        state.items.push(action.payload)
      },
      prepare(title, content, userId) {
        return {
          payload: {
            id: nanoid(),
            date: new Date().toISOString(),
            reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 },
            title,
            content,
            user: userId
          }
        }
      }
    },
    postUpdated(state, action) {
      const { id, title, content, userId } = action.payload
      const existingPost = state.items.find(post => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
        existingPost.user = userId
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPosts.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Add any fetched posts to the array
        state.items = state.items.concat(action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  }
});

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

export default postsSlice.reducer;

export const selectAllPosts = state => state.posts.items

export const selectPostById = (state, postId) => state.posts.items.find(post => post.id === postId)