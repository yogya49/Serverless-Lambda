import { generateUploadUrl, ValidationError } from '../../services/todosService.mjs'
import { parseUserId } from '../../auth/utils.mjs'
import { annotateTrace, addMetadataToSegment, addErrorToSegment } from '../../utils/xray.mjs'

export async function handler(event) {
  try {
    const todoId = event.pathParameters.todoId
    const userId = parseUserId(event.headers.Authorization || event.headers.authorization)
    let requestBody
    try {
      requestBody = JSON.parse(event.body || '{}')
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

    // Add X-Ray annotations
    annotateTrace({
      handler: 'generateUploadUrl',
      method: event.httpMethod,
      path: event.path,
      userId,
      todoId,
      fileType: requestBody.fileType
    })
    addMetadataToSegment('request', {
      httpMethod: event.httpMethod,
      path: event.path,
      todoId,
      fileType: requestBody.fileType
    })

    const result = await generateUploadUrl(userId, todoId, requestBody)

    addMetadataToSegment('response', {
      statusCode: 200,
      urlGenerated: true
    })

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(result)
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
