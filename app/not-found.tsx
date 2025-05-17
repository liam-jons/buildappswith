export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">404</h2>
        <p className="text-xl text-gray-600 mb-4">Page not found</p>
        <a href="/" className="text-blue-500 hover:underline">
          Go back home
        </a>
      </div>
    </div>
  );
}