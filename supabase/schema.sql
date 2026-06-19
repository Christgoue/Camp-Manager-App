-- ============================================================
-- AppSuiviCamp - Schema Supabase complet
-- ============================================================

-- 1. Trigger pour créer automatiquement un profil lors de l'inscription
-- (géré via auth.users et un trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, nom, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nom', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'chef')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Tables
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  nom text not null default '',
  role text not null default 'chef' check (role in ('admin', 'chef')),
  created_at timestamptz default now()
);

create table if not exists public.campeurs (
  id uuid default extensions.uuid_generate_v4() primary key,
  nom text not null,
  prenom text not null,
  date_naissance text default '',
  unite text default '',
  allergies text default '',
  restrictions_alimentaires text default '',
  contact_urgence_nom text default '',
  contact_urgence_telephone text default '',
  fiche_sante text default '',
  notes text default '',
  statut text default 'absent' check (statut in ('present', 'sorti', 'sortie_autorisee', 'absent')),
  qr_code text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.passages (
  id uuid default extensions.uuid_generate_v4() primary key,
  campeur_id uuid references public.campeurs on delete cascade not null,
  type text not null check (type in ('entree', 'sortie', 'sortie_autorisee', 'urgence')),
  motif text default '',
  horodatage timestamptz default now(),
  created_by uuid references auth.users
);

create table if not exists public.activites (
  id uuid default extensions.uuid_generate_v4() primary key,
  titre text not null,
  description text default '',
  lieu text default '',
  date text default '',
  heure_debut text default '',
  heure_fin text default '',
  participants uuid[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.incidents (
  id uuid default extensions.uuid_generate_v4() primary key,
  type text not null,
  campeur_id uuid references public.campeurs on delete cascade not null,
  description text default '',
  gravite text default 'moyen' check (gravite in ('faible', 'moyen', 'eleve')),
  statut text default 'ouvert' check (statut in ('ouvert', 'en_cours', 'resolu')),
  photo_url text default '',
  created_by uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid default extensions.uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  user_nom text not null,
  contenu text not null,
  created_at timestamptz default now()
);

-- 3. Indexes
create index if not exists idx_campeurs_statut on public.campeurs(statut);
create index if not exists idx_campeurs_unite on public.campeurs(unite);
create index if not exists idx_passages_campeur on public.passages(campeur_id);
create index if not exists idx_passages_horodatage on public.passages(horodatage);
create index if not exists idx_incidents_statut on public.incidents(statut);
create index if not exists idx_messages_created on public.messages(created_at);
create index if not exists idx_activites_date on public.activites(date);

-- 4. RLS Policies
alter table public.profiles enable row level security;
alter table public.campeurs enable row level security;
alter table public.passages enable row level security;
alter table public.activites enable row level security;
alter table public.incidents enable row level security;
alter table public.messages enable row level security;

-- Profiles: les utilisateurs voient leur propre profil, les admins voient tout
create policy "profiles_select" on public.profiles
  for select using (
    auth.uid() = id
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "profiles_insert" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update" on public.profiles
  for update using (
    auth.uid() = id
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- Campeurs: les admins peuvent tout faire, les chefs peuvent lire
create policy "campeurs_select" on public.campeurs
  for select using (auth.role() = 'authenticated');

create policy "campeurs_insert" on public.campeurs
  for insert with check (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "campeurs_update" on public.campeurs
  for update using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "campeurs_delete" on public.campeurs
  for delete using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- Passages: tous les utilisateurs authentifiés peuvent lire/insérer
create policy "passages_select" on public.passages
  for select using (auth.role() = 'authenticated');

create policy "passages_insert" on public.passages
  for insert with check (auth.role() = 'authenticated');

create policy "passages_update" on public.passages
  for update using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- Activités: les admins peuvent tout faire, les chefs peuvent lire
create policy "activites_select" on public.activites
  for select using (auth.role() = 'authenticated');

create policy "activites_insert" on public.activites
  for insert with check (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "activites_update" on public.activites
  for update using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "activites_delete" on public.activites
  for delete using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- Incidents: tous peuvent créer, tout le monde peut lire
create policy "incidents_select" on public.incidents
  for select using (auth.role() = 'authenticated');

create policy "incidents_insert" on public.incidents
  for insert with check (auth.role() = 'authenticated');

create policy "incidents_update" on public.incidents
  for update using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- Messages: tous peuvent lire/inscrire
create policy "messages_select" on public.messages
  for select using (auth.role() = 'authenticated');

create policy "messages_insert" on public.messages
  for insert with check (auth.role() = 'authenticated');

create policy "messages_delete" on public.messages
  for delete using (
    auth.uid() = user_id
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- 5. Enable Realtime pour les messages
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.campeurs;
alter publication supabase_realtime add table public.passages;
alter publication supabase_realtime add table public.incidents;

-- 6. Seed data (admin par défaut)
-- Créer un admin via l'interface Supabase Auth ou avec :
-- select extensions.uuid_generate_v4() as admin_id;
-- Puis insérer manuellement via auth.admin.createUser()
-- Le trigger profiles se charge du reste.

insert into public.campeurs (nom, prenom, unite, statut) values
  ('Dupont', 'Jean', 'Éclaireurs', 'present'),
  ('Martin', 'Sophie', 'Louveteaux', 'present'),
  ('Bernard', 'Pierre', 'Pionniers', 'absent'),
  ('Petit', 'Marie', 'Éclaireurs', 'present'),
  ('Robert', 'Lucas', 'Routiers', 'sorti'),
  ('Richard', 'Emma', 'Louveteaux', 'present');

insert into public.activites (titre, description, lieu, date, heure_debut, heure_fin) values
  ('Randonnée matinale', 'Marche de 5km dans la forêt', 'Forêt du Camp', CURRENT_DATE, '08:00', '10:00'),
  ('Atelier noeuds', 'Apprentissage des noeuds scouts', 'Place centrale', CURRENT_DATE, '10:30', '12:00'),
  ('Pique-nique', 'Repas partagé en plein air', 'Clairière', CURRENT_DATE, '12:00', '13:30'),
  ('Jeux d''équipe', 'Olympiades inter-unités', 'Terrain de sport', CURRENT_DATE, '14:00', '16:00'),
  ('Veillée', 'Chants et histoires autour du feu', 'Feu de camp', CURRENT_DATE, '20:00', '22:00');
