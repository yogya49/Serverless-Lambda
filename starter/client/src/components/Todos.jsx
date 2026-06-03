import update from 'immutability-helper'
import React, { useEffect, useState } from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Loader
} from 'semantic-ui-react'

import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import {
  deleteTodo,
  getAttachmentUrl,
  getTodos,
  patchTodo
} from '../api/todos-api'
import { auth0Scopes, getTokenOptions } from '../authConfig'
import { NewTodoInput } from './NewTodoInput'

export function Todos() {
  function renderTodos() {
    if (loadingTodos) {
      return renderLoading()
    }

    return renderTodosList()
  }

  function renderTodosList() {
    return (
      <Grid padded>
        {todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => onTodoCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Grid.Column width={16}>
                  <Button
                    color="blue"
                    onClick={async () => {
                      try {
                        const accessToken = await getAccessTokenSilently(
                          getTokenOptions(auth0Scopes.read)
                        )
                        const url = await getAttachmentUrl(
                          accessToken,
                          todo.todoId
                        )
                        window.open(url, '_blank', 'noopener')
                      } catch (e) {
                        alert('Could not open attachment: ' + e.message)
                      }
                    }}
                  >
                    View attachment
                  </Button>
                </Grid.Column>
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  async function onTodoDelete(todoId) {
    try {
      const accessToken = await getAccessTokenSilently(
        getTokenOptions(auth0Scopes.delete)
      )
      await deleteTodo(accessToken, todoId)
      setTodos(todos.filter((todo) => todo.todoId !== todoId))
    } catch (e) {
      alert('Todo deletion failed')
    }
  }

  async function onTodoCheck(pos) {
    try {
      const todo = todos[pos]
      const accessToken = await getAccessTokenSilently(
        getTokenOptions(auth0Scopes.write)
      )
      await patchTodo(accessToken, todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      setTodos(
        update(todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      )
    } catch (e) {
      console.log('Failed to check a TODO', e)
      alert('Todo deletion failed')
    }
  }

  function onEditButtonClick(todoId) {
    navigate(`/todos/${todoId}/edit`)
  }

  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0()
  const [todos, setTodos] = useState([])
  const [loadingTodos, setLoadingTodos] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return
    }

    async function fetchTodos() {
      try {
        const accessToken = await getAccessTokenSilently(
          getTokenOptions(auth0Scopes.read)
        )
        const todos = await getTodos(accessToken)
        setTodos(todos)
      } catch (e) {
        console.log('Error getting todos', e)
        alert(`Failed to fetch todos: ${e.message}`)
      } finally {
        setLoadingTodos(false)
      }
    }

    fetchTodos()
  }, [getAccessTokenSilently, isAuthenticated, isLoading])

  return (
    <div>
      <Header as="h1">TODOs</Header>

      <NewTodoInput onNewTodo={(newTodo) => setTodos([...todos, newTodo])} />

      {renderTodos(loadingTodos, todos)}
    </div>
  )
}

function renderLoading() {
  return (
    <Grid.Row>
      <Loader indeterminate active inline="centered">
        Loading TODOs
      </Loader>
    </Grid.Row>
  )
}
