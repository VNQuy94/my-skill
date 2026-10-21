#!/usr/bin/env python3
"""Check Vietnamese text for consistency and common errors (stdlib only).

Usage:
  lint_vi.py <file.md|.txt|.docx|.pdf> [--admin] [--max 20]

Errors (exit 1): decomposed Unicode, mixed spelling conventions in one document
(kỉ/kỷ, hoà/hòa…), mixed thousands separators, decimal points in numbers,
space before punctuation, comma before "và"/"hoặc".
Warnings: Title Case headings, translationese patterns, long "của" chains,
missing space after punctuation, "%"-spacing, day/month capitalisation (--admin).
"""
import argparse
import re
import subprocess
import sys
import unicodedata
import zipfile
from collections import defaultdict
from pathlib import Path

IY_WORDS = {  # restrict short syllables to known compounds to avoid false hits
    "kỉ": ["kỉ niệm", "kỉ luật", "thế kỉ", "kỉ lục", "kỉ yếu"],
    "kỷ": ["kỷ niệm", "kỷ luật", "thế kỷ", "kỷ lục", "kỷ yếu"],
    "lí": ["lí do", "lí luận", "quản lí", "xử lí", "địa lí", "vật lí", "tâm lí", "hợp lí", "lí thuyết"],
    "lý": ["lý do", "lý luận", "quản lý", "xử lý", "địa lý", "vật lý", "tâm lý", "hợp lý", "lý thuyết"],
    "mĩ": ["mĩ thuật", "thẩm mĩ", "hoàn mĩ"], "mỹ": ["mỹ thuật", "thẩm mỹ", "hoàn mỹ"],
    "tỉ": ["tỉ lệ", "tỉ số", "tỉ trọng", "tỉ giá"], "tỷ": ["tỷ lệ", "tỷ số", "tỷ trọng", "tỷ giá"],
    "hi": ["hi vọng", "hi sinh"], "hy": ["hy vọng", "hy sinh"],
    "kĩ": ["kĩ thuật", "kĩ năng", "kĩ sư", "kĩ lưỡng"], "kỹ": ["kỹ thuật", "kỹ năng", "kỹ sư", "kỹ lưỡng"],
}
# tone placement on oa/oe/uy: (mark on main vowel, mark on second letter)
TONE_PAIRS = [("hoà", "hòa"), ("hoá", "hóa"), ("hoả", "hỏa"), ("hoạ", "họa"), ("khoẻ", "khỏe"), ("thuỷ", "thủy"),
              ("tuỳ", "tùy"), ("luỹ", "lũy"), ("toà", "tòa"), ("thoả", "thỏa"), ("loà", "lòa"),
              ("xoá", "xóa"), ("toả", "tỏa"), ("loá", "lóa"), ("goá", "góa"), ("hoè", "hòe"), ("suý", "súy"), ("thuý", "thúy")]
TRANSLATIONESE = [
    (r"\bthực hiện việc\b", "'thực hiện việc + V' → dùng thẳng động từ"),
    (r"\bđược [^.,;:!?\n]{1,40}? bởi\b", "'được … bởi' → câu chủ động"),
    (r"\bmột cách (?:nhanh chóng|hiệu quả|chính xác|dễ dàng|rõ ràng|tự động|an toàn)\b", "'một cách + tính từ' → bỏ 'một cách'"),
    (r"\b(?:thất bại)\b(?=[.!\n])", "'X thất bại' ở cuối câu → 'Không X được'"),
    (r"\b(?:vô cùng|cực kỳ|cực kì|hết sức) quan trọng\b", "từ nhấn mạnh rỗng → nêu lý do cụ thể"),
    (r"(?i)hy vọng (?:thông tin|bài viết|hướng dẫn)[^.\n]* (?:hữu ích|giúp ích)", "câu kết sáo rỗng → kết bằng bước tiếp theo"),
]
TEXT_SUFFIXES = {".md", ".txt", ".rst", ".typ", ".js", ".html"}


def read_text(path: Path) -> str:
    if path.suffix == ".docx":
        import xml.etree.ElementTree as ET
        W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
        with zipfile.ZipFile(path) as z:
            root = ET.fromstring(z.read("word/document.xml"))
        paras = []
        for p in root.iter(W + "p"):
            style = p.find(f"{W}pPr/{W}pStyle")
            t = "".join(x.text or "" for x in p.iter(W + "t"))
            if style is not None and style.get(W + "val", "").startswith("Heading"):
                t = "# " + t
            paras.append(t)
        return "\n".join(paras)
    if path.suffix == ".pdf":
        return subprocess.run(["pdftotext", "-layout", str(path), "-"], capture_output=True, text=True, check=True).stdout
    return path.read_text(errors="replace")


def strip_quoted(text: str) -> str:
    """Drop short quoted segments: in proofreading notes they hold the *original* wording."""
    return re.sub(r'"[^"\n]{1,120}"|“[^”\n]{1,120}”', '""', text)


VI_CHARS = re.compile(r"[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]", re.I)


def _fence(m: re.Match) -> str:
    # Keep prose that is fenced only for copy-paste (```text / plain fences with
    # Vietnamese); drop real code.
    lang, body = (m.group(1) or "").strip().lower(), m.group(2)
    if lang in ("", "text", "txt", "markdown", "md", "plain") and len(VI_CHARS.findall(body)) > 20:
        return body
    return ""


def strip_code(text: str) -> str:
    text = re.sub(r"```([\w+-]*)\n(.*?)```", _fence, text, flags=re.S)
    text = re.sub(r"`[^`\n]+`", "", text)
    return re.sub(r"https?://\S+", "", text)


def find_all(text_low: str, phrase: str) -> int:
    return len(re.findall(rf"(?<![\wÀ-ỹ]){re.escape(phrase)}(?![\wÀ-ỹ])", text_low))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("file")
    ap.add_argument("--admin", action="store_true", help="administrative document: also check day/month capitalisation")
    ap.add_argument("--max", type=int, default=15, help="max examples per warning type")
    ap.add_argument("--keep-quoted", action="store_true", help="also check text inside quotation marks (skipped by default)")
    a = ap.parse_args()
    path = Path(a.file)
    raw = read_text(path)
    errors: list[str] = []
    warns: dict[str, list[str]] = defaultdict(list)

    if unicodedata.normalize("NFC", raw) != raw:
        errors.append("text contains decomposed Unicode (combining marks); convert to NFC / TCVN 6909 precomposed")
    text = strip_code(unicodedata.normalize("NFC", raw))
    if not a.keep_quoted:
        text = strip_quoted(text)
    low = text.lower()

    # Mixed spelling conventions
    i_hits = {w: find_all(low, w) for k in ("kỉ", "lí", "mĩ", "tỉ", "hi", "kĩ") for w in IY_WORDS[k]}
    y_hits = {w: find_all(low, w) for k in ("kỷ", "lý", "mỹ", "tỷ", "hy", "kỹ") for w in IY_WORDS[k]}
    i_used = {w: n for w, n in i_hits.items() if n}
    y_used = {w: n for w, n in y_hits.items() if n}
    if i_used and y_used:
        errors.append(f"mixed i/y spelling: i-forms {i_used} and y-forms {y_used} — pick one convention")
    a_used = {w: find_all(low, w) for w, _ in TONE_PAIRS if find_all(low, w)}
    b_used = {w: find_all(low, w) for _, w in TONE_PAIRS if find_all(low, w)}
    if a_used and b_used:
        errors.append(f"mixed tone placement: {a_used} vs {b_used} — pick one (hoà/khoẻ/thuỷ or hòa/khỏe/thủy)")

    # Numbers
    dot_thousands = re.findall(r"(?<![\d.,])\d{1,3}(?:\.\d{3})+(?![\d.])(?!\.\d)", text)
    space_thousands = re.findall(r"(?<![\d.,])\d{1,3}(?: \d{3})+(?![\d,])", text)
    comma_thousands = re.findall(r"(?<![\d.,])\d{1,3}(?:,\d{3}){2,}(?![\d,])", text)
    if sum(bool(x) for x in (dot_thousands, space_thousands, comma_thousands)) > 1:
        errors.append(f"mixed thousands separators: '.' {dot_thousands[:3]} ' ' {space_thousands[:3]} ',' {comma_thousands[:3]}")
    if comma_thousands:
        errors.append(f"comma as thousands separator {comma_thousands[:3]} — Vietnamese uses '.' (or a space)")
    decimal_points = [m for m in re.findall(r"(?<![\d.\w/])\d+\.\d{1,2}(?=\s*(?:%|cm|mm|m\b|kg|g\b|GB|MB|km|giờ|triệu|tỷ|tỉ|điểm))", text)]
    if decimal_points:
        errors.append(f"decimal point {decimal_points[:5]} — Vietnamese uses a decimal comma (5,25)")
    for m in re.finditer(r"\d \%", text):
        warns["space before %"].append(text[max(0, m.start() - 10): m.end()])

    # Punctuation spacing
    for m in re.finditer(r"[\wÀ-ỹ\)] +[,.;:!?](?=\s|$)", text):
        errors.append(f"space before punctuation: {text[max(0, m.start() - 15): m.end() + 5]!r}")
        if len(errors) > 40:
            break
    for m in re.finditer(r"[,;:](?=[A-Za-zÀ-ỹ])", text):
        ctx = text[max(0, m.start() - 15): m.end() + 10]
        if not re.search(r"\d[,:]\d|https?|:\/\/", ctx):
            warns["missing space after punctuation"].append(ctx)
    for m in re.finditer(r", (?:và|hoặc) ", text):
        errors.append(f"comma before và/hoặc: {text[max(0, m.start() - 20): m.end() + 10]!r}")

    # Headings: Title Case
    for line in text.splitlines():
        h = re.match(r"\s*#{1,6}\s+(.*)", line)
        if not h:
            continue
        words = [w for w in re.findall(r"[\wÀ-ỹ]+", h.group(1)) if w.isalpha()]
        if len(words) >= 4 and sum(w[0].isupper() for w in words[1:]) >= len(words[1:]) * 0.75:
            warns["Title Case heading (Vietnamese uses sentence case)"].append(h.group(1))

    # Translationese
    for pat, msg in TRANSLATIONESE:
        for m in re.finditer(pat, text):
            warns[msg].append(text[max(0, m.start() - 20): m.end() + 20].replace("\n", " "))
    for sent in re.split(r"(?<=[.!?])\s+|\n", text):
        if len(re.findall(r"\bcủa\b", sent)) >= 3:
            warns["3+ 'của' in one sentence — restructure"].append(sent.strip()[:90])

    # Administrative capitalisation
    if a.admin:
        for m in re.finditer(r"\b(thứ (?:hai|ba|tư|năm|sáu|bảy)|tháng (?:một|hai|ba|tư|năm|sáu|bảy|tám|chín|mười|mười một|mười hai))\b", text):
            warns["day/month in words must be capitalised: thứ Hai, tháng Năm (Decree 30 App. II)"].append(m.group(0))
        for m in re.finditer(r"\bTháng (?:\d|Một|Hai|Ba|Tư|Năm|Sáu|Bảy|Tám|Chín|Mười)|\bThứ (?:Hai|Ba|Tư|Năm|Sáu|Bảy)", text):
            pre = text[max(0, m.start() - 2): m.start()]
            if pre.strip() and pre.strip()[-1] not in ".!?\n":
                warns["'Thứ/Tháng' capitalised mid-sentence: write thứ Hai, tháng Năm"].append(m.group(0))

    for e in errors:
        print(f"ERROR  {e}")
    for k, items in warns.items():
        shown = "; ".join(repr(x) for x in items[: a.max])
        print(f"WARN   {k} ({len(items)}): {shown}")
    conv = "i (QĐ 1989)" if i_used and not y_used else "y (common)" if y_used and not i_used else "mixed" if i_used and y_used else "–"
    print(f"\n{path.name}: {len(errors)} error(s), {sum(len(v) for v in warns.values())} warning(s) · i/y convention: {conv}")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
