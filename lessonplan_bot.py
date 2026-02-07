#!/usr/bin/env python3
"""Generate weekly lesson plans/reports from a syllabus PDF, with optional Google Docs publishing."""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Iterable


@dataclass
class WeekItem:
    week_no: int
    date_range: str
    events: list[str]
    details: str


def _get_pdf_reader(binary_data: bytes | None = None, path: Path | None = None):
    pdf_reader_cls = None
    missing_errors: list[str] = []

    try:
        from pypdf import PdfReader as PypdfReader

        pdf_reader_cls = PypdfReader
    except ModuleNotFoundError as exc:
        missing_errors.append(f"pypdf: {exc}")

    if pdf_reader_cls is None:
        try:
            from PyPDF2 import PdfReader as PyPDF2Reader

            pdf_reader_cls = PyPDF2Reader
        except ModuleNotFoundError as exc:
            missing_errors.append(f"PyPDF2: {exc}")

    if pdf_reader_cls is None:
        details = " | ".join(missing_errors)
        raise ModuleNotFoundError(
            "Missing PDF parser dependency. Install with: pip install -r requirements-lessonplan.txt "
            f"(details: {details})"
        )

    if binary_data is not None:
        return pdf_reader_cls(BytesIO(binary_data))
    if path is not None:
        return pdf_reader_cls(str(path))
    raise ValueError("Provide either binary_data or path")


def extract_pdf_text(path: Path) -> str:
    reader = _get_pdf_reader(path=path)
    return "\n".join((page.extract_text() or "") for page in reader.pages)


def extract_pdf_text_from_bytes(pdf_data: bytes) -> str:
    reader = _get_pdf_reader(binary_data=pdf_data)
    return "\n".join((page.extract_text() or "") for page in reader.pages)


def parse_weeks_from_syllabus(text: str) -> list[WeekItem]:
    normalized = re.sub(r"[ \t]+", " ", text)
    normalized = re.sub(r"\n{3,}", "\n\n", normalized).strip()

    week_header_re = re.compile(r"(\d+)\s*주\s+(\d{1,2}\.\d{1,2}-\d{1,2}\.\d{1,2})")
    headers = list(week_header_re.finditer(normalized))
    weeks: list[WeekItem] = []

    for idx, match in enumerate(headers):
        start = match.end()
        end = headers[idx + 1].start() if idx + 1 < len(headers) else len(normalized)
        block = normalized[start:end].strip()

        lines = [line.strip() for line in block.split("\n") if line.strip()]
        details = "TBD"
        events = lines

        if lines:
            last = lines[-1]
            if re.search(r"(TBD|—|-|,|\d{1,2}[A-Z])", last):
                details = re.sub(r"\s*,\s*", ", ", last).strip()
                events = lines[:-1]

        weeks.append(
            WeekItem(
                week_no=int(match.group(1)),
                date_range=match.group(2),
                events=events,
                details=details,
            )
        )

    return weeks


def build_week_text(
    week: WeekItem,
    teacher_name: str,
    class_name: str,
    schedule_note: str,
    teacher_materials: str,
    student_materials: str,
    include_prayer: bool,
    subject: str | None = None,
    class_plan_input: str | None = None,
) -> str:
    events_text = "\n".join(f"- {event}" for event in week.events) if week.events else "- (No special events listed)"

    prayer_line = "Start with a prayer.\n" if include_prayer else ""
    subject_line = subject or class_name
    class_plan_line = class_plan_input.strip() if class_plan_input else "(No additional class plan note provided)"

    return f"""Week {week.week_no} ({week.date_range})

Teacher: {teacher_name}
Class: {class_name}
Subject: {subject_line}
Schedule: {schedule_note}

Teacher class plan input
- {class_plan_line}

Materials
- Teacher: {teacher_materials}
- Student: {student_materials}

Syllabus focus
{events_text}

Class Theme & Goal
Theme: Week {week.week_no} — Sections {week.details}
Goals:
- Cover textbook sections: {week.details}
- Check understanding with quick oral questions + one short written check
- Collect or spot-check homework

Lesson Plan (template)
{prayer_line}Intro (5–10 min): Warm-up review from last week + key vocabulary preview.
Development (25–35 min): Direct teaching + guided reading/discussion + mini-lab/demo if relevant.
Practice (10–15 min): Workbook/questions + partner check.
End (5 min): Exit ticket + homework reminder.

Report (to fill after teaching)
Evaluation:
- What went well:
- What needs improvement:

Issues on students:
- (Name) —
- (Name) —

--------------------------------------------

"""


def generate_document_text(
    weeks: Iterable[WeekItem],
    doc_title: str,
    teacher_name: str,
    class_name: str,
    schedule_note: str,
    teacher_materials: str,
    student_materials: str,
    include_prayer: bool,
) -> str:
    header = f"""{doc_title}

(Generated automatically from syllabus PDF)

============================================

"""
    body = "".join(
        build_week_text(
            week,
            teacher_name,
            class_name,
            schedule_note,
            teacher_materials,
            student_materials,
            include_prayer,
        )
        for week in weeks
    )
    return header + body


def create_google_doc_in_folder(
    doc_title: str,
    doc_text: str,
    folder_id: str,
    credentials_path: Path,
    token_path: Path,
    service_account_path: Path | None,
) -> str:
    from google.oauth2.credentials import Credentials
    from google.oauth2.service_account import Credentials as ServiceAccountCredentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build

    scopes = [
        "https://www.googleapis.com/auth/documents",
        "https://www.googleapis.com/auth/drive.file",
    ]

    if service_account_path:
        creds = ServiceAccountCredentials.from_service_account_file(str(service_account_path), scopes=scopes)
    else:
        creds = None
        if token_path.exists():
            creds = Credentials.from_authorized_user_file(str(token_path), scopes)
        if not creds or not creds.valid:
            flow = InstalledAppFlow.from_client_secrets_file(str(credentials_path), scopes)
            creds = flow.run_local_server(port=0)
            token_path.write_text(creds.to_json(), encoding="utf-8")

    drive_service = build("drive", "v3", credentials=creds)
    docs_service = build("docs", "v1", credentials=creds)

    file_meta = {
        "name": doc_title,
        "mimeType": "application/vnd.google-apps.document",
        "parents": [folder_id],
    }
    created = (
        drive_service.files()
        .create(body=file_meta, fields="id", supportsAllDrives=True)
        .execute()
    )
    doc_id = created["id"]

    docs_service.documents().batchUpdate(
        documentId=doc_id,
        body={"requests": [{"insertText": {"location": {"index": 1}, "text": doc_text}}]},
    ).execute()

    return f"https://docs.google.com/document/d/{doc_id}/edit"


def publish_to_google_docs(
    doc_title: str,
    doc_text: str,
    credentials_path: Path,
    token_path: Path,
    service_account_path: Path | None,
) -> str:
    return create_google_doc_in_folder(
        doc_title=doc_title,
        doc_text=doc_text,
        folder_id="root",
        credentials_path=credentials_path,
        token_path=token_path,
        service_account_path=service_account_path,
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Generate weekly lesson plans/reports from a syllabus PDF and optionally post to Google Docs."
    )
    parser.add_argument("--syllabus", required=True, type=Path, help="Path to syllabus PDF file")
    parser.add_argument("--output", type=Path, default=Path("weekly_lesson_plan_report.txt"))
    parser.add_argument("--doc-title", default="G6 Life Science — Weekly Lesson Plan & Report (Auto)")
    parser.add_argument("--teacher-name", default="Teacher Name")
    parser.add_argument("--class-name", default="Life Science (G6)")
    parser.add_argument("--schedule-note", default="Tue (10:30–11:10), Thu (09:45–10:25)")
    parser.add_argument("--teacher-materials", default="Whiteboard marker, slides/handouts, textbook, timer")
    parser.add_argument("--student-materials", default="Textbook, notebook, pencil, highlighter")
    parser.add_argument("--include-prayer", action="store_true")
    parser.add_argument("--post-gdoc", action="store_true")
    parser.add_argument("--drive-folder-id", default="root", help="Google Drive folder ID (supports shared drives)")
    parser.add_argument("--credentials", type=Path, default=Path("credentials.json"))
    parser.add_argument("--token", type=Path, default=Path("token.json"))
    parser.add_argument("--service-account", type=Path, default=None)
    parser.add_argument("--week", type=int, default=None, help="Optional week number to generate only one week")
    return parser


def main() -> None:
    args = build_parser().parse_args()

    if not args.syllabus.exists():
        raise FileNotFoundError(f"Syllabus PDF not found: {args.syllabus}")

    text = extract_pdf_text(args.syllabus)
    weeks = parse_weeks_from_syllabus(text)
    if not weeks:
        raise RuntimeError("Could not parse any week rows from syllabus PDF. Check format or parser regex.")

    selected_weeks = weeks
    if args.week is not None:
        selected_weeks = [week for week in weeks if week.week_no == args.week]
        if not selected_weeks:
            raise RuntimeError(f"Week {args.week} not found in syllabus")

    doc_text = generate_document_text(
        weeks=selected_weeks,
        doc_title=args.doc_title,
        teacher_name=args.teacher_name,
        class_name=args.class_name,
        schedule_note=args.schedule_note,
        teacher_materials=args.teacher_materials,
        student_materials=args.student_materials,
        include_prayer=args.include_prayer,
    )

    args.output.write_text(doc_text, encoding="utf-8")
    print(f"Saved generated plan/report to: {args.output}")

    if args.post_gdoc:
        if not args.service_account and not args.credentials.exists():
            raise FileNotFoundError(
                f"Google credentials file not found: {args.credentials}. "
                "Download OAuth Desktop App credentials from Google Cloud Console first."
            )
        if args.service_account and not args.service_account.exists():
            raise FileNotFoundError(f"Service account file not found: {args.service_account}")

        doc_url = create_google_doc_in_folder(
            doc_title=args.doc_title,
            doc_text=doc_text,
            folder_id=args.drive_folder_id,
            credentials_path=args.credentials,
            token_path=args.token,
            service_account_path=args.service_account,
        )
        print(f"Published Google Doc: {doc_url}")


if __name__ == "__main__":
    main()
