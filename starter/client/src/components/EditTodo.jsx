import { useAuth0 } from '@auth0/auth0-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Form, Input } from 'semantic-ui-react'
import { getAttachmentUrl, getTodo, getUploadUrl, patchTodo, uploadFile } from '../api/todos-api'

const UploadState = {
  NoUpload: 'NoUpload',
  FetchingPresignedUrl: 'FetchingPresignedUrl',
  UploadingFile: 'UploadingFile'
}

export function EditTodo() {
  const [todo, setTodo] = useState(null)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(undefined)
  const [uploadState, setUploadState] = useState(UploadState.NoUpload)
  const { getAccessTokenSilently } = useAuth0()
  const { todoId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    async function loadTodo() {
      try {
        const accessToken = await getAccessTokenSilently({
          audience: 'https://dev-n1jc202horh4e1m6.us.auth0.com/api/v2/',
          scope: 'read:todos'
        })
        const loadedTodo = await getTodo(accessToken, todoId)
        setTodo(loadedTodo)
        setTitle(loadedTodo.name)
      } catch (e) {
        alert('Could not load todo: ' + e.message)
      }
    }

    loadTodo()
  }, [getAccessTokenSilently, todoId])

  function renderButton() {
    return (
      <div>
        {uploadState === UploadState.FetchingPresignedUrl && (
          <p>Preparing attachment upload</p>
        )}
        {uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button loading={uploadState !== UploadState.NoUpload} type="submit" color="teal">
          Save changes
        </Button>
      </div>
    )
  }

  function handleFileChange(event) {
    const files = event.target.files
    if (!files) return

    setFile(files[0])
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim()) {
      alert('Title cannot be empty')
      return
    }

    try {
      const accessToken = await getAccessTokenSilently({
        audience: 'https://dev-n1jc202horh4e1m6.us.auth0.com/api/v2/',
        scope: 'write:todos'
      })

      await patchTodo(accessToken, todoId, {
        name: title.trim(),
        dueDate: todo.dueDate,
        done: todo.done
      })

      if (file) {
        setUploadState(UploadState.FetchingPresignedUrl)
        const uploadUrl = await getUploadUrl(accessToken, todoId, file.type)

        setUploadState(UploadState.UploadingFile)
        await uploadFile(uploadUrl, file)
      }

      alert('Todo updated successfully')
      navigate('/')
    } catch (e) {
      alert('Could not update todo: ' + e.message)
    } finally {
      setUploadState(UploadState.NoUpload)
    }
  }

  if (!todo) {
    return <p>Loading todo...</p>
  }

  return (
    <div>
      <h1>Edit TODO</h1>

      <Form onSubmit={handleSubmit}>
        <Form.Field>
          <label>Title</label>
          <Input
            placeholder="Todo title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Form.Field>

        {todo.attachmentUrl && (
          <Form.Field>
            <label>Current attachment</label>
            <Button
              type="button"
              color="blue"
              onClick={async () => {
                try {
                  const accessToken = await getAccessTokenSilently({
                    audience: 'https://dev-n1jc202horh4e1m6.us.auth0.com/api/v2/',
                    scope: 'read:todos'
                  })
                  const url = await getAttachmentUrl(accessToken, todoId)
                  window.open(url, '_blank', 'noopener')
                } catch (e) {
                  alert('Could not open attachment: ' + e.message)
                }
              }}
            >
              View current file
            </Button>
          </Form.Field>
        )}

        <Form.Field>
          <label>Replace attachment</label>
          <input type="file" onChange={handleFileChange} />
        </Form.Field>

        {renderButton()}
      </Form>
    </div>
  )
}
