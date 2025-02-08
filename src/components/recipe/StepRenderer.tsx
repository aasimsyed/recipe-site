export interface Step {
  content: string
}

export function StepRenderer({ steps }: { steps: Step[] }) {
  return (
    <div className="space-y-8">
      {steps?.map((step, index) => (
        <div 
          key={index} 
          className="flex gap-6 p-6 bg-white rounded-lg border border-neutral-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex-shrink-0">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 font-semibold">
              {index + 1}
            </span>
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-lg font-semibold text-neutral-900">
              Step {index + 1}
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              {step.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
} 