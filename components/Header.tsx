"use client";
import Link from "next/link";
import { useState } from "react";
import { Search, Share2, Shield, X, StickyNote } from "lucide-react";
import SyncButton from "./SyncButton";

export default function Header({ search, onSearch, onSync, syncing, onShare, onAdmin, isAdmin }: {
  search: string; onSearch: (value: string) => void; onSync: () => void;
  syncing: boolean; onShare: () => void; onAdmin: () => void; isAdmin: boolean;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-3 px-5 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5" aria-label="MINDLET ?">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white"><StickyNote size={20} strokeWidth={1.8} /></span>
          <span className="text-[16px] font-extrabold tracking-[0.13em] text-slate-800">MINDLET</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button onClick={() => setSearchOpen(!searchOpen)} className="tool-button" aria-label="?? ??" aria-expanded={searchOpen}>{searchOpen ? <X size={18}/> : <Search size={18}/>}</button>
          <SyncButton onSync={onSync} syncing={syncing}/>
          <button onClick={onShare} className="tool-button" aria-label="?? ?? ??"><Share2 size={17}/><span className="hidden sm:inline">??</span></button>
          <span className="mx-1 h-5 w-px bg-slate-200"/>
          <button onClick={onAdmin} className="tool-button" aria-label="??? ?? ??"><Shield size={17}/><span className="hidden sm:inline">???</span></button>
        </div>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 px-6 py-7 sm:px-12 sm:py-8">
        <div><div className="flex items-center gap-3"><h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">VIBE Coding</h1>{isAdmin && <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold tracking-wider text-sky-700">ADMIN MODE</span>}</div><p className="mt-2 text-[13px] text-slate-400">??? ?? ??</p></div>
        {searchOpen && <label className="relative w-full sm:w-72"><Search className="absolute left-3 top-3 text-slate-400" size={16}/><input autoFocus value={search} onChange={e => onSearch(e.target.value)} placeholder="?? ??" aria-label="?? ??" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 text-sm outline-none focus:border-sky-400"/>{search && <button onClick={() => onSearch("")} className="absolute right-3 top-3 text-slate-400" aria-label="?? ???"><X size={15}/></button>}</label>}
      </div>
    </header>
  );
}
