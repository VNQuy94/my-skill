# Orthography: capitals, spelling, numbers, dates

Sources: **Appendix II, Decree 30/2020/ND-CP** (capitalisation in administrative documents; full text read), **Decision 1989/QĐ-BGDĐT, 25/05/2018** (spelling in school textbooks; articles 8, 9, 11 read via a full-text copy), **Microsoft Vietnamese Style Guide** (punctuation, numbers, symbols; read in full).

## 1. Capitalisation (Appendix II, Decree 30)

| Case | Rule | Examples |
|---|---|---|
| Sentence start | after `.` `?` `!` and at a new line | |
| Vietnamese person names | every syllable | Nguyễn Ái Quốc; Bà Triệu, Bác Hồ |
| Foreign names, Hán-Việt reading | like Vietnamese names | Mao Trạch Đông |
| Foreign names, direct transcription | first syllable of each part, hyphens inside | Vla-đi-mia I-lích Lê-nin |
| Administrative unit = common noun + name | common noun lower case, name capitalised, no hyphen | tỉnh Nam Định, thành phố Thái Nguyên |
| … + number / person / event | capitalise the common noun too | Quận 1, Phường Điện Biên Phủ |
| Special cases | | Thủ đô Hà Nội, Thành phố Hồ Chí Minh |
| Terrain word + one-syllable name forming the place name | capitalise all | Cửa Lò, Vũng Tàu, Cầu Giấy |
| Terrain word + place name | terrain word lower case | sông Vàm Cỏ, vịnh Hạ Long, chợ Bến Thành |
| Regions from directions | every syllable | Tây Bắc, Bắc Bộ |
| Organisations | first letter of the words for type, function, field | Bộ Tài nguyên và Môi trường, Sở Tài chính, Hội đồng nhân dân tỉnh Sơn La |
| Translated foreign organisations | same rule | Liên hợp quốc (UN), Tổ chức Y tế thế giới (WHO) |
| Foreign abbreviations | upper case as in the original | WTO, UNESCO, ASEAN |
| Titles before a name | capitalised | Chủ tịch Quốc hội, Giáo sư Tôn Thất Tùng |
| A specific legal document | type + first syllable of its name | Bộ luật Hình sự, Luật Tổ chức Quốc hội |
| Citing parts of a specific document | Phần, Chương, Mục, Tiểu mục, Điều capitalised; khoản, điểm lower case | điểm a khoản 2 Điều 103 Mục 5 Chương XII |
| Holidays | first syllable of the name | ngày Quốc khánh 2-9, tết Nguyên đán; "Tết" alone = Tết Nguyên đán |
| Days and months **written in words** | capitalise the day/month word | thứ Hai, tháng Năm (but "tháng 5" with a digit) |
| Works, newspapers | first syllable of the title | tạp chí Cộng sản |
| Special nouns | | Nhân dân, Nhà nước |

**Not in Appendix II (and therefore a style choice):** capitalisation after a colon. Follow the Microsoft guide: a list item that continues the sentence starts lower case; items on their own lines start with a capital.

**Never Title Case Vietnamese headings or UI labels.** "Chọn tất cả", not "Chọn Tất Cả" (Microsoft guide). Proper names inside keep their capitals.

## 2. i / y and tone-mark placement — pick one convention per document

Two official conventions coexist:

| | Decision 1989/2018 (textbooks) | Common in administration and press (Decree 30's own text) |
|---|---|---|
| i/y after an initial consonant, no glide or final | **i**: kỉ niệm, lí luận, mĩ thuật, tỉ lệ, hi vọng | **y**: kỷ niệm, địa lý, tỷ lệ, hy vọng |
| tone on `oa, oe, uy` | on the main vowel: hoà, khoẻ, thuỷ | often on the second letter: hòa, khỏe, thủy (Decree 30 itself mixes "hóa" and "hoạ") |

Rules for this skill:

- **Consistency beats choice.** Mixing *kỉ niệm* and *kỷ niệm*, or *hòa* and *hoà*, in one document is the real error. `scripts/lint_vi.py` flags it.
- Default: administrative and business documents → the **y / hòa** column (matches common practice and Decree 30's own text). Educational material for schools → the **Decision 1989** column. Continue an existing document in its own convention.
- Proper names keep their own spelling: Nguyễn Vỹ, Thy Ngọc.
- Diphthongs (Decision 1989, art. 8): `ia, ua, ưa` take the mark on the first letter (bìa, lụa, lửa); `iê, yê, uô, uơ` on the second (biển, thuyền, nhuộm, được). Both conventions agree here.
- Use precomposed Unicode (NFC, as in TCVN 6909:2001). Decomposed text (combining marks) breaks search and some fonts; the lint script reports it.

## 3. Numbers, units, symbols

| Item | Rule | Source |
|---|---|---|
| Decimal mark | comma: `5,25 cm`, `3,8` | Decision 1989 art. 11; Microsoft |
| Thousands | **period** in business/technical documents: `1.526`, `1.526,75`; Decision 1989 uses a space (`1 000`) for textbooks. Never a comma. Pick one per document. | Microsoft; Decision 1989 |
| Number + unit | (non-breaking) space: `250 GB`, `5 cm` | Microsoft |
| Percent | no space: `80%` | Microsoft |
| Punctuation spacing | no space before `. , : ; ! ? ) ] }`, one space after; no space after `( [ {` | Microsoft |
| Comma before *và* / *hoặc* | none (no Oxford comma) | Microsoft |
| Hyphenated English compounds | not carried over: *dễ sử dụng*, *từ trái sang phải* | Microsoft |
| Cardinal vs ordinal | cardinals in digits (2 cái bút), ordinals in words (thứ nhất, thứ hai) | Microsoft |

## 4. Dates and document numbers (Decree 30, Appendix I)

- In administrative documents: `ngày 05 tháng 3 năm 2026`. Days below 10 and months 1–2 get a leading zero (`ngày 05 tháng 02 năm 2026`); Arabic numerals.
- Document numbers below 10 get a leading zero: `Số: 05/TB-UBND`.
- Legal bases (căn cứ): italic, one per line, each ending with `;` and the **last one ending with `.`** (Appendix I). A single căn cứ therefore ends with `.`.
- *(rec.)* Elsewhere, choose one short form and keep it: `11/10/2026` (dd/mm/yyyy). Never the US order mm/dd.
- *(rec.)* Ranges: `2026-2027`, `8 giờ–10 giờ`; no spaces around the hyphen in a year range.

## 5. Abbreviations *(rec.)*

Decree 30 Appendix III covers only abbreviations of document *types* (TB, QĐ, CV…) and layout samples. The rules below are this skill's recommendations.

- Spell out on first use, abbreviation in brackets: *Bảo hiểm xã hội (BHXH)*. Afterwards the abbreviation only.
- Common, widely understood abbreviations may stand alone (UBND, TP, BHXH in an HR document), but not in the title of an official document.
- Do not invent abbreviations to save space. Do not abbreviate in headings.
- Foreign abbreviations stay as in the original (API, ID, WHO).
