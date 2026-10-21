import { Button } from '../components/Button';
import { StatusMark } from '../components/StatusMark';
import { Icon } from '../icons/Icon';
import { loans } from '../data/loans';

export function Home() {
  const current = loans.filter((l) => l.status !== 'da-tra');
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="type-h1 text-ink">Sách đang mượn</h1>
          <p className="mt-1 type-body text-ink-muted">Bạn có {current.length} cuốn cần trả. Mỗi cuốn được gia hạn một lần, thêm 14 ngày.</p>
        </div>
        <label className="flex min-h-10 w-full max-w-xs items-center gap-2 rounded-md border border-line bg-surface px-3 text-ink-muted sm:w-auto">
          <Icon name="search" size="sm" />
          <input className="w-full bg-transparent type-small text-ink outline-none placeholder:text-ink-muted" placeholder="Tìm trong sách của bạn" />
        </label>
      </div>

      <ol className="mt-8 border-t border-line">
        {current.map((l) => (
          <li key={l.id} className="grid grid-cols-[6.5rem_1fr] gap-x-6 gap-y-3 border-b border-line py-5 sm:grid-cols-[7.5rem_1fr_auto] sm:items-center">
            <div className="type-small tabular-nums text-ink-muted">
              <div>Hạn trả</div>
              <div className={`type-title ${l.status === 'qua-han' ? 'text-danger' : 'text-ink'}`}>{l.dueOn}</div>
            </div>
            <div>
              <div className="type-title text-ink">{l.title}</div>
              <div className="type-small text-ink-muted">{l.author} · mượn ngày <span className="tabular-nums">{l.borrowedOn}</span></div>
              <div className="mt-2"><StatusMark status={l.status} /></div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Button variant={l.status === 'qua-han' ? 'secondary' : 'primary'}>
                <Icon name="calendar" size="sm" /> Gia hạn 14 ngày
              </Button>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
