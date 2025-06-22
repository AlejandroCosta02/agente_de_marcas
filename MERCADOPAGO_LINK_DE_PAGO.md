# 🏦 MercadoPago Link de Pago - Guía Completa

## 🎯 **¿Qué es Link de Pago?**

**Link de Pago** es una forma mucho más simple de implementar pagos con MercadoPago. En lugar de crear preferencias complejas, simplemente generas un enlace de pago que el usuario puede usar para pagar.

## ✅ **Ventajas del Link de Pago**

1. **Más Simple**: Menos código, menos complejidad
2. **Más Confiable**: Menos puntos de falla
3. **Automático**: Los usuarios se actualizan automáticamente según el monto pagado
4. **Webhooks**: Notificaciones automáticas cuando se procesa el pago

## 🔄 **Cómo Funciona**

### **1. Flujo de Pago**
```
Usuario → Selecciona Plan → Click "Pagar" → Link de Pago → MercadoPago → Webhook → Usuario Actualizado
```

### **2. Actualización Automática**
- El usuario paga un monto específico
- MercadoPago envía una notificación (webhook)
- El sistema identifica el plan basado en el monto
- El usuario se actualiza automáticamente

## 🛠 **Implementación**

### **API Endpoint: `/api/mercadopago/create-payment-link`**

Este endpoint crea un enlace de pago con:
- **Título**: "Plan Essential - mes"
- **Precio**: Basado en el plan seleccionado
- **Referencia Externa**: `subscription_email_planId_billingCycle`
- **URLs de Retorno**: Para éxito, fallo, pendiente
- **Webhook**: Para notificaciones automáticas

### **Webhook: `/api/mercadopago/webhook`**

Este endpoint procesa las notificaciones de MercadoPago:
1. **Recibe** la notificación de pago
2. **Verifica** que el pago esté aprobado
3. **Identifica** el plan basado en el monto
4. **Actualiza** la suscripción del usuario

## 💰 **Determinación Automática del Plan**

El sistema determina el plan basado en el monto pagado:

| Plan | Mensual (ARS) | Anual (ARS) |
|------|---------------|-------------|
| Essential | 40,000 | 400,000 |
| Pro | 60,000 | 600,000 |
| Master | 90,000 | 900,000 |

### **Ejemplo:**
- Usuario paga **60,000 ARS**
- Sistema identifica: **Plan Pro Mensual**
- Usuario se actualiza automáticamente

## 🔧 **Configuración**

### **1. Variables de Entorno**
```env
# MercadoPago Sandbox (Testing)
MERCADOPAGO_SANDBOX_ACCESS_TOKEN="TEST-your-token"
MERCADOPAGO_SANDBOX_PUBLIC_KEY="TEST-your-key"

# MercadoPago Production (Real Payments)
MERCADOPAGO_ACCESS_TOKEN="APP-your-token"
MERCADOPAGO_PUBLIC_KEY="APP-your-key"
```

### **2. Webhook URL**
En MercadoPago Developer Dashboard:
```
https://tu-dominio.com/api/mercadopago/webhook
```

## 🧪 **Testing**

### **Tarjetas de Prueba**
- **Aprobada**: `4509 9535 6623 3704`
- **CVV**: `123`
- **Vencimiento**: `12/25`

### **Flujo de Prueba**
1. Ve al dashboard
2. Click "Actualizar"
3. Selecciona un plan
4. Click "Pagar con MercadoPago"
5. Usa una tarjeta de prueba
6. Verifica que el usuario se actualice automáticamente

## 📊 **Logs y Monitoreo**

### **Logs del Webhook**
```javascript
// Ejemplo de logs
MercadoPago webhook received: {
  type: 'payment',
  data_id: '123456789',
  external_reference: 'subscription_user@email.com_pro_monthly'
}

Payment details: {
  id: 123456789,
  status: 'approved',
  amount: 60000,
  currency: 'ARS'
}

Successfully processed subscription upgrade: {
  userEmail: 'user@email.com',
  plan: 'Trademark Pro',
  tier: 'pro',
  startDate: '2025-06-22T18:30:00.000Z',
  endDate: '2025-07-22T18:30:00.000Z'
}
```

## 🚨 **Manejo de Errores**

### **Errores Comunes**
1. **Token Inválido**: Verificar credenciales de MercadoPago
2. **Usuario No Encontrado**: Verificar que el email existe
3. **Plan No Encontrado**: Verificar que el monto coincide con un plan
4. **Webhook No Recibido**: Verificar URL del webhook

### **Fallbacks**
- **Sandbox**: Respuesta mock para testing
- **Errores de API**: Logs detallados para debugging
- **Pagos Fallidos**: No se procesa la actualización

## 🔒 **Seguridad**

### **Validaciones**
- ✅ Verificación de firma del webhook
- ✅ Validación del estado del pago
- ✅ Verificación de la referencia externa
- ✅ Validación del usuario

### **Buenas Prácticas**
- 🔐 Usar HTTPS en producción
- 🔐 Validar todos los datos del webhook
- 🔐 Logs para auditoría
- 🔐 Manejo de errores robusto

## 📈 **Escalabilidad**

### **Ventajas**
- ✅ Sin base de datos compleja
- ✅ Actualización automática
- ✅ Fácil de mantener
- ✅ Escalable horizontalmente

### **Consideraciones**
- 📊 Monitorear logs de webhooks
- 📊 Backup de datos de suscripción
- 📊 Rate limiting para webhooks
- 📊 Alertas para errores críticos

## 🎉 **Resultado Final**

Con **Link de Pago**, tienes:
- ✅ **Pagos simples** y confiables
- ✅ **Actualización automática** de usuarios
- ✅ **Menos código** para mantener
- ✅ **Mejor experiencia** de usuario
- ✅ **Escalabilidad** sin complejidad

¡El sistema funciona automáticamente una vez configurado! 🚀 