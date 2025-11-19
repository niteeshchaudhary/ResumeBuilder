import React, { useState, useEffect } from 'react';

export default function NotFound() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set a timer to remove the loading state after 1 minute (60000 ms)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  const handleReload = () => {
    // Reload the page
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div style={{ height: "100vh", width: "100vw" }} className="flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500 border-solid"></div>
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <main className="grid min-h-full place-items-center bg-white px-1 py-24 sm:py-32 lg:px-1">
        <div className="text-center">
          <p className="text-base font-semibold text-indigo-600">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Page not found</h1>
          <p className="mt-6 text-base leading-7 text-gray-600">Sorry, we couldn't find the page you're looking for.</p>



          <button
            onClick={handleReload}
            className="mt-4 rounded-md bg-gray-100 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-500"
          >
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4" />
            </svg>

          </button>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Go back home
            </a>
            <a href="/support" className="text-sm font-semibold text-gray-900">
              Contact support <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
