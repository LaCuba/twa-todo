import { defineStore } from 'pinia'

export interface Todo {
  id: string
  title: string
  done: boolean
}

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [] as Todo[],
  }),
  actions: {
    add(title: string) {
      const todo: Todo = {
        id: crypto.randomUUID(),
        title,
        done: false,
      }
      this.todos.push(todo)
      this.persist()
    },
    update(id: string, newTitle: string) {
      const todo = this.todos.find((t) => t.id === id)
      if (todo) {
        todo.title = newTitle
        this.persist()
      }
    },
    toggle(id: string) {
      const todo = this.todos.find((t) => t.id === id)
      if (todo) {
        todo.done = !todo.done
        this.persist()
      }
    },
    remove(id: string) {
      this.todos = this.todos.filter((t) => t.id !== id)
      this.persist()
    },
    load() {
      const raw = localStorage.getItem('todos')
      if (raw) this.todos = JSON.parse(raw)
    },
    persist() {
      localStorage.setItem('todos', JSON.stringify(this.todos))
    },
  },
})
