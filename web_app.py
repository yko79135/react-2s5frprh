from __future__ import annotations

import json
import re
import tempfile
from datetime import datetime
from pathlib import Path

import streamlit as st

from lessonplan_bot import WeekItem, build_week_text, create_google_doc_in_folder, extract_pdf_text, parse_weeks_from_syllabus

DATA_DIR = Path("data")
SYLLABI_DIR = DATA_DIR / "syllabi"
INDEX_PATH = DATA_DIR / "syllabi_index.json"


def ensure_storage() -> None:
    SYLLABI_DIR.mkdir(parents=True, exist_ok=True)
    if not INDEX_PATH.exists():
        INDEX_PATH.write_text("[]", encoding="utf-8")


def load_index() -> list[dict]:
    ensure_storage()
    try:
        return json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []


def save_index(index: list[dict]) -> None:
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")


def sanitize_filename(name: str) -> str:
    safe = re.sub(r"[^a-zA-Z0-9._-]+", "_", name).strip("_")
    return safe or "syllabus.pdf"


def add_syllabus(uploaded_file) -> None:
    index = load_index()
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    safe_name = sanitize_filename(uploaded_file.name)
    stored_name = f"{timestamp}_{safe_name}"
    path = SYLLABI_DIR / stored_name
    path.write_bytes(uploaded_file.read())

    index.append(
        {
            "id": stored_name,
            "display_name": uploaded_file.name,
            "stored_name": stored_name,
            "uploaded_at": datetime.now().isoformat(timespec="seconds"),
        }
    )
    save_index(index)


def remove_syllabus(syllabus_id: str) -> None:
    index = load_index()
    updated = [item for item in index if item["id"] != syllabus_id]
    removed = [item for item in index if item["id"] == syllabus_id]

    for item in removed:
        file_path = SYLLABI_DIR / item["stored_name"]
        file_path.unlink(missing_ok=True)

    save_index(updated)


def parse_weeks_for_syllabus(stored_name: str) -> list[WeekItem]:
    text = extract_pdf_text(SYLLABI_DIR / stored_name)
    return parse_weeks_from_syllabus(text)


st.set_page_config(page_title="Lesson Plan Draft + Google Drive Uploader", layout="centered")
st.title("Weekly Lesson Plan Draft Uploader")
st.caption("Upload syllabuses permanently, pick subject/week, draft plans, and upload to shared Google Drive.")

ensure_storage()

st.header("1) Syllabus Library")
new_syllabus = st.file_uploader("Upload a new syllabus PDF", type=["pdf"])
if st.button("Save uploaded syllabus"):
    if new_syllabus is None:
        st.warning("Please choose a PDF before saving.")
    else:
        add_syllabus(new_syllabus)
        st.success("Syllabus saved to library.")
        st.rerun()

index = load_index()
if not index:
    st.info("No saved syllabuses yet. Upload one to continue.")
    st.stop()

options = {f"{item['display_name']} (uploaded {item['uploaded_at']})": item for item in index}
selected_label = st.selectbox("Select a syllabus from saved library", options=list(options.keys()))
selected_item = options[selected_label]

col1, col2 = st.columns([3, 1])
with col1:
    st.caption(f"Using: {selected_item['display_name']}")
with col2:
    if st.button("Delete this syllabus"):
        remove_syllabus(selected_item["id"])
        st.success("Syllabus deleted.")
        st.rerun()

try:
    weeks = parse_weeks_for_syllabus(selected_item["stored_name"])
except Exception as exc:  # runtime parse errors shown to user
    st.error(f"Failed to parse selected syllabus PDF: {exc}")
    st.stop()

if not weeks:
    st.warning("No week rows found in this PDF. Expected format like '1주 2.23-2.27'.")
    st.stop()

st.header("2) Draft Inputs")
subject = st.text_input("Which subject is this lesson plan for?", value="Life Science")
week_map = {f"Week {w.week_no} ({w.date_range})": w for w in weeks}
selected_key = st.selectbox("Which week are you drafting?", options=list(week_map.keys()))
selected_week: WeekItem = week_map[selected_key]

class_plan_input = st.text_area(
    "What do you plan to do in this class? (brief note)",
    value="Quick review, introduce key concept, guided practice, and exit ticket.",
)

teacher_name = st.text_input("Teacher name", value="Teacher Name")
class_name = st.text_input("Class name", value="Grade 6")
schedule_note = st.text_input("Schedule", value="Tue (10:30–11:10), Thu (09:45–10:25)")
teacher_materials = st.text_input("Teacher materials", value="Whiteboard marker, slides/handouts, textbook, timer")
student_materials = st.text_input("Student materials", value="Textbook, notebook, pencil, highlighter")
include_prayer = st.checkbox("Include prayer line", value=False)

st.header("3) Optional Google Drive Upload")
upload_to_drive = st.checkbox("Upload draft to Google Drive as Google Doc", value=True)
drive_folder_id = st.text_input("Where in shared Google Drive to upload? (folder ID)", value="")
doc_title = st.text_input("Google Doc title", value=f"{subject} Weekly Plan - Week {selected_week.week_no}")

service_account_upload = st.file_uploader(
    "Service account JSON (required for Drive upload)",
    type=["json"],
    help="Upload a Google service account JSON key that has write access to the target shared-drive folder.",
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
        subject=subject,
        class_plan_input=class_plan_input,
    )

    st.success("Draft generated.")
    st.text_area("Generated draft", value=draft_text, height=420)
    st.download_button(
        "Download draft as .txt",
        data=draft_text,
        file_name=f"{subject.lower().replace(' ', '_')}_week_{selected_week.week_no}_lesson_plan_report.txt",
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
