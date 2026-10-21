export type LoanStatus = 'dang-muon' | 'da-tra' | 'qua-han';

export type Loan = {
  id: string;
  title: string;
  author: string;
  borrowedOn: string; // dd/mm/yyyy
  dueOn: string;
  returnedOn?: string;
  status: LoanStatus;
};

export const reader = { name: 'Lê Minh Châu', card: 'TV-04821' };

export const loans: Loan[] = [
  { id: 'L-2291', title: 'Nỗi buồn chiến tranh', author: 'Bảo Ninh', borrowedOn: '02/10/2026', dueOn: '23/10/2026', status: 'dang-muon' },
  { id: 'L-2288', title: 'Đất rừng phương Nam', author: 'Đoàn Giỏi', borrowedOn: '28/09/2026', dueOn: '19/10/2026', status: 'qua-han' },
  { id: 'L-2275', title: 'Thương nhớ mười hai', author: 'Vũ Bằng', borrowedOn: '15/09/2026', dueOn: '06/10/2026', returnedOn: '05/10/2026', status: 'da-tra' },
  { id: 'L-2260', title: 'Số đỏ', author: 'Vũ Trọng Phụng', borrowedOn: '01/09/2026', dueOn: '22/09/2026', returnedOn: '20/09/2026', status: 'da-tra' },
  { id: 'L-2241', title: 'Chí Phèo', author: 'Nam Cao', borrowedOn: '18/08/2026', dueOn: '08/09/2026', returnedOn: '12/09/2026', status: 'da-tra' },
  { id: 'L-2230', title: 'Tắt đèn', author: 'Ngô Tất Tố', borrowedOn: '05/08/2026', dueOn: '26/08/2026', returnedOn: '24/08/2026', status: 'da-tra' },
  { id: 'L-2212', title: 'Vang bóng một thời', author: 'Nguyễn Tuân', borrowedOn: '20/07/2026', dueOn: '10/08/2026', returnedOn: '09/08/2026', status: 'da-tra' },
];
