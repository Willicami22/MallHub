# MallHub — Casos de uso por rol (MVP v1.0)

## 1. Propósito y alcance

Este documento define el **alcance funcional oficial** de MallHub por rol para el **MVP v1.0**. Es una **prueba de concepto (PoC) completamente funcional**, no un producto final con todo el roadmap.

Regla de alcance: **solo se implementa lo que está aquí**. Todo lo que no esté explícitamente listado se considera fuera de alcance del MVP.

## 2. Fuentes analizadas y criterio de precedencia

Fuentes revisadas:

1. `docs/SoftwareRequirementsSpecification.md`
2. `docs/MallHub_UX_UI_Documento_Tecnico.pdf`
3. `docs/mallhub_startup_analysis.pdf`
4. `docs/MallHub_Colorimetria_v1.0.pdf`

Criterio de precedencia para resolver diferencias entre documentos:

1. **SRS (`SoftwareRequirementsSpecification.md`)** como fuente contractual principal.
2. **UX/UI técnico** como refinamiento de flujos y superficies.
3. **Startup analysis** como contexto estratégico de negocio y secuencia de crecimiento.
4. **Colorimetría** como guía visual/no funcional.

## 3. Roles del sistema en v1.0

| Rol | Tipo | Superficie principal | Objetivo operativo |
|---|---|---|---|
| Guest (Invitado) | B2C anónimo | MallHub App (mobile) | Descubrir oferta del mall sin registro |
| Cliente Registrado | B2C autenticado | MallHub App (mobile) | Reservar, seguir pedidos, favoritos y notificaciones |
| Admin Local | B2B comerciante | MallHub Store (desktop) | Gestionar catálogo, reservas y promociones de su tienda |
| Admin CC | B2B institucional | MallHub Insights (desktop) | Operar eventos, tiendas y analítica de su mall |
| Admin Plataforma | Interno MallHub | Backoffice en Insights (desktop) | Gobernar malls, tiendas, facturación, moderación y salud global |

## 4. Catálogo completo de casos de uso por rol

> Salvo los casos marcados como **Diferido**, todos los casos listados son de alcance **MVP v1.0**.

### 4.1 Guest (Invitado)

- **US-INV-01** — Continuar como invitado desde el onboarding
- **US-INV-02** — Seleccionar mall manualmente
- **US-INV-03** — Detectar mall activo por geolocalización
- **US-INV-04** — Ver el Home Feed del mall activo
- **US-INV-05** — Explorar el directorio de tiendas
- **US-INV-06** — Filtrar tiendas en el directorio
- **US-INV-07** — Ver el perfil de una tienda
- **US-INV-08** — Ver el detalle de un producto
- **US-INV-09** — Buscar productos en el mall
- **US-INV-10** — Filtrar resultados de búsqueda
- **US-INV-11** — Ver el listado de eventos del mall
- **US-INV-12** — Ver el detalle de un evento
- **US-INV-13** — Ver ofertas y promociones del mall
- **US-INV-14** — Ver el mapa del mall
- **US-INV-15** — Intentar reservar un producto sin cuenta
- **US-INV-16** — Intentar agregar a favoritos sin cuenta
- **US-INV-17** — Navegar con Bottom Tab Bar
- **US-INV-18** — Accesibilidad con lectores de pantalla

### 4.2 Cliente Registrado

- **US-CR-01** — Registrarse con correo y contraseña
- **US-CR-02** — Verificar correo electrónico
- **US-CR-03** — Iniciar sesión con correo y contraseña
- **US-CR-04** — Recuperar contraseña olvidada
- **US-CR-05** — Cerrar sesión
- **US-CR-06** — Completar y editar el perfil personal
- **US-CR-07** — Seleccionar y cambiar el mall preferido
- **US-CR-08** — Realizar una reserva Click & Collect (Paso 1 — Confirmar producto)
- **US-CR-09** — Realizar una reserva Click & Collect (Paso 2 — Datos de recogida)
- **US-CR-10** — Realizar una reserva Click & Collect (Paso 3 — Confirmación exitosa)
- **US-CR-11** — Ver el código QR de una reserva activa
- **US-CR-12** — Ver y gestionar el historial de reservas
- **US-CR-13** — Cancelar una reserva activa
- **US-CR-14** — Calificar una tienda después de recoger un pedido _(Diferido v2.0)_
- **US-CR-15** — Guardar una tienda en favoritos
- **US-CR-16** — Guardar un producto en favoritos
- **US-CR-17** — Guardar una oferta en favoritos
- **US-CR-18** — Activar recordatorio para un evento del mall
- **US-CR-19** — Recibir notificaciones push contextuales
- **US-CR-20** — Gestionar preferencias de notificaciones
- **US-CR-21** — Ver la sección de Favoritos completa
- **US-CR-22** — Accesibilidad — Alto contraste y tamaño de fuente

### 4.3 Admin Local

- **US-AL-01** — Registrar la tienda en la plataforma
- **US-AL-02** — Completar el perfil de la tienda durante el onboarding
- **US-AL-03** — Iniciar sesión en MallHub Store
- **US-AL-04** — Recuperar contraseña olvidada
- **US-AL-05** — Ver el dashboard de la tienda
- **US-AL-06** — Ver y filtrar el catálogo de productos
- **US-AL-07** — Agregar un nuevo producto al catálogo
- **US-AL-08** — Agregar variantes a un producto
- **US-AL-09** — Agregar precio con descuento a un producto
- **US-AL-10** — Editar un producto existente del catálogo
- **US-AL-11** — Activar o desactivar un producto del catálogo
- **US-AL-12** — Actualizar la disponibilidad de stock de un producto
- **US-AL-13** — Duplicar un producto del catálogo
- **US-AL-14** — Eliminar un producto del catálogo
- **US-AL-15** — Recibir notificación de nueva reserva
- **US-AL-16** — Ver y filtrar las reservas recibidas
- **US-AL-17** — Confirmar una reserva pendiente
- **US-AL-18** — Rechazar una reserva con motivo
- **US-AL-19** — Marcar una reserva como completada
- **US-AL-20** — Editar el perfil público de la tienda
- **US-AL-21** — Publicar una promoción u oferta flash
- **US-AL-22** — Ver el historial de promociones publicadas
- **US-AL-23** — Ver analytics básicos de la tienda (Plan Pro)
- **US-AL-24** — Cerrar sesión en MallHub Store
- **US-AL-25** — Crear un producto asistido por IA a partir de imágenes

### 4.4 Admin CC

- **US-ACC-01** — Iniciar sesión en MallHub Insights
- **US-ACC-02** — Recuperar contraseña olvidada
- **US-ACC-03** — Cerrar sesión en MallHub Insights
- **US-ACC-04** — Ver los KPIs ejecutivos del mall en el dashboard principal
- **US-ACC-05** — Cambiar el período de análisis del dashboard
- **US-ACC-06** — Ver la gráfica de tendencia temporal del mall
- **US-ACC-07** — Exportar reporte del dashboard en PDF
- **US-ACC-08** — Exportar reporte del dashboard en Excel
- **US-ACC-09** — Ver el análisis de rendimiento individual por tienda
- **US-ACC-10** — Ver el heatmap de actividad por piso del mall
- **US-ACC-11** — Enviar alerta a una tienda inactiva
- **US-ACC-12** — Exportar datos de rendimiento de tiendas
- **US-ACC-13** — Crear un nuevo evento del mall
- **US-ACC-14** — Editar un evento existente
- **US-ACC-15** — Cancelar un evento publicado
- **US-ACC-16** — Ver las métricas de alcance de un evento
- **US-ACC-17** — Programar el envío de push notification de un evento
- **US-ACC-18** — Ver las tiendas pendientes de aprobación
- **US-ACC-19** — Aprobar el registro de una tienda
- **US-ACC-20** — Rechazar el registro de una tienda
- **US-ACC-21** — Suspender una tienda activa
- **US-ACC-22** — Reactivar una tienda suspendida
- **US-ACC-23** — Agregar una tienda manualmente al mall
- **US-ACC-24** — Ver el perfil público de una tienda del mall
- **US-ACC-25** — Editar la información pública del mall
- **US-ACC-26** — Actualizar el logo e imágenes del mall
- **US-ACC-27** — Actualizar el mapa SVG del mall por piso
- **US-ACC-28** — Gestionar las categorías de tiendas del mall
- **US-ACC-29** — Generar reportes ejecutivos y alertas inteligentes con IA

### 4.5 Admin Plataforma

- **US-AP-01** — Iniciar sesión con autenticación de doble factor (2FA)
- **US-AP-02** — Configurar el 2FA por primera vez
- **US-AP-03** — Recuperar contraseña olvidada
- **US-AP-04** — Cerrar sesión del backoffice
- **US-AP-05** — Consultar el audit log de acciones del backoffice
- **US-AP-06** — Ver el dashboard global de métricas de la plataforma
- **US-AP-07** — Monitorear la salud técnica de la plataforma
- **US-AP-08** — Crear un nuevo mall en la plataforma
- **US-AP-09** — Editar la configuración de un mall existente
- **US-AP-10** — Activar un mall para hacerlo visible en la app
- **US-AP-11** — Desactivar o suspender un mall activo
- **US-AP-12** — Ver el listado global de todos los malls
- **US-AP-13** — Aprobar el registro de una tienda a nivel global
- **US-AP-14** — Suspender una tienda a nivel global
- **US-AP-15** — Moderar contenido inapropiado en catálogos de tiendas
- **US-AP-16** — Moderar contenido de imágenes en tiendas y malls
- **US-AP-17** — Asignar o cambiar el plan de suscripción de un mall
- **US-AP-18** — Asignar o cambiar el plan de suscripción de una tienda
- **US-AP-19** — Ver y gestionar el estado de facturación de malls y tiendas
- **US-AP-20** — Crear y gestionar campañas publicitarias nativas en la app _(Diferido v3.0)_
- **US-AP-21** — Consultar métricas de rendimiento de una campaña publicitaria _(Diferido v3.0)_
- **US-AP-22** — Ver el listado global de tiendas de toda la plataforma

## 5. Sección IA (LLM) del MVP

### 5.1 AI-01 — Asistente de publicación de catálogo (Admin Local)

Objetivo funcional: acelerar la creación de productos desde imágenes con sugerencias de nombre, descripción, categoría y variantes para el flujo **US-AL-25**.

Resultado esperado en MVP:

1. Flujo asistido opcional dentro del alta de producto.
2. Sugerencias editables por el Admin Local antes de publicar.
3. Fallback manual completo si la IA no responde o falla.

### 5.2 AI-02 — Generador de reportes y alertas (Admin CC)

Objetivo funcional: transformar KPIs del mall en narrativas ejecutivas y alertas accionables para el flujo **US-ACC-29**.

Resultado esperado en MVP:

1. Generación de reporte narrativo por período.
2. Detección de alertas priorizadas y sugerencias de acción.
3. Consultas en lenguaje natural sobre los datos disponibles del dashboard.
4. Exportación del resultado con trazabilidad de que fue asistido por IA.

### 5.3 Guardrails obligatorios de IA en v1.0

1. **Human-in-the-loop obligatorio**: la IA sugiere; el usuario decide/publica/exporta.
2. **Sin autonomía transaccional**: la IA no publica, no modifica precios/stock, no envía push por sí sola y no ejecuta operaciones financieras.
3. **Privacidad por diseño**: no enviar PII a la API del LLM; solo contexto mínimo necesario.
4. **Observabilidad y control de costos**: logs de llamadas, límites de uso, circuit breaker y fallback manual.
5. **PoC con proveedor externo**: MallHub no entrena modelos propios en v1.0; integra LLM vía API.

## 6. Límites explícitos del MVP (fuera de alcance v1.0)

No se implementa en este MVP:

1. **Regateo/negociación de precios** (diferido a v2.0).
2. **Calificaciones/reseñas completas** como capacidad consolidada de producto (US-CR-14 diferido v2.0).
3. **Campañas publicitarias nativas y analítica de campañas en backoffice** (US-AP-20 y US-AP-21 diferidos v3.0).
4. Capacidades de expansión no críticas de roadmap (internacionalización completa, personalizaciones avanzadas, módulos de crecimiento post-piloto).

## 7. Regla de gobernanza de alcance

Para cualquier iteración de producto:

1. Todo requerimiento nuevo debe agregarse primero a este documento.
2. Si un caso de uso no existe aquí, se considera **rechazado por alcance**.
3. Este documento es la base de priorización, desarrollo y validación funcional del MVP.
