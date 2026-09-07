import { useEffect, useMemo, useState } from "react";

import { getSyncLogs } from "@/services/syncService";

import type { SyncLog } from "@/types/sync";

export default function SyncLogsPage() {
  const [logs, setLogs] = useState<SyncLog[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getSyncLogs();

      setLogs(data);
    } catch (error) {
      console.error(error);

      setError("CRITICAL: Không thể tải danh sách Sync Logs từ hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const keyword = search.toLowerCase();

      const sourceName =
        typeof log.source === "object" && log.source !== null
          ? log.source.name
          : "";

      const username =
        typeof log.triggeredBy === "object" && log.triggeredBy !== null
          ? log.triggeredBy.username
          : "";

      const matchSearch =
        !keyword ||
        sourceName.toLowerCase().includes(keyword) ||
        username.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "ALL" ||
        log.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [logs, search, statusFilter]);

  const formatDate = (date?: string | null) => {
    if (!date) return "---";

    return new Date(date).toISOString().replace("T", " ").substring(0, 19);
  };

  const statusStyle = (status: SyncLog["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-400";

      case "failed":
        return "bg-red-500";

      default:
        return "bg-amber-400 animate-pulse";
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            
            <span className="text-[10px] uppercase tracking-widest text-neutral-500">
              MODULE mini tip
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-white">
            Synchronization Logs
          </h1>

          <p className="mt-1 text-xs text-neutral-500">
            Module mini TIP.
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={loading}
          className="border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-[11px] font-medium text-neutral-200 transition hover:bg-neutral-800 hover:text-white disabled:opacity-50"
        >
          {loading ? "SYNCING..." : "REFRESH"}
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard
          title="Total Logs"
          value={logs.length}
        />

        <SummaryCard
          title="Success"
          value={
            logs.filter((item) => item.status === "success").length
          }
          color="text-green-400"
        />

        <SummaryCard
          title="Failed"
          value={
            logs.filter((item) => item.status === "failed").length
          }
          color="text-red-400"
        />

        <SummaryCard
          title="Running"
          value={
            logs.filter((item) => item.status === "running").length
          }
          color="text-amber-400"
        />
      </div>

      {/* FILTER */}
      <div className="border border-neutral-800 bg-black p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-neutral-400">
              STRING // SOURCE OR USER
            </label>

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search source or username..."
              className="h-9 w-full border border-neutral-800 bg-neutral-950 px-3 text-xs text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-600"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-neutral-400">
              FILTER // STATUS
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-9 w-full border border-neutral-800 bg-neutral-950 px-3 text-xs text-white outline-none focus:border-neutral-600"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="success">SUCCESS</option>
              <option value="failed">FAILED</option>
              <option value="running">RUNNING</option>
            </select>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="border border-neutral-700 bg-neutral-900 p-4 text-xs text-neutral-300">
          <p>[ERROR]: {error}</p>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden border border-neutral-800 bg-black">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left text-xs">
            <thead className="border-b border-neutral-800 bg-neutral-950 text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Triggered By</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Fetched</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">New</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Duplicate</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Errors</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Started</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Finished</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-900">
              {loading && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-neutral-500"
                  >
                    <span className="animate-pulse"> FETCHING_SYNCHRONIZATION_LOGS...</span>
                  </td>
                </tr>
              )}

              {!loading && filteredLogs.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center"
                  >
                    <p className="text-neutral-400">NO LOGS FOUND</p>
                    <p className="mt-1 text-[10px] text-neutral-600">Try changing your search or filters.</p>
                  </td>
                </tr>
              )}

              {!loading &&
                filteredLogs.map((log) => (
                  <tr
                    key={log._id}
                    className="transition hover:bg-neutral-950"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {typeof log.source === "object" && log.source !== null
                        ? log.source.name
                        : "Unknown"}
                    </td>

                    <td className="px-4 py-3 text-neutral-400">
                      {typeof log.triggeredBy === "object" && log.triggeredBy !== null
                        ? log.triggeredBy.username
                        : "Unknown"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 ${statusStyle(log.status)}`}
                        />
                        <span className="font-semibold uppercase tracking-wider text-neutral-200">
                          {log.status}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-medium text-white">
                      {log.totalFetched}
                    </td>

                    <td className="px-4 py-3 font-medium text-emerald-400">
                      {log.newIOC}
                    </td>

                    <td className="px-4 py-3 font-medium text-neutral-500">
                      {log.duplicateIOC}
                    </td>

                    <td className="px-4 py-3 font-medium text-red-400">
                      {log.errorCount}
                    </td>

                    <td className="px-4 py-3 text-[11px] text-neutral-500">
                      {formatDate(log.startedAt)}
                    </td>

                    <td className="px-4 py-3 text-[11px] text-neutral-500">
                      {formatDate(log.finishedAt)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


interface SummaryCardProps {
  title: string;
  value: number;
  color?: string;
}

function SummaryCard({
  title,
  value,
  color = "text-white",
}: SummaryCardProps) {
  return (
    <div className="border border-neutral-800 bg-black p-4">
      <p className="text-[10px] uppercase tracking-wider text-neutral-500">{title}</p>

      <p className={`mt-2 text-2xl font-bold tracking-tight ${color}`}>
        {value}
      </p>
    </div>
  );
}