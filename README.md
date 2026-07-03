# Balance Confirmation Generator

Upload an Excel file of trade payables → get back a zip of individual Word
balance confirmation letters, one per party.

## How it works
- `pages/index.js` — upload form (frontend)
- `pages/api/generate.js` — reads the Excel file, fills `templates/template.docx`
  for each row, zips the results, and sends the zip back
- `templates/template.docx` — your original balance confirmation letter, with
  `{party_name}` and `{balance}` placeholders in place of Kala Jyothi's details

## Excel format expected
A sheet with a column for the party name (e.g. "Name of the party") and a
column for the balance (e.g. "Balance as per books"). Extra columns are ignored.

## Run it locally
```
npm install
npm run dev
```
Open http://localhost:3000, upload your Excel file, and it will download a zip.

## Deploy for free on Vercel
1. Push this folder to a new GitHub repo (private is fine).
2. Go to vercel.com → Sign in with GitHub → "Add New Project" → pick the repo.
3. Leave all settings as default (Vercel auto-detects Next.js) → Deploy.
4. You'll get a free `yourproject.vercel.app` URL you can use from any device.

That's it — no database, no environment variables, no paid services needed.

## Updating the letter template
If you ever need to change the wording of the letter itself, edit
`templates/template.docx` directly in Word. Just keep the two tags exactly as
they are: `{party_name}` (used twice) and `{balance}` (used once). Don't
retype the curly braces with autocorrect/smart-quotes on, or Word may turn
them into curly typographic quotes and break the tag — turn off autocorrect
for quotes first, or copy-paste the tags from this file.
