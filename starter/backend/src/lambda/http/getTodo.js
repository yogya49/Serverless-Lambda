import { getTodoById, NotFoundError } from '../../services/todosService.mjs'
import { parseUserId } from '../../auth/utils.mjs'
import { annotateTrace, addMetadataToSegment, addErrorToSegment } from '../../utils/xray.mjs'

export async function handler(event) {
  try {
    const todoId = event.pathParameters.todoId
    const userId = parseUserId(event.headers.Authorization || event.headers.authorization)
    
    // Add X-Ray annotations
    annotateTrace({
      handler: 'getTodo',
      method: event.httpMethod,
      path: event.path,
      userId,
      todoId
    })
    addMetadataToSegment('request', {
      httpMethod: event.httpMethod,
      path: event.path,
      todoId
    })

    const item = await getTodoById(userId, todoId)

    addMetadataToSegment('response', {
      statusCode: 200,
      itemRetrieved: true
    })

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
      addErrorToSegment(error)
      return {
        statusCode: 404,
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
