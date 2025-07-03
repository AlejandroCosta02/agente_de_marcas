import { NextRequest, NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Function to send email via Brevo API
async function sendEmailViaBrevoAPI(to: string, subject: string, htmlContent: string) {
  const apiKey = process.env.EMAIL_PASS; // Use the same env var but as API key
  
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': apiKey || ''
    },
    body: JSON.stringify({
      sender: {
        name: 'Agente de Marcas',
        email: process.env.EMAIL_FROM
      },
      to: [
        {
          email: to
        }
      ],
      subject: subject,
      htmlContent: htmlContent
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Brevo API error: ${response.status} - ${errorData}`);
  }

  return await response.json();
}

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
      
      // Try Brevo API first (using EMAIL_PASS as API key)
      try {
        console.log('Attempting to send email via Brevo API...');
        const emailContent = `
          <h1>Recuperación de contraseña</h1>
          <p>Hola ${user.name || 'usuario'},</p>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
          <a href="${resetUrl}">Restablecer contraseña</a>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
        `;
        
        const apiResult = await sendEmailViaBrevoAPI(
          user.email,
          'Recuperación de contraseña - Agente de Marcas',
          emailContent
        );
        
        console.log('Password reset email sent successfully via Brevo API:', apiResult);
        
      } catch (apiError) {
        console.log('Brevo API failed, trying SMTP...', apiError);
        
        // Fallback to SMTP
        if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          console.log('Email configuration found:', {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            user: process.env.EMAIL_USER,
            from: process.env.EMAIL_FROM,
            to: user.email
          });
          
          // Email sending with nodemailer
          const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: false, // true for port 465, false for 587
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
            tls: {
              rejectUnauthorized: false
            },
            debug: true, // Enable debug output
            logger: true // Log to console
          });
          
          // Verify transporter configuration
          await transporter.verify();
          console.log('Email transporter verified successfully');
          
          const mailResult = await transporter.sendMail({
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
          console.log('Password reset email sent successfully via SMTP:', {
            messageId: mailResult.messageId,
            response: mailResult.response
          });
        } else {
          console.log('Email configuration missing:', {
            hasHost: !!process.env.EMAIL_HOST,
            hasUser: !!process.env.EMAIL_USER,
            hasPass: !!process.env.EMAIL_PASS,
            hasFrom: !!process.env.EMAIL_FROM
          });
          console.log('Email configuration not found. In development, you can use the reset URL above.');
        }
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