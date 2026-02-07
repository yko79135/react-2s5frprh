from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path

import streamlit as st

from lessonplan_bot import WeekItem, build_week_text, extract_pdf_text, parse_weeks_from_syllabus

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


def draft_to_pdf_bytes(text: str) -> bytes:
    try:
        from fpdf import FPDF
    except ModuleNotFoundError as exc:
        raise ModuleNotFoundError("Missing PDF export dependency. Install fpdf2 from requirements.") from exc

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Helvetica", size=11)

    for line in text.splitlines():
        safe_line = line.encode("latin-1", "replace").decode("latin-1")
        pdf.multi_cell(0, 7, safe_line)

    return bytes(pdf.output(dest="S"))


st.set_page_config(page_title="Lesson Plan Draft Builder", layout="centered")
st.title("Weekly Lesson Plan Draft Builder")
st.caption("Upload syllabuses permanently, pick subject/week, draft, edit, and export as TXT/PDF.")

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
except Exception as exc:
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

teacher_name = st.text_input("Teacher name", value="고영찬")
class_name = st.text_input("Class name", value="Grade 6")
schedule_note = st.text_input("Schedule", value="Tue (10:30–11:10), Thu (09:45–10:25)")
teacher_materials = st.text_input("Teacher materials", value="Whiteboard marker, slides/handouts, textbook, timer")
student_materials = st.text_input("Student materials", value="Textbook, notebook, pencil, highlighter")
include_prayer = st.checkbox("Include prayer line", value=False)

st.info(
    "Shared Drive upload without a service account/admin setup is usually not reliable in hosted Streamlit. "
    "Recommended workflow: edit draft here, then download as PDF or TXT and upload manually."
)

if st.button("Generate Draft"):
    st.session_state["draft_text"] = build_week_text(
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

if "draft_text" in st.session_state:
    st.header("3) Edit Draft")
    edited_text = st.text_area("Edit before finalizing", value=st.session_state["draft_text"], height=500)
    st.session_state["draft_text"] = edited_text

    filename_base = f"{subject.lower().replace(' ', '_')}_week_{selected_week.week_no}_lesson_plan_report"

    st.download_button(
        "Download draft as TXT",
        data=edited_text,
        file_name=f"{filename_base}.txt",
        mime="text/plain",
    )

    try:
        pdf_bytes = draft_to_pdf_bytes(edited_text)
        st.download_button(
            "Download draft as PDF",
            data=pdf_bytes,
            file_name=f"{filename_base}.pdf",
            mime="application/pdf",
        )
    except ModuleNotFoundError as exc:
        st.warning(f"PDF export unavailable: {exc}")
