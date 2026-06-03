import { updateTodo, ValidationError } from '../../services/todosService.mjs'
import { parseUserId } from '../../auth/utils.mjs'

export async function handler(event) {
  try {
    const todoId = event.pathParameters.todoId
    let updatedTodo
    try {
      updatedTodo = JSON.parse(event.body)
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ error: 'Invalid JSON request body' })
      }
    }
    const userId = parseUserId(event.headers.Authorization || event.headers.authorization)

    await updateTodo(userId, todoId, updatedTodo)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({})
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        statusCode: 400,
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
