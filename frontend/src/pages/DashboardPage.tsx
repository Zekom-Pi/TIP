import { useEffect, useState } from "react";
import { getDashboardStats } from "@/services/dashboardService";
import { syncSources } from "@/services/syncService";
import type { DashboardResponse, LatestSync } from "@/types/dashboard";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Trạng thái khi đang gọi API Sync
  const [syncing, setSyncing] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("CRITICAL: Failed to ingest telemetry data from core backend.");
    } finally {
      setLoading(false);
    }
  };

  
  //Xử lý gọi API kích hoạt đồng bộ thủ công
  
  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      setError(null);
      
      // Gọi API trigger sync từ syncService
      await syncSources();
      
      // Sau khi sync thành công, tải lại dữ liệu dashboard để cập nhật thông tin mới nhất
      await loadDashboard();
    } catch (err: any) {
      console.error("Failed to sync sources:", err);
      setError(
        err?.response?.data?.message ||
          "CRITICAL: Không thể thực hiện đồng bộ dữ liệu."
      );
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center font-mono text-xs tracking-wider text-neutral-500">
        <span className="animate-pulse">_INITIALIZING TELEMETRY STREAM...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-neutral-700 bg-neutral-900/50 p-4 font-mono text-xs">
        <p className="text-neutral-300 font-semibold">[ERROR]: {error}</p>
        <button
          onClick={loadDashboard}
          className="mt-3 border border-neutral-600 bg-neutral-800 px-3 py-1.5 text-neutral-200 hover:bg-neutral-700"
        >
          RECONNECT
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const getIOCCount = (type: "IP" | "DOMAIN" | "URL" | "HASH") => {
    return stats.iocByType.find((item) => item._id === type)?.count ?? 0;
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Name module */}
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500">
              MODULE MINI TIP
            </span>
          </div>
        </div>

        {/* SYNC NOW */}
        <button
          onClick={handleSyncNow}
          disabled={syncing}
          className="border border-neutral-700 bg-neutral-900 px-3.5 py-1.5 text-[11px] font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {syncing ? "SYNCING..." : "SYNC NOW"}
        </button>
      </div>

      {/* percent  */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="TOTAL IOC" value={stats.totalIOC} />
        <StatCard title="IPV4 / IPV6" value={getIOCCount("IP")} />
        <StatCard title="DOMAINS" value={getIOCCount("DOMAIN")} />
        <StatCard title="HASH" value={getIOCCount("HASH")} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* IOC panel */}
        <div className="border border-neutral-800 bg-black p-5">
          <div className="mb-5 flex items-center justify-between border-b border-neutral-900 pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              TYPE
            </h2>
            <span className="text-[10px] text-neutral-500">REALTIME</span>
          </div>
          <div className="space-y-4">
            <IOCBar label="IPV4 / IPV6" value={getIOCCount("IP")} total={stats.totalIOC} />
            <IOCBar label="DOMAIN" value={getIOCCount("DOMAIN")} total={stats.totalIOC} />
            <IOCBar label="URI / URL" value={getIOCCount("URL")} total={stats.totalIOC} />
            <IOCBar label="HASH" value={getIOCCount("HASH")} total={stats.totalIOC} />
          </div>
        </div>

        {/* Source panel */}
        <div className="border border-neutral-800 bg-black p-5">
          <div className="mb-5 flex items-center justify-between border-b border-neutral-900 pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              SOURCES // STATUS
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                REGISTERED SOURCES
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-white">
                {stats.sources.total}
              </p>
            </div>
            <div className="border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                ACTIVE SOURCES
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-white">
                {stats.sources.active}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border border-neutral-800 bg-neutral-950 px-4 py-3 text-xs"></div>
        </div>
      </div>

      <div className="border border-neutral-800 bg-black p-5">
        <div className="mb-4 flex items-center justify-between border-b border-neutral-900 pb-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              LATEST LOG
            </h2>
            <p className="mt-0.5 text-[10px] text-neutral-500">
              Last sync
            </p>
          </div>
          <button
            onClick={loadDashboard}
            className="border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-[11px] font-medium text-neutral-200 transition hover:bg-neutral-800 hover:text-white"
          >
            REFRESH
          </button>
        </div>

        {stats.latestSync ? (
          <LatestSyncCard sync={stats.latestSync} />
        ) : (
          <p className="text-xs text-neutral-500">NO LOGS FOUND</p>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="border border-neutral-800 bg-black p-4">
      <span className="text-[10px] tracking-widest text-neutral-500">
        {title}
      </span>
      <p className="mt-2 text-2xl font-bold tracking-tight text-white">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

interface IOCBarProps {
  label: string;
  value: number;
  total: number;
}

function IOCBar({ label, value, total }: IOCBarProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-medium text-neutral-400">{label}</span>
        <span className="text-neutral-500">
          {value.toLocaleString()} <span className="text-neutral-600">[{percentage}%]</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden border border-neutral-800 bg-neutral-950">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface LatestSyncCardProps {
  sync: LatestSync;
}

function LatestSyncCard({ sync }: LatestSyncCardProps) {
  const isSuccess = sync.status === "success";

  return (
    <div className="border border-neutral-800 bg-neutral-950 p-4 text-xs">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div>
          <p className="text-[10px] text-neutral-500">SOURCE NAME</p>
          <p className="mt-1 font-medium text-white truncate">
            {sync.source?.name || "EXTERNAL_FEED"}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-neutral-500">STATUS</p>
          <div className="mt-1 items-center flex justify-center gap-1.5">
            <span className={`h-1.5 w-1.5 ${isSuccess ? "bg-green-400" : "bg-red-500"}`} />
            <span className="font-semibold text-neutral-200">
              {sync.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div>
          <p className="text-[10px] text-neutral-500">FETCHED COUNT</p>
          <p className="mt-1 font-semibold text-white">
            {sync.totalFetched.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-neutral-500">NEW IOC </p>
          <p className="mt-1 font-semibold text-white">
            +{sync.newIOC.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-neutral-500">DUPLICATES DROPPED</p>
          <p className="mt-1 font-semibold text-neutral-400">
            {sync.duplicateIOC.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-900 pt-3 text-[10px] text-neutral-500">
        <span>TIMESTAMP</span>
        <span>
          {new Date(sync.finishedAt || sync.createdAt).toISOString()}
        </span>
      </div>
    </div>
  );
}