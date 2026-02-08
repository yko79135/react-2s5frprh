# react-2s5frprh

## Weekly Lesson Plan Website (PDF → Draft → Edit → Export)

This project includes a website you can run on Streamlit to:

1. Upload syllabus PDFs into a persistent syllabus library
2. Choose subject + week
3. Add a brief class-plan note
4. Auto-generate a weekly lesson plan/report draft
5. Edit the draft before finalizing
6. Download final draft as TXT or PDF

Main files:

- `web_app.py`: Streamlit website UI
- `lessonplan_bot.py`: parsing + draft generation + optional Google Docs/Drive upload logic
- `requirements.txt`: deployment dependencies (Streamlit Cloud)
- `requirements-lessonplan.txt`: CLI/local dependencies (same package set)

## 1) Install dependencies

Use either file (they contain the same packages):

```bash
pip install -r requirements.txt
