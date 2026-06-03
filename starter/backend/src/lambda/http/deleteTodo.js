import { deleteTodo } from '../../services/todosService.mjs'
import { parseUserId } from '../../auth/utils.mjs'

export async function handler(event) {
  const todoId = event.pathParameters.todoId
  const userId = parseUserId(event.headers.Authorization || event.headers.authorization)

  await deleteTodo(userId, todoId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}
