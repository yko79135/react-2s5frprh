#!/usr/bin/env python3
"""Regenerate src/data/course-deadlines.generated.json from holga-course-agent.

Reads config/courses.generated.yaml from a holga-course-agent checkout and
runs its own course_registry.material_tasks() (the exact formula that repo's
dashboard uses: study_guide/test_and_answer_key due 7 days before an
assessment, +4 more if the date is only estimated) to produce this repo's
assessment-deadline data. Never hand-edit the output file -- this script,
run by a scheduled Routine, is the only writer.

Usage: python3 scripts/sync_course_deadlines.py <path-to-holga-course-agent-checkout>

Exit codes:
  0 - ran fine, nothing changed (file left untouched)
  2 - ran fine, file was rewritten (caller should commit it)
  1 - usage/import error
"""
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


def main() -> None:
    if len(sys.argv) != 2:
        print("usage: sync_course_deadlines.py <holga-course-agent-path>", file=sys.stderr)
        sys.exit(1)

    holga_path = Path(sys.argv[1]).resolve()
    sys.path.insert(0, str(holga_path / "src"))
    from holga_agent.course_registry import load_registry, material_tasks  # noqa: E402

    registry = load_registry(holga_path / "config" / "courses.generated.yaml")
    tasks = material_tasks(registry)

    items = []
    for t in tasks:
        d = t.model_dump(mode="json")
        items.append(
            {
                "courseId": d["course_id"],
                "courseName": d["course_name"],
                "textbook": d["textbook"],
                "edition": d["edition"],
                "chapters": d["chapters"],
                "kind": d["kind"],
                "due": d["due"],
                "eventDate": d["event_date"],
                "dateStatus": d["date_status"],
                "label": d["label"],
            }
        )
    items.sort(key=lambda i: (i["due"], i["courseId"], i["textbook"], tuple(i["chapters"]), i["kind"]))

    source_commit = subprocess.run(
        ["git", "-C", str(holga_path), "rev-parse", "HEAD"],
        capture_output=True,
        text=True,
        check=True,
    ).stdout.strip()

    out_path = Path(__file__).resolve().parent.parent / "src" / "data" / "course-deadlines.generated.json"
    previous_items = []
    if out_path.exists():
        previous_items = json.loads(out_path.read_text(encoding="utf-8")).get("items", [])

    if previous_items == items:
        print("No change in assessment deadlines.")
        sys.exit(0)

    out = {
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "sourceCommit": source_commit,
        "items": items,
    }
    out_path.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Updated {out_path} with {len(items)} item(s) (was {len(previous_items)}).")
    sys.exit(2)


if __name__ == "__main__":
    main()
