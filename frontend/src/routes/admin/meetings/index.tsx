import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/meetings/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/meetings/"!</div>
}
