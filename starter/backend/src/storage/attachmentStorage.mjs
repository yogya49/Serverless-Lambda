import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { captureAWSClient } from '../utils/xray.mjs'

const bucketName = process.env.ATTACHMENTS_BUCKET
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION || 300)
const s3Client = captureAWSClient(new S3Client({}))

export async function generateUploadUrl(todoId, fileType) {
  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: todoId,
    ...(fileType ? { ContentType: fileType } : {})
  })

  const uploadUrl = await getSignedUrl(s3Client, putCommand, {
    expiresIn: urlExpiration
  })

  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
  return { uploadUrl, attachmentUrl }
}

export async function generateDownloadUrl(todoId) {
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: bucketName,
      Key: todoId
    }),
    { expiresIn: urlExpiration }
  )
}
