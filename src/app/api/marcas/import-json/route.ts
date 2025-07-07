import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';
import { getPlanById, getFreePlan } from '@/lib/subscription-plans';
import { randomUUID } from 'crypto';

const pool = createPool();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Fetch user id and subscription tier
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [session.user.email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    const userId = userResult.rows[0].id;
    const subResult = await pool.query('SELECT tier FROM "UserSubscription" WHERE "userId" = $1', [userId]);
    const tier = subResult.rows.length > 0 ? subResult.rows[0].tier : 'free';
    const plan = getPlanById(tier) || getFreePlan();
    // Count current marcas for this user
    const countResult = await pool.query('SELECT COUNT(*) FROM marcas WHERE user_email = $1', [session.user.email]);
    let marcaCount = parseInt(countResult.rows[0].count, 10);

    // Parse JSON body
    let marcas: any[] = [];
    try {
      marcas = await request.json();
      if (!Array.isArray(marcas)) throw new Error('El JSON debe ser un array de marcas');
    } catch (err) {
      return NextResponse.json({ error: 'JSON inválido o malformado' }, { status: 400 });
    }

    // Validate and process each marca
    const added: string[] = [];
    const updated: string[] = [];
    const invalid: string[] = [];
    const skipped: string[] = [];
    const failed: { id: string, error: string }[] = [];

    for (const marca of marcas) {
      try {
        // Basic validation (customize as needed)
        if (!marca.marca) {
          invalid.push(marca.id || '(sin id)');
          continue;
        }
        // Prepare legacy titular fields from first titular
        let titular_nombre = '';
        let titular_email = '';
        let titular_telefono = '';
        if (Array.isArray(marca.titulares) && marca.titulares.length > 0) {
          const t = marca.titulares[0];
          titular_nombre = t.fullName || t.nombre || '';
          titular_email = t.email || t.mail || '';
          titular_telefono = t.phone || t.telefono || '';
        }
        // Check if marca exists and belongs to user
        let idToUse = marca.id;
        if (!idToUse) {
          idToUse = randomUUID();
        } else {
          // Check if this id exists for any user
          const idExists = await pool.query('SELECT id FROM marcas WHERE id = $1', [idToUse]);
          if (idExists.rows.length > 0) {
            // If it exists for this user, update; else, generate new id
            const existsForUser = await pool.query('SELECT id FROM marcas WHERE id = $1 AND user_email = $2', [idToUse, session.user.email]);
            if (existsForUser.rows.length === 0) {
              idToUse = randomUUID();
            }
          }
        }
        // Now check if this id exists for this user (for update)
        const existing = await pool.query(
          'SELECT id FROM marcas WHERE id = $1 AND user_email = $2',
          [idToUse, session.user.email]
        );
        if (existing.rows.length > 0) {
          // Update existing marca (overwrite fields except id/user_email)
          await pool.query(
            `UPDATE marcas SET 
              marca = $1, renovar = $2, vencimiento = $3, djumt = $4, titulares = $5, anotaciones = $6, oposicion = $7, tipo_marca = $8, clases = $9, class_details = $10, titular_nombre = $11, titular_email = $12, titular_telefono = $13, updated_at = NOW()
             WHERE id = $14 AND user_email = $15`,
            [
              marca.marca,
              marca.renovar,
              marca.vencimiento,
              marca.djumt,
              JSON.stringify(marca.titulares || []),
              marca.anotaciones || [],
              JSON.stringify(marca.oposicion || []),
              marca.tipo_marca || 'denominativa',
              Array.isArray(marca.clases) ? marca.clases : [],
              JSON.stringify(marca.class_details || {}),
              titular_nombre,
              titular_email,
              titular_telefono,
              idToUse,
              session.user.email
            ]
          );
          updated.push(idToUse);
        } else {
          // Enforce plan limit for new marcas
          if (plan.marcaLimit !== -1 && marcaCount >= plan.marcaLimit) {
            skipped.push(idToUse);
            continue;
          }
          // Insert new marca for this user
          await pool.query(
            `INSERT INTO marcas (
              id, marca, renovar, vencimiento, djumt, titulares, anotaciones, oposicion, tipo_marca, clases, class_details, user_email, titular_nombre, titular_email, titular_telefono
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            )`,
            [
              idToUse,
              marca.marca,
              marca.renovar,
              marca.vencimiento,
              marca.djumt,
              JSON.stringify(marca.titulares || []),
              marca.anotaciones || [],
              JSON.stringify(marca.oposicion || []),
              marca.tipo_marca || 'denominativa',
              Array.isArray(marca.clases) ? marca.clases : [],
              JSON.stringify(marca.class_details || {}),
              session.user.email,
              titular_nombre,
              titular_email,
              titular_telefono
            ]
          );
          added.push(idToUse);
          marcaCount++;
        }
      } catch (err: any) {
        console.error('Error importing marca:', marca.id, err);
        failed.push({ id: marca.id || '(sin id)', error: err.message || String(err) });
      }
    }
    return NextResponse.json({ added, updated, invalid, skipped, failed });
  } catch (error) {
    console.error('Error importing marcas from JSON:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 