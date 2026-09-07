import { useAuthStore } from "@/stores/useAuthStore";

export default function Header() {
  const user = useAuthStore(
    (state) => state.user
  );

  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-800 bg-black px-6 text-white">
      <div>
        <h2 className="text-sm font-semibold text-white">
          TIP
        </h2>

        <p className="text-xs text-neutral-500">
          Security Operations
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* System */}
        <div className="hidden items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1.5 md:flex">
          <span className="h-2 w-2 rounded-full bg-green-400" />

          <span className="text-xs text-green-400">
            System Online
          </span>
        </div>

        <div className="flex items-center gap-3 border-l border-neutral-800 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-sm font-semibold text-white">
            {user?.username ?.charAt(0).toUpperCase() || "A"}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">
              {user?.username || "Admin"}
            </p>

            <p className="text-xs  text-neutral-500">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}