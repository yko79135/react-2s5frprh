# react-2s5frprh

## Weekly Lesson Plan Website (PDF → Draft → Shared Google Drive)

This project includes a website you can run locally to:

1. Upload syllabus PDFs into a persistent syllabus library
2. Choose subject + week
3. Add a brief class-plan note
4. Auto-generate a weekly lesson plan/report draft
5. Upload the generated draft to a specific folder in a shared Google Drive as a Google Doc

Main files:

- `web_app.py`: Streamlit website UI
- `lessonplan_bot.py`: parsing + draft generation + Google Docs/Drive upload logic
- `requirements-lessonplan.txt`: Python dependencies

## 1) Install dependencies

```bash
pip install -r requirements-lessonplan.txt
```

## 2) Run the website

```bash
streamlit run web_app.py
```

Then open the local URL shown in terminal (usually `http://localhost:8501`).

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
- Fill teacher/class settings

### Google Drive upload (optional)

- Enable upload
- Enter target **shared Drive folder ID**
- Upload a **service account JSON**
- Click **Generate Draft**

The app will:

- show generated weekly draft text
- allow TXT download
- upload to Google Docs in your selected Drive folder (if upload is enabled)

## Google permissions you need

Your service account must have permission to create files in the target shared-drive folder.

- Share the folder (or shared drive) with the service account email
- Ensure Google Drive API + Google Docs API are enabled in your Google Cloud project

## Optional CLI usage (advanced)

You can still run the CLI directly:

```bash
python lessonplan_bot.py \
  --syllabus "2025-2026 SS Syllabus Science G6.pdf" \
  --week 3 \
  --output weekly_lesson_plan_report.txt \
  --post-gdoc \
  --drive-folder-id "YOUR_FOLDER_ID" \
  --service-account service-account.json
```

## Download as ZIP for local use

From repo root:

```bash
zip -r lessonplan-website.zip . \
  -x "node_modules/*" ".git/*" "__pycache__/*" "*.pyc"
```

Security: never commit `credentials.json`, `token.json`, or service-account key files.
