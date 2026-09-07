import { useEffect, useState } from "react";
import { getSources, createSource, updateSource, deleteSource } from "@/services/sourceService";
import type {Source, CreateSourceRequest, UpdateSourceRequest} from "@/types/source";

export default function SourcePage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // Trạng thái form
  const [showForm, setShowForm] = useState(false);

  // Source đang chỉnh sửa
  const [editingSource, setEditingSource] = useState<Source | null>(null);

  // Form
  const [name, setName] = useState("");
  const [type, setType] =
    useState<"API" | "RSS">("API");
  const [url, setUrl] = useState("");
  const [enabled, setEnabled] = useState(true);

  // Trạng thái submit
  const [submitting, setSubmitting] = useState(false);

  const loadSources = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getSources();

      setSources(data);
    } catch (err) {
      console.error("Failed to load sources:", err);

      setError(
        "Error: Không thể tải danh sách nguồn dữ liệu từ hệ thống."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const resetForm = () => {
    setName("");
    setType("API");
    setUrl("");
    setEnabled(true);

    setEditingSource(null);
    setShowForm(false);
  };

  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (source: Source) => {
    setEditingSource(source);
    setName(source.name);
    setType(source.type);
    setUrl(source.url);
    setEnabled(source.enabled);
    setShowForm(true);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Tên source không được để trống.");
      return;
    }

    if (!url.trim()) {
      setError("URL không được để trống.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (!editingSource) {
        const data: CreateSourceRequest = {
          name: name.trim(),
          type,
          url: url.trim(),
          enabled,
        };
        const newSource =
          await createSource(data);
        setSources((prev) => [
          newSource,
          ...prev,
        ]);
      }

      else {
        const data: UpdateSourceRequest = {
          name: name.trim(),
          type,
          url: url.trim(),
          enabled,
        };

        const updatedSource = await updateSource(
          editingSource._id,
          data
        );

        setSources((prev) =>
          prev.map((source) =>
            source._id === updatedSource._id ? updatedSource : source)
        );
      }

      resetForm();
    } catch (err: any) {
      console.error("Failed to save source:", err);
      setError( err?.response?.data?.message || "Không thể lưu source.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (
    source: Source
  ) => { // giao diện bảng báo xác nhận xóa
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa source "${source.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      await deleteSource(source._id);
      setSources((prev) =>
        prev.filter(
          (item) => item._id !== source._id
        )
      );
    } catch (err: any) {
      console.error(
        "Failed to delete source:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Không thể xóa source."
      );
    }
  };

  const handleToggle = async (
    source: Source
  ) => {
    try {
      const data: UpdateSourceRequest = {
        name: source.name,
        type: source.type,
        url: source.url,
        enabled: !source.enabled,
      };

      const updatedSource =
        await updateSource(
          source._id,
          data
        );

      setSources((prev) =>
        prev.map((item) =>
          item._id === updatedSource._id
            ? updatedSource
            : item
        )
      );
    } catch (err) {
      console.error(
        "Failed to update source:",
        err
      );

      setError(
        "Không thể thay đổi trạng thái source."
      );
    }
  };

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500">
              MODULE mini tip
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-white">
            Data Sources
          </h1>

          <p className="mt-1 text-xs text-neutral-500">
            Quản lý các nguồn dữ liệu Threat Intelligence.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-[11px] font-medium text-neutral-200 transition hover:bg-neutral-800 hover:text-white"
        >
          + ADD SOURCE
        </button>

      </div>

      {/* 
          error
      */}

      {error && (
        <div className="border border-neutral-700 bg-neutral-900 p-4 text-xs text-neutral-300">
          <p>[ERROR]: {error}</p>
        </div>
      )}

      {/* thêm update  */}

      {showForm && (
        <div className="border border-neutral-800 bg-black p-5">

          <div className="mb-5 flex items-center justify-between border-b border-neutral-900 pb-3">

            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                {editingSource
                  ? "EDIT_SOURCE // " + editingSource.name
                  : "ADD_SOURCE // NEW_CONFIGURATION"}
              </h2>

              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-neutral-500">
                Cấu hình nguồn dữ liệu cho hệ thống.
              </p>
            </div>

            <button
              onClick={resetForm}
              className="text-[11px] text-neutral-400 underline hover:text-white"
            >
              [CANCEL]
            </button>

          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-2"
          >
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-neutral-400">
                SOURCE NAME
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="AlienVault OTX"
                className="h-9 w-full border border-neutral-800 bg-neutral-950 px-3 text-xs text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-600"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-neutral-400">
                SOURCE TYPE
              </label>

              <select
                value={type}
                onChange={(event) =>
                  setType(
                    event.target.value as
                      | "API"
                      | "RSS"
                  )
                }
                className="h-9 w-full border border-neutral-800 bg-neutral-950 px-3 text-xs text-white outline-none focus:border-neutral-600"
              >
                <option value="API">API</option>
                <option value="RSS">RSS</option>
              </select>
            </div>

            <div className="md:col-span-2">

              <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-neutral-400">
                ENDPOINT URL
              </label>

              <input
                value={url}
                onChange={(event) =>
                  setUrl(event.target.value)
                }
                placeholder="https://otx.alienvault.com"
                className="h-9 w-full border border-neutral-800 bg-neutral-950 px-3 text-xs text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-600"
              />

            </div>

            <div className="flex items-center gap-2.5">

              <input
                id="enabled"
                type="checkbox"
                checked={enabled}
                onChange={(event) =>
                  setEnabled(
                    event.target.checked
                  )
                }
                className="h-4 w-4 border border-neutral-700 bg-neutral-950 accent-white"
              />

              <label
                htmlFor="enabled"
                className="text-[11px] uppercase tracking-wider text-neutral-300"
              >
                Enable this source
              </label>

            </div>

            {/* cancel add source */}

            <div className="flex justify-end gap-2 md:col-span-2">

              <button
                type="button"
                onClick={resetForm}
                className="border border-neutral-800 bg-black px-3 py-1.5 text-[11px] text-neutral-300 transition hover:bg-neutral-950"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="border border-neutral-700 bg-neutral-900 px-4 py-1.5 text-[11px] font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
              >
                {submitting
                  ? "SAVING..."
                  : editingSource
                  ? "UPDATE_SOURCE"
                  : "CREATE_SOURCE"}
              </button>

            </div>

          </form>
        </div>
      )}

      <div className="overflow-hidden border border-neutral-800 bg-black">

        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-3">

          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Registered Sources
          </h2>

          <p className="text-[10px] text-neutral-500">
            TOTAL: <span className="text-white">{sources.length}</span> source{sources.length !== 1 ? "s" : ""}
          </p>

        </div>

        {loading ? (
          <div className="px-4 py-12 text-center text-neutral-500">
            <span className="animate-pulse">FETCHING SOURCES...</span>
          </div>
        ) : sources.length === 0 ? (
          <div className="px-4 py-12 text-center">

            <p className="text-neutral-400">NO SOURCES FOUND</p>

            <button
              onClick={handleCreate}
              className="mt-2 text-[11px] text-neutral-400 underline hover:text-white"
            >
              + Add your first source
            </button>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px] text-left text-xs">

              <thead className="border-b border-neutral-800 bg-neutral-950 text-neutral-400">
                <tr>

                  <th className="px-4 py-3 font-semibold uppercase tracking-wider">
                    Name
                  </th>

                  <th className="px-4 py-3 font-semibold uppercase tracking-wider">
                    Type
                  </th>

                  <th className="px-4 py-3 font-semibold uppercase tracking-wider">
                    URL
                  </th>

                  <th className="px-4 py-3 font-semibold uppercase tracking-wider">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right font-semibold uppercase tracking-wider">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-900">

                {sources.map((source) => (
                  <tr
                    key={source._id}
                    className="transition hover:bg-neutral-950"
                  >

                    {/* NAME */}

                    <td className="px-4 py-3 font-medium text-white">
                      {source.name}
                    </td>

                    {/* TYPE */}

                    <td className="px-4 py-3">
                      <span className="border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-[10px] uppercase text-neutral-300">
                        {source.type}
                      </span>
                    </td>

                    {/* URL */}

                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate text-neutral-400" title={source.url}>
                        {source.url}
                      </p>
                    </td>

                    {/* STATUS */}

                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          handleToggle(source)
                        }
                        className="flex items-center gap-1.5 text-left"
                      >
                        <span
                          className={`h-1.5 w-1.5 ${
                            source.enabled
                              ? "bg-green-400"
                              : "bg-neutral-600"
                          }`}
                        />
                        <span className="font-semibold uppercase tracking-wider text-neutral-300">
                          {source.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </button>
                    </td>

                    {/* ACTIONS */}

                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            handleEdit(source)
                          }
                          className="border border-neutral-800 bg-black px-2.5 py-1 text-[11px] text-neutral-300 transition hover:bg-neutral-950 hover:text-white"
                        >
                          EDIT
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(source)
                          }
                          className="border border-neutral-800 bg-black px-2.5 py-1 text-[11px] text-red-400 transition hover:bg-neutral-950 hover:text-red-300"
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
        )}
      </div>
    </div>
  );
}