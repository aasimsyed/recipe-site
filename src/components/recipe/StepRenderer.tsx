export interface Step {
  content: string
}

export function StepRenderer({ steps }: { steps: Step[] }) {
  return (
    <div className="prose">
      {steps?.map((step, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-lg font-semibold">Step {index + 1}</h3>
          <p className="text-gray-700">{step.content}</p>
        </div>
      ))}
    </div>
  )
} 