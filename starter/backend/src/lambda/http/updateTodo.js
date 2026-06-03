import { updateTodo, ValidationError } from '../../services/todosService.mjs'
import { parseUserId } from '../../auth/utils.mjs'
import { annotateTrace, addMetadataToSegment, addErrorToSegment } from '../../utils/xray.mjs'

export async function handler(event) {
  try {
    const todoId = event.pathParameters.todoId
    let updatedTodo
    try {
      updatedTodo = JSON.parse(event.body)
    } catch (parseError) {
      addErrorToSegment(parseError)
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

    // Add X-Ray annotations
    annotateTrace({
      handler: 'updateTodo',
      method: event.httpMethod,
      path: event.path,
      userId,
      todoId
    })
    addMetadataToSegment('request', {
      httpMethod: event.httpMethod,
      path: event.path,
      todoId,
      updateFields: Object.keys(updatedTodo)
    })

    await updateTodo(userId, todoId, updatedTodo)

    addMetadataToSegment('response', {
      statusCode: 200,
      updated: true
    })

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
      addErrorToSegment(error)
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ error: error.message })
      }
    }

    addErrorToSegment(error)
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
