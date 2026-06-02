import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { db, todosTable } from '../../dataLayer/dynamoDb.mjs'
import { parseUserId } from '../../auth/utils.mjs'

export async function handler(event) {
  const todoId = event.pathParameters.todoId
  const userId = parseUserId(event.headers.Authorization || event.headers.authorization)

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
