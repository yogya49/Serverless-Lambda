import { randomUUID } from 'crypto'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { db, todosTable } from '../../dataLayer/dynamoDb.mjs'
import { parseUserId } from '../../auth/utils.mjs'
import { createTodoModel } from '../../models/Todo.mjs'

export async function handler(event) {
  const newTodo = JSON.parse(event.body)
  const userId = parseUserId(event.headers.Authorization || event.headers.authorization)

  const trimmedName = newTodo.name?.trim()
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

  const todoId = randomUUID()

  const item = createTodoModel({
    userId,
    todoId,
    name: trimmedName,
    dueDate: newTodo.dueDate
  })

  await db.send(new PutCommand({
    TableName: todosTable,
    Item: item
  }))

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ item })
  }
}