import { NextRequest, NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    const pool = createPool();
    
    // Check if user exists
    const { rows } = await pool.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'Si el email existe, se enviará un enlace de recuperación' },
        { status: 200 }
      );
    }

    const user = rows[0];
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    // Store reset token in database
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetToken, resetTokenExpiry, user.id]
    );

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

    // Send email (you'll need to configure your email service)
    try {
      // For now, we'll just log the reset URL
      // In production, you should use a proper email service like SendGrid, AWS SES, etc.
      console.log('Password reset URL:', resetUrl);
      console.log('Reset token:', resetToken);
      
      // Check if email configuration is available
      if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        // Email sending with nodemailer
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT),
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          secure: false, // true for port 465, false for 587
        });
        
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: 'Recuperación de contraseña - Agente de Marcas',
          html: `
            <h1>Recuperación de contraseña</h1>
            <p>Hola ${user.name || 'usuario'},</p>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
            <a href="${resetUrl}">Restablecer contraseña</a>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
          `
        });
        console.log('Password reset email sent successfully');
      } else {
        console.log('Email configuration not found. In development, you can use the reset URL above.');
      }

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails, just log it
    }

    // In development, return the reset URL for testing
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return NextResponse.json(
      { 
        message: 'Si el email existe, se enviará un enlace de recuperación',
        ...(isDevelopment && { resetUrl, resetToken })
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 