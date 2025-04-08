import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/admin/availability/schedule/$scheduleId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/availability/schedules/$scheduleId"!</div>
}
