import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid email' },
        { status: 400 }
      );
    }

    const normalized = email.toLowerCase().trim();

    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Insert email (ON CONFLICT prevents duplicates)
    try {
      await sql`
        INSERT INTO waitlist (email) VALUES (${normalized})
      `;
    } catch (err: any) {
      // Handle unique constraint violation (duplicate email)
      if (err.code === '23505') {
        return NextResponse.json(
          { ok: true, message: "You're already on the list!" },
          { status: 200 }
        );
      }
      throw err;
    }

    return NextResponse.json(
      { ok: true, message: "You're on the list!" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { ok: false, message: 'Something went wrong. Try again.' },
      { status: 500 }
    );
  }
}
