import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$facultyIdentifier/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$facultyIdentifier/"!</div>
}
