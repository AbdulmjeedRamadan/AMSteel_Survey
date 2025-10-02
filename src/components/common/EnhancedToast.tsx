import { toast as hotToast, Toaster as HotToaster } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

interface ToastOptions {
  title?: string
  description?: string
  duration?: number
}

const toast = {
  success: (message: string, options?: ToastOptions) => {
    hotToast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-fade-in' : 'animate-fade-out'
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="mr-3 flex-1 rtl:mr-0 rtl:ml-3">
                {options?.title && (
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {options.title}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={() => hotToast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ),
      { duration: options?.duration || 4000 }
    )
  },

  error: (message: string, options?: ToastOptions) => {
    hotToast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-fade-in' : 'animate-fade-out'
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <div className="mr-3 flex-1 rtl:mr-0 rtl:ml-3">
                {options?.title && (
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {options.title}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={() => hotToast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ),
      { duration: options?.duration || 4000 }
    )
  },

  warning: (message: string, options?: ToastOptions) => {
    hotToast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-fade-in' : 'animate-fade-out'
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="mr-3 flex-1 rtl:mr-0 rtl:ml-3">
                {options?.title && (
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {options.title}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={() => hotToast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ),
      { duration: options?.duration || 4000 }
    )
  },

  info: (message: string, options?: ToastOptions) => {
    hotToast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-fade-in' : 'animate-fade-out'
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Info className="h-6 w-6 text-blue-500" />
              </div>
              <div className="mr-3 flex-1 rtl:mr-0 rtl:ml-3">
                {options?.title && (
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {options.title}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={() => hotToast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ),
      { duration: options?.duration || 4000 }
    )
  },
}

export { toast }
export { HotToaster as Toaster }
