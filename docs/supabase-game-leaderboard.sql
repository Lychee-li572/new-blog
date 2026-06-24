create table if not exists public.game_leaderboard (
  id uuid primary key default gen_random_uuid(),
  game_slug text not null,
  rank smallint not null check (rank in (1, 2, 3)),
  username text not null,
  score integer not null check (score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_slug, rank)
);

comment on table public.game_leaderboard is '每个游戏只保存前三名成绩';

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_game_leaderboard_updated_at on public.game_leaderboard;
create trigger trg_game_leaderboard_updated_at
before update on public.game_leaderboard
for each row execute function public.update_updated_at_column();

alter table public.game_leaderboard enable row level security;

drop policy if exists "public read game leaderboard" on public.game_leaderboard;
create policy "public read game leaderboard"
on public.game_leaderboard
for select
using (true);

create or replace function public.get_game_top_scores(p_game_slug text)
returns table (
  game_slug text,
  rank smallint,
  username text,
  score integer,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    gl.game_slug,
    gl.rank,
    gl.username,
    gl.score,
    gl.created_at,
    gl.updated_at
  from public.game_leaderboard gl
  where gl.game_slug = p_game_slug
  order by gl.rank asc;
$$;

create or replace function public.submit_game_score(
  p_game_slug text,
  p_score integer,
  p_username text
) returns table (
  game_slug text,
  rank smallint,
  username text,
  score integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  trimmed_username text := trim(p_username);
  allowed_slugs text[] := array['2048', 'tetris'];
  min_existing integer;
  candidates jsonb;
  final_rows record;
  r smallint := 1;
begin
  if trimmed_username is null or length(trimmed_username) = 0 then
    raise exception 'username is required';
  end if;

  if length(trimmed_username) > 16 then
    raise exception 'username is too long';
  end if;

  if p_score is null or p_score < 0 then
    raise exception 'score must be a non-negative integer';
  end if;

  if not exists (
    select 1
    from unnest(allowed_slugs) as s(slug)
    where s.slug = p_game_slug
  ) then
    raise exception 'unknown game slug %', p_game_slug;
  end if;

  if not exists (
    select 1
    from public.game_leaderboard gl
    where gl.game_slug = p_game_slug
  ) then
    insert into public.game_leaderboard (game_slug, rank, username, score)
    values
      (p_game_slug, 1, trimmed_username, p_score),
      (p_game_slug, 2, '—', 0),
      (p_game_slug, 3, '—', 0);

    return query
    select gl.game_slug, gl.rank, gl.username, gl.score, gl.created_at, gl.updated_at
    from public.game_leaderboard gl
    where gl.game_slug = p_game_slug
    order by gl.rank asc;
  end if;

  select coalesce(min(gl.score), 0)
  into min_existing
  from public.game_leaderboard gl
  where gl.game_slug = p_game_slug;

  if p_score <= min_existing and (select count(*) from public.game_leaderboard gl where gl.game_slug = p_game_slug and gl.score > 0) >= 3 then
    return query
    select gl.game_slug, gl.rank, gl.username, gl.score, gl.created_at, gl.updated_at
    from public.game_leaderboard gl
    where gl.game_slug = p_game_slug
    order by gl.rank asc;
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object('username', t.username, 'score', t.score, 'created_at', t.created_at, 'updated_at', t.updated_at)
    order by t.score desc, t.created_at asc
  ), '[]'::jsonb)
  into candidates
  from (
    select gl.username, gl.score, gl.created_at, gl.updated_at
    from public.game_leaderboard gl
    where gl.game_slug = p_game_slug and gl.score > 0
    union all
    select trimmed_username, p_score, now(), now()
  ) t;

  select coalesce(jsonb_agg(elem order by idx), '[]'::jsonb)
  into candidates
  from (
    select elem, idx
    from jsonb_array_elements(candidates) with ordinality as t(elem, idx)
    where idx <= 3
  ) sub;

  delete from public.game_leaderboard gl
  where gl.game_slug = p_game_slug;

  for final_rows in (
    select
      (elem ->> 'username')::text as username,
      (elem ->> 'score')::integer as score,
      (elem ->> 'created_at')::timestamptz as created_at,
      (elem ->> 'updated_at')::timestamptz as updated_at
    from jsonb_array_elements(candidates) with ordinality as a(elem, idx)
    order by a.idx
  ) loop
    insert into public.game_leaderboard (game_slug, rank, username, score, created_at, updated_at)
    values (p_game_slug, r, final_rows.username, final_rows.score, final_rows.created_at, final_rows.updated_at);
    r := r + 1;
  end loop;

  while r <= 3 loop
    insert into public.game_leaderboard (game_slug, rank, username, score)
    values (p_game_slug, r, '—', 0);
    r := r + 1;
  end loop;

  return query
  select gl.game_slug, gl.rank, gl.username, gl.score, gl.created_at, gl.updated_at
  from public.game_leaderboard gl
  where gl.game_slug = p_game_slug
  order by gl.rank asc;
end;
$$;

revoke all on function public.get_game_top_scores(text) from public;
revoke all on function public.submit_game_score(text, integer, text) from public;
grant execute on function public.get_game_top_scores(text) to anon, authenticated;
grant execute on function public.submit_game_score(text, integer, text) to anon, authenticated;
