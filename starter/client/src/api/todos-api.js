import Axios from 'axios'

export async function getTodos(idToken) {
  console.log('Fetching todos')

  const response = await Axios.get(
    `${process.env.REACT_APP_API_ENDPOINT}/todos`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  console.log('Todos:', response.data)
  return response.data.items
}

export async function getTodo(idToken, todoId) {
  const response = await Axios.get(
    `${process.env.REACT_APP_API_ENDPOINT}/todos/${todoId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  return response.data.item
}

export async function createTodo(idToken, newTodo) {
  const response = await Axios.post(
    `${process.env.REACT_APP_API_ENDPOINT}/todos`,
    JSON.stringify(newTodo),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  return response.data.item
}

export async function patchTodo(idToken, todoId, updatedTodo) {
  await Axios.patch(
    `${process.env.REACT_APP_API_ENDPOINT}/todos/${todoId}`,
    JSON.stringify(updatedTodo),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
}

export async function deleteTodo(idToken, todoId) {
  await Axios.delete(`${process.env.REACT_APP_API_ENDPOINT}/todos/${todoId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(idToken, todoId, fileType) {
  const response = await Axios.post(
    `${process.env.REACT_APP_API_ENDPOINT}/todos/${todoId}/attachment`,
    JSON.stringify({ fileType }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl, file) {
  await Axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type
    }
  })
}

export async function getAttachmentUrl(idToken, todoId) {
  const response = await Axios.get(
    `${process.env.REACT_APP_API_ENDPOINT}/todos/${todoId}/attachment`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  return response.data.attachmentUrl
}
