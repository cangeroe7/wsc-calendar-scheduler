import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/$facultyIdentifier/$eventIdentifier/_authenticated/$appointmentDatetime',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
     SHOULD ONLY SHOW WHEN AUTHENTICATED
    </div>
  )
}
