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
