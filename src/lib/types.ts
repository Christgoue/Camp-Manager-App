export type UserRole = 'admin' | 'chef'

export interface Profile {
  id: string
  email: string
  nom: string
  role: UserRole
  created_at: string
}

export type StatutCampeur = 'present' | 'sorti' | 'sortie_autorisee' | 'absent'

export interface Campeur {
  id: string
  nom: string
  prenom: string
  date_naissance: string
  unite: string
  allergies: string
  restrictions_alimentaires: string
  contact_urgence_nom: string
  contact_urgence_telephone: string
  fiche_sante: string
  notes: string
  statut: StatutCampeur
  qr_code: string
  created_at: string
  updated_at: string
}

export interface Passage {
  id: string
  campeur_id: string
  type: 'entree' | 'sortie' | 'sortie_autorisee' | 'urgence'
  motif: string
  horodatage: string
  created_by: string
}

export interface Activite {
  id: string
  titre: string
  description: string
  lieu: string
  date: string
  heure_debut: string
  heure_fin: string
  participants: string[]
  created_at: string
  updated_at: string
}

export type GraviteIncident = 'faible' | 'moyen' | 'eleve'
export type StatutIncident = 'ouvert' | 'en_cours' | 'resolu'

export interface Incident {
  id: string
  type: string
  campeur_id: string
  description: string
  gravite: GraviteIncident
  statut: StatutIncident
  photo_url: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  user_id: string
  user_nom: string
  contenu: string
  created_at: string
}

export interface SyncAction {
  id?: number
  table: string
  action: 'insert' | 'update' | 'delete'
  data: unknown
  created_at: string
}
