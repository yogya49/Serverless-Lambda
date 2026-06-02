import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})

export const db = DynamoDBDocumentClient.from(client)
export const todosTable = process.env.TODOS_TABLE