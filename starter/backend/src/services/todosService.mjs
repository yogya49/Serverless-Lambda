import { randomUUID } from 'crypto'
import { createTodoModel } from '../models/Todo.mjs'
import * as todosAccess from '../dataLayer/todosAccess.mjs'
import * as attachmentStorage from '../storage/attachmentStorage.mjs'
import { annotateTrace, addMetadataToSegment, addErrorToSegment } from '../utils/xray.mjs'
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
  try {
    const result = await todosAccess.queryTodos(userId)
    const items = result.Items || []
    
    addMetadataToSegment('todoService', {
      operation: 'listTodos',
      itemCount: items.length,
      success: true
    })
    
    logger.info('Retrieved todos', { userId, count: items.length })
    return items
  } catch (error) {
    addErrorToSegment(error)
    logger.error('Failed to list todos', { userId, error: error.message })
    throw error
  }
}

export async function getTodoById(userId, todoId) {
  annotateTrace({ operation: 'GetTodo', userId, todoId })
  try {
    const item = await todosAccess.getTodo(userId, todoId)
    if (!item) {
      const error = new NotFoundError('Todo not found')
      addErrorToSegment(error)
      logger.warn('Todo not found', { userId, todoId })
      throw error
    }
    
    addMetadataToSegment('todoService', {
      operation: 'getTodoById',
      found: true,
      success: true
    })
    
    logger.info('Retrieved todo', { userId, todoId })
    return item
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      addErrorToSegment(error)
      logger.error('Failed to get todo', { userId, todoId, error: error.message })
    }
    throw error
  }
}

export async function createTodo(userId, todoData) {
  const name = todoData.name?.trim()
  if (!name) {
    const error = new ValidationError('Todo title is required')
    addErrorToSegment(error)
    throw error
  }

  if (todoData.dueDate !== undefined && typeof todoData.dueDate !== 'string') {
    const error = new ValidationError('dueDate must be a string')
    addErrorToSegment(error)
    throw error
  }

  const todoId = randomUUID()
  const item = createTodoModel({
    userId,
    todoId,
    name,
    dueDate: todoData.dueDate
  })

  annotateTrace({ operation: 'CreateTodo', userId, todoId })
  try {
    logger.info('Creating todo', { userId, todoId })
    await todosAccess.createTodo(item)
    
    addMetadataToSegment('todoService', {
      operation: 'createTodo',
      todoId,
      name,
      success: true
    })
    
    return item
  } catch (error) {
    addErrorToSegment(error)
    logger.error('Failed to create todo', { userId, todoId, error: error.message })
    throw error
  }
}

export async function updateTodo(userId, todoId, updatedTodo) {
  const name = updatedTodo.name?.trim()
  if (!name) {
    const error = new ValidationError('Todo title is required')
    addErrorToSegment(error)
    throw error
  }

  if (typeof updatedTodo.done !== 'boolean') {
    const error = new ValidationError('Todo done must be a boolean')
    addErrorToSegment(error)
    throw error
  }

  if (updatedTodo.dueDate !== undefined && typeof updatedTodo.dueDate !== 'string') {
    const error = new ValidationError('dueDate must be a string')
    addErrorToSegment(error)
    throw error
  }

  annotateTrace({ operation: 'UpdateTodo', userId, todoId })
  try {
    logger.info('Updating todo', { userId, todoId })
    await todosAccess.updateTodoData(userId, todoId, {
      name,
      dueDate: updatedTodo.dueDate,
      done: updatedTodo.done
    })
    
    addMetadataToSegment('todoService', {
      operation: 'updateTodo',
      todoId,
      updatedFields: ['name', 'dueDate', 'done'],
      success: true
    })
  } catch (error) {
    addErrorToSegment(error)
    logger.error('Failed to update todo', { userId, todoId, error: error.message })
    throw error
  }
}

export async function deleteTodo(userId, todoId) {
  annotateTrace({ operation: 'DeleteTodo', userId, todoId })
  try {
    logger.info('Deleting todo', { userId, todoId })
    await todosAccess.deleteTodo(userId, todoId)
    
    addMetadataToSegment('todoService', {
      operation: 'deleteTodo',
      todoId,
      success: true
    })
  } catch (error) {
    addErrorToSegment(error)
    logger.error('Failed to delete todo', { userId, todoId, error: error.message })
    throw error
  }
}

export async function generateUploadUrl(userId, todoId, requestBody) {
  const fileType = requestBody.fileType?.trim()
  if (!fileType) {
    const error = new ValidationError('fileType is required')
    addErrorToSegment(error)
    throw error
  }

  annotateTrace({ operation: 'GenerateUploadUrl', userId, todoId, fileType })
  try {
    logger.info('Generating upload URL', { userId, todoId, fileType })
    const { uploadUrl, attachmentUrl } = await attachmentStorage.generateUploadUrl(
      todoId,
      fileType
    )

    await todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl)
    
    addMetadataToSegment('todoService', {
      operation: 'generateUploadUrl',
      todoId,
      fileType,
      success: true
    })
    
    return { uploadUrl }
  } catch (error) {
    addErrorToSegment(error)
    logger.error('Failed to generate upload URL', { userId, todoId, error: error.message })
    throw error
  }
}

export async function getAttachmentUrl(userId, todoId) {
  annotateTrace({ operation: 'GetAttachmentUrl', userId, todoId })
  try {
    logger.info('Retrieving attachment URL', { userId, todoId })

    const todo = await todosAccess.getTodo(userId, todoId)
    if (!todo || !todo.attachmentUrl) {
      const error = new NotFoundError('Attachment not found')
      addErrorToSegment(error)
      throw error
    }

    const url = attachmentStorage.generateDownloadUrl(todoId)
    
    addMetadataToSegment('todoService', {
      operation: 'getAttachmentUrl',
      todoId,
      found: true,
      success: true
    })
    
    return url
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      addErrorToSegment(error)
      logger.error('Failed to get attachment URL', { userId, todoId, error: error.message })
    }
    throw error
  }
}

export { ValidationError, NotFoundError }
