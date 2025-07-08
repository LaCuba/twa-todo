<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { useTodoStore } from '@/stores/todo'
import * as d3 from 'd3'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const store = useTodoStore()

const filter = ref<'all' | 'done' | 'undone'>('all')
const search = ref('')

interface Node {
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

interface Link {
  source: string
  target: string
}

let simulation: d3.Simulation<Node, Link> | null = null

const filteredNodes = computed(() => {
  return store.todos
    .filter((t) => {
      if (filter.value === 'done') return t.done
      if (filter.value === 'undone') return !t.done
      return true
    })
    .filter((t) => t.title.toLowerCase().includes(search.value.toLowerCase()))
    .map((todo) => ({
      id: todo.id,
      title: todo.title,
      done: todo.done,
    }))
})

function generateLinks(nodes: Node[]): Link[] {
  const links: Link[] = []
  for (let i = 0; i < nodes.length - 1; i++) {
    links.push({ source: nodes[i].id, target: nodes[i + 1].id })
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
        .distance(100),
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
      context.strokeStyle = 'rgba(255,255,255,0.2)'
      context.lineWidth = 1
      links.forEach((link) => {
        const s = link.source as Node
        const t = link.target as Node
        context.beginPath()
        context.moveTo(s.x!, s.y!)
        context.lineTo(t.x!, t.y!)
        context.stroke()
      })

      // nodes
      nodes.forEach((node) => {
        context.beginPath()
        context.arc(node.x!, node.y!, 18, 0, 2 * Math.PI)
        context.fillStyle = node.done ? '#6b7280' : '#38bdf8'
        context.fill()

        context.fillStyle = '#fff'
        context.font = '10px sans-serif'
        context.textAlign = 'center'
        context.fillText(node.title.slice(0, 12), node.x!, node.y! + 4)
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

  d3.select(canvas).call(zoom as any)

  // Drag nodes
  d3.select(canvas).call(
    d3
      .drag<HTMLCanvasElement, unknown>()
      .subject((event) => {
        const [x, y] = transform.invert(d3.pointer(event, canvas))
        return nodes.find((d) => Math.hypot(d.x! - x, d.y! - y) < 20) as any
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
  [() => store.todos, filter, search],
  () => {
    setupCanvasGraph()
  },
  { deep: true },
)

onUnmounted(() => {
  simulation?.stop()
})
</script>

<!-- <template>
  <canvas ref="canvasRef" class="w-full h-full bg-gray-800 rounded-xl" />
</template> -->
<template>
  <div>
    <!-- Фильтры -->
    <div class="flex flex-wrap gap-2 mb-4 items-center">
      <button
        v-for="f in ['all', 'done', 'undone']"
        :key="f"
        @click="filter.value = f"
        class="px-4 py-1 rounded-full text-sm"
        :class="{
          'bg-blue-500 text-white': filter.value === f,
          'bg-gray-700 text-gray-300': filter.value !== f,
        }"
      >
        {{ f === 'all' ? 'Все' : f === 'done' ? 'Выполнено' : 'Не выполнено' }}
      </button>
      <input
        v-model="search.value"
        placeholder="Поиск задачи..."
        class="ml-auto p-2 bg-gray-700 rounded text-white w-full sm:w-auto sm:min-w-[200px]"
      />
    </div>

    <!-- Canvas -->
    <canvas ref="canvasRef" class="w-full h-[500px] bg-gray-800 rounded-xl" />
  </div>
</template>

<style scoped>
canvas {
  display: block;
  touch-action: none;
  user-select: none;
}
</style>
