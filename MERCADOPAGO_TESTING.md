# 🧪 MercadoPago Testing Guide

## 🚀 **Quick Start for Testing**

### **Current Setup: Sandbox Mode (No Real Money)**
- ✅ **Environment**: Development (Sandbox)
- ✅ **Payments**: Test only - no real money charged
- ✅ **Setup**: Ready to test immediately

## 💰 **New Pricing Structure**

### **🟢 Free Plan**
- **Marcas**: Hasta 4 marcas
- **PDFs**: Hasta 5 PDFs por marca
- **Precio Mensual**: $0 ARS

### **🔵 Premium Plan**
- **Marcas**: Ilimitadas
- **PDFs**: Hasta 20 PDFs por marca
- **Precio Mensual**: $25,000 ARS
- **Precio Anual**: $250,000 ARS (2 meses gratis)

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
4. Select the Premium plan
5. Choose billing cycle (Mensual o Anual)
6. Click "Pagar con MercadoPago"
7. Use test card numbers above

### **2. Test Different Scenarios**
- **Free Plan**: Should show current usage (4/4 marcas)
- **Limit Reached**: Try adding a 5th marca to trigger upgrade modal
- **Payment Flow**: Complete payment with test cards
- **Layout**: Verify long price numbers don't break the layout

### **3. Test Features**
- Premium users should have unlimited marcas and up to 20 PDFs per marca.
- Anual: 2 meses gratis ($250,000 ARS/año) 