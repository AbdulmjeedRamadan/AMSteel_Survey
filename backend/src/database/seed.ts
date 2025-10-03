import bcrypt from 'bcrypt';
import db from '../config/database';
import logger from '../utils/logger';

/**
 * Database seeding script
 * Creates initial developer user and sample data
 */
async function seed(): Promise<void> {
  try {
    logger.info('Starting database seeding...');

    // Check if developer already exists
    const existingDev = await db.query(
      'SELECT id FROM users WHERE role = $1 LIMIT 1',
      ['developer']
    );

    if (existingDev.rows.length > 0) {
      logger.info('Developer user already exists. Skipping seed.');
      return;
    }

    // Hash password for initial developer
    const password = 'Developer@123'; // Change this in production!
    const passwordHash = await bcrypt.hash(password, 12);

    // Create initial developer user
    const result = await db.query(
      `INSERT INTO users (
        role,
        full_name,
        email,
        password_hash,
        department,
        position,
        is_active,
        email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, full_name, role`,
      [
        'developer',
        'System Developer',
        'developer@amsteel.com',
        passwordHash,
        'IT',
        'System Administrator',
        true,
        true
      ]
    );

    logger.info('Initial developer user created:', {
      id: result.rows[0].id,
      email: result.rows[0].email,
      name: result.rows[0].full_name,
      role: result.rows[0].role,
    });

    logger.warn('IMPORTANT: Default developer credentials:');
    logger.warn(`  Email: developer@amsteel.com`);
    logger.warn(`  Password: ${password}`);
    logger.warn('Please change the password immediately after first login!');

    logger.info('Database seeding completed successfully');

  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  }
}

/**
 * Create sample data for testing (optional)
 */
async function seedSampleData(): Promise<void> {
  try {
    logger.info('Creating sample data...');

    // Create sample employees
    const employees = [
      {
        name: 'Ahmed Ali',
        email: 'ahmed.ali@amsteel.com',
        department: 'Engineering',
        position: 'Senior Engineer'
      },
      {
        name: 'Fatima Hassan',
        email: 'fatima.hassan@amsteel.com',
        department: 'HR',
        position: 'HR Manager'
      },
      {
        name: 'Mohammed Ibrahim',
        email: 'mohammed.ibrahim@amsteel.com',
        department: 'Sales',
        position: 'Sales Executive'
      }
    ];

    const password = 'Employee@123';
    const passwordHash = await bcrypt.hash(password, 12);

    for (const emp of employees) {
      await db.query(
        `INSERT INTO users (
          role,
          full_name,
          email,
          password_hash,
          department,
          position,
          is_active,
          email_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          'employee',
          emp.name,
          emp.email,
          passwordHash,
          emp.department,
          emp.position,
          true,
          true
        ]
      );
    }

    logger.info('Sample employees created:', { count: employees.length });
    logger.info('Sample employee password:', password);

    // Create a sample admin
    await db.query(
      `INSERT INTO users (
        role,
        full_name,
        email,
        password_hash,
        department,
        position,
        is_active,
        email_verified,
        promoted_to_admin_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING id`,
      [
        'admin',
        'Sara Abdullah',
        'sara.abdullah@amsteel.com',
        passwordHash,
        'Marketing',
        'Marketing Director',
        true,
        true
      ]
    );

    logger.info('Sample admin created');

    logger.info('Sample data creation completed');

  } catch (error) {
    logger.error('Sample data creation failed:', error);
    throw error;
  }
}

/**
 * Clear all data (keep schema)
 */
async function clearData(): Promise<void> {
  try {
    logger.warn('Clearing all data from database...');

    await db.query('TRUNCATE TABLE activity_logs CASCADE');
    await db.query('TRUNCATE TABLE answers CASCADE');
    await db.query('TRUNCATE TABLE responses CASCADE');
    await db.query('TRUNCATE TABLE survey_target_employees CASCADE');
    await db.query('TRUNCATE TABLE questions CASCADE');
    await db.query('TRUNCATE TABLE surveys CASCADE');
    await db.query('TRUNCATE TABLE users CASCADE');

    logger.info('All data cleared successfully');

  } catch (error) {
    logger.error('Clear data failed:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  const command = process.argv[2];

  const runCommand = async () => {
    try {
      switch (command) {
        case 'initial':
          await seed();
          break;
        case 'sample':
          await seedSampleData();
          break;
        case 'all':
          await seed();
          await seedSampleData();
          break;
        case 'clear':
          await clearData();
          break;
        default:
          logger.info('Usage: npm run seed [initial|sample|all|clear]');
          logger.info('  initial - Create initial developer user');
          logger.info('  sample  - Create sample employees and admin');
          logger.info('  all     - Create initial developer and sample data');
          logger.info('  clear   - Clear all data (keep schema)');
      }
      await db.close();
      process.exit(0);
    } catch (error) {
      logger.error('Command failed:', error);
      await db.close();
      process.exit(1);
    }
  };

  runCommand();
}

export { seed, seedSampleData, clearData };
