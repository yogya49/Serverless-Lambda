import { listTodos } from '../../services/todosService.mjs'
import { parseUserId } from '../../auth/utils.mjs'

export async function handler(event) {
  const userId = parseUserId(event.headers.Authorization || event.headers.authorization)
  const items = await listTodos(userId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ items })
  }
}
