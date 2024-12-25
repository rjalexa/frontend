// app/article/loading.tsx
export default function ArticleLoading() {
  return (
    <div className="container mx-auto p-4">
      <div className="space-y-4">
        {/* Header placeholder */}
        <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
        
        {/* Content placeholders */}
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
        </div>
      </div>
    </div>
  );
}
