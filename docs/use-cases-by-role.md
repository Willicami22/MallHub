# MallHub — Casos de uso por rol (MVP Core v1.0)

## 1. Propósito y alcance

Este documento define el **alcance funcional oficial** del **MVP Core v1.0 recortado** de MallHub.

Regla de alcance: **solo se implementa lo que está aquí**. Todo lo que no esté explícitamente listado queda diferido a fases posteriores.

## 2. Fuentes y precedencia

Fuentes revisadas:

1. `docs/SoftwareRequirementsSpecification.md`
2. `apps/web/prisma/schema.prisma`
3. `database.dbml`

Criterio de precedencia:

1. Este documento (alcance operativo del MVP Core).
2. SRS (`SoftwareRequirementsSpecification.md`) como base contractual.
3. Esquemas de datos (`schema.prisma` y `database.dbml`) como traducción técnica del alcance.

## 3. Roles del sistema en MVP Core

| Rol | Tipo | Superficie principal | Objetivo operativo |
|---|---|---|---|
| Invitado | B2C anónimo | MallHub App | Navegar malls, tiendas, productos y promociones |
| Cliente Registrado | B2C autenticado | MallHub App | Reservar productos para recogida (Pick & Collect) y gestionar perfil |
| Admin Local (Tienda) | B2B comerciante | MallHub Store | Gestionar tienda, productos, promociones y reservas |
| Admin CC | B2B institucional | MallHub Insights | Operar información del mall, aprobar tiendas y ver métricas básicas |
| Admin Plataforma (Super Admin) | Interno MallHub | Backoffice | Crear Admin CC y monitorear métricas globales |

## 4. Catálogo de casos de uso por rol (solo core)

### 4.1 Invitado

- **US-INV-01** — Seleccionar y cambiar centro comercial activo
- **US-INV-02** — Navegar directorio de tiendas del mall activo
- **US-INV-03** — Navegar productos y promociones por tienda
- **US-INV-04** — Buscar tiendas, productos y promociones
- **US-INV-05** — Aplicar filtros de búsqueda (categoría, precio, tienda y otros filtros del dominio)

### 4.2 Cliente Registrado

- **US-CR-01** — Registrarse con correo y contraseña
- **US-CR-02** — Iniciar y cerrar sesión
- **US-CR-03** — Personalizar el perfil personal
- **US-CR-04** — Crear una reserva Pick & Collect para recogida en tienda
- **US-CR-05** — Recibir y visualizar código QR de confirmación de reserva
- **US-CR-06** — Consultar estado e historial de reservas
- **US-CR-07** — Gestionar favoritos de tiendas, productos y promociones _(Opcional en MVP Core)_

### 4.3 Admin Local (Tienda)

- **US-AL-01** — Registrar tienda y solicitar aprobación
- **US-AL-02** — Personalizar información básica de la tienda
- **US-AL-03** — CRUD completo de productos
- **US-AL-04** — Crear productos asistidos por IA
- **US-AL-05** — Generar y gestionar promociones
- **US-AL-06** — Gestionar reservas de usuarios (confirmar, rechazar, completar)

### 4.4 Admin CC

- **US-ACC-01** — Personalizar información pública del centro comercial
- **US-ACC-02** — Aceptar y rechazar registros de tiendas
- **US-ACC-03** — Consultar dashboard con estadísticas básicas del mall
- **US-ACC-04** — Generar reportes ejecutivos asistidos por IA

### 4.5 Admin Plataforma (Super Admin)

- **US-AP-01** — Crear usuarios Admin CC
- **US-AP-02** — Consultar dashboard global de métricas de la plataforma

## 5. Sección IA (LLM) del MVP Core

### 5.1 AI-01 — Asistente de creación de productos (Admin Local)

Objetivo funcional: acelerar la publicación de catálogo para **US-AL-04** con sugerencias de nombre, descripción, categoría y precio base.

Resultado esperado:

1. Flujo asistido opcional dentro del alta de producto.
2. Sugerencias siempre editables antes de guardar/publicar.
3. Flujo manual completo disponible si la IA no responde.

### 5.2 AI-02 — Generador de reportes ejecutivos (Admin CC)

Objetivo funcional: convertir métricas básicas del mall en reportes accionables para **US-ACC-04**.

Resultado esperado:

1. Generación de reporte narrativo por período.
2. Recomendaciones priorizadas para operación comercial.
3. Exportación del resultado con trazabilidad de asistencia IA.

### 5.3 Guardrails obligatorios de IA

1. **Human-in-the-loop obligatorio**: la IA sugiere y el usuario decide.
2. **Sin autonomía transaccional**: la IA no publica ni ejecuta cambios por sí sola.
3. **Privacidad por diseño**: no exponer PII innecesaria al proveedor LLM.
4. **Observabilidad**: registrar uso, errores y costos de inferencia.

## 6. Fuera de alcance explícito del MVP Core

Quedan diferidos:

1. Gestión de eventos del mall y recordatorios.
2. Mapa interactivo interior del mall y heatmaps avanzados.
3. Reseñas/calificaciones de tiendas y social features.
4. Publicidad nativa, campañas y analítica de campañas.
5. Facturación, suscripciones y monetización avanzada.
6. Moderación avanzada y operaciones de cumplimiento extendidas.
7. Cualquier capacidad no listada en la sección 4.

## 7. Regla de gobernanza

1. Todo requerimiento nuevo debe entrar primero a este documento.
2. Si un caso de uso no está aquí, queda fuera de alcance del MVP Core.
3. Este documento gobierna la priorización funcional de desarrollo y QA.
