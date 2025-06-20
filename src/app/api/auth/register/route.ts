import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

if (!process.env.POSTGRES_URL) {
  throw new Error('Please define the POSTGRES_URL environment variable');
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const pool = createPool();

    // Check if user already exists
    const existingUsers = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUsers.rows.length > 0) {
      return NextResponse.json(
        { message: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    const user = result.rows[0];

    return NextResponse.json(
      { message: 'Usuario registrado exitosamente', user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
} 