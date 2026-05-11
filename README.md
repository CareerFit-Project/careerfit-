# CareerFit Unified Thesis Portal

This project merges the original public-facing CareerFit site and the full thesis survey into one static web app with:

- **Three respondent types:** College students, incoming college students, and working respondents
- Full thesis survey sections and scoring
- Degree-to-aligned-job exploration
- Respondent sign-in flow
- Profile and consent capture with type-aware fields
- Immediate results after survey submission
- Supabase-ready database storage
- Admin dashboard and CSV export

## Respondent types

| Type | Profile fields shown | Survey note |
|------|---------------------|-------------|
| College student | Student number, year level, school | Standard |
| Incoming college student | SHS strand, intended degree, SHS school | Expectation-based note shown |
| Working respondent | Job title, employer, industry, years experience | Workplace wording shown |

## Files

- `index.html`
- `styles.css`
- `app.js`
- `supabase-config.js`
- `supabase-schema.sql`

## Local preview

Open `index.html` in a browser. If Supabase is not configured yet, the site runs in local demo mode using browser `localStorage`.

## Supabase setup

1. Create a Supabase project.
2. Run the SQL in `supabase-schema.sql`.
3. Open `supabase-config.js`.
4. Replace the empty values with your project URL and anon key:

```js
window.CAREERFIT_SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
window.CAREERFIT_SUPABASE_ANON_KEY = "YOUR-ANON-KEY";
```

## Admin access

After creating a user account, make that account an admin in the `profiles` table by setting:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

## Notes

- The frontend uses structured degree-match data in `app.js`, and the database schema also includes a `degree_matches` table for future expansion.
- Respondents are limited to one final submission per account.
- The survey draft is saved locally in the browser until final submission.
