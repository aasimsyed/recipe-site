export default function SearchPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const query = searchParams?.q || ''
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{`Search Results for "${query}"`}</h1>
      {/* Add search results component */}
    </div>
  )
} 