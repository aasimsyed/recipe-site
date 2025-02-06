interface ComponentProps {
  // Define actual props needed by the component
  title: string
}

export function SomeComponent({ title }: ComponentProps) {
  // ... component implementation
  return <div>{title}</div>
} 