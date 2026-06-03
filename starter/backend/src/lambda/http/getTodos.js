import { listTodos } from '../../services/todosService.mjs'
import { parseUserId } from '../../auth/utils.mjs'
import { annotateTrace, addMetadataToSegment } from '../../utils/xray.mjs'

export async function handler(event) {
  const userId = parseUserId(event.headers.Authorization || event.headers.authorization)
  
  // Add X-Ray annotations and metadata
  annotateTrace({
    handler: 'getTodos',
    method: event.httpMethod,
    path: event.path,
    userId
  })
  addMetadataToSegment('request', {
    httpMethod: event.httpMethod,
    path: event.path,
    sourceIp: event.requestContext?.identity?.sourceIp
  })

  const items = await listTodos(userId)

  addMetadataToSegment('response', {
    itemCount: items.length,
    statusCode: 200
  })

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ items })
  }
}
