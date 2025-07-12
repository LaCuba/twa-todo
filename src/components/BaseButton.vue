<script setup lang="ts">
import { computed, defineEmits } from 'vue';

type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const props = defineProps<{
  type?: 'button' | 'submit' | 'reset';
  size?: ButtonSize;
  variant?: ButtonVariant;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-sm px-3 py-1.5';
    case 'lg':
      return 'text-lg px-5 py-3';
    default:
      return 'text-base px-4 py-2';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'bg-gray-700 text-white';
    case 'danger':
      return 'bg-red-600 text-white';
    case 'ghost':
      return 'bg-transparent border border-white text-white';
    default:
      return 'bg-blue-600 text-white';
  }
});

function handleClick(event: MouseEvent) {
  if (!props.disabled) {
    emit('click', event);
  }
}
</script>

<template>
  <button :type="type" :class="[
    'inline-flex items-center justify-center rounded-2xl px-4 py-2 font-medium transition',
    'cursor-pointer',
    sizeClasses,
    variantClasses,
    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110',
  ]" :disabled="disabled" @click="handleClick">
    <slot></slot>
  </button>
</template>


<!-- <template>
  <button
          v-for="currentStatus in Object.values(FILTER_VALUES)"
          :key="currentStatus"
          @click="filterStatus = currentStatus"
          class="px-4 py-1 rounded-full text-sm cursor-pointer"
          :class="{
            'bg-blue-500 text-white': filterStatus === currentStatus,
            'bg-gray-700 text-gray-300': filterStatus !== currentStatus,
          }"
        >
          {{ currentStatus }}
        </button>
</template> -->