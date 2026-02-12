import { Link, useLocation } from "wouter";
import { cn } from "../utils/cn";

export const Sidebar = () => {
  const [location] = useLocation();

  const navItems = [
    { name: "INCINERATOR", path: "/" },
    { name: "DEAD DROP", path: "/dead-drop" },
    { name: "SETTINGS", path: "/settings" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-zinc-800 bg-black/95 text-zinc-400 backdrop-blur-md z-20">
      <div className="flex h-16 items-center border-b border-zinc-800 px-6">
        <span className="text-sm font-bold tracking-widest text-zinc-100">GHOST DROP</span>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-xs font-medium tracking-wide transition-colors hover:bg-zinc-900 hover:text-zinc-100",
                location === item.path && "bg-zinc-900 text-white shadow-[inset_2px_0_0_0_#00ff41]"
              )}
            >
              {item.name}
            </a>
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-4 left-4 text-[10px] text-zinc-600">
        v2.0.0-beta
      </div>
    </aside>
  );
};
