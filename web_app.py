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


def draft_to_pdf_bytes(
    *,
    teacher_name: str,
    subject_name: str,
    class_target: str,
    lesson_datetime: str,
    materials: str,
    lesson_topic: str,
    lesson_goal: str,
    intro_time: str,
    intro_content: str,
    develop_time: str,
    develop_content: str,
    closing_time: str,
    closing_content: str,
    evaluation: str,
    student_notes: str,
) -> bytes:
    try:
        from fpdf import FPDF
        from fpdf.errors import FPDFException
    except ModuleNotFoundError as exc:
        raise ModuleNotFoundError("Missing PDF export dependency. Install fpdf2 from requirements.") from exc

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Dark theme similar to requested sample image.
    pdf.set_fill_color(35, 35, 35)
    pdf.set_text_color(245, 245, 245)
    pdf.set_draw_color(220, 220, 220)
    pdf.rect(0, 0, 210, 297, style="F")

    left = 10
    top = 10
    page_w = 190

    def safe_write_box(x: float, y: float, w: float, h: float, text: str, bold: bool = False, align: str = "L") -> None:
        pdf.rect(x, y, w, h)
        pdf.set_xy(x + 2, y + 2)
        pdf.set_font("Helvetica", "B" if bold else "", 11)
        safe_text = (text or "").encode("latin-1", "replace").decode("latin-1")
        try:
            pdf.multi_cell(w - 4, 6, safe_text, align=align)
        except FPDFException:
            chunk_size = 70
            for i in range(0, len(safe_text), chunk_size):
                pdf.multi_cell(w - 4, 6, safe_text[i : i + chunk_size], align=align)

    # Title
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_xy(left, top)
    pdf.cell(page_w, 10, "Weekly Lesson Plan & Report", align="C")
    y = top + 14

    # Teacher / meta row
    half = page_w / 2
    safe_write_box(
        left,
        y,
        half,
        22,
        f"Teacher: {teacher_name}\nSubject: {subject_name}",
    )
    safe_write_box(
        left + half,
        y,
        half,
        22,
        f"Date/Class: {lesson_datetime}\nTarget: {class_target}",
    )
    y += 22

    safe_write_box(left, y, page_w, 12, f"Materials / Preparation: {materials}")
    y += 16

    safe_write_box(left, y, page_w, 10, "Lesson Theme & Objective", bold=True, align="C")
    y += 10
    safe_write_box(left, y, page_w, 24, f"Theme: {lesson_topic}\nObjective: {lesson_goal}")
    y += 30

    safe_write_box(left, y, page_w, 10, "Lesson Plan", bold=True, align="C")
    y += 10

    # Lesson plan table header
    col_phase, col_time, col_content, col_note = 15, 25, 119, 31
    safe_write_box(left, y, col_phase, 10, "Phase", bold=True, align="C")
    safe_write_box(left + col_phase, y, col_time, 10, "Time", bold=True, align="C")
    safe_write_box(left + col_phase + col_time, y, col_content, 10, "Content", bold=True, align="C")
    safe_write_box(left + col_phase + col_time + col_content, y, col_note, 10, "Remarks", bold=True, align="C")
    y += 10

    intro_h, dev_h, end_h = 24, 64, 24
    safe_write_box(left, y, col_phase, intro_h, "Intro", bold=True, align="C")
    safe_write_box(left + col_phase, y, col_time, intro_h, intro_time, align="C")
    safe_write_box(left + col_phase + col_time, y, col_content, intro_h, intro_content)
    safe_write_box(left + col_phase + col_time + col_content, y, col_note, intro_h, "")
    y += intro_h

    safe_write_box(left, y, col_phase, dev_h, "Development", bold=True, align="C")
    safe_write_box(left + col_phase, y, col_time, dev_h, develop_time, align="C")
    safe_write_box(left + col_phase + col_time, y, col_content, dev_h, develop_content)
    safe_write_box(left + col_phase + col_time + col_content, y, col_note, dev_h, "")
    y += dev_h

    safe_write_box(left, y, col_phase, end_h, "Closure", bold=True, align="C")
    safe_write_box(left + col_phase, y, col_time, end_h, closing_time, align="C")
    safe_write_box(left + col_phase + col_time, y, col_content, end_h, closing_content)
    safe_write_box(left + col_phase + col_time + col_content, y, col_note, end_h, "")
    y += end_h + 6

    safe_write_box(left, y, page_w, 10, "Lesson Report", bold=True, align="C")
    y += 10
    safe_write_box(left, y, page_w, 20, f"Evaluation:\n{evaluation}")
    y += 20
    safe_write_box(left, y, page_w, 18, f"Student notes:\n{student_notes}")

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

valid_items = [
    item
    for item in index
    if isinstance(item, dict)
    and item.get("display_name")
    and item.get("uploaded_at")
    and item.get("stored_name")
    and item.get("id")
]
if not valid_items:
    st.error("Saved syllabus index is invalid. Please delete and re-upload syllabuses.")
    st.stop()

options = {f"{item['display_name']} (uploaded {item['uploaded_at']})": item for item in valid_items}
labels = list(options.keys())
selected_label = st.selectbox("Select a syllabus from saved library", options=labels, index=0)
if selected_label not in options:
    st.warning("Please select a syllabus to continue.")
    st.stop()
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

    st.subheader("PDF format fields (template)")
    class_target = st.text_input("Target class/group", value=class_name)
    lesson_datetime = st.text_input("Lesson date/time", value=f"Week {selected_week.week_no} ({selected_week.date_range})")
    materials_pdf = st.text_input("Materials / preparation", value=f"Teacher: {teacher_materials} | Student: {student_materials}")
    lesson_topic = st.text_input("Lesson theme", value=subject)
    lesson_goal = st.text_area("Lesson objective", value=class_plan_input)

    intro_time = st.text_input("Intro time", value="11:15-11:20")
    intro_content = st.text_area("Intro content", value="Opening, attendance, and warm-up review.")
    develop_time = st.text_input("Development time", value="11:20-11:50")
    develop_content = st.text_area("Development content", value=edited_text)
    closing_time = st.text_input("Closure time", value="11:50-11:55")
    closing_content = st.text_area("Closure content", value="Exit ticket, summary, and cleanup.")
    evaluation = st.text_area("Lesson evaluation", value="")
    student_notes = st.text_area("Student-specific notes", value="")

    filename_base = f"{subject.lower().replace(' ', '_')}_week_{selected_week.week_no}_lesson_plan_report"

    st.download_button(
        "Download draft as TXT",
        data=edited_text,
        file_name=f"{filename_base}.txt",
        mime="text/plain",
    )

    try:
        pdf_bytes = draft_to_pdf_bytes(
            teacher_name=teacher_name,
            subject_name=subject,
            class_target=class_target,
            lesson_datetime=lesson_datetime,
            materials=materials_pdf,
            lesson_topic=lesson_topic,
            lesson_goal=lesson_goal,
            intro_time=intro_time,
            intro_content=intro_content,
            develop_time=develop_time,
            develop_content=develop_content,
            closing_time=closing_time,
            closing_content=closing_content,
            evaluation=evaluation,
            student_notes=student_notes,
        )
        st.download_button(
            "Download draft as PDF",
            data=pdf_bytes,
            file_name=f"{filename_base}.pdf",
            mime="application/pdf",
        )
    except ModuleNotFoundError as exc:
        st.warning(f"PDF export unavailable: {exc}")
