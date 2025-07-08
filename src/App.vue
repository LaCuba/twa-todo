<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="max-w-md w-full h-full mx-auto flex flex-col gap-3 bg-background">
    <div class="w-full h-full min-h-0 grow-1">
      <RouterView />
    </div>
    <footer class="h-[60px]">
      <nav class="flex items-center justify-center gap-10">
        <RouterLink to="/">Tasks</RouterLink>
        <RouterLink to="/graph">Graph</RouterLink>
      </nav>
    </footer>
  </div>
</template>
