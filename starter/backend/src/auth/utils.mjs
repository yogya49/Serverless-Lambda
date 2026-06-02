import jsonwebtoken from 'jsonwebtoken'

export function parseUserId(authHeader) {
  const token = authHeader.split(' ')[1]
  const decodedJwt = jsonwebtoken.decode(token)
  return decodedJwt.sub
}