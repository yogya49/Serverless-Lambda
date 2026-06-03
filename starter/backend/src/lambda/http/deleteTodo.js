import { DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { db, todosTable } from '../../dataLayer/dynamoDb.mjs'
import { parseUserId } from '../../auth/utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { annotateTrace } from '../../utils/xray.mjs'

const logger = createLogger('deleteTodo')

export async function handler(event) {
  const todoId = event.pathParameters.todoId
  const userId = parseUserId(event.headers.Authorization || event.headers.authorization)
  annotateTrace({ operation: 'DeleteTodo', userId, todoId })
  logger.info('Deleting todo', { userId, todoId })

  await db.send(new DeleteCommand({
    TableName: todosTable,
    Key: {
      userId,
      todoId
    }
  }))

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}