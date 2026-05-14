# Análisis SAST y trazabilidad con el modelado de amenazas — WebGame

**Integrantes (según entrega PDF):** Elí J. Álvarez Guillén, Darío Lucciano Rodríguez Dueñes, Alexis Geovanni Flores Vázquez, Nicolás González Pérez.

Este documento consolida el **modelado de amenazas (pytm)**, el **análisis estático (Snyk Code)** sobre el backend y **cómo se abordaron los hallazgos** en el código actual del repositorio.

---

## 1. Introducción y alcance

El análisis se dividió en dos fases:

1. **Modelado de amenazas (teórico):** mapa de actores, componentes y flujos con `pytm`.
2. **SAST (práctico):** escaneo estático con **Snyk Code** sobre la carpeta `BACKEND/`.

**Nota de arquitectura:** el diseño original contempla despliegue en la nube (por ejemplo AWS EC2 con Nginx como proxy inverso). Este documento y las pruebas documentadas se centran en el **entorno local**, validando que el código sea seguro desde el origen antes de producción.

---

## 2. Modelado de amenazas (pytm) — rutas y artefactos

### 2.1 Qué archivos son el “antes” y el “después”

| Rol | Ruta en el repo | Qué es |
|-----|-----------------|--------|
| **Definición del modelo** | `threat_model.py` (raíz del proyecto) | Script Python que declara el TM: actores (`jugador`), componentes (`backend nodejs`, `db local`) y flujos de datos. Es el **origen** del modelado; al ejecutarlo se procesa el grafo con `tm.process()`. |
| **Salida / listado de amenazas** | `reporte_amenazas.md` (raíz) | Lista de identificadores de amenazas que **pytm** asocia al modelo (catálogo STRIDE / taxonomía de la herramienta). Sirve como **evidencia** de qué clases de riesgo se consideraron automáticamente. |

No hay otros archivos generados (por ejemplo diagramas `.dfd`) versionados en el repositorio; si se necesitan diagramas, se generan al correr `threat_model.py` en un entorno con `pytm` instalado.

### 2.2 Modelo conceptual (resumen)

- **Actor:** jugador.
- **Servidor:** backend Node.js (Express).
- **Almacén:** base de datos (en el modelo aparece como “db local”; en la app real se usa **MongoDB** vía Mongoose).
- **Flujos:** peticiones HTTP del jugador al servidor; consultas del servidor a la base de datos.

### 2.3 Amenazas teóricas más relevantes (documento original)

| ID (pytm) | Riesgo |
|-----------|--------|
| **CR03** | Ataque de diccionario / fuerza bruta sobre credenciales de login. |
| **INP31** | Inyección de comandos / SQLi (manipulación de datos a través de modelos y consultas). |
| **DS06** | Fuga de datos (por ejemplo llaves de cifrado o datos sensibles de Stripe). |
| **DE03** | Sniffing / intercepción si el tráfico no va cifrado en la red. |

---

## 3. Análisis SAST (Snyk Code) — resumen ejecutivo

- **Herramienta:** Snyk Code.
- **Alcance escaneado:** carpeta `BACKEND/` (código fuente Node.js/Express).
- **Resultado documentado en el PDF:** **5 hallazgos** (1 alta, 4 medias).
- **Archivos señalados como críticos en el informe:** `BACKEND/src/models/user.js` (cifrado y secretos), `BACKEND/server.js` (red y límites).

La idea del SAST fue **confirmar** que varias amenazas del modelo teórico tienen correspondencia en el código (secretos, cifrado débil, HTTP, huellas del framework, ausencia de límites).

---

## 4. Plan de remediación vs estado en el código (mayo 2026)

| Prioridad | Hallazgo (SAST / plan) | Solución planificada | Estado en el repositorio |
|-----------|------------------------|----------------------|---------------------------|
| **Alta** | Llave de cifrado hardcodeada en `user.js` | Cargar clave vía `process.env.CIPHER_KEY` y `.env` fuera de Git | **Implementado:** `BACKEND/src/models/user.js` usa `process.env.CIPHER_KEY` (con valor de respaldo solo para desarrollo documentado en comentario). `dotenv` carga `.env` desde `BACKEND/server.js`. |
| **Media** | Cifrado sin integridad (`createCipher` / flujo antiguo) | Migrar a **AES-256-GCM** con `createCipheriv` | **Implementado:** `addCreditCard` usa `crypto.createCipheriv('aes-256-gcm', ...)` con IV aleatorio y `authTag`. |
| **Media** | Tráfico HTTP (sniffing) | HTTPS local con certificados autofirmados | **Parcial / pendiente:** `BACKEND/server.js` sigue usando `http.createServer`. En `package.json` existe `selfsigned`, pero el arranque principal documentado es HTTP. CORS ya contempla `https://localhost:3000` como origen permitido. |
| **Media** | Cabecera `X-Powered-By: Express` | **Helmet** | **Implementado:** `BACKEND/server.js` — `helmet` con CSP, `hidePoweredBy: true`, `noSniff`, etc. |
| **Media** | Falta de límites (DoS / operaciones costosas) | **express-rate-limit** | **Dependencia instalada, uso no verificado en código:** `express-rate-limit` aparece en `BACKEND/package.json`, pero no hay `require`/`app.use` de rate limit en los `.js` del backend revisados. Conviene **activar** el middleware en rutas sensibles (login, APIs, Stripe). |

---

## 5. Otros reportes en Markdown (qué suelen pedir como “REPORTES”)

Cuando un compañero pide **“reportes”** en `.md`, normalmente se refiere a **documentación de cierre**: no solo listar vulnerabilidades, sino **evidencia + remediación**:

- Qué herramienta corrió y sobre qué rutas.
- Tabla de hallazgos (severidad, archivo, línea si aplica).
- **Cómo se resolvió** (commit, cambio de diseño, configuración).
- Qué quedó **pendiente** o aceptado como riesgo residual.

Este archivo cumple ese rol para **SAST + enlace al modelado**. Otros análisis del mismo proyecto pueden vivir en archivos separados (por ejemplo el análisis **SCA / Secret Scanning** ya descrito en `Analisis SAC & Secret Scanning.md` en la raíz).

---

## 6. Conclusión

La combinación **pytm + Snyk** validó que WebGame necesitaba endurecer **gestión de secretos**, **cifrado con integridad** y **cabeceras HTTP**. Gran parte del plan del PDF está **reflejada en el código** (`user.js`, `server.js`). Quedan mejoras claras: **HTTPS en el servidor local de arranque**, **uso efectivo de rate limiting** y asegurar que **no haya claves en el historial de Git** (alineado al hallazgo de `key.pem` en secret scanning, si aún aplica en el historial).

---

## 7. Referencias de rutas rápidas

| Tema | Ruta |
|------|------|
| Modelado (fuente) | `threat_model.py` |
| Listado amenazas pytm | `reporte_amenazas.md` |
| Cifrado tarjetas / env | `BACKEND/src/models/user.js` |
| Helmet / CORS / servidor HTTP | `BACKEND/server.js` |
| Variables de entorno (ejemplo local) | `.env` (no versionar secretos reales) |
| SCA / Gitleaks (otro tipo de análisis) | `Analisis SAC & Secret Scanning.md` |
