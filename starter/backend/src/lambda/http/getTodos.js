import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { db, todosTable } from '../../dataLayer/dynamoDb.mjs'
import { parseUserId } from '../../auth/utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { annotateTrace } from '../../utils/xray.mjs'

const logger = createLogger('getTodos')

export async function handler(event) {
  const userId = parseUserId(event.headers.Authorization || event.headers.authorization)
  annotateTrace({ operation: 'GetTodos', userId })
  logger.info('Querying todos', { userId })

  const result = await db.send(new QueryCommand({
    TableName: todosTable,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  }))

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items: result.Items || []
    })
  }
}