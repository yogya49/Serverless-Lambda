const domain = process.env.REACT_APP_AUTH0_DOMAIN

export const auth0Audience =
  process.env.REACT_APP_AUTH0_AUDIENCE || `https://${domain}/api/v2/`

export const auth0Scopes = {
  read: 'read:todo',
  write: 'write:todo',
  delete: 'delete:todo'
}

export function getTokenOptions(scope) {
  return {
    audience: auth0Audience,
    scope
  }
}
