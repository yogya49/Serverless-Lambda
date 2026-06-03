import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { db, todosTable } from '../../dataLayer/dynamoDb.mjs'
import { parseUserId } from '../../auth/utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { captureAWSClient, annotateTrace } from '../../utils/xray.mjs'

const bucketName = process.env.ATTACHMENTS_BUCKET
const s3Client = captureAWSClient(new S3Client({}))
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION || 300)

export async function handler(event) {
  try {
    const todoId = event.pathParameters.todoId
    const userId = parseUserId(
      event.headers.Authorization || event.headers.authorization
    )
    annotateTrace({ operation: 'GetAttachmentUrl', userId, todoId })
    logger.info('Retrieving attachment URL', { userId, todoId })

    const result = await db.send(
      new GetCommand({
        TableName: todosTable,
        Key: {
          userId,
          todoId
        }
      })
    )

    if (!result.Item || !result.Item.attachmentUrl) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ error: 'Attachment not found' })
      }
    }

    const attachmentUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: todoId
      }),
      { expiresIn: urlExpiration }
    )

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ attachmentUrl })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: error.message })
    }
  }
}
