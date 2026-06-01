-- =============================================================
--  CareerFit  ·  All-Data Flat View + Admin Policy
--  Run this in Supabase SQL Editor (Dashboard → SQL Editor)
--  Safe to run on an existing database — uses CREATE OR REPLACE
-- =============================================================

-- -----------------------------------------------------------
-- 1.  Flat view  ·  respondents_all_data
--     One row per respondent who has submitted the survey.
--     Columns:  identity → profile → scores (all 8 sections)
-- -----------------------------------------------------------
CREATE OR REPLACE VIEW public.respondents_all_data AS
SELECT
  -- ── Identity ──────────────────────────────────────────────
  p.id,
  p.email,

  -- ── Profile ───────────────────────────────────────────────
  p.respondent_type                               AS respondent_type,
  p.first_name,
  p.last_name,
  p.age,
  p.sex,
  -- "status" column: shows the relevant degree/course field
  -- depending on respondent type
  CASE p.respondent_type
    WHEN 'student'  THEN p.degree
    WHEN 'incoming' THEN p.intended_degree
    WHEN 'working'  THEN p.degree
    ELSE COALESCE(p.degree, p.intended_degree)
  END                                             AS status,
  -- friendly label for the status column
  CASE p.respondent_type
    WHEN 'student'  THEN 'Course / Degree'
    WHEN 'incoming' THEN 'Intended Course'
    WHEN 'working'  THEN 'Completed Degree'
    ELSE 'Course / Degree'
  END                                             AS status_label,
  p.school,
  p.job_title                                     AS current_job_title,
  p.employer                                      AS company,
  p.industry,
  p.years_experience                              AS years_of_work_experience,
  p.consent,

  -- ── Submission meta ───────────────────────────────────────
  s.id                                            AS submission_id,
  s.submitted_at,

  -- ── HCM  (Horizontal Career Mismatch) ────────────────────
  hcm.total                                       AS hcm_total,
  hcm.average                                     AS hcm_average,
  hcm.interpretation                              AS hcm_interpretation,

  -- ── PJA  (Perceived Job Availability) ────────────────────
  pja.total                                       AS pja_total,
  pja.average                                     AS pja_average,
  pja.interpretation                              AS pja_interpretation,

  -- ── PS   (Perceived Salary) ───────────────────────────────
  ps.total                                        AS ps_total,
  ps.average                                      AS ps_average,
  ps.interpretation                               AS ps_interpretation,

  -- ── LCC  (Location and Commuting Constraints) ────────────
  lcc.total                                       AS lcc_total,
  lcc.average                                     AS lcc_average,
  lcc.interpretation                              AS lcc_interpretation,

  -- ── FI   (Family Influence) ───────────────────────────────
  fi.total                                        AS fi_total,
  fi.average                                      AS fi_average,
  fi.interpretation                               AS fi_interpretation,

  -- ── CA   (Career Adaptability) ───────────────────────────
  ca.total                                        AS ca_total,
  ca.average                                      AS ca_average,
  ca.interpretation                               AS ca_interpretation,

  -- ── ER   (Employee Resilience) ───────────────────────────
  er.total                                        AS er_total,
  er.average                                      AS er_average,
  er.interpretation                               AS er_interpretation,

  -- ── WSE  (Work Self-Efficacy) ─────────────────────────────
  wse.total                                       AS wse_total,
  wse.average                                     AS wse_average,
  wse.interpretation                              AS wse_interpretation

FROM public.profiles        p
JOIN public.submissions     s   ON s.respondent_id = p.id

-- Each section score is left-joined so rows still appear
-- even if a section score is missing for any reason
LEFT JOIN public.submission_scores hcm
  ON hcm.submission_id = s.id AND hcm.section_key = 'HCM'
LEFT JOIN public.submission_scores pja
  ON pja.submission_id = s.id AND pja.section_key = 'PJA'
LEFT JOIN public.submission_scores ps
  ON  ps.submission_id = s.id AND  ps.section_key = 'PS'
LEFT JOIN public.submission_scores lcc
  ON lcc.submission_id = s.id AND lcc.section_key = 'LCC'
LEFT JOIN public.submission_scores fi
  ON  fi.submission_id = s.id AND  fi.section_key = 'FI'
LEFT JOIN public.submission_scores ca
  ON  ca.submission_id = s.id AND  ca.section_key = 'CA'
LEFT JOIN public.submission_scores er
  ON  er.submission_id = s.id AND  er.section_key = 'ER'
LEFT JOIN public.submission_scores wse
  ON wse.submission_id = s.id AND wse.section_key = 'WSE'

ORDER BY s.submitted_at DESC;


-- -----------------------------------------------------------
-- 2.  Row-level security for the view
--     Admins can read all rows; respondents see only their own.
-- -----------------------------------------------------------

-- Views inherit the RLS of the underlying tables in Supabase,
-- but granting SELECT on the view makes it accessible via the
-- REST/JS client and the Supabase Table Editor.
GRANT SELECT ON public.respondents_all_data TO authenticated;


-- -----------------------------------------------------------
-- 3.  (Optional) make sure submission_scores has an update policy
--     so that re-submissions can overwrite existing scores.
--     Skip if you already have one.
-- -----------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'submission_scores'
      AND policyname = 'submission scores self update'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "submission scores self update"
      ON public.submission_scores
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.submissions s
          WHERE s.id = submission_scores.submission_id
            AND s.respondent_id = auth.uid()
        )
      );
    $policy$;
  END IF;
END $$;

-- -----------------------------------------------------------
-- 4.  Verify — run this SELECT to preview the view structure
-- -----------------------------------------------------------
-- SELECT * FROM public.respondents_all_data LIMIT 5;
