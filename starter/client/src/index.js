import { Auth0Provider } from '@auth0/auth0-react'
import React from 'react'
import ReactDOM from 'react-dom'
import 'semantic-ui-css/semantic.min.css'
import { auth0Audience, auth0Scopes } from './authConfig'
import App from './App'
import './index.css'

const domain = process.env.REACT_APP_AUTH0_DOMAIN
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID
const scope = `${auth0Scopes.read} ${auth0Scopes.write} ${auth0Scopes.delete}`

ReactDOM.render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    redirectUri={window.location.origin}
    audience={auth0Audience}
    scope={scope}
  >
    <App />
  </Auth0Provider>,
  document.getElementById('root')
)
