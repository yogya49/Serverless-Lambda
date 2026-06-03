import { deleteTodo } from '../../services/todosService.mjs'
import { parseUserId } from '../../auth/utils.mjs'
import { annotateTrace, addMetadataToSegment, addErrorToSegment } from '../../utils/xray.mjs'

export async function handler(event) {
  try {
    const todoId = event.pathParameters.todoId
    const userId = parseUserId(event.headers.Authorization || event.headers.authorization)

    // Add X-Ray annotations
    annotateTrace({
      handler: 'deleteTodo',
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

    await deleteTodo(userId, todoId)

    addMetadataToSegment('response', {
      statusCode: 200,
      deleted: true
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
