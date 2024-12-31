-- Drop existing policies
drop policy if exists "Anyone can read tools" on tools;
drop policy if exists "Service role can manage tools" on tools;
drop policy if exists "Anyone can read tool versions" on tool_versions;
drop policy if exists "Service role can manage tool versions" on tool_versions;
drop policy if exists "Anyone can read voices" on voices;
drop policy if exists "Service role can manage voices" on voices;
drop policy if exists "Anyone can read voice versions" on voice_versions;
drop policy if exists "Service role can manage voice versions" on voice_versions;

-- Recreate policies
-- RLS Policies for tools
create policy "Anyone can read tools"
  on tools for select
  to authenticated
  using (true);

create policy "Service role can manage tools"
  on tools for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for tool versions
create policy "Anyone can read tool versions"
  on tool_versions for select
  to authenticated
  using (true);

create policy "Service role can manage tool versions"
  on tool_versions for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for voices
create policy "Anyone can read voices"
  on voices for select
  to authenticated
  using (true);

create policy "Service role can manage voices"
  on voices for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for voice versions
create policy "Anyone can read voice versions"
  on voice_versions for select
  to authenticated
  using (true);

create policy "Service role can manage voice versions"
  on voice_versions for all
  using (auth.jwt() ->> 'role' = 'service_role');
