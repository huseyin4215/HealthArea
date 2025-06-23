import React from 'react'

const LoadingSpinner = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Yükleniyor...</p>
    </div>
  )
}

export default LoadingSpinner 