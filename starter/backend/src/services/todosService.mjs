import { randomUUID } from 'crypto'
import { createTodoModel } from '../models/Todo.mjs'
import * as todosAccess from '../dataLayer/todosAccess.mjs'
import * as attachmentStorage from '../storage/attachmentStorage.mjs'
import { annotateTrace } from '../utils/xray.mjs'
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('todosService')

class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export async function listTodos(userId) {
  annotateTrace({ operation: 'ListTodos', userId })
  const result = await todosAccess.queryTodos(userId)
  const items = result.Items || []
  logger.info('Retrieved todos', { userId, count: items.length })
  return items
}

export async function getTodoById(userId, todoId) {
  annotateTrace({ operation: 'GetTodo', userId, todoId })
  const item = await todosAccess.getTodo(userId, todoId)
  if (!item) {
    throw new NotFoundError('Todo not found')
  }
  logger.info('Retrieved todo', { userId, todoId })
  return item
}

export async function createTodo(userId, todoData) {
  const name = todoData.name?.trim()
  if (!name) {
    throw new ValidationError('Todo title is required')
  }

  if (todoData.dueDate !== undefined && typeof todoData.dueDate !== 'string') {
    throw new ValidationError('dueDate must be a string')
  }

  const todoId = randomUUID()
  const item = createTodoModel({
    userId,
    todoId,
    name,
    dueDate: todoData.dueDate
  })

  annotateTrace({ operation: 'CreateTodo', userId, todoId })
  logger.info('Creating todo', { userId, todoId })

  await todosAccess.createTodo(item)
  return item
}

export async function updateTodo(userId, todoId, updatedTodo) {
  const name = updatedTodo.name?.trim()
  if (!name) {
    throw new ValidationError('Todo title is required')
  }

  if (typeof updatedTodo.done !== 'boolean') {
    throw new ValidationError('Todo done must be a boolean')
  }

  if (updatedTodo.dueDate !== undefined && typeof updatedTodo.dueDate !== 'string') {
    throw new ValidationError('dueDate must be a string')
  }

  annotateTrace({ operation: 'UpdateTodo', userId, todoId })
  logger.info('Updating todo', { userId, todoId })

  await todosAccess.updateTodoData(userId, todoId, {
    name,
    dueDate: updatedTodo.dueDate,
    done: updatedTodo.done
  })
}

export async function deleteTodo(userId, todoId) {
  annotateTrace({ operation: 'DeleteTodo', userId, todoId })
  logger.info('Deleting todo', { userId, todoId })
  await todosAccess.deleteTodo(userId, todoId)
}

export async function generateUploadUrl(userId, todoId, requestBody) {
  const fileType = requestBody.fileType?.trim()
  if (!fileType) {
    throw new ValidationError('fileType is required')
  }

  annotateTrace({ operation: 'GenerateUploadUrl', userId, todoId })
  logger.info('Generating upload URL', { userId, todoId, fileType })

  const { uploadUrl, attachmentUrl } = await attachmentStorage.generateUploadUrl(
    todoId,
    fileType
  )

  await todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl)
  return { uploadUrl }
}

export async function getAttachmentUrl(userId, todoId) {
  annotateTrace({ operation: 'GetAttachmentUrl', userId, todoId })
  logger.info('Retrieving attachment URL', { userId, todoId })

  const todo = await todosAccess.getTodo(userId, todoId)
  if (!todo || !todo.attachmentUrl) {
    throw new NotFoundError('Attachment not found')
  }

  return attachmentStorage.generateDownloadUrl(todoId)
}

export { ValidationError, NotFoundError }
