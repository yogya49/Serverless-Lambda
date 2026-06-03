import {
  QueryCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand
} from '@aws-sdk/lib-dynamodb'
import { db, todosTable } from './dynamoDb.mjs'

export async function queryTodos(userId) {
  return db.send(
    new QueryCommand({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
  )
}

export async function getTodo(userId, todoId) {
  const result = await db.send(
    new GetCommand({
      TableName: todosTable,
      Key: { userId, todoId }
    })
  )
  return result.Item
}

export async function createTodo(item) {
  return db.send(
    new PutCommand({
      TableName: todosTable,
      Item: item
    })
  )
}

export async function updateTodoData(userId, todoId, { name, dueDate, done }) {
  return db.send(
    new UpdateCommand({
      TableName: todosTable,
      Key: { userId, todoId },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':dueDate': dueDate,
        ':done': done
      }
    })
  )
}

export async function updateAttachmentUrl(userId, todoId, attachmentUrl) {
  return db.send(
    new UpdateCommand({
      TableName: todosTable,
      Key: { userId, todoId },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    })
  )
}

export async function deleteTodo(userId, todoId) {
  return db.send(
    new DeleteCommand({
      TableName: todosTable,
      Key: { userId, todoId }
    })
  )
}
