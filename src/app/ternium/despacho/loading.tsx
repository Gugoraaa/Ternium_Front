export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-5 w-96 bg-slate-100 rounded animate-pulse" />
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 h-14 bg-slate-50 animate-pulse" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 px-6 py-4 border-b border-slate-50">
              <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-24 bg-slate-100 rounded animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
