export interface Nutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface NutritionFactsProps {
  data: Nutrition
  className?: string
}

export function NutritionFacts({ data, className }: NutritionFactsProps) {
  return (
    <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
      <h3 className="text-xl font-bold mb-4">Nutrition Facts</h3>
      <table className="w-full">
        <tbody>
          <tr>
            <td className="py-1">Calories</td>
            <td className="py-1 text-right">{data.calories}</td>
          </tr>
          <tr>
            <td className="py-1">Protein</td>
            <td className="py-1 text-right">{data.protein}g</td>
          </tr>
          <tr>
            <td className="py-1">Carbohydrates</td>
            <td className="py-1 text-right">{data.carbs}g</td>
          </tr>
          <tr>
            <td className="py-1">Fat</td>
            <td className="py-1 text-right">{data.fat}g</td>
          </tr>
        </tbody>
      </table>
      <p className="text-sm text-gray-600 mt-4">* Percent Daily Values are based on a 2000 calorie diet</p>
    </div>
  )
} 