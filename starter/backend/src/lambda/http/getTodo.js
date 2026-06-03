import { getTodoById, NotFoundError } from '../../services/todosService.mjs'
import { parseUserId } from '../../auth/utils.mjs'

export async function handler(event) {
  try {
    const todoId = event.pathParameters.todoId
    const userId = parseUserId(event.headers.Authorization || event.headers.authorization)
    const item = await getTodoById(userId, todoId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ item })
    }
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ error: error.message })
      }
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: error.message })
    }
  }
}
