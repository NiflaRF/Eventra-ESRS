
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mb-8">
          <div className="eventra-gradient bg-clip-text text-transparent text-6xl font-bold mb-4">
            404
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="eventra-card p-8 max-w-md mx-auto">
          <div className="space-y-4">
            <Link
              to="/"
              className="w-full eventra-button-primary flex items-center justify-center"
            >
              <Home size={20} className="mr-2" />
              Return to Dashboard
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full eventra-button-secondary flex items-center justify-center"
            >
              <ArrowLeft size={20} className="mr-2" />
              Go Back
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>If you believe this is an error, please contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
