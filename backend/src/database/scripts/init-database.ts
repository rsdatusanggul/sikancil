import { AppDataSource } from '../data-source';

/**
 * Initialize Database Schema
 * This script will create all tables using TypeORM synchronize
 */
async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database connection...');

    // Initialize connection
    await AppDataSource.initialize();

    console.log('✅ Database connection established');
    console.log('📊 Database schema synchronized');

    // Get all table names
    const queryRunner = AppDataSource.createQueryRunner();
    const tables = await queryRunner.getTables();

    console.log(`\n📋 Created ${tables.length} tables:`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.name}`);
    });

    await queryRunner.release();
    await AppDataSource.destroy();

    console.log('\n✅ Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
