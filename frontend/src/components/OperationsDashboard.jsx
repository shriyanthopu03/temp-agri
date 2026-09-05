const modules = [
  ['Produce lots', 'Created → delivered', '24 active'],
  ['Inspections', 'Quality history', '8 pending'],
  ['Purchase orders', 'Allocation and fulfillment', '12 open'],
  ['Warehouses', 'Inventory movement', '3 locations'],
  ['Logistics', 'Dispatch and delivery', '6 in transit'],
  ['Settlements', 'Accepted quantity and grade', '₹4.8L pending'],
  ['Disputes', 'Resolution queue', '2 open'],
  ['Reports', 'Exports and audit history', 'Ready'],
]

export function OperationsDashboard({ active }) {
  const title = active === 'Overview' ? 'Operations overview' : active
  return <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Operations control</p><h2 className="mt-2 text-xl font-semibold tracking-tight">{title}</h2><p className="mt-1 text-sm text-muted-foreground">Track every handoff from farm intake to settlement.</p></div>
      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">Synced just now</span>
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{modules.map(([name, detail, metric]) => <article key={name} className="rounded-xl border border-border bg-background p-4"><p className="font-medium">{name}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p><p className="mt-4 text-sm font-semibold text-primary">{metric}</p></article>)}</div>
  </section>
}
