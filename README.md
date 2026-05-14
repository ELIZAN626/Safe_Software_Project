# 🐓 Cock Fighters (Safe Software Project)

![Cock Fighters](./Assets/interface/cockFighterTitulo.png)

Este proyecto es una plataforma interactiva que incluye un ecosistema completo para un juego multijugador en tiempo real de combates de gallos, integrando una tienda de artículos virtuales (fondos de escenario) mediante Stripe y una infraestructura de backend construida bajo altos estándares de seguridad y criptografía.

---

##  1. Definición Clara de Requerimientos

La aplicación fue desarrollada para cumplir con exigentes requerimientos tanto a nivel de usuario como a nivel de seguridad, solucionando vulnerabilidades comunes identificadas en análisis DAST y SAST (como inyecciones, fuga de datos y criptografía débil).

### Requerimientos Funcionales
- **Sistema de Cuentas y Autenticación:** Registro seguro, inicio de sesión y gestión de la sesión del jugador.
- **Gestión de Inventario y Perfil:** El usuario puede tener un equipo de gallos (`gallos`), fondos comprados (`fondos`), tarjetas guardadas en el perfil y un puntaje global (`score`).
- **Tienda de Bienes Digitales:** Interfaz que muestra productos premium (fondos) e integración de pagos mediante la pasarela de Stripe Checkout. Debe permitir comprar ítems individuales o un paquete completo ("Todos los fondos") asegurando validación del lado del servidor para evitar compras duplicadas.
- **Multijugador en Tiempo Real:** Emparejamiento de dos jugadores (Matchmaking), transmisión de estado (`set_team`, `endResults`), y gestión de eventos de desconexión mediante WebSockets.
- **Tablas de Clasificación:** Obtención y muestra de un Ranking (Top N) basado en la puntuación de los jugadores.

### Requerimientos No Funcionales y de Seguridad
- **Criptografía Fuerte (Confidencialidad e Integridad):** Los datos sensibles como los números de tarjeta de crédito se encriptan utilizando el algoritmo autenticado `aes-256-gcm`. La llave criptográfica se deriva usando el algoritmo seguro `scrypt`, complementado con un Vector de Inicialización (IV) único por registro y validación con *AuthTag*.
- **Almacenamiento Seguro de Contraseñas:** Uso de `bcryptjs` con generación de salt por cada contraseña almacenada.
- **Validación Estricta de Entradas (Prevención de Inyecciones):** Todos los esquemas de bases de datos (Mongoose) cuentan con las propiedades `strict: true`, validaciones con expresiones regulares (`match`) para nombres, emails y tarjetas, previniendo ataques de XSS, inyección NoSQL y envenenamiento de esquemas.
- **Control de Acceso y Red:** El servidor tiene deshabilitada información sensible en las cabeceras (ej. `Cache-Control` rígido, y limpieza de CSP en la iteración actual para compatibilidad local), y configura políticas controladas de orígenes cruzados (CORS) limitadas a dominios de confianza (localhost/127.0.0.1).

---

##  2. Referencias y Documentación Adecuada

El proyecto cuenta con un entorno documentado a nivel de código y arquitectura, respaldado por el archivo `reporte_amenazas.md` y `threat_model.py` que detallan la postura de seguridad.

### Stack Tecnológico
- **Frontend:** Vanilla JavaScript, HTML5, CSS3 con Bootstrap 5.3. Interfaz visual responsive y animada.
- **Backend:** Node.js, Express.js (v5.1).
- **Base de Datos:** MongoDB manipulado a través del ORM Mongoose (v9.0).
- **Redes y Tiempo Real:** Módulo nativo `ws` (WebSockets) para el bucle de juego interactivo.
- **Pagos:** API de [Stripe](https://stripe.com/docs/api) (versión 20.x).

### Documentación de la API (REST)
El servidor expone diversos endpoints para interactuar con la lógica central:

| Método | Endpoint | Descripción |
|---|---|---|
| **POST** | `/api/auth/register` | Crea un usuario validando unicidad de correo y encriptando contraseña. |
| **POST** | `/api/auth/login` | Verifica credenciales y retorna sesión/token básico. |
| **GET**  | `/api/auth/user/:userId` | Retorna los datos públicos del usuario (incluyendo fondos comprados y score). |
| **PUT**  | `/api/auth/user/:userId` | Actualiza la información del perfil (username, email, password) de forma segura. |
| **POST** | `/api/auth/user/:userId/score/inc` | Incrementa o actualiza el puntaje global luego de una victoria en el juego. |
| **GET**  | `/api/gallos` | Devuelve el listado de gallos de pelea disponibles desde la base de datos. |
| **POST** | `/create-checkout-session`| Inicia una transacción con Stripe y retorna el ID de la sesión al cliente. |
| **GET**  | `/checkout-session` | Valida el estado final de una sesión de Stripe asíncronamente y otorga el fondo al usuario. |

### Documentación de WebSockets (Motor Multijugador)
Las comunicaciones dentro del juego usan el puerto base mediante HTTP Upgrade. Los payloads están estructurados en formato JSON con la propiedad `type` como descriptor del evento:
- `set_team`: El cliente declara su equipo. El servidor empareja o asigna el jugador (1 o 2).
- `opponent_joined`: Notifica que el oponente se ha conectado y envía sus datos.
- `endResults`: Procesa la finalización (`winner`, `loser`, `empate`) y propaga los eventos `you_win`, `you_lose`, o `you_tie` a los respectivos clientes.
- `opponent_disconnected`: Desconexión controlada si un socket pierde el latido o cierra abruptamente.

---

##  3. Arquitectura Bien Definida

El software adopta una arquitectura orientada a servicios dividida lógicamente, que facilita la integración de componentes estáticos con servicios dinámicos y de tiempo real.

### Diagrama Lógico de Arquitectura

1. **Capa de Presentación / Cliente (Frontend y Game):**
   - Sirve activos gráficos pesados (`Assets/`), la lógica del motor de juego (`Game/`) y las vistas HTML (`FRONTEND/views/`).
   - El cliente es agnóstico del estado global del servidor; confía en la API HTTP para obtener su perfil y en WebSockets para los comandos del juego.
   - En la tienda (`tienda.html`), el frontend negocia el ID de producto e interactúa directamente con los servidores de StripeJS tras la apertura de la sesión segura del backend.

2. **Capa de Lógica de Negocio y Enrutamiento (Backend Node/Express):**
   - **Core HTTP (`server.js`):** Inicializa la aplicación Express, maneja el *routing* estático y de API, configura CORS y establece la conexión con MongoDB. También hospeda la integración Webhook-like de Stripe para procesar los fondos de forma confiable.
   - **Core Real-Time (`serverExt.js`):** Separa la lógica de WebSockets del servidor HTTP principal. Se encarga exclusivamente del descubrimiento de redes locales (IPs), creación de salas (1v1) y paso de mensajes (Broadcast/Direct) sin bloquear el *Event Loop* HTTP.
   - **Controladores Modulares (`routes/auth.js`):** Desacopla la lógica de autenticación y transacciones del usuario, favoreciendo el principio de responsabilidad única (SRP).

3. **Capa de Persistencia y Datos (MongoDB):**
   - **Modelo `User` (`src/models/user.js`):** Es el corazón de los datos. Está fortificado para actuar como barrera ante datos corruptos o maliciosos. Incorpora funciones nativas de Mongoose (`pre-save`) para ofuscar passwords. También incluye los algoritmos AES-GCM (vía el módulo `crypto` de Node.js) en un método de instancia (`addCreditCard`) para asegurar que todo dato de tarjeta viaje y repose encriptado a prueba de alteraciones.
   - **Modelo `Gallos`:** Sirve como catálogo inmutable de estadísticas y metadata gráfica de cada peleador.

### Consideraciones sobre el Ciclo de Desarrollo
La estructuración de este proyecto ha seguido metodologías de desarrollo seguro (SSDLC). Los comentarios en el código (marcados como `// NUEVO SAST` y `// NUEVO DAST`) documentan las remediaciones y evoluciones de la arquitectura que fueron aplicadas para transicionar de un prototipo a un entorno de backend robusto, modular y resiliente frente a ataques en la capa de aplicación web.
