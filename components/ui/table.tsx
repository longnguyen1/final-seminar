import { ReactNode } from "react"

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <th className="px-4 py-2 font-medium tracking-wide text-gray-700 uppercase dark:text-gray-300">
      {children}
    </th>
  )
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>
}

export function TableRow({ children }: { children: ReactNode }) {
  return <tr>{children}</tr>
}

export function TableCell({ children }: { children: ReactNode }) {
  return <td className="px-4 py-2">{children}</td>
}
