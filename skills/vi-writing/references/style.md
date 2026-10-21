# Style: plain, modern Vietnamese

Based on the Microsoft Vietnamese Style Guide (voice, word choice, word-to-word translation, words to avoid) plus rules for technical terms. Items marked *(rec.)* are this skill's recommendations, not quoted rules.

## 1. Voice

- **Short, everyday words** over formal or archaic ones. The guide's own examples:

| Avoid (classic) | Prefer (modern) |
|---|---|
| Tải về không thành công | Không tải được |
| theo các bước sau đây | theo cách sau |
| giấu | ẩn |
| mã định danh | ID |
| Xác định hành động mà máy chủ sẽ thực hiện khi gặp… | Chỉ rõ thao tác cho máy chủ khi gặp… |

- **Translate the meaning, not the words.** "Failed to download" → *Không tải được*, not *Tải về không thành công* or *Tải về thất bại*. Split or merge sentences when that reads more naturally.
- **Address the reader** with *bạn* in guides and UI; in administrative documents use the institutional form (*đơn vị, các phòng, quý phụ huynh*). Do not switch within one document.
- Choose precise verbs: *xóa* (clear) ≠ *xóa bỏ* (delete) ≠ *loại bỏ* (remove) ≠ *bác bỏ* (reject).
- Tense words *đã, đang, sẽ* only when the time matters; drop them otherwise.
- Negation carries nuance: *không biết* (plain), *chưa biết* (not yet), *chẳng biết* (doesn't care). Pick deliberately.

## 2. Translationese and AI-sounding patterns *(rec.)*

These patterns come from translating English structure word for word. Rewrite them:

| Pattern | Instead |
|---|---|
| *thực hiện việc* + verb ("thực hiện việc cập nhật") | the verb: *cập nhật* |
| *được* + verb + *bởi* X ("được phê duyệt bởi quản lý") | active: *quản lý phê duyệt* |
| *một cách* + adjective ("một cách nhanh chóng") | adverb or nothing: *nhanh* |
| chains of *của* ("bản báo cáo của kết quả của khảo sát của công ty") | restructure: *báo cáo kết quả khảo sát của công ty* |
| *các / những* before every plural noun | only when the plurality matters |
| sentence-initial *Trong khi đó*, *Ngoài ra*, *Bên cạnh đó* on every paragraph | cut, or use a real logical link |
| "X là một Y mà nó…" | "X là Y…"; drop the resumptive *nó* |
| English order of modifiers ("hiệu quả cao giải pháp") | head noun first: *giải pháp hiệu quả cao* |
| empty intensifiers: *vô cùng, cực kỳ, hết sức quan trọng* | the fact that makes it important |
| closing filler: *Hy vọng thông tin trên hữu ích!*, *nhé* in formal text | end with the next step, or nothing |

*bị* and *được* are not simple passive markers: *được* is positive, *bị* negative or neutral-adverse ("bị hỏng" means it broke, not "was broken by someone"). Choose by meaning, not by the English voice.

## 3. Technical terms *(rec.)*

| Keep in English | Translate | Explain once |
|---|---|---|
| product, feature, and brand names (PivotTable, Typst, GitHub) | everyday UI actions (Lưu, Hủy, Nhập) | terms a non-technical reader will not know: *API (giao diện lập trình ứng dụng)* |
| code, commands, file names, config keys, error messages | general concepts that have a settled Vietnamese term (cơ sở dữ liệu, máy chủ, mật khẩu) | |
| widely used short forms (API, ID, URL, CPU) | | |

- Decide per audience: engineers → keep English terms bare; business readers → Vietnamese term with the English in brackets on first use: *bộ nhớ đệm (cache)*.
- One term per concept throughout the document. Do not alternate *máy chủ* / *server* / *sever*.
- Do not Vietnamise English inflections: *các API*, not *các APIs*.
- Format code-like terms as code (`npm install`), not in quotes.

## 4. Register by document type

| Type | Register |
|---|---|
| Administrative (notice, official letter) | formal, impersonal; follow Decree 30 capitalisation; no *bạn*, no exclamation marks, no emoji |
| Report to management | neutral, factual; conclusion first; numbers with units; no rhetoric |
| Guide / how-to | direct *bạn*; imperative steps ("Mở…", "Chọn…"); one action per step |
| UI text, error messages | shortest clear form; say what happened and what to do |
| Chat answer | natural and concise; same spelling conventions, less formality |
