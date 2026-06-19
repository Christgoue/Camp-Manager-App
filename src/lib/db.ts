import Dexie, { type Table } from 'dexie'
import type { Campeur, Passage, Activite, Incident, Message, SyncAction } from './types'

export class CampDatabase extends Dexie {
  campeurs!: Table<Campeur, string>
  passages!: Table<Passage, string>
  activites!: Table<Activite, string>
  incidents!: Table<Incident, string>
  messages!: Table<Message, string>
  syncQueue!: Table<SyncAction, number>

  constructor() {
    super('CampDB')
    this.version(1).stores({
      campeurs: 'id, nom, prenom, unite, statut',
      passages: 'id, campeur_id, type, horodatage',
      activites: 'id, titre, date',
      incidents: 'id, campeur_id, statut, gravite',
      messages: 'id, created_at',
      syncQueue: '++id, created_at',
    })
  }
}

export const db = new CampDatabase()
