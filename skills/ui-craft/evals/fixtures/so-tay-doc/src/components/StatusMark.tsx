import type { LoanStatus } from '../data/loans';

const label: Record<LoanStatus, string> = { 'dang-muon': 'Đang mượn', 'da-tra': 'Đã trả', 'qua-han': 'Quá hạn' };
const tone: Record<LoanStatus, string> = {
  'dang-muon': 'text-accent border-accent/40',
  'da-tra': 'text-success border-success/40',
  'qua-han': 'text-danger border-danger/50',
};

// A status reads like an ink stamp: outlined, small caps-free, no filled background.
export function StatusMark({ status }: { status: LoanStatus }) {
  return <span className={`inline-block rounded-sm border px-2 py-0.5 type-label ${tone[status]}`}>{label[status]}</span>;
}
