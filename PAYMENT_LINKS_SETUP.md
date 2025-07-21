# 🔗 Configuración de Links de Pago - Guía Rápida

## ✅ **Ya tienes configurado:**
- **Premium Mensual**: `YOUR_MERCADOPAGO_LINK_ID_FOR_25000_ARS` ($25,000 ARS)
- **Premium Anual**: `YOUR_ANNUAL_LINK_ID` ($250,000 ARS, 2 meses gratis)

## 🚀 **Pasos para crear el Link:**

1. **Ve a MercadoPago Developers**: https://www.mercadopago.com/developers
2. **Accede a tu aplicación**
3. **Ve a "Herramientas" → "Link de Pago"**
4. **Click "Crear Link de Pago"**
5. **Configura:**
   - **Título**: "Plan Premium - mes" o "Plan Premium - año"
   - **Precio**: $25,000 ARS (mensual) o $250,000 ARS (anual)
   - **Descripción**: "Suscripción mensual/anual al plan Premium - Marcas ilimitadas"
   - **Cantidad**: 1
   - **Moneda**: ARS
6. **Click "Crear"**
7. **Copia el ID del link** (aparece en la URL o en los detalles)

## 📝 **Actualiza el archivo de configuración:**

Una vez que tengas el ID, actualiza `src/lib/payment-links.ts`:

```typescript
export const PAYMENT_LINKS = {
  premium: {
    monthly: 'YOUR_MERCADOPAGO_LINK_ID_FOR_25000_ARS',
    yearly: 'YOUR_ANNUAL_LINK_ID',
  },
};
```

## 🧪 **Testing:**

Una vez configurados todos los links:
1. Ve al dashboard
2. Click "Actualizar"
3. Prueba cada plan y ciclo de facturación
4. Verifica que redirija a MercadoPago correctamente

## ⚡ **Ventajas de este enfoque:**

- ✅ **Más simple** que la API
- ✅ **Menos código** para mantener
- ✅ **Más confiable** - menos puntos de falla
- ✅ **Automático** - los usuarios se actualizan según el monto pagado

¡Una vez que tengas todos los IDs, el sistema funcionará perfectamente! 🎉 