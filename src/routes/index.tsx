import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SHIPMENTS, STAGES, STATUS_META, type Shipment, type Status } from "@/lib/shipments";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Manifest — Shipment tracking app" },
      { name: "description", content: "Track every shipment across carriers from your phone with live timelines and exception alerts." },
      { property: "og:title", content: "Manifest — Shipment tracking app" },
      { property: "og:description", content: "Every hand-off, one record. Live shipment tracking in your pocket." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

type Tab = "home" | "shipments" | "add" | "alerts" | "profile";

function Pill({ status }: { status: Status }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-medium ${m.tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {m.label}
    </span>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-glow">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>
      </div>
      <span className="text-lg font-semibold tracking-tight">Manifest<span className="text-primary">.</span></span>
    </div>
  );
}

function ShipmentCard({ s, onOpen, i = 0 }: { s: Shipment; onOpen: () => void; i?: number }) {
  return (
    <button onClick={onOpen} style={{ animationDelay: `${i * 60}ms` }}
      className="animate-rise w-full rounded-2xl border bg-card p-4 text-left shadow-card transition active:scale-[0.98]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-mono">{s.carrier}</p>
          <p className="mt-1 font-mono text-sm font-semibold">{s.id} · {s.from} → {s.to}</p>
        </div>
        <Pill status={s.status} />
      </div>
      <div className="mt-4 flex gap-1">
        {STAGES.map((_, idx) => (
          <div key={idx} className={`h-1.5 flex-1 rounded-full ${idx <= s.progress ? (s.status === "exception" ? "bg-destructive" : "bg-primary") : "bg-muted"}`} />
        ))}
      </div>
      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
        <span>{s.customer}</span>
        <span className="font-mono text-primary">{s.eta}</span>
      </div>
    </button>
  );
}

function Home({ open }: { open: (s: Shipment) => void }) {
  const live = SHIPMENTS.find((s) => s.status === "out_for_delivery")!;
  const stats = [
    { k: "Active", v: SHIPMENTS.filter((s) => s.status !== "delivered").length },
    { k: "Exceptions", v: SHIPMENTS.filter((s) => s.status === "exception").length },
    { k: "Delivered", v: SHIPMENTS.filter((s) => s.status === "delivered").length },
  ];
  return (
    <div className="space-y-6">
      <div className="animate-rise">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-soft px-3 py-1 font-mono text-[10px] tracking-widest text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> GOOD EVENING
        </span>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">
          Every hand-off,<br /><span className="text-primary">one record.</span>
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {stats.map((s, i) => (
          <div key={s.k} style={{ animationDelay: `${i * 70}ms` }} className="animate-rise rounded-2xl border bg-card p-3 shadow-card">
            <p className="label-mono">{s.k}</p>
            <p className="mt-2 text-2xl font-semibold">{s.v}</p>
          </div>
        ))}
      </div>

      <button onClick={() => open(live)} className="animate-rise w-full rounded-3xl border bg-card p-5 text-left shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="label-mono">Arriving today</p>
            <p className="mt-1 font-mono text-sm font-semibold">{live.id} · {live.from} → {live.to}</p>
          </div>
          <Pill status={live.status} />
        </div>
        <Timeline s={live} compact />
      </button>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="label-mono">Needs attention</p>
        </div>
        <div className="space-y-3">
          {SHIPMENTS.filter((s) => s.status === "exception" || s.status === "pending").map((s, i) => (
            <ShipmentCard key={s.id} s={s} i={i} onOpen={() => open(s)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Timeline({ s, compact }: { s: Shipment; compact?: boolean }) {
  return (
    <ol className="mt-4 space-y-0">
      {STAGES.map((st, idx) => {
        const done = idx < s.progress || s.status === "delivered";
        const current = idx === s.progress && s.status !== "delivered";
        return (
          <li key={st} className="relative flex items-center gap-3 pb-3 last:pb-0">
            {idx < STAGES.length - 1 && (
              <span className={`absolute left-[7px] top-4 h-full w-px ${done ? "bg-primary" : "bg-border"}`} />
            )}
            <span className={`relative z-10 h-[15px] w-[15px] rounded-full border-2 ${
              done ? "border-primary bg-primary" : current ? "border-primary bg-card animate-pulse-ring" : "border-border bg-card"}`} />
            <span className={`text-sm ${current ? "font-semibold" : done ? "" : "text-muted-foreground"}`}>{st}</span>
            {current && !compact && <span className="ml-auto font-mono text-[10px] text-primary">{s.eta}</span>}
            {current && compact && <span className="ml-auto font-mono text-[10px] text-primary">ETA {s.eta.replace("Today ", "")}</span>}
          </li>
        );
      })}
    </ol>
  );
}

function List({ open }: { open: (s: Shipment) => void }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState<Status | "all">("all");
  const rows = useMemo(() => SHIPMENTS.filter((s) =>
    (f === "all" || s.status === f) &&
    `${s.id} ${s.tracking} ${s.customer} ${s.carrier}`.toLowerCase().includes(q.toLowerCase())), [q, f]);
  const filters: (Status | "all")[] = ["all", "in_transit", "out_for_delivery", "exception", "delivered", "pending"];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Shipments</h1>
      <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5 shadow-card">
        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tracking, customer, carrier"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {filters.map((x) => (
          <button key={x} onClick={() => setF(x)}
            className={`shrink-0 rounded-full border px-3 py-1.5 font-mono text-[11px] transition ${f === x ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>
            {x === "all" ? "All" : STATUS_META[x].label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {rows.map((s, i) => <ShipmentCard key={s.id} s={s} i={i} onOpen={() => open(s)} />)}
        {rows.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No shipments match.</p>}
      </div>
    </div>
  );
}

function Add({ done }: { done: () => void }) {
  const [num, setNum] = useState("");
  const [carrier, setCarrier] = useState("Auto-detect");
  const [ok, setOk] = useState(false);
  if (ok) return (
    <div className="animate-rise flex flex-col items-center py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-success-soft text-success">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m5 12 5 5 9-10" /></svg>
      </div>
      <h2 className="mt-4 text-xl font-semibold">Tracking started</h2>
      <p className="mt-1 font-mono text-xs text-muted-foreground">{num}</p>
      <button onClick={done} className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow">View shipments</button>
    </div>
  );
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (num.trim().length >= 6) setOk(true); }} className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Track a shipment</h1>
      <div className="rounded-2xl border bg-card p-5 shadow-card space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Tracking number</span>
          <input value={num} onChange={(e) => setNum(e.target.value)} placeholder="1Z999AA10123456784"
            className="mt-2 w-full rounded-xl border bg-background px-3 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring" />
          {num && num.trim().length < 6 && <span className="mt-1 block text-xs text-destructive">At least 6 characters</span>}
        </label>
        <div>
          <span className="text-sm font-medium">Carrier</span>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {["Auto-detect", "UPS", "FedEx", "DHL", "USPS", "Delhivery"].map((c) => (
              <button type="button" key={c} onClick={() => setCarrier(c)}
                className={`rounded-xl border py-2.5 text-xs font-medium transition ${carrier === c ? "border-primary bg-primary-soft text-primary" : "bg-background"}`}>{c}</button>
            ))}
          </div>
        </div>
        <button className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-glow active:scale-[0.98]">Start tracking →</button>
      </div>
      <p className="label-mono text-center">Supports 1,200+ carriers</p>
    </form>
  );
}

function Alerts() {
  const items = [
    { t: "Weather delay", d: "SHP-24-0925 held in Memphis, TN", tone: "bg-destructive", time: "5m" },
    { t: "Out for delivery", d: "SHP-24-0918 arriving by 14:20", tone: "bg-primary", time: "1h" },
    { t: "Delivered", d: "SHP-24-0902 left at front door", tone: "bg-success", time: "1d" },
    { t: "Label created", d: "SHP-24-0930 awaiting pickup", tone: "bg-warning", time: "2d" },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
      <div className="divide-y rounded-2xl border bg-card shadow-card">
        {items.map((a, i) => (
          <div key={i} style={{ animationDelay: `${i * 60}ms` }} className="animate-rise flex gap-3 p-4">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.tone}`} />
            <div className="flex-1">
              <p className="text-sm font-semibold">{a.t}</p>
              <p className="text-xs text-muted-foreground">{a.d}</p>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Profile() {
  const [toggles, setToggles] = useState({ push: true, email: true, sms: false });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
      <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-card">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft font-semibold text-primary">AD</div>
        <div>
          <p className="font-semibold">Admin</p>
          <p className="text-xs text-muted-foreground">admin@store.com</p>
        </div>
      </div>
      <p className="label-mono pt-2">Notify channels</p>
      <div className="divide-y rounded-2xl border bg-card shadow-card">
        {(Object.keys(toggles) as (keyof typeof toggles)[]).map((k) => (
          <div key={k} className="flex items-center justify-between p-4">
            <span className="text-sm capitalize">{k === "sms" ? "SMS" : k} notifications</span>
            <button onClick={() => setToggles((t) => ({ ...t, [k]: !t[k] }))}
              className={`relative h-6 w-11 rounded-full transition ${toggles[k] ? "bg-primary" : "bg-muted"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${toggles[k] ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Detail({ s, close }: { s: Shipment; close: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm" onClick={close}>
      <div onClick={(e) => e.stopPropagation()} className="animate-sheet max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl border bg-card p-5 pb-10">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted" />
        <div className="flex items-start justify-between">
          <div>
            <p className="label-mono">{s.carrier} · {s.tracking}</p>
            <h2 className="mt-1 font-mono text-lg font-semibold">{s.id}</h2>
          </div>
          <Pill status={s.status} />
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-hero bg-secondary p-4">
          <div><p className="label-mono">From</p><p className="text-2xl font-semibold">{s.from}</p></div>
          <div className="flex-1 px-3"><div className="h-px border-t border-dashed border-primary" /></div>
          <div className="text-right"><p className="label-mono">To</p><p className="text-2xl font-semibold">{s.to}</p></div>
        </div>
        <Timeline s={s} />
        <p className="label-mono mt-6">Carrier events</p>
        <div className="mt-2 space-y-3">
          {s.events.map((e, i) => (
            <div key={i} className="flex justify-between gap-3 border-b pb-3 last:border-0">
              <div><p className="text-sm font-medium">{e.label}</p><p className="text-xs text-muted-foreground">{e.place}</p></div>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{e.time}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button className="rounded-xl border py-3 text-sm font-medium">Notify customer</button>
          <button className="rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow">Share link</button>
        </div>
      </div>
    </div>
  );
}

const NAV: { id: Tab; label: string; d: string }[] = [
  { id: "home", label: "Home", d: "M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { id: "shipments", label: "Shipments", d: "M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8" },
  { id: "add", label: "Track", d: "M12 5v14M5 12h14" },
  { id: "alerts", label: "Alerts", d: "M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4" },
  { id: "profile", label: "Account", d: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" },
];

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [sel, setSel] = useState<Shipment | null>(null);
  return (
    <div className="min-h-screen bg-hero">
      <div className="relative mx-auto min-h-screen max-w-md bg-dots/0 pb-28">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-background/80 px-5 py-4 backdrop-blur-md">
          <Logo />
          <button onClick={() => setTab("alerts")} className="relative grid h-10 w-10 place-items-center rounded-full border bg-card">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d={NAV[3].d} /></svg>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </button>
        </header>
        <main key={tab} className="px-5 pt-2">
          {tab === "home" && <Home open={setSel} />}
          {tab === "shipments" && <List open={setSel} />}
          {tab === "add" && <Add done={() => setTab("shipments")} />}
          {tab === "alerts" && <Alerts />}
          {tab === "profile" && <Profile />}
        </main>
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-4 pb-4">
          <div className="flex items-center justify-around rounded-2xl border bg-card/90 p-2 shadow-card backdrop-blur-md">
            {NAV.map((n) => n.id === "add" ? (
              <button key={n.id} onClick={() => setTab("add")} aria-label="Track"
                className="-mt-8 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow active:scale-95">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d={n.d} /></svg>
              </button>
            ) : (
              <button key={n.id} onClick={() => setTab(n.id)}
                className={`flex flex-col items-center gap-1 px-2 py-1 transition ${tab === n.id ? "text-primary" : "text-muted-foreground"}`}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" viewBox="0 0 24 24"><path d={n.d} /></svg>
                <span className="text-[10px] font-medium">{n.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
      {sel && <Detail s={sel} close={() => setSel(null)} />}
    </div>
  );
}
