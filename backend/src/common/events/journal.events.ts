/**
 * Journal Events
 * Emitted when journals are created/posted/reversed
 */

export class JournalCreatedEvent {
  constructor(
    public readonly journalId: string,
    public readonly nomorJurnal: string,
    public readonly sourceType?: string,
    public readonly sourceId?: string,
  ) {}
}

export class JournalPostedEvent {
  constructor(
    public readonly journalId: string,
    public readonly nomorJurnal: string,
    public readonly periode: string,
    public readonly tahun: number,
    public readonly totalDebit: number,
    public readonly totalCredit: number,
  ) {}
}

export class JournalReversedEvent {
  constructor(
    public readonly originalJournalId: string,
    public readonly reversalJournalId: string,
    public readonly reason: string,
  ) {}
}

export class JournalApprovedEvent {
  constructor(
    public readonly journalId: string,
    public readonly nomorJurnal: string,
    public readonly approvedBy: string,
  ) {}
}
