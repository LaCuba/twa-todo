<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTodoStore } from '@/stores/todo'
import BaseButton from '../components/BaseButton.vue';

const store = useTodoStore()
const newTodo = ref('')
const editingId = ref<string | null>(null)
const editText = ref('')

function addTodo() {
  if (newTodo.value.trim()) {
    store.add(newTodo.value)
    newTodo.value = ''
  }
}

function startEdit(todo: { id: string; title: string }) {
  editingId.value = todo.id
  editText.value = todo.title
}

function saveEdit(id: string) {
  if (editText.value.trim()) {
    store.update(id, editText.value)
  }
  editingId.value = null
  editText.value = ''
}


function handleAlertTgInfo() {
  const tg = window?.Telegram?.WebApp;
  alert(JSON.stringify(tg?.initDataUnsafe?.user))
}

onMounted(() => store.load())
</script>

<template>
  <div class="min-h-full bg-gray-900 text-white p-6">
    <h1 class="text-3xl font-bold mb-6">📝 My Tasks</h1>
    <div class="flex mb-6">
      <BaseButton @click="handleAlertTgInfo()">User info</BaseButton>
    </div>
    <form @submit.prevent="addTodo" class="flex mb-6">
      <input v-model="newTodo" class="flex-1 p-3 rounded-l bg-gray-800 text-white border border-gray-700"
        placeholder="New task..." />
      <button class="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-r">Add</button>
    </form>

    <ul class="space-y-3">
      <li v-for="todo in store.todos" :key="todo.id"
        class="flex items-center justify-between bg-gray-800 p-4 rounded-xl shadow">
        <div class="flex items-center space-x-3 w-full cursor-pointer">
          <input type="checkbox" :value="todo.done" @change="store.toggle(todo.id)"
            class="accent-blue-500 cursor-pointer" />
          <div v-if="editingId === todo.id" class="flex-1">
            <input v-model="editText" @keydown.enter.prevent="saveEdit(todo.id)" @blur="saveEdit(todo.id)"
              class="w-full bg-gray-700 text-white p-2 rounded" autofocus />
          </div>
          <span v-else class="flex-1 cursor-pointer" :class="{ 'line-through text-gray-500': todo.done }"
            @dblclick="startEdit(todo)">
            {{ todo.title }}
          </span>
          <button @click="store.remove(todo.id)" class="text-red-400 hover:text-red-300 ml-3 cursor-pointer">
            ✕
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
