#!/usr/bin/env python3
"""Create an eval iteration: folders, metadata, and ready-to-send run prompts.

Usage:
  init_run.py <skill_dir> --iteration N [--configs with_skill,without_skill]
              [--old PATH] [--date YYYY-MM-DD] [--runs 1]

Configs:
  with_skill     reads <skill_dir>/SKILL.md
  without_skill  no skill; told not to read the skill folder or its installed link
  old_skill      reads the snapshot given with --old (copy the old version first)

Writes <repo>/workspaces/<skill>/iteration-N/:
  eval-<id>-<name>/eval_metadata.json
  eval-<id>-<name>/<config>/run-K/outputs/
  prompts/run--<eval>--<config>--run-K.txt   (paste each as an Agent prompt)
"""
import argparse
import datetime as dt
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _ws import eval_dirname, load_evals, workspace, write_json  # noqa: E402

LOG_LINES = {
    # Ask only for facts about tool use. Asking subagents to write down their
    # plan/reflections can trip the API's reasoning_extraction safeguard.
    "sources": "sources.md: (a) numbered list of the exact web search queries you ran, in order; (b) list of URLs you opened",
    "commands": "notes.md: the commands you ran and the final output of any check/lint step",
    "none": None,
}


def build_prompt(e: dict, config: str, skill_dir: Path, old: Path | None, outputs: Path, date: str, data: dict) -> str:
    # run_deliverable: what the run must produce when graders get something derived from it
    deliverable = e.get("run_deliverable") or e.get("deliverable", "answer.md")
    log = LOG_LINES[e.get("log", data.get("log", "sources"))]
    lines = ["Complete this user request as a helpful assistant.", ""]
    if config == "with_skill":
        lines.append(f"Before starting, read {skill_dir / 'SKILL.md'} and follow it (open its reference files as it directs).")
    elif config == "old_skill":
        lines.append(f"Before starting, read {old / 'SKILL.md'} and follow it (open its supporting files as it directs).")
    else:
        deny = [str(skill_dir)] + [str(Path.home() / d / skill_dir.name) for d in (".claude/skills", ".agents/skills")]
        lines.append("Do not read or use anything under: " + ", ".join(deny) + ".")
    lines.append(f"Today is {date}. Do not spawn agents. Do not use the Skill tool for the skill being tested.")
    if data.get("tools_note"):
        lines.append(data["tools_note"])
    lines += ["", f"User request: {e['prompt']}", ""]
    if e.get("files"):
        lines.append("Input files: " + ", ".join(e["files"]))
    lines.append(f"Work inside {outputs}/ and leave the final deliverable there as {deliverable}.")
    if log:
        lines.append(f"Also write {log}.")
    lines.append("Reply with one line when finished.")
    return "\n".join(lines) + "\n"


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("skill_dir")
    ap.add_argument("--iteration", type=int, required=True)
    ap.add_argument("--configs", default="with_skill,without_skill")
    ap.add_argument("--old", help="path to a snapshot of the previous skill version (for old_skill)")
    ap.add_argument("--date", default=dt.date.today().isoformat())
    ap.add_argument("--runs", type=int, default=1, help="runs per eval × config (≥3 to judge small differences)")
    ap.add_argument("--root", help="workspaces root (default <repo>/workspaces)")
    a = ap.parse_args()

    skill = Path(a.skill_dir).resolve()
    data = load_evals(skill)
    configs = [c.strip() for c in a.configs.split(",") if c.strip()]
    if "old_skill" in configs and not a.old:
        sys.exit("init_run: old_skill needs --old <snapshot dir>")
    old = Path(a.old).resolve() if a.old else None
    it = workspace(skill.name, a.iteration, Path(a.root) if a.root else None)
    if it.exists() and any(it.iterdir()):
        sys.exit(f"init_run: {it} already exists; pick another --iteration")

    prompts = it / "prompts"
    prompts.mkdir(parents=True)
    made = []
    for e in data["evals"]:
        ed = it / eval_dirname(e)
        write_json(ed / "eval_metadata.json", {"eval_id": e["id"], "eval_name": e["name"], "prompt": e["prompt"],
                                               "assertions": e["assertions"], "rubric": e.get("rubric", data.get("rubric")),
                                               "deliverable": e.get("deliverable", "answer.md"), "log": e.get("log", data.get("log", "sources")),
                                               "grader_sees_log": e.get("grader_sees_log", data.get("grader_sees_log", False))})
        for c in configs:
            for k in range(1, a.runs + 1):
                out = ed / c / f"run-{k}" / "outputs"
                out.mkdir(parents=True)
                pf = prompts / f"run--{eval_dirname(e)}--{c}--run-{k}.txt"
                pf.write_text(build_prompt(e, c, skill, old, out, a.date, data))
                made.append(pf)
    write_json(it / "config.json", {"skill": str(skill), "configs": configs, "runs": a.runs, "date": a.date, "old": str(old) if old else None})
    print(f"iteration: {it}")
    print(f"{len(made)} run prompts in {prompts}/ — launch them all in ONE turn (one Agent call each), then record timing for each as it finishes:")
    for pf in made:
        print(f"  {pf.name}")


if __name__ == "__main__":
    main()
