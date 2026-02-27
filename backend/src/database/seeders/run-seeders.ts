import { AppDataSource } from '../data-source';
import { seedChartOfAccounts } from './chart-of-accounts.seeder';
import { seedMasterData } from './master-data.seeder';

/**
 * Main Seeder Runner
 * Executes all seeders in sequence
 */
async function runSeeders() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Initialize connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    // Run seeders in order
    await seedChartOfAccounts();
    console.log('');

    await seedMasterData();
    console.log('');

    // Close connection
    await AppDataSource.destroy();

    console.log('✅ All seeders completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running seeders:', error);
    process.exit(1);
  }
}

// Execute
runSeeders();
