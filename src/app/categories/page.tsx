import { getCategories } from '@/lib/categories'
import Link from 'next/link'

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-neutral-800 mb-8">
        Recipe Categories
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div 
            key={category.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200"
          >
            <h2 className="text-xl font-display font-semibold text-neutral-800 mb-2">
              {category.name}
            </h2>
            <p className="text-sm text-neutral-600 mb-4">
              {category.recipes.length} recipes
            </p>
            <ul className="space-y-2">
              {category.recipes.slice(0, 3).map((recipe) => (
                <li key={recipe.id}>
                  <Link 
                    href={`/recipes/${recipe.slug}`}
                    className="text-sm text-neutral-700 hover:text-primary-500 transition-colors"
                  >
                    {recipe.title}
                  </Link>
                </li>
              ))}
            </ul>
            {category.recipes.length > 3 && (
              <div className="mt-4">
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
                >
                  View all {category.recipes.length} recipes →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 