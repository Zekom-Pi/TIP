import { useEffect, useMemo, useState } from "react";
import { getIOCs, createIOC, updateIOC, deleteIOC } from "@/services/iocService";
import { getSources } from "@/services/sourceService";
import type { IOC, CreateIOCRequest, UpdateIOCRequest } from "@/types/ioc";

export default function IOCPage() {
  const [iocs, setIocs] = useState<IOC[]>([]);
  const [sources, setSources] = useState<any[]>([]); // Khai báo state lưu danh sách source
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  //page ioc
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // crud ioc
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIOC, setEditingIOC] = useState<IOC | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formValue, setFormValue] = useState("");
  const [formType, setFormType] = useState<"IP" | "DOMAIN" | "URL" | "HASH">("IP");
  const [formSeverity, setFormSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [formDescription, setFormDescription] = useState("");
  const [formSource, setFormSource] = useState("MANUAL");

  //load ioc & source
  const loadIOCs = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getIOCs();
      setIocs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load IOC:", err);
      setError("CRITICAL: Không thể tải danh sách IOC từ hệ thống.");
    } finally {
      setLoading(false);
    }
  };

 const loadSources = async () => {
    try {
      const data: any = await getSources(); // Thêm ép kiểu : any ở đây
      const rawList = Array.isArray(data) ? data : (data?.sources || []);
      
      // Lọc ra các source đang được enable/active
      const activeSources = rawList.filter((s: any) => 
        s.status === "active" || s.enabled === true || s.isEnabled === true || s.status === "ENABLED"
      );
      
      setSources(activeSources.length > 0 ? activeSources : rawList);
    } catch (err) {
      console.error("Failed to load sources:", err);
    }
  };

  useEffect(() => {
    loadIOCs();
    loadSources();
  }, []);

  //bảng crud ioc 
  const openCreateModal = () => {
    setEditingIOC(null);
    setFormValue("");
    setFormType("IP");
    setFormSeverity("medium");
    setFormDescription("");
    setFormSource(sources.length > 0 ? (sources[0]._id || sources[0].id || sources[0].name) : "MANUAL");
    setIsModalOpen(true);
  };

  const openEditModal = (ioc: IOC) => {
    setEditingIOC(ioc);
    setFormValue(ioc.value);
    setFormType((ioc.type as any) || "IP");
    setFormSeverity((ioc.severity as any) || "medium");
    setFormDescription(ioc.description || "");
    
    const currentSource = typeof ioc.source === "object" && ioc.source !== null
      ? ((ioc.source as any)._id || (ioc.source as any).id || (ioc.source as any).name)
      : (ioc.source || "MANUAL");
    setFormSource(currentSource);
    
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValue.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      if (editingIOC) {
        const payload: UpdateIOCRequest = {
          value: formValue,
          type: formType,
          severity: formSeverity,
          description: formDescription,
          source: formSource,
        };
        await updateIOC(editingIOC._id, payload);
      } else {
        const payload: CreateIOCRequest = {
          value: formValue,
          type: formType,
          severity: formSeverity,
          description: formDescription,
          source: formSource,
        };
        await createIOC(payload);
      }

      setIsModalOpen(false);
      await loadIOCs();
    } catch (err: any) {
      console.error("Failed to save IOC:", err);
      setError(err?.response?.data?.message || "CRITICAL: Không thể lưu thông tin IOC.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIOC = async (id: string, value: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa IOC [${value}] không?`)) {
      return;
    }

    try {
      setError(null);
      await deleteIOC(id);
      await loadIOCs();
    } catch (err: any) {
      console.error("Failed to delete IOC:", err);
      setError(err?.response?.data?.message || "CRITICAL: Không thể xóa IOC.");
    }
  };

  // filter tìm ioc
  const filteredIOCs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return iocs.filter((ioc) => {
      const matchesSearch =
        !keyword ||
        ioc.value.toLowerCase().includes(keyword) ||
        ioc.description?.toLowerCase().includes(keyword);

      const matchesType = typeFilter === "ALL" || ioc.type === typeFilter;
      const matchesSeverity = severityFilter === "ALL" || ioc.severity === severityFilter;

      return matchesSearch && matchesType && matchesSeverity;
    });
  }, [iocs, search, typeFilter, severityFilter]);

  //trang danh sách ioc
  const totalPages = Math.max(
    1,
    Math.ceil(filteredIOCs.length / itemsPerPage)
  );

  const paginatedIOCs = filteredIOCs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, severityFilter]);

  //ngày 
  const formatDate = (date?: string) => {
    if (!date) return "---";
    return new Date(date).toISOString().replace("T", " ").substring(0, 19);
  };

  //reset filter
  const resetFilters = () => {
    setSearch("");
    setTypeFilter("ALL");
    setSeverityFilter("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 font-mono">
      {/*page head */}
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500">
              MODULE mini tip
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-white">
            IOC MANAGEMENT
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreateModal}
            className="border border-neutral-600 bg-white px-3 py-1.5 text-[11px] font-semibold text-black transition hover:bg-neutral-200"
          >
            + ADD IOC
          </button>
          <button
            type="button"
            onClick={loadIOCs}
            disabled={loading}
            className="border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-[11px] font-medium text-neutral-200 transition hover:bg-neutral-800 hover:text-white disabled:opacity-50"
          >
            {loading ? "SYNCING..." : "REFRESH"}
          </button>
        </div>
      </div>

      {/* summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="border border-neutral-800 bg-black p-4">
          <p className="text-[10px] uppercase tracking-wider text-neutral-500">
            TOTAL IOC 
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {iocs.length}
          </p>
        </div>

        <div className="border border-neutral-800 bg-black p-4">
          <p className="text-[10px] uppercase tracking-wider text-neutral-500">
            FILTERED MATCHES
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {filteredIOCs.length}
          </p>
        </div>

        <div className="border border-neutral-800 bg-black p-4">
          <p className="text-[10px] uppercase tracking-wider text-neutral-500">
            PAGINATION INDEX
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {currentPage} <span className="text-xs text-neutral-500">/ {totalPages}</span>
          </p>
        </div>
      </div>

      {/* search + filter */}
      <div className="border border-neutral-800 bg-black p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label
              htmlFor="ioc-search"
              className="mb-1.5 block text-[10px] uppercase tracking-wider text-neutral-400"
            >
              STRING // VALUE // HASH
            </label>
            <input
              id="ioc-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search IP, domain, URL, hash..."
              className="h-9 w-full border border-neutral-800 bg-neutral-950 px-3 text-xs text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-600"
            />
          </div>

          {/* Type filter */}
          <div>
            <label
              htmlFor="ioc-type"
              className="mb-1.5 block text-[10px] uppercase tracking-wider text-neutral-400"
            >
              FILTER // TYPE
            </label>
            <select
              id="ioc-type"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-9 w-full border border-neutral-800 bg-neutral-950 px-3 text-xs text-white outline-none focus:border-neutral-600"
            >
              <option value="ALL">ALL TYPES</option>
              <option value="IP">IP</option>
              <option value="DOMAIN">DOMAIN</option>
              <option value="URL">URL</option>
              <option value="HASH">HASH</option>
            </select>
          </div>

          {/* Severity filter */}
          <div>
            <label
              htmlFor="ioc-severity"
              className="mb-1.5 block text-[10px] uppercase tracking-wider text-neutral-400"
            >
              FILTER // SEVERITY
            </label>
            <select
              id="ioc-severity"
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value)}
              className="h-9 w-full border border-neutral-800 bg-neutral-950 px-3 text-xs text-white outline-none focus:border-neutral-600"
            >
              <option value="ALL">ALL SEVERITIES</option>
              <option value="low">LOW</option>
              <option value="medium">MEDIUM</option>
              <option value="high">HIGH</option>
              <option value="critical">CRITICAL</option>
            </select>
          </div>
        </div>

        {/* Reset filter action */}
        {(search || typeFilter !== "ALL" || severityFilter !== "ALL") && (
          <div className="mt-3 flex items-center justify-between border-t border-neutral-900 pt-3">
            <span className="text-[10px] text-neutral-500">FILTERS_ACTIVE</span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-[11px] text-neutral-400 underline hover:text-white"
            >
              CLEAR FILTERS
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="border border-neutral-700 bg-neutral-900 p-4 text-xs text-neutral-300">
          <p>[ERROR]: {error}</p>
        </div>
      )}

      {/* ioc data */}
      <div className="overflow-hidden border border-neutral-800 bg-black">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-xs">
            <thead className="border-b border-neutral-800 bg-neutral-950 text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">TYPE</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">INDICATOR VALUE</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">SOURCE</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">SEVERITY</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">FIRST SEEN (UTC)</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">LAST SEEN (UTC)</th>
                <th className="px-4 py-3 text-right font-semibold uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-900">
              {/* Loading */}
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
                    <span className="animate-pulse">FETCHING IOC RECORDS...</span>
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading && paginatedIOCs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-neutral-400">NO MATCHING IOC FOUND</p>
                    <p className="mt-1 text-[10px] text-neutral-600">
                      Try another filter.
                    </p>
                  </td>
                </tr>
              )}

              {!loading &&
                paginatedIOCs.map((ioc) => (
                  <tr key={ioc._id} className="transition hover:bg-neutral-950">
                    {/* Type */}
                    <td className="px-4 py-3">
                      <span className="inline-block border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold text-neutral-300">
                        {ioc.type}
                      </span>
                    </td>

                    {/* Value & description */}
                    <td className="max-w-[320px] px-4 py-3">
                      <p className="truncate font-medium text-white" title={ioc.value}>
                        {ioc.value}
                      </p>
                      {ioc.description && (
                        <p className="mt-0.5 truncate text-[10px] text-neutral-500" title={ioc.description}>
                          {ioc.description}
                        </p>
                      )}
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3 text-neutral-300">
                      {typeof ioc.source === "object" && ioc.source !== null
                        ? (ioc.source as any).name
                        : ioc.source || "UNKNOWN"}
                    </td>

                    {/* Severity*/}
                    <td className="px-4 py-3">
                      <span className="inline-block border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-300">
                        {ioc.severity}
                      </span>
                    </td>

                    {/* First Seen */}
                    <td className="px-4 py-3 text-[11px] text-neutral-500">
                      {formatDate(ioc.firstSeen)}
                    </td>

                    {/* Last Seen */}
                    <td className="px-4 py-3 text-[11px] text-neutral-500">
                      {formatDate(ioc.lastSeen)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(ioc)}
                          className="border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-[10px] text-neutral-300 hover:bg-neutral-800 hover:text-white"
                        >
                          EDIT
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteIOC(ioc._id, ioc.value)}
                          className="border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-[10px] text-red-400 hover:bg-red-950/40 hover:text-red-300"
                        >
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredIOCs.length > 0 && (
          <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-950 px-4 py-3">
            <p className="text-[11px] text-neutral-500">
              SHOWING <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
              <span className="text-white">{Math.min(currentPage * itemsPerPage, filteredIOCs.length)}</span> OF{" "}
              <span className="text-white">{filteredIOCs.length}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
                className="border border-neutral-800 bg-black px-3 py-1 text-[11px] text-neutral-300 transition hover:bg-neutral-950 disabled:opacity-40"
              >
                PREV
              </button>

              <span className="px-2 text-[11px] text-neutral-500">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
                className="border border-neutral-800 bg-black px-3 py-1 text-[11px] text-neutral-300 transition hover:bg-neutral-950 disabled:opacity-40"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* thêm update ioc bảng */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg border border-neutral-800 bg-black p-6 font-mono">
            <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
                {editingIOC ? "EDIT IOC RECORD" : "ADD NEW IOC RECORD"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-500 hover:text-white"
              >
                ESC
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-neutral-400">
                  INDICATOR VALUE <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="e.g. 192.168.1.1 or malicious-domain.com"
                  className="h-9 w-full border border-neutral-800 bg-neutral-950 px-3 text-xs text-white outline-none focus:border-neutral-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-neutral-400">
                    TYPE
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="h-9 w-full border border-neutral-800 bg-neutral-950 px-3 text-xs text-white outline-none focus:border-neutral-600"
                  >
                    <option value="IP">IP</option>
                    <option value="DOMAIN">DOMAIN</option>
                    <option value="URL">URL</option>
                    <option value="HASH">HASH</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-neutral-400">
                    SEVERITY
                  </label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as any)}
                    className="h-9 w-full border border-neutral-800 bg-neutral-950 px-3 text-xs text-white outline-none focus:border-neutral-600"
                  >
                    <option value="low">LOW</option>
                    <option value="medium">MEDIUM</option>
                    <option value="high">HIGH</option>
                    <option value="critical">CRITICAL</option>
                  </select>
                </div>
              </div>

              {/* Source selection from enabled sources */}
              <div>
                <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-neutral-400">
                  SOURCE <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  className="h-9 w-full border border-neutral-800 bg-neutral-950 px-3 text-xs text-white outline-none focus:border-neutral-600"
                >
                  <option value="MANUAL">MANUAL</option>
                  {sources.map((src: any) => {
                    const srcId = src._id || src.id || src.name;
                    const srcName = src.name || src.title || srcId;
                    return (
                      <option key={srcId} value={srcId}>
                        {srcName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-neutral-400">
                  DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional details about this threat..."
                  className="w-full border border-neutral-800 bg-neutral-950 p-3 text-xs text-white outline-none focus:border-neutral-600"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-neutral-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="border border-neutral-600 bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 disabled:opacity-50"
                >
                  {submitting ? "SAVING..." : editingIOC ? "UPDATE RECORD" : "CREATE RECORD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}