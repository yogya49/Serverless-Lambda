import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { db, todosTable } from '../../dataLayer/dynamoDb.mjs'
import { parseUserId } from '../../auth/utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { annotateTrace } from '../../utils/xray.mjs'

const logger = createLogger('getTodo')

export async function handler(event) {
  const todoId = event.pathParameters.todoId
  const userId = parseUserId(event.headers.Authorization || event.headers.authorization)
  annotateTrace({ operation: 'GetTodo', userId, todoId })
  logger.info('Retrieving todo', { userId, todoId })

  const result = await db.send(new GetCommand({
    TableName: todosTable,
    Key: {
      userId,
      todoId
    }
  }))

  if (!result.Item) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: 'Todo not found' })
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ item: result.Item })
  }
}
