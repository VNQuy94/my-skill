#!/usr/bin/env python3
"""Find eval-prompt content that also appears in the skill's own files.

Usage: check_leakage.py <skill_dir> [--n 3] [--min-hits 1]

If a skill's examples share topic words with its eval prompts, the agent copies
the example and the eval stops measuring the method. This script lists word
n-grams (default trigrams) and distinctive numbers/names that occur both in an
eval prompt and anywhere in the skill outside evals/. Exit 1 if any are found.
"""
import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _ws import load_evals  # noqa: E402

STOP = set("""và của cho các những một được trong với này là có không thì để khi nếu như
the a an of to in on for and or is are be with by as at from this that it
""".split())


def words(text: str) -> list[str]:
    return [w for w in re.findall(r"[\wÀ-ỹ]+", text.lower()) if len(w) > 1]


def ngrams(ws: list[str], n: int) -> set[tuple[str, ...]]:
    out = set()
    for i in range(len(ws) - n + 1):
        g = tuple(ws[i : i + n])
        if sum(w in STOP for w in g) <= n // 2:
            out.add(g)
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("skill_dir")
    ap.add_argument("--n", type=int, default=3, help="n-gram length (default 3)")
    a = ap.parse_args()
    skill = Path(a.skill_dir).resolve()
    data = load_evals(skill)

    corpus_files = [p for p in skill.rglob("*") if p.is_file() and "evals" not in p.relative_to(skill).parts
                    and p.suffix in {".md", ".json", ".typ", ".js", ".py", ".txt", ".sh", ".yaml", ".yml"}]
    corpus = {p: p.read_text(errors="ignore") for p in corpus_files}
    corpus_grams = {p: ngrams(words(t), a.n) for p, t in corpus.items()}

    found = 0
    for e in data["evals"]:
        pw = words(e["prompt"])
        pg = ngrams(pw, a.n)
        # distinctive tokens: numbers with separators and capitalised words from the raw prompt
        tokens = set(re.findall(r"\d+[.,/]\d+(?:[.,/]\d+)?", e["prompt"])) | {
            w for w in re.findall(r"\b[A-ZĐ][\wÀ-ỹ]{3,}\b", e["prompt"]) if w.lower() not in STOP
        }
        hits = []
        for p, grams in corpus_grams.items():
            common = pg & grams
            toks = {t for t in tokens if t in corpus[p]}
            if common or toks:
                hits.append((p, common, toks))
        if hits:
            print(f"eval {e['id']} ({e['name']}):")
            for p, common, toks in hits:
                rel = p.relative_to(skill)
                shown = [" ".join(g) for g in sorted(common)][:8]
                print(f"  {rel}: {len(common)} shared {a.n}-grams {shown}" + (f"; tokens {sorted(toks)}" if toks else ""))
            found += 1
    if found:
        print(f"\n{found} eval(s) overlap with skill content. Review: generic phrases are fine; shared topic, numbers, or names are leakage.")
        sys.exit(1)
    print("No overlap between eval prompts and skill content.")


if __name__ == "__main__":
    main()
