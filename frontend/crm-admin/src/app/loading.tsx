export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-10 w-10 border-3 border-primary border-t-transparent rounded-full" />
        <span className="text-gray-500">در حال بارگذاری...</span>
      </div>
    </div>
  );
}