import type { ReactNode } from "react";
import { Icon } from '../icons/Icon';
import { reader } from '../data/loans';

const nav = [
  { href: '/', label: 'Sách đang mượn', icon: 'home' as const },
  { href: '/lich-su', label: 'Lịch sử mượn', icon: 'history' as const },
];

export function Shell({ children }: { children: ReactNode }) {
  const path = window.location.pathname;
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <a href="/" className="type-h2 text-ink">Sổ Tay Đọc</a>
          <nav className="flex gap-1">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                aria-current={path === n.href ? 'page' : undefined}
                className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 type-label text-ink-muted hover:text-ink aria-[current=page]:text-accent"
              >
                <Icon name={n.icon} size="sm" />
                {n.label}
              </a>
            ))}
          </nav>
          <div className="type-small text-ink-muted">
            {reader.name} · thẻ <span className="tabular-nums">{reader.card}</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
