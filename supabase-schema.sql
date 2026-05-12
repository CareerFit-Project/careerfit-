create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  first_name text not null,
  last_name text not null,
  student_number text not null,
  age integer,
  sex text,
  year_level text,
  degree text not null,
  school text,
  job_title text,
  employer text,
  industry text,
  years_experience integer,
  shs_strand text,
  intended_degree text,
  respondent_type text not null default 'student',
  city text,
  province text,
  consent boolean not null default false,
  role text not null default 'respondent' check (role in ('respondent', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
add column if not exists respondent_type text not null default 'student'
check (respondent_type in ('student', 'incoming', 'working'));

alter table public.profiles add column if not exists employer text;
alter table public.profiles add column if not exists industry text;
alter table public.profiles add column if not exists years_experience integer;
alter table public.profiles add column if not exists shs_strand text;
alter table public.profiles add column if not exists intended_degree text;

create table if not exists public.degree_matches (
  id bigint generated always as identity primary key,
  cluster_key text unique not null,
  title text not null,
  keywords text[] not null default '{}',
  roles text[] not null default '{}',
  search_keywords text[] not null default '{}',
  guidance text,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  respondent_id uuid not null references public.profiles(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  hcm_total numeric,
  hcm_average numeric,
  hcm_interpretation text,
  payload jsonb not null default '{}'::jsonb,
  unique (respondent_id)
);

create table if not exists public.submission_answers (
  id bigint generated always as identity primary key,
  submission_id uuid not null references public.submissions(id) on delete cascade,
  section_key text not null,
  item_key text not null,
  value numeric not null,
  created_at timestamptz not null default now(),
  unique (submission_id, item_key)
);

create table if not exists public.submission_scores (
  id bigint generated always as identity primary key,
  submission_id uuid not null references public.submissions(id) on delete cascade,
  section_key text not null,
  section_title text not null,
  total numeric not null,
  average numeric not null,
  interpretation text not null,
  created_at timestamptz not null default now(),
  unique (submission_id, section_key)
);

insert into public.degree_matches (cluster_key, title, keywords, roles, search_keywords, guidance)
values
  (
    'psychology',
    'Psychology',
    array['psychology','bs psychology','ab psychology'],
    array['HR Assistant','Recruitment Associate','Guidance Office Staff','Behavioral Program Assistant','Research Assistant'],
    array['human resources','guidance','research','community services','behavioral programs'],
    'Search beyond clinic roles and include HR, guidance, research, and community-based pathways.'
  ),
  (
    'it',
    'IT and Computing',
    array['information technology','computer science','information systems','it','computing'],
    array['Junior Web Developer','IT Support Specialist','QA Analyst','Data Analyst','Systems Support Associate'],
    array['technical support','web','quality assurance','analytics','entry-level developer'],
    'Use title clusters like support, testing, analytics, software, and web to widen your search.'
  ),
  (
    'education',
    'Education',
    array['education','teacher education','elementary education','secondary education'],
    array['Teacher','Tutor','Learning Support Assistant','Academic Coordinator','Curriculum Support Staff'],
    array['teaching','tutorial','curriculum','learning support','school hiring'],
    'Check school hiring calendars, tutoring platforms, review centers, and learner support roles.'
  ),
  (
    'business',
    'Business and Management',
    array['business','marketing','management','accountancy','accounting','entrepreneurship'],
    array['Management Trainee','Marketing Assistant','Operations Analyst','Accounts Associate','Administrative Officer'],
    array['operations','accounts','marketing','admin','trainee'],
    'Filter by function and industry so your search includes both degree-aligned and transferable entry roles.'
  ),
  (
    'engineering',
    'Engineering',
    array['engineering','civil','mechanical','electrical','industrial'],
    array['Project Engineer','Site Engineer','Quality Assurance Engineer','Maintenance Engineer','Process Improvement Associate'],
    array['project','site','maintenance','quality assurance','process improvement'],
    'Use both discipline-specific titles and operations-related titles to uncover more aligned opportunities.'
  ),
  (
    'nursing',
    'Nursing and Allied Health',
    array['nursing','medical technology','medtech','public health','health sciences'],
    array['Staff Nurse','Clinic Assistant','Health Program Assistant','Medical Laboratory Aide','Patient Care Coordinator'],
    array['clinical','community health','patient care','health program','laboratory support'],
    'Search both hospital and community health roles to see a wider range of aligned opportunities.'
  )
on conflict (cluster_key) do nothing;

alter table public.profiles enable row level security;
alter table public.degree_matches enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_answers enable row level security;
alter table public.submission_scores enable row level security;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id and role = 'admin'
  );
$$;

create policy "profiles self read"
on public.profiles
for select
to authenticated
using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "profiles self insert"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles self update"
on public.profiles
for update
to authenticated
using (auth.uid() = id or public.is_admin(auth.uid()))
with check (auth.uid() = id or public.is_admin(auth.uid()));

create policy "degree matches readable"
on public.degree_matches
for select
to anon, authenticated
using (true);

create policy "submissions self read"
on public.submissions
for select
to authenticated
using (respondent_id = auth.uid() or public.is_admin(auth.uid()));

create policy "submissions self insert"
on public.submissions
for insert
to authenticated
with check (respondent_id = auth.uid());

create policy "submission answers self read"
on public.submission_answers
for select
to authenticated
using (
  exists (
    select 1
    from public.submissions s
    where s.id = submission_answers.submission_id
      and (s.respondent_id = auth.uid() or public.is_admin(auth.uid()))
  )
);

create policy "submission answers self insert"
on public.submission_answers
for insert
to authenticated
with check (
  exists (
    select 1
    from public.submissions s
    where s.id = submission_answers.submission_id
      and s.respondent_id = auth.uid()
  )
);

create policy "submission scores self read"
on public.submission_scores
for select
to authenticated
using (
  exists (
    select 1
    from public.submissions s
    where s.id = submission_scores.submission_id
      and (s.respondent_id = auth.uid() or public.is_admin(auth.uid()))
  )
);

create policy "submission scores self insert"
on public.submission_scores
for insert
to authenticated
with check (
  exists (
    select 1
    from public.submissions s
    where s.id = submission_scores.submission_id
      and s.respondent_id = auth.uid()
  )
);
