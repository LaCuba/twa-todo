<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { useTodoStore, type TodoItem } from '@/stores/todo'
import * as d3 from 'd3'

const FILTER_VALUES = {
  ALL: 'all',
  DONE: 'done',
  UNDONE: 'undone',
} as const

const canvasRef = ref<HTMLCanvasElement | null>(null)
const store = useTodoStore()

const filterStatus = ref<ValueOf<typeof FILTER_VALUES>>(FILTER_VALUES.ALL)
const search = ref<string>('')

type Node = {
  id: string
  title: string
  done: boolean
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

type Link = {
  id: string
  source: string
  target: string
  x?: number
  y?: number
}

let simulation: d3.Simulation<Node, Link> | null = null

function handleFilterStatus(todoItem: TodoItem, currentFilter: ValueOf<typeof FILTER_VALUES>) {
  switch (currentFilter) {
    case FILTER_VALUES.DONE:
      return todoItem.done
    case FILTER_VALUES.UNDONE:
      return !todoItem.done
    default:
      return true
  }
}

const filteredNodes = computed(() => {
  const searchedValue = search.value.toLowerCase()
  return store.todos.reduce((prev, todoItem) => {
    const isMatchedStatus = handleFilterStatus(todoItem, filterStatus.value)
    const isMatchedTitle = todoItem.title.includes(searchedValue)

    if (isMatchedTitle && isMatchedStatus) {
      prev.push({ ...todoItem })
    }
    return prev
  }, [] as TodoItem[])
})

function generateLinks(nodes: Node[]): Link[] {
  const links: Link[] = []
  for (let i = 0; i < nodes.length - 1; i++) {
    links.push({
      id: nodes[i].id + '-' + nodes[i + 1].id,
      source: nodes[i].id,
      target: nodes[i + 1].id,
    })
  }
  return links
}

function setupCanvasGraph() {
  const canvas = canvasRef.value
  if (!canvas) return

  const context = canvas.getContext('2d')
  if (!context) return

  const width = canvas.clientWidth
  const height = canvas.clientHeight
  canvas.width = width
  canvas.height = height

  const nodes: Node[] = filteredNodes.value
  const links: Link[] = generateLinks(nodes)

  simulation?.stop()
  simulation = d3
    .forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-250))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force(
      'link',
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(300),
    )
    .on('tick', ticked)

  let transform = d3.zoomIdentity

  // Draw function
  function ticked() {
    if (context) {
      context.save()
      context.clearRect(0, 0, width, height)
      context.translate(transform.x, transform.y)
      context.scale(transform.k, transform.k)

      // links
      context.strokeStyle = 'rgba(255,255,255,0.4)'
      context.lineWidth = 1
      links.forEach((link) => {
        const source = link.source
        const target = link.target
        context.beginPath()
        context.moveTo(source.x!, source.y!)
        context.lineTo(target.x!, target.y!)
        context.stroke()
      })

      // nodes
      nodes.forEach((node) => {
        context.beginPath()
        context.arc(node.x!, node.y!, 18, 0, 2 * Math.PI)
        context.fillStyle = node.done ? '#6b7280' : '#38bdf8'
        context.fill()

        context.fillStyle = '#fff'
        context.font = '12px sans-serif'
        context.textAlign = 'center'
        context.fillText(node.title.slice(0, 12), node.x!, node.y! + 30)
      })

      context.restore()
    }
  }

  // Zoom + pan
  const zoom = d3
    .zoom<HTMLCanvasElement, unknown>()
    .scaleExtent([0.3, 5])
    .on('zoom', (event) => {
      transform = event.transform
      ticked()
    })

  d3.select(canvas).call(zoom)

  // Drag nodes
  d3.select(canvas).call(
    d3
      .drag<HTMLCanvasElement, unknown>()
      .subject((event) => {
        const [x, y] = transform.invert(d3.pointer(event, canvas))
        return nodes.find((d) => Math.hypot(d.x! - x, d.y! - y) < 20)
      })
      .on('start', (event) => {
        if (!event.active) simulation?.alphaTarget(0.3).restart()
        event.subject.fx = event.x
        event.subject.fy = event.y
      })
      .on('drag', (event) => {
        event.subject.fx = event.x
        event.subject.fy = event.y
      })
      .on('end', (event) => {
        if (!event.active) simulation?.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
      }),
  )
}

onMounted(() => {
  store.load()
  setupCanvasGraph()
})

watch(
  [() => store.todos, filterStatus, search],
  () => {
    setupCanvasGraph()
  },
  { deep: true },
)

onUnmounted(() => {
  simulation?.stop()
})
</script>

<template>
  <div class="w-full h-full flex flex-col gap-2">
    <canvas ref="canvasRef" class="w-full h-full min-h-0 grow-1 bg-gray-800 rounded-xl" />
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-2 mb-4 items-center">
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
      </div>
      <input
        v-model="search"
        placeholder="Search task..."
        class="w-full p-2 bg-gray-700 rounded text-white sm:w-auto sm:min-w-[200px]"
      />
    </div>
  </div>
</template>

<style scoped>
canvas {
  display: block;
  touch-action: none;
  user-select: none;
}
</style>
