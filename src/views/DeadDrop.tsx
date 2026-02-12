import { DeadDropView } from "../components/DeadDropView";

export const DeadDrop = () => (
    <div className="h-full">
         <header className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-white">DEAD DROP</h1>
                <p className="text-sm text-zinc-500">P2P Secure File Transfer</p>
        </header>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-8 min-h-[400px]">
            <DeadDropView />
        </div>
    </div>
);
