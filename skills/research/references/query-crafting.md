# Query Crafting

How to turn a sub-question into queries that find the right sources. `search-strategy.md` decides *which angles* to search; this file decides *how to write the query*.

## 1. Shape

- **2–6 words**, mostly discriminating nouns and technical terms. Drop filler such as "how to", "best way", "please explain".
- **Broad first, then narrow.** A first query should show what exists and what it is called. Narrow once you know the vocabulary.
- **One sub-question per query.** Combined queries ("A vs B vs C pricing and performance") return shallow results for everything; search each item separately.
- Results empty or off-target → broaden, swap in a synonym, or switch language. Results flooded with generic pages → add a qualifier (version, component, error code, `site:`).

## 2. Language

Choose the language by where the best sources are written, not by the language the user writes in.

| Topic | Query language | Why |
|---|---|---|
| software, APIs, science, global products, research | English | primary docs, specs, issues, and papers are in English |
| Vietnamese law, tax, wages, procedures, prices, local companies, local news | Vietnamese | the authoritative sources are Vietnamese (e.g. `chinhphu.vn`, `vbpl.vn`, ministry sites) |
| Vietnam-specific use of a global technology | both | compare global docs with local practice |

Translate the user's term to the **canonical** English term first. Vietnamese terms often map to several English ones: "bộ nhớ đệm" → *cache*, "phân quyền" → *authorization / RBAC*, "hàng đợi" → *message queue*, "sao lưu gia tăng" → *incremental backup*. If unsure, run a terminology query first.

## 3. Precision tools

- **Error messages**: quote the stable part exactly and strip variable parts (paths, IDs, timestamps, line numbers).
  `"connection reset by peer" pgbouncer`, not `my app error connection reset by peer at /home/x/app.py line 42`.
- **Source targeting with `site:`**:
  - `site:github.com` → issues, discussions, real code
  - `site:stackoverflow.com`, `site:reddit.com`, `site:news.ycombinator.com` → practitioner experience (leads, not authority)
  - `site:arxiv.org` → papers
  - `site:<official-docs-domain>` → semantics and guarantees
  If the engine ignores `site:`, add the site name as a keyword instead.
- **Freshness**: add the current year (from today's date) or a version (`v17`, `2.x`, `changelog`, `release notes`) only when freshness matters. A year from memory silently biases results toward the past.
- **Acronyms**: expand them in at least one query; give ambiguous acronyms a context word (`CDC change data capture`, not `CDC`).

## 4. Vocabulary expansion

The first sources reveal the vocabulary practitioners actually use. Mine them:

- canonical names and synonyms (*advisory lock* / *application lock* / *named lock*);
- names of mechanisms, standards, parameters, or config keys mentioned in passing;
- names of alternatives and competing approaches;
- symptoms and error names used in issue trackers.

Queries built from these terms usually beat queries built from the user's wording.

## 5. Templates by query family

| Family | Templates (replace X / problem) |
|---|---|
| terminology | `X also called`, `X vs <neighbor term>`, `<Vietnamese term> tiếng Anh` |
| mechanism | `X how it works`, `X internals`, `X design doc` |
| solution | `<problem> approaches`, `<problem> pattern` |
| alternatives | `X alternatives`, `X vs Y` |
| failure modes | `X pitfalls`, `X production issues`, `X postmortem`, `X gotchas` |
| counter-evidence | `why not X`, `migrated away from X`, `X criticism`, `X regret` |
| boundary conditions | `X limitations`, `X when not to use`, `X at scale` |
| primary source | `X documentation <feature>`, `X changelog`, `X release notes`, `X spec` |
| current state | `X latest version`, `X <current year>`, `<văn bản> hiệu lực từ` |

Use the families that fit the sub-question. Counter-evidence and failure-mode queries are the ones agents skip most, and they are the ones most likely to change a recommendation.

## 6. Worked examples

**Practical problem (Vietnamese question, English sources)**
> "Cache Redis cho trang chi tiết sản phẩm nên đặt TTL bao lâu?"

- Weak: `best redis ttl`, or the whole question as one query
- Better, in rounds:
  1. `cache TTL selection` · `cache staleness tradeoff` (terminology + solution)
  2. from results: `cache stampede expiration jitter`, `cache invalidation on write` (evidence-driven)
  3. `TTL too long stale data incident` · `redis eviction policy docs` (challenge + primary)

**Error message**
- Weak: `postgres error when many connections`
- Better: `"remaining connection slots are reserved"` · `"remaining connection slots" pgbouncer` · `site:github.com "remaining connection slots" <framework>`

**Comparison**
> "Celery hay RQ cho job nền Python, khoảng 100k job/ngày?"

- Weak: `celery vs rq which is better`
- Better: one set per option, run in parallel:
  `celery visibility timeout redis` · `celery release notes` · `migrated away from celery`
  `rq job retry failure` · `rq changelog` · `rq limitations`
  plus the shared criterion: `python task queue throughput benchmark`

**Vietnamese current-state regulation**
> "Mức giảm trừ gia cảnh thuế TNCN hiện nay là bao nhiêu?"

- Better: `giảm trừ gia cảnh <current year>` · `nghị quyết giảm trừ gia cảnh mới nhất` · `site:mof.gov.vn giảm trừ gia cảnh`. Then confirm the document number and its effective date on an official page, and check whether a newer document has replaced it.

## 7. When results are poor

| Symptom | Fix |
|---|---|
| zero or irrelevant results | shorter query, synonym, other language, drop the quotes |
| SEO / content-farm pages | add `site:`, a technical term, `docs`, `github issue`, `spec` |
| only old results | add the current year or a version, search `changelog` / `release notes` |
| sources contradict | search the version or date difference, then read the primary source |
| same pages every time | change the query family, not just the word order |
