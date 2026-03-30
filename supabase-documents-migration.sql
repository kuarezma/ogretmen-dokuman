alter table public.documents
add column if not exists answer_key_text text;

alter table public.documents
add column if not exists solution_url text;
