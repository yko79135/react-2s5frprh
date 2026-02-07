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
- `lessonplan_bot.py`: parsing + draft generation logic
- `requirements.txt`: deployment dependencies (Streamlit Cloud)

## 1) Install dependencies

```bash
pip install -r requirements.txt
```

## 2) Run the website

```bash
streamlit run web_app.py
```

Then open the URL shown in terminal (usually `http://localhost:8501`).

## 3) Use the website

### Syllabus library (persistent)

- Upload a syllabus PDF and click **Save uploaded syllabus**
- The file is stored under `data/syllabi/` and indexed in `data/syllabi_index.json`
- Saved syllabuses stay available until you delete them from the app

### Draft inputs

- Select a saved syllabus
- Input **subject**
- Select **week**
- Add a brief **class plan note**
- Teacher name is prefilled as **고영찬**

### Edit + export

- Click **Generate Draft**
- Edit in the **Edit before finalizing** box
- Download as TXT or PDF

## Shared Drive upload note

If you are not an admin and do not have a service account with proper shared-drive permissions, automated Google Drive upload from hosted Streamlit is usually unreliable.

Recommended fallback workflow:

1. Generate + edit in app
2. Download PDF
3. Upload manually to your target shared-drive folder

## Optional CLI usage (advanced)

```bash
python lessonplan_bot.py \
  --syllabus "2025-2026 SS Syllabus Science G6.pdf" \
  --week 3 \
  --output weekly_lesson_plan_report.txt
```

## Download as ZIP for local use

```bash
zip -r lessonplan-website.zip . \
  -x "node_modules/*" ".git/*" "__pycache__/*" "*.pyc"
```

Security: never commit `credentials.json`, `token.json`, or service-account key files.
