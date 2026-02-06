from __future__ import annotations

import tempfile
from pathlib import Path

import streamlit as st

from lessonplan_bot import (
    WeekItem,
    build_week_text,
    create_google_doc_in_folder,
    extract_pdf_text_from_bytes,
    parse_weeks_from_syllabus,
)

st.set_page_config(page_title="Lesson Plan Draft + Google Drive Uploader", layout="centered")
st.title("Weekly Lesson Plan Draft Uploader")
st.caption("Upload syllabus PDF → pick week → draft plan → optionally upload to shared Google Drive.")

uploaded_pdf = st.file_uploader("Syllabus PDF", type=["pdf"])

if uploaded_pdf is None:
    st.info("Upload a syllabus PDF to begin.")
    st.stop()

pdf_bytes = uploaded_pdf.read()

try:
    extracted = extract_pdf_text_from_bytes(pdf_bytes)
    weeks = parse_weeks_from_syllabus(extracted)
except Exception as exc:  # runtime parse errors shown to user
    st.error(f"Failed to parse syllabus PDF: {exc}")
    st.stop()

if not weeks:
    st.warning("No week rows found in this PDF. Expected format like '1주 2.23-2.27'.")
    st.stop()

week_map = {f"Week {w.week_no} ({w.date_range})": w for w in weeks}
selected_key = st.selectbox("Which week is this report for?", options=list(week_map.keys()))
selected_week: WeekItem = week_map[selected_key]

st.subheader("Class settings")
teacher_name = st.text_input("Teacher name", value="Teacher Name")
class_name = st.text_input("Class name", value="Life Science (G6)")
schedule_note = st.text_input("Schedule", value="Tue (10:30–11:10), Thu (09:45–10:25)")
teacher_materials = st.text_input(
    "Teacher materials",
    value="Whiteboard marker, slides/handouts, textbook, timer",
)
student_materials = st.text_input(
    "Student materials",
    value="Textbook, notebook, pencil, highlighter",
)
include_prayer = st.checkbox("Include prayer line", value=False)

st.subheader("Google Drive destination")
upload_to_drive = st.checkbox("Upload draft to Google Drive as Google Doc", value=True)
drive_folder_id = st.text_input("Drive folder ID (shared drive folder supported)", value="")
doc_title = st.text_input("Google Doc title", value=f"Weekly Plan - Week {selected_week.week_no}")

service_account_upload = st.file_uploader(
    "Service account JSON (required for Drive upload)",
    type=["json"],
    help="Upload a Google service account JSON key that has write access to the target shared drive folder.",
)

if st.button("Generate Draft"):
    draft_text = build_week_text(
        week=selected_week,
        teacher_name=teacher_name,
        class_name=class_name,
        schedule_note=schedule_note,
        teacher_materials=teacher_materials,
        student_materials=student_materials,
        include_prayer=include_prayer,
    )

    st.success("Draft generated.")
    st.text_area("Generated draft", value=draft_text, height=420)
    st.download_button(
        "Download draft as .txt",
        data=draft_text,
        file_name=f"week_{selected_week.week_no}_lesson_plan_report.txt",
        mime="text/plain",
    )

    if upload_to_drive:
        if not drive_folder_id.strip():
            st.error("Drive folder ID is required to upload.")
            st.stop()
        if service_account_upload is None:
            st.error("Service account JSON is required for upload.")
            st.stop()

        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
            tmp.write(service_account_upload.read())
            service_account_path = Path(tmp.name)

        try:
            doc_url = create_google_doc_in_folder(
                doc_title=doc_title,
                doc_text=draft_text,
                folder_id=drive_folder_id.strip(),
                credentials_path=Path("credentials.json"),
                token_path=Path("token.json"),
                service_account_path=service_account_path,
            )
            st.success("Uploaded to Google Drive successfully.")
            st.markdown(f"[Open Google Doc]({doc_url})")
        except Exception as exc:  # runtime upload errors shown to user
            st.error(f"Google Drive upload failed: {exc}")
        finally:
            service_account_path.unlink(missing_ok=True)
