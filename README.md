# react-2s5frprh

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/yko79135/react-2s5frprh)

## Syllabus → Weekly Lesson Plan Bot

This repository now includes `lessonplan_bot.py`, a Python CLI that:

- Parses a syllabus PDF with week rows (e.g. `1주 2.23-2.27` format)
- Drafts a weekly lesson plan + report block for each parsed week
- Writes all generated content to a local text file
- Optionally publishes the generated content to a new Google Doc

### 1) Install Python dependencies

```bash
pip install -r requirements-lessonplan.txt
```

### 2) Basic usage (generate local draft)

```bash
python lessonplan_bot.py \
  --syllabus "2025-2026 SS Syllabus Science G6.pdf" \
  --output weekly_lesson_plan_report.txt \
  --teacher-name "고영찬" \
  --class-name "Life Science (G6)"
```

### 3) Publish directly to Google Docs (local OAuth)

1. In Google Cloud Console, enable:
   - Google Docs API
   - Google Drive API
2. Create OAuth Client ID credentials for **Desktop app**
3. Save the downloaded file as `credentials.json` (or pass a custom path via `--credentials`)
4. Run:

```bash
python lessonplan_bot.py \
  --syllabus "2025-2026 SS Syllabus Science G6.pdf" \
  --output weekly_lesson_plan_report.txt \
  --post-gdoc
```

On first run, the script opens a browser for OAuth login and stores a token in `token.json`.

### 4) Run this in a new GitHub Environment (GitHub Actions)

A workflow is included at `.github/workflows/lessonplan-bot.yml` and uses the GitHub Environment named **`lessonplan-bot`**.

1. In your GitHub repo, go to **Settings → Environments → New environment** and create `lessonplan-bot`.
2. (Optional, only if posting to Google Docs) add environment secret:
   - `GOOGLE_SERVICE_ACCOUNT_JSON` = full JSON contents of your Google service account key
3. Go to **Actions → Lesson Plan Bot → Run workflow**.
4. Fill inputs:
   - `syllabus_path`: PDF path in repo
   - `output_path`: output `.txt`
   - `doc_title`: document title
   - `post_to_gdoc`: true/false

The workflow uploads the generated output as an artifact (`lesson-plan-output`).

> If `post_to_gdoc=true`, the workflow uses `--service-account` for non-interactive Google auth, which is suitable for CI.

Security note: local auth/secrets files (`credentials.json`, `token.json`, and `service-account.json`) are gitignored and should never be committed.

### Useful options

- `--doc-title "Custom document title"`
- `--schedule-note "Tue (10:30–11:10), Thu (09:45–10:25)"`
- `--include-prayer`
- `--teacher-materials "..."`
- `--student-materials "..."`
- `--credentials path/to/credentials.json`
- `--token path/to/token.json`
- `--service-account path/to/service-account.json`
