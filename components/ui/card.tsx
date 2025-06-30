import { ReactNode } from "react"

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl dark:bg-gray-950 dark:border-gray-800">
      {children}
    </div>
  )
}

export function CardHeader({ children }: { children: ReactNode }) {
  return (
    <div className="px-6 pt-5 pb-2 border-b border-gray-200 dark:border-gray-800">
      {children}
    </div>
  )
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xl font-semibold leading-tight tracking-tight text-gray-900 dark:text-white">
      {children}
    </h2>
  )
}

export function CardContent({ children }: { children: ReactNode }) {
  return (
    <div className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
      {children}
    </div>
  )
}
