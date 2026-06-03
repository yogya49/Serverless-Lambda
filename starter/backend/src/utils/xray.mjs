import AWSXRay from 'aws-xray-sdk-core'
import https from 'https'

AWSXRay.captureHTTPsGlobal(https)

export function captureAWSClient(service) {
  return AWSXRay.captureAWSv3Client(service)
}

export function annotateTrace(metadata = {}) {
  const segment = AWSXRay.getSegment()
  if (!segment) return

  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined) {
      segment.addAnnotation(key, String(value))
    }
  })
}

export function addMetadataToSegment(namespace, metadata = {}) {
  const segment = AWSXRay.getSegment()
  if (!segment) return

  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined) {
      segment.addMetadata(key, value, namespace)
    }
  })
}

export function addErrorToSegment(error) {
  const segment = AWSXRay.getSegment()
  if (!segment) return

  if (error instanceof Error) {
    segment.addError(error)
    segment.addAnnotation('error', String(error.message))
  }
}

export function createSubsegment(name) {
  const segment = AWSXRay.getSegment()
  if (!segment) return null

  return segment.addNewSubsegment(name)
}

export function closeSubsegment(subsegment) {
  if (subsegment && !subsegment.isClosed()) {
    subsegment.close()
  }
}
