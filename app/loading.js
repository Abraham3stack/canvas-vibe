export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-300 dark:border-gray-700"></div>
        <div className="absolute inset-0 rounded-full border-4 border-black dark:border-white border-t-transparent animate-spin"></div>
      </div>

      <p className="mt-6 text-gray-600 dark:text-gray-400">
        Loading...
      </p>
    </div>
  );
}