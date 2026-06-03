import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { captureAWSClient } from '../utils/xray.mjs'

const client = captureAWSClient(new DynamoDBClient({}))

export const db = DynamoDBDocumentClient.from(client)
export const todosTable = process.env.TODOS_TABLE