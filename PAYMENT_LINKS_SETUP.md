# 🔗 Configuración de Links de Pago - Guía Rápida

## ✅ **Ya tienes configurado:**
- **Essential Mensual**: `574639139-3ee1d428-9325-4e41-b605-52165c1e5dce` ($40,000 ARS)

## 🔧 **Necesitas crear estos Links de Pago:**

### **1. Essential Anual**
- **Monto**: $400,000 ARS
- **Título**: "Plan Essential - año"
- **Descripción**: "Suscripción anual al plan Essential - Hasta 10 marcas"

### **2. Pro Mensual**
- **Monto**: $60,000 ARS
- **Título**: "Plan Trademark Pro - mes"
- **Descripción**: "Suscripción mensual al plan Trademark Pro - Hasta 25 marcas"

### **3. Pro Anual**
- **Monto**: $600,000 ARS
- **Título**: "Plan Trademark Pro - año"
- **Descripción**: "Suscripción anual al plan Trademark Pro - Hasta 25 marcas"

### **4. Master Mensual**
- **Monto**: $90,000 ARS
- **Título**: "Plan Master Brand - mes"
- **Descripción**: "Suscripción mensual al plan Master Brand - Marcas ilimitadas"

### **5. Master Anual**
- **Monto**: $900,000 ARS
- **Título**: "Plan Master Brand - año"
- **Descripción**: "Suscripción anual al plan Master Brand - Marcas ilimitadas"

## 🚀 **Pasos para crear cada Link:**

1. **Ve a MercadoPago Developers**: https://www.mercadopago.com/developers
2. **Accede a tu aplicación**
3. **Ve a "Herramientas" → "Link de Pago"**
4. **Click "Crear Link de Pago"**
5. **Configura:**
   - **Título**: (como se indica arriba)
   - **Precio**: (monto exacto en ARS)
   - **Descripción**: (como se indica arriba)
   - **Cantidad**: 1
   - **Moneda**: ARS
6. **Click "Crear"**
7. **Copia el ID del link** (aparece en la URL o en los detalles)

## 📝 **Actualiza el archivo de configuración:**

Una vez que tengas todos los IDs, actualiza `src/lib/payment-links.ts`:

```typescript
export const PAYMENT_LINKS: Record<string, PaymentLinkConfig> = {
  essential: {
    monthly: '574639139-3ee1d428-9325-4e41-b605-52165c1e5dce', // ✅ Ya configurado
    yearly: 'TU_ID_ESSENTIAL_ANUAL', // 🔧 Reemplazar
  },
  pro: {
    monthly: 'TU_ID_PRO_MENSUAL', // 🔧 Reemplazar
    yearly: 'TU_ID_PRO_ANUAL', // 🔧 Reemplazar
  },
  master: {
    monthly: 'TU_ID_MASTER_MENSUAL', // 🔧 Reemplazar
    yearly: 'TU_ID_MASTER_ANUAL', // 🔧 Reemplazar
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