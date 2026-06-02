import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { db, todosTable } from '../../dataLayer/dynamoDb.mjs'
import { parseUserId } from '../../auth/utils.mjs'

export async function handler(event) {
  const userId = parseUserId(event.headers.Authorization || event.headers.authorization)

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