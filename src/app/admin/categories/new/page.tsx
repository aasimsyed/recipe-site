import { CategoryForm } from '@/components/admin/CategoryForm'

export default function NewCategoryPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="font-display text-3xl font-bold mb-8">
        Create New Category
      </h1>
      
      <CategoryForm mode="create" />
    </div>
  )
} 