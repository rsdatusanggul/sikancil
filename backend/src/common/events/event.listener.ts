import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  TransactionCreatedEvent,
  TransactionUpdatedEvent,
  TransactionDeletedEvent,
  JournalCreatedEvent,
  JournalPostedEvent,
  JournalReversedEvent,
  JournalApprovedEvent,
} from './index';

/**
 * Event Listener for logging and monitoring events
 * This is a simple listener for demonstration
 * In production, you can add more sophisticated listeners for:
 * - Auto-posting to journal
 * - Updating general ledger
 * - Sending notifications
 * - Audit logging
 * - etc.
 */
@Injectable()
export class EventListener {
  private readonly logger = new Logger(EventListener.name);

  // Transaction Events
  @OnEvent('transaction.created')
  handleTransactionCreated(event: TransactionCreatedEvent) {
    this.logger.log(
      `Transaction created: ${event.sourceType} - ${event.sourceId}`,
    );
    // TODO: Trigger auto-posting in Week 2
  }

  @OnEvent('transaction.updated')
  handleTransactionUpdated(event: TransactionUpdatedEvent) {
    this.logger.log(
      `Transaction updated: ${event.sourceType} - ${event.sourceId}`,
    );
    // TODO: Reverse old journal and create new one in Week 2
  }

  @OnEvent('transaction.deleted')
  handleTransactionDeleted(event: TransactionDeletedEvent) {
    this.logger.log(
      `Transaction deleted: ${event.sourceType} - ${event.sourceId}`,
    );
    // TODO: Reverse journal in Week 2
  }

  // Journal Events
  @OnEvent('journal.created')
  handleJournalCreated(event: JournalCreatedEvent) {
    this.logger.log(
      `Journal created: ${event.nomorJurnal} (${event.journalId})`,
    );
  }

  @OnEvent('journal.posted')
  handleJournalPosted(event: JournalPostedEvent) {
    this.logger.log(
      `Journal posted: ${event.nomorJurnal} - Debit: ${event.totalDebit}, Credit: ${event.totalCredit}`,
    );
    // TODO: Update General Ledger in Week 3
  }

  @OnEvent('journal.reversed')
  handleJournalReversed(event: JournalReversedEvent) {
    this.logger.log(
      `Journal reversed: Original ${event.originalJournalId} -> Reversal ${event.reversalJournalId}. Reason: ${event.reason}`,
    );
    // TODO: Update General Ledger in Week 3
  }

  @OnEvent('journal.approved')
  handleJournalApproved(event: JournalApprovedEvent) {
    this.logger.log(
      `Journal approved: ${event.nomorJurnal} by ${event.approvedBy}`,
    );
  }
}
