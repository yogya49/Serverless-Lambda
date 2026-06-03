import { createTodo, ValidationError } from '../../services/todosService.mjs'
import { parseUserId } from '../../auth/utils.mjs'
import { annotateTrace, addMetadataToSegment, addErrorToSegment } from '../../utils/xray.mjs'

export async function handler(event) {
  try {
    let newTodo
    try {
      newTodo = JSON.parse(event.body)
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
      handler: 'createTodo',
      method: event.httpMethod,
      path: event.path,
      userId
    })
    addMetadataToSegment('request', {
      httpMethod: event.httpMethod,
      path: event.path,
      todoName: newTodo.name,
      dueDate: newTodo.dueDate
    })

    const item = await createTodo(userId, newTodo)

    addMetadataToSegment('response', {
      statusCode: 201,
      todoId: item.todoId,
      createdTimestamp: item.createdAt
    })

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ item })
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
