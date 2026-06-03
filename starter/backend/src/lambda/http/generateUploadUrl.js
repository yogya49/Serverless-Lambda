import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { db, todosTable } from '../../dataLayer/dynamoDb.mjs'
import { parseUserId } from '../../auth/utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { captureAWSClient, annotateTrace } from '../../utils/xray.mjs'

const s3Client = captureAWSClient(new S3Client({}))
const bucketName = process.env.ATTACHMENTS_BUCKET
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION || 300)

export async function handler(event) {
  try {
    const todoId = event.pathParameters.todoId
    const userId = parseUserId(
      event.headers.Authorization || event.headers.authorization
    )
    annotateTrace({ operation: 'GenerateUploadUrl', userId, todoId })
    logger.info('Generating upload URL', { userId, todoId })

    const { fileType } = JSON.parse(event.body || '{}')

    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: todoId,
      ...(fileType ? { ContentType: fileType } : {})
    })

    const uploadUrl = await getSignedUrl(
      s3Client,
      putCommand,
      { expiresIn: urlExpiration }
    )

    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

    await db.send(
      new UpdateCommand({
        TableName: todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      })
    )

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: error.message
      })
    }
  }
}