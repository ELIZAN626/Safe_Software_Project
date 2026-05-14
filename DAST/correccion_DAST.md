# Corrección de vulnerabilidades y errores DAST

Este documento detalla las correcciones realizadas en el código para mitigar las vulnerabilidades identificadas durante el análisis DAST (Dynamic Application Security Testing).

## 1. Gestión Segura de Puntuación (Logic Abuse / Insecure Endpoint)

### Vulnerabilidad Identificada
Se permitía a los usuarios establecer su puntuación directamente desde la consola del navegador mediante una función expuesta globalmente que llamaba al endpoint `/api/auth/user/:userId/score`. Esto permitía la manipulación arbitraria de puntos.

### Corrección Implementada
- **Backend**: Se implementó un nuevo endpoint `/api/auth/user/:userId/score/inc` que utiliza el operador `$inc` de MongoDB para incrementar la puntuación en lugar de establecerla directamente.
- **Frontend**: Se refactorizó la lógica en `menuP.html` para utilizar la función `addPointsToCurrentUser` dentro de un módulo (`rankingModule`), la cual ahora llama al endpoint de incremento (`/score/inc`).
- **Control de Exposición**: Aunque la función sigue expuesta globalmente para fines de depuración (`window.addPointsToCurrentUser`), ahora requiere un valor de incremento (`delta`) y el backend valida que sea un entero.

## 2. Validación de Compras y Evitación de Duplicados (Stripe Integration)

### Vulnerabilidad Identificada
El sistema permitía intentar comprar fondos que el usuario ya poseía, o comprar el paquete completo ("all") incluso si ya tenía fondos individuales, lo que podría llevar a errores en el estado del usuario o transacciones innecesarias.

### Corrección Implementada
- **Backend (`server.js`)**: Se añadieron verificaciones en el endpoint de verificación de sesión de Stripe para asegurar que:
    - Si el producto es `all`, el usuario no tenga fondos previos.
    - Si el producto es individual, el usuario no tenga ya ese producto o el paquete `all`.
- **Frontend (`tienda.html`)**: Se implementó la función `disablePurchasedButtons` que consulta los fondos del usuario al cargar la tienda y deshabilita los botones de compra para productos ya adquiridos o incompatibles.

## 3. Seguridad en la Autenticación (Broken Authentication)

### Vulnerabilidad Identificada
Uso de contraseñas en texto plano o hashing débil.

### Corrección Implementada
- **Modelo de Usuario (`user.js`)**: Se utiliza `bcryptjs` con 10 rondas de sal para hashear las contraseñas antes de guardarlas en la base de datos mediante un middleware `pre('save')`.
- **Validación**: Se implementó el método `matchPassword` para comparar de forma segura las contraseñas ingresadas con los hashes almacenados.

## 4. Protección de Datos Sensibles (Sensitive Data Exposure)

### Vulnerabilidad Identificada
Exposición de información sensible como contraseñas o datos de tarjetas de crédito en las respuestas de la API.

### Corrección Implementada
- **Filtros de Proyección**: En los endpoints de obtención de datos de usuario (`/user/:userId`), se utilizan filtros de proyección en Mongoose (`.select('-password -creditCards')`) para asegurar que estos campos nunca se envíen al cliente.

---
*Nota: Se recomienda migrar el sistema de tokens basado en IDs simples a un estándar como JWT para mejorar la seguridad de las sesiones.*
