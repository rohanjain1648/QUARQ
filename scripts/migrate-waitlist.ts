/**
 * Migration script: Insert existing waitlist emails into Vercel Postgres
 * Run once after Vercel Postgres is created and linked to the project
 * 
 * Usage: npx ts-node scripts/migrate-waitlist.ts
 */

import { sql } from '@vercel/postgres';

const EXISTING_EMAILS = [
  'agasheneemisha1@gmail.com',
  'vaibhavkhanna78@gmail.com',
  'itsmekumar.kaushik@gmail.com',
];

async function migrate() {
  console.log('Starting waitlist migration...');

  try {
    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log('✓ Table created or already exists');

    // Insert existing emails
    for (const email of EXISTING_EMAILS) {
      try {
        await sql`
          INSERT INTO waitlist (email) VALUES (${email.toLowerCase().trim()})
        `;
        console.log(`✓ Inserted: ${email}`);
      } catch (err: any) {
        if (err.code === '23505') {
          console.log(`⚠ Already exists: ${email}`);
        } else {
          throw err;
        }
      }
    }

    console.log('✅ Migration complete');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
