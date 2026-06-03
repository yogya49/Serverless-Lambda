import { randomUUID } from 'crypto'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { db, todosTable } from '../../dataLayer/dynamoDb.mjs'
import { parseUserId } from '../../auth/utils.mjs'
import { createTodoModel } from '../../models/Todo.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { annotateTrace } from '../../utils/xray.mjs'

const logger = createLogger('createTodo')

export async function handler(event) {
  const newTodo = JSON.parse(event.body)
  const userId = parseUserId(event.headers.Authorization || event.headers.authorization)

  const trimmedName = newTodo.name?.trim()
  if (!trimmedName) {
    logger.info('Validation failed for createTodo', { userId })
    annotateTrace({ operation: 'CreateTodo', userId, validation: 'missing-name' })
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
  annotateTrace({ operation: 'CreateTodo', userId, todoId })
  logger.info('Creating todo', { userId, todoId })

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