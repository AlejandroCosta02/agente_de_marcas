# 🏦 MercadoPago Setup Guide

## 📋 **Prerequisites**

- MercadoPago account (free)
- Access to MercadoPago Developer Dashboard

## 🚀 **Step-by-Step Setup**

### **1. Create MercadoPago Account**

1. Go to [MercadoPago](https://www.mercadopago.com)
2. Click "Registrarse" or "Sign Up"
3. Complete the registration process
4. Verify your email

### **2. Access Developer Dashboard**

1. Go to [MercadoPago Developers](https://www.mercadopago.com/developers)
2. Click "Panel de desarrolladores" or "Developer Panel"
3. Log in with your MercadoPago account

### **3. Create Application**

1. Click "Crear aplicación" or "Create Application"
2. Fill in the details:
   - **Nombre**: "Agente de Marcas"
   - **Descripción**: "Plataforma de gestión de marcas comerciales"
   - **Plataforma**: Web
   - **Categoría**: E-commerce
3. Click "Crear" or "Create"

### **4. Get Your Credentials**

After creating the app, you'll see:

#### **Sandbox Credentials (Testing)**
- **Access Token**: Starts with `TEST-`
- **Public Key**: Starts with `TEST-`

#### **Production Credentials (Real Payments)**
- **Access Token**: Starts with `APP-`
- **Public Key**: Starts with `APP-`

### **5. Update Environment Variables**

Create a `.env` file in your project root:

```env
# Database
DATABASE_URL="your-database-url"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# MercadoPago Sandbox (Testing)
MERCADOPAGO_SANDBOX_ACCESS_TOKEN="TEST-your-sandbox-access-token"
MERCADOPAGO_SANDBOX_PUBLIC_KEY="TEST-your-sandbox-public-key"

# MercadoPago Production (Real Payments)
MERCADOPAGO_ACCESS_TOKEN="APP-your-production-access-token"
MERCADOPAGO_PUBLIC_KEY="APP-your-production-public-key"
```

### **6. Test Your Setup**

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test the payment flow**:
   - Go to your dashboard
   - Click "Actualizar"
   - Select a plan
   - Click "Pagar con MercadoPago"

3. **Expected Result**: Should redirect to MercadoPago sandbox checkout

## 🧪 **Testing with Sandbox**

### **Test Cards**
Use these cards in sandbox mode:

- **Approved**: `4509 9535 6623 3704`
- **CVV**: `123`
- **Expiration**: `12/25`

### **Test Scenarios**
- **Approved Payment**: Card `4509 9535 6623 3704`
- **Pending Payment**: Same card, different amount
- **Rejected Payment**: Same card, specific amount

## 🚨 **Important Notes**

### **Sandbox vs Production**
- **Sandbox**: For testing only, no real money
- **Production**: Real payments, requires account verification

### **Account Verification**
For production payments, you need to:
1. Complete identity verification
2. Provide business documentation
3. Wait for approval (1-3 business days)

### **Security**
- Never commit credentials to git
- Use environment variables
- Keep production credentials secure

## 🔧 **Troubleshooting**

### **Invalid Token Error**
- Check if credentials are correct
- Ensure you're using sandbox credentials for testing
- Verify the token format (starts with `TEST-` or `APP-`)

### **Permission Errors**
- Check if your app has the right permissions
- Ensure you're using the correct credentials for your environment

### **Redirect Issues**
- Verify `NEXTAUTH_URL` is set correctly
- Check if back_urls are properly configured

## 📞 **Support**

- **MercadoPago Support**: https://www.mercadopago.com/developers/support
- **Documentation**: https://www.mercadopago.com/developers/docs
- **API Reference**: https://www.mercadopago.com/developers/reference

## ✅ **Checklist**

- [ ] MercadoPago account created
- [ ] Developer dashboard accessed
- [ ] Application created
- [ ] Credentials obtained
- [ ] Environment variables set
- [ ] Development server restarted
- [ ] Payment flow tested
- [ ] Test cards working

Once you complete this setup, your MercadoPago integration will work perfectly! 🎉 