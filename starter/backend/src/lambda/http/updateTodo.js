import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { db, todosTable } from '../../dataLayer/dynamoDb.mjs'
import { parseUserId } from '../../auth/utils.mjs'

export async function handler(event) {
  const todoId = event.pathParameters.todoId
  const updatedTodo = JSON.parse(event.body)
  const userId = parseUserId(event.headers.Authorization || event.headers.authorization)

  const trimmedName = updatedTodo.name?.trim()
  if (!trimmedName) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: 'Todo title is required' })
    }
  }

  await db.send(new UpdateCommand({
    TableName: todosTable,
    Key: {
      userId,
      todoId
    },
    UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
    ExpressionAttributeNames: {
      '#name': 'name'
    },
    ExpressionAttributeValues: {
      ':name': trimmedName,
      ':dueDate': updatedTodo.dueDate,
      ':done': updatedTodo.done
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