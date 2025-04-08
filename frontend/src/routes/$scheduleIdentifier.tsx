import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$scheduleIdentifier')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$scheduleIdentifier"!</div>
}
