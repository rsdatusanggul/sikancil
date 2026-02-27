import { Module, Global } from '@nestjs/common';
import { EventListener } from './event.listener';

/**
 * Global Events Module
 * This module provides event listeners for the entire application
 */
@Global()
@Module({
  providers: [EventListener],
  exports: [EventListener],
})
export class EventsModule {}
