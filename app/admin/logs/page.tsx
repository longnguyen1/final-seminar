import { prisma } from "@/lib/prisma";

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  detail: string;
  createdAt: string | Date;
}

export default async function LogsPage() {
  const rawLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const logs: AuditLog[] = rawLogs.map(log => ({
    ...log,
    entityId: String(log.entityId),
    detail: log.detail ?? "",
    createdAt: log.createdAt instanceof Date ? log.createdAt : new Date(log.createdAt),
  }));

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Audit Logs</h1>
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th>User</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Entity ID</th>
            <th>Detail</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} className="border-b">
              <td>{log.userId}</td>
              <td>{log.action}</td>
              <td>{log.entity}</td>
              <td>{log.entityId}</td>
              <td>{log.detail}</td>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
