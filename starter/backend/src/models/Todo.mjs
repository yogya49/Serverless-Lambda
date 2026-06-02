export function createTodoModel({
  userId,
  todoId,
  name,
  dueDate,
  done = false,
  createdAt = new Date().toISOString(),
  attachmentUrl = null
}) {
  return {
    userId,
    todoId,
    name,
    dueDate,
    done,
    createdAt,
    ...(attachmentUrl && { attachmentUrl })
  }
}