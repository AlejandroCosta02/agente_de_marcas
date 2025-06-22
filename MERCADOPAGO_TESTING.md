# 🧪 MercadoPago Testing Guide

## 🚀 **Quick Start for Testing**

### **Current Setup: Sandbox Mode (No Real Money)**
- ✅ **Environment**: Development (Sandbox)
- ✅ **Payments**: Test only - no real money charged
- ✅ **Setup**: Ready to test immediately

## 💰 **New Pricing Structure**

### **🟢 Essential Plan**
- **Marcas**: Hasta 10 marcas
- **PDFs**: Hasta 10 PDFs por marca
- **Precio Mensual**: $40,000 ARS
- **Precio Anual**: $400,000 ARS (Ahorra 17%)

### **🔵 Trademark Pro Plan**
- **Marcas**: Hasta 25 marcas
- **PDFs**: Hasta 15 PDFs por marca
- **Precio Mensual**: $60,000 ARS
- **Precio Anual**: $600,000 ARS (Ahorra 17%)

### **🟣 Master Brand Plan**
- **Marcas**: Ilimitadas
- **PDFs**: Hasta 20 PDFs por marca
- **Precio Mensual**: $90,000 ARS
- **Precio Anual**: $900,000 ARS (Ahorra 17%)

## 💳 **Test Credit Cards**

Use these test cards in the MercadoPago checkout:

### **Approved Payment**
- **Card Number**: `4509 9535 6623 3704`
- **CVV**: `123`
- **Expiration**: `12/25`
- **Result**: Payment approved

### **Pending Payment**
- **Card Number**: `4509 9535 6623 3704`
- **CVV**: `123`
- **Expiration**: `12/25`
- **Result**: Payment pending

### **Rejected Payment**
- **Card Number**: `4509 9535 6623 3704`
- **CVV**: `123`
- **Expiration**: `12/25`
- **Result**: Payment rejected

## 🧪 **Testing Steps**

### **1. Test the Upgrade Flow**
1. Go to your dashboard
2. You should see the subscription status component showing current usage
3. Click "Actualizar" button
4. Select a plan (Essential, Pro, or Master)
5. Choose billing cycle (Mensual/Anual)
6. Click "Pagar con MercadoPago"
7. Use test card numbers above

### **2. Test Different Scenarios**
- **Free Plan**: Should show current usage (4/4 marcas)
- **Limit Reached**: Try adding a 5th marca to trigger upgrade modal
- **Payment Flow**: Complete payment with test cards
- **Layout**: Verify long price numbers don't break the layout

### **3. Test Features**
- **Marcas Limit**: Each plan has different marca limits
- **PDFs Limit**: Each plan allows different PDF uploads per marca
- **Billing Cycles**: Test both monthly and yearly options
- **Responsive Design**: Test on different screen sizes

## 🔧 **Environment Variables (Optional)**

For production setup, add these to your `.env` file:

```env
# Sandbox (Testing)
MERCADOPAGO_SANDBOX_ACCESS_TOKEN=your_sandbox_access_token
MERCADOPAGO_SANDBOX_PUBLIC_KEY=your_sandbox_public_key

# Production (Real Payments)
MERCADOPAGO_ACCESS_TOKEN=your_production_access_token
MERCADOPAGO_PUBLIC_KEY=your_production_public_key
```

## 🏦 **Setting Up Real Payments (Optional)**

If you want to receive real payments:

### **1. Create MercadoPago Account**
1. Go to [mercadopago.com.ar](https://mercadopago.com.ar)
2. Create a business account
3. Complete verification process

### **2. Get Production Credentials**
1. Go to MercadoPago Developer Dashboard
2. Create a new application
3. Get your Access Token and Public Key

### **3. Update Environment**
1. Set `NODE_ENV=production`
2. Add production credentials to `.env`
3. Test with small amounts first

## 🎯 **Current Test Status**

- ✅ **Sandbox Mode**: Active
- ✅ **Test Cards**: Available
- ✅ **No Real Money**: Safe testing
- ✅ **New Pricing**: Updated with ARS amounts
- ✅ **Layout**: Optimized for long numbers
- ✅ **Features**: Simplified to marcas and PDFs only

## 🚨 **Important Notes**

- **Development Mode**: Currently in sandbox (no real payments)
- **Test Cards**: Only work in sandbox environment
- **Real Payments**: Require production setup and verification
- **Security**: Never commit real credentials to git
- **Pricing**: All prices in Argentine Pesos (ARS)
- **Features**: Focus on marca management and PDF uploads

## 🔍 **Troubleshooting**

### **Payment Not Working**
- Check browser console for errors
- Verify MercadoPago SDK is loaded
- Ensure you're using test card numbers

### **Modal Not Opening**
- Check if subscription status is loading
- Verify marca count is at limit (4 marcas)
- Check browser console for errors

### **Layout Issues**
- Check if price numbers are wrapping
- Verify modal width is sufficient
- Test responsive design on mobile

### **API Errors**
- Check server logs
- Verify environment variables
- Ensure MercadoPago credentials are valid 