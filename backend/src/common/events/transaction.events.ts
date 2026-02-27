/**
 * Transaction Events for Auto-Posting
 * These events are emitted when transactions are created/updated/deleted
 * and will trigger auto-posting to journal
 */

export class TransactionCreatedEvent {
  constructor(
    public readonly sourceType: string, // e.g., PENDAPATAN_JASA_LAYANAN
    public readonly sourceId: string, // ID of the transaction
    public readonly data: any, // Transaction data
  ) {}
}

export class TransactionUpdatedEvent {
  constructor(
    public readonly sourceType: string,
    public readonly sourceId: string,
    public readonly oldData: any,
    public readonly newData: any,
  ) {}
}

export class TransactionDeletedEvent {
  constructor(
    public readonly sourceType: string,
    public readonly sourceId: string,
    public readonly data: any,
  ) {}
}

/**
 * Helper to create transaction event
 */
export function createTransactionEvent(
  eventType: 'created' | 'updated' | 'deleted',
  sourceType: string,
  sourceId: string,
  data: any,
  oldData?: any,
) {
  switch (eventType) {
    case 'created':
      return new TransactionCreatedEvent(sourceType, sourceId, data);
    case 'updated':
      return new TransactionUpdatedEvent(sourceType, sourceId, oldData, data);
    case 'deleted':
      return new TransactionDeletedEvent(sourceType, sourceId, data);
  }
}
