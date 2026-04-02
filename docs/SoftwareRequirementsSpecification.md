# Especificación de requisitos de software
## Para MallHub

Versión 0.1  
Preparado por Equipo de MallHub  
Escuela Colombiana de Ingenieria Julio Garavito  
27 de marzo 2026 

## Tabla de contenido
<!-- TOC -->
- [Especificación de requisitos de software](#especificación-de-requisitos-de-software)
  - [Para MallHub](#para-mallhub)
  - [Tabla de contenido](#tabla-de-contenido)
  - [Historial de revisiones](#historial-de-revisiones)
  - [1. Introducción](#1-introducción)
    - [1.1 Propósito del documento](#11-propósito-del-documento)
    - [1.2 Alcance del producto](#12-alcance-del-producto)
    - [1.3 Definiciones, acrónimos y abreviaturas](#13-definiciones-acrónimos-y-abreviaturas)
    - [1.4 Referencias](#14-referencias)
    - [1.5 Descripción general del documento](#15-descripción-general-del-documento)
  - [2. Descripción general del producto](#2-descripción-general-del-producto)
    - [2.1 Perspectiva del producto](#21-perspectiva-del-producto)
    - [2.2 Funciones del producto](#22-funciones-del-producto)
    - [2.3 Restricciones del producto](#23-restricciones-del-producto)
    - [2.4 Características de los usuarios](#24-características-de-los-usuarios)
      - [Rol 1 — Invitado](#rol-1--invitado)
      - [Rol 2 — Cliente Registrado](#rol-2--cliente-registrado)
      - [Rol 3 — Admin Local](#rol-3--admin-local)
      - [Rol 4 — Admin CC (Administrador del Centro Comercial)](#rol-4--admin-cc-administrador-del-centro-comercial)
      - [Rol 5 — Admin Plataforma](#rol-5--admin-plataforma)
    - [2.5 Supuestos y dependencias](#25-supuestos-y-dependencias)
      - [Supuestos](#supuestos)
      - [Dependencias](#dependencias)
    - [2.6 Asignación de requisitos](#26-asignación-de-requisitos)
  - [3. Requisitos](#3-requisitos)
      - [3.1.1 Interfaces de usuario](#311-interfaces-de-usuario)
        - [IU-APP — MallHub App (Tauri Mobile · Invitado y Cliente Registrado)](#iu-app--mallhub-app-tauri-mobile--invitado-y-cliente-registrado)
        - [IU-STR — MallHub Store (Tauri Desktop · Admin Local)](#iu-str--mallhub-store-tauri-desktop--admin-local)
        - [IU-INS — MallHub Insights (Tauri Desktop · Admin CC y Admin Plataforma)](#iu-ins--mallhub-insights-tauri-desktop--admin-cc-y-admin-plataforma)
      - [3.1.2 Interfaces de hardware](#312-interfaces-de-hardware)
      - [3.1.3 Interfaces de software](#313-interfaces-de-software)
        - [ISW-PAY — Pasarela de pagos](#isw-pay--pasarela-de-pagos)
        - [ISW-PUSH — Servicio de notificaciones push](#isw-push--servicio-de-notificaciones-push)
        - [ISW-MAP — Servicio de mapas y geolocalización](#isw-map--servicio-de-mapas-y-geolocalización)
        - [ISW-ANALYTICS — Servicio de analytics y BI](#isw-analytics--servicio-de-analytics-y-bi)
        - [ISW-STORAGE — Almacenamiento de medios](#isw-storage--almacenamiento-de-medios)
        - [ISW-AUTH — Autenticación y autorización](#isw-auth--autenticación-y-autorización)
      - [3.1.4 Interfaces de comunicación](#314-interfaces-de-comunicación)
    - [3.2 Funciones](#32-funciones)
      - [US-INV-01 · Continuar como invitado desde el onboarding](#us-inv-01--continuar-como-invitado-desde-el-onboarding)
      - [US-INV-02 · Seleccionar mall manualmente](#us-inv-02--seleccionar-mall-manualmente)
      - [US-INV-03 · Detectar mall activo por geolocalización](#us-inv-03--detectar-mall-activo-por-geolocalización)
      - [US-INV-04 · Ver el Home Feed del mall activo](#us-inv-04--ver-el-home-feed-del-mall-activo)
      - [US-INV-05 · Explorar el directorio de tiendas](#us-inv-05--explorar-el-directorio-de-tiendas)
      - [US-INV-06 · Filtrar tiendas en el directorio](#us-inv-06--filtrar-tiendas-en-el-directorio)
      - [US-INV-07 · Ver el perfil de una tienda](#us-inv-07--ver-el-perfil-de-una-tienda)
      - [US-INV-08 · Ver el detalle de un producto](#us-inv-08--ver-el-detalle-de-un-producto)
      - [US-INV-09 · Buscar productos en el mall](#us-inv-09--buscar-productos-en-el-mall)
      - [US-INV-10 · Filtrar resultados de búsqueda](#us-inv-10--filtrar-resultados-de-búsqueda)
      - [US-INV-11 · Ver el listado de eventos del mall](#us-inv-11--ver-el-listado-de-eventos-del-mall)
      - [US-INV-12 · Ver el detalle de un evento](#us-inv-12--ver-el-detalle-de-un-evento)
      - [US-INV-13 · Ver ofertas y promociones del mall](#us-inv-13--ver-ofertas-y-promociones-del-mall)
      - [US-INV-14 · Ver el mapa del mall](#us-inv-14--ver-el-mapa-del-mall)
      - [US-INV-15 · Intentar reservar un producto sin cuenta](#us-inv-15--intentar-reservar-un-producto-sin-cuenta)
      - [US-INV-16 · Intentar agregar a favoritos sin cuenta](#us-inv-16--intentar-agregar-a-favoritos-sin-cuenta)
      - [US-INV-17 · Navegar con Bottom Tab Bar](#us-inv-17--navegar-con-bottom-tab-bar)
      - [US-INV-18 · Accesibilidad con lectores de pantalla](#us-inv-18--accesibilidad-con-lectores-de-pantalla)
      - [US-CR-01 · Registrarse con correo y contraseña](#us-cr-01--registrarse-con-correo-y-contraseña)
      - [US-CR-02 · Verificar correo electrónico](#us-cr-02--verificar-correo-electrónico)
      - [US-CR-03 · Iniciar sesión con correo y contraseña](#us-cr-03--iniciar-sesión-con-correo-y-contraseña)
      - [US-CR-04 · Recuperar contraseña olvidada](#us-cr-04--recuperar-contraseña-olvidada)
      - [US-CR-05 · Cerrar sesión](#us-cr-05--cerrar-sesión)
      - [US-CR-06 · Completar y editar el perfil personal](#us-cr-06--completar-y-editar-el-perfil-personal)
      - [US-CR-07 · Seleccionar y cambiar el mall preferido](#us-cr-07--seleccionar-y-cambiar-el-mall-preferido)
      - [US-CR-08 · Realizar una reserva Click \& Collect (Paso 1 — Confirmar producto)](#us-cr-08--realizar-una-reserva-click--collect-paso-1--confirmar-producto)
      - [US-CR-09 · Realizar una reserva Click \& Collect (Paso 2 — Datos de recogida)](#us-cr-09--realizar-una-reserva-click--collect-paso-2--datos-de-recogida)
      - [US-CR-10 · Realizar una reserva Click \& Collect (Paso 3 — Confirmación exitosa)](#us-cr-10--realizar-una-reserva-click--collect-paso-3--confirmación-exitosa)
      - [US-CR-11 · Ver el código QR de una reserva activa](#us-cr-11--ver-el-código-qr-de-una-reserva-activa)
      - [US-CR-12 · Ver y gestionar el historial de reservas](#us-cr-12--ver-y-gestionar-el-historial-de-reservas)
      - [US-CR-13 · Cancelar una reserva activa](#us-cr-13--cancelar-una-reserva-activa)
      - [US-CR-14 · Calificar una tienda después de recoger un pedido](#us-cr-14--calificar-una-tienda-después-de-recoger-un-pedido)
      - [US-CR-15 · Guardar una tienda en favoritos](#us-cr-15--guardar-una-tienda-en-favoritos)
      - [US-CR-16 · Guardar un producto en favoritos](#us-cr-16--guardar-un-producto-en-favoritos)
      - [US-CR-17 · Guardar una oferta en favoritos](#us-cr-17--guardar-una-oferta-en-favoritos)
      - [US-CR-18 · Activar recordatorio para un evento del mall](#us-cr-18--activar-recordatorio-para-un-evento-del-mall)
      - [US-CR-19 · Recibir notificaciones push contextuales](#us-cr-19--recibir-notificaciones-push-contextuales)
      - [US-CR-20 · Gestionar preferencias de notificaciones](#us-cr-20--gestionar-preferencias-de-notificaciones)
      - [US-CR-21 · Ver la sección de Favoritos completa](#us-cr-21--ver-la-sección-de-favoritos-completa)
      - [US-CR-22 · Accesibilidad — Alto contraste y tamaño de fuente](#us-cr-22--accesibilidad--alto-contraste-y-tamaño-de-fuente)
      - [US-AL-01 · Registrar la tienda en la plataforma](#us-al-01--registrar-la-tienda-en-la-plataforma)
      - [US-AL-02 · Completar el perfil de la tienda durante el onboarding](#us-al-02--completar-el-perfil-de-la-tienda-durante-el-onboarding)
      - [US-AL-03 · Iniciar sesión en MallHub Store](#us-al-03--iniciar-sesión-en-mallhub-store)
      - [US-AL-04 · Recuperar contraseña olvidada](#us-al-04--recuperar-contraseña-olvidada)
      - [US-AL-05 · Ver el dashboard de la tienda](#us-al-05--ver-el-dashboard-de-la-tienda)
      - [US-AL-06 · Ver y filtrar el catálogo de productos](#us-al-06--ver-y-filtrar-el-catálogo-de-productos)
      - [US-AL-07 · Agregar un nuevo producto al catálogo](#us-al-07--agregar-un-nuevo-producto-al-catálogo)
      - [US-AL-08 · Agregar variantes a un producto](#us-al-08--agregar-variantes-a-un-producto)
      - [US-AL-09 · Agregar precio con descuento a un producto](#us-al-09--agregar-precio-con-descuento-a-un-producto)
      - [US-AL-10 · Editar un producto existente del catálogo](#us-al-10--editar-un-producto-existente-del-catálogo)
      - [US-AL-11 · Activar o desactivar un producto del catálogo](#us-al-11--activar-o-desactivar-un-producto-del-catálogo)
      - [US-AL-12 · Actualizar la disponibilidad de stock de un producto](#us-al-12--actualizar-la-disponibilidad-de-stock-de-un-producto)
      - [US-AL-13 · Duplicar un producto del catálogo](#us-al-13--duplicar-un-producto-del-catálogo)
      - [US-AL-14 · Eliminar un producto del catálogo](#us-al-14--eliminar-un-producto-del-catálogo)
      - [US-AL-15 · Recibir notificación de nueva reserva](#us-al-15--recibir-notificación-de-nueva-reserva)
      - [US-AL-16 · Ver y filtrar las reservas recibidas](#us-al-16--ver-y-filtrar-las-reservas-recibidas)
      - [US-AL-17 · Confirmar una reserva pendiente](#us-al-17--confirmar-una-reserva-pendiente)
      - [US-AL-18 · Rechazar una reserva con motivo](#us-al-18--rechazar-una-reserva-con-motivo)
      - [US-AL-19 · Marcar una reserva como completada](#us-al-19--marcar-una-reserva-como-completada)
      - [US-AL-20 · Editar el perfil público de la tienda](#us-al-20--editar-el-perfil-público-de-la-tienda)
      - [US-AL-21 · Publicar una promoción u oferta flash](#us-al-21--publicar-una-promoción-u-oferta-flash)
      - [US-AL-22 · Ver el historial de promociones publicadas](#us-al-22--ver-el-historial-de-promociones-publicadas)
      - [US-AL-23 · Ver analytics básicos de la tienda (Plan Pro)](#us-al-23--ver-analytics-básicos-de-la-tienda-plan-pro)
      - [US-AL-24 · Cerrar sesión en MallHub Store](#us-al-24--cerrar-sesión-en-mallhub-store)
      - [US-AL-25 · Crear un producto asistido por IA a partir de imágenes](#us-al-25--crear-un-producto-asistido-por-ia-a-partir-de-imágenes)
      - [US-ACC-01 · Iniciar sesión en MallHub Insights](#us-acc-01--iniciar-sesión-en-mallhub-insights)
      - [US-ACC-02 · Recuperar contraseña olvidada](#us-acc-02--recuperar-contraseña-olvidada)
      - [US-ACC-03 · Cerrar sesión en MallHub Insights](#us-acc-03--cerrar-sesión-en-mallhub-insights)
      - [US-ACC-04 · Ver los KPIs ejecutivos del mall en el dashboard principal](#us-acc-04--ver-los-kpis-ejecutivos-del-mall-en-el-dashboard-principal)
      - [US-ACC-05 · Cambiar el período de análisis del dashboard](#us-acc-05--cambiar-el-período-de-análisis-del-dashboard)
      - [US-ACC-06 · Ver la gráfica de tendencia temporal del mall](#us-acc-06--ver-la-gráfica-de-tendencia-temporal-del-mall)
      - [US-ACC-07 · Exportar reporte del dashboard en PDF](#us-acc-07--exportar-reporte-del-dashboard-en-pdf)
      - [US-ACC-08 · Exportar reporte del dashboard en Excel](#us-acc-08--exportar-reporte-del-dashboard-en-excel)
      - [US-ACC-09 · Ver el análisis de rendimiento individual por tienda](#us-acc-09--ver-el-análisis-de-rendimiento-individual-por-tienda)
      - [US-ACC-10 · Ver el heatmap de actividad por piso del mall](#us-acc-10--ver-el-heatmap-de-actividad-por-piso-del-mall)
      - [US-ACC-11 · Enviar alerta a una tienda inactiva](#us-acc-11--enviar-alerta-a-una-tienda-inactiva)
      - [US-ACC-12 · Exportar datos de rendimiento de tiendas](#us-acc-12--exportar-datos-de-rendimiento-de-tiendas)
      - [US-ACC-13 · Crear un nuevo evento del mall](#us-acc-13--crear-un-nuevo-evento-del-mall)
      - [US-ACC-14 · Editar un evento existente](#us-acc-14--editar-un-evento-existente)
      - [US-ACC-15 · Cancelar un evento publicado](#us-acc-15--cancelar-un-evento-publicado)
      - [US-ACC-16 · Ver las métricas de alcance de un evento](#us-acc-16--ver-las-métricas-de-alcance-de-un-evento)
      - [US-ACC-17 · Programar el envío de push notification de un evento](#us-acc-17--programar-el-envío-de-push-notification-de-un-evento)
      - [US-ACC-18 · Ver las tiendas pendientes de aprobación](#us-acc-18--ver-las-tiendas-pendientes-de-aprobación)
      - [US-ACC-19 · Aprobar el registro de una tienda](#us-acc-19--aprobar-el-registro-de-una-tienda)
      - [US-ACC-20 · Rechazar el registro de una tienda](#us-acc-20--rechazar-el-registro-de-una-tienda)
      - [US-ACC-21 · Suspender una tienda activa](#us-acc-21--suspender-una-tienda-activa)
      - [US-ACC-22 · Reactivar una tienda suspendida](#us-acc-22--reactivar-una-tienda-suspendida)
      - [US-ACC-23 · Agregar una tienda manualmente al mall](#us-acc-23--agregar-una-tienda-manualmente-al-mall)
      - [US-ACC-24 · Ver el perfil público de una tienda del mall](#us-acc-24--ver-el-perfil-público-de-una-tienda-del-mall)
      - [US-ACC-25 · Editar la información pública del mall](#us-acc-25--editar-la-información-pública-del-mall)
      - [US-ACC-26 · Actualizar el logo e imágenes del mall](#us-acc-26--actualizar-el-logo-e-imágenes-del-mall)
      - [US-ACC-27 · Actualizar el mapa SVG del mall por piso](#us-acc-27--actualizar-el-mapa-svg-del-mall-por-piso)
      - [US-ACC-28 · Gestionar las categorías de tiendas del mall](#us-acc-28--gestionar-las-categorías-de-tiendas-del-mall)
      - [US-ACC-29 · Generar reportes ejecutivos y alertas inteligentes con IA](#us-acc-29--generar-reportes-ejecutivos-y-alertas-inteligentes-con-ia)
      - [US-AP-01 · Iniciar sesión con autenticación de doble factor (2FA)](#us-ap-01--iniciar-sesión-con-autenticación-de-doble-factor-2fa)
      - [US-AP-02 · Configurar el 2FA por primera vez](#us-ap-02--configurar-el-2fa-por-primera-vez)
      - [US-AP-03 · Recuperar contraseña olvidada](#us-ap-03--recuperar-contraseña-olvidada)
      - [US-AP-04 · Cerrar sesión del backoffice](#us-ap-04--cerrar-sesión-del-backoffice)
      - [US-AP-05 · Consultar el audit log de acciones del backoffice](#us-ap-05--consultar-el-audit-log-de-acciones-del-backoffice)
      - [US-AP-06 · Ver el dashboard global de métricas de la plataforma](#us-ap-06--ver-el-dashboard-global-de-métricas-de-la-plataforma)
      - [US-AP-07 · Monitorear la salud técnica de la plataforma](#us-ap-07--monitorear-la-salud-técnica-de-la-plataforma)
      - [US-AP-08 · Crear un nuevo mall en la plataforma](#us-ap-08--crear-un-nuevo-mall-en-la-plataforma)
      - [US-AP-09 · Editar la configuración de un mall existente](#us-ap-09--editar-la-configuración-de-un-mall-existente)
      - [US-AP-10 · Activar un mall para hacerlo visible en la app](#us-ap-10--activar-un-mall-para-hacerlo-visible-en-la-app)
      - [US-AP-11 · Desactivar o suspender un mall activo](#us-ap-11--desactivar-o-suspender-un-mall-activo)
      - [US-AP-12 · Ver el listado global de todos los malls](#us-ap-12--ver-el-listado-global-de-todos-los-malls)
      - [US-AP-13 · Aprobar el registro de una tienda a nivel global](#us-ap-13--aprobar-el-registro-de-una-tienda-a-nivel-global)
      - [US-AP-14 · Suspender una tienda a nivel global](#us-ap-14--suspender-una-tienda-a-nivel-global)
      - [US-AP-15 · Moderar contenido inapropiado en catálogos de tiendas](#us-ap-15--moderar-contenido-inapropiado-en-catálogos-de-tiendas)
      - [US-AP-16 · Moderar contenido de imágenes en tiendas y malls](#us-ap-16--moderar-contenido-de-imágenes-en-tiendas-y-malls)
      - [US-AP-17 · Asignar o cambiar el plan de suscripción de un mall](#us-ap-17--asignar-o-cambiar-el-plan-de-suscripción-de-un-mall)
      - [US-AP-18 · Asignar o cambiar el plan de suscripción de una tienda](#us-ap-18--asignar-o-cambiar-el-plan-de-suscripción-de-una-tienda)
      - [US-AP-19 · Ver y gestionar el estado de facturación de malls y tiendas](#us-ap-19--ver-y-gestionar-el-estado-de-facturación-de-malls-y-tiendas)
      - [US-AP-20 · Crear y gestionar campañas publicitarias nativas en la app](#us-ap-20--crear-y-gestionar-campañas-publicitarias-nativas-en-la-app)
      - [US-AP-21 · Consultar métricas de rendimiento de una campaña publicitaria](#us-ap-21--consultar-métricas-de-rendimiento-de-una-campaña-publicitaria)
      - [US-AP-22 · Ver el listado global de tiendas de toda la plataforma](#us-ap-22--ver-el-listado-global-de-tiendas-de-toda-la-plataforma)
    - [3.3 Calidad del servicio](#33-calidad-del-servicio)
      - [3.3.1 Rendimiento](#331-rendimiento)
      - [3.3.2 Seguridad](#332-seguridad)
      - [3.3.3 Confiabilidad](#333-confiabilidad)
      - [3.3.4 Disponibilidad](#334-disponibilidad)
      - [3.3.5 Observabilidad](#335-observabilidad)
      - [3.3.6 Escalabilidad](#336-escalabilidad)
      - [3.3.7 Accesibilidad](#337-accesibilidad)
      - [3.3.8 Internacionalización (i18n)](#338-internacionalización-i18n)
    - [3.4 Cumplimiento](#34-cumplimiento)
      - [3.4.1 Protección de datos personales — Ley 1581 de 2012 (Colombia)](#341-protección-de-datos-personales--ley-1581-de-2012-colombia)
      - [3.4.2 Facturación electrónica — DIAN (Colombia)](#342-facturación-electrónica--dian-colombia)
      - [3.4.3 Seguridad de pagos — PCI-DSS](#343-seguridad-de-pagos--pci-dss)
      - [3.4.4 Accesibilidad web — WCAG 2.1](#344-accesibilidad-web--wcag-21)
      - [3.4.5 Distribución de aplicaciones móviles](#345-distribución-de-aplicaciones-móviles)
      - [3.4.6 Política de IA responsable — Anthropic Usage Policy](#346-política-de-ia-responsable--anthropic-usage-policy)
    - [3.5 Diseño e implementación](#35-diseño-e-implementación)
      - [3.5.1 Instalación](#351-instalación)
      - [3.5.2 Construcción y entrega](#352-construcción-y-entrega)
      - [3.5.3 Distribución](#353-distribución)
      - [3.5.4 Mantenibilidad](#354-mantenibilidad)
      - [3.5.5 Reutilización](#355-reutilización)
      - [3.5.6 Portabilidad](#356-portabilidad)
      - [3.5.7 Costo](#357-costo)
      - [3.5.8 Fecha límite](#358-fecha-límite)
      - [3.5.9 Prueba de concepto](#359-prueba-de-concepto)
      - [3.5.10 Gestión de cambios](#3510-gestión-de-cambios)
    - [3.6 IA/ML](#36-iaml)
      - [3.6.1 Especificación del modelo](#361-especificación-del-modelo)
        - [AI-01 — Asistente de publicación de catálogo](#ai-01--asistente-de-publicación-de-catálogo)
        - [AI-02 — Generador de reportes de negocio](#ai-02--generador-de-reportes-de-negocio)
      - [3.6.2 Gestión de datos](#362-gestión-de-datos)
      - [3.6.3 Barreras de control](#363-barreras-de-control)
      - [3.6.4 Ética](#364-ética)
      - [3.6.5 Humano en el ciclo](#365-humano-en-el-ciclo)
      - [3.6.6 Ciclo de vida y operaciones del modelo](#366-ciclo-de-vida-y-operaciones-del-modelo)
  - [4. Verificación](#4-verificación)
    - [Convenciones](#convenciones)
    - [4.1 Requisitos funcionales (§2.6 · §3.2)](#41-requisitos-funcionales-26--32)
      - [MallHub App — Funcionalidades de Invitado y Cliente Registrado](#mallhub-app--funcionalidades-de-invitado-y-cliente-registrado)
      - [MallHub Store — Admin Local](#mallhub-store--admin-local)
      - [MallHub Insights — Admin CC](#mallhub-insights--admin-cc)
      - [MallHub Insights — Admin Plataforma (Backoffice)](#mallhub-insights--admin-plataforma-backoffice)
      - [Infraestructura transversal](#infraestructura-transversal)
    - [4.2 Interfaces externas (§3.1)](#42-interfaces-externas-31)
    - [4.3 Calidad del servicio (§3.3)](#43-calidad-del-servicio-33)
      - [Rendimiento](#rendimiento)
      - [Seguridad](#seguridad)
      - [Confiabilidad](#confiabilidad)
      - [Disponibilidad](#disponibilidad)
      - [Observabilidad](#observabilidad)
      - [Escalabilidad](#escalabilidad)
      - [Accesibilidad](#accesibilidad)
    - [4.4 Cumplimiento (§3.4)](#44-cumplimiento-34)
    - [4.5 Requisitos de IA/ML (§3.6)](#45-requisitos-de-iaml-36)
  - [5. Apéndices](#5-apéndices)
    - [Apéndice A — Historial de revisiones del documento](#apéndice-a--historial-de-revisiones-del-documento)
    - [Apéndice B — Matriz de trazabilidad de requisitos](#apéndice-b--matriz-de-trazabilidad-de-requisitos)
    - [Apéndice C — Elementos abiertos y decisiones pendientes](#apéndice-c--elementos-abiertos-y-decisiones-pendientes)
    - [Apéndice D — Diagrama de contexto del sistema](#apéndice-d--diagrama-de-contexto-del-sistema)
    - [Apéndice E — Convenciones de nomenclatura del SRS](#apéndice-e--convenciones-de-nomenclatura-del-srs)
      - [Identificadores de requisitos](#identificadores-de-requisitos)
      - [Marcadores de prioridad y fase](#marcadores-de-prioridad-y-fase)
    - [Apéndice F — Referencias normativas y bibliografía](#apéndice-f--referencias-normativas-y-bibliografía)
<!-- TOC -->

## Historial de revisiones

| Nombre | Fecha | Motivo de los cambios | Versión |
|--------|-------|-----------------------|---------|
|        |       |                       |         |
|        |       |                       |         |

## 1. Introducción
<!-- descripción general del SRS: propósito, alcance, audiencia y organización del documento; evitar requisitos detallados -->

Este SRS define de forma completa y verificable los requisitos funcionales y no funcionales de MallHub v1.0, sirviendo como contrato técnico entre el equipo de producto, los ingenieros de desarrollo y los stakeholders del negocio. Los product managers lo usarán para priorizar el backlog; los desarrolladores, para delimitar el alcance de implementación; y los QA engineers, como base para los planes de prueba. El documento no describe decisiones de arquitectura ni de implementación.

### 1.1 Propósito del documento
<!-- por qué existe este SRS, sus audiencias objetivo y cómo lo usarán; mantener entre 2 y 4 oraciones y evitar detalles de implementación -->

Este documento especifica los requisitos de software de MallHub v1.0, la plataforma SaaS + marketplace vertical que digitaliza el ecosistema de los centros comerciales. Está organizado siguiendo la estructura IEEE 830 / ISO/IEC 29148: introducción, descripción general del producto, requisitos funcionales, requisitos no funcionales y restricciones del sistema.

### 1.2 Alcance del producto
<!-- el producto (nombre/versión), su propósito principal, capacidades clave y límites. mantener breve y enfocado en el "qué" y el "por qué", no en el "cómo" -->

**MallHub v1.0** es una plataforma SaaS + marketplace vertical que convierte centros comerciales físicos en ecosistemas digitales completos. Su propósito es eliminar la brecha entre la experiencia de compra física y digital: los compradores descubren tiendas y productos antes de visitar el mall; los locales obtienen presencia digital y canal de ventas sin inversión tecnológica propia; y los administradores acceden a inteligencia de negocio basada en comportamiento real de compra.
 
La plataforma opera en tres módulos complementarios:
 
- **MallHub App** — Aplicación móvil (iOS + Android) para compradores: directorio de tiendas, catálogos, ofertas, mapa interactivo y compra con recogida en tienda (click & collect).
- **MallHub Store** — Panel web para locales comerciales: gestión de catálogo, pedidos entrantes, analítica básica/avanzada y herramientas de marketing en-mall.
- **MallHub Insights** — Dashboard de inteligencia de negocio para administradores del mall: tráfico digital, conversión por zona, productos tendencia y ROI de eventos.
 
El mercado inicial es Colombia (Bogotá, Medellín, Cali), con expansión regional a LATAM en fases posteriores. Quedan **fuera del alcance de v1.0**: entrega a domicilio, pagos diferidos/crédito, integración con ERPs de tiendas y white-label para operadores externos.
 

### 1.3 Definiciones, acrónimos y abreviaturas
<!-- glosario de términos del dominio, acrónimos y abreviaturas; mantener las entradas en orden alfabético -->

| Término | Definición |
|---|---|
| **Admin del Mall** | Gerente o equipo de marketing del centro comercial con acceso al módulo MallHub Insights. |
| **B2B** | Business-to-Business. Relación comercial entre MallHub y las tiendas o administradores de mall. |
| **B2C** | Business-to-Consumer. Relación comercial entre MallHub y los compradores finales. |
| **BI** | Business Intelligence. Análisis de datos para soporte a la toma de decisiones. |
| **Click & Collect** | Modalidad de compra en la que el usuario reserva o paga un producto en la app y lo recoge físicamente en la tienda. Funcionalidad central de MallHub. |
| **CPC** | Cost Per Click. Modelo de cobro publicitario por clic en un anuncio. |
| **CPM** | Cost Per Mille. Modelo de cobro publicitario por cada mil impresiones. |
| **Comprador / Visitante** | Usuario B2C de la app móvil; perfil principal de consumo. |
| **Directorio de Tiendas** | Listado navegable de todos los locales activos en un mall, filtrable por categoría, piso y horario. |
| **Freemium** | Modelo de negocio en el que el servicio básico es gratuito y las funcionalidades avanzadas son de pago. |
| **KPI** | Key Performance Indicator. Métrica clave para medir el rendimiento de un proceso o producto. |
| **LATAM** | América Latina. Región geográfica objetivo de expansión de MallHub. |
| **Local / Tienda** | Establecimiento comercial físico ubicado dentro de un centro comercial, usuario del panel MallHub Store. |
| **Mall** | Centro comercial físico donde operan múltiples tiendas bajo una administración común. |
| **Mall Plan** | Suscripción mensual para administradores de mall (USD 300–800/mes) que incluye el dashboard de BI, gestión de eventos y opción white-label. |
| **Marketplace** | Plataforma digital que conecta múltiples vendedores con compradores dentro de un mismo entorno. |
| **MallHub App** | Módulo de app móvil para compradores (iOS + Android). |
| **MallHub Insights** | Módulo de dashboard de inteligencia de negocio para administradores del mall. |
| **MallHub Store** | Módulo de panel web de e-commerce para locales comerciales. |
| **MVP** | Minimum Viable Product. Versión del producto con las funcionalidades mínimas necesarias para validar hipótesis de negocio. |
| **Oferta Flash** | Promoción de tiempo limitado y/o stock reducido, señalizada con el color acento Tangerine en la interfaz. |
| **Plan Free** | Nivel de suscripción gratuito para tiendas; incluye perfil, catálogo y pedidos con comisión del 5% sobre ventas. |
| **Plan Pro** | Nivel de suscripción de pago para tiendas (USD 30/mes + 3% sobre ventas); incluye analytics, publicidad y destacados. |
| **Push Notification** | Notificación enviada al dispositivo móvil del usuario sin necesidad de tener la app abierta. |
| **ROI** | Return on Investment. Retorno sobre la inversión, usado para medir el impacto económico de eventos del mall. |
| **SaaS** | Software as a Service. Modelo de distribución de software alojado en la nube y accedido por suscripción. |
| **SKU** | Stock Keeping Unit. Identificador único de un producto o variante dentro del catálogo. |
| **SRS** | Software Requirements Specification. Documento que describe los requisitos de un sistema de software. |
| **UX/UI** | User Experience / User Interface. Disciplinas de diseño centradas en la experiencia e interfaz del usuario. |
| **WCAG** | Web Content Accessibility Guidelines. Estándar internacional de accesibilidad para contenido web (versión aplicada: 2.1). |

### 1.4 Referencias
<!-- fuentes externas normativas e informativas; incluir título, responsable, versión, fecha, ubicación/URL y si es normativa o informativa -->

| # | Título | Propietario | Versión | Fecha | Ubicación | Tipo |
|---|--------|-------------|---------|-------|-----------|------|
| R1 | *MallHub — Análisis de Startup y Resumen Ejecutivo* | Equipo MallHub | 1.0 | 2026 | `mallhub_startup_analysis.docx` | Normativo |
| R2 | *MallHub — Business Model Canvas* | Equipo MallHub | 1.0 | 2026 | `mallhub_bmc.docx` | Normativo |
| R3 | *MallHub UX/UI — Documento Técnico: Arquitectura completa de producto* | Senior Product Designer | 1.0 | 2026 | `MallHub_UX_UI_Documento_Tecnico.docx` | Normativo |
| R4 | *MallHub — Sistema de Color: Paleta Emerald Market* | Senior Product Designer | 1.0 | 2026-03 | `MallHub_Colorimetria_v1_0.docx` | Informativo |
| R5 | *IEEE Std 830-1998 — Recommended Practice for Software Requirements Specifications* | IEEE | 1998 | 1998 | https://standards.ieee.org | Normativo |
| R6 | *ISO/IEC/IEEE 29148:2018 — Systems and Software Engineering: Requirements Engineering* | ISO / IEC / IEEE | 2018 | 2018 | https://www.iso.org/standard/72089.html | Normativo |
| R7 | *Web Content Accessibility Guidelines (WCAG) 2.1* | W3C | 2.1 | 2018-06-05 | https://www.w3.org/TR/WCAG21/ | Normativo |
 
---

### 1.5 Descripción general del documento
<!-- estructura y convenciones del documento -->

El presente SRS se organiza en cinco secciones principales:
 
- **Sección 1 — Introuccion** *(este capítulo)*: propósito, alcance del producto, glosario, referencias y estructura del documento.
- **Sección 2 — Descripción general del producto**: contexto del producto, supuestos, dependencias, perfiles de usuario y restricciones generales.
- **Sección 3 — Caracteristicas del sistema**: requisitos funcionales organizados por módulo (MallHub App, MallHub Store, MallHub Insights) y por actor.

 
A lo largo del documento, los requisitos individuales se identifican con el formato `[MÓDULO-TIPO-NNN]` (ej. `APP-FUN-001`). Los requisitos marcados con **[M]** son obligatorios para el MVP; los marcados con **[F]** son diferidos a fases posteriores.

## 2. Descripción general del producto
<!-- antecedentes y contexto que definen los requisitos del producto -->

Esta sección contextualiza MallHub dentro de su entorno operativo, describe sus funciones principales, identifica a sus usuarios y documenta las restricciones, supuestos y dependencias que enmarcan el desarrollo del sistema. No contiene requisitos detallados; esos se encuentran en las Secciones 3, 4 y 5.

### 2.1 Perspectiva del producto
<!-- contexto del sistema: un producto nuevo, un reemplazo o parte de una familia; anotar relaciones con otros sistemas -->

MallHub es un producto nuevo, sin versión predecesora ni reemplazo de un sistema existente. Opera como una **capa digital superpuesta a la infraestructura física de los centros comerciales**, sin requerir modificaciones en los sistemas internos de las tiendas o del mall. No forma parte de una suite de productos más amplia, aunque su arquitectura modular contempla integración futura con ERPs, sistemas de control de acceso y plataformas de fidelización de malls.
 
El sistema se compone de tres superficies de interacción independientes que comparten una base de datos y servicios comunes. Todas las superficies cliente se construyen sobre **Tauri 2.0**, unificando el stack bajo React + TypeScript como frontend y **Rust** como core nativo, pero con targets de distribución diferenciados por audiencia:
 
```
┌─────────────────────────────────────────────────────────────────────────┐
│                            MallHub Platform                             │
│                                                                         │
│  TARGET MÓVIL                   TARGET ESCRITORIO                       │
│  ┌──────────────────────┐   ┌──────────────────┐  ┌──────────────────┐  │
│  │   MallHub App        │   │  MallHub Store   │  │  MallHub         │  │
│  │   Tauri 2.0 Mobile   │   │  Tauri 2.0       │  │  Insights        │  │
│  │   iOS + Android      │   │  Desktop         │  │  Tauri 2.0       │  │
│  │                      │   │  macOS/Win/Linux  │  │  Desktop         │  │
│  │   Roles:             │   │                  │  │  macOS/Win/Linux  │  │
│  │   · Invitado         │   │  Roles:          │  │                  │  │
│  │   · Cliente          │   │  · Admin Local   │  │  Roles:          │  │
│  │     Registrado       │   │                  │  │  · Admin CC      │  │
│  │                      │   │                  │  │  · Admin         │  │
│  │                      │   │                  │  │    Plataforma    │  │
│  └──────────┬───────────┘   └────────┬─────────┘  └───────┬──────────┘  │
│             │          React + TypeScript (frontend compartido)  │       │
│  ┌──────────┴──────────────────────────────────────────────┴──────────┐  │
│  │                    API / Backend (REST + WebSocket)                │  │
│  └─────────────────────────────┬──────────────────────────────────────┘  │
│                                │                                         │
│  ┌─────────────────────────────┴──────────────────────────────────────┐  │
│  │   Base de datos · Motor de analytics · Notificaciones push         │  │
│  │   Pasarela de pagos · Almacenamiento de medios (CDN)               │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
 
  MallHub App (Tauri Mobile)        MallHub Store / Insights (Tauri Desktop)
  ├── Frontend: React + TS           ├── Frontend: React + TS
  │   CSS custom properties          │   CSS custom properties
  │   WKWebView (iOS)                │   WebKit (macOS)
  │   Android System WebView         │   WebView2 (Windows)
  └── Core Rust:                     │   WebKitGTK (Linux)
      push, camera, barcode-scanner, └── Core Rust:
      geolocation, http                  http, filesystem, shell, updater
```
 
La plataforma se relaciona con los siguientes sistemas externos:
 
| Sistema externo | Relación |
|---|---|
| Pasarelas de pago (Wompi, MercadoPago, Stripe) | Procesamiento de transacciones en MallHub App y Store |
| Proveedores de cloud (AWS / GCP) | Infraestructura de cómputo, almacenamiento y red |
| Servicios de analytics (BigQuery, Looker Studio) | Procesamiento y visualización de datos para MallHub Insights |
| APNs (Apple) / FCM (Google Firebase) | Entrega de push notifications vía `tauri-plugin-push-notifications` |
| Servicios de geolocalización (Google Maps / Mapbox) | Mapa interactivo del mall y detección de mall cercano |
| Apple App Store / Google Play Store | Distribución de MallHub App (Tauri genera binarios .ipa / .apk / .aab nativos) |
| Rust toolchain (rustup · cargo) | Compilación del core nativo de todas las apps Tauri |
 
---

### 2.2 Funciones del producto
<!-- principales áreas funcionales o características que ofrece el producto en 5 a 10 viñetas concisas -->

MallHub ofrece las siguientes áreas funcionales principales:
 
- **Directorio digital de mall:** listado de tiendas filtrable por categoría, piso y horario; incluye perfil de tienda con logo, descripción, ubicación y catálogo de productos.
- **Búsqueda de productos cross-tienda:** motor de búsqueda que permite a los compradores encontrar un producto específico entre todos los locales activos de un mall, con filtros de precio, categoría, piso y disponibilidad.
- **Click & Collect nativo:** flujo completo de reserva de producto en la app, confirmación por la tienda, generación de código QR y recogida física en el local.
- **Gestión de catálogo para tiendas:** panel web para que los locales publiquen, editen y retiren productos; incluye soporte para variantes (talla, color), imágenes múltiples y control básico de stock.
- **Gestión de pedidos y reservas:** bandeja de pedidos entrantes para la tienda con notificaciones en tiempo real, confirmación de disponibilidad y seguimiento del estado hasta la recogida.
- **Promociones y ofertas flash:** herramienta para que las tiendas creen y programen promociones con fecha de vigencia; soporte para ofertas flash con contador de tiempo visible en la app del comprador.
- **Eventos del mall:** calendario de eventos del centro comercial gestionado por el administrador, visible para compradores con opción de activar recordatorio vía push notification.
- **Dashboard de inteligencia de negocio:** métricas en tiempo real para administradores del mall: tráfico digital, búsquedas frecuentes, productos más vistos, tiendas con mayor conversión, heatmap de zonas y ROI de eventos.
- **Gestión de suscripciones y planes:** administración de los niveles de servicio Free y Pro para tiendas, y del Mall Plan para administradores; incluye control de funcionalidades por tier.
- **Panel de administración de plataforma (Backoffice):** herramientas internas del equipo MallHub para activar malls, aprobar tiendas, moderar contenido y gestionar facturación.
 
---

### 2.3 Restricciones del producto
<!-- restricciones de diseño e implementación que afectan la solución -->

Las siguientes restricciones limitan el espacio de solución técnica y de negocio:
 
**Regulatorias y legales**
- El tratamiento de datos personales de usuarios colombianos debe cumplir con la **Ley 1581 de 2012** (Habeas Data) y el Decreto 1377 de 2013. Para expansión a otros países de LATAM se aplicarán las normativas locales equivalentes.
- Las transacciones de pago deben procesarse exclusivamente a través de pasarelas certificadas y no se podrán almacenar datos de tarjeta en los sistemas propios de MallHub (cumplimiento PCI-DSS delegado a la pasarela).
- El sistema de facturación a tiendas y malls debe generar documentos compatibles con los requisitos de la DIAN para la facturación electrónica en Colombia.
 
**Técnicas — Stack Tauri 2.0**
- Todas las superficies cliente se construirán con **Tauri 2.0** (estable desde octubre 2024). El frontend compartido se implementará en **React + TypeScript**; el core nativo en **Rust** (edición 2021, MSRV según `tauri-cli` 2.x).
- **MallHub App (target móvil — Invitado y Cliente Registrado):** distribuida como binario nativo para **iOS 16+** (WKWebView) y **Android 7.0+ API 24+** (Android System WebView, Chromium). No se utilizará React Native ni Flutter.
- **MallHub Store (target escritorio — Admin Local):** distribuida exclusivamente como aplicación Tauri de escritorio para **macOS 11+** (WebKit), **Windows 10+** (WebView2 / Edge Chromium) y **Linux con WebKitGTK 2.36+**. No se distribuirá como PWA ni app web.
- **MallHub Insights (target escritorio — Admin CC y Admin Plataforma):** mismos targets de escritorio que MallHub Store. No se distribuirá como PWA ni app web.
- La interfaz de usuario **no debe depender de APIs web no soportadas** por el WebView nativo de cada target; cualquier feature experimental debe verificarse contra la matriz de compatibilidad de Tauri 2.0 antes de su uso.
- La comunicación entre el frontend (JS/TS) y el core Rust se realizará exclusivamente mediante el **sistema de comandos e IPC de Tauri** (`invoke`, eventos). No se expondrán endpoints HTTP internos entre capas.
- **Plugins Tauri requeridos — MallHub App (móvil):** `tauri-plugin-push-notifications`, `tauri-plugin-camera`, `tauri-plugin-barcode-scanner` (QR de recogida), `tauri-plugin-geolocation`, `tauri-plugin-http`.
- **Plugins Tauri requeridos — MallHub Store e Insights (escritorio):** `tauri-plugin-http`, `tauri-plugin-fs` (exportación de reportes), `tauri-plugin-shell` (apertura de archivos exportados), `tauri-plugin-updater` (actualizaciones automáticas de la app de escritorio).
- El sistema de color se implementa únicamente mediante **CSS custom properties** (Paleta Emerald Market, R4). Los tokens React Native de la sección 9.2 del documento de colorimetría quedan **obsoletos**; aplica únicamente la sección 9.1 (variables CSS) para todas las superficies Tauri.
- El sistema debe ser **multi-tenant** desde la arquitectura base: cada mall opera como un tenant aislado con sus propias tiendas, productos y datos analíticos.
- Las imágenes de productos y del mall deben procesarse y almacenarse en la nube (CDN); no se permite almacenamiento permanente en el dispositivo del usuario salvo caché gestionado por Tauri.
- La plataforma debe soportar **español** como idioma principal en v1.0; la internacionalización (i18n) debe estar contemplada en la arquitectura para incorporar otros idiomas en fases posteriores.
 
**De negocio**
- MallHub no gestiona logística de entrega a domicilio; el único modelo de fulfillment soportado en v1.0 es **click & collect** (recogida en tienda).
- Las tiendas ancla con sistemas de e-commerce propios (Falabella, Éxito, etc.) no están en el scope de integración para v1.0; sus catálogos no se sincronizarán automáticamente.
- El módulo de **regateo / negociación de precios** queda fuera del alcance de v1.0 para reducir complejidad; podrá incorporarse en v2.0 previo análisis de impacto en política de precios de las tiendas.
- La funcionalidad de **publicidad / banners** (módulo A-06) es una mejora futura; en v1.0 la gestión de anunciantes se realizará de forma manual por el equipo MallHub.
 
**De accesibilidad**
- La interfaz de usuario debe cumplir con los criterios de conformidad **WCAG 2.1 nivel AA** en todas las superficies de la plataforma.
- El sistema de color debe mantener ratios de contraste mínimos de 4.5:1 para texto normal y 3:1 para texto grande, según los tokens definidos en la Paleta Emerald Market (R4).
 
---

### 2.4 Características de los usuarios
<!-- tipos de usuario, roles, nivel de experiencia, niveles de acceso, frecuencia de uso y necesidades de accesibilidad o localización -->

MallHub opera con **cinco roles de usuario**, todos contemplados en el alcance de v1.0 (MVP). Los roles se agrupan en dos audiencias: consumidores finales (acceden desde MallHub App móvil) y administradores (acceden desde MallHub Store o Insights en escritorio).
 
---
 
#### Rol 1 — Invitado
| Atributo | Descripción |
|---|---|
| **Tipo** | B2C · Sesión anónima |
| **Superficie** | MallHub App — Tauri Mobile (iOS + Android) |
| **Perfil** | Cualquier persona que descarga o abre la app sin crear cuenta; primer contacto con la plataforma |
| **Nivel técnico** | Básico; familiarizado con apps de consumo cotidiano |
| **Frecuencia de uso** | Puntual o exploratoria; se convierte en Cliente Registrado al completar el onboarding |
| **Objetivos clave** | Explorar el directorio de tiendas, consultar catálogos y ver ofertas y eventos sin fricción de registro |
| **Nivel de acceso** | Solo lectura: directorio de malls, perfiles de tienda, catálogos públicos, ofertas activas y eventos. **No puede** realizar reservas, guardar favoritos ni recibir notificaciones personalizadas |
| **Conversión esperada** | El sistema debe invitar al registro en el momento de la primera acción restringida (reserva, favorito) sin bloquear la navegación previa |
| **Necesidades especiales** | Flujo de onboarding opcional y sin fricción; soporte de lectores de pantalla (VoiceOver / TalkBack) |
 
---
 
#### Rol 2 — Cliente Registrado
| Atributo | Descripción |
|---|---|
| **Tipo** | B2C · Sesión autenticada |
| **Superficie** | MallHub App — Tauri Mobile (iOS + Android) |
| **Perfil demográfico** | 18–45 años, smartphone user, visitante frecuente de centros comerciales en Colombia |
| **Nivel técnico** | Básico a medio; familiarizado con apps de e-commerce (Rappi, MercadoLibre) |
| **Frecuencia de uso** | Esporádica a semanal, con picos en fines de semana y durante eventos del mall |
| **Objetivos clave** | Descubrir tiendas y productos, reservar para recoger (click & collect), guardar favoritos, recibir notificaciones de ofertas y confirmación de reservas |
| **Nivel de acceso** | Acceso completo a funcionalidades de consumidor: reservas, favoritos, historial de pedidos, push notifications personalizadas y calificaciones |
| **Necesidades especiales** | Soporte para modo de alto contraste; tamaños de fuente ajustables; compatible con VoiceOver (iOS) y TalkBack (Android) |
 
---
 
#### Rol 3 — Admin Local
| Atributo | Descripción |
|---|---|
| **Tipo** | B2B · Comerciante |
| **Superficie** | MallHub Store — Tauri Desktop (macOS / Windows / Linux) |
| **Perfil** | Dueño o encargado operativo de un local comercial dentro del mall; puede tener baja experiencia con herramientas digitales |
| **Nivel técnico** | Bajo a medio; puede requerir asistencia durante el onboarding inicial (agente de campo) |
| **Frecuencia de uso** | Diaria: gestión de pedidos entrantes, actualización de stock y confirmación de reservas |
| **Objetivos clave** | Publicar y gestionar catálogo, confirmar y gestionar reservas de compradores, publicar promociones y ofertas flash |
| **Nivel de acceso** | Scope limitado a su propio local: CRUD de productos, bandeja de pedidos, perfil de tienda y (Plan Pro) analytics básicos. No accede a datos de otros locales ni del mall |
| **Necesidades especiales** | Interfaz simplificada para gestión rápida de pedidos; onboarding asistido presencialmente por agente de campo para locales con baja alfabetización digital |
 
---
 
#### Rol 4 — Admin CC (Administrador del Centro Comercial)
| Atributo | Descripción |
|---|---|
| **Tipo** | B2B Institucional |
| **Superficie** | MallHub Insights — Tauri Desktop (macOS / Windows / Linux) |
| **Perfil** | Gerente de marketing, operaciones o dirección del centro comercial; perfil ejecutivo orientado a datos |
| **Nivel técnico** | Medio a avanzado; familiarizado con dashboards de BI y reportes ejecutivos |
| **Frecuencia de uso** | Diaria (monitoreo de KPIs en tiempo real) y semanal (generación de reportes para presentaciones) |
| **Objetivos clave** | Consultar KPIs del mall, gestionar el calendario de eventos, supervisar y aprobar tiendas activas, exportar reportes ejecutivos |
| **Nivel de acceso** | Scope limitado a su propio mall: dashboard de analytics, gestión de eventos, configuración del perfil del mall, aprobación de tiendas y exportación de reportes. No accede a datos de otros malls |
| **Necesidades especiales** | Exportación de reportes en PDF y Excel; compatibilidad con pantallas de alta resolución y monitores externos habituales en entornos de oficina ejecutiva |
 
---
 
#### Rol 5 — Admin Plataforma
| Atributo | Descripción |
|---|---|
| **Tipo** | Interno MallHub |
| **Superficie** | MallHub Insights (panel de backoffice) — Tauri Desktop (macOS / Windows / Linux) |
| **Perfil** | Miembro del equipo de operaciones, customer success o ingeniería de MallHub |
| **Nivel técnico** | Alto; dominio completo de la plataforma |
| **Frecuencia de uso** | Diaria |
| **Objetivos clave** | Activar y configurar nuevos malls, aprobar o rechazar registros de tiendas, moderar contenido, gestionar suscripciones y facturación, monitorear la salud técnica de la plataforma |
| **Nivel de acceso** | Superadmin: acceso transversal a todos los malls, tiendas y datos de la plataforma sin restricción de tenant |
| **Necesidades especiales** | Trazabilidad de acciones (audit log); autenticación de doble factor (2FA) obligatoria |
 
---
 
**Resumen de roles — MVP v1.0**
 
| Rol | Tipo | Superficie (Tauri target) | Fase |
|---|---|---|---|
| Invitado | B2C anónimo | App Mobile (iOS + Android) | **MVP v1.0** |
| Cliente Registrado | B2C autenticado | App Mobile (iOS + Android) | **MVP v1.0** |
| Admin Local | B2B comerciante | Store Desktop (macOS/Win/Linux) | **MVP v1.0** |
| Admin CC | B2B institucional | Insights Desktop (macOS/Win/Linux) | **MVP v1.0** |
| Admin Plataforma | Interno MallHub | Insights Desktop — backoffice (macOS/Win/Linux) | **MVP v1.0** |
 
---

### 2.5 Supuestos y dependencias
<!-- supuestos sobre el entorno, servicios de terceros, patrones de uso y otros factores externos; anotar impacto/riesgo potencial. -->

#### Supuestos
 
| ID | Supuesto | Impacto si es falso |
|---|---|---|
| A-01 | Los compradores objetivo (18–45 años en Colombia) disponen de smartphone con acceso a internet móvil y están familiarizados con la instalación de apps. | Reducción de la base de usuarios efectiva; necesidad de canal alternativo. |
| A-02 | Los Admin Locales y Admin CC tienen acceso a un computador de escritorio o portátil (macOS, Windows o Linux) para instalar y operar MallHub Store e Insights como aplicaciones Tauri Desktop. | Si solo disponen de tablet o smartphone, las apps de escritorio no son accesibles; requeriría desarrollar una variante móvil adicional para estos roles, ampliando significativamente el alcance. |
| A-03 | El administrador del mall tiene autoridad para aprobar la incorporación de MallHub como plataforma oficial del centro comercial y habilitar el acceso a sus tiendas. | El modelo de entrada bottom-up (tiendas primero) puede no ser suficiente para activar el mall completo. |
| A-04 | Las pasarelas de pago seleccionadas (Wompi, MercadoPago) están disponibles y operativas en Colombia durante el periodo de lanzamiento. | Necesidad de integrar una pasarela alternativa, aumentando el esfuerzo de desarrollo. |
| A-05 | Los locales que se incorporan en el piloto tienen productos fotografiados o con posibilidad de fotografiarlos durante el onboarding asistido. | El catálogo inicial será escaso, afectando la propuesta de valor para los compradores. |
| A-06 | El tiempo de confirmación de reserva por parte de la tienda será inferior a 2 horas en horario comercial. | Degradación de la experiencia del comprador; necesidad de lógica de caducidad de reservas. |
| A-07 | El volumen de transacciones en los 6 primeros meses no superará los 10,000 pedidos mensuales por mall piloto. | Riesgo de sobrecarga de infraestructura si el crecimiento es exponencial; requiere plan de escalado reactivo. |
 
#### Dependencias
 
| ID | Dependencia | Tipo | Riesgo |
|---|---|---|---|
| D-01 | **Wompi / MercadoPago / Stripe** — procesamiento de pagos online | Externo crítico | Cambios en tarifas (1.5–3%) o indisponibilidad afectan directamente la conversión y los márgenes. |
| D-02 | **AWS / GCP** — infraestructura cloud (cómputo, almacenamiento, CDN) | Externo crítico | Una interrupción de disponibilidad impacta la totalidad de la plataforma. |
| D-03 | **APNs (Apple) / FCM (Google)** — entrega de push notifications vía `tauri-plugin-push-notifications` | Externo importante | Fallos en el servicio impiden la confirmación de reservas y alertas de ofertas flash. |
| D-04 | **Google Maps / Mapbox** — mapas interactivos del mall | Externo importante | Cambios en política de precios o deprecación de API requieren migración; afecta la pantalla de mapa (S-10). |
| D-05 | **BigQuery / Looker Studio** — motor de analytics para MallHub Insights | Externo importante | Latencia elevada o costos inesperados pueden afectar la frescura y viabilidad económica del dashboard. |
| D-06 | **Apple App Store / Google Play Store** — distribución de MallHub App | Externo crítico | Cambios en políticas de revisión de apps generadas con Tauri (WebView-based) podrían requerir justificación adicional o retrasar el lanzamiento. |
| D-07 | **Tauri 2.0 + Rust toolchain** — framework cliente y compilación nativa | Interno crítico | Versión con soporte móvil estable desde oct. 2024; breaking changes en minor releases de Tauri o en el MSRV de Rust pueden requerir actualizaciones del core. El equipo debe mantener `rustup` y `tauri-cli` actualizados. |
| D-08 | **WebView nativo por plataforma** — motor de renderizado del frontend Tauri | Externo importante | **Móvil (App):** WKWebView (iOS) y Android System WebView determinan el soporte de APIs web; dispositivos con WebView desactualizado pueden presentar regresiones (en Android se actualiza automáticamente vía Play Store). **Escritorio (Store/Insights):** WebView2 en Windows (requiere instalación o bundling del runtime Edge Chromium), WebKit en macOS (actualizado vía SO) y WebKitGTK en Linux (versión mínima 2.36; puede requerir instrucciones de instalación en distribuciones antiguas). |
| D-09 | **Administradores de mall (piloto)** — validación y onboarding en malls piloto de Bogotá/Medellín | Negocio crítico | Sin al menos un mall piloto confirmado no es posible validar el flujo completo de la plataforma. |
| D-10 | **Agentes de campo** — onboarding presencial de tiendas | Operativo importante | Sin agentes disponibles, la tasa de activación de tiendas con baja alfabetización digital se reduce significativamente. |
 
---

### 2.6 Asignación de requisitos
<!-- mapear los requisitos principales a subsistemas, servicios o entregas/iteraciones -->

Los requisitos del sistema se distribuyen entre los tres módulos principales de MallHub y el componente transversal de infraestructura. La siguiente tabla mapea las áreas funcionales a subsistemas, el rol que las consume, su prioridad MVP y la fase de entrega proyectada.
 
| ID | Área funcional | Subsistema | Rol principal | Prioridad MVP | Fase |
|---|---|---|---|---|---|
| REQ-APP-00 | Navegación pública sin registro (directorio, catálogos, ofertas) | MallHub App · Mobile | Invitado | **[M] Core** | v1.0 |
| REQ-APP-01 | Onboarding y autenticación | MallHub App · Mobile | Invitado → Cliente Registrado | **[M] Core** | v1.0 |
| REQ-APP-02 | Home feed y directorio de tiendas | MallHub App · Mobile | Invitado / Cliente Registrado | **[M] Core** | v1.0 |
| REQ-APP-03 | Búsqueda y filtros de productos | MallHub App · Mobile | Invitado / Cliente Registrado | **[M] Core** | v1.0 |
| REQ-APP-04 | Perfil de tienda y catálogo de productos | MallHub App · Mobile | Invitado / Cliente Registrado | **[M] Core** | v1.0 |
| REQ-APP-05 | Flujo de Click & Collect (reserva + QR) | MallHub App · Mobile | Cliente Registrado | **[M] Core** | v1.0 |
| REQ-APP-06 | Mis reservas y seguimiento de pedidos | MallHub App · Mobile | Cliente Registrado | **[M] Core** | v1.0 |
| REQ-APP-07 | Ofertas y promociones activas | MallHub App · Mobile | Invitado / Cliente Registrado | **[M] Importante** | v1.0 |
| REQ-APP-08 | Calendario de eventos del mall | MallHub App · Mobile | Invitado / Cliente Registrado | **[M] Importante** | v1.0 |
| REQ-APP-09 | Mapa interactivo del mall | MallHub App · Mobile | Invitado / Cliente Registrado | **[M] Importante** | v1.0 |
| REQ-APP-10 | Favoritos (tiendas y productos) | MallHub App · Mobile | Cliente Registrado | **[M] Importante** | v1.0 |
| REQ-APP-11 | Calificaciones y reseñas de tiendas | MallHub App · Mobile | Cliente Registrado | **[F]** | v2.0 |
| REQ-APP-12 | Regateo / negociación de precios | MallHub App · Mobile | Cliente Registrado | **[F]** | v2.0 |
| REQ-STR-01 | Onboarding y perfil de tienda | MallHub Store · Desktop | Admin Local | **[M] Core** | v1.0 |
| REQ-STR-02 | Gestión de catálogo (CRUD de productos) | MallHub Store · Desktop | Admin Local | **[M] Core** | v1.0 |
| REQ-STR-03 | Gestión de reservas entrantes | MallHub Store · Desktop | Admin Local | **[M] Core** | v1.0 |
| REQ-STR-04 | Publicación de promociones y ofertas flash | MallHub Store · Desktop | Admin Local | **[M] Importante** | v1.0 |
| REQ-STR-05 | Dashboard básico de tienda (visitas, reservas) | MallHub Store · Desktop | Admin Local | **[M] Importante** | v1.0 |
| REQ-STR-06 | Analytics avanzados (Plan Pro) | MallHub Store · Desktop | Admin Local | **[F]** | v2.0 |
| REQ-STR-07 | Gestión de plan y facturación (autoservicio) | MallHub Store · Desktop | Admin Local | **[F]** | v2.0 |
| REQ-INS-01 | Dashboard principal de KPIs del mall | MallHub Insights · Desktop | Admin CC | **[M] Core** | v1.0 |
| REQ-INS-02 | Gestión de eventos del mall | MallHub Insights · Desktop | Admin CC | **[M] Core** | v1.0 |
| REQ-INS-03 | Gestión y aprobación de tiendas del mall | MallHub Insights · Desktop | Admin CC | **[M] Core** | v1.0 |
| REQ-INS-04 | Configuración del perfil del mall | MallHub Insights · Desktop | Admin CC | **[M] Core** | v1.0 |
| REQ-INS-05 | Inteligencia de tiendas (comparativa, heatmap) | MallHub Insights · Desktop | Admin CC | **[M] Importante** | v1.0 |
| REQ-INS-06 | Exportación de reportes (PDF / Excel) | MallHub Insights · Desktop | Admin CC | **[M] Importante** | v1.0 |
| REQ-INS-07 | Gestión de publicidad y banners | MallHub Insights · Desktop | Admin CC | **[F]** | v3.0 |
| REQ-INS-08 | Reportes avanzados y personalizados | MallHub Insights · Desktop | Admin CC | **[F]** | v3.0 |
| REQ-ADM-01 | Activación de malls y onboarding de tenants | MallHub Insights · Backoffice Desktop | Admin Plataforma | **[M] Core** | v1.0 |
| REQ-ADM-02 | Aprobación / rechazo de registros de tiendas | MallHub Insights · Backoffice Desktop | Admin Plataforma | **[M] Core** | v1.0 |
| REQ-ADM-03 | Moderación de contenido (catálogos, imágenes) | MallHub Insights · Backoffice Desktop | Admin Plataforma | **[M] Core** | v1.0 |
| REQ-ADM-04 | Gestión de suscripciones y facturación | MallHub Insights · Backoffice Desktop | Admin Plataforma | **[M] Importante** | v1.0 |
| REQ-ADM-05 | Monitoreo de salud de la plataforma (audit log) | MallHub Insights · Backoffice Desktop | Admin Plataforma | **[M] Importante** | v1.0 |
| REQ-ADM-06 | Gestión de campañas publicitarias y anunciantes | MallHub Insights · Backoffice Desktop | Admin Plataforma | **[F]** | v3.0 |
| REQ-INF-01 | Autenticación y autorización multi-rol (JWT / OAuth 2.0) | Infraestructura transversal | Todos | **[M] Core** | v1.0 |
| REQ-INF-02 | Sistema de notificaciones push | Infraestructura transversal | Cliente Registrado / Admin Local | **[M] Core** | v1.0 |
| REQ-INF-03 | Integración con pasarela de pagos | Infraestructura transversal | Cliente Registrado / Admin Local | **[M] Core** | v1.0 |
| REQ-INF-04 | Almacenamiento y CDN de medios (imágenes) | Infraestructura transversal | Todos | **[M] Core** | v1.0 |
| REQ-INF-05 | Motor de analytics y pipeline de datos | Infraestructura transversal | Admin CC / Admin Plataforma | **[M] Core** | v1.0 |
| REQ-INF-06 | Internacionalización (i18n) | Infraestructura transversal | Todos | **[F]** | v2.0 |
 
> **Leyenda:** `[M]` = incluido en MVP (v1.0) · `[F]` = diferido a fase posterior · **Core** = sin esto el MVP no es viable · **Importante** = añade valor significativo, puede simplificarse en v1.0.
 

## 3. Requisitos
<!-- requisitos identificables, verificables y comprobables; evitar detalles de implementación -->

Esta subsección describe todas las entradas y salidas del sistema que cruzan sus fronteras: interfaces de usuario, hardware, software de terceros y protocolos de comunicación. Las interfaces internas entre módulos (IPC Tauri, contratos de API REST) se documentarán en la especificación técnica de arquitectura.

#### 3.1.1 Interfaces de usuario
 
Las interfaces de usuario se dividen por surface y por rol. Los requisitos de esta sección definen comportamientos observables, no disposición visual; las especificaciones de pantalla (layouts, componentes, estados) residen en R3.
 
---
 
##### IU-APP — MallHub App (Tauri Mobile · Invitado y Cliente Registrado)
 
| ID | Requisito |
|---|---|
| **IU-APP-01** | La app debe presentar una pantalla de onboarding con máximo 3 slides de propuesta de valor y las acciones "Comenzar", "Ya tengo cuenta" y "Continuar como invitado", sin requerir permiso de ningún sensor para completar el flujo de invitado. |
| **IU-APP-02** | El Invitado debe poder navegar por el directorio de tiendas, catálogos de productos, ofertas activas y eventos del mall sin estar registrado ni autenticado. |
| **IU-APP-03** | Cuando un Invitado intente ejecutar una acción restringida (reservar, guardar favorito, activar recordatorio), el sistema debe presentar un modal de registro/inicio de sesión sin abandonar la pantalla actual ni perder el contexto de navegación. |
| **IU-APP-04** | La navegación principal de la app debe implementarse mediante un Bottom Tab Bar persistente con cuatro ítems: Inicio, Buscar, Favoritos y Mi Cuenta. El tab bar debe permanecer visible en todas las pantallas de nivel raíz. |
| **IU-APP-05** | Ningún flujo crítico (exploración → reserva) debe requerir más de 3 interacciones desde la pantalla de inicio. |
| **IU-APP-06** | El flujo de Click & Collect debe presentarse en exactamente 3 pasos secuenciales (confirmación del producto → datos de recogida → confirmación exitosa), con un indicador de progreso visible en cada paso. |
| **IU-APP-07** | Al completar una reserva, el sistema debe mostrar un código QR único de reserva en pantalla, sin necesidad de conexión a internet para renderizarlo una vez generado. |
| **IU-APP-08** | La app debe solicitar el permiso de geolocalización únicamente cuando el usuario intente usar la detección automática de mall o acceda al mapa; no debe solicitarlo en el arranque. |
| **IU-APP-09** | El mapa interactivo del mall debe representar los pisos del centro comercial como capas SVG navegables, con locales identificados por nombre y categoría. |
| **IU-APP-10** | El directorio de tiendas debe permitir filtrar simultáneamente por categoría, piso y estado de apertura (abierto ahora / todos). |
| **IU-APP-11** | El buscador de productos debe mostrar resultados en tiempo real a medida que el usuario escribe, con un debounce máximo de 300 ms antes de lanzar la consulta. |
| **IU-APP-12** | Los resultados de búsqueda deben ser filtrables por precio (rango), categoría, piso y disponibilidad (con stock). |
| **IU-APP-13** | El historial de reservas del Cliente Registrado debe presentarse en tres pestañas: Activas, Completadas y Canceladas, con indicadores de estado visual diferenciados por color. |
| **IU-APP-14** | La app debe soportar modo claro y modo oscuro siguiendo la preferencia del sistema operativo, usando los tokens de la Paleta Emerald Market (R4). |
| **IU-APP-15** | Todos los textos, etiquetas y mensajes de la app deben estar en español (Colombia) en v1.0. |
 
---
 
##### IU-STR — MallHub Store (Tauri Desktop · Admin Local)
 
| ID | Requisito |
|---|---|
| **IU-STR-01** | El panel debe estructurarse con una barra lateral de navegación fija que exponga las secciones: Dashboard, Mi Catálogo, Reservas, Perfil de Tienda y Promociones. |
| **IU-STR-02** | El formulario de creación/edición de producto debe admitir la carga de hasta 5 imágenes por producto, ya sea mediante selección desde el sistema de archivos o mediante arrastrar y soltar (drag & drop). |
| **IU-STR-03** | Cada producto debe permitir definir variantes (talla, color u otras dimensiones configurables) con precio y disponibilidad independientes por variante. |
| **IU-STR-04** | El formulario de producto debe ofrecer una vista previa en tiempo real del aspecto que tendrá la tarjeta de producto en la app del comprador. |
| **IU-STR-05** | La bandeja de reservas debe mostrar una notificación visual en tiempo real (badge + sonido opcional) al recibir una nueva reserva, sin necesidad de recargar la pantalla. |
| **IU-STR-06** | Cada reserva en la bandeja debe exponer las acciones "Confirmar" y "Rechazar"; al rechazar, el sistema debe presentar un selector de motivo con las opciones: Sin stock, Precio desactualizado, Cierre anticipado y Otro (con campo de texto libre). |
| **IU-STR-07** | Una reserva pendiente sin respuesta del Admin Local durante 2 horas debe señalizarse visualmente con un indicador de urgencia (color de acento Tangerine) y texto de tiempo restante. |
| **IU-STR-08** | El panel debe permitir al Admin Local escanear el código QR de recogida del cliente mediante la cámara del dispositivo o introducir manualmente el código alfanumérico de la reserva. |
| **IU-STR-09** | El formulario de promoción debe incluir campos para: título, descripción, porcentaje de descuento o precio especial, productos incluidos, fecha de inicio, fecha de fin y toggle de oferta flash (con contador de tiempo visible). |
| **IU-STR-10** | El panel debe funcionar a resoluciones de pantalla desde 1280 × 800 px sin degradación de usabilidad ni ocultamiento de controles primarios. |
 
---
 
##### IU-INS — MallHub Insights (Tauri Desktop · Admin CC y Admin Plataforma)
 
| ID | Requisito |
|---|---|
| **IU-INS-01** | El dashboard principal debe presentar en la fila superior cuatro KPI Cards con los indicadores: Visitas digitales, Búsquedas realizadas, Reservas totales y Tasa de conversión, cada uno con delta porcentual respecto al período anterior. |
| **IU-INS-02** | El dashboard debe incluir un selector de rango de fechas que actualice todos los indicadores y gráficas de forma sincronizada. |
| **IU-INS-03** | El dashboard debe mostrar un gráfico de línea con visitas diarias de los últimos 30 días, un bar chart horizontal con el top 10 de tiendas por reservas y un heatmap de pisos del mall por intensidad de tráfico digital. |
| **IU-INS-04** | El heatmap de pisos debe usar la escala de color Mint → Emerald → Royal Purple definida en R4, con leyenda de intensidad visible. |
| **IU-INS-05** | En estado sin datos (mall recién activado), el dashboard debe mostrar un estado vacío con un tutorial de 3 pasos para completar la configuración; no debe mostrar gráficas con valores en cero. |
| **IU-INS-06** | El módulo de Gestión de Tiendas debe listar todos los locales del mall con su estado (Pendiente, Activo, Suspendido) y exponer las acciones Aprobar, Rechazar y Suspender por fila. |
| **IU-INS-07** | El formulario de creación de evento debe incluir campos para: título, descripción, fecha y hora de inicio, fecha y hora de fin, ubicación dentro del mall (selección desde el mapa de pisos), imagen y audiencia objetivo (todos los usuarios / solo usuarios activos). |
| **IU-INS-08** | Al publicar un evento, el sistema debe presentar una confirmación con la opción de programar una push notification a los usuarios del mall, especificando fecha y hora de envío. |
| **IU-INS-09** | El módulo de exportación debe generar reportes en dos formatos: PDF (para presentaciones ejecutivas) y Excel/CSV (para análisis en hoja de cálculo), y guardarlos en la ruta elegida por el usuario a través del diálogo nativo del sistema operativo. |
| **IU-INS-10** | El panel de backoffice (Admin Plataforma) debe exponer las secciones adicionales: Activación de Malls, Moderación de Contenido, Suscripciones y Facturación, y Monitor de Salud de la Plataforma; estas secciones no deben ser visibles para el rol Admin CC. |
| **IU-INS-11** | El panel debe funcionar a resoluciones de pantalla desde 1280 × 800 px y escalar correctamente hasta resoluciones 4K (3840 × 2160 px). |
 
---
 
#### 3.1.2 Interfaces de hardware
 
| ID | Interfaz | Superficie | Requisito |
|---|---|---|---|
| **IH-01** | Cámara trasera del dispositivo | MallHub App (Mobile) | La app debe acceder a la cámara trasera para capturar imágenes de productos durante el proceso de reserva con cámara habilitada, y para escanear el código QR de recogida por parte del Admin Local en MallHub Store. El acceso requiere permiso explícito del usuario y debe denegarse con mensaje explicativo si se rechaza. |
| **IH-02** | GPS / módulo de geolocalización | MallHub App (Mobile) | La app debe acceder al sensor GPS para detectar el mall más cercano al usuario y para activar push notifications contextuales dentro de un radio de 2 km del centro comercial. El permiso es opcional; si se deniega, el usuario selecciona el mall manualmente. |
| **IH-03** | Almacenamiento local (filesystem) | MallHub App (Mobile) | La app debe poder escribir en el almacenamiento temporal del dispositivo para cachear imágenes de catálogo y el código QR de reservas activas, permitiendo acceso sin conexión a las reservas ya descargadas. |
| **IH-04** | Almacenamiento local (filesystem) | MallHub Store / Insights (Desktop) | Las apps de escritorio deben acceder al sistema de archivos nativo del SO para: leer imágenes al cargar el catálogo, y escribir reportes PDF/Excel exportados en la ruta seleccionada por el usuario vía diálogo nativo. |
| **IH-05** | Pantalla / resolución | MallHub Store / Insights (Desktop) | Las apps de escritorio deben responder correctamente al cambio de resolución y al uso de múltiples monitores sin requerir reinicio de la aplicación. |
| **IH-06** | Notificaciones del sistema operativo | MallHub App (Mobile) + Store (Desktop) | Todas las notificaciones push deben integrarse con el sistema de notificaciones nativo del SO (centro de notificaciones de iOS, Android, macOS y Windows), permitiendo que el usuario las gestione desde la configuración del SO. |
 
---
 
#### 3.1.3 Interfaces de software
 
Las siguientes interfaces describen las dependencias con sistemas de terceros que el sistema consume o con los que interopera. Los contratos de API (endpoints, esquemas JSON, autenticación) se detallarán en los documentos de integración correspondientes.
 
---
 
##### ISW-PAY — Pasarela de pagos
 
| ID | Requisito |
|---|---|
| **ISW-PAY-01** | El sistema debe integrarse con al menos una pasarela de pago certificada (Wompi o MercadoPago como primaria, Stripe como alternativa) para procesar los pagos en línea del flujo Click & Collect cuando aplique. |
| **ISW-PAY-02** | El sistema **no debe almacenar** datos de tarjeta (PAN, CVV, fecha de expiración) en ninguna capa propia; el almacenamiento y procesamiento de datos de pago queda delegado íntegramente a la pasarela. |
| **ISW-PAY-03** | La pasarela debe devolver al sistema un identificador de transacción único (`transaction_id`) y un estado final (`approved` / `declined` / `pending`) para vincular al registro de reserva correspondiente. |
| **ISW-PAY-04** | En caso de fallo de la pasarela (timeout > 10 s o respuesta de error), el sistema debe presentar un mensaje de error accionable al usuario sin cancelar automáticamente la reserva, permitiendo un reintento. |
 
---
 
##### ISW-PUSH — Servicio de notificaciones push
 
| ID | Requisito |
|---|---|
| **ISW-PUSH-01** | Las notificaciones push hacia dispositivos iOS deben entregarse a través de **APNs** (Apple Push Notification service) mediante `tauri-plugin-push-notifications`. |
| **ISW-PUSH-02** | Las notificaciones push hacia dispositivos Android deben entregarse a través de **FCM** (Firebase Cloud Messaging) mediante `tauri-plugin-push-notifications`. |
| **ISW-PUSH-03** | Las notificaciones de escritorio (MallHub Store en macOS/Windows/Linux) deben entregarse como notificaciones nativas del SO mediante el API de notificaciones de Tauri. |
| **ISW-PUSH-04** | Cada notificación push debe incluir como mínimo: tipo de evento (`reservation_new`, `reservation_confirmed`, `reservation_rejected`, `event_reminder`, `offer_flash`), ID del recurso asociado y timestamp de generación. |
| **ISW-PUSH-05** | El sistema debe respetar el estado de suscripción del usuario: si el permiso de notificaciones fue denegado, no debe intentar re-solicitarlo automáticamente más de una vez por sesión. |
 
---
 
##### ISW-MAP — Servicio de mapas y geolocalización
 
| ID | Requisito |
|---|---|
| **ISW-MAP-01** | El mapa de localización de malls cercanos (selección inicial en onboarding) debe consumir una API de mapas externa (Google Maps o Mapbox) para renderizar el mapa base y calcular distancia entre la ubicación del usuario y los malls registrados. |
| **ISW-MAP-02** | El mapa interactivo interior de cada mall (plano de pisos) debe renderizarse a partir de datos SVG almacenados en el backend de MallHub, sin depender del servicio de mapas externo para la navegación interna. |
| **ISW-MAP-03** | Si el servicio de mapas externo no está disponible, el sistema debe permitir la selección manual de mall como mecanismo de fallback, sin bloquear el uso de la app. |
 
---
 
##### ISW-ANALYTICS — Servicio de analytics y BI
 
| ID | Requisito |
|---|---|
| **ISW-ANL-01** | Los eventos de comportamiento del usuario (sesiones, búsquedas, clics en productos, reservas) deben enviarse al pipeline de datos (BigQuery o equivalente) en tiempo real con una latencia máxima de 60 segundos desde la acción. |
| **ISW-ANL-02** | Los KPIs del dashboard de MallHub Insights deben reflejar datos con un desfase máximo de 5 minutos respecto al momento de consulta durante el horario de operación del mall. |
| **ISW-ANL-03** | Los datos de analytics en el dashboard deben estar aislados por tenant (mall): un Admin CC no debe poder acceder ni ver, en ninguna vista, datos de otro mall. |
 
---
 
##### ISW-STORAGE — Almacenamiento de medios
 
| ID | Requisito |
|---|---|
| **ISW-STG-01** | Las imágenes de productos, logos de tiendas, imágenes del mall y material gráfico de eventos deben almacenarse en un servicio de almacenamiento en la nube con CDN (AWS S3 + CloudFront o GCP Cloud Storage + Cloud CDN). |
| **ISW-STG-02** | Las imágenes deben servirse siempre desde el CDN, nunca directamente desde el servidor de aplicación. |
| **ISW-STG-03** | El sistema debe generar automáticamente versiones redimensionadas de cada imagen cargada: miniatura (150 × 150 px), media (600 × 600 px) y original con compresión (máx. 2 MB). |
| **ISW-STG-04** | Los formatos de imagen admitidos en la carga son: JPEG, PNG y WebP. El sistema debe rechazar cualquier otro formato con un mensaje de error específico. |
 
---
 
##### ISW-AUTH — Autenticación y autorización
 
| ID | Requisito |
|---|---|
| **ISW-AUTH-01** | El sistema debe implementar autenticación basada en **JWT** (JSON Web Tokens) con tiempo de expiración de acceso de 60 minutos y refresh token de 30 días. |
| **ISW-AUTH-02** | El sistema debe soportar inicio de sesión con **email + contraseña** y con **OAuth 2.0** (Google como proveedor mínimo en v1.0) para los roles Invitado (registro) y Cliente Registrado. |
| **ISW-AUTH-03** | El rol Admin Plataforma debe requerir autenticación de **doble factor (2FA)** basada en TOTP (RFC 6238) como requisito obligatorio para iniciar sesión. |
| **ISW-AUTH-04** | El control de acceso debe implementarse como **RBAC** (Role-Based Access Control) con los cinco roles definidos en §2.4: Invitado, Cliente Registrado, Admin Local, Admin CC y Admin Plataforma. Ningún rol debe poder acceder a recursos fuera de su scope sin una elevación de privilegios explícita. |
| **ISW-AUTH-05** | Los tokens de sesión deben almacenarse de forma segura en el keychain / keystore nativo del sistema operativo a través de los mecanismos provistos por Tauri, nunca en localStorage ni en almacenamiento no cifrado. |
 
---
 
#### 3.1.4 Interfaces de comunicación
 
| ID | Protocolo / Canal | Dirección | Requisito |
|---|---|---|---|
| **IC-01** | **HTTPS / REST** | Cliente ↔ Backend | Toda comunicación entre los clientes Tauri (app y desktop) y el backend debe realizarse sobre HTTPS (TLS 1.2 mínimo, TLS 1.3 recomendado). No se admiten conexiones HTTP sin cifrar en producción. |
| **IC-02** | **WebSocket (WSS)** | Backend → Cliente | Las actualizaciones en tiempo real (nueva reserva para Admin Local, cambio de estado de reserva para Cliente Registrado) deben entregarse mediante una conexión WebSocket persistente sobre WSS. El cliente debe reconectarse automáticamente con backoff exponencial ante una desconexión. |
| **IC-03** | **JSON** | Cliente ↔ Backend | El formato de intercambio de datos entre clientes y API REST debe ser JSON (UTF-8). Las respuestas de error deben seguir el esquema `{ "error": { "code": string, "message": string, "details"?: object } }`. |
| **IC-04** | **Tauri IPC** (`invoke`) | Frontend JS ↔ Core Rust | La comunicación entre el frontend React y el core Rust de Tauri debe realizarse exclusivamente mediante el mecanismo `invoke` de Tauri y eventos tipados. No se exponen puertos HTTP locales entre capas del cliente. |
| **IC-05** | **APNs / FCM** | Backend → Dispositivo móvil | Las notificaciones push salientes desde el backend deben enviarse a través de los servicios APNs y FCM según la plataforma del destinatario. El payload debe cumplir los límites de tamaño de cada servicio (APNs: 4 KB; FCM: 4 KB para `data`, 240 B para `notification`). |
| **IC-06** | **OAuth 2.0 / OIDC** | Cliente → Proveedor externo | El flujo de autenticación con Google debe implementarse mediante OAuth 2.0 Authorization Code Flow con PKCE. El token de identidad recibido del proveedor se valida en el backend antes de emitir el JWT de sesión de MallHub. |
| **IC-07** | **CDN (HTTPS)** | Cliente → CDN | Todos los activos de medios (imágenes de productos, logos, material de eventos) deben cargarse desde el CDN mediante HTTPS. Los clientes no deben acceder al bucket de almacenamiento directamente. |
| **IC-08** | **Webhook (HTTPS POST)** | Pasarela de pago → Backend | Las actualizaciones de estado de transacciones (confirmación, rechazo, reembolso) deben recibirse del proveedor de pagos mediante webhooks HTTPS POST al endpoint del backend. El backend debe validar la firma del webhook antes de procesar el evento. |
 
### 3.2 Funciones
<!-- comportamientos observables externamente organizados por característica/caso de uso -->

#### US-INV-01 · Continuar como invitado desde el onboarding


Como usuario invitado,
quiero poder omitir el registro durante el onboarding
para poder explorar la app sin necesidad de crear una cuenta.

**Criterios de aceptación (Gherkin)**
````
Feature: Acceso como invitado desde el onboarding

  Scenario: El usuario elige continuar como invitado
    Given que el usuario abre la app por primera vez
    And está en la pantalla de Splash / Onboarding
    When toca la opción "Continuar como invitado"
    Then el sistema lo redirige al Home Feed sin solicitar credenciales
    And el usuario puede navegar libremente por el contenido público

  Scenario: El usuario omite los slides de onboarding
    Given que el usuario está viendo los slides de propuesta de valor
    When toca el botón "Omitir" o "Saltar"
    Then el sistema lo lleva directamente a la pantalla de selección de mall
    And no pierde la opción de continuar como invitado

  Scenario: El usuario llega al final de los slides de onboarding
    Given que el usuario visualizó los 3 slides de propuesta de valor
    When llega al último slide
    Then el sistema muestra los botones "Crear cuenta", "Ya tengo cuenta" y "Continuar como invitado"
    And los tres botones son claramente visibles y accesibles
````

#### US-INV-02 · Seleccionar mall manualmente

Como usuario invitado,
quiero poder seleccionar un centro comercial manualmente desde una lista
para poder explorar la oferta del mall de mi elección.
**Criterios de aceptación (Gherkin)**
````
Feature: Selección manual de mall activo

  Scenario: El usuario selecciona un mall de la lista
    Given que el usuario está en la pantalla de selección de mall
    And existen malls activos registrados en el sistema
    When toca el nombre de un mall de la lista
    Then el sistema establece ese mall como el mall activo
    And redirige al usuario al Home Feed del mall seleccionado

  Scenario: No hay malls disponibles en la lista
    Given que el usuario está en la pantalla de selección de mall
    And no existen malls activos en el sistema
    When la pantalla carga
    Then el sistema muestra un mensaje informando que no hay malls disponibles
    And sugiere intentarlo más tarde

  Scenario: El usuario cambia de mall desde el Home Feed
    Given que el usuario ya tiene un mall activo asignado
    And está en el Home Feed
    When toca el nombre del mall activo en el header
    Then el sistema abre la pantalla de selección de mall
    And el usuario puede escoger un mall diferente

````

#### US-INV-03 · Detectar mall activo por geolocalización

Como usuario invitado,
quiero que la app detecte automáticamente el mall más cercano usando mi ubicación
para poder ver contenido relevante sin tener que buscarlo manualmente.
**Criterios de aceptación (Gherkin)**
````
Feature: Detección de mall activo por geolocalización

  Scenario: Geolocalización exitosa con mall cercano
    Given que el usuario está en la pantalla de selección de mall
    And el usuario acepta el permiso de ubicación
    And existe un mall activo dentro del radio de detección
    When el sistema obtiene la ubicación del dispositivo
    Then muestra el mall más cercano como sugerencia destacada
    And el usuario puede confirmarlo o elegir otro manualmente

  Scenario: No hay mall cercano dentro del radio de detección
    Given que el usuario acepta el permiso de ubicación
    And no existe ningún mall activo en el radio de detección
    When el sistema evalúa la ubicación
    Then muestra la lista completa de malls disponibles sin pre-selección
    And no muestra error, sino el listado general

  Scenario: El usuario deniega el permiso de ubicación
    Given que el sistema solicita acceso a la ubicación
    When el usuario rechaza el permiso
    Then el sistema no bloquea la navegación
    And muestra la lista manual de malls para que el usuario elija uno

  Scenario: El dispositivo no tiene GPS disponible
    Given que el usuario está en la pantalla de selección de mall
    And el dispositivo no puede obtener la ubicación (GPS apagado o no disponible)
    When el sistema intenta obtener la ubicación
    Then muestra un mensaje informativo indicando que no pudo detectar la ubicación
    And presenta la lista de malls para selección manual

````

#### US-INV-04 · Ver el Home Feed del mall activo

Como usuario invitado,
quiero ver la pantalla de inicio con el contenido destacado del mall activo
para poder descubrir tiendas, ofertas y eventos sin necesidad de buscarlos.
**Criterios de aceptación (Gherkin)**
````
Feature: Visualización del Home Feed para usuario invitado

  Scenario: Home Feed carga con contenido disponible
    Given que el usuario invitado tiene un mall activo seleccionado
    When accede a la pantalla de inicio (Home Feed)
    Then el sistema muestra tiendas destacadas del mall
    And muestra ofertas activas del mall
    And muestra eventos próximos del mall
    And el contenido es de solo lectura

  Scenario: Home Feed sin contenido en una sección
    Given que el usuario invitado accede al Home Feed
    And el mall activo no tiene eventos publicados
    When la sección de eventos intenta cargar
    Then el sistema muestra un empty state descriptivo en esa sección
    And las demás secciones cargan con normalidad

  Scenario: Home Feed sin conexión a internet
    Given que el usuario no tiene conexión a internet
    When intenta cargar el Home Feed
    Then el sistema muestra un mensaje indicando que no hay conexión
    And sugiere verificar la conexión y reintentar
    And no muestra contenido parcial ni vacío sin explicación

````

#### US-INV-05 · Explorar el directorio de tiendas

Como usuario invitado,
quiero ver el listado completo de tiendas del mall activo
para poder conocer qué locales están disponibles antes de visitarlo.
**Criterios de aceptación (Gherkin)**
````
Feature: Exploración del directorio de tiendas por usuario invitado

  Scenario: El directorio carga con tiendas disponibles
    Given que el usuario invitado está en el Home Feed
    When navega a la sección de Directorio de Tiendas
    Then el sistema muestra la lista de tiendas activas del mall activo
    And cada tarjeta muestra: logo, nombre, categoría, piso y estado (abierta/cerrada)

  Scenario: El directorio se visualiza en modo lista
    Given que el usuario está en el Directorio de Tiendas
    When la vista por defecto es la lista
    Then el sistema muestra las tarjetas de tienda en formato vertical scrollable
    And muestra el contador de tiendas encontradas

  Scenario: El directorio se visualiza en modo mapa
    Given que el usuario está en el Directorio de Tiendas
    When toca la pestaña "Mapa"
    Then el sistema muestra el mapa del mall con los pins de ubicación de cada tienda
    And cada pin muestra el nombre de la tienda al tocar

  Scenario: El mall activo no tiene tiendas registradas
    Given que el mall activo no tiene tiendas publicadas
    When el usuario navega al Directorio
    Then el sistema muestra un empty state indicando que no hay tiendas disponibles
    And no muestra errores técnicos

````

#### US-INV-06 · Filtrar tiendas en el directorio

Como usuario invitado,
quiero filtrar las tiendas del directorio por categoría, piso u horario
para poder encontrar rápidamente el tipo de local que me interesa.
**Criterios de aceptación (Gherkin)**
````
Feature: Filtrado de tiendas en el directorio

  Scenario: Filtrar por categoría con resultados
    Given que el usuario invitado está en el Directorio de Tiendas
    When aplica el filtro de categoría "Moda"
    Then el sistema muestra únicamente las tiendas que pertenecen a la categoría "Moda"
    And actualiza el contador de tiendas encontradas

  Scenario: Filtrar por piso con resultados
    Given que el usuario está en el Directorio de Tiendas
    When selecciona el filtro de piso "Piso 2"
    Then el sistema muestra únicamente las tiendas ubicadas en el segundo piso

  Scenario: Filtrar por horario (tiendas abiertas)
    Given que el usuario está en el Directorio de Tiendas
    When activa el filtro "Abiertas ahora"
    Then el sistema muestra únicamente las tiendas con estado "abierta" en ese momento

  Scenario: Combinación de filtros sin resultados
    Given que el usuario aplica filtros de categoría y piso simultáneamente
    And la combinación no tiene tiendas coincidentes
    When el sistema procesa los filtros
    Then muestra un empty state indicando que no hay tiendas con esos criterios
    And ofrece la opción de limpiar los filtros

  Scenario: Limpiar filtros aplicados
    Given que el usuario tiene uno o más filtros activos
    When toca la opción "Limpiar filtros"
    Then el sistema restablece el directorio mostrando todas las tiendas disponibles
    And los controles de filtro regresan a su estado inicial

````

#### US-INV-07 · Ver el perfil de una tienda

Como usuario invitado,
quiero ver el perfil completo de una tienda del mall
para poder conocer su información, catálogo y reseñas sin necesidad de registrarme.
**Criterios de aceptación (Gherkin)**
````
Feature: Visualización del perfil de tienda por usuario invitado

  Scenario: El usuario accede al perfil de una tienda
    Given que el usuario invitado está en el Directorio de Tiendas o en el Home Feed
    When toca la tarjeta de una tienda
    Then el sistema muestra el perfil de la tienda
    And muestra la pestaña "Catálogo" por defecto

  Scenario: Visualización de la pestaña Catálogo
    Given que el usuario está en el perfil de una tienda
    When está en la pestaña "Catálogo"
    Then el sistema muestra los productos publicados de la tienda
    And cada producto muestra: imagen, nombre y precio

  Scenario: Visualización de la pestaña Información
    Given que el usuario está en el perfil de una tienda
    When toca la pestaña "Información"
    Then el sistema muestra: nombre, categoría, piso, horarios, teléfono y descripción

  Scenario: Visualización de la pestaña Reseñas
    Given que el usuario está en el perfil de una tienda
    When toca la pestaña "Reseñas"
    Then el sistema muestra las reseñas y calificaciones publicadas de otros usuarios
    And el usuario invitado puede leerlas pero no puede publicar una nueva reseña

  Scenario: La tienda no tiene productos publicados
    Given que el usuario accede al perfil de una tienda sin productos
    When visualiza la pestaña "Catálogo"
    Then el sistema muestra un empty state indicando que no hay productos disponibles

````

#### US-INV-08 · Ver el detalle de un producto

Como usuario invitado,
quiero ver la información completa de un producto de una tienda
para poder evaluar si me interesa antes de visitar el local.
**Criterios de aceptación (Gherkin)**
````
Feature: Visualización del detalle de producto por usuario invitado

  Scenario: El usuario accede al detalle de un producto
    Given que el usuario invitado está en el catálogo de una tienda
    When toca la tarjeta de un producto
    Then el sistema muestra la pantalla de detalle del producto
    And muestra: imágenes, nombre, precio, descripción, categoría y disponibilidad (stock: sí/no)

  Scenario: El producto tiene variantes disponibles
    Given que el usuario está en el detalle de un producto con variantes
    When visualiza la pantalla
    Then el sistema muestra las variantes disponibles (talla, color, etc.)
    And el usuario puede ver cada variante sin necesidad de seleccionarlas para reservar

  Scenario: El producto tiene precio con descuento
    Given que la tienda publicó un precio con descuento para el producto
    When el usuario invitado visualiza el detalle
    Then el sistema muestra tanto el precio original como el precio con descuento
    And distingue visualmente ambos precios

  Scenario: El producto no está disponible en stock
    Given que el producto tiene disponibilidad "sin stock"
    When el usuario invitado visualiza el detalle
    Then el sistema muestra que el producto no está disponible actualmente
    And el botón de reserva aparece deshabilitado o no visible para el invitado

````

#### US-INV-09 · Buscar productos en el mall

Como usuario invitado,
quiero poder buscar un producto por nombre o categoría dentro del mall activo
para poder saber en qué tienda puedo encontrarlo sin tener que recorrerlo físicamente.
**Criterios de aceptación (Gherkin)**
````
Feature: Búsqueda de productos por usuario invitado

  Scenario: Búsqueda con resultados encontrados
    Given que el usuario invitado está en la pantalla de Búsqueda
    When escribe el nombre de un producto o categoría en el campo de búsqueda
    Then el sistema muestra resultados que incluyen productos y tiendas coincidentes
    And cada resultado muestra el nombre del producto y la tienda que lo tiene

  Scenario: Búsqueda sin resultados
    Given que el usuario escribe un término de búsqueda que no coincide con ningún producto o tienda
    When el sistema procesa la búsqueda
    Then muestra un empty state indicando que no se encontraron resultados
    And sugiere revisar la ortografía o buscar con otro término

  Scenario: El usuario toca un resultado de producto
    Given que el sistema devolvió resultados de búsqueda
    When el usuario toca un resultado de tipo producto
    Then el sistema navega al detalle de ese producto

  Scenario: El usuario toca un resultado de tienda
    Given que el sistema devolvió resultados de búsqueda
    When el usuario toca un resultado de tipo tienda
    Then el sistema navega al perfil de esa tienda

  Scenario: El campo de búsqueda se envía vacío
    Given que el usuario está en la pantalla de Búsqueda
    When intenta buscar sin escribir ningún término
    Then el sistema no ejecuta la búsqueda
    And muestra un mensaje indicando que debe ingresar un término para buscar

````

#### US-INV-10 · Filtrar resultados de búsqueda

Como usuario invitado,
quiero filtrar los resultados de búsqueda por precio, categoría, disponibilidad y piso
para poder encontrar más fácilmente lo que estoy buscando.
**Criterios de aceptación (Gherkin)**
````
Feature: Filtrado de resultados de búsqueda por usuario invitado

  Scenario: Aplicar filtro por categoría en resultados de búsqueda
    Given que el usuario invitado realizó una búsqueda con resultados
    When aplica el filtro de categoría "Tecnología"
    Then el sistema muestra únicamente los resultados de esa categoría
    And actualiza el contador de resultados

  Scenario: Aplicar filtro por disponibilidad
    Given que el usuario tiene resultados de búsqueda en pantalla
    When activa el filtro "Solo disponibles"
    Then el sistema muestra únicamente productos marcados como disponibles en stock

  Scenario: Aplicar filtro por piso
    Given que el usuario tiene resultados de búsqueda en pantalla
    When selecciona un piso específico en el filtro
    Then el sistema muestra únicamente productos de tiendas ubicadas en ese piso

  Scenario: Aplicar filtro por rango de precio
    Given que el usuario tiene resultados de búsqueda en pantalla
    When define un rango de precio mínimo y máximo
    Then el sistema muestra únicamente los productos dentro de ese rango

  Scenario: Filtros combinados sin resultados
    Given que el usuario aplicó múltiples filtros simultáneamente
    And la combinación no arroja ningún resultado
    When el sistema procesa los filtros
    Then muestra un empty state claro
    And ofrece la opción de limpiar los filtros para ampliar la búsqueda

````

#### US-INV-11 · Ver el listado de eventos del mall

Como usuario invitado,
quiero ver los eventos programados en el mall activo
para poder conocer las actividades disponibles y planificar mi visita.
**Criterios de aceptación (Gherkin)**
````
Feature: Visualización de eventos del mall por usuario invitado

  Scenario: El usuario accede a la sección de Eventos
    Given que el usuario invitado tiene un mall activo seleccionado
    When navega a la sección "Eventos"
    Then el sistema muestra los eventos activos y próximos del mall
    And cada tarjeta de evento muestra: imagen, título, fecha y ubicación dentro del mall

  Scenario: Vista de eventos en modo calendario
    Given que el usuario está en la sección de Eventos
    When selecciona la vista "Calendario" con el toggle
    Then el sistema muestra los eventos organizados en formato de calendario mensual
    And los días con eventos están marcados visualmente

  Scenario: Vista de eventos en modo lista
    Given que el usuario está en la sección de Eventos
    When selecciona la vista "Lista" con el toggle
    Then el sistema muestra los eventos en orden cronológico ascendente

  Scenario: Filtrar eventos por tipo
    Given que el usuario está en la sección de Eventos
    When aplica el filtro por tipo "Concierto"
    Then el sistema muestra únicamente los eventos de tipo concierto

  Scenario: No hay eventos publicados en el mall
    Given que el mall activo no tiene eventos programados
    When el usuario accede a la sección de Eventos
    Then el sistema muestra un empty state informando que no hay eventos disponibles
    And no muestra errores técnicos

````

#### US-INV-12 · Ver el detalle de un evento

Como usuario invitado,
quiero ver la información completa de un evento del mall
para poder conocer sus características antes de decidir si lo visito.
**Criterios de aceptación (Gherkin)**
````
Feature: Visualización del detalle de evento por usuario invitado

  Scenario: El usuario accede al detalle de un evento
    Given que el usuario invitado está en la sección de Eventos
    When toca la tarjeta de un evento
    Then el sistema muestra la pantalla de detalle del evento
    And muestra: imagen, título, descripción, fecha, hora y ubicación dentro del mall

  Scenario: El usuario intenta activar recordatorio de un evento
    Given que el usuario invitado está en el detalle de un evento
    When toca el botón "Activar recordatorio"
    Then el sistema muestra un modal o banner invitando al usuario a registrarse
    And le indica que necesita una cuenta para activar recordatorios
    And ofrece las opciones "Crear cuenta" e "Iniciar sesión"
    And al cerrar el modal el usuario permanece en el detalle del evento

  Scenario: El usuario comparte un evento
    Given que el usuario invitado está en el detalle de un evento
    When toca el botón "Compartir"
    Then el sistema abre el menú nativo de compartir del dispositivo
    And permite compartir el enlace o la información del evento

````

#### US-INV-13 · Ver ofertas y promociones del mall

Como usuario invitado,
quiero ver todas las promociones activas del mall activo
para poder conocer los descuentos disponibles antes de visitar las tiendas.
**Criterios de aceptación (Gherkin)**
````
Feature: Visualización de ofertas y promociones por usuario invitado

  Scenario: El usuario accede a la sección de Ofertas
    Given que el usuario invitado tiene un mall activo seleccionado
    When navega a la sección "Ofertas y Promociones"
    Then el sistema muestra todas las promociones activas del mall
    And cada tarjeta muestra: imagen, nombre de la tienda, descripción y fecha de expiración

  Scenario: Visualización de oferta flash con contador
    Given que existe una oferta flash activa en el mall
    When el usuario invitado visualiza la sección de Ofertas
    Then el sistema muestra un contador regresivo de tiempo en la tarjeta de la oferta flash
    And el contador se actualiza en tiempo real

  Scenario: Filtrar ofertas por tipo
    Given que el usuario invitado está en la sección de Ofertas
    When aplica el filtro por tipo "Descuento"
    Then el sistema muestra únicamente las ofertas de tipo descuento

  Scenario: El usuario toca "Ir a la tienda" desde una oferta
    Given que el usuario invitado está viendo el detalle de una oferta
    When toca el botón "Ir a la tienda"
    Then el sistema navega al perfil de la tienda que publicó la oferta

  Scenario: El usuario intenta guardar una oferta
    Given que el usuario invitado está viendo una oferta
    When toca el ícono de guardar o el botón "Guardar oferta"
    Then el sistema muestra un modal invitando al usuario a registrarse
    And le indica que necesita una cuenta para guardar ofertas
    And al cerrar el modal permanece en la pantalla de la oferta

  Scenario: No hay ofertas activas en el mall
    Given que el mall activo no tiene promociones publicadas
    When el usuario accede a la sección de Ofertas
    Then el sistema muestra un empty state informando que no hay ofertas disponibles

````

#### US-INV-14 · Ver el mapa del mall

Como usuario invitado,
quiero poder ver el mapa interactivo del mall activo
para poder orientarme y ubicar las tiendas físicamente dentro del centro comercial.
**Criterios de aceptación (Gherkin)**
````
Feature: Visualización del mapa del mall por usuario invitado

  Scenario: El usuario abre el mapa del mall
    Given que el usuario invitado tiene un mall activo seleccionado
    When accede al Mapa del Mall desde el Home Feed o el Directorio
    Then el sistema muestra el mapa SVG del mall como modal de pantalla completa
    And el mapa muestra los locales con sus nombres por piso

  Scenario: El usuario cambia de piso en el mapa
    Given que el usuario está visualizando el mapa del mall
    And el mall tiene más de un piso
    When selecciona un piso diferente mediante el selector de pisos
    Then el sistema actualiza el mapa mostrando la planta correspondiente
    And los locales se actualizan según el piso seleccionado

  Scenario: El usuario toca un local en el mapa
    Given que el usuario está visualizando el mapa del mall
    When toca el pin o área de una tienda en el mapa
    Then el sistema muestra el nombre y categoría de la tienda en una etiqueta
    And ofrece la opción de ir al perfil de la tienda

  Scenario: El mall no tiene mapa disponible
    Given que el mall activo no tiene mapa SVG cargado
    When el usuario intenta acceder al Mapa del Mall
    Then el sistema muestra un mensaje informando que el mapa no está disponible aún
    And no muestra errores técnicos ni pantallas en blanco

````

#### US-INV-15 · Intentar reservar un producto sin cuenta

Como usuario invitado,
quiero recibir una invitación a registrarme cuando intento reservar un producto
para poder entender qué necesito hacer para completar la acción, sin que se bloquee mi navegación previa.
**Criterios de aceptación (Gherkin)**
````
Feature: Restricción de reserva para usuario invitado con invitación a registro

  Scenario: El usuario invitado intenta reservar un producto
    Given que el usuario invitado está en el detalle de un producto disponible en stock
    When toca el botón "Reservar para recoger"
    Then el sistema muestra un modal o bottom sheet de invitación al registro
    And el modal explica que se necesita una cuenta para realizar reservas
    And ofrece las opciones "Crear cuenta" e "Iniciar sesión"
    And no redirige al usuario fuera del detalle del producto al cerrar el modal

  Scenario: El usuario elige "Crear cuenta" desde el modal de restricción
    Given que el modal de invitación está visible
    When el usuario toca "Crear cuenta"
    Then el sistema navega al flujo de registro
    And al completar el registro el sistema redirige al usuario de vuelta al producto que intentó reservar

  Scenario: El usuario elige "Iniciar sesión" desde el modal de restricción
    Given que el modal de invitación está visible
    When el usuario toca "Iniciar sesión"
    Then el sistema navega a la pantalla de inicio de sesión
    And al autenticarse correctamente el sistema redirige al usuario de vuelta al producto que intentó reservar

  Scenario: El usuario cierra el modal sin registrarse
    Given que el modal de invitación está visible
    When el usuario cierra el modal
    Then el sistema oculta el modal
    And el usuario permanece en el detalle del producto
    And puede seguir navegando libremente sin restricciones adicionales

````

#### US-INV-16 · Intentar agregar a favoritos sin cuenta

Como usuario invitado,
quiero recibir una invitación a registrarme cuando intento guardar una tienda o producto en favoritos
para poder entender qué necesito hacer para usar esa función, sin que se interrumpa mi navegación.
**Criterios de aceptación (Gherkin)**
````
Feature: Restricción de favoritos para usuario invitado con invitación a registro

  Scenario: El usuario invitado intenta guardar una tienda en favoritos
    Given que el usuario invitado está en el perfil de una tienda
    When toca el ícono de favorito (corazón)
    Then el sistema muestra un modal invitando al usuario a registrarse
    And el modal indica que se necesita una cuenta para guardar favoritos
    And ofrece las opciones "Crear cuenta" e "Iniciar sesión"
    And el ícono de favorito no cambia de estado

  Scenario: El usuario invitado intenta guardar un producto en favoritos
    Given que el usuario invitado está en el detalle de un producto
    When toca el ícono de favorito del producto
    Then el sistema muestra el mismo modal de invitación al registro
    And el producto no se guarda en ninguna lista

  Scenario: El usuario cierra el modal sin registrarse
    Given que el modal de invitación está visible
    When el usuario cierra el modal
    Then el sistema oculta el modal
    And el usuario permanece en la pantalla donde estaba
    And puede continuar navegando sin interrupciones adicionales

````

#### US-INV-17 · Navegar con Bottom Tab Bar

Como usuario invitado,
quiero usar la barra de navegación inferior para moverme entre las secciones principales de la app
para poder acceder rápidamente a cualquier área sin perder el contexto de dónde estoy.
**Criterios de aceptación (Gherkin)**
````
Feature: Navegación con Bottom Tab Bar para usuario invitado

  Scenario: El usuario navega al tab "Inicio"
    Given que el usuario invitado está en cualquier pantalla de primer nivel
    When toca el tab "Inicio" en la barra de navegación inferior
    Then el sistema muestra el Home Feed del mall activo

  Scenario: El usuario navega al tab "Buscar"
    Given que el usuario invitado está en cualquier pantalla de primer nivel
    When toca el tab "Buscar"
    Then el sistema muestra la pantalla de Búsqueda con el campo de texto activo

  Scenario: El usuario invitado toca el tab "Favoritos"
    Given que el usuario invitado está en cualquier pantalla
    When toca el tab "Favoritos"
    Then el sistema muestra un estado vacío con un mensaje indicando que debe registrarse para usar favoritos
    And ofrece las opciones "Crear cuenta" e "Iniciar sesión"
    And no muestra errores técnicos

  Scenario: El usuario invitado toca el tab "Mi cuenta"
    Given que el usuario invitado está en cualquier pantalla
    When toca el tab "Mi cuenta"
    Then el sistema muestra una pantalla con las opciones "Crear cuenta" e "Iniciar sesión"
    And muestra un resumen de lo que puede hacer con una cuenta (reservas, favoritos, notificaciones)

````

#### US-INV-18 · Accesibilidad con lectores de pantalla

Como usuario invitado con necesidades de accesibilidad,
quiero que la app sea compatible con VoiceOver (iOS) y TalkBack (Android)
para poder navegar el contenido público sin barreras de accesibilidad.
**Criterios de aceptación (Gherkin)**
````
Feature: Accesibilidad para usuario invitado con lectores de pantalla

  Scenario: Navegación con VoiceOver en iOS
    Given que el usuario invitado tiene VoiceOver activado en su dispositivo iOS
    When navega por el Home Feed, Directorio, Eventos u Ofertas
    Then todos los elementos interactivos tienen etiquetas de accesibilidad descriptivas
    And el orden de foco es lógico y sigue la jerarquía visual de la pantalla

  Scenario: Navegación con TalkBack en Android
    Given que el usuario invitado tiene TalkBack activado en su dispositivo Android
    When navega por el Home Feed, Directorio, Eventos u Ofertas
    Then todos los elementos interactivos son descritos correctamente por TalkBack
    And los botones y acciones tienen descripciones claras de su función

  Scenario: Imágenes y tarjetas tienen texto alternativo
    Given que el usuario invitado navega con lector de pantalla activo
    When el lector enfoca una imagen de tienda, producto o evento
    Then el sistema proporciona un texto alternativo descriptivo para esa imagen

  Scenario: Los modales de invitación a registro son accesibles
    Given que el usuario invitado con lector de pantalla activa una acción restringida
    When aparece el modal de invitación al registro
    Then el foco del lector de pantalla se mueve automáticamente al modal
    And los botones "Crear cuenta", "Iniciar sesión" y "Cerrar" son correctamente anunciado

````

#### US-CR-01 · Registrarse con correo y contraseña

Como usuario nuevo,
quiero crear una cuenta con mi correo electrónico y una contraseña
para poder acceder a las funcionalidades exclusivas de cliente registrado.
**Criterios de aceptación (Gherkin)**
````
Feature: Registro de cuenta con correo y contraseña

  Scenario: Registro exitoso
    Given que el usuario está en la pantalla de registro
    When ingresa un correo válido, una contraseña válida y confirma la contraseña correctamente
    Then el sistema crea la cuenta
    And envía un correo de verificación a la dirección proporcionada
    And muestra un mensaje indicando que debe verificar su correo para continuar

  Scenario: Correo con formato inválido
    Given que el usuario está en la pantalla de registro
    When ingresa un correo con formato inválido (sin @, sin dominio, etc.)
    Then el sistema muestra un mensaje de error indicando que el formato del correo no es válido
    And no crea la cuenta

  Scenario: Contraseñas no coinciden
    Given que el usuario está en la pantalla de registro
    When ingresa una contraseña y una confirmación diferente
    Then el sistema muestra un mensaje de error indicando que las contraseñas no coinciden
    And no crea la cuenta

  Scenario: Contraseña no cumple requisitos mínimos
    Given que el usuario está en la pantalla de registro
    When ingresa una contraseña que no cumple los requisitos mínimos de seguridad
    Then el sistema muestra un mensaje indicando los requisitos que no se cumplen
    And no crea la cuenta

  Scenario: Correo ya registrado
    Given que el correo ingresado ya existe en el sistema
    When el usuario intenta registrarse con ese correo
    Then el sistema muestra un mensaje indicando que ese correo ya tiene una cuenta
    And ofrece la opción de iniciar sesión o recuperar contraseña

  Scenario: Registro con campos vacíos
    Given que el usuario está en la pantalla de registro
    When intenta continuar sin completar todos los campos obligatorios
    Then el sistema resalta los campos vacíos con un mensaje de error
    And no crea la cuenta

````

#### US-CR-02 · Verificar correo electrónico

Como usuario recién registrado,
quiero verificar mi correo electrónico haciendo clic en el enlace enviado por MallHub
para poder activar mi cuenta y acceder a todas las funcionalidades.
**Criterios de aceptación (Gherkin)**
````
Feature: Verificación de correo electrónico tras el registro

  Scenario: Verificación exitosa con enlace válido
    Given que el usuario recibió el correo de verificación
    When toca el enlace de verificación dentro del tiempo de vigencia
    Then el sistema activa la cuenta
    And redirige al usuario a la app con la sesión iniciada
    And muestra un mensaje de bienvenida confirmando la activación

  Scenario: Enlace de verificación expirado
    Given que el usuario recibió el correo de verificación
    And el enlace ha superado su tiempo de vigencia
    When toca el enlace expirado
    Then el sistema informa que el enlace ha caducado
    And ofrece la opción de reenviar un nuevo correo de verificación

  Scenario: Reenvío del correo de verificación
    Given que el usuario aún no ha verificado su correo
    And está en la pantalla de espera de verificación en la app
    When toca "Reenviar correo de verificación"
    Then el sistema envía un nuevo correo de verificación
    And muestra un mensaje confirmando el reenvío
    And deshabilita el botón temporalmente para evitar envíos repetidos

  Scenario: El usuario intenta usar la app sin verificar el correo
    Given que el usuario creó una cuenta pero no verificó su correo
    When intenta acceder a una funcionalidad exclusiva de cliente registrado
    Then el sistema muestra un aviso recordándole que debe verificar su correo
    And permite reenviar el correo de verificación desde ese aviso

````

#### US-CR-03 · Iniciar sesión con correo y contraseña

Como cliente registrado,
quiero iniciar sesión con mi correo y contraseña
para poder acceder a mi cuenta y a todas las funcionalidades habilitadas para mi rol.
**Criterios de aceptación (Gherkin)**
````
Feature: Inicio de sesión con correo y contraseña

  Scenario: Inicio de sesión exitoso
    Given que el usuario está en la pantalla de inicio de sesión
    When ingresa un correo y contraseña correctos y verificados
    Then el sistema autentica al usuario
    And lo redirige al Home Feed con su sesión activa

  Scenario: Contraseña incorrecta
    Given que el usuario está en la pantalla de inicio de sesión
    When ingresa un correo válido y una contraseña incorrecta
    Then el sistema muestra un mensaje de error indicando que las credenciales son inválidas
    And no inicia la sesión

  Scenario: Correo no registrado
    Given que el usuario está en la pantalla de inicio de sesión
    When ingresa un correo que no existe en el sistema
    Then el sistema muestra un mensaje indicando que no existe una cuenta con ese correo
    And ofrece la opción de crear una cuenta nueva

  Scenario: Campos de inicio de sesión vacíos
    Given que el usuario está en la pantalla de inicio de sesión
    When intenta iniciar sesión sin completar algún campo
    Then el sistema resalta los campos vacíos con un mensaje de error
    And no intenta la autenticación

  Scenario: Cuenta no verificada
    Given que el usuario creó una cuenta pero no verificó su correo
    When intenta iniciar sesión con sus credenciales correctas
    Then el sistema informa que la cuenta aún no está verificada
    And ofrece la opción de reenviar el correo de verificación

````

#### US-CR-04 · Recuperar contraseña olvidada

Como cliente registrado,
quiero poder recuperar el acceso a mi cuenta si olvidé mi contraseña
para poder restablecer mis credenciales y volver a usar la app.
**Criterios de aceptación (Gherkin)**
````
Feature: Recuperación de contraseña olvidada

  Scenario: Solicitud de recuperación con correo válido y registrado
    Given que el usuario está en la pantalla de recuperación de contraseña
    When ingresa un correo registrado en el sistema
    Then el sistema envía un correo con el enlace para restablecer la contraseña
    And muestra un mensaje confirmando que el correo fue enviado

  Scenario: Solicitud con correo no registrado
    Given que el usuario está en la pantalla de recuperación de contraseña
    When ingresa un correo que no existe en el sistema
    Then el sistema muestra un mensaje informando que no encontró una cuenta con ese correo
    And ofrece la opción de crear una cuenta nueva

  Scenario: Restablecimiento exitoso de contraseña
    Given que el usuario recibió el enlace de restablecimiento
    And el enlace es válido y está vigente
    When el usuario define una nueva contraseña válida y la confirma correctamente
    Then el sistema actualiza la contraseña
    And redirige al usuario a la pantalla de inicio de sesión
    And muestra un mensaje de confirmación

  Scenario: Enlace de restablecimiento expirado
    Given que el usuario recibió el enlace de restablecimiento
    And el enlace ha superado su tiempo de vigencia
    When el usuario intenta acceder al enlace
    Then el sistema informa que el enlace ha caducado
    And ofrece la opción de solicitar uno nuevo

  Scenario: Nueva contraseña no cumple los requisitos
    Given que el usuario accedió al formulario de nueva contraseña con un enlace válido
    When ingresa una contraseña que no cumple los requisitos mínimos
    Then el sistema muestra un mensaje indicando los requisitos que no se cumplen
    And no guarda la nueva contraseña

````

#### US-CR-05 · Cerrar sesión

Como cliente registrado,
quiero poder cerrar mi sesión en la app
para poder proteger mi cuenta cuando comparto el dispositivo con otras personas.
**Criterios de aceptación (Gherkin)**
````
Feature: Cierre de sesión del cliente registrado

  Scenario: Cierre de sesión exitoso
    Given que el usuario tiene una sesión activa
    And está en la sección "Mi cuenta"
    When toca la opción "Cerrar sesión"
    Then el sistema solicita confirmación antes de cerrar la sesión
    And al confirmar, cierra la sesión del usuario
    And redirige al usuario a la pantalla de Splash / Onboarding
    And elimina el token de sesión del dispositivo

  Scenario: El usuario cancela el cierre de sesión
    Given que el usuario está en la confirmación de cierre de sesión
    When toca "Cancelar"
    Then el sistema mantiene la sesión activa
    And regresa al usuario a la sección "Mi cuenta"

  Scenario: Sesión expirada automáticamente
    Given que el token de sesión del usuario expiró por inactividad
    When el usuario intenta realizar cualquier acción que requiere autenticación
    Then el sistema cierra la sesión automáticamente
    And redirige al usuario a la pantalla de inicio de sesión
    And muestra un mensaje informando que la sesión expiró

````

#### US-CR-06 · Completar y editar el perfil personal

Como cliente registrado,
quiero poder completar y editar mi nombre y datos de perfil en la app
para poder tener mi información actualizada y agilizar el flujo de reservas.
**Criterios de aceptación (Gherkin)**
````
Feature: Edición del perfil personal del cliente registrado

  Scenario: Edición exitosa del nombre de perfil
    Given que el usuario está en la sección "Mi cuenta" → "Editar perfil"
    When modifica su nombre y toca "Guardar"
    Then el sistema actualiza el nombre en el perfil
    And muestra un mensaje de confirmación de los cambios guardados

  Scenario: Guardar perfil con nombre vacío
    Given que el usuario está editando su perfil
    When borra el nombre y toca "Guardar"
    Then el sistema muestra un mensaje indicando que el nombre es un campo obligatorio
    And no guarda los cambios

  Scenario: Los datos pre-rellenados en el flujo de reserva reflejan el perfil actualizado
    Given que el usuario actualizó su nombre y teléfono en el perfil
    When inicia un flujo de reserva
    Then el sistema pre-rellena automáticamente los campos de nombre y teléfono con los datos del perfil

````

#### US-CR-07 · Seleccionar y cambiar el mall preferido

Como cliente registrado,
quiero poder definir o cambiar mi mall preferido desde mi cuenta
para poder que el contenido del Home Feed sea siempre relevante para mí.
**Criterios de aceptación (Gherkin)**
````
Feature: Gestión del mall preferido del cliente registrado

  Scenario: El usuario asigna un mall preferido por primera vez
    Given que el usuario nunca ha seleccionado un mall preferido
    And está en la sección "Mi cuenta"
    When selecciona un mall de la lista disponible como favorito
    Then el sistema guarda ese mall como su mall preferido
    And el Home Feed muestra el contenido de ese mall automáticamente al abrir la app

  Scenario: El usuario cambia su mall preferido
    Given que el usuario ya tiene un mall preferido asignado
    And está en la sección "Mi cuenta" → "Cambiar mall favorito"
    When selecciona un mall diferente
    Then el sistema actualiza el mall preferido
    And el Home Feed refleja el contenido del nuevo mall en la próxima carga

  Scenario: El usuario tiene mall preferido pero está lejos de él
    Given que el usuario tiene un mall preferido guardado
    And su ubicación actual está cerca de un mall diferente
    When abre la app
    Then el sistema muestra el mall preferido guardado por defecto
    And ofrece la opción de cambiar al mall cercano detectado por geolocalización

````

#### US-CR-08 · Realizar una reserva Click & Collect (Paso 1 — Confirmar producto)

Como cliente registrado,
quiero iniciar una reserva confirmando el producto, la cantidad y la variante deseada
para poder asegurar el artículo antes de ir al mall a recogerlo.
**Criterios de aceptación (Gherkin)**
````
Feature: Paso 1 del flujo de reserva — Confirmación del producto

  Scenario: El usuario inicia el flujo de reserva con producto disponible
    Given que el usuario registrado está en el detalle de un producto con stock disponible
    When toca el botón "Reservar para recoger"
    Then el sistema muestra el Paso 1 del flujo de reserva
    And muestra el resumen del producto: imagen, nombre, precio y datos de la tienda (nombre, piso, horario)
    And muestra el selector de cantidad con un mínimo de 1

  Scenario: El usuario ajusta la cantidad dentro del stock disponible
    Given que el usuario está en el Paso 1 del flujo de reserva
    When incrementa la cantidad usando el botón "+"
    Then el sistema actualiza la cantidad seleccionada
    And no permite superar el stock disponible informado

  Scenario: El usuario intenta superar el stock disponible
    Given que el usuario está en el Paso 1 del flujo de reserva
    And el stock disponible es 2 unidades
    When intenta incrementar la cantidad a 3 o más
    Then el sistema deshabilita el botón "+" y muestra el máximo permitido

  Scenario: El usuario selecciona una variante del producto
    Given que el producto tiene variantes disponibles (talla, color)
    And el usuario está en el Paso 1 del flujo de reserva
    When selecciona una variante específica
    Then el sistema actualiza el resumen con la variante elegida
    And verifica la disponibilidad de esa variante antes de permitir continuar

  Scenario: La tienda está cerrada al momento de la reserva
    Given que el usuario inicia el flujo de reserva
    And la tienda está actualmente cerrada
    When el Paso 1 carga
    Then el sistema muestra un banner de advertencia indicando que la tienda está cerrada
    And informa que la reserva será procesada al próximo día hábil
    And permite continuar con la reserva bajo esa condición

  Scenario: El usuario toca "Continuar" hacia el Paso 2
    Given que el usuario completó los datos del Paso 1 correctamente
    When toca "Continuar"
    Then el sistema avanza al Paso 2 manteniendo los datos seleccionados
    And el stepper de progreso refleja que el Paso 1 está completado

````

#### US-CR-09 · Realizar una reserva Click & Collect (Paso 2 — Datos de recogida)

Como cliente registrado,
quiero ingresar mis datos de contacto para la recogida
para poder que la tienda pueda comunicarse conmigo y gestionar mi pedido.
**Criterios de aceptación (Gherkin)**
````
Feature: Paso 2 del flujo de reserva — Datos de recogida

  Scenario: Los datos del perfil se pre-rellenan automáticamente
    Given que el usuario tiene nombre y teléfono guardados en su perfil
    And llega al Paso 2 del flujo de reserva
    When la pantalla carga
    Then el sistema pre-rellena el campo de nombre completo y teléfono con los datos del perfil
    And el usuario puede modificarlos si lo desea

  Scenario: El usuario confirma la reserva con datos válidos
    Given que el usuario está en el Paso 2 con nombre y teléfono válidos
    When toca "Confirmar reserva"
    Then el sistema envía la solicitud de reserva a la tienda
    And muestra un indicador de carga mientras procesa

  Scenario: El usuario confirma sin ingresar teléfono
    Given que el usuario está en el Paso 2
    And el campo de teléfono está vacío
    When toca "Confirmar reserva"
    Then el sistema muestra un error indicando que el teléfono es obligatorio
    And no envía la reserva

  Scenario: El usuario agrega una nota opcional para la tienda
    Given que el usuario está en el Paso 2
    When escribe una nota en el campo opcional (máx. 200 caracteres)
    Then el sistema acepta la nota
    And la incluye en la solicitud enviada a la tienda

  Scenario: Intento de reserva duplicada
    Given que el usuario ya tiene una reserva activa del mismo producto
    When llega al Paso 2 e intenta confirmar
    Then el sistema muestra una advertencia indicando que ya existe una reserva activa de ese producto
    And ofrece la opción de ver la reserva existente o continuar con una nueva

  Scenario: Error de red al confirmar la reserva
    Given que el usuario toca "Confirmar reserva"
    And hay un problema de conectividad
    When el sistema falla al enviar la solicitud
    Then muestra un modal de error con la opción "Reintentar"
    And no genera una reserva duplicada al reintentar

  Scenario: El usuario retrocede al Paso 1
    Given que el usuario está en el Paso 2
    When toca el botón "Atrás"
    Then el sistema regresa al Paso 1
    And conserva los datos de cantidad y variante ya seleccionados

````

#### US-CR-10 · Realizar una reserva Click & Collect (Paso 3 — Confirmación exitosa)

Como cliente registrado,
quiero recibir la confirmación de mi reserva con un código QR único
para poder presentarlo en la tienda al momento de recoger mi producto.
**Criterios de aceptación (Gherkin)**
````
Feature: Paso 3 del flujo de reserva — Confirmación exitosa

  Scenario: Confirmación exitosa de la reserva
    Given que la tienda recibió correctamente la solicitud de reserva
    When el sistema confirma el envío
    Then muestra la pantalla de confirmación con una animación de éxito
    And muestra el código QR único de la reserva
    And muestra el resumen: tienda, piso, producto, variante, cantidad y hora estimada de recogida

  Scenario: El usuario consulta sus reservas desde la confirmación
    Given que el usuario está en la pantalla de confirmación exitosa
    When toca "Ver mis reservas"
    Then el sistema navega a la sección "Mis Reservas" con la nueva reserva visible en la pestaña "Activas"

  Scenario: El usuario continúa explorando desde la confirmación
    Given que el usuario está en la pantalla de confirmación exitosa
    When toca "Seguir explorando"
    Then el sistema regresa al Home Feed sin perder el registro de la reserva

  Scenario: El usuario agrega la reserva al calendario del dispositivo
    Given que el usuario está en la pantalla de confirmación exitosa
    When toca "Agregar al calendario"
    Then el sistema abre el diálogo nativo del dispositivo para agregar el evento al calendario
    And el evento incluye: nombre del producto, tienda, piso y hora estimada de recogida

````

#### US-CR-11 · Ver el código QR de una reserva activa

Como cliente registrado,
quiero poder consultar el código QR de mi reserva en cualquier momento
para poder presentarlo en la tienda sin depender de tener el correo o notificación a mano.
**Criterios de aceptación (Gherkin)**
````
Feature: Consulta del código QR de una reserva activa

  Scenario: El usuario accede al QR desde la lista de reservas activas
    Given que el usuario está en la sección "Mis Reservas" → pestaña "Activas"
    When toca una reserva confirmada
    Then el sistema muestra el detalle de esa reserva
    And muestra el código QR único en pantalla completa
    And el QR es de alta resolución y legible en condiciones de poca luz

  Scenario: El usuario recibe una notificación de confirmación de reserva y accede al QR
    Given que la tienda confirmó la disponibilidad del producto reservado
    When el usuario recibe la push notification de confirmación
    And toca la notificación
    Then el sistema navega directamente al detalle de esa reserva con el código QR visible

  Scenario: El usuario intenta acceder al QR de una reserva cancelada
    Given que el usuario tiene una reserva en estado cancelado
    When accede al detalle de esa reserva
    Then el sistema no muestra el código QR
    And muestra el estado "Cancelada" con el motivo si fue proporcionado por la tienda

````

#### US-CR-12 · Ver y gestionar el historial de reservas

Como cliente registrado,
quiero ver todas mis reservas organizadas por estado
para poder hacer seguimiento de mis pedidos actuales e históricos.
**Criterios de aceptación (Gherkin)**
````
Feature: Gestión del historial de reservas del cliente registrado

  Scenario: El usuario accede a la sección Mis Reservas
    Given que el usuario registrado tiene reservas en el sistema
    When navega a "Mi cuenta" → "Mis reservas"
    Then el sistema muestra la sección con tres pestañas: Activas, Completadas y Canceladas

  Scenario: Visualización de reservas activas
    Given que el usuario tiene reservas en estados Pendiente o Confirmada
    When accede a la pestaña "Activas"
    Then el sistema muestra las reservas activas con: producto, tienda, estado y fecha de solicitud

  Scenario: Visualización de reservas completadas
    Given que el usuario tiene reservas marcadas como completadas
    When accede a la pestaña "Completadas"
    Then el sistema muestra el historial de reservas completadas en orden cronológico descendente

  Scenario: Visualización de reservas canceladas
    Given que el usuario tiene reservas canceladas
    When accede a la pestaña "Canceladas"
    Then el sistema muestra las reservas canceladas con el motivo de cancelación si fue proporcionado

  Scenario: No hay reservas en una pestaña
    Given que el usuario no tiene reservas en un estado determinado
    When accede a esa pestaña
    Then el sistema muestra un empty state descriptivo con una sugerencia de acción
    And no muestra errores técnicos

````

#### US-CR-13 · Cancelar una reserva activa

Como cliente registrado,
quiero poder cancelar una reserva que ya no voy a utilizar
para poder liberar el producto para otros compradores y mantener mi historial ordenado.
**Criterios de aceptación (Gherkin)**
````
Feature: Cancelación de reserva activa por el cliente registrado

  Scenario: Cancelación exitosa de una reserva pendiente
    Given que el usuario tiene una reserva en estado "Pendiente"
    And está en el detalle de esa reserva
    When toca "Cancelar reserva"
    Then el sistema solicita confirmación antes de proceder
    And al confirmar, cancela la reserva
    And mueve la reserva a la pestaña "Canceladas"
    And notifica a la tienda de la cancelación

  Scenario: Cancelación exitosa de una reserva confirmada
    Given que el usuario tiene una reserva en estado "Confirmada"
    And está en el detalle de esa reserva
    When toca "Cancelar reserva" y confirma
    Then el sistema cancela la reserva
    And notifica a la tienda
    And mueve la reserva al historial de canceladas

  Scenario: El usuario cancela el proceso de cancelación
    Given que el sistema muestra la confirmación de cancelación
    When el usuario toca "No, volver"
    Then el sistema cierra el modal de confirmación
    And la reserva mantiene su estado original

  Scenario: El usuario intenta cancelar una reserva ya completada
    Given que la reserva está en estado "Completada"
    When el usuario visualiza el detalle
    Then el sistema no muestra la opción "Cancelar reserva"
    And solo muestra las opciones disponibles para ese estado (calificar experiencia)

````

#### US-CR-14 · Calificar una tienda después de recoger un pedido

Como cliente registrado,
quiero poder calificar mi experiencia en una tienda después de recoger mi reserva
para poder compartir mi opinión y ayudar a otros compradores.
**Criterios de aceptación (Gherkin)**
````
Feature: Calificación de tienda post-recogida

  Scenario: El usuario recibe la notificación de calificación post-recogida
    Given que la tienda marcó una reserva como completada
    And han pasado 24 horas desde esa marca
    When el sistema envía la push notification de calificación
    Then la notificación muestra el mensaje: "¿Cómo estuvo tu experiencia en [Tienda]?"
    And presenta una interfaz de 5 estrellas de un solo toque

  Scenario: El usuario califica la experiencia con estrellas
    Given que el usuario está en la pantalla de calificación post-recogida
    When selecciona una puntuación de 1 a 5 estrellas
    Then el sistema registra la calificación
    And muestra un mensaje de agradecimiento
    And no solicita texto adicional ni formularios

  Scenario: El usuario accede a calificar desde el historial de reservas completadas
    Given que el usuario tiene una reserva completada sin calificar
    And está en la pestaña "Completadas" de Mis Reservas
    When toca la reserva
    Then el sistema muestra la opción "Calificar experiencia" en el detalle
    And al tocarla muestra la interfaz de 5 estrellas

  Scenario: El usuario ya calificó esa reserva
    Given que el usuario ya dejó una calificación para una reserva completada
    When accede nuevamente al detalle de esa reserva
    Then el sistema muestra la calificación que ya dejó
    And no permite enviar otra calificación para la misma reserva

  Scenario: El usuario ignora la notificación de calificación
    Given que la notificación de calificación fue enviada
    And el usuario no la atiende
    When accede a la reserva completada después
    Then la opción de calificar sigue disponible en el detalle de la reserva

````

#### US-CR-15 · Guardar una tienda en favoritos

Como cliente registrado,
quiero poder guardar tiendas en mi lista de favoritos
para poder acceder rápidamente a mis locales preferidos del mall.
**Criterios de aceptación (Gherkin)**
````
Feature: Guardar tiendas en favoritos

  Scenario: El usuario guarda una tienda en favoritos desde su perfil
    Given que el usuario registrado está en el perfil de una tienda
    When toca el ícono de favorito (corazón)
    Then el sistema agrega la tienda a su lista de favoritos
    And el ícono cambia visualmente al estado activo (relleno)
    And muestra una confirmación breve (toast o snackbar)

  Scenario: El usuario elimina una tienda de favoritos
    Given que la tienda ya está guardada en favoritos del usuario
    And el usuario está en el perfil de esa tienda
    When toca el ícono de favorito activo
    Then el sistema elimina la tienda de su lista de favoritos
    And el ícono regresa al estado inactivo

  Scenario: La tienda guardada aparece en la sección de Favoritos
    Given que el usuario guardó una o más tiendas
    When accede a la pestaña "Tiendas" en la sección "Favoritos"
    Then el sistema muestra todas las tiendas guardadas con su información actualizada

  Scenario: El estado de stock de la tienda cambia y aparece en favoritos
    Given que el usuario tiene tiendas guardadas en favoritos
    When una de esas tiendas publica una nueva promoción
    Then el sistema puede usar ese evento como trigger de notificación contextual

````

#### US-CR-16 · Guardar un producto en favoritos

Como cliente registrado,
quiero poder guardar productos en mi lista de favoritos
para poder volver a ellos fácilmente y reservarlos cuando esté listo.
**Criterios de aceptación (Gherkin)**
````
Feature: Guardar productos en favoritos

  Scenario: El usuario guarda un producto en favoritos desde el detalle
    Given que el usuario registrado está en el detalle de un producto
    When toca el ícono de favorito del producto
    Then el sistema agrega el producto a su lista de favoritos
    And el ícono cambia al estado activo
    And muestra una confirmación breve

  Scenario: El usuario elimina un producto de favoritos
    Given que el producto está guardado en favoritos
    When el usuario toca el ícono de favorito activo en el detalle del producto
    Then el sistema elimina el producto de su lista de favoritos
    And el ícono regresa al estado inactivo

  Scenario: El usuario visualiza sus productos guardados en la sección Favoritos
    Given que el usuario tiene productos guardados
    When accede a la pestaña "Productos" en la sección "Favoritos"
    Then el sistema muestra todos los productos guardados
    And cada producto indica si está disponible o sin stock

  Scenario: El usuario reserva un producto directamente desde favoritos
    Given que el usuario está en la pestaña "Productos" de Favoritos
    And el producto tiene stock disponible
    When toca "Reservar" en la tarjeta del producto
    Then el sistema inicia el flujo de reserva Click & Collect para ese producto

  Scenario: El usuario intenta reservar un producto sin stock desde favoritos
    Given que un producto guardado en favoritos está sin stock
    When el usuario accede a la sección de Favoritos
    Then el sistema muestra el producto con la etiqueta "Sin stock"
    And el botón de reserva está deshabilitado

````

#### US-CR-17 · Guardar una oferta en favoritos

Como cliente registrado,
quiero poder guardar ofertas de mi interés
para poder consultarlas después sin tener que buscarlas nuevamente.
**Criterios de aceptación (Gherkin)**
````
Feature: Guardar ofertas en favoritos

  Scenario: El usuario guarda una oferta desde la sección de Ofertas
    Given que el usuario registrado está visualizando una oferta
    When toca el ícono o botón "Guardar oferta"
    Then el sistema agrega la oferta a su lista de favoritos
    And muestra una confirmación breve

  Scenario: La oferta guardada aparece en la sección de Favoritos
    Given que el usuario guardó una o más ofertas
    When accede a la pestaña "Ofertas guardadas" en la sección "Favoritos"
    Then el sistema muestra las ofertas guardadas con su fecha de expiración

  Scenario: Una oferta guardada expira
    Given que el usuario tiene una oferta guardada en favoritos
    And la oferta llega a su fecha de expiración
    When el usuario accede a la pestaña "Ofertas guardadas"
    Then el sistema muestra la oferta con un indicador de expiración o la elimina automáticamente
    And no muestra errores técnicos

  Scenario: El usuario elimina una oferta guardada
    Given que el usuario está en la pestaña "Ofertas guardadas"
    When desliza o selecciona la opción de eliminar una oferta
    Then el sistema la elimina de la lista de favoritos
    And actualiza la vista inmediatamente

````

#### US-CR-18 · Activar recordatorio para un evento del mall

Como cliente registrado,
quiero poder activar un recordatorio para un evento del mall
para poder recibir una notificación push antes de que comience y no olvidarlo.
**Criterios de aceptación (Gherkin)**
````
Feature: Activación de recordatorio de evento por cliente registrado

  Scenario: El usuario activa el recordatorio de un evento futuro
    Given que el usuario registrado está en el detalle de un evento próximo
    When toca el botón "Activar recordatorio"
    Then el sistema guarda la preferencia de recordatorio
    And el botón cambia visualmente al estado activo
    And muestra una confirmación indicando que recibirá una notificación

  Scenario: El usuario recibe notificación 24 horas antes del evento
    Given que el usuario activó el recordatorio de un evento
    And faltan 24 horas para que inicie
    When el sistema ejecuta el trigger de recordatorio
    Then el usuario recibe una push notification con el nombre del evento y la hora

  Scenario: El usuario recibe notificación 1 hora antes del evento
    Given que el usuario activó el recordatorio de un evento
    And falta 1 hora para que inicie
    When el sistema ejecuta el trigger de recordatorio
    Then el usuario recibe una push notification urgente con el nombre del evento

  Scenario: El usuario desactiva el recordatorio de un evento
    Given que el usuario tiene el recordatorio activado para un evento
    And está en el detalle de ese evento
    When toca el botón de recordatorio activo
    Then el sistema elimina el recordatorio programado
    And el botón regresa al estado inactivo

  Scenario: El usuario intenta activar recordatorio de un evento ya pasado
    Given que el usuario visualiza un evento cuya fecha ya transcurrió
    When está en el detalle del evento
    Then el sistema no muestra la opción de activar recordatorio
    And el evento se presenta como finalizado

````

#### US-CR-19 · Recibir notificaciones push contextuales

Como cliente registrado,
quiero recibir notificaciones push relevantes según mi contexto y preferencias
para poder enterarme de ofertas y eventos sin tener que abrir la app constantemente.
**Criterios de aceptación (Gherkin)**
````
Feature: Notificaciones push contextuales para cliente registrado

  Scenario: Notificación por proximidad al mall (trigger geográfico)
    Given que el usuario tiene notificaciones habilitadas
    And el usuario entra al radio de 2km del mall activo
    When el sistema detecta la proximidad
    Then envía una push notification con las ofertas activas del día en ese mall

  Scenario: Notificación por cambio de precio de producto en favoritos
    Given que el usuario tiene un producto guardado en favoritos
    And ese producto recibe un descuento
    When el sistema detecta el cambio de precio
    Then envía una push notification informando que el precio bajó en el producto guardado

  Scenario: Notificación por retorno de stock de producto en favoritos
    Given que el usuario tiene un producto guardado en favoritos sin stock
    And la tienda actualiza el stock a disponible
    When el sistema detecta la actualización
    Then envía una push notification informando que el producto volvió a estar disponible

  Scenario: Notificación por nueva promoción de tienda favorita
    Given que el usuario tiene una tienda guardada en favoritos
    And esa tienda publica una nueva promoción
    When el sistema detecta la publicación
    Then envía una push notification con el nombre de la tienda y la oferta publicada

  Scenario: Notificación de confirmación de reserva por la tienda
    Given que una tienda confirmó la disponibilidad de una reserva del usuario
    When el sistema registra la confirmación
    Then envía una push notification indicando que la reserva fue confirmada
    And al tocarla redirige al detalle de la reserva con el código QR

````

#### US-CR-20 · Gestionar preferencias de notificaciones

Como cliente registrado,
quiero poder activar o desactivar los tipos de notificaciones push que recibo
para poder controlar cuáles alertas me son útiles y evitar las que no me interesan.
**Criterios de aceptación (Gherkin)**
````
Feature: Gestión de preferencias de notificaciones push

  Scenario: El usuario accede a las preferencias de notificaciones
    Given que el usuario está en la sección "Mi cuenta"
    When toca "Notificaciones"
    Then el sistema muestra la pantalla de preferencias con los tipos de notificación disponibles
    And cada tipo tiene un toggle que refleja su estado actual (activo/inactivo)

  Scenario: El usuario desactiva las notificaciones de ofertas
    Given que el usuario está en la pantalla de preferencias de notificaciones
    When desactiva el toggle de "Ofertas y promociones"
    Then el sistema guarda la preferencia
    And el usuario deja de recibir notificaciones de ese tipo

  Scenario: El usuario desactiva las notificaciones de reservas
    Given que el usuario está en la pantalla de preferencias de notificaciones
    When desactiva el toggle de "Estado de mis reservas"
    Then el sistema muestra una advertencia indicando que podría perder notificaciones importantes sobre sus pedidos
    And permite al usuario confirmar o revertir el cambio

  Scenario: El usuario activa un tipo de notificación desactivado
    Given que el usuario tiene un tipo de notificación desactivado
    When activa el toggle correspondiente
    Then el sistema guarda la preferencia
    And el usuario comienza a recibir ese tipo de notificación nuevamente

  Scenario: El permiso de notificaciones del dispositivo está desactivado
    Given que el sistema operativo del dispositivo tiene bloqueados los permisos de notificaciones para la app
    When el usuario accede a la pantalla de preferencias de notificaciones
    Then el sistema muestra un banner informando que las notificaciones están bloqueadas a nivel de sistema
    And ofrece un botón para ir directamente a la configuración del dispositivo

````

#### US-CR-21 · Ver la sección de Favoritos completa

Como cliente registrado,
quiero acceder a una sección unificada con todas mis tiendas, productos y ofertas guardadas
para poder consultarlos en un solo lugar sin tener que buscarlos de nuevo.
**Criterios de aceptación (Gherkin)**
````
Feature: Visualización de la sección Favoritos del cliente registrado

  Scenario: El usuario accede a la sección Favoritos con contenido guardado
    Given que el usuario tiene tiendas, productos u ofertas guardadas
    When toca el tab "Favoritos" en la barra de navegación inferior
    Then el sistema muestra la sección con tres pestañas: Tiendas, Productos, Ofertas guardadas
    And cada pestaña muestra el contenido correspondiente

  Scenario: El usuario accede a la sección Favoritos sin nada guardado
    Given que el usuario nunca ha guardado ningún elemento
    When toca el tab "Favoritos"
    Then el sistema muestra un empty state en cada pestaña con una sugerencia de acción concreta
    And invita al usuario a explorar el directorio para guardar contenido

  Scenario: El usuario navega desde favoritos al perfil de una tienda guardada
    Given que el usuario está en la pestaña "Tiendas" de Favoritos
    When toca la tarjeta de una tienda guardada
    Then el sistema navega al perfil de esa tienda

  Scenario: El usuario navega desde favoritos al detalle de un producto guardado
    Given que el usuario está en la pestaña "Productos" de Favoritos
    When toca la tarjeta de un producto guardado
    Then el sistema navega al detalle de ese producto

````

#### US-CR-22 · Accesibilidad — Alto contraste y tamaño de fuente

Como cliente registrado con necesidades de accesibilidad visual,
quiero poder ajustar el contraste y el tamaño de fuente desde la configuración de la app
para poder usar MallHub de forma cómoda sin depender solo de la configuración del sistema operativo.
**Criterios de aceptación (Gherkin)**
````
Feature: Accesibilidad visual para cliente registrado

  Scenario: El usuario activa el modo de alto contraste desde la app
    Given que el usuario está en la sección "Mi cuenta" → "Configuración"
    When activa la opción "Modo alto contraste"
    Then el sistema aplica la paleta de alto contraste en toda la app
    And la preferencia se mantiene activa en sesiones futuras

  Scenario: El usuario aumenta el tamaño de fuente desde la configuración del SO
    Given que el usuario incrementó el tamaño de fuente en la configuración del dispositivo (iOS/Android)
    When abre la app MallHub
    Then el sistema respeta el tamaño de fuente del sistema operativo
    And los textos se escalan sin truncarse ni superponerse en los layouts principales

  Scenario: El sistema respeta la configuración de accesibilidad del SO al iniciar sesión
    Given que el dispositivo tiene activado VoiceOver (iOS) o TalkBack (Android)
    When el usuario inicia sesión y navega por la app
    Then todos los elementos interactivos (botones, campos, tabs) tienen etiquetas de accesibilidad
    And el orden de foco del lector de pantalla es lógico y coherente con la jerarquía visual

````

#### US-AL-01 · Registrar la tienda en la plataforma

Como administrador de un local comercial,
quiero crear una cuenta y registrar mi tienda en MallHub
para poder obtener presencia digital dentro del ecosistema del mall y llegar a compradores antes de que visiten el local.
**Criterios de aceptación (Gherkin)**
````
Feature: Registro de tienda en MallHub Store

  Scenario: Registro exitoso con correo y contraseña
    Given que el administrador accede a mallhub.app/tiendas
    When completa el formulario con un correo válido y una contraseña que cumple los requisitos
    And confirma la contraseña correctamente
    Then el sistema crea la cuenta
    And envía un correo de verificación a la dirección proporcionada
    And redirige al administrador a la pantalla de espera de verificación

  Scenario: Registro con correo ya existente
    Given que el correo ingresado ya está registrado en el sistema
    When el administrador intenta crear la cuenta con ese correo
    Then el sistema muestra un mensaje indicando que ya existe una cuenta con ese correo
    And ofrece la opción de iniciar sesión o recuperar contraseña

  Scenario: Registro con campos obligatorios vacíos
    Given que el administrador está en el formulario de registro
    When intenta continuar sin completar todos los campos obligatorios
    Then el sistema resalta los campos vacíos con mensajes de error descriptivos
    And no crea la cuenta

  Scenario: Contraseñas no coinciden en el registro
    Given que el administrador completa el formulario de registro
    When ingresa una contraseña y una confirmación diferente
    Then el sistema muestra un error indicando que las contraseñas no coinciden
    And no crea la cuenta

````

#### US-AL-02 · Completar el perfil de la tienda durante el onboarding

Como administrador de local recién registrado,
quiero completar el perfil de mi tienda con nombre, categoría, piso, horarios y datos de contacto
para poder enviarlo a revisión y que aparezca activo en el directorio del mall.
**Criterios de aceptación (Gherkin)**
````
Feature: Completar perfil de tienda en el onboarding

  Scenario: Onboarding completado exitosamente con todos los datos obligatorios
    Given que el administrador verificó su correo y accede al panel por primera vez
    When completa todos los campos obligatorios: nombre, categoría, piso, número de local y horarios
    And sube el logo de la tienda
    And selecciona el mall al que pertenece su local
    And toca "Enviar para revisión"
    Then el sistema envía el perfil al Administrador del Mall para aprobación
    And muestra un mensaje confirmando que la solicitud fue enviada
    And informa que la revisión toma menos de 24 horas

  Scenario: Intento de enviar el perfil sin campos obligatorios
    Given que el administrador está en el formulario de onboarding
    When intenta enviar el perfil sin completar algún campo obligatorio
    Then el sistema resalta los campos faltantes con mensajes de error
    And no envía la solicitud de revisión

  Scenario: El mall al que pertenece la tienda no está en la lista
    Given que el administrador no encuentra su mall en la lista disponible
    When toca la opción "Mi mall no está en la lista"
    Then el sistema muestra un formulario para solicitar la incorporación del mall
    And confirma que el equipo MallHub revisará la solicitud

  Scenario: El sistema guía al siguiente paso tras el envío
    Given que el administrador envió el perfil para revisión
    When la pantalla de confirmación carga
    Then el sistema muestra el estado "En revisión"
    And ofrece el siguiente paso sugerido: preparar el catálogo de productos
    And el administrador puede empezar a cargar productos aunque la aprobación esté pendiente

````

#### US-AL-03 · Iniciar sesión en MallHub Store

Como administrador de local,
quiero iniciar sesión en MallHub Store desde el escritorio
para poder acceder al panel de gestión de mi tienda.
**Criterios de aceptación (Gherkin)**
````
Feature: Inicio de sesión del Admin Local en MallHub Store

  Scenario: Inicio de sesión exitoso
    Given que el administrador está en la pantalla de inicio de sesión de MallHub Store
    When ingresa un correo y contraseña correctos y verificados
    Then el sistema autentica al administrador
    And lo redirige al Dashboard de la tienda

  Scenario: Credenciales incorrectas
    Given que el administrador está en la pantalla de inicio de sesión
    When ingresa un correo o contraseña incorrectos
    Then el sistema muestra un mensaje de error indicando que las credenciales son inválidas
    And no inicia la sesión

  Scenario: Cuenta no verificada
    Given que el administrador creó una cuenta pero no verificó su correo
    When intenta iniciar sesión con sus credenciales correctas
    Then el sistema informa que la cuenta aún no está verificada
    And ofrece la opción de reenviar el correo de verificación

  Scenario: Cuenta pendiente de aprobación
    Given que la tienda del administrador fue enviada a revisión pero aún no fue aprobada
    When inicia sesión correctamente
    Then el sistema permite acceder al panel
    And muestra un banner informando que la tienda está en revisión y aún no es visible para compradores

````

#### US-AL-04 · Recuperar contraseña olvidada

Como administrador de local,
quiero recuperar el acceso a mi cuenta si olvidé mi contraseña
para poder volver a gestionar mi tienda sin necesidad de contactar soporte.
**Criterios de aceptación (Gherkin)**
````
Feature: Recuperación de contraseña del Admin Local

  Scenario: Solicitud de recuperación con correo válido registrado
    Given que el administrador está en la pantalla de recuperación de contraseña
    When ingresa el correo asociado a su cuenta
    Then el sistema envía un enlace de restablecimiento a ese correo
    And muestra un mensaje confirmando el envío

  Scenario: Restablecimiento exitoso de contraseña
    Given que el administrador accedió al enlace de restablecimiento vigente
    When define una nueva contraseña válida y la confirma
    Then el sistema actualiza la contraseña
    And redirige al administrador a la pantalla de inicio de sesión con un mensaje de confirmación

  Scenario: Enlace de restablecimiento expirado
    Given que el enlace de restablecimiento superó su tiempo de vigencia
    When el administrador intenta acceder al enlace
    Then el sistema informa que el enlace expiró
    And ofrece solicitar un nuevo enlace

  Scenario: Correo no registrado en el sistema
    Given que el administrador ingresa un correo que no existe en el sistema
    When solicita la recuperación
    Then el sistema muestra un mensaje indicando que no hay cuenta con ese correo
    And sugiere crear una cuenta nueva

````

#### US-AL-05 · Ver el dashboard de la tienda

Como administrador de local,
quiero ver un resumen de los KPIs y la actividad reciente de mi tienda
para poder tomar decisiones rápidas sobre stock, catálogo y atención de reservas en el día a día.
**Criterios de aceptación (Gherkin)**
````
Feature: Visualización del dashboard del Admin Local

  Scenario: Dashboard carga con datos del período activo
    Given que el administrador inició sesión correctamente
    When accede a la sección "Dashboard"
    Then el sistema muestra las métricas del período: visitas al perfil, productos vistos, reservas recibidas y reservas completadas
    And muestra la gráfica de actividad semanal
    And muestra las últimas 5 reservas recibidas

  Scenario: Dashboard muestra alerta de productos sin stock
    Given que uno o más productos tienen stock agotado
    When el administrador accede al dashboard
    Then el sistema muestra una alerta destacada indicando los productos con stock en cero
    And ofrece acceso directo a la pantalla de edición de ese producto

  Scenario: El administrador navega al módulo de reservas desde el dashboard
    Given que el administrador visualiza las últimas reservas en el dashboard
    When toca "Ir a gestión de reservas"
    Then el sistema navega a la sección T-04 Gestión de Reservas

  Scenario: El administrador navega al catálogo desde el dashboard
    Given que el administrador está en el dashboard
    When toca "Ver catálogo completo"
    Then el sistema navega a la sección T-02 Mi Catálogo

  Scenario: Dashboard sin datos por ser una tienda nueva
    Given que la tienda fue aprobada recientemente y no tiene actividad registrada
    When el administrador accede al dashboard
    Then el sistema muestra los KPIs en cero con mensajes orientativos
    And sugiere como primer paso publicar productos en el catálogo

````

#### US-AL-06 · Ver y filtrar el catálogo de productos

Como administrador de local,
quiero ver todos los productos publicados en mi catálogo y poder filtrarlos por categoría y disponibilidad
para poder tener una visión clara del estado de mi inventario digital en un solo lugar.
**Criterios de aceptación (Gherkin)**
````
Feature: Visualización y filtrado del catálogo de productos

  Scenario: Catálogo carga con productos publicados
    Given que el administrador accede a la sección "Mi Catálogo"
    When la pantalla carga
    Then el sistema muestra todos los productos de la tienda en un grid
    And cada tarjeta muestra: imagen, nombre, precio y estado (activo / inactivo / sin stock)

  Scenario: Filtrar productos por categoría
    Given que el administrador está en "Mi Catálogo"
    When aplica el filtro de categoría "Ropa"
    Then el sistema muestra únicamente los productos de esa categoría
    And actualiza el contador de resultados

  Scenario: Filtrar productos por disponibilidad
    Given que el administrador está en "Mi Catálogo"
    When aplica el filtro "Sin stock"
    Then el sistema muestra únicamente los productos con disponibilidad agotada

  Scenario: Buscar un producto por nombre
    Given que el administrador está en "Mi Catálogo"
    When escribe un término en la barra de búsqueda
    Then el sistema muestra los productos cuyo nombre coincide con el término
    And actualiza los resultados en tiempo real

  Scenario: Catálogo vacío por primera vez
    Given que el administrador aún no ha publicado ningún producto
    When accede a "Mi Catálogo"
    Then el sistema muestra un empty state indicando que no hay productos
    And ofrece un botón directo para agregar el primer producto

````

#### US-AL-07 · Agregar un nuevo producto al catálogo

Como administrador de local,
quiero agregar un producto nuevo con imágenes, precio, descripción y disponibilidad
para poder que los compradores puedan verlo y reservarlo desde la app.
**Criterios de aceptación (Gherkin)**
````
Feature: Agregar nuevo producto al catálogo

  Scenario: Publicación exitosa de un producto con datos completos
    Given que el administrador está en el formulario "Agregar producto"
    When sube al menos una imagen del producto
    And completa los campos obligatorios: nombre, precio, descripción y categoría
    And activa el toggle "Disponible para reserva"
    And toca "Publicar producto"
    Then el sistema publica el producto
    And lo hace visible en el catálogo público de la tienda en la app
    And muestra una confirmación de publicación exitosa

  Scenario: Subida de imágenes del producto (hasta 5)
    Given que el administrador está en el formulario de agregar producto
    When sube imágenes mediante drag & drop o selección de archivos
    Then el sistema acepta hasta 5 imágenes
    And muestra una vista previa de cada imagen subida
    And muestra un error si se intenta subir una sexta imagen

  Scenario: Intento de publicar sin nombre o precio
    Given que el administrador está en el formulario de agregar producto
    When intenta publicar sin completar el nombre o el precio
    Then el sistema resalta los campos faltantes con mensajes de error
    And no publica el producto

  Scenario: El administrador guarda el producto como borrador
    Given que el administrador completó parte del formulario pero no está listo para publicar
    When toca "Guardar borrador"
    Then el sistema guarda el producto en estado borrador
    And lo muestra en el catálogo con estado "Inactivo"
    And no lo hace visible para los compradores

  Scenario: Vista previa del producto antes de publicar
    Given que el administrador completó el formulario de un producto
    When revisa el panel de vista previa
    Then el sistema muestra cómo se verá el producto en la app del comprador en tiempo real
    And la vista previa se actualiza automáticamente al modificar los campos

  Scenario: Precio inválido (cero o negativo)
    Given que el administrador está completando el formulario de producto
    When ingresa un precio de cero o un valor negativo
    Then el sistema muestra un error indicando que el precio debe ser mayor a cero
    And no permite publicar el producto con ese valor

````

#### US-AL-08 · Agregar variantes a un producto

Como administrador de local,
quiero definir variantes de talla y color para un producto
para poder que los compradores vean las opciones disponibles y elijan antes de reservar.
**Criterios de aceptación (Gherkin)**
````
Feature: Gestión de variantes de un producto

  Scenario: El administrador agrega variantes de talla a un producto
    Given que el administrador está en el formulario de agregar o editar producto
    When toca "Agregar variante" y selecciona el tipo "Talla"
    And define los valores (S, M, L, XL)
    Then el sistema agrega las variantes al producto
    And las muestra como opciones disponibles en la vista previa

  Scenario: El administrador agrega variantes de color a un producto
    Given que el administrador está en el formulario de producto
    When toca "Agregar variante" y selecciona el tipo "Color"
    And define los colores disponibles (Rojo, Azul, Negro)
    Then el sistema agrega las variantes de color al producto

  Scenario: El administrador elimina una variante existente
    Given que el producto tiene variantes definidas
    When el administrador elimina una variante específica
    Then el sistema la remueve del producto
    And actualiza la vista previa sin esa variante

  Scenario: Publicar producto sin variantes
    Given que el administrador no define variantes para un producto
    When publica el producto
    Then el sistema lo publica correctamente sin variantes
    And el selector de variantes no aparece en la vista del comprador

````

#### US-AL-09 · Agregar precio con descuento a un producto

Como administrador de local,
quiero poder definir un precio con descuento para un producto además del precio original
para poder comunicar la oferta visualmente a los compradores desde el catálogo.
**Criterios de aceptación (Gherkin)**
````
Feature: Precio con descuento en producto del catálogo

  Scenario: El administrador agrega un precio con descuento válido
    Given que el administrador está en el formulario de producto
    When ingresa un precio con descuento menor al precio original
    Then el sistema acepta el precio con descuento
    And la vista previa muestra ambos precios: el original tachado y el de descuento destacado

  Scenario: El precio con descuento es mayor o igual al precio original
    Given que el administrador está ingresando el precio con descuento
    When ingresa un valor mayor o igual al precio original
    Then el sistema muestra un error indicando que el precio con descuento debe ser menor al precio original
    And no permite guardar con ese valor

  Scenario: El administrador elimina el precio con descuento
    Given que el producto tiene un precio con descuento activo
    When el administrador borra el campo de descuento y guarda
    Then el sistema elimina el descuento
    And la vista del comprador muestra únicamente el precio original

````

#### US-AL-10 · Editar un producto existente del catálogo

Como administrador de local,
quiero poder editar la información de un producto ya publicado
para poder mantener los datos, precios e imágenes actualizados en la app.
**Criterios de aceptación (Gherkin)**
````
Feature: Edición de producto existente en el catálogo

  Scenario: El administrador edita el nombre y precio de un producto
    Given que el administrador está en "Mi Catálogo"
    When toca la opción "Editar" en un producto existente
    And modifica el nombre y el precio
    And toca "Guardar cambios"
    Then el sistema actualiza el producto
    And los cambios se reflejan en la app del comprador en tiempo real

  Scenario: El administrador reemplaza una imagen del producto
    Given que el administrador está editando un producto
    When elimina una imagen existente y sube una nueva
    Then el sistema actualiza la galería del producto
    And la nueva imagen aparece en la vista previa

  Scenario: El administrador edita un producto sin cambios y guarda
    Given que el administrador abre un producto para editar pero no modifica nada
    When toca "Guardar cambios"
    Then el sistema guarda sin error
    And el producto permanece con sus datos originales

  Scenario: El administrador descarta los cambios de edición
    Given que el administrador modificó campos de un producto
    When toca "Cancelar" sin guardar
    Then el sistema solicita confirmación antes de descartar los cambios
    And al confirmar, cierra el formulario sin guardar
    And el producto conserva sus datos anteriores

````

#### US-AL-11 · Activar o desactivar un producto del catálogo

Como administrador de local,
quiero poder activar o desactivar la visibilidad de un producto sin eliminarlo
para poder ocultar temporalmente artículos sin perder su información.
**Criterios de aceptación (Gherkin)**
````
Feature: Activación y desactivación de productos del catálogo

  Scenario: El administrador desactiva un producto activo
    Given que el administrador está en "Mi Catálogo"
    And el producto tiene estado "Activo"
    When toca la opción "Desactivar" en ese producto
    Then el sistema cambia el estado del producto a "Inactivo"
    And el producto deja de ser visible para los compradores en la app
    And permanece visible en el catálogo del panel de administración

  Scenario: El administrador activa un producto inactivo
    Given que el producto tiene estado "Inactivo"
    When el administrador toca la opción "Activar"
    Then el sistema cambia el estado a "Activo"
    And el producto vuelve a ser visible para los compradores en la app

  Scenario: El administrador desactiva un producto con reservas activas
    Given que el producto tiene reservas en estado "Pendiente" o "Confirmada"
    When el administrador intenta desactivarlo
    Then el sistema muestra una advertencia indicando que existen reservas activas para ese producto
    And permite al administrador confirmar o cancelar la desactivación
    And si confirma, el producto se desactiva pero las reservas activas no se cancelan automáticamente

````

#### US-AL-12 · Actualizar la disponibilidad de stock de un producto

Como administrador de local,
quiero poder cambiar rápidamente el estado de stock de un producto entre "disponible" y "sin stock"
para poder evitar que los compradores intenten reservar artículos que ya no tengo.
**Criterios de aceptación (Gherkin)**
````
Feature: Actualización de disponibilidad de stock

  Scenario: El administrador marca un producto como "Sin stock"
    Given que el administrador está en "Mi Catálogo"
    And el producto tiene disponibilidad "Disponible"
    When activa el toggle "Sin stock" en ese producto
    Then el sistema actualiza el estado del producto a "Sin stock"
    And el botón de reserva se deshabilita para ese producto en la app del comprador
    And el producto sigue visible en el catálogo con la etiqueta "Sin stock"

  Scenario: El administrador restaura el stock de un producto
    Given que el producto está marcado como "Sin stock"
    When el administrador activa el toggle "Disponible para reserva"
    Then el sistema actualiza el estado a "Disponible"
    And el botón de reserva vuelve a habilitarse para ese producto en la app

  Scenario: Alerta de stock agotado en el dashboard
    Given que uno o más productos fueron marcados como "Sin stock"
    When el administrador accede al dashboard
    Then el sistema muestra una alerta con los productos que tienen stock agotado
    And ofrece acceso directo a la edición de cada producto alertado

````

#### US-AL-13 · Duplicar un producto del catálogo

Como administrador de local,
quiero poder duplicar un producto existente para crear uno nuevo basado en él
para poder agilizar la carga de productos similares sin repetir todo el formulario.
**Criterios de aceptación (Gherkin)**
````
Feature: Duplicación de producto en el catálogo

  Scenario: El administrador duplica un producto exitosamente
    Given que el administrador está en "Mi Catálogo"
    When toca la opción "Duplicar" en un producto existente
    Then el sistema crea una copia del producto con el nombre "Copia de [nombre original]"
    And la copia tiene estado "Inactivo" por defecto
    And abre automáticamente el formulario de edición de la copia para que el administrador ajuste los datos

  Scenario: El administrador edita y publica el producto duplicado
    Given que el sistema creó una copia de un producto
    And el administrador actualizó el nombre, precio o imágenes de la copia
    When toca "Publicar producto"
    Then el sistema publica la copia como un producto independiente
    And el producto original no se ve afectado por los cambios de la copia

````

#### US-AL-14 · Eliminar un producto del catálogo

Como administrador de local,
quiero poder eliminar definitivamente un producto de mi catálogo
para poder mantener el inventario digital limpio y sin artículos obsoletos.
**Criterios de aceptación (Gherkin)**
````
Feature: Eliminación de producto del catálogo

  Scenario: El administrador elimina un producto sin reservas activas
    Given que el administrador está en "Mi Catálogo"
    And el producto no tiene reservas en estado Pendiente o Confirmada
    When toca la opción "Eliminar" en ese producto
    Then el sistema solicita confirmación antes de proceder
    And al confirmar, elimina el producto permanentemente
    And el producto deja de aparecer en el catálogo público y en el panel de administración

  Scenario: El administrador intenta eliminar un producto con reservas activas
    Given que el producto tiene reservas en estado "Pendiente" o "Confirmada"
    When el administrador toca "Eliminar"
    Then el sistema muestra una advertencia indicando que el producto tiene reservas activas
    And bloquea la eliminación hasta que las reservas sean resueltas (confirmadas, completadas o canceladas)

  Scenario: El administrador cancela la eliminación
    Given que el sistema muestra la confirmación de eliminación
    When el administrador toca "Cancelar"
    Then el sistema cierra el diálogo de confirmación
    And el producto permanece en el catálogo sin cambios

````

#### US-AL-15 · Recibir notificación de nueva reserva

Como administrador de local,
quiero recibir una notificación inmediata cuando un comprador realiza una reserva de uno de mis productos
para poder atenderla a tiempo y confirmar o rechazar la disponibilidad.
**Criterios de aceptación (Gherkin)**
````
Feature: Notificación de nueva reserva al Admin Local

  Scenario: El administrador recibe notificación de una nueva reserva
    Given que un comprador completó el flujo de reserva para un producto de la tienda
    When el sistema registra la nueva reserva
    Then envía una notificación al administrador indicando: "Nueva reserva de [Producto] por [Nombre cliente]"
    And el badge de la sección "Reservas" en el panel muestra un contador con las reservas nuevas

  Scenario: El administrador accede al panel de reservas desde la notificación
    Given que el administrador recibió la notificación de una nueva reserva
    When toca la notificación
    Then el sistema navega directamente al detalle de esa reserva en el panel de gestión

  Scenario: La notificación llega fuera del horario de la tienda
    Given que la tienda está fuera de su horario de atención
    And un comprador genera una reserva en ese momento
    When el sistema registra la reserva
    Then la notificación se envía igualmente al administrador
    And la reserva queda en estado "Pendiente" hasta que el administrador la gestione

````

#### US-AL-16 · Ver y filtrar las reservas recibidas

Como administrador de local,
quiero ver todas las reservas de mi tienda organizadas por estado con opción de filtrado
para poder gestionar eficientemente la bandeja de pedidos sin perder ninguna solicitud.
**Criterios de aceptación (Gherkin)**
````
Feature: Visualización y filtrado de reservas del Admin Local

  Scenario: El administrador accede al panel de reservas
    Given que el administrador está en MallHub Store
    When navega a la sección "Reservas"
    Then el sistema muestra las reservas organizadas en 4 pestañas: Nuevas, En curso, Completadas y Canceladas
    And la pestaña "Nuevas" muestra un badge rojo con el conteo de reservas pendientes sin atender

  Scenario: Visualización de tarjeta de reserva con información completa
    Given que el administrador está en la pestaña "Nuevas"
    When visualiza una tarjeta de reserva
    Then la tarjeta muestra: imagen del producto (48x48), nombre del producto, variante seleccionada, nombre del cliente, teléfono de contacto, fecha y hora de la solicitud, y el StatusBadge "Pendiente"

  Scenario: Filtrar reservas por fecha
    Given que el administrador está en la sección de Reservas
    When aplica el filtro de fecha para un rango específico
    Then el sistema muestra únicamente las reservas cuya fecha de solicitud está dentro del rango

  Scenario: Filtrar reservas por producto
    Given que el administrador tiene múltiples productos con reservas
    When aplica el filtro por producto
    Then el sistema muestra únicamente las reservas del producto seleccionado

  Scenario: No hay reservas nuevas
    Given que la tienda no tiene reservas pendientes
    When el administrador accede a la pestaña "Nuevas"
    Then el sistema muestra un empty state indicando que no hay reservas nuevas
    And no muestra errores técnicos

````

#### US-AL-17 · Confirmar una reserva pendiente

Como administrador de local,
quiero confirmar la disponibilidad de una reserva pendiente
para poder notificar al comprador que su producto está listo para recoger.
**Criterios de aceptación (Gherkin)**
````
Feature: Confirmación de reserva pendiente por el Admin Local

  Scenario: El administrador confirma una reserva con stock disponible
    Given que el administrador está en el detalle de una reserva en estado "Pendiente"
    When toca el botón "Confirmar"
    Then el sistema cambia el estado de la reserva a "Confirmada"
    And mueve la reserva a la pestaña "En curso"
    And envía automáticamente una push notification al comprador con el código QR de recogida

  Scenario: El administrador confirma una reserva con reservas múltiples del mismo producto
    Given que varios compradores reservaron el mismo producto
    And solo hay stock para atender algunas
    When el administrador confirma una de ellas
    Then el sistema actualiza el estado de esa reserva a "Confirmada"
    And las otras permanecen en estado "Pendiente" para que el administrador las gestione individualmente

  Scenario: Indicador de urgencia en reservas próximas a expirar
    Given que una reserva lleva tiempo sin ser atendida y está próxima a expirar
    When el administrador visualiza la lista de reservas
    Then el sistema muestra un indicador de urgencia en esa tarjeta destacándola visualmente

````

#### US-AL-18 · Rechazar una reserva con motivo

Como administrador de local,
quiero poder rechazar una reserva pendiente indicando el motivo
para poder informar al comprador con claridad y que pueda tomar una decisión alternativa.
**Criterios de aceptación (Gherkin)**
````
Feature: Rechazo de reserva con motivo por el Admin Local

  Scenario: El administrador rechaza una reserva indicando el motivo
    Given que el administrador está en el detalle de una reserva en estado "Pendiente"
    When toca el botón "Rechazar"
    Then el sistema muestra un campo obligatorio para ingresar el motivo del rechazo
    And al confirmar, cambia el estado de la reserva a "Cancelada"
    And mueve la reserva a la pestaña "Canceladas"
    And notifica al comprador informando que su reserva fue rechazada junto con el motivo

  Scenario: Intento de rechazar sin ingresar motivo
    Given que el administrador está en el diálogo de rechazo
    When toca "Confirmar rechazo" sin ingresar un motivo
    Then el sistema muestra un error indicando que el motivo es obligatorio
    And no rechaza la reserva hasta que se complete el campo

  Scenario: El administrador cancela el proceso de rechazo
    Given que el diálogo de rechazo está abierto
    When el administrador toca "Cancelar"
    Then el sistema cierra el diálogo
    And la reserva permanece en estado "Pendiente"

````

#### US-AL-19 · Marcar una reserva como completada

Como administrador de local,
quiero marcar una reserva como completada cuando el comprador recoge su producto en el local
para poder cerrar el ciclo de la reserva y mantener el historial actualizado.
**Criterios de aceptación (Gherkin)**
````
Feature: Cierre de ciclo de reserva — Marcar como completada

  Scenario: El administrador verifica el QR y marca la reserva como completada
    Given que el comprador llegó a la tienda con su código QR
    And la reserva está en estado "Confirmada"
    When el administrador verifica el código QR del comprador
    And toca "Marcar como completada"
    Then el sistema cambia el estado de la reserva a "Completada"
    And mueve la reserva a la pestaña "Completadas"
    And programa el envío de la notificación de calificación al comprador (24 horas después)

  Scenario: El administrador marca como completada verificando el código manualmente
    Given que el sistema de escaneo no está disponible
    And el comprador muestra su código de reserva en texto
    When el administrador verifica el código manualmente y toca "Marcar como completada"
    Then el sistema completa la reserva de la misma forma que con QR

  Scenario: Intento de marcar como completada una reserva aún pendiente
    Given que la reserva está en estado "Pendiente" y no ha sido confirmada
    When el administrador intenta marcarla como completada
    Then el sistema bloquea la acción
    And muestra un mensaje indicando que debe confirmar la reserva antes de completarla

````

#### US-AL-20 · Editar el perfil público de la tienda

Como administrador de local,
quiero editar la información pública de mi tienda: nombre, descripción, categorías, horarios, logo e imágenes
para poder mantener mi perfil actualizado y generar confianza en los compradores.
**Criterios de aceptación (Gherkin)**
````
Feature: Edición del perfil público de la tienda

  Scenario: El administrador actualiza los horarios de atención
    Given que el administrador está en la sección "Perfil de la Tienda"
    When modifica los horarios de apertura y cierre
    And toca "Guardar cambios"
    Then el sistema actualiza los horarios en el perfil público
    And los nuevos horarios se reflejan en la app del comprador

  Scenario: El administrador sube un nuevo logo
    Given que el administrador está en la sección de perfil de la tienda
    When sube una nueva imagen como logo
    Then el sistema la procesa y la muestra como el logo de la tienda
    And el logo actualizado aparece en el directorio y perfil de la tienda en la app

  Scenario: El administrador actualiza las imágenes del local
    Given que el administrador está en la sección de perfil de la tienda
    When agrega o reemplaza imágenes del local
    Then el sistema acepta las nuevas imágenes
    And las muestra en el perfil público de la tienda en la app

  Scenario: El administrador verifica la vista previa del perfil antes de guardar
    Given que el administrador modificó algún campo del perfil
    When toca "Ver preview en la app"
    Then el sistema muestra cómo se verá el perfil actualizado desde la perspectiva del comprador
    And el administrador puede confirmar o seguir editando

  Scenario: Guardar perfil sin nombre de tienda
    Given que el administrador borró el nombre de la tienda en el formulario
    When intenta guardar los cambios
    Then el sistema muestra un error indicando que el nombre de la tienda es un campo obligatorio
    And no guarda los cambios

````

#### US-AL-21 · Publicar una promoción u oferta flash

Como administrador de local,
quiero crear y publicar una promoción o una oferta flash en la app
para poder comunicar mis descuentos y atraer compradores antes de que visiten el mall.
**Criterios de aceptación (Gherkin)**
````
Feature: Publicación de promoción u oferta flash por el Admin Local

  Scenario: El administrador publica una promoción estándar
    Given que el administrador está en la sección "Promociones"
    When toca "Nueva promoción"
    And completa: título, descripción, imagen, tipo de promoción y fecha de expiración
    And toca "Publicar"
    Then el sistema publica la promoción
    And esta aparece en la sección de Ofertas de la app del comprador

  Scenario: El administrador publica una oferta flash con contador de tiempo
    Given que el administrador está creando una nueva promoción
    When selecciona el tipo "Oferta flash"
    And define la hora de inicio y fin de la oferta
    Then el sistema publica la oferta con un contador regresivo visible para los compradores
    And la oferta expira automáticamente al llegar la hora de fin

  Scenario: Intento de publicar una promoción sin fecha de expiración
    Given que el administrador está en el formulario de nueva promoción
    When intenta publicar sin definir una fecha de expiración
    Then el sistema muestra un error indicando que la fecha de expiración es obligatoria
    And no publica la promoción

  Scenario: El administrador desactiva una promoción activa
    Given que existe una promoción activa en la sección "Promociones"
    When el administrador toca "Desactivar"
    Then el sistema desactiva la promoción
    And la oferta deja de ser visible para los compradores en la app de inmediato

  Scenario: El administrador edita una promoción activa
    Given que existe una promoción activa publicada
    When el administrador la edita y guarda los cambios
    Then el sistema actualiza la promoción
    And los compradores ven los datos actualizados en tiempo real

````

#### US-AL-22 · Ver el historial de promociones publicadas

Como administrador de local,
quiero consultar el historial de promociones que he publicado con su estado y vigencia
para poder planificar nuevas campañas sin repetir las mismas condiciones.
**Criterios de aceptación (Gherkin)**
````
Feature: Historial de promociones del Admin Local

  Scenario: El administrador accede al historial de promociones
    Given que el administrador está en la sección "Promociones"
    When la pantalla carga
    Then el sistema muestra todas las promociones: activas, programadas y expiradas
    And cada entrada muestra: título, tipo, fecha de inicio, fecha de expiración y estado

  Scenario: El administrador filtra por estado de promoción
    Given que el administrador está en la sección de Promociones
    When aplica el filtro "Expiradas"
    Then el sistema muestra únicamente las promociones cuya fecha de expiración ya pasó

  Scenario: No hay promociones registradas
    Given que el administrador nunca ha publicado promociones
    When accede a la sección "Promociones"
    Then el sistema muestra un empty state con una invitación a crear la primera promoción

````

#### US-AL-23 · Ver analytics básicos de la tienda (Plan Pro)

Como administrador de local con Plan Pro,
quiero consultar métricas de visitas, productos más vistos y reservas en un panel de analytics
para poder entender el comportamiento digital de mis clientes y tomar decisiones de negocio basadas en datos.
**Criterios de aceptación (Gherkin)**
````
Feature: Panel de analytics básico para Admin Local (Plan Pro)

  Scenario: El administrador accede al dashboard con métricas del período
    Given que el administrador tiene un plan Pro activo
    When accede a la sección "Dashboard"
    Then el sistema muestra: visitas al perfil de la tienda, productos más vistos, reservas recibidas y reservas completadas del período
    And muestra la gráfica de actividad semanal

  Scenario: El administrador cambia el período de análisis
    Given que el administrador está en el dashboard
    When cambia el período de análisis (últimos 7 días, 30 días)
    Then el sistema actualiza todas las métricas para reflejar el nuevo período seleccionado

  Scenario: El administrador con plan básico intenta acceder a analytics avanzados
    Given que el administrador tiene un plan básico (no Pro)
    When intenta acceder a secciones de métricas detalladas
    Then el sistema muestra un mensaje indicando que esa funcionalidad está disponible en el Plan Pro
    And ofrece información para hacer upgrade al plan Pro

  Scenario: La tienda no tiene datos en el período seleccionado
    Given que la tienda no registró actividad en el rango de fechas seleccionado
    When el administrador consulta las métricas
    Then el sistema muestra los indicadores en cero
    And muestra un mensaje orientativo sugiriendo acciones para generar actividad

````

#### US-AL-24 · Cerrar sesión en MallHub Store

Como administrador de local,
quiero poder cerrar mi sesión en el panel de la tienda
para poder proteger el acceso a la gestión de mi local cuando no estoy usando el equipo.
**Criterios de aceptación (Gherkin)**
````
Feature: Cierre de sesión del Admin Local en MallHub Store

  Scenario: Cierre de sesión exitoso desde el panel
    Given que el administrador tiene una sesión activa en MallHub Store
    When accede a la opción "Cerrar sesión" en el menú o sidebar
    Then el sistema solicita confirmación
    And al confirmar, cierra la sesión
    And redirige al administrador a la pantalla de inicio de sesión de MallHub Store
    And elimina el token de sesión del dispositivo

  Scenario: El administrador cancela el cierre de sesión
    Given que aparece el diálogo de confirmación de cierre de sesión
    When el administrador toca "Cancelar"
    Then el sistema mantiene la sesión activa
    And regresa al panel sin cambios

  Scenario: Sesión expirada por inactividad
    Given que el administrador no ha interactuado con el panel por un tiempo prolongado
    When el token de sesión expira
    Then el sistema cierra la sesión automáticamente
    And redirige al inicio de sesión con un mensaje informando que la sesión expiró por inactividad

````

#### US-AL-25 · Crear un producto asistido por IA a partir de imágenes

Como administrador de local,
quiero poder subir las fotos de un producto y que la IA genere automáticamente el nombre, la descripción, la categoría y las variantes sugeridas
para poder publicar productos en el catálogo de forma rápida sin necesidad de redactar el contenido manualmente.
**Criterios de aceptación (Gherkin)**
````
Feature: Creación de producto asistida por IA para Admin Local

  # ─── ACTIVACIÓN DEL ASISTENTE ───────────────────────────────────────

  Scenario: El administrador accede al modo de creación asistida por IA
    Given que el administrador está en la sección "Mi Catálogo"
    When toca "Agregar producto"
    Then el sistema muestra dos opciones de creación:
      "Completar manualmente" y "Crear con IA ✨"
    And la opción "Crear con IA" está destacada como opción recomendada

  Scenario: El administrador inicia el flujo asistido por IA
    Given que el administrador seleccionó "Crear con IA ✨"
    When el flujo asistido carga
    Then el sistema muestra el área de carga de imágenes como primer paso
    And muestra un mensaje indicando que la IA generará el contenido
      del producto a partir de las fotos que suba

  # ─── CARGA DE IMÁGENES ───────────────────────────────────────────────

  Scenario: El administrador sube imágenes válidas para análisis
    Given que el administrador está en el flujo asistido por IA
    When sube entre 1 y 5 imágenes del producto mediante drag & drop o selección
    Then el sistema acepta las imágenes
    And muestra una vista previa de cada imagen cargada
    And habilita el botón "Analizar con IA"

  Scenario: El administrador intenta iniciar el análisis sin subir imágenes
    Given que el administrador está en el flujo asistido por IA
    When toca "Analizar con IA" sin haber subido ninguna imagen
    Then el sistema muestra un mensaje indicando que se necesita al menos
      una imagen para iniciar el análisis
    And no llama a la API de IA

  Scenario: El administrador sube un formato de imagen no compatible
    Given que el administrador intenta subir un archivo en formato no aceptado (PDF, GIF animado, etc.)
    When el sistema intenta procesarlo
    Then muestra un mensaje indicando los formatos válidos (JPG, PNG, WebP)
    And no incluye el archivo incompatible en el análisis
    And permite subir un archivo correcto en su lugar

  Scenario: El administrador sube más de 5 imágenes
    Given que el administrador está en el flujo asistido por IA
    When intenta agregar una sexta imagen
    Then el sistema muestra un mensaje indicando el límite de 5 imágenes
    And no agrega la imagen adicional

  # ─── ANÁLISIS Y GENERACIÓN IA ────────────────────────────────────────

  Scenario: La IA analiza las imágenes y genera el contenido del producto
    Given que el administrador subió al menos una imagen válida
    When toca "Analizar con IA"
    Then el sistema muestra un indicador de carga con un mensaje
      como "Analizando tu producto..."
    And llama a la API de IA enviando las imágenes y el contexto
      de la tienda (nombre, categoría de la tienda)
    And al recibir la respuesta rellena automáticamente los campos:
      nombre del producto, descripción, categoría sugerida
      y variantes detectadas (talla, color si son visibles en la imagen)
    And muestra cada campo generado con una etiqueta "Sugerido por IA ✨"
      para distinguirlos de los campos completados manualmente

  Scenario: La IA sugiere múltiples opciones para el nombre del producto
    Given que el análisis de la IA se completó exitosamente
    When el sistema muestra los resultados
    Then el campo de nombre ofrece hasta 3 opciones de nombre sugeridas
    And el administrador puede seleccionar la que prefiera con un solo toque
    And puede editar libremente la opción seleccionada

  Scenario: La IA detecta variantes visibles en las imágenes
    Given que las imágenes muestran el producto en diferentes colores o tallas
    When el análisis de la IA se completa
    Then el sistema sugiere las variantes detectadas (ej: Rojo, Azul, Negro)
    And las muestra como chips seleccionables en el formulario
    And el administrador puede aceptarlas, eliminarlas o agregar nuevas manualmente

  Scenario: La IA no puede determinar la categoría con certeza
    Given que las imágenes no son suficientemente claras para categorizar el producto
    When el análisis se completa
    Then el sistema muestra el campo de categoría vacío o con una sugerencia de baja confianza
    And indica al administrador que seleccione la categoría manualmente
    And el resto de los campos generados se muestran con normalidad

  Scenario: El servicio de IA no está disponible al momento del análisis
    Given que el administrador toca "Analizar con IA"
    And el servicio de IA no responde o retorna un error
    When el sistema detecta el fallo
    Then muestra un mensaje indicando que el análisis no está disponible en este momento
    And ofrece dos opciones: "Reintentar" o "Completar manualmente"
    And no pierde las imágenes ya subidas por el administrador

  # ─── REVISIÓN Y EDICIÓN DE SUGERENCIAS ──────────────────────────────

  Scenario: El administrador acepta todas las sugerencias de la IA sin editar
    Given que el análisis de la IA se completó y el formulario está pre-rellenado
    When el administrador revisa los campos y considera que todos son correctos
    And no modifica ninguno
    And toca "Publicar producto"
    Then el sistema publica el producto con el contenido generado por la IA
    And el producto aparece en el catálogo público de la tienda

  Scenario: El administrador edita parcialmente las sugerencias de la IA
    Given que el análisis de la IA se completó y los campos están pre-rellenados
    When el administrador modifica solo la descripción para ajustarla a su estilo
    And acepta el nombre y la categoría sugeridos sin cambios
    And toca "Publicar producto"
    Then el sistema publica el producto con la mezcla de contenido generado
      por IA y contenido editado manualmente
    And no hay distinción en el producto publicado entre campos editados y no editados

  Scenario: El administrador regenera las sugerencias de la IA para un campo específico
    Given que el formulario tiene los campos pre-rellenados por la IA
    When el administrador toca el botón "Regenerar ✨" junto al campo de descripción
    Then el sistema llama nuevamente a la API de IA solicitando
      una descripción alternativa para ese campo específico
    And muestra la nueva sugerencia en el campo
    And el administrador puede aceptarla o solicitar otra regeneración

  Scenario: El administrador regenera todas las sugerencias desde cero
    Given que el formulario tiene los campos pre-rellenados por la IA
    And el administrador no está satisfecho con ninguna sugerencia
    When toca "Volver a analizar"
    Then el sistema repite el análisis completo de las imágenes
    And muestra un nuevo conjunto de sugerencias
    And los campos vuelven a tener la etiqueta "Sugerido por IA ✨"

  # ─── PRECIO Y PUBLICACIÓN ────────────────────────────────────────────

  Scenario: El administrador debe ingresar el precio manualmente (la IA no lo sugiere)
    Given que el análisis de la IA se completó
    When el formulario muestra los campos pre-rellenados
    Then el campo de precio permanece vacío y requiere ingreso manual obligatorio
    And el sistema muestra un indicador visual señalando que el precio no es estimado por la IA
    And no permite publicar el producto sin un precio definido por el administrador

  Scenario: El administrador guarda el producto como borrador con contenido generado por IA
    Given que el formulario tiene campos pre-rellenados por la IA pero el precio aún no fue ingresado
    When el administrador toca "Guardar borrador"
    Then el sistema guarda el producto en estado borrador
    And conserva el contenido generado por la IA para que el administrador lo complete después
    And el producto no es visible para los compradores hasta ser publicado

  # ─── HISTORIAL Y TRAZABILIDAD ────────────────────────────────────────

  Scenario: El producto publicado con IA no muestra diferencias para el comprador
    Given que el administrador publicó un producto creado con el asistente de IA
    When un comprador visualiza el producto en la app
    Then el producto se muestra exactamente igual que cualquier otro producto del catálogo
    And no hay ninguna indicación visible para el comprador de que fue generado con IA
````

#### US-ACC-01 · Iniciar sesión en MallHub Insights

Como administrador de centro comercial,
quiero iniciar sesión en MallHub Insights con mis credenciales
para poder acceder al dashboard ejecutivo y las herramientas de gestión de mi mall.
**Criterios de aceptación (Gherkin)**
````
Feature: Inicio de sesión del Admin CC en MallHub Insights

  Scenario: Inicio de sesión exitoso
    Given que el administrador está en la pantalla de inicio de sesión de MallHub Insights
    When ingresa un correo y contraseña correctos asociados a un mall activo
    Then el sistema autentica al administrador
    And lo redirige al Dashboard Principal (A-01) de su mall

  Scenario: Credenciales incorrectas
    Given que el administrador está en la pantalla de inicio de sesión
    When ingresa un correo o contraseña incorrectos
    Then el sistema muestra un mensaje de error indicando que las credenciales son inválidas
    And no inicia la sesión

  Scenario: La cuenta existe pero el mall no ha sido activado por el Admin Plataforma
    Given que las credenciales son correctas
    And el mall del administrador aún no fue activado en la plataforma
    When el administrador inicia sesión
    Then el sistema permite el acceso al panel
    And muestra un banner informando que el mall está pendiente de activación
    And indica que no es visible para compradores hasta ser activado

  Scenario: Campos vacíos en el formulario de inicio de sesión
    Given que el administrador está en la pantalla de inicio de sesión
    When intenta ingresar sin completar algún campo
    Then el sistema resalta los campos vacíos con mensajes de error
    And no intenta la autenticación

````

#### US-ACC-02 · Recuperar contraseña olvidada

Como administrador de centro comercial,
quiero recuperar el acceso a mi cuenta si olvidé mi contraseña
para poder volver a gestionar el dashboard de mi mall sin contactar soporte.
**Criterios de aceptación (Gherkin)**
````
Feature: Recuperación de contraseña del Admin CC

  Scenario: Solicitud de recuperación exitosa con correo registrado
    Given que el administrador está en la pantalla de recuperación de contraseña
    When ingresa el correo asociado a su cuenta de Insights
    Then el sistema envía un correo con el enlace de restablecimiento
    And muestra un mensaje confirmando el envío

  Scenario: Restablecimiento exitoso de contraseña
    Given que el administrador accedió al enlace de restablecimiento vigente
    When define una nueva contraseña válida y la confirma
    Then el sistema actualiza la contraseña
    And redirige al administrador al inicio de sesión con un mensaje de confirmación

  Scenario: Enlace de restablecimiento expirado
    Given que el enlace superó su tiempo de vigencia
    When el administrador intenta acceder al enlace
    Then el sistema informa que el enlace expiró
    And ofrece solicitar uno nuevo desde la misma pantalla

  Scenario: Correo no registrado
    Given que el administrador ingresa un correo que no existe en el sistema
    When solicita la recuperación
    Then el sistema muestra un mensaje indicando que no hay cuenta con ese correo

````

#### US-ACC-03 · Cerrar sesión en MallHub Insights

Como administrador de centro comercial,
quiero cerrar mi sesión en MallHub Insights
para poder proteger el acceso al dashboard ejecutivo cuando no estoy usando el equipo.
**Criterios de aceptación (Gherkin)**
````
Feature: Cierre de sesión del Admin CC en MallHub Insights

  Scenario: Cierre de sesión exitoso
    Given que el administrador tiene una sesión activa en Insights
    When accede a la opción "Cerrar sesión" en el sidebar o menú de usuario
    Then el sistema solicita confirmación antes de cerrar
    And al confirmar cierra la sesión
    And redirige al administrador a la pantalla de inicio de sesión
    And elimina el token de sesión del dispositivo

  Scenario: El administrador cancela el cierre de sesión
    Given que el diálogo de confirmación está visible
    When el administrador toca "Cancelar"
    Then el sistema cierra el diálogo
    And mantiene la sesión activa sin cambios

  Scenario: Sesión expirada por inactividad prolongada
    Given que el administrador no ha interactuado con el panel durante un tiempo prolongado
    When el token de sesión expira
    Then el sistema cierra la sesión automáticamente
    And redirige al inicio de sesión informando que la sesión expiró por inactividad

````

#### US-ACC-04 · Ver los KPIs ejecutivos del mall en el dashboard principal

Como administrador de centro comercial,
quiero ver un resumen de los KPIs clave de mi mall en el dashboard principal
para poder monitorear la actividad digital del centro comercial y tomar decisiones operativas con datos reales.
**Criterios de aceptación (Gherkin)**
````
Feature: Visualización del dashboard principal con KPIs ejecutivos

  Scenario: Dashboard carga con todos los KPIs del período activo
    Given que el administrador inició sesión correctamente en MallHub Insights
    When accede a la sección "Dashboard Principal" (A-01)
    Then el sistema muestra las KPI cards del período activo:
      visitas digitales, búsquedas realizadas, reservas totales y tasa de conversión
    And cada KPI muestra la variación porcentual respecto al período anterior

  Scenario: Dashboard muestra el top 5 de tiendas más visitadas
    Given que el administrador está en el Dashboard Principal
    When la pantalla carga
    Then el sistema muestra la lista con las 5 tiendas con más visitas digitales en el período

  Scenario: Dashboard muestra el top 5 de productos más reservados
    Given que el administrador está en el Dashboard Principal
    When la pantalla carga
    Then el sistema muestra los 5 productos con más reservas generadas en el período
    And cada producto incluye el nombre de la tienda a la que pertenece

  Scenario: Dashboard muestra alertas de tiendas con información desactualizada o sin stock
    Given que existen tiendas con catálogos desactualizados o productos sin stock
    When el administrador carga el Dashboard Principal
    Then el sistema muestra una sección de alertas con las tiendas que requieren atención
    And ofrece acceso directo al perfil de cada tienda alertada

  Scenario: El mall no tiene actividad en el período activo
    Given que el mall fue activado recientemente y no tiene datos de actividad
    When el administrador accede al dashboard
    Then el sistema muestra los KPIs en cero con mensajes orientativos
    And sugiere acciones para comenzar a generar actividad (aprobar tiendas, publicar eventos)

````

#### US-ACC-05 · Cambiar el período de análisis del dashboard

Como administrador de centro comercial,
quiero poder cambiar el rango de fechas que analiza el dashboard
para poder comparar el desempeño del mall en distintos períodos de tiempo.
**Criterios de aceptación (Gherkin)**
````
Feature: Cambio de período de análisis en el dashboard

  Scenario: El administrador selecciona un período predefinido
    Given que el administrador está en el Dashboard Principal
    When selecciona el período "Últimos 30 días" desde el selector de período
    Then el sistema recalcula y actualiza todos los KPIs, gráficas y rankings para ese rango
    And las variaciones porcentuales se recalculan respecto al período anterior equivalente

  Scenario: El administrador selecciona "Últimos 90 días"
    Given que el administrador está en el Dashboard Principal
    When selecciona el período "Últimos 90 días"
    Then el sistema actualiza todas las métricas para reflejar ese rango temporal

  Scenario: El administrador define un rango de fechas personalizado
    Given que el administrador está en el selector de período
    When define una fecha de inicio y una fecha de fin personalizada
    Then el sistema actualiza el dashboard con los datos del rango exacto definido
    And muestra las fechas seleccionadas como referencia en la cabecera del dashboard

  Scenario: El rango seleccionado no tiene datos
    Given que el administrador define un rango de fechas anterior a la activación del mall
    When el sistema procesa el rango
    Then muestra los KPIs en cero con un mensaje informando que no hay datos para ese período
    And no muestra errores técnicos

````

#### US-ACC-06 · Ver la gráfica de tendencia temporal del mall

Como administrador de centro comercial,
quiero ver la evolución de la actividad digital del mall a lo largo del tiempo en una gráfica
para poder identificar tendencias, picos de actividad y el impacto de eventos o campañas.
**Criterios de aceptación (Gherkin)**
````
Feature: Visualización de gráfica de tendencia temporal

  Scenario: La gráfica carga con datos del período activo
    Given que el administrador está en el Dashboard Principal
    When la pantalla carga con el período seleccionado
    Then el sistema muestra la gráfica de tendencia temporal (línea)
    And la gráfica refleja la evolución de visitas digitales o reservas en el tiempo

  Scenario: El administrador cambia la métrica visualizada en la gráfica
    Given que el administrador está visualizando la gráfica de tendencia
    When selecciona una métrica diferente (reservas, búsquedas, conversión)
    Then la gráfica se actualiza para mostrar la evolución de la métrica seleccionada

  Scenario: La gráfica muestra un pico de actividad relacionado con un evento
    Given que el mall publicó un evento durante el período analizado
    When el administrador visualiza la gráfica
    Then el sistema puede indicar visualmente el día del evento como un marcador en la línea
    And el administrador puede relacionar el pico con el evento correspondiente

````

#### US-ACC-07 · Exportar reporte del dashboard en PDF

Como administrador de centro comercial,
quiero exportar el reporte del dashboard en formato PDF
para poder presentar los KPIs del mall en reuniones ejecutivas o informes institucionales.
**Criterios de aceptación (Gherkin)**
````
Feature: Exportación de reporte del dashboard en PDF

  Scenario: Exportación exitosa del reporte en PDF
    Given que el administrador está en el Dashboard Principal con un período seleccionado
    When toca el botón "Exportar reporte" y selecciona el formato PDF
    Then el sistema genera el reporte en PDF con los KPIs, gráficas y rankings del período
    And descarga el archivo al equipo del administrador
    And el nombre del archivo incluye el nombre del mall y el período exportado

  Scenario: El reporte PDF incluye todos los elementos del dashboard
    Given que el administrador exporta el reporte en PDF
    When el archivo es generado
    Then el PDF incluye: KPI cards, gráfica de tendencia, top tiendas, top productos y período analizado
    And el reporte tiene el branding de MallHub Insights

  Scenario: Error al generar el PDF
    Given que el administrador solicita la exportación en PDF
    And hay un error en la generación del archivo
    When el sistema falla al procesar la exportación
    Then muestra un mensaje de error con la opción de reintentar
    And no descarga un archivo vacío o corrupto

````

#### US-ACC-08 · Exportar reporte del dashboard en Excel

Como administrador de centro comercial,
quiero exportar los datos del dashboard en formato Excel
para poder hacer análisis adicionales y personalizar los reportes para presentaciones internas.
**Criterios de aceptación (Gherkin)**
````
Feature: Exportación de reporte del dashboard en Excel

  Scenario: Exportación exitosa del reporte en Excel
    Given que el administrador está en el Dashboard Principal con un período definido
    When toca "Exportar reporte" y selecciona el formato Excel
    Then el sistema genera el archivo .xlsx con los datos del período
    And descarga el archivo al equipo del administrador

  Scenario: El archivo Excel contiene los datos estructurados correctamente
    Given que el administrador exporta el reporte en Excel
    When el archivo es generado
    Then el Excel contiene hojas separadas para: KPIs generales, ranking de tiendas y ranking de productos
    And los datos son numéricos y están correctamente etiquetados para ser procesados en tablas dinámicas

  Scenario: Exportar datos de un período sin actividad
    Given que el período seleccionado no tiene datos de actividad
    When el administrador exporta en Excel
    Then el sistema genera el archivo con las estructuras de columnas y filas vacías con valor cero
    And no genera un archivo vacío ni lanza un error

````

#### US-ACC-09 · Ver el análisis de rendimiento individual por tienda

Como administrador de centro comercial,
quiero ver una tabla con el rendimiento digital de cada tienda del mall
para poder identificar qué locales están generando más valor y cuáles necesitan atención.
**Criterios de aceptación (Gherkin)**
````
Feature: Análisis de inteligencia de tiendas (A-02)

  Scenario: El administrador accede a la sección de inteligencia de tiendas
    Given que el administrador está en MallHub Insights
    When navega a la sección "Inteligencia de Tiendas" (A-02)
    Then el sistema muestra una tabla con todas las tiendas activas del mall
    And cada fila incluye: nombre, categoría, piso, visitas, reservas, productos activos y estado

  Scenario: El administrador ordena la tabla por número de reservas
    Given que el administrador está visualizando la tabla de tiendas
    When toca el encabezado de la columna "Reservas" para ordenar
    Then el sistema reordena la tabla de mayor a menor por número de reservas
    And el orden se refleja visualmente en el encabezado de la columna

  Scenario: El administrador filtra tiendas por categoría
    Given que el administrador está en la sección de inteligencia de tiendas
    When aplica el filtro de categoría "Gastronomía"
    Then el sistema muestra únicamente las tiendas de esa categoría en la tabla

  Scenario: El administrador filtra tiendas por piso
    Given que el administrador está en la sección de inteligencia de tiendas
    When selecciona el filtro "Piso 1"
    Then el sistema muestra únicamente las tiendas ubicadas en ese piso

  Scenario: El administrador accede al detalle de una tienda desde la tabla
    Given que el administrador visualiza la tabla de tiendas
    When toca el nombre de una tienda específica
    Then el sistema navega al perfil detallado de esa tienda con sus métricas individuales

````

#### US-ACC-10 · Ver el heatmap de actividad por piso del mall

Como administrador de centro comercial,
quiero ver un heatmap que muestre qué pisos y zonas del mall generan más actividad digital
para poder tomar decisiones sobre disposición de tiendas, eventos y campañas por zona.
**Criterios de aceptación (Gherkin)**
````
Feature: Visualización del heatmap de actividad por piso

  Scenario: El heatmap carga con datos del período activo
    Given que el administrador está en la sección de Inteligencia de Tiendas
    When visualiza el panel del heatmap
    Then el sistema muestra un mapa de calor por piso del mall
    And las zonas con mayor actividad digital están resaltadas con mayor intensidad de color

  Scenario: El administrador cambia el piso visualizado en el heatmap
    Given que el mall tiene múltiples pisos
    When el administrador selecciona un piso diferente en el selector
    Then el heatmap actualiza la vista al piso seleccionado
    And refleja la actividad digital de las tiendas de ese piso

  Scenario: El heatmap no tiene datos suficientes para mostrar zonas calientes
    Given que el mall fue activado recientemente y tiene poca actividad
    When el administrador visualiza el heatmap
    Then el sistema muestra el mapa sin zonas resaltadas
    And muestra un mensaje indicando que se necesita más actividad para generar el análisis de zonas

````

#### US-ACC-11 · Enviar alerta a una tienda inactiva

Como administrador de centro comercial,
quiero poder enviar una alerta o notificación a las tiendas que muestran baja actividad o catálogos desactualizados
para poder incentivar a los locales a mantener su presencia digital activa y de calidad.
**Criterios de aceptación (Gherkin)**
````
Feature: Envío de alerta a tienda inactiva desde Insights

  Scenario: El administrador envía una alerta a una tienda inactiva
    Given que el administrador identifica una tienda con baja actividad en la tabla de tiendas
    When toca la acción "Enviar alerta" en esa tienda
    Then el sistema muestra un formulario para redactar el mensaje de alerta
    And al confirmar envía la notificación al administrador de esa tienda

  Scenario: La alerta se entrega al administrador de la tienda
    Given que el administrador del mall envió una alerta
    When el sistema procesa el envío
    Then el administrador de la tienda recibe la notificación en MallHub Store
    And el mensaje incluye el nombre del mall y el contenido de la alerta

  Scenario: El administrador intenta enviar una alerta sin redactar el mensaje
    Given que el formulario de alerta está abierto
    When el administrador intenta enviarlo sin ingresar un mensaje
    Then el sistema muestra un error indicando que el mensaje es obligatorio
    And no envía la alerta hasta que se complete el campo

````

#### US-ACC-12 · Exportar datos de rendimiento de tiendas

Como administrador de centro comercial,
quiero exportar el reporte de rendimiento de las tiendas del mall
para poder compartirlo con el equipo de operaciones y usarlo en análisis externos.
**Criterios de aceptación (Gherkin)**
````
Feature: Exportación de datos de rendimiento de tiendas

  Scenario: El administrador exporta los datos de tiendas en Excel
    Given que el administrador está en la sección de Inteligencia de Tiendas
    When toca "Exportar datos de tiendas" y selecciona Excel
    Then el sistema genera un archivo .xlsx con la tabla completa de tiendas
    And el archivo incluye: nombre, categoría, piso, visitas, reservas, productos activos y estado

  Scenario: El administrador exporta los datos con filtros aplicados
    Given que el administrador tiene aplicado un filtro de categoría o piso
    When exporta los datos de tiendas
    Then el sistema exporta únicamente las tiendas que coinciden con los filtros activos
    And el nombre del archivo refleja los filtros aplicados

````

#### US-ACC-13 · Crear un nuevo evento del mall

Como administrador de centro comercial,
quiero crear y publicar un nuevo evento en el calendario de la app
para poder comunicar las actividades del mall a los compradores y atraer más visitas.
**Criterios de aceptación (Gherkin)**
````
Feature: Creación de evento del mall por el Admin CC

  Scenario: El administrador crea un evento con todos los campos obligatorios
    Given que el administrador está en la sección "Gestión de Eventos" (A-03)
    When toca "Crear nuevo evento"
    And completa: título, descripción, fecha, hora, ubicación dentro del mall e imagen
    And toca "Publicar"
    Then el sistema publica el evento
    And el evento aparece en el calendario de la app del comprador

  Scenario: El administrador define la audiencia objetivo del evento
    Given que el administrador está completando el formulario de evento
    When selecciona la audiencia "Solo usuarios con perfil activo" o "Todos los usuarios del mall"
    Then el sistema guarda la preferencia de audiencia para la notificación del evento

  Scenario: El administrador programa el envío de push notification del evento
    Given que el administrador está en el formulario de creación de evento
    When activa la opción "Enviar push notification" y define la fecha y hora de envío
    Then el sistema programa la notificación para ser enviada a la audiencia definida
    Y confirma que la notificación fue programada

  Scenario: Intento de publicar evento sin título o fecha
    Given que el administrador está en el formulario de creación de evento
    When intenta publicar sin completar el título o la fecha
    Then el sistema resalta los campos faltantes con mensajes de error
    And no publica el evento

  Scenario: Intento de publicar evento con fecha pasada
    Given que el administrador completa el formulario con una fecha anterior a la actual
    When intenta publicar el evento
    Then el sistema muestra un mensaje de advertencia indicando que la fecha del evento ya pasó
    And solicita confirmación antes de publicar o bloquea la publicación

````

#### US-ACC-14 · Editar un evento existente

Como administrador de centro comercial,
quiero poder editar la información de un evento ya publicado
para poder corregir datos, actualizar la ubicación o modificar la descripción cuando sea necesario.
**Criterios de aceptación (Gherkin)**
````
Feature: Edición de evento existente por el Admin CC

  Scenario: El administrador edita el título y la descripción de un evento activo
    Given que el administrador está en la sección de Gestión de Eventos
    When toca "Editar" en un evento activo
    And modifica el título y la descripción
    And guarda los cambios
    Then el sistema actualiza el evento
    And los compradores que acceden al detalle del evento ven la información actualizada

  Scenario: El administrador cambia la imagen de un evento activo
    Given que el administrador está editando un evento
    When sube una nueva imagen de portada del evento
    Then el sistema reemplaza la imagen anterior
    And la nueva imagen se refleja en la tarjeta del evento en la app

  Scenario: El administrador descarta los cambios de edición
    Given que el administrador modificó campos del evento pero no quiere guardar
    When toca "Cancelar"
    Then el sistema solicita confirmación antes de descartar los cambios
    And al confirmar, el evento conserva sus datos originales sin cambios

````

#### US-ACC-15 · Cancelar un evento publicado

Como administrador de centro comercial,
quiero poder cancelar un evento que ya fue publicado
para poder informar a los compradores con tiempo cuando un evento no puede realizarse.
**Criterios de aceptación (Gherkin)**
````
Feature: Cancelación de evento publicado por el Admin CC

  Scenario: El administrador cancela un evento con usuarios que activaron recordatorio
    Given que el administrador está en la sección de Gestión de Eventos
    And el evento tiene usuarios que activaron el recordatorio push
    When toca "Cancelar evento" y confirma
    Then el sistema cambia el estado del evento a "Cancelado"
    And el evento deja de aparecer como activo en la app del comprador
    And envía automáticamente una push notification a los usuarios que tenían el recordatorio activo informando la cancelación

  Scenario: El administrador cancela un evento sin usuarios con recordatorio
    Given que el evento no tiene usuarios con recordatorio activo
    When el administrador confirma la cancelación
    Then el sistema cancela el evento
    And lo mueve al historial con estado "Cancelado"

  Scenario: El administrador cancela el proceso de cancelación
    Given que aparece la confirmación de cancelación del evento
    When el administrador toca "No cancelar"
    Then el sistema cierra el diálogo
    And el evento permanece activo sin cambios

````

#### US-ACC-16 · Ver las métricas de alcance de un evento

Como administrador de centro comercial,
quiero consultar las métricas de impacto de un evento publicado
para poder medir el ROI digital de las actividades del mall y mejorar la planificación futura.
**Criterios de aceptación (Gherkin)**
````
Feature: Métricas de alcance de evento

  Scenario: El administrador accede a las métricas de un evento activo
    Given que el administrador está en la sección de Gestión de Eventos
    When toca "Ver métricas de alcance" en un evento publicado
    Then el sistema muestra: número de recordatorios activados y visitas al detalle del evento

  Scenario: El administrador consulta las métricas de un evento finalizado
    Given que el evento ya fue completado
    When el administrador accede a sus métricas
    Then el sistema muestra las métricas finales consolidadas: recordatorios activados, visitas totales al evento e impacto en tráfico digital del mall durante el período del evento

  Scenario: El evento aún no tiene métricas porque acaba de publicarse
    Given que el evento fue publicado hace muy poco tiempo
    When el administrador accede a las métricas
    Then el sistema muestra los contadores en cero
    And indica que las métricas se actualizan en tiempo real a medida que los compradores interactúan con el evento

````

#### US-ACC-17 · Programar el envío de push notification de un evento

Como administrador de centro comercial,
quiero programar el envío de una push notification para un evento del mall
para poder comunicar proactivamente las actividades a los usuarios de la app en el momento óptimo.
**Criterios de aceptación (Gherkin)**
````
Feature: Programación de push notification de evento

  Scenario: El administrador programa una notificación para un evento futuro
    Given que el administrador está en la Gestión de Eventos
    And el evento tiene estado "Publicado"
    When toca "Programar push notification"
    And define la fecha, hora y audiencia del envío
    And confirma la programación
    Then el sistema programa la notificación
    And muestra la fecha y hora del próximo envío programado en la tarjeta del evento

  Scenario: El administrador envía la notificación de inmediato
    Given que el administrador está en el panel de programación de notificación
    When selecciona "Enviar ahora" en lugar de programar para una fecha futura
    Then el sistema envía la push notification inmediatamente a la audiencia definida
    And registra la hora de envío en el historial del evento

  Scenario: Intento de programar notificación sin definir audiencia
    Given que el administrador está programando una notificación
    When intenta confirmar sin seleccionar ninguna audiencia
    Then el sistema muestra un error indicando que la audiencia es obligatoria
    And no programa la notificación

  Scenario: La notificación programada se envía a la hora definida
    Given que existe una notificación programada para un evento
    When llega la hora definida por el administrador
    Then el sistema envía la push notification a los usuarios de la audiencia seleccionada
    And actualiza el registro de envíos del evento

````

#### US-ACC-18 · Ver las tiendas pendientes de aprobación

Como administrador de centro comercial,
quiero ver un listado de las tiendas que han solicitado registrarse en mi mall y están pendientes de revisión
para poder aprobarlas o rechazarlas en menos de 24 horas para no afectar su experiencia de onboarding.
**Criterios de aceptación (Gherkin)**
````
Feature: Visualización de tiendas pendientes de aprobación

  Scenario: El administrador accede a la pestaña de tiendas pendientes
    Given que el administrador está en la sección "Gestión de Tiendas" (A-04)
    When visualiza la pestaña "Pendientes de aprobación"
    Then el sistema muestra la lista de tiendas cuyo registro está en revisión
    And cada tienda muestra: nombre, categoría, piso solicitado, fecha de solicitud y datos de contacto

  Scenario: El sistema muestra un banner de alerta cuando hay tiendas pendientes
    Given que existen tiendas pendientes de aprobación
    When el administrador accede a la sección de Gestión de Tiendas
    Then el sistema muestra un banner de alerta recordando que hay solicitudes pendientes
    And indica que deben revisarse en menos de 24 horas

  Scenario: El badge en el sidebar muestra el conteo de tiendas pendientes
    Given que existen tiendas pendientes de aprobación en el mall
    When el administrador visualiza el sidebar de navegación
    Then el ítem "Gestión de Tiendas" muestra un badge con el número de solicitudes pendientes
    And el badge desaparece cuando todas las solicitudes son gestionadas

  Scenario: No hay tiendas pendientes de aprobación
    Given que todas las solicitudes han sido procesadas
    When el administrador accede a la pestaña "Pendientes de aprobación"
    Then el sistema muestra un empty state indicando que no hay solicitudes pendientes

````

#### US-ACC-19 · Aprobar el registro de una tienda

Como administrador de centro comercial,
quiero aprobar la solicitud de registro de una tienda en mi mall
para poder que el local quede activo y visible para los compradores en el directorio de la app.
**Criterios de aceptación (Gherkin)**
````
Feature: Aprobación de registro de tienda por el Admin CC

  Scenario: El administrador revisa el perfil y aprueba la tienda
    Given que el administrador está en la pestaña "Pendientes de aprobación"
    When toca "Ver perfil" de una tienda pendiente y revisa su información
    And toca "Aprobar"
    Then el sistema cambia el estado de la tienda a "Activa"
    And mueve la tienda a la pestaña "Tiendas activas"
    And notifica al administrador de la tienda que su local fue aprobado
    And la tienda aparece en el directorio del mall en la app del comprador

  Scenario: El administrador aprueba una tienda directamente desde la lista sin revisar el perfil
    Given que el administrador está en la lista de tiendas pendientes
    When toca la acción rápida "Aprobar" directamente en la tarjeta de la tienda
    Then el sistema solicita confirmación antes de proceder
    And al confirmar, aprueba la tienda y notifica al administrador del local

  Scenario: Error al procesar la aprobación
    Given que el administrador intenta aprobar una tienda
    And ocurre un error de red al procesar la acción
    When el sistema falla al actualizar el estado
    Then muestra un mensaje de error con la opción de reintentar
    And el estado de la tienda permanece como "Pendiente"

````

#### US-ACC-20 · Rechazar el registro de una tienda

Como administrador de centro comercial,
quiero poder rechazar la solicitud de registro de una tienda indicando el motivo
para poder mantener la calidad del directorio del mall e informar al solicitante de los ajustes necesarios.
**Criterios de aceptación (Gherkin)**
````
Feature: Rechazo de registro de tienda por el Admin CC

  Scenario: El administrador rechaza una tienda con motivo
    Given que el administrador está revisando una tienda pendiente
    When toca "Rechazar"
    Then el sistema muestra un campo obligatorio para ingresar el motivo del rechazo
    And al confirmar, cambia el estado de la tienda a un estado de rechazo
    And notifica al administrador de la tienda con el motivo indicado

  Scenario: Intento de rechazar sin ingresar el motivo
    Given que el administrador está en el diálogo de rechazo
    When intenta confirmar sin ingresar un motivo
    Then el sistema muestra un error indicando que el motivo es obligatorio
    And no procesa el rechazo hasta que se complete el campo

  Scenario: El administrador cancela el proceso de rechazo
    Given que el diálogo de rechazo está abierto
    When el administrador toca "Cancelar"
    Then el sistema cierra el diálogo
    And la tienda permanece en estado "Pendiente" sin cambios

````

#### US-ACC-21 · Suspender una tienda activa

Como administrador de centro comercial,
quiero poder suspender temporalmente una tienda activa en mi mall
para poder gestionar incumplimientos, información incorrecta o situaciones que afecten la experiencia del comprador.
**Criterios de aceptación (Gherkin)**
````
Feature: Suspensión de tienda activa por el Admin CC

  Scenario: El administrador suspende una tienda activa indicando el motivo
    Given que el administrador está en la sección de Gestión de Tiendas
    And visualiza la pestaña "Tiendas activas"
    When toca "Suspender" en una tienda activa
    Then el sistema muestra un campo para ingresar el motivo de la suspensión
    And al confirmar, cambia el estado de la tienda a "Suspendida"
    And la tienda deja de ser visible en el directorio del mall en la app del comprador
    And notifica al administrador de la tienda que su local fue suspendido con el motivo

  Scenario: La suspensión afecta las reservas activas de la tienda
    Given que la tienda tiene reservas en estado "Pendiente" o "Confirmada"
    When el administrador la suspende
    Then el sistema muestra una advertencia indicando que existen reservas activas
    And al confirmar la suspensión, las reservas activas no se cancelan automáticamente
    And el administrador de la tienda debe gestionarlas manualmente

  Scenario: Intento de suspender sin ingresar el motivo
    Given que el diálogo de suspensión está abierto
    When el administrador intenta confirmar sin ingresar motivo
    Then el sistema muestra un error indicando que el motivo es obligatorio
    And no procesa la suspensión

````

#### US-ACC-22 · Reactivar una tienda suspendida

Como administrador de centro comercial,
quiero poder reactivar una tienda que estaba suspendida
para poder restablecer su presencia en el directorio del mall cuando la situación que causó la suspensión fue resuelta.
**Criterios de aceptación (Gherkin)**
````
Feature: Reactivación de tienda suspendida por el Admin CC

  Scenario: El administrador reactiva una tienda suspendida
    Given que el administrador está en la pestaña "Suspendidas" de Gestión de Tiendas
    When toca "Reactivar" en una tienda suspendida
    Then el sistema solicita confirmación antes de proceder
    And al confirmar, cambia el estado de la tienda a "Activa"
    And la tienda vuelve a ser visible en el directorio del mall en la app
    And notifica al administrador de la tienda que su local fue reactivado

  Scenario: El administrador cancela la reactivación
    Given que aparece el diálogo de confirmación de reactivación
    When el administrador toca "Cancelar"
    Then el sistema cierra el diálogo
    And la tienda permanece en estado "Suspendida" sin cambios

````

#### US-ACC-23 · Agregar una tienda manualmente al mall

Como administrador de centro comercial,
quiero poder agregar directamente una tienda a mi mall sin esperar a que el local envíe la solicitud
para poder incorporar locales que aún no tienen cuenta en MallHub pero que ya forman parte del mall.
**Criterios de aceptación (Gherkin)**
````
Feature: Adición manual de tienda al mall por el Admin CC

  Scenario: El administrador agrega una tienda manualmente con datos completos
    Given que el administrador está en la sección "Gestión de Tiendas"
    When toca "Agregar tienda manualmente"
    And completa: nombre, categoría, piso, número de local, horarios y datos de contacto
    And toca "Crear tienda"
    Then el sistema crea el perfil de la tienda en estado "Activa"
    And la tienda aparece en el directorio del mall en la app del comprador
    And se envía una invitación al correo de contacto de la tienda para que reclame y complete su perfil

  Scenario: Intento de agregar tienda manualmente con nombre duplicado
    Given que ya existe una tienda con el mismo nombre en ese mall
    When el administrador intenta crear la tienda
    Then el sistema muestra una advertencia indicando que ya existe una tienda con ese nombre
    And permite al administrador confirmar si es la misma tienda o continuar con el nombre duplicado

  Scenario: Campos obligatorios incompletos en el formulario manual
    Given que el administrador está completando el formulario de adición manual
    When intenta crear la tienda sin completar campos obligatorios
    Then el sistema resalta los campos faltantes
    And no crea la tienda hasta que se completen todos los campos obligatorios

````

#### US-ACC-24 · Ver el perfil público de una tienda del mall

Como administrador de centro comercial,
quiero poder previsualizar el perfil público de cualquier tienda de mi mall tal como lo ve un comprador
para poder verificar que la información presentada es correcta y de calidad.
**Criterios de aceptación (Gherkin)**
````
Feature: Previsualización del perfil público de tienda por el Admin CC

  Scenario: El administrador accede al perfil público de una tienda activa
    Given que el administrador está en la tabla de tiendas (A-02 o A-04)
    When toca "Ver perfil público" en una tienda
    Then el sistema muestra una previsualización del perfil de la tienda
    And la vista refleja exactamente cómo lo ve un comprador desde la app

  Scenario: La previsualización muestra catálogo, información y reseñas
    Given que el administrador está en la previsualización del perfil de una tienda
    When navega por las pestañas del perfil
    Then puede ver el catálogo de productos publicados, la información del local y las reseñas recibidas

  Scenario: El administrador detecta información incorrecta en el perfil durante la previsualización
    Given que el administrador visualiza el perfil público de una tienda
    And detecta datos incorrectos o imágenes inapropiadas
    When decide tomar acción
    Then puede navegar directamente al módulo de gestión de esa tienda para contactarla o suspenderla

````

#### US-ACC-25 · Editar la información pública del mall

Como administrador de centro comercial,
quiero editar la información pública del mall: nombre, dirección, horarios, teléfono y redes sociales
para poder mantener el perfil del centro comercial actualizado en la app.
**Criterios de aceptación (Gherkin)**
````
Feature: Edición de información pública del mall (A-05)

  Scenario: El administrador actualiza los horarios del mall
    Given que el administrador está en "Configuración del Mall" (A-05)
    When modifica los horarios de apertura y cierre del mall
    And toca "Guardar cambios"
    Then el sistema actualiza los horarios en el perfil público del mall en la app
    And los compradores ven los horarios actualizados al consultar el directorio

  Scenario: El administrador actualiza los datos de contacto del mall
    Given que el administrador está en la sección de configuración del mall
    When modifica el número de teléfono y la dirección
    And guarda los cambios
    Then el sistema actualiza los datos de contacto en el perfil público del mall

  Scenario: El administrador actualiza las redes sociales del mall
    Given que el administrador está en la sección de configuración del mall
    When agrega o modifica los enlaces de redes sociales
    And guarda los cambios
    Then el sistema actualiza los datos y los refleja en el perfil del mall

  Scenario: Guardar configuración del mall con nombre vacío
    Given que el administrador borra el nombre del mall en el formulario
    When intenta guardar los cambios
    Then el sistema muestra un error indicando que el nombre del mall es un campo obligatorio
    And no guarda los cambios

  Scenario: El administrador verifica la vista previa del mall antes de guardar
    Given que el administrador modificó datos del mall
    When toca "Ver preview en la app"
    Then el sistema muestra cómo verán los compradores el perfil del mall con los cambios aplicados

````

#### US-ACC-26 · Actualizar el logo e imágenes del mall

Como administrador de centro comercial,
quiero poder subir o actualizar el logo y las imágenes del mall
para poder mantener la identidad visual del centro comercial en la app siempre actualizada.
**Criterios de aceptación (Gherkin)**
````
Feature: Actualización de logo e imágenes del mall

  Scenario: El administrador sube un nuevo logo del mall
    Given que el administrador está en la sección "Configuración del Mall"
    When sube una nueva imagen como logo del mall
    Then el sistema procesa la imagen y la establece como el logo oficial del mall
    And el nuevo logo se refleja en el directorio y en el perfil del mall en la app

  Scenario: El administrador agrega nuevas imágenes del mall
    Given que el administrador está en la sección de configuración del mall
    When sube nuevas imágenes de las instalaciones o áreas del mall
    Then el sistema acepta las imágenes y las muestra en el perfil público del mall

  Scenario: El administrador elimina una imagen existente del mall
    Given que el mall tiene imágenes publicadas en su perfil
    When el administrador elimina una imagen específica
    Then el sistema la remueve del perfil público del mall
    And el resto de imágenes permanecen sin cambios

  Scenario: Formato de imagen no compatible
    Given que el administrador intenta subir un archivo con un formato no compatible
    When el sistema intenta procesarlo
    Then muestra un mensaje indicando los formatos de imagen aceptados
    And no carga el archivo incompatible

````

#### US-ACC-27 · Actualizar el mapa SVG del mall por piso

Como administrador de centro comercial,
quiero poder subir o actualizar el mapa SVG de cada piso del mall
para poder que los compradores puedan orientarse dentro del centro comercial desde la app.
**Criterios de aceptación (Gherkin)**
````
Feature: Actualización del mapa SVG del mall por piso

  Scenario: El administrador sube un mapa SVG para un piso del mall
    Given que el administrador está en la sección "Configuración del Mall"
    When selecciona un piso del mall y sube el archivo SVG correspondiente
    Then el sistema procesa el archivo
    And actualiza el mapa de ese piso en la app del comprador
    And los compradores pueden ver el mapa actualizado con la ubicación de las tiendas

  Scenario: El administrador actualiza el mapa de un piso ya existente
    Given que el piso ya tiene un mapa SVG publicado
    When el administrador sube una nueva versión del SVG
    Then el sistema reemplaza el mapa anterior con la nueva versión
    And la actualización se refleja en la app sin afectar los otros pisos

  Scenario: El archivo subido no es un SVG válido
    Given que el administrador intenta subir un archivo que no es SVG o está mal formateado
    When el sistema intenta procesarlo
    Then muestra un mensaje de error indicando que el archivo no es válido
    And no reemplaza el mapa existente con un archivo incorrecto

  Scenario: El mall no tiene mapa SVG para un piso
    Given que un piso del mall aún no tiene mapa SVG cargado
    When un comprador intenta ver ese piso en el mapa del mall
    Then la app muestra un mensaje informando que el mapa de ese piso no está disponible aún
    And el administrador puede ver en la configuración qué pisos no tienen mapa asignado

````

#### US-ACC-28 · Gestionar las categorías de tiendas del mall

Como administrador de centro comercial,
quiero configurar las categorías de tiendas disponibles en mi mall
para poder que el directorio y los filtros de la app reflejen la oferta real del centro comercial.
**Criterios de aceptación (Gherkin)**
````
Feature: Gestión de categorías de tiendas del mall

  Scenario: El administrador agrega una nueva categoría al mall
    Given que el administrador está en la sección "Configuración del Mall"
    When accede a la configuración de categorías y agrega una nueva (ej: "Deportes")
    Then el sistema agrega la categoría al listado disponible en el directorio del mall
    And los administradores de tiendas pueden seleccionarla al registrar su local

  Scenario: El administrador elimina una categoría sin tiendas asociadas
    Given que existe una categoría en la configuración del mall
    And ninguna tienda activa está asociada a esa categoría
    When el administrador la elimina
    Then el sistema la remueve del listado de categorías disponibles
    And ya no aparece como opción en los filtros del directorio de la app

  Scenario: El administrador intenta eliminar una categoría con tiendas activas asociadas
    Given que la categoría tiene una o más tiendas activas asignadas
    When el administrador intenta eliminarla
    Then el sistema muestra una advertencia indicando cuántas tiendas tienen esa categoría asignada
    And bloquea la eliminación hasta que las tiendas sean reasignadas a otra categoría

````
#### US-ACC-29 · Generar reportes ejecutivos y alertas inteligentes con IA

Como administrador de centro comercial,
quiero que la IA analice los datos del dashboard de mi mall y genere reportes en lenguaje natural con insights, tendencias y alertas accionables
para poder tomar decisiones estratégicas más rápido sin necesidad de interpretar manualmente cada métrica y gráfica.

**Criterios de aceptación (Gherkin)**
````
Feature: Reportes ejecutivos y alertas inteligentes con IA para Admin CC

  # ─── ACCESO AL ASISTENTE DE IA ──────────────────────────────────────

  Scenario: El administrador accede al asistente de análisis IA desde el dashboard
    Given que el administrador está en el Dashboard Principal (A-01)
    When toca el botón "Analizar con IA ✨" en la cabecera del dashboard
    Then el sistema abre el panel de IA lateral (o modal)
    And muestra un resumen del período activo como contexto de análisis
    And ofrece tres acciones principales:
      "Generar reporte ejecutivo", "Detectar alertas" y "Hacer una pregunta"

  # ─── GENERACIÓN DE REPORTE EJECUTIVO ────────────────────────────────

  Scenario: El administrador solicita un reporte ejecutivo del período activo
    Given que el administrador está en el panel de IA
    When toca "Generar reporte ejecutivo"
    Then el sistema muestra un indicador de carga con un mensaje como
      "Analizando los datos de tu mall..."
    And envía a la API de IA los KPIs del período: visitas digitales,
      búsquedas, reservas totales, tasa de conversión, top tiendas
      y top productos, comparado con el período anterior
    And al recibir la respuesta muestra el reporte en lenguaje natural
      con: resumen ejecutivo, análisis de tendencias, hallazgos clave
      y recomendaciones accionables

  Scenario: El reporte ejecutivo identifica una tendencia positiva significativa
    Given que el análisis de la IA se completó
    And las reservas del período crecieron más de un 30% respecto al período anterior
    When el reporte se muestra
    Then la IA destaca el crecimiento en el resumen ejecutivo
    And atribuye el crecimiento a los factores más probables identificados
      en los datos (ej: un evento publicado, nuevas tiendas activas)
    And sugiere acciones para mantener o ampliar la tendencia

  Scenario: El reporte ejecutivo identifica una caída preocupante en conversión
    Given que la tasa de conversión del mall cayó más de un 15%
      respecto al período anterior
    When el análisis de la IA se completa
    Then el reporte señala la caída como un hallazgo crítico
    And analiza posibles causas dentro de los datos disponibles
      (ej: tiendas con stock agotado, caída en tiendas de mayor tráfico)
    And propone acciones concretas que el administrador puede tomar
      desde su panel (revisar tiendas con alertas, publicar evento de atracción)

  Scenario: El administrador solicita un reporte para un período diferente al activo
    Given que el administrador está en el panel de IA
    When cambia el período de análisis antes de generar el reporte
    And toca "Generar reporte ejecutivo"
    Then la IA genera el análisis para el período seleccionado
    And compara los datos con el período inmediatamente anterior al seleccionado

  Scenario: No hay datos suficientes para generar un reporte significativo
    Given que el mall fue activado recientemente y tiene menos de 7 días de datos
    When el administrador solicita el reporte ejecutivo
    Then la IA informa que los datos son insuficientes para un análisis confiable
    And sugiere cuándo estará disponible un análisis más representativo
    And ofrece un mini-análisis de lo disponible con las advertencias correspondientes

  # ─── DETECCIÓN INTELIGENTE DE ALERTAS ───────────────────────────────

  Scenario: La IA detecta automáticamente alertas del período activo
    Given que el administrador toca "Detectar alertas"
    When la IA analiza los datos del mall
    Then genera una lista priorizada de alertas clasificadas por severidad:
      Crítica (roja), Advertencia (amarilla) e Informativa (azul)
    And cada alerta incluye: descripción del hallazgo, métrica afectada,
      magnitud del impacto y acción sugerida con acceso directo

  Scenario: La IA detecta una tienda con alto tráfico pero cero reservas
    Given que los datos muestran una tienda con muchas visitas digitales
      pero ninguna reserva en el período
    When la IA analiza el patrón
    Then genera una alerta tipo "Oportunidad de conversión"
    And la describe como: "[Nombre tienda] recibió X visitas pero no generó
      reservas. Posible causa: catálogo sin stock o productos sin precio."
    And sugiere la acción: "Revisar catálogo de [Tienda]"
    And ofrece un botón de acceso directo al perfil de esa tienda en A-04

  Scenario: La IA detecta una tienda que no ha actualizado su catálogo en X días
    Given que una tienda activa no ha modificado ningún producto en más de 30 días
    When la IA analiza el historial de actividad
    Then genera una alerta tipo "Tienda inactiva"
    And la describe con el número de días sin actividad y el impacto estimado
    And sugiere la acción: "Enviar alerta al administrador de la tienda"
    And ofrece el botón de envío de alerta directo (US-ACC-11) como acción rápida

  Scenario: La IA detecta un pico inusual de búsquedas sin tiendas que lo cubran
    Given que los datos muestran muchas búsquedas de una categoría específica
      para la cual hay pocas tiendas activas en el mall
    When la IA analiza la demanda no cubierta
    Then genera una alerta tipo "Oportunidad de oferta"
    And la describe como: "Alta demanda de [categoría] sin suficiente oferta.
      Considera incorporar más tiendas de esta categoría."
    And la severidad es "Informativa"

  Scenario: La IA no detecta alertas críticas en el período analizado
    Given que todos los indicadores del mall están dentro de rangos normales
    When la IA completa el análisis de alertas
    Then muestra un mensaje positivo indicando que no hay alertas críticas
    And puede mostrar alertas informativas menores si existen
    And sugiere mantener la frecuencia de publicación de eventos como buena práctica

  # ─── CONSULTA EN LENGUAJE NATURAL ───────────────────────────────────

  Scenario: El administrador hace una pregunta en lenguaje natural sobre los datos
    Given que el administrador está en el panel de IA
    When toca "Hacer una pregunta" y escribe:
      "¿Cuál fue el día con más reservas del mes pasado y por qué?"
    Then la IA analiza los datos disponibles del período
    And responde en lenguaje natural con el día específico, el número de reservas
      y el contexto relevante (ej: si coincidió con un evento publicado)

  Scenario: El administrador pregunta sobre el rendimiento comparado de dos tiendas
    Given que el administrador escribe:
      "¿Qué tienda tuvo mejor rendimiento este mes, Zara o Tennis?"
    When la IA procesa la pregunta con los datos disponibles
    Then responde con una comparativa de las métricas clave de ambas tiendas
      (visitas, reservas, tasa de conversión) para el período activo
    And concluye cuál tuvo mejor desempeño y en qué métricas específicas

  Scenario: El administrador hace una pregunta cuya respuesta no está en los datos disponibles
    Given que el administrador pregunta algo fuera del alcance de los datos del dashboard
      (ej: "¿Cuánto facturó la tienda X este mes?")
    When la IA no tiene acceso a ese dato específico
    Then responde indicando que esa información no está disponible en el dashboard
    And sugiere qué datos sí puede analizar que sean relevantes para la pregunta

  # ─── EXPORTACIÓN DEL REPORTE GENERADO POR IA ────────────────────────

  Scenario: El administrador exporta el reporte generado por la IA en PDF
    Given que la IA generó un reporte ejecutivo en el panel
    When el administrador toca "Exportar reporte IA" y selecciona PDF
    Then el sistema genera un PDF que incluye:
      el reporte en lenguaje natural, los KPIs del período en formato visual,
      las alertas detectadas y las recomendaciones accionables
    And el encabezado del PDF incluye el nombre del mall, el período analizado
      y la indicación "Generado con asistencia de IA"
    And descarga el archivo al equipo del administrador

  Scenario: El administrador exporta el reporte en formato Word para editarlo
    Given que la IA generó un reporte ejecutivo
    When el administrador toca "Exportar reporte IA" y selecciona Word (.docx)
    Then el sistema genera un archivo .docx con el texto del reporte estructurado
    And el administrador puede editarlo antes de presentarlo en reuniones ejecutivas

  # ─── CONFIGURACIÓN DE ALERTAS AUTOMÁTICAS ───────────────────────────

  Scenario: El administrador configura alertas automáticas periódicas de la IA
    Given que el administrador está en la configuración del panel de IA
    When activa la opción "Alertas automáticas semanales"
    And define el día y hora de envío preferidos
    Then el sistema programa un análisis semanal automático de la IA
    And envía un resumen de alertas al correo del administrador cada semana
    And el correo incluye un enlace directo al dashboard para revisar el detalle

  Scenario: El administrador desactiva las alertas automáticas
    Given que las alertas automáticas semanales están activas
    When el administrador desactiva la opción en la configuración
    Then el sistema cancela los análisis programados
    And confirma que no se enviarán más correos de alertas automáticas
    And el administrador puede reactivarlas en cualquier momento

  Scenario: El análisis automático semanal detecta una situación crítica
    Given que el análisis automático de la IA se ejecutó en la fecha programada
    And detectó una alerta de severidad "Crítica" (ej: caída de más del 40% en reservas)
    When el sistema procesa los resultados
    Then envía una notificación adicional al administrador
      independientemente del día programado de alertas semanales
    And el correo y la notificación están marcados con indicador de urgencia
````

#### US-AP-01 · Iniciar sesión con autenticación de doble factor (2FA)

Como administrador de la plataforma MallHub,
quiero iniciar sesión con mis credenciales y confirmar mi identidad mediante un segundo factor de autenticación
para poder acceder al backoffice con el nivel de seguridad que exige el acceso transversal a todos los datos de la plataforma.
**Criterios de aceptación (Gherkin)**
````
Feature: Inicio de sesión con 2FA obligatorio para el Admin Plataforma

  Scenario: Inicio de sesión exitoso con 2FA completado
    Given que el administrador está en la pantalla de inicio de sesión del backoffice
    When ingresa un correo y contraseña correctos
    Then el sistema solicita el segundo factor de autenticación (código OTP)
    And al ingresar el código OTP válido generado por el autenticador
    Then el sistema autentica al administrador
    And lo redirige al dashboard global del backoffice

  Scenario: Credenciales correctas pero código OTP incorrecto
    Given que el administrador ingresó correo y contraseña correctos
    And el sistema solicitó el segundo factor
    When el administrador ingresa un código OTP incorrecto o expirado
    Then el sistema muestra un mensaje de error indicando que el código es inválido
    And no concede el acceso
    And permite reintentar con un nuevo código

  Scenario: Credenciales incorrectas en el primer paso
    Given que el administrador está en la pantalla de inicio de sesión
    When ingresa un correo o contraseña incorrectos
    Then el sistema muestra un mensaje de error en el primer paso
    And no solicita el segundo factor hasta que las credenciales sean correctas

  Scenario: El administrador no tiene 2FA configurado en su cuenta
    Given que el administrador intenta acceder al backoffice
    And su cuenta no tiene 2FA configurado
    When el sistema detecta la ausencia de 2FA
    Then bloquea el acceso y obliga al administrador a configurar 2FA antes de continuar
    And lo redirige al flujo de configuración del autenticador

  Scenario: Código OTP expirado
    Given que el administrador recibió el código OTP
    And el código superó su tiempo de vigencia (generalmente 30 segundos)
    When ingresa el código expirado
    Then el sistema informa que el código expiró
    And solicita que genere un nuevo código desde el autenticador

````

#### US-AP-02 · Configurar el 2FA por primera vez

Como administrador de la plataforma MallHub,
quiero configurar el segundo factor de autenticación en mi cuenta
para poder cumplir con el requisito de seguridad obligatorio del rol y proteger el acceso al backoffice.
**Criterios de aceptación (Gherkin)**
````
Feature: Configuración inicial de 2FA para el Admin Plataforma

  Scenario: Configuración exitosa de 2FA con app autenticadora
    Given que el administrador accede al flujo de configuración de 2FA por primera vez
    When el sistema muestra el código QR para vinculación con la app autenticadora
    And el administrador escanea el código con su app autenticadora (Google Authenticator, Authy, etc.)
    And ingresa el código OTP generado para confirmar la vinculación
    Then el sistema activa el 2FA en la cuenta del administrador
    And genera y muestra códigos de respaldo de un solo uso para emergencias
    And confirma que el 2FA está activo con un mensaje de éxito

  Scenario: El administrador guarda los códigos de respaldo
    Given que el sistema mostró los códigos de respaldo tras activar el 2FA
    When el administrador los descarga o los copia
    Then el sistema recomienda guardarlos en un lugar seguro
    And advierte que no podrán recuperarse después de cerrar esa pantalla

  Scenario: Código de confirmación incorrecto al vincular el autenticador
    Given que el administrador escaneó el QR con su app autenticadora
    When ingresa un código OTP incorrecto para confirmar la vinculación
    Then el sistema muestra un error indicando que el código no es válido
    And no activa el 2FA hasta que se confirme con un código correcto

````

#### US-AP-03 · Recuperar contraseña olvidada

Como administrador de la plataforma,
quiero poder recuperar el acceso a mi cuenta del backoffice si olvidé mi contraseña
para poder restablecer mis credenciales y retomar la operación de la plataforma.
**Criterios de aceptación (Gherkin)**
````
Feature: Recuperación de contraseña del Admin Plataforma

  Scenario: Solicitud de recuperación con correo registrado
    Given que el administrador está en la pantalla de recuperación de contraseña del backoffice
    When ingresa el correo asociado a su cuenta
    Then el sistema envía un enlace de restablecimiento al correo indicado
    And muestra un mensaje confirmando el envío

  Scenario: Restablecimiento exitoso de contraseña
    Given que el administrador accedió al enlace de restablecimiento vigente
    When define una nueva contraseña válida y la confirma correctamente
    Then el sistema actualiza la contraseña
    And redirige al inicio de sesión con un mensaje de confirmación
    And el siguiente inicio de sesión requiere 2FA como siempre

  Scenario: Enlace de restablecimiento expirado
    Given que el enlace superó su tiempo de vigencia
    When el administrador intenta acceder
    Then el sistema informa que el enlace expiró
    And ofrece solicitar uno nuevo

  Scenario: Correo no registrado en el sistema
    Given que el correo ingresado no existe en el backoffice
    When el administrador solicita la recuperación
    Then el sistema muestra un mensaje indicando que no existe una cuenta con ese correo

````

#### US-AP-04 · Cerrar sesión del backoffice

Como administrador de la plataforma,
quiero cerrar mi sesión en el backoffice de forma segura
para poder proteger el acceso superadmin cuando dejo de usar el equipo.
**Criterios de aceptación (Gherkin)**
````
Feature: Cierre de sesión seguro del Admin Plataforma

  Scenario: Cierre de sesión exitoso con confirmación
    Given que el administrador tiene una sesión activa en el backoffice
    When accede a la opción "Cerrar sesión"
    Then el sistema solicita confirmación antes de cerrar
    And al confirmar invalida el token de sesión del servidor
    And elimina el token del dispositivo
    And redirige al administrador a la pantalla de inicio de sesión

  Scenario: El administrador cancela el cierre de sesión
    Given que el diálogo de confirmación está visible
    When toca "Cancelar"
    Then el sistema mantiene la sesión activa sin cambios

  Scenario: Sesión expirada automáticamente por inactividad
    Given que el administrador no ha interactuado con el backoffice durante el tiempo máximo permitido
    When el token de sesión expira en el servidor
    Then el sistema cierra la sesión automáticamente
    And redirige al inicio de sesión informando que la sesión expiró
    And la acción de expiración queda registrada en el audit log

````

#### US-AP-05 · Consultar el audit log de acciones del backoffice

Como administrador de la plataforma,
quiero poder consultar el registro de todas las acciones realizadas en el backoffice con marca de tiempo y autor
para poder garantizar trazabilidad operativa, detectar acciones no autorizadas y cumplir con requisitos de auditoría.
**Criterios de aceptación (Gherkin)**
````
Feature: Consulta del audit log del backoffice

  Scenario: El administrador accede al listado del audit log
    Given que el administrador está en el panel de backoffice
    When navega a la sección "Audit Log"
    Then el sistema muestra el historial de acciones en orden cronológico descendente
    And cada entrada incluye: fecha, hora, administrador que ejecutó la acción, tipo de acción y entidad afectada (mall, tienda, usuario, etc.)

  Scenario: El administrador filtra el audit log por tipo de acción
    Given que el administrador está en el audit log
    When aplica el filtro por tipo de acción "Aprobación de tienda"
    Then el sistema muestra únicamente las entradas de ese tipo de acción

  Scenario: El administrador filtra el audit log por rango de fechas
    Given que el administrador está en el audit log
    When define un rango de fechas específico
    Then el sistema muestra únicamente las entradas registradas en ese período

  Scenario: El administrador filtra el audit log por usuario ejecutor
    Given que el backoffice tiene múltiples administradores de plataforma
    When el administrador filtra por el nombre de un miembro específico del equipo
    Then el sistema muestra únicamente las acciones ejecutadas por ese miembro

  Scenario: Toda acción sensible se registra automáticamente en el audit log
    Given que cualquier administrador ejecuta una acción sensible (crear mall, suspender tienda, cambiar plan, moderar contenido)
    When la acción se completa exitosamente
    Then el sistema registra automáticamente la entrada en el audit log sin intervención manual
    And la entrada no puede ser editada ni eliminada por ningún rol

````

#### US-AP-06 · Ver el dashboard global de métricas de la plataforma

Como administrador de la plataforma,
quiero ver un dashboard con las métricas globales de toda la plataforma MallHub
para poder monitorear la salud operativa del negocio, detectar tendencias y tomar decisiones estratégicas.
**Criterios de aceptación (Gherkin)**
````
Feature: Dashboard global de métricas de la plataforma

  Scenario: El dashboard carga con métricas globales del período activo
    Given que el administrador inicia sesión correctamente en el backoffice
    When accede a la sección "Dashboard Global"
    Then el sistema muestra métricas agregadas de toda la plataforma:
      total de malls activos, total de tiendas activas, total de usuarios registrados,
      total de reservas del período y tasa de conversión global

  Scenario: El administrador consulta métricas desglosadas por mall
    Given que el administrador está en el dashboard global
    When selecciona un mall específico del listado
    Then el sistema muestra las métricas del período para ese mall en particular
    Y puede compararse con el promedio de todos los malls de la plataforma

  Scenario: El administrador cambia el período de análisis global
    Given que el administrador está en el dashboard global
    When selecciona un período diferente (últimos 7 días, 30 días, 90 días)
    Then el sistema recalcula todas las métricas para el rango seleccionado
    And actualiza todas las gráficas e indicadores de la pantalla

  Scenario: El dashboard global no tiene datos por ser una plataforma nueva
    Given que la plataforma fue activada recientemente sin actividad registrada
    When el administrador accede al dashboard
    Then el sistema muestra los KPIs en cero con mensajes orientativos
    And sugiere las acciones iniciales para generar actividad (crear malls, incorporar tiendas)

````

#### US-AP-07 · Monitorear la salud técnica de la plataforma

Como administrador de la plataforma,
quiero consultar indicadores del estado técnico del sistema y recibir alertas ante anomalías
para poder detectar y escalar problemas de infraestructura antes de que afecten a los usuarios.
**Criterios de aceptación (Gherkin)**
````
Feature: Monitoreo de salud técnica de la plataforma

  Scenario: El administrador accede al panel de salud técnica
    Given que el administrador está en el backoffice
    When navega a la sección "Salud de la Plataforma"
    Then el sistema muestra el estado operativo de los servicios críticos
    And cada servicio indica su estado: Operativo, Degradado o Con incidencia

  Scenario: El sistema detecta una anomalía y genera una alerta
    Given que un servicio crítico de la plataforma presenta comportamiento anormal
    When el sistema de monitoreo detecta la anomalía
    Then genera una alerta visible en el panel de salud técnica
    And envía una notificación al administrador de la plataforma
    And registra la anomalía con marca de tiempo en el historial de incidencias

  Scenario: El administrador consulta el historial de incidencias
    Given que el administrador está en la sección de salud técnica
    When accede al historial de incidencias
    Then el sistema muestra todas las anomalías registradas con: fecha, servicio afectado, duración y estado de resolución

  Scenario: Una anomalía se resuelve y el estado del servicio se normaliza
    Given que un servicio estaba marcado como "Con incidencia"
    And el problema fue resuelto
    When el sistema detecta que el servicio volvió a operar correctamente
    Then actualiza el estado del servicio a "Operativo"
    And registra la resolución en el historial de incidencias con marca de tiempo

````

#### US-AP-08 · Crear un nuevo mall en la plataforma

Como administrador de la plataforma,
quiero crear y configurar un nuevo mall en el sistema
para poder incorporar un nuevo cliente B2B al ecosistema de MallHub y habilitarlo para que sus tiendas y compradores puedan usarlo.
**Criterios de aceptación (Gherkin)**
````
Feature: Creación de un nuevo mall en el backoffice

  Scenario: El administrador crea un mall con datos completos
    Given que el administrador está en la sección "Gestión de Malls" del backoffice
    When toca "Crear nuevo mall"
    And completa los campos obligatorios: nombre, ciudad, dirección, horarios y datos de contacto del administrador del CC
    And toca "Crear mall"
    Then el sistema crea el mall en estado "Inactivo" (no visible en la app)
    And genera automáticamente la cuenta del Administrador del CC con las credenciales de acceso
    And registra la creación en el audit log
    And muestra un mensaje de confirmación con el ID del nuevo mall

  Scenario: El administrador intenta crear un mall con nombre duplicado en la misma ciudad
    Given que ya existe un mall con el mismo nombre en la misma ciudad
    When el administrador intenta crear el nuevo mall con esos datos
    Then el sistema muestra una advertencia de posible duplicado
    And permite al administrador confirmar si se trata de un mall diferente o cancelar

  Scenario: Intento de crear mall con campos obligatorios incompletos
    Given que el administrador está en el formulario de creación de mall
    When intenta guardar sin completar todos los campos obligatorios
    Then el sistema resalta los campos faltantes con mensajes de error
    And no crea el mall hasta que se completen todos los campos requeridos

  Scenario: La creación del mall queda registrada en el audit log
    Given que el administrador crea un nuevo mall exitosamente
    When la operación se completa
    Then el sistema registra en el audit log: el administrador que ejecutó la acción, la fecha y hora, el nombre del mall creado y su ID

````

#### US-AP-09 · Editar la configuración de un mall existente

Como administrador de la plataforma,
quiero poder editar los datos de configuración de cualquier mall del sistema
para poder corregir información incorrecta, actualizar datos de contacto o ajustar parámetros operativos.
**Criterios de aceptación (Gherkin)**
````
Feature: Edición de configuración de mall por el Admin Plataforma

  Scenario: El administrador edita el nombre y datos de contacto de un mall
    Given que el administrador está en el detalle de un mall en el backoffice
    When modifica el nombre o los datos de contacto del administrador del CC
    And guarda los cambios
    Then el sistema actualiza los datos del mall
    And registra la edición en el audit log con los campos modificados

  Scenario: El administrador reasigna el correo del Admin CC de un mall
    Given que el mall tiene un administrador CC asignado con un correo específico
    When el administrador de la plataforma actualiza el correo del Admin CC
    Then el sistema actualiza las credenciales de acceso del Admin CC
    And envía una notificación al nuevo correo con las instrucciones de acceso

  Scenario: Guardar cambios con nombre de mall vacío
    Given que el administrador está editando un mall
    When borra el nombre y toca "Guardar"
    Then el sistema muestra un error indicando que el nombre del mall es obligatorio
    And no guarda los cambios

````

#### US-AP-10 · Activar un mall para hacerlo visible en la app

Como administrador de la plataforma,
quiero activar un mall que fue creado pero aún está inactivo
para poder que aparezca en la app del comprador y sus tiendas puedan comenzar a operar.
**Criterios de aceptación (Gherkin)**
````
Feature: Activación de mall por el Admin Plataforma

  Scenario: El administrador activa un mall con configuración mínima completa
    Given que el mall existe en el sistema en estado "Inactivo"
    And tiene al menos nombre, ciudad, dirección y un Admin CC asignado
    When el administrador toca "Activar mall" y confirma
    Then el sistema cambia el estado del mall a "Activo"
    And el mall aparece en la lista de malls disponibles en la app del comprador
    And se notifica al Admin CC que su mall fue activado y es visible en la plataforma
    And la activación queda registrada en el audit log

  Scenario: Intento de activar un mall sin configuración mínima
    Given que el mall no tiene Admin CC asignado o le faltan datos obligatorios
    When el administrador intenta activarlo
    Then el sistema muestra un listado de los requisitos faltantes
    Y bloquea la activación hasta que se completen

  Scenario: El administrador cancela la activación del mall
    Given que el diálogo de confirmación de activación está visible
    When el administrador toca "Cancelar"
    Then el sistema cierra el diálogo
    And el mall permanece en estado "Inactivo"

````

#### US-AP-11 · Desactivar o suspender un mall activo

Como administrador de la plataforma,
quiero poder desactivar o suspender un mall activo
para poder gestionar incumplimientos contractuales, problemas de pago o situaciones que requieran retirar temporalmente un mall de la plataforma.
**Criterios de aceptación (Gherkin)**
````
Feature: Desactivación o suspensión de mall activo por el Admin Plataforma

  Scenario: El administrador suspende un mall activo con motivo
    Given que el mall está en estado "Activo"
    When el administrador toca "Suspender mall"
    Then el sistema muestra un campo obligatorio para ingresar el motivo de la suspensión
    And al confirmar cambia el estado del mall a "Suspendido"
    And el mall deja de ser visible en la app del comprador
    And todas las tiendas del mall quedan inaccesibles para los compradores
    And se notifica al Admin CC del mall indicando el motivo de la suspensión
    And la acción queda registrada en el audit log

  Scenario: Intento de suspender sin ingresar el motivo
    Given que el diálogo de suspensión está abierto
    When el administrador intenta confirmar sin ingresar el motivo
    Then el sistema muestra un error indicando que el motivo es obligatorio
    And no procesa la suspensión

  Scenario: El administrador reactiva un mall suspendido
    Given que el mall está en estado "Suspendido"
    When el administrador toca "Reactivar mall" y confirma
    Then el sistema cambia el estado a "Activo"
    And el mall vuelve a ser visible en la app del comprador
    And se notifica al Admin CC que el mall fue reactivado
    And la reactivación queda registrada en el audit log

````

#### US-AP-12 · Ver el listado global de todos los malls

Como administrador de la plataforma,
quiero ver el listado completo de todos los malls registrados en la plataforma con su estado
para poder tener visibilidad transversal y gestionar cualquier mall desde un único punto de control.
**Criterios de aceptación (Gherkin)**
````
Feature: Listado global de malls en el backoffice

  Scenario: El administrador accede al listado de todos los malls
    Given que el administrador está en la sección "Gestión de Malls"
    When la pantalla carga
    Then el sistema muestra todos los malls registrados en la plataforma
    And cada fila incluye: nombre, ciudad, estado (Activo / Inactivo / Suspendido), número de tiendas activas, Admin CC asignado y fecha de creación

  Scenario: El administrador filtra malls por estado
    Given que el administrador está en el listado de malls
    When aplica el filtro "Suspendidos"
    Then el sistema muestra únicamente los malls en estado suspendido

  Scenario: El administrador filtra malls por ciudad
    Given que el administrador está en el listado de malls
    When filtra por ciudad "Medellín"
    Then el sistema muestra únicamente los malls ubicados en esa ciudad

  Scenario: El administrador busca un mall por nombre
    Given que el administrador está en el listado de malls
    When escribe en la barra de búsqueda el nombre parcial o completo de un mall
    Then el sistema filtra en tiempo real mostrando únicamente los malls que coinciden con el término

````

#### US-AP-13 · Aprobar el registro de una tienda a nivel global

Como administrador de la plataforma,
quiero poder aprobar el registro de una tienda desde el backoffice cuando el Admin CC no lo ha hecho en el tiempo esperado
para poder garantizar que las tiendas no queden bloqueadas indefinidamente en estado pendiente.
**Criterios de aceptación (Gherkin)**
````
Feature: Aprobación global de registro de tienda por el Admin Plataforma

  Scenario: El administrador aprueba una tienda pendiente desde el backoffice
    Given que el administrador visualiza una tienda en estado "Pendiente de aprobación" en el backoffice
    When revisa el perfil de la tienda y toca "Aprobar"
    Then el sistema cambia el estado de la tienda a "Activa"
    And la tienda aparece en el directorio del mall correspondiente en la app
    And se notifica al administrador de la tienda y al Admin CC del mall
    And la aprobación queda registrada en el audit log

  Scenario: El administrador aprueba una tienda superando el tiempo de revisión del Admin CC
    Given que la tienda lleva más de 24 horas en estado "Pendiente" sin ser revisada por el Admin CC
    When el administrador de plataforma la aprueba desde el backoffice
    Then el sistema la activa correctamente
    And registra que la aprobación fue realizada por el Admin Plataforma y no por el Admin CC

  Scenario: El administrador rechaza una tienda desde el backoffice
    Given que el administrador visualiza una tienda en estado "Pendiente"
    When toca "Rechazar" e ingresa el motivo
    Then el sistema cambia el estado a rechazada
    And notifica al administrador de la tienda con el motivo proporcionado
    And registra la acción en el audit log

````

#### US-AP-14 · Suspender una tienda a nivel global

Como administrador de la plataforma,
quiero poder suspender cualquier tienda de cualquier mall directamente desde el backoffice
para poder actuar de forma inmediata ante contenido inapropiado, incumplimientos graves o situaciones que comprometan la experiencia del comprador.
**Criterios de aceptación (Gherkin)**
````
Feature: Suspensión global de tienda por el Admin Plataforma

  Scenario: El administrador suspende una tienda activa de cualquier mall
    Given que el administrador identifica una tienda que requiere suspensión inmediata
    When accede al detalle de la tienda en el backoffice y toca "Suspender tienda"
    Then el sistema solicita el motivo de la suspensión
    And al confirmar cambia el estado de la tienda a "Suspendida"
    And la tienda deja de ser visible para los compradores en la app
    And se notifica al administrador de la tienda y al Admin CC del mall con el motivo
    And la suspensión queda registrada en el audit log con el nombre del administrador que la ejecutó

  Scenario: El administrador reactiva una tienda suspendida desde el backoffice
    Given que una tienda está en estado "Suspendida" por acción del Admin Plataforma
    When el administrador toca "Reactivar" y confirma
    Then el sistema cambia el estado a "Activa"
    And la tienda vuelve a ser visible en la app
    And se notifica al administrador de la tienda y al Admin CC
    And la reactivación queda registrada en el audit log

````

#### US-AP-15 · Moderar contenido inapropiado en catálogos de tiendas

Como administrador de la plataforma,
quiero poder revisar y eliminar contenido inapropiado o incorrecto en los catálogos de productos de las tiendas
para poder mantener la calidad y confiabilidad de la plataforma para todos los compradores.
**Criterios de aceptación (Gherkin)**
````
Feature: Moderación de contenido de catálogos por el Admin Plataforma

  Scenario: El administrador accede a la cola de moderación de contenido
    Given que el administrador está en la sección "Moderación de Contenido"
    When la pantalla carga
    Then el sistema muestra el listado de productos o contenidos reportados o marcados para revisión
    And cada ítem indica: tienda, tipo de contenido, motivo del reporte y fecha

  Scenario: El administrador elimina un producto con contenido inapropiado
    Given que el administrador está revisando un producto reportado
    And determina que el contenido viola las políticas de la plataforma
    When toca "Eliminar contenido" e ingresa el motivo
    Then el sistema elimina el producto del catálogo de la tienda
    And notifica al administrador de la tienda que el producto fue removido con el motivo indicado
    And registra la moderación en el audit log

  Scenario: El administrador descarta un reporte de moderación sin acción
    Given que el administrador revisó un contenido reportado
    And determina que no viola las políticas de la plataforma
    When toca "Descartar reporte"
    Then el sistema marca el reporte como revisado y descartado
    And el contenido permanece publicado sin cambios

  Scenario: El administrador modifica información incorrecta en el perfil de una tienda
    Given que el perfil de una tienda contiene información incorrecta (nombre, imágenes, descripción)
    When el administrador edita directamente los campos desde el backoffice
    Then el sistema actualiza la información
    And notifica al administrador de la tienda del cambio realizado
    And registra la modificación en el audit log

````

#### US-AP-16 · Moderar contenido de imágenes en tiendas y malls

Como administrador de la plataforma,
quiero poder revisar y eliminar imágenes inapropiadas subidas por tiendas o administradores de mall
para poder garantizar que el contenido visual de la plataforma cumple con las políticas de uso aceptable.
**Criterios de aceptación (Gherkin)**
````
Feature: Moderación de imágenes en el backoffice

  Scenario: El administrador elimina una imagen inapropiada de una tienda
    Given que el administrador está revisando el perfil de una tienda en el backoffice
    And detecta una imagen que viola las políticas de la plataforma
    When toca "Eliminar imagen" en esa imagen específica e ingresa el motivo
    Then el sistema elimina la imagen del perfil de la tienda
    And notifica al administrador de la tienda indicando qué imagen fue removida y por qué
    And registra la acción en el audit log

  Scenario: El administrador elimina una imagen inapropiada del perfil de un mall
    Given que el perfil de un mall contiene una imagen que no cumple las políticas
    When el administrador la elimina desde el backoffice con un motivo
    Then el sistema elimina la imagen del perfil del mall
    And notifica al Admin CC del mall
    And registra la acción en el audit log

  Scenario: La imagen eliminada deja de ser visible en la app inmediatamente
    Given que el administrador eliminó una imagen de contenido
    When la eliminación se procesa
    Then la imagen deja de ser visible para los compradores en la app en tiempo real
    And el espacio en el perfil refleja la ausencia sin generar errores visuales

````

#### US-AP-17 · Asignar o cambiar el plan de suscripción de un mall

Como administrador de la plataforma,
quiero poder asignar o modificar el plan de suscripción de cualquier mall
para poder gestionar contratos, activar períodos de prueba, aplicar upgrades o resolver situaciones de facturación.
**Criterios de aceptación (Gherkin)**
````
Feature: Gestión del plan de suscripción de un mall

  Scenario: El administrador asigna un plan a un mall nuevo
    Given que el mall fue creado pero aún no tiene plan de suscripción asignado
    When el administrador navega al detalle del mall y selecciona el plan correspondiente
    And define la fecha de inicio y la duración del contrato
    And confirma la asignación
    Then el sistema asigna el plan al mall
    And actualiza el estado de suscripción en el perfil del mall
    And notifica al Admin CC que el plan está activo
    And registra la asignación en el audit log

  Scenario: El administrador cambia el plan de un mall de básico a premium
    Given que el mall tiene un plan básico activo
    When el administrador selecciona el nuevo plan y confirma el cambio
    Then el sistema actualiza el plan del mall
    And habilita las funcionalidades adicionales del nuevo plan inmediatamente
    And registra el cambio en el audit log con el plan anterior y el nuevo plan

  Scenario: El administrador aplica un período de prueba gratuito a un mall
    Given que el mall es nuevo y cumple los criterios para un período de prueba
    When el administrador activa el período de prueba con una fecha de vencimiento definida
    Then el sistema activa el período de prueba
    And programa una alerta automática para notificar al equipo comercial cuando el período esté próximo a vencer

  Scenario: El plan de suscripción de un mall vence sin renovación
    Given que la fecha de vencimiento del plan de un mall se alcanzó
    And no hay renovación confirmada
    When el sistema detecta el vencimiento
    Then cambia el estado del plan a "Vencido"
    And genera una alerta en el backoffice para el administrador de la plataforma
    And notifica al Admin CC del mall sobre el vencimiento

````

#### US-AP-18 · Asignar o cambiar el plan de suscripción de una tienda

Como administrador de la plataforma,
quiero poder asignar o modificar el plan de suscripción (Básico / Pro) de cualquier tienda
para poder gestionar upgrades, downgrades y situaciones especiales de facturación de locales comerciales.
**Criterios de aceptación (Gherkin)**
````
Feature: Gestión del plan de suscripción de una tienda

  Scenario: El administrador activa el Plan Pro para una tienda
    Given que la tienda tiene un plan básico activo
    When el administrador accede al detalle de la tienda y selecciona "Plan Pro"
    And confirma el cambio
    Then el sistema actualiza el plan de la tienda a Pro
    And habilita las funcionalidades exclusivas del Plan Pro (analytics avanzados, prioridad en búsqueda)
    And notifica al administrador de la tienda que el Plan Pro está activo
    And registra el cambio en el audit log

  Scenario: El administrador hace downgrade de una tienda de Pro a Básico
    Given que la tienda tiene Plan Pro activo
    When el administrador cambia el plan a Básico
    Then el sistema actualiza el plan
    And deshabilita las funcionalidades exclusivas del Plan Pro
    And notifica al administrador de la tienda del cambio de plan
    And registra la acción en el audit log

  Scenario: El administrador consulta el estado de suscripción de una tienda
    Given que el administrador está en el detalle de una tienda en el backoffice
    When visualiza la sección de plan y facturación
    Then el sistema muestra: plan activo, fecha de inicio, fecha de vencimiento y estado de pago

````

#### US-AP-19 · Ver y gestionar el estado de facturación de malls y tiendas

Como administrador de la plataforma,
quiero poder consultar y gestionar el estado de facturación de cualquier mall o tienda
para poder identificar cuentas con pagos pendientes, aplicar ajustes manuales y mantener la salud financiera de la plataforma.
**Criterios de aceptación (Gherkin)**
````
Feature: Gestión del estado de facturación en el backoffice

  Scenario: El administrador accede al listado de facturación de malls
    Given que el administrador está en la sección "Facturación" del backoffice
    When visualiza la pestaña de malls
    Then el sistema muestra todos los malls con su estado de pago: Al día, Con pago pendiente o Vencido
    And cada fila incluye: nombre del mall, plan activo, monto, fecha de vencimiento y estado

  Scenario: El administrador filtra cuentas con pagos pendientes
    Given que el administrador está en la sección de facturación
    When aplica el filtro "Con pago pendiente"
    Then el sistema muestra únicamente los malls o tiendas con saldos pendientes de pago

  Scenario: El administrador registra manualmente un pago recibido
    Given que un mall o tienda realizó un pago por fuera de la plataforma
    When el administrador selecciona la cuenta y registra el pago con monto, fecha y medio de pago
    Then el sistema actualiza el estado de facturación a "Al día"
    And registra el pago manual en el audit log con el administrador que lo ejecutó

  Scenario: El administrador genera una alerta de cobro para una cuenta vencida
    Given que una cuenta tiene un pago con más de X días de vencimiento
    When el administrador toca "Enviar alerta de cobro"
    Then el sistema envía una notificación al Admin CC del mall o al administrador de la tienda
    And registra el envío de la alerta en el historial de facturación de esa cuenta

````

#### US-AP-20 · Crear y gestionar campañas publicitarias nativas en la app

Como administrador de la plataforma,
quiero poder crear y gestionar campañas de publicidad nativa dentro de la app MallHub
para poder monetizar espacios publicitarios y visibilizar malls, tiendas o anunciantes estratégicos a los compradores.
**Criterios de aceptación (Gherkin)**
````
Feature: Gestión de campañas publicitarias nativas por el Admin Plataforma

  Scenario: El administrador crea una nueva campaña publicitaria
    Given que el administrador está en la sección "Campañas Publicitarias" del backoffice
    When toca "Nueva campaña"
    And completa: nombre de la campaña, anunciante, tipo de banner, imagen, URL de destino, mall(s) objetivo, fecha de inicio y fecha de fin
    And toca "Activar campaña"
    Then el sistema activa la campaña
    And el banner o contenido patrocinado comienza a mostrarse en la app a los compradores del mall objetivo
    And la activación queda registrada en el audit log

  Scenario: El administrador pausa una campaña activa
    Given que existe una campaña publicitaria activa
    When el administrador toca "Pausar campaña"
    Then el sistema detiene la publicación del contenido patrocinado inmediatamente
    And cambia el estado de la campaña a "Pausada"
    And registra la pausa en el audit log

  Scenario: El administrador define el mall objetivo de una campaña
    Given que el administrador está creando una campaña
    When selecciona uno o varios malls donde se mostrará la campaña
    Then el sistema vincula la campaña a esos malls
    And el contenido solo se muestra a los compradores de esos malls específicos

  Scenario: Una campaña expira automáticamente al llegar la fecha de fin
    Given que una campaña tiene fecha de fin definida
    When el sistema detecta que la fecha de fin fue alcanzada
    Then desactiva automáticamente la campaña
    And cambia su estado a "Finalizada"
    And genera una alerta en el backoffice para el administrador de la plataforma

````

#### US-AP-21 · Consultar métricas de rendimiento de una campaña publicitaria

Como administrador de la plataforma,
quiero ver las métricas de rendimiento de las campañas publicitarias activas y finalizadas
para poder evaluar el ROI de los espacios publicitarios y reportar resultados a los anunciantes.
**Criterios de aceptación (Gherkin)**
````
Feature: Métricas de rendimiento de campañas publicitarias

  Scenario: El administrador consulta las métricas de una campaña activa
    Given que el administrador está en la sección de Campañas Publicitarias
    When toca "Ver métricas" en una campaña activa
    Then el sistema muestra: impresiones, clics, tasa de clics (CTR) y malls donde se está mostrando

  Scenario: El administrador consulta las métricas de una campaña finalizada
    Given que la campaña ya finalizó
    When el administrador accede a sus métricas
    Then el sistema muestra las métricas consolidadas del período completo de la campaña
    And permite exportar el reporte de rendimiento

  Scenario: La campaña tiene cero interacciones
    Given que la campaña fue activada pero ningún comprador ha interactuado con el banner
    When el administrador consulta las métricas
    Then el sistema muestra los contadores en cero
    And no muestra errores técnicos ni datos inconsistentes

````

#### US-AP-22 · Ver el listado global de tiendas de toda la plataforma

Como administrador de la plataforma,
quiero tener una vista transversal de todas las tiendas registradas en todos los malls de la plataforma
para poder hacer seguimiento global, detectar patrones y actuar sobre cualquier tienda sin restricción de tenant.
**Criterios de aceptación (Gherkin)**
````
Feature: Listado global de tiendas en el backoffice

  Scenario: El administrador accede al listado global de tiendas
    Given que el administrador está en la sección "Gestión Global de Tiendas" del backoffice
    When la pantalla carga
    Then el sistema muestra todas las tiendas de todos los malls de la plataforma
    And cada fila incluye: nombre de la tienda, mall al que pertenece, plan activo, estado y fecha de registro

  Scenario: El administrador filtra tiendas por mall
    Given que el administrador está en el listado global de tiendas
    When selecciona un mall específico en el filtro
    Then el sistema muestra únicamente las tiendas de ese mall

  Scenario: El administrador filtra tiendas por plan de suscripción
    Given que el administrador está en el listado global de tiendas
    When aplica el filtro "Plan Pro"
    Then el sistema muestra únicamente las tiendas con Plan Pro activo en toda la plataforma

  Scenario: El administrador filtra tiendas por estado
    Given que el administrador está en el listado global de tiendas
    When aplica el filtro "Suspendidas"
    Then el sistema muestra únicamente las tiendas en estado suspendido de toda la plataforma

````

### 3.3 Calidad del servicio

Los atributos de esta sección son medibles y verificables. Cada requisito incluye el umbral objetivo para v1.0 (MVP) y, donde aplica, el umbral de degradación aceptable. Los valores se revisarán al final de cada fase de crecimiento.

> **Contexto de escala para v1.0:** 2–3 malls piloto · ~150 tiendas activas · ~5.000 usuarios registrados · ~10.000 pedidos/mes estimados. Los umbrales se dimensionan para este escenario y contemplan headroom de ×10 sin rediseño de arquitectura.

---

#### 3.3.1 Rendimiento

**Latencia de la API REST (backend → cliente)**

| Operación | P50 | P95 | P99 | Inaceptable |
|---|---|---|---|---|
| GET catálogo / directorio (lectura en caché) | < 150 ms | < 400 ms | < 800 ms | > 2 s |
| POST reserva (escritura + notificación) | < 500 ms | < 1.200 ms | < 2.000 ms | > 5 s |
| GET dashboard KPIs (analytics, sin caché) | < 800 ms | < 2.000 ms | < 4.000 ms | > 8 s |
| Búsqueda de productos (full-text) | < 250 ms | < 600 ms | < 1.000 ms | > 3 s |
| Autenticación (login / token refresh) | < 300 ms | < 700 ms | < 1.200 ms | > 3 s |
| Upload de imagen (1 archivo, máx. 2 MB) | < 2 s | < 5 s | < 8 s | > 15 s |

La medición se realiza desde el servidor (tiempo de procesamiento + serialización), excluyendo latencia de red del cliente. Los umbrales aplican bajo carga nominal (< 500 req/s concurrentes en v1.0).

**Rendimiento del cliente Tauri**

| Métrica | Objetivo | Método de medición |
|---|---|---|
| First Contentful Paint — MallHub App (móvil, conexión 4G) | < 1.5 s | Lighthouse / WebPageTest |
| Time to Interactive — MallHub App (Home Feed) | < 3 s | Lighthouse |
| Tiempo de arranque en frío — MallHub Store/Insights (escritorio) | < 2 s desde ícono hasta UI interactiva | Medición manual en máquina objetivo |
| Uso de memoria RAM en reposo — MallHub App (móvil) | < 120 MB | Profiler Tauri / Android Studio |
| Uso de memoria RAM en reposo — Store/Insights (escritorio) | < 250 MB | Profiler de SO |
| Tamaño del bundle instalable — MallHub App (iOS .ipa / Android .apk) | < 50 MB | Medición post-build |

**Throughput del sistema**

El backend debe soportar un mínimo de **500 solicitudes concurrentes** por segundo sin degradación de latencia por encima del P95 documentado. El sistema de push notifications debe entregar al menos **10.000 notificaciones/minuto** sin acumulación de cola que supere los 60 segundos de retraso.

**Debounce y UX de búsqueda**

El campo de búsqueda en MallHub App debe aplicar un debounce de exactamente **300 ms** antes de lanzar la consulta al backend, medido desde la última tecla pulsada hasta el envío de la petición HTTP.

**Actualización de datos en tiempo real**

Los KPIs del dashboard MallHub Insights deben reflejar datos con un desfase máximo de **5 minutos** respecto al momento de consulta. Los cambios de estado de reserva (Pendiente → Confirmada / Cancelada) deben propagarse vía WebSocket al cliente del comprador en un máximo de **3 segundos** desde el momento en que el Admin Local ejecuta la acción.

**Offerta flash y contadores**

Los contadores regresivos de ofertas flash deben decrementarse con precisión de ±1 segundo en el cliente, sin sincronización continua con el servidor (el countdown se inicializa con la fecha de fin desde la API y se computa localmente en el frontend).

---

#### 3.3.2 Seguridad

**Cifrado en tránsito**

Toda comunicación entre los clientes Tauri (app y escritorio) y el backend debe realizarse sobre **HTTPS con TLS 1.2 como mínimo y TLS 1.3 como preferido**. No se permiten conexiones HTTP sin cifrar en ningún ambiente productivo. Los certificados deben ser renovados automáticamente (Let's Encrypt o equivalente gestionado por el proveedor cloud).

**Cifrado en reposo**

Los datos en base de datos (PostgreSQL o equivalente) deben cifrarse en reposo usando **AES-256**. Los backups deben cifrarse con la misma clave de forma transparente. Las credenciales, secretos de API y claves de cifrado deben gestionarse en un servicio de gestión de secretos dedicado (AWS Secrets Manager, GCP Secret Manager o equivalente); nunca en variables de entorno de texto plano ni en el código fuente.

**Autenticación y autorización**

Los tokens JWT deben usar el algoritmo de firma **RS256** (RSA 2048-bit). El tiempo de expiración del access token es de **60 minutos**; el del refresh token de **30 días**. Los tokens deben almacenarse en el keychain nativo del SO a través de los mecanismos provistos por Tauri, nunca en `localStorage`, `sessionStorage` ni almacenamiento no cifrado. El control de acceso RBAC (5 roles: Invitado, Cliente Registrado, Admin Local, Admin CC, Admin Plataforma) debe evaluarse en el backend en cada solicitud; el frontend no puede ser la única barrera de autorización.

**2FA para Admin Plataforma**

El rol Admin Plataforma debe requerir autenticación de doble factor basada en TOTP (RFC 6238, compatible con Google Authenticator y apps equivalentes) como requisito obligatorio e irrevocable. No se puede acceder al backoffice sin 2FA activo.

**Aislamiento multi-tenant**

Cada mall opera como un tenant aislado. El backend debe aplicar filtrado por `tenant_id` en el 100% de las consultas a recursos del tenant (tiendas, productos, reservas, eventos, KPIs). Una consulta que omita el filtro de tenant debe ser bloqueada a nivel de middleware antes de llegar a la base de datos. Los tests de integración deben incluir casos que verifiquen que un Admin CC no puede leer ni modificar datos de otro mall, incluso con tokens válidos.

**Protección contra ataques web comunes**

El backend debe implementar protección contra: inyección SQL (queries parametrizadas, ORMs tipados), XSS (sanitización de inputs, Content Security Policy en endpoints web), CSRF (tokens SameSite en cookies, validación de origin), y enumeración de usuarios (mensajes de error genéricos en login y recuperación de contraseña). Los endpoints de autenticación deben aplicar **rate limiting** de 10 intentos por IP por minuto.

**Bloqueo de cuenta por intentos fallidos**

La cuenta de un usuario se bloquea temporalmente por **15 minutos** tras **5 intentos fallidos consecutivos** de inicio de sesión. El bloqueo se registra en el sistema de auditoría con timestamp e IP del intento.

**Gestión de datos de pago (PCI-DSS)**

MallHub no almacena, procesa ni transmite datos de tarjeta de crédito directamente. El procesamiento queda íntegramente delegado a la pasarela certificada (Wompi, MercadoPago o Stripe). La integración se realiza vía tokenización del lado del cliente: el número de tarjeta nunca pasa por los servidores de MallHub. Los webhooks de la pasarela deben validarse mediante verificación de firma HMAC antes de procesar cualquier evento.

**Gestión de imágenes y contenido**

Las imágenes cargadas por usuarios deben ser validadas por tipo MIME real (no solo extensión) antes de almacenarse. El sistema debe rechazar archivos con tipos MIME no admitidos. Las imágenes deben servirse siempre desde CDN con URLs firmadas de tiempo limitado cuando el contenido es sensible; el acceso directo al bucket de almacenamiento debe estar bloqueado para el público.

**Audit log**

Todas las acciones administrativas (activación de malls, aprobación/rechazo de tiendas, retiro de contenido, cambios de suscripción, modificaciones de configuración) deben registrarse en un log de auditoría inmutable con: timestamp UTC, ID del actor, rol, tipo de acción, recurso afectado y resultado. El log de auditoría debe ser de solo lectura desde todas las interfaces de usuario.

---

#### 3.3.3 Confiabilidad

**Tasa de errores**

La tasa de errores 5xx del backend no debe superar el **0,1%** de las solicitudes totales en ventana de 1 hora bajo carga nominal. Se considera un incidente P1 cualquier condición donde la tasa de errores supere el **1%** durante más de 5 minutos consecutivos.

**Idempotencia de operaciones críticas**

El endpoint de creación de reserva debe ser idempotente: si el cliente reenvía la misma solicitud (mismo `idempotency_key`) por timeout o error de red, el servidor debe devolver la reserva ya creada sin crear duplicados. Esto evita el escenario de "reserva duplicada por reintento de red".

**Degradación elegante (graceful degradation)**

Si un servicio externo no esencial no está disponible (servicio de mapas, servicio de analytics, servicio de IA), el sistema debe continuar operando en modo degradado sin propagar el error al usuario como fallo total. Específicamente:

- Si el servicio de mapas no responde → la app continúa sin el mapa interactivo; el resto de funcionalidades permanecen operativas.
- Si el pipeline de analytics no responde → el dashboard de Insights muestra datos cacheados del último período disponible con indicador de "última actualización hace X tiempo".
- Si la API de IA (Anthropic) no responde → MallHub Store permite publicar productos en modo manual; MallHub Insights permite exportar datos sin narrativa generada.

**Caché de contenido**

El catálogo de tiendas y productos debe cachearse en el cliente Tauri con TTL de **10 minutos** para lecturas frecuentes, permitiendo navegación básica en condiciones de conectividad degradada. Los datos de sesión, reservas activas y QR de reservas confirmadas deben persistir localmente para acceso offline.

**Reconexión automática de WebSocket**

El cliente debe implementar reconexión automática con **backoff exponencial** (inicio: 1 s, máximo: 30 s, jitter ±20%) ante desconexión del canal WebSocket. Debe intentar reconectar durante un máximo de 5 minutos antes de notificar al usuario que la conexión en tiempo real no está disponible.

**MTBF y MTTR**

| Métrica | Objetivo v1.0 |
|---|---|
| MTBF (Mean Time Between Failures) del backend | > 720 horas (30 días) |
| MTTR (Mean Time To Recovery) ante incidente P1 | < 2 horas |
| MTTR ante incidente P2 (degradación parcial) | < 8 horas |

---

#### 3.3.4 Disponibilidad

**SLA objetivo**

| Tier | Componente | Disponibilidad mensual objetivo | Tiempo de inactividad máximo permitido/mes |
|---|---|---|---|
| **Crítico** | API Backend (REST + WebSocket) | **99,5%** | ~3,6 horas |
| **Crítico** | Base de datos principal | **99,9%** | ~43 minutos |
| **Crítico** | CDN (servicio de imágenes) | **99,9%** | ~43 minutos |
| **Crítico** | Servicio de push notifications | **99,5%** | ~3,6 horas |
| **Importante** | Pipeline de analytics / Insights | **99,0%** | ~7,2 horas |
| **Importante** | Servicio de IA (Anthropic API) | Best-effort (dependencia externa) | Sin SLA propio |

Los SLAs de disponibilidad excluyen ventanas de mantenimiento planificadas notificadas con al menos **48 horas** de antelación.

**Ventanas de mantenimiento**

Los despliegues y operaciones de mantenimiento planificado se programarán preferentemente los **martes y miércoles entre las 02:00 y las 04:00 hora Colombia (COT, UTC–5)**, período de menor tráfico según los patrones proyectados de uso (visitantes de mall, hábitos laborales). Los mantenimientos de más de 10 minutos de impacto deben comunicarse a los Admin CC y Admin Local con notificación en la app con al menos 24 horas de antelación.

**Estrategia de recuperación (Recovery)**

| Escenario | RPO (Recovery Point Objective) | RTO (Recovery Time Objective) |
|---|---|---|
| Fallo de instancia única del backend | 0 (múltiples instancias activas) | < 30 segundos (health check + rerouting automático) |
| Fallo de zona de disponibilidad (cloud) | < 5 minutos (replicación entre zonas) | < 15 minutos |
| Pérdida total de región cloud | < 1 hora (backup en región secundaria) | < 4 horas |
| Corrupción de datos de base de datos | < 1 hora (backup continuo o por hora) | < 2 horas (restauración desde backup) |

**Backups**

La base de datos principal debe respaldarse con una frecuencia mínima de **cada hora** (snapshots incrementales) y **cada 24 horas** (backup completo). Los backups deben almacenarse en una región geográfica diferente a la de producción. La retención de backups es de **30 días** para v1.0. Los procedimientos de restauración deben probarse al menos una vez cada 60 días mediante ejercicio documentado (disaster recovery drill).

---

#### 3.3.5 Observabilidad

**Logs**

Todo servicio del backend debe emitir logs estructurados en formato **JSON** hacia el sistema centralizado de logging (CloudWatch, GCP Cloud Logging o equivalente). Los campos mínimos obligatorios por entrada de log son: `timestamp` (ISO 8601 UTC), `level` (DEBUG/INFO/WARN/ERROR), `service`, `trace_id`, `request_id`, `tenant_id` (cuando aplica), y `message`. Los logs de nivel ERROR e WARN deben incluir el stack trace completo. El tiempo de retención de logs en el sistema centralizado es de **90 días** para v1.0.

**Métricas**

El backend debe exponer métricas de sistema e negocio en tiempo real al dashboard de monitoreo. Las métricas mínimas obligatorias son:

| Categoría | Métrica |
|---|---|
| **Infraestructura** | CPU utilization, Memory usage, Disk I/O, Network throughput |
| **API** | Request rate (req/s), Error rate (%), Latencia P50/P95/P99 por endpoint |
| **Base de datos** | Query latency, Connection pool saturation, Replication lag |
| **Negocio** | Reservas creadas/hora, Reservas confirmadas/hora, Tasa de conversión por mall, Usuarios activos (DAU/MAU) |
| **Colas y WebSocket** | Tamaño de cola de push notifications, Conexiones WebSocket activas, Mensajes entregados/s |

**Trazabilidad distribuida**

Cada solicitud que atraviese más de un servicio debe propagarse con un `trace_id` único (OpenTelemetry o equivalente), permitiendo reconstruir la cadena completa de llamadas (request → API → base de datos → servicio de notificaciones) en el sistema de trazas. Esta capacidad es requisito para la depuración de incidentes P1 y P2.

**Alertas**

El sistema de alertas debe notificar al equipo de operaciones (canal Slack o equivalente + PagerDuty o equivalente) bajo las siguientes condiciones:

| Condición | Severidad | Tiempo de detección |
|---|---|---|
| Error rate API > 1% durante 5 minutos | P1 | < 2 minutos desde inicio |
| Latencia P95 de reserva > 3 s durante 3 minutos | P2 | < 2 minutos |
| Servicio de base de datos no responde | P1 | < 1 minuto |
| Cola de push notifications acumulada > 5.000 mensajes sin procesar | P2 | < 5 minutos |
| Uso de disco en base de datos > 85% | P2 | < 15 minutos |
| Fallo en job de expiración de reservas | P2 | < 10 minutos desde ejecución fallida |
| Tasa de error en servicio de IA > 20% en 10 minutos | P3 | < 10 minutos |

**Panel de salud visible para Admin Plataforma**

El módulo "Monitor de Salud" de MallHub Insights debe exponer el estado operativo de los servicios críticos (API, base de datos, CDN, push, pasarela de pagos) con indicadores de semáforo (verde / amarillo / rojo), actualizados con una frecuencia máxima de **60 segundos**.

---

#### 3.3.6 Escalabilidad

> *Atributo agregado: la naturaleza multi-tenant SaaS de MallHub hace que la escalabilidad sea un atributo de calidad de primera clase, no una consideración de implementación.*

**Escalabilidad horizontal del backend**

El backend debe diseñarse como **stateless**: ninguna instancia debe almacenar estado de sesión en memoria local. El estado de sesión se gestiona mediante JWT validados contra clave pública y datos de usuario en base de datos/caché. Esto permite escalar horizontalmente añadiendo instancias sin coordinación entre nodos.

**Escalado automático**

La infraestructura cloud debe configurar políticas de auto-scaling basadas en CPU (umbral de escalado hacia arriba: > 70% sostenido por 3 minutos) y en métricas de request rate. El tiempo de aprovisionamiento de una nueva instancia (cold start hasta lista para recibir tráfico) no debe superar **60 segundos**.

**Capacidad objetivo por fase**

| Fase | Malls activos | Tiendas activas | Usuarios registrados | Peak concurrent requests |
|---|---|---|---|---|
| v1.0 Piloto (0–6 m) | 3 | 150 | 5.000 | 100 req/s |
| v1.1 Expansión Colombia (6–24 m) | 20 | 3.000 | 100.000 | 1.000 req/s |
| v2.0 LATAM (24 m+) | 100+ | 20.000+ | 1.000.000+ | 5.000+ req/s |

La arquitectura de v1.0 debe alcanzar la capacidad de v1.1 sin cambio de diseño, únicamente ajustando el número de instancias y el tamaño de la base de datos.

---

#### 3.3.7 Accesibilidad

> *Atributo agregado: establecido como restricción normativa en §2.3 y como requisito de interfaz en §3.1.1.*

La interfaz de usuario de todas las superficies (MallHub App, Store e Insights) debe cumplir con los criterios de conformidad **WCAG 2.1 nivel AA** (R7). Los criterios mínimos verificables son:

| Criterio WCAG | Requisito |
|---|---|
| 1.4.3 — Contraste (mínimo) | Texto normal: ratio ≥ 4.5:1 · Texto grande (≥18pt o ≥14pt bold): ratio ≥ 3:1 |
| 1.4.11 — Contraste de componentes no textuales | Bordes de campos, iconos accionables, indicadores de estado: ratio ≥ 3:1 |
| 2.1.1 — Teclado | Toda funcionalidad operable mediante teclado sin trampa de foco (aplicable a Store e Insights en escritorio) |
| 4.1.2 — Nombre, rol, valor | Todos los componentes interactivos tienen nombre accesible, rol ARIA y estado comunicados correctamente |
| 1.1.1 — Contenido no textual | Todas las imágenes con función semántica tienen `alt` text descriptivo |

La app móvil debe ser compatible con **VoiceOver (iOS)** y **TalkBack (Android)**. Los tokens de color del sistema de diseño (Paleta Emerald Market, R4) deben cumplir los ratios de contraste en modo claro y en modo oscuro por separado.

---

#### 3.3.8 Internacionalización (i18n)

> *Atributo agregado: documentado como requisito diferido en §2.6 (REQ-INF-06), pero la arquitectura debe soportarlo desde v1.0.*

En v1.0 la plataforma opera exclusivamente en **español (Colombia, `es-CO`)**. Sin embargo, la arquitectura de i18n debe estar implementada desde el inicio de forma que añadir un nuevo locale no requiera cambios en los componentes de UI. Los requisitos arquitecturales son:

- Todos los textos de la interfaz deben residir en archivos de traducción externalizados (formato JSON o equivalente), nunca hardcodeados en los componentes React.
- El sistema de formato de fechas, horas y monedas debe usar las APIs estándar de `Intl` (ECMAScript), parametrizadas por locale, no por valores fijos.
- Los precios deben mostrarse siempre en **COP (Peso Colombiano)** en v1.0, con símbolo `$` precedido por `COP` en contextos que puedan generar ambigüedad.
- Los formatos de número deben seguir la convención colombiana: separador de miles con punto (`.`) y separador decimal con coma (`,`).

---

### 3.4 Cumplimiento

Los requisitos de esta sección derivan de obligaciones legales, estándares técnicos y políticas sectoriales aplicables a MallHub en Colombia en v1.0. El incumplimiento de cualquier requisito normativo de esta sección es considerado un bloqueador de lanzamiento.

---

#### 3.4.1 Protección de datos personales — Ley 1581 de 2012 (Colombia)

| Requisito | Criterio verificable |
|---|---|
| **Aviso de privacidad** | La app debe mostrar la política de privacidad y los términos de uso antes del primer registro, con aceptación explícita mediante checkbox. No basta con un enlace pasivo. |
| **Finalidad del tratamiento** | La política de privacidad debe describir de forma clara, en lenguaje no técnico, para qué se usan los datos del usuario (personalización, reservas, notificaciones, analytics anonimizados). |
| **Consentimiento para notificaciones push** | El permiso de notificaciones push debe solicitarse con diálogo explicativo del propósito antes de invocar el diálogo nativo del SO. |
| **Derecho de acceso** | El usuario debe poder solicitar desde la app la descarga de sus datos personales almacenados por MallHub. Esta funcionalidad puede implementarse como formulario de solicitud dirigido al equipo de privacidad en v1.0, con entrega en máximo 15 días hábiles. |
| **Derecho de supresión** | El usuario debe poder solicitar la eliminación de su cuenta y datos desde la app. La cuenta debe desactivarse en máximo 48 horas y los datos personales eliminarse o anonimizados en máximo 30 días calendario. |
| **Registro de actividades de tratamiento** | MallHub debe mantener un registro interno de las actividades de tratamiento de datos (responsable, finalidad, categorías de datos, terceros con quienes se comparte, medidas de seguridad). |
| **Transferencia a terceros** | Cuando se compartan datos con proveedores (Anthropic API, pasarelas de pago, servicios cloud), debe existir un contrato de tratamiento de datos que obligue al proveedor a las mismas garantías de la Ley 1581. |
| **Geolocalización** | Los datos de geolocalización del usuario no deben almacenarse en el servidor. Solo se usan en el dispositivo para detectar el mall cercano y triggear notificaciones contextuales. |
| **Datos de menores** | La plataforma no está dirigida a menores de 14 años. El flujo de registro no debe permitir el ingreso de fechas de nacimiento que indiquen edad menor a 14 años. |

**Autoridad:** Superintendencia de Industria y Comercio (SIC), Colombia. **Referencia:** Ley 1581/2012, Decreto 1377/2013, Circular Única SIC.

---

#### 3.4.2 Facturación electrónica — DIAN (Colombia)

| Requisito | Criterio verificable |
|---|---|
| **Factura electrónica a suscriptores** | Las facturas emitidas a tiendas (Plan Pro) y a malls (Mall Plan) deben generarse en formato de factura electrónica XML según la especificación técnica de la DIAN (Anexo Técnico 1.9 o el vigente al momento del lanzamiento). |
| **Habilitación como facturador electrónico** | MallHub debe habilitarse ante la DIAN como facturador electrónico antes del primer cobro a clientes. |
| **Representación gráfica** | Cada factura debe incluir la representación gráfica (PDF) con CUFE, QR de validación y todos los campos obligatorios según resolución de la DIAN. |
| **Notas crédito** | El sistema debe soportar la emisión de notas crédito en formato electrónico para ajustes y devoluciones de cargos. |

**Autoridad:** Dirección de Impuestos y Aduanas Nacionales (DIAN). **Referencia:** Resolución 000042 de 2020 y sus modificaciones.

---

#### 3.4.3 Seguridad de pagos — PCI-DSS

| Requisito | Criterio verificable |
|---|---|
| **Sin almacenamiento de datos de tarjeta** | MallHub no puede almacenar, procesar ni transmitir PAN, CVV ni datos de banda magnética. El procesamiento se delega íntegramente a la pasarela certificada. |
| **Tokenización en el cliente** | La integración con la pasarela debe implementarse vía SDK oficial del proveedor que tokeniza los datos de tarjeta en el dispositivo del usuario antes de cualquier transmisión. |
| **SAQ A (Merchant Level 4)** | Para v1.0, MallHub califica como comerciante nivel 4 bajo PCI-DSS SAQ A, dado que no toca datos de tarjeta directamente. La pasarela asume la carga de cumplimiento PCI. |

**Autoridad:** PCI Security Standards Council. **Referencia:** PCI-DSS v4.0.

---

#### 3.4.4 Accesibilidad web — WCAG 2.1

| Requisito | Criterio verificable |
|---|---|
| **Nivel de conformidad** | Todas las superficies de MallHub deben alcanzar el nivel **AA** de WCAG 2.1. |
| **Verificación** | Antes del lanzamiento de v1.0, al menos las 16 pantallas CORE deben haber pasado una revisión de accesibilidad con herramienta automatizada (axe-core, Lighthouse Accessibility audit) con puntuación ≥ 90/100. |

**Autoridad:** W3C Web Accessibility Initiative. **Referencia:** WCAG 2.1 (R7).

---

#### 3.4.5 Distribución de aplicaciones móviles

| Requisito | Criterio verificable |
|---|---|
| **Apple App Store** | La app debe cumplir con las App Store Review Guidelines vigentes, incluyendo: uso declarado de APIs de privacidad (geolocalización, cámara, notificaciones) en el Privacy Manifest y en el `Info.plist`, sin APIs privadas de iOS, y sin uso de esquemas de URL no declarados. |
| **Google Play Store** | La app debe cumplir con las Google Play Developer Program Policies vigentes, incluyendo: declaración del uso de permisos sensibles (CAMERA, ACCESS_FINE_LOCATION, POST_NOTIFICATIONS) con justificación de uso en el Data Safety Form, y targetSdkVersion ≥ 35 (Android 15) al momento de la sumisión. |
| **Datos de privacidad** | Tanto en App Store (Privacy Nutrition Label) como en Google Play (Data Safety) deben declararse con precisión los tipos de datos recopilados, con quién se comparten y si se usan para seguimiento. |

**Autoridad:** Apple Inc. / Google LLC. **Referencia:** App Store Review Guidelines · Google Play Developer Program Policies (versión vigente al momento de la sumisión).

---

#### 3.4.6 Política de IA responsable — Anthropic Usage Policy

| Requisito | Criterio verificable |
|---|---|
| **Uso dentro de los términos de servicio** | El uso de la API de Claude (Anthropic) para la generación de descripciones de productos (US-AL-07/US-AL-10) y reportes de analytics (US-ACC-07/US-ACC-08) debe cumplir con los Terms of Service y Usage Policy de Anthropic vigentes. |
| **Transparencia hacia el usuario** | Los campos generados por IA en MallHub Store deben marcarse visiblemente con el badge "Sugerido por IA" antes de que el Admin Local los publique. El reporte generado en MallHub Insights debe indicar que fue producido con asistencia de IA. |
| **Revisión humana obligatoria** | Ningún contenido generado por IA (descripciones de productos, reportes) debe publicarse ni distribuirse sin revisión y confirmación explícita del usuario humano. |
| **Sin datos sensibles en prompts** | Los prompts enviados a la API de Anthropic no deben incluir datos personales identificables de compradores (nombre, teléfono, historial de reservas). Solo se envían datos agregados anonimizados para los reportes, o datos del producto (imágenes/nombre) para el catálogo. |

**Autoridad:** Anthropic PBC. **Referencia:** https://www.anthropic.com/policies/usage.

---

### 3.5 Diseño e implementación

Esta sección establece restricciones y lineamientos que enmarcan las decisiones técnicas de diseño, construcción y operación del sistema. No prescriben implementaciones específicas, pero acotan el espacio de soluciones válidas.

---

#### 3.5.1 Instalación

**MallHub App (Tauri Mobile — iOS + Android)**

| Requisito | Valor |
|---|---|
| Versión mínima de iOS | iOS 16.0 (WKWebView con soporte completo a CSS custom properties y módulos ES2022) |
| Versión mínima de Android | Android 7.0 (API level 24) con Android System WebView versión ≥ 100 (Chromium-based) |
| Arquitecturas soportadas (iOS) | arm64 (todos los iPhones desde 2015) |
| Arquitecturas soportadas (Android) | arm64-v8a, x86_64 |
| Permisos declarados (iOS `Info.plist`) | `NSLocationWhenInUseUsageDescription`, `NSCameraUsageDescription`, `NSUserNotificationsUsageDescription` |
| Permisos declarados (Android `Manifest`) | `ACCESS_FINE_LOCATION`, `CAMERA`, `POST_NOTIFICATIONS`, `INTERNET` |
| Tamaño máximo del bundle instalable | 50 MB (.ipa / .apk / .aab) |

**MallHub Store / MallHub Insights (Tauri Desktop)**

| Requisito | Valor |
|---|---|
| macOS | 11.0 (Big Sur) o superior — WebKit integrado en el SO, no requiere instalación separada |
| Windows | 10 (1809) o superior — requiere Microsoft Edge WebView2 Runtime; el instalador de MallHub debe incluirlo como dependencia con instalación silenciosa si no está presente |
| Linux | Distribuciones con WebKitGTK ≥ 2.36 (Ubuntu 22.04 LTS+, Fedora 36+, Debian 11+) |
| Arquitecturas soportadas | x86_64, arm64 (Apple Silicon mediante Rosetta 2 o build nativo) |
| Prerequisitos del build (dev) | Rust toolchain (rustup), Node.js ≥ 20 LTS, tauri-cli ≥ 2.x |
| Requisitos de pantalla mínima | 1280 × 800 px |
| Instalador | Firmado con certificado de desarrollador válido (Apple Developer ID para macOS, Authenticode para Windows) para evitar bloqueo de Gatekeeper y SmartScreen |

**Configuración de entornos**

El sistema debe soportar al menos tres entornos separados con configuración independiente (variables de entorno, secretos, bases de datos): `development`, `staging` y `production`. El endpoint de API, las claves de pasarela de pagos y las claves de IA deben ser diferentes por entorno. No deben existir referencias hardcodeadas a entornos en el código fuente.

---

#### 3.5.2 Construcción y entrega

**Gestión de dependencias**

El frontend React/TypeScript debe gestionar dependencias con `pnpm` (preferido por espacio en disco y performance en CI) o `npm`. El archivo `package-lock.json` o `pnpm-lock.yaml` debe estar commiteado y versionado. El backend debe gestionar dependencias con `cargo` (Rust) o el gestor del framework backend elegido, con lockfile commiteado. Se prohíbe la instalación de dependencias con versiones flotantes (`*` o `latest`) en `package.json` de producción.

**Automatización CI/CD**

El pipeline de integración continua debe ejecutarse en cada Pull Request y en cada merge a las ramas `main` / `develop`. El pipeline mínimo de CI debe incluir:

1. Lint (ESLint + Clippy para Rust).
2. Tests unitarios e integración (cobertura objetivo ≥ 70% en rutas críticas: reserva, autenticación, control de acceso RBAC).
3. Build del cliente Tauri (al menos para una plataforma en CI).
4. Escaneo de vulnerabilidades de dependencias (npm audit / cargo audit).
5. Escaneo de secretos expuestos en código (truffleHog o equivalente).

El pipeline de **CD (Continuous Delivery)** al entorno de staging debe activarse automáticamente tras merge exitoso a `main`. El despliegue a `production` requiere aprobación manual de al menos un miembro del equipo técnico.

**Integridad y trazabilidad**

Cada release de producción debe estar etiquetado con un tag semántico (`vMAJOR.MINOR.PATCH`) en el repositorio Git. El artefacto de build (binarios Tauri, imagen Docker del backend) debe incluir metadatos de build: hash del commit, timestamp y número de pipeline de CI que lo generó.

---

#### 3.5.3 Distribución

**Topología de despliegue**

El backend se despliega en contenedores (Docker) orquestados por un servicio gestionado (AWS ECS/EKS, GCP Cloud Run o equivalente). En v1.0, el deployment mínimo es: 2 instancias del backend en la misma región, un load balancer gestionado por el proveedor cloud y una base de datos en configuración de primary + read replica en la misma región.

**Multi-tenancy y aislamiento de datos**

MallHub implementa **multi-tenancy lógico** (shared database, tenant-discriminated): todos los tenants comparten las mismas instancias de base de datos y backend, con aislamiento garantizado a nivel de aplicación mediante `tenant_id` en cada tabla y middleware de autorización. No se implementa multi-tenancy físico (bases de datos separadas por tenant) en v1.0 por razones de costo operativo, pero la arquitectura debe permitir migrar a ese modelo sin cambio de esquema.

**CDN para medios estáticos**

Las imágenes de productos, logos de tiendas, material de eventos y assets de la app deben distribuirse globalmente vía CDN (AWS CloudFront, GCP Cloud CDN o equivalente). En v1.0 es suficiente con un único punto de origen en la región de Colombia/América Latina (us-east-1 o southamerica-east1). Las reglas de caché del CDN deben configurar TTL de al menos 7 días para imágenes estáticas y TTL de 0 para assets que cambien frecuentemente (logos actualizados por el admin).

**Datos de analytics**

Los datos del pipeline de analytics (BigQuery o equivalente) deben residir en una región de datos compatible con la Ley 1581 (Colombia). Si el proveedor no tiene datacenter en Colombia, debe garantizarse que los datos no salen de la región de América Latina sin el consentimiento informado del titular y las garantías de nivel equivalente.

---

#### 3.5.4 Mantenibilidad

**Modularidad del frontend**

El código React/TypeScript debe organizarse en módulos independientes por dominio: `app/` (MallHub App), `store/` (MallHub Store) e `insights/` (MallHub Insights), con una capa de componentes compartidos en `ui/` y servicios de API en `api/`. Los módulos de dominio no deben importarse entre sí directamente; la comunicación se realiza a través de la capa `api/` y el estado global.

**Componentes compartidos**

El Design System (basado en la Paleta Emerald Market, R4) debe implementarse como una librería de componentes React interna reutilizable entre los tres módulos cliente. Los tokens de color se gestionan exclusivamente mediante CSS custom properties; no se permiten valores hexadecimales hardcodeados en los componentes.

**Documentación técnica mínima**

Cada módulo del backend debe tener su contrato de API documentado en formato **OpenAPI 3.1** y publicado en el entorno de staging. Los comandos e IPC de Tauri (interfaz frontend ↔ core Rust) deben documentarse con tipos TypeScript generados automáticamente desde las definiciones Rust. Las decisiones de arquitectura relevantes deben registrarse como **ADRs (Architecture Decision Records)** en el repositorio del proyecto.

**Deuda técnica**

Los `TODO`, `FIXME` y `HACK` en el código deben referenciar un ticket del sistema de issues del proyecto. No se admiten comentarios de deuda técnica sin seguimiento en el repositorio de issues antes de que el código entre a `main`.

---

#### 3.5.5 Reutilización

**Componentes UI compartidos entre módulos**

Los siguientes componentes deben diseñarse como reutilizables desde el inicio y publicarse en la librería interna de UI:

| Componente | Usado en |
|---|---|
| `Button` (variantes: primary, ghost, danger, xs/sm/md) | App, Store, Insights |
| `Badge` (variantes: Emerald, Tangerine, Purple, gris, rojo) | App, Store, Insights |
| `StatusChip` (Pendiente, Confirmada, Completada, Cancelada, Expirada) | App, Store |
| `Modal` / `BottomSheet` | App, Store, Insights |
| `EmptyState` (ilustración + mensaje + CTA opcional) | App, Store, Insights |
| `SkeletonScreen` | App, Store, Insights |
| `QRCodeDisplay` | App, Store |
| `ImageUploader` (drag-and-drop + validación) | Store, Insights |
| `DataTable` (sorting, pagination) | Store, Insights |
| `KPICard` (valor, delta, ícono) | Store (básico), Insights (completo) |

**Servicios de API compartidos**

Los servicios que invocan la API REST del backend deben implementarse como clientes tipados (TypeScript) en la capa `api/` y ser consumidos por los tres módulos cliente. No se deben duplicar las llamadas HTTP ni los tipos de respuesta entre módulos.

**Core Rust compartido (plugins Tauri)**

La lógica nativa de Tauri (manejo de keychain, acceso a cámara, notificaciones) debe implementarse como comandos Tauri invocables desde cualquiera de los tres módulos frontend. No se duplica lógica nativa entre las apps de Store e Insights.

---

#### 3.5.6 Portabilidad

**Targets de build de Tauri**

| Surface | Target | Formato de distribución |
|---|---|---|
| MallHub App | iOS (arm64) | `.ipa` distribuido via App Store |
| MallHub App | Android (arm64-v8a, x86_64) | `.aab` distribuido via Google Play |
| MallHub Store | macOS (x86_64, arm64) | `.dmg` + `.app` firmado con Developer ID |
| MallHub Store | Windows (x86_64) | `.msi` / `.exe` instalador firmado |
| MallHub Store | Linux (x86_64) | `.deb`, `.rpm`, `.AppImage` |
| MallHub Insights | macOS, Windows, Linux | Mismos formatos que Store |

**Independencia de proveedor cloud**

La arquitectura backend debe evitar dependencias de vendor lock-in en los servicios de cómputo y almacenamiento. El backend debe ser portable entre AWS y GCP sin cambio de código de aplicación (solo cambio de configuración de infraestructura). Se permiten servicios gestionados de proveedor específico para analytics (BigQuery) y push notifications (FCM/APNs), dado que son estándares de facto sin alternativa portable equivalente.

**Base de datos**

La base de datos principal debe ser PostgreSQL (versión ≥ 15). No se deben usar extensiones propietarias de un único proveedor cloud. Esto garantiza la portabilidad entre servicios gestionados (AWS RDS, GCP Cloud SQL, Azure Database for PostgreSQL, Supabase) y despliegues autogestionados.

---

#### 3.5.7 Costo

**Objetivos de gasto en infraestructura**

| Fase | Gasto mensual en infraestructura cloud (objetivo) | Justificación |
|---|---|---|
| v1.0 Piloto (0–6 m) | < USD 500/mes | 2–3 malls, tráfico bajo. Instancias pequeñas, base de datos mínima. |
| v1.1 Expansión (6–24 m) | < USD 3.000/mes | 20 malls, ~100k usuarios. Auto-scaling, replica de BD, CDN. |
| v2.0 LATAM (24 m+) | < 10% del ARR | Relación de gasto debe escalar sub-linealmente con ingresos. |

**Costo por transacción (objetivo)**

El costo de infraestructura atribuible al procesamiento de una reserva (API request + write en BD + push notification) no debe superar **USD 0,01** por transacción en v1.0. Este umbral debe revisarse con datos reales al final del piloto.

**Costos de IA**

El gasto en la API de Anthropic (Claude) debe presupuestarse separadamente. En v1.0, el uso de IA se limita a dos funciones (publicación de catálogo y generación de reportes), ambas accionadas manualmente por el usuario (sin flujos automáticos en background). Se establece un límite de gasto mensual de **USD 200** en API de IA para v1.0, con alerta automática al alcanzar el 80% del límite.

**Evitar costos sorpresa**

Toda integración con un servicio externo de tarificación variable (cloud storage, CDN, push, IA, pasarela de pagos) debe configurar alertas de billing automáticas al 80% y al 100% del presupuesto mensual estimado. Se deben implementar circuit breakers en las llamadas a servicios de tarificación por uso (ej.: si el número de llamadas a la API de IA supera el umbral diario, las funciones de IA se degradan gracefully en lugar de generar gasto sin límite).

---

#### 3.5.8 Fecha límite

Los hitos de entrega para MallHub v1.0 se alinean con la Fase 1 de la estrategia de crecimiento (0–6 meses desde inicio del desarrollo).

| Hito | Descripción | Criterio de preparación (Definition of Done) |
|---|---|---|
| **M1 — Alpha interno** (semana 6–8) | 16 pantallas CORE funcionales en entorno de desarrollo. Backend con autenticación, CRUD de catálogo y flujo de reserva. | Demo funcional end-to-end del flujo: Login → Directorio → Producto → Reserva → QR → Confirmación por tienda. Sin datos reales. |
| **M2 — Beta cerrada** (semana 10–12) | App instalable en dispositivos físicos. Panel Store operativo. Primer mall configurado en staging. | 5 tiendas reales onboardeadas en staging. 20 reservas de prueba completadas exitosamente. Tasa de error API < 1%. |
| **M3 — Lanzamiento piloto** (semana 14–16) | MallHub App publicada en App Store y Google Play. MallHub Store e Insights disponibles para descarga. 1 mall piloto activo. | 50 tiendas activas en el mall piloto. NPS ≥ 35. Tasa de recogida efectiva ≥ 55% en las primeras 2 semanas. Sin incidentes P1 sin resolver. |
| **M4 — Cierre del piloto** (semana 20–24) | Evaluación de métricas del piloto. Decisión go/no-go para Fase 2. | MRR > USD 0 (al menos 1 tienda Pro o 1 Mall Plan activo). Datos suficientes para el modelo de BI. Backlog de bugs P1/P2 resuelto en su totalidad. |

**Criterio de preparación global para producción (Launch Readiness Checklist)**

Antes del lanzamiento a producción (M3), se deben cumplir todos los siguientes criterios sin excepción:

- [ ] Todas las 16 pantallas CORE superaron la auditoría de accesibilidad (Lighthouse ≥ 90/100).
- [ ] Penetration test básico realizado sobre los endpoints de autenticación, reserva y acceso RBAC.
- [ ] Política de privacidad y términos de uso revisados por asesor legal colombiano.
- [ ] Habilitación como facturador electrónico ante la DIAN completada.
- [ ] App Store y Google Play: revisión aprobada en ambas tiendas.
- [ ] Runbook de incidentes P1 documentado y probado con simulacro.
- [ ] Backup y restore drill exitoso (menos de RTO de 4 horas).
- [ ] Alertas de monitoreo configuradas y probadas (al menos una alerta disparada y resuelta en staging).
- [ ] Secretos de producción rotados desde staging (no reutilizar claves de staging en producción).

---

#### 3.5.9 Prueba de concepto

**PoC de integración Tauri 2.0 con push notifications móviles**

| Atributo | Detalle |
|---|---|
| **Objetivo** | Validar que `tauri-plugin-push-notifications` funciona correctamente en iOS 16+ y Android 7+ para entrega de notificaciones de reserva en background y foreground. |
| **Alcance** | App Tauri mínima que registra el token push, lo envía al backend y recibe una notificación en tiempo real disparada desde el servidor. |
| **Duración** | 1 semana (sprint 1 del proyecto). |
| **Criterios de éxito** | Notificación entregada en menos de 3 segundos desde el envío del backend, tanto en iOS como en Android, en condiciones de app en background. |
| **Criterio de fracaso / pivote** | Si el plugin no soporta los casos de uso requeridos → evaluar `tauri-plugin-local-notifications` combinado con long-polling WebSocket como fallback. |

**PoC de generación de contenido con API de Anthropic**

| Atributo | Detalle |
|---|---|
| **Objetivo** | Validar la calidad y latencia de la generación de descripciones de productos a partir de una imagen usando el modelo Claude. |
| **Alcance** | Script de prueba que envía 20 imágenes de productos reales de retail colombiano a la API y evalúa la calidad de las descripciones generadas (relevancia, idioma, tono). |
| **Duración** | 3 días (previos al diseño del flujo US-AL-07). |
| **Criterios de éxito** | ≥ 80% de descripciones evaluadas como "útiles sin edición mayor" por el equipo de producto. Latencia media de respuesta < 10 segundos. |
| **Criterio de fracaso / pivote** | Si la calidad no supera el 70% → revisar el prompt engineering o evaluar visión alternativa (GPT-4o). Si la latencia supera 15 s → ajustar el modelo o reducir el tamaño de la imagen antes del envío. |

---

#### 3.5.10 Gestión de cambios

**Categorías de cambio**

| Categoría | Descripción | Aprobación requerida | Tiempo mínimo de notificación antes del despliegue |
|---|---|---|---|
| **Crítico / Hotfix** | Corrección de bug P1 en producción que afecta la operación del sistema o representa una vulnerabilidad de seguridad activa. | Tech Lead o CTO (cualquiera disponible) | Inmediato — notificar a stakeholders en paralelo al despliegue |
| **Normal** | Nueva funcionalidad, mejora o corrección de bug P2/P3. | Code review de al menos 1 par + Tech Lead para features de alto impacto | Pipeline CI/CD completo aprobado · despliegue en ventana de mantenimiento o bajo-tráfico |
| **Mayor / Breaking change** | Cambio de esquema de base de datos, ruptura de contrato de API, cambio de dependencia crítica (nueva versión mayor de Tauri, cambio de pasarela de pagos). | Revisión de arquitectura documentada en ADR + aprobación de CTO | ≥ 5 días hábiles antes del despliegue en producción |
| **Mantenimiento planificado** | Actualización de infraestructura, rotación de certificados, upgrades de sistema operativo en servidores. | Tech Lead | ≥ 48 horas — notificar a Admin CC y Admin Local via app |

**Artefactos requeridos por cambio**

Cualquier cambio que llegue a la rama `main` debe estar asociado a:
1. Un ticket en el sistema de issues del proyecto con descripción, tipo y criterios de aceptación.
2. Un Pull Request con descripción del cambio, evidencia de pruebas realizadas y, para cambios mayores, el ADR correspondiente.
3. Actualización del `CHANGELOG.md` siguiendo el formato [Keep a Changelog](https://keepachangelog.com) con categorías `Added`, `Changed`, `Fixed`, `Removed`, `Security`.

**Versionado semántico**

El producto sigue **Semantic Versioning 2.0.0** (semver.org):
- `MAJOR`: cambio incompatible con versiones anteriores del contrato de API o del modelo de datos.
- `MINOR`: nueva funcionalidad retrocompatible.
- `PATCH`: corrección de bugs retrocompatible.

La versión del SRS se sincroniza con la versión del producto: este documento corresponde a MallHub `v1.0.x`.

**Comunicación a usuarios finales**

Los cambios que afecten la experiencia del usuario final (nuevas funcionalidades, cambios en el flujo de reserva, cambios en la política de privacidad) deben comunicarse mediante:
- **Changelog in-app**: mensaje en el Home Feed tras actualización de la app.
- **Email a Admin CC y Admin Local**: para cambios que afecten sus flujos de trabajo o la configuración de su mall/tienda.
- **Aviso en el panel**: para cambios de funcionalidad en MallHub Store e Insights, visible al iniciar sesión después de la actualización.
- 
### 3.6 IA/ML

> **Nota de alcance:** MallHub v1.0 no entrena ni despliega modelos de aprendizaje automático propios. La funcionalidad de IA se implementa íntegramente mediante llamadas a la **API de Claude (Anthropic)**, modelo `claude-sonnet-4-6` (o el sucesor estable vigente en el momento del despliegue). Esta sección especifica los requisitos para el uso seguro, controlado y auditable de dicha API en los dos casos de uso de IA del producto:
>
> | ID | Nombre | Rol | Módulo |
> |---|---|---|---|
> | **AI-01** | Asistente de publicación de catálogo | Admin Local | MallHub Store |
> | **AI-02** | Generador de reportes de negocio | Admin CC | MallHub Insights |
>
> Los términos "modelo" y "sistema de IA" en esta sección hacen referencia al LLM de Anthropic invocado vía API, no a un modelo propio de MallHub.

---

#### 3.6.1 Especificación del modelo

##### AI-01 — Asistente de publicación de catálogo

**Propósito:** reducir el tiempo y la fricción que enfrenta el Admin Local al publicar productos en su catálogo. A partir de una imagen del producto y/o su nombre, el modelo genera un borrador editable de: nombre comercial, descripción, categoría sugerida y etiquetas relevantes, en español colombiano y tono adecuado para retail.

**Entradas al modelo:**

| Campo | Tipo | Obligatorio | Restricciones |
|---|---|---|---|
| Imagen del producto | Base64, JPEG/PNG/WebP | Condicional (si el usuario sube foto) | Máx. 5 MB · Preprocesada a máx. 1024 × 1024 px antes del envío |
| Nombre del producto | Texto libre | Condicional (si no hay imagen) | Máx. 200 caracteres · Sanitizado antes del envío |
| Categoría de la tienda | Texto | Siempre | Valor del catálogo cerrado de categorías de MallHub; provee contexto al modelo |
| Instrucción del sistema (system prompt) | Texto fijo | Siempre | Gestionado por MallHub; el usuario no lo controla ni lo ve |

Nunca se incluyen en el prompt: datos de reservas, información de clientes, historial de ventas, ni ningún dato personal de terceros.

**Salidas esperadas del modelo:**

| Campo | Tipo | Longitud esperada |
|---|---|---|
| `nombre_sugerido` | Texto | Máx. 100 caracteres |
| `descripcion` | Texto | 50–300 caracteres |
| `categoria_sugerida` | Valor del catálogo cerrado o texto libre | Máx. 50 caracteres |
| `etiquetas` | Array de strings | 2–6 etiquetas |

El backend parsea la respuesta del modelo como JSON estructurado. Si el modelo no devuelve JSON válido o los campos requeridos están ausentes, se considera un fallo y se activa el modo manual (§3.6.3).

**Objetivos de rendimiento:**

| Métrica | Objetivo | Umbral de degradación |
|---|---|---|
| Latencia extremo a extremo (usuario toca "Analizar" → campos rellenos en pantalla) | < 12 s | > 20 s → mostrar advertencia de demora |
| Tasa de respuesta útil (campos generados evaluados como "aceptables sin edición mayor" por usuarios reales) | ≥ 75% | < 60% → revisar prompt engineering |
| Tasa de error del modelo (respuestas vacías, JSON inválido, timeout > 20 s) | < 5% | > 10% → activar circuit breaker |

**Datos de validación:** la calidad del modelo se evaluará durante la PoC (§3.5.9) sobre 20 imágenes reales de productos de retail colombiano (moda, accesorios, gastronomía, tecnología) etiquetadas manualmente por el equipo de producto como ground truth.

**Versionado del modelo:** el sistema debe registrar en el log de IA el identificador del modelo de Anthropic utilizado (`model_id`) en cada llamada, junto con el hash del system prompt. Ante un cambio de modelo (upgrade o degradación por deprecación), se ejecuta la evaluación de calidad nuevamente antes del despliegue en producción.

---

##### AI-02 — Generador de reportes de negocio

**Propósito:** transformar los datos numéricos del dashboard de MallHub Insights en un reporte narrativo estructurado que ayude al Admin CC a identificar tendencias, oportunidades y riesgos del mall sin necesidad de análisis manual de los datos brutos.

**Entradas al modelo:**

| Campo | Tipo | Obligatorio | Restricciones |
|---|---|---|---|
| KPIs del período | JSON estructurado | Siempre | Visitas digitales, búsquedas, reservas, tasa de conversión, delta vs período anterior |
| Top 10 tiendas por reservas | JSON (nombre de tienda + número de reservas) | Siempre | Sin datos personales de clientes |
| Top 10 productos más vistos | JSON (nombre del producto + tienda + número de vistas) | Siempre | Sin datos personales |
| Rango de fechas analizado | ISO 8601 (inicio, fin) | Siempre | |
| Filtro de categoría activo | Texto o `null` | Siempre | Valor del catálogo cerrado o ausente si no hay filtro |
| Nombre del mall | Texto | Siempre | Para personalizar la narrativa del reporte |
| Instrucción del sistema (system prompt) | Texto fijo | Siempre | Gestionado por MallHub; establece el rol del modelo como "analista de negocios de retail" |

Nunca se incluyen en el prompt: nombres de clientes registrados, datos de reservas individuales trazables a una persona, datos financieros de las tiendas ni credenciales de ningún tipo.

**Salidas esperadas del modelo:**

El modelo debe devolver un reporte narrativo en **español colombiano** con las siguientes secciones obligatorias, en formato Markdown para facilitar la exportación:

| Sección | Descripción | Longitud orientativa |
|---|---|---|
| `resumen_ejecutivo` | Síntesis de 2–3 oraciones del comportamiento digital del mall en el período | 100–200 palabras |
| `hallazgos_clave` | Lista de 3–5 insights con respaldo en los datos | 150–350 palabras |
| `tiendas_destacadas` | Análisis de las 3 tiendas con mejor desempeño y posibles razones | 100–200 palabras |
| `oportunidades_mejora` | 2–4 áreas con bajo rendimiento y recomendaciones accionables | 150–300 palabras |
| `proyeccion_indicativa` | Tendencia estimada para el próximo período (con disclaimer explícito de que es orientativa) | 80–150 palabras |

**Objetivos de rendimiento:**

| Métrica | Objetivo | Umbral de degradación |
|---|---|---|
| Latencia (usuario toca "Generar reporte" → reporte visible en pantalla) | < 30 s | > 45 s → mostrar indicador de progreso + advertencia |
| Tasa de respuesta estructurada válida (todas las secciones presentes y coherentes con los datos enviados) | ≥ 90% | < 75% → revisar prompt y estructura del payload |
| Tasa de error (timeout, error del proveedor, JSON/Markdown inválido) | < 3% | > 8% → activar fallback de exportación sin IA |

**Datos de validación:** la calidad del reporte se evaluará con los datos reales del piloto (Fase 1). Un analista de negocio del equipo MallHub revisará una muestra de 20 reportes generados (distintos malls, períodos y volúmenes de datos) y calificará cada reporte en una escala 1–5 para: coherencia con los datos, accionabilidad de los insights y corrección del lenguaje en español colombiano. El umbral de aprobación es media ≥ 3.8 / 5.

**Versionado del modelo:** misma política que AI-01.

---

#### 3.6.2 Gestión de datos

**No hay datasets de entrenamiento propios.** MallHub no entrena, fine-tunea ni adapta el modelo de Anthropic. No existe un ciclo de vida de datasets de ML en el sentido tradicional. Esta subsección documenta el ciclo de vida de los **datos que fluyen hacia y desde la API de Anthropic** en cada llamada.

**Origen de los datos enviados a la API**

| Caso de uso | Origen de los datos | Naturaleza |
|---|---|---|
| AI-01 (catálogo) | Imagen y/o nombre del producto capturados/escritos por el Admin Local en el momento de la llamada | Datos del negocio de la tienda; no datos personales |
| AI-02 (reporte) | KPIs y rankings agregados calculados por el pipeline de analytics de MallHub para el período seleccionado | Datos operativos anonimizados y agregados del mall; no datos personales |

**Anonimización y minimización antes del envío**

Antes de construir el prompt para cualquier llamada a la API, el backend debe ejecutar un paso de **sanitización y minimización de datos** que garantice:

1. Ningún campo del payload contiene nombres, correos, teléfonos, IDs de usuario ni ningún otro dato personal identificable (PII) de compradores o empleados de tiendas.
2. Los nombres de tiendas y productos se incluyen solo en AI-02 a nivel de ranking (ej. "Tienda A — 45 reservas"), no asociados a datos individuales de transacciones.
3. Las imágenes enviadas a AI-01 se preparan localmente en el cliente Tauri (redimensionamiento, compresión) antes de la transmisión; nunca se envía la imagen original sin procesar si supera los límites establecidos.

**Retención de datos en Anthropic**

Conforme a la política de uso de API de Anthropic (no retención de datos de la API para entrenamiento por defecto), los prompts y respuestas enviados a través de la API no se utilizan para entrenar modelos de Anthropic sin consentimiento explícito. MallHub no ha optado por ningún programa de compartición de datos con Anthropic. Esta condición debe revisarse ante cualquier cambio en los términos del proveedor.

**Retención en sistemas propios de MallHub**

| Dato | Retención en MallHub | Justificación |
|---|---|---|
| Prompt completo enviado a Anthropic | 30 días en log de auditoría de IA | Trazabilidad de incidentes, depuración, auditoría de seguridad |
| Respuesta completa del modelo | 30 días en log de auditoría de IA | Misma razón |
| Metadatos de la llamada (model_id, timestamp, tokens_used, latencia, user_id, tenant_id, resultado: éxito/fallo) | 12 meses | Monitoreo de calidad, gestión de costos, auditoría |
| Contenido final publicado por el usuario (descripción de producto, reporte editado) | Indefinido (es contenido operativo del negocio) | Forma parte del catálogo y del historial del mall |

Los logs de auditoría de IA son de solo lectura y no pueden ser modificados ni eliminados por ningún rol de usuario desde las interfaces de MallHub.

**Datos de evaluación (ground truth)**

El conjunto de datos de evaluación generado durante la PoC (20 imágenes de productos + 20 reportes de piloto, con anotaciones del equipo de producto) se almacena en el repositorio interno del proyecto como artefacto versionado. No se comparte con Anthropic ni con terceros.

---

#### 3.6.3 Barreras de control

Las barreras de control garantizan que el sistema de IA opere dentro de límites definidos y seguros, incluso cuando el modelo devuelve salidas inesperadas o el servicio externo no está disponible.

**Validación de entrada antes del envío a la API**

| Control | Descripción |
|---|---|
| **Tipo MIME verificado** | La imagen enviada en AI-01 debe pasar la validación de tipo MIME real (no solo extensión) antes de ser preprocesada y enviada. Solo se aceptan JPEG, PNG y WebP. |
| **Límite de tamaño de imagen** | La imagen se redimensiona automáticamente a máx. 1024 × 1024 px y se comprime a máx. 2 MB antes del envío. Si el preprocesamiento falla, el sistema informa al usuario y no llama a la API. |
| **Longitud del nombre del producto** | El campo de nombre no puede superar 200 caracteres antes de ser incluido en el prompt. El backend trunca cualquier valor que supere el límite con notificación al frontend. |
| **Verificación de PII** | El backend aplica un filtro regex + lista de patrones para detectar posibles datos personales (formatos de email, teléfono colombiano, número de cédula) en el nombre del producto antes de enviarlo. Si se detecta un patrón de PII, la llamada se bloquea y se registra el intento en el log de seguridad. |
| **Prompt injection** | Los textos libres ingresados por el usuario (nombre del producto, nota adicional) se insertan en el prompt como datos delimitados con comillas y etiquetas de rol, nunca como instrucciones directas al modelo, reduciendo el riesgo de prompt injection. |

**Validación de salida del modelo**

| Control | Descripción |
|---|---|
| **Parsing estructurado** | La respuesta del modelo debe ser JSON válido con los campos definidos en §3.6.1. Si el parser falla, el sistema activa el modo manual sin exponer el error técnico al usuario. |
| **Longitud de campo** | Si un campo generado supera el límite definido (ej. descripción > 300 caracteres), el sistema trunca automáticamente el valor antes de pre-rellenar el formulario, e indica al usuario que fue recortado. |
| **Filtro de lenguaje inapropiado** | Antes de mostrar el contenido generado al usuario, el sistema aplica un filtro básico de palabras inapropiadas en español. Si se detecta contenido potencialmente ofensivo o inapropiado para un contexto de retail, el campo se deja vacío y se registra el incidente para revisión del equipo MallHub. |
| **Contenido coherente con la categoría** | Para AI-01: si la categoría sugerida por el modelo no forma parte del catálogo cerrado de categorías de MallHub, el sistema la descarta y deja el campo de categoría vacío para completado manual. |
| **Validación de coherencia interna del reporte** | Para AI-02: si el reporte generado no contiene todas las secciones obligatorias definidas en §3.6.1, el sistema lo marca como incompleto, notifica al usuario y ofrece el botón "Exportar datos sin análisis IA" como alternativa. |

**Límites de acción**

| Límite | Valor | Justificación |
|---|---|---|
| Timeout por llamada a la API de Anthropic | 20 s (AI-01) · 45 s (AI-02) | Evita bloquear la UI indefinidamente ante respuestas lentas del proveedor |
| Reintentos automáticos ante error transitorio | Máx. 2 reintentos con backoff de 2 s · solo para errores HTTP 429 y 503 | Evita sobrecarga del proveedor; para errores 4xx no se reintenta |
| Rate limit por usuario en AI-01 | Máx. 20 llamadas por Admin Local por hora | Protección contra uso abusivo y control de costos |
| Rate limit por tenant en AI-02 | Máx. 50 llamadas por mall por día | Misma razón |
| Presupuesto mensual global de API de IA | USD 200 (v1.0) con circuit breaker al 90% | Si se alcanza el 90% del presupuesto mensual, las funciones de IA se deshabilitan automáticamente y se notifica al Admin Plataforma |

**Circuit breaker**

Si la tasa de error de la API de Anthropic supera el **20% en una ventana de 5 minutos**, el sistema activa el circuit breaker: todas las funciones de IA quedan deshabilitadas durante **10 minutos**, durante los cuales se muestra el mensaje "La asistencia con IA no está disponible temporalmente" y el modo manual queda habilitado. Tras el período de cooldown, el circuit breaker permite un número limitado de llamadas de prueba antes de reabrir completamente.

**Modo manual como fallback obligatorio**

Ambas funciones de IA (AI-01 y AI-02) deben funcionar en modo manual sin dependencia del modelo. El flujo completo de publicación de producto y el flujo completo de exportación de datos deben estar operativos incluso cuando la API de Anthropic no está disponible. La IA es una mejora de productividad, nunca un requisito de flujo.

---

#### 3.6.4 Ética

**Principios aplicados**

MallHub adopta los siguientes principios éticos para el uso de IA en v1.0, alineados con las directrices de la Responsible Scaling Policy de Anthropic y con el marco de IA responsable de la Unión Europea (EU AI Act, como referencia de mejores prácticas internacionales):

| Principio | Aplicación en MallHub |
|---|---|
| **Beneficencia** | La IA reduce la carga operativa de Admin Locales con baja alfabetización digital, democratizando el acceso a herramientas de e-commerce que antes solo estaban al alcance de grandes tiendas con equipos de marketing. |
| **No maleficencia** | El sistema no usa IA para tomar decisiones autónomas que afecten a terceros (precios, visibilidad de tiendas, aprobación/rechazo de reservas). Toda acción con consecuencias para el negocio requiere confirmación humana explícita. |
| **Transparencia** | Los usuarios que interactúan con contenido generado por IA deben saberlo. Se documentan todas las instancias de contenido asistido por IA en los logs del sistema. |
| **Autonomía del usuario** | El sistema de IA nunca reemplaza la decisión del usuario; solo sugiere. El Admin Local puede editar, descartar o ignorar cualquier sugerencia. El Admin CC puede modificar el reporte antes de exportarlo. |
| **Privacidad** | No se procesan datos personales de compradores a través del modelo externo. El diseño de los prompts garantiza privacidad por defecto (privacy by design). |
| **Responsabilidad** | Existe un responsable interno del sistema de IA (designado como "AI Owner" en el equipo MallHub) que monitorea la calidad, gestiona los incidentes y toma decisiones sobre cambios en los prompts o en el modelo. |

**Equidad y sesgo**

Los dos casos de uso de IA en MallHub no involucran clasificación de personas, scoring de crédito, ni ninguna decisión que pueda afectar derechos individuales. Por tanto, los riesgos de sesgo discriminatorio son bajos. Sin embargo, se identifican y controlan los siguientes sesgos potenciales:

| Riesgo de sesgo | Descripción | Control |
|---|---|---|
| **Sesgo lingüístico y cultural (AI-01)** | El modelo podría generar descripciones de productos en un registro formal o con expresiones no usadas en el comercio informal colombiano. | El system prompt instruye explícitamente al modelo a usar español colombiano, terminología de retail local y un tono cercano al consumidor. Se evalúa en la PoC con ejemplos de productos típicos del mercado colombiano (moda popular, gastronomía, accesorios). |
| **Sesgo de categorización (AI-01)** | El modelo podría asignar sistemáticamente categorías incorrectas a ciertos tipos de productos (ej. confundir "accesorios de moda" con "tecnología"). | La categoría sugerida se valida contra el catálogo cerrado de MallHub; si no coincide, se descarta y el usuario elige manualmente (§3.6.3). |
| **Sesgo de interpretación en reportes (AI-02)** | El modelo podría interpretar métricas de forma que favorezca conclusiones optimistas o alarmistas que no se correspondan con los datos reales. | El system prompt instruye al modelo a basar todos los insights en los datos numéricos recibidos, a no extrapolar más allá del período analizado y a incluir el disclaimer explícito de proyección orientativa en la sección `proyeccion_indicativa`. |
| **Equidad entre tiendas grandes y pequeñas (AI-02)** | Los reportes podrían centrarse desproporcionadamente en las tiendas ancla (más reservas) e ignorar el desempeño de tiendas pequeñas. | El system prompt incluye instrucción explícita de que el reporte debe mencionar tanto tiendas con alto desempeño como áreas de mejora, evitando concentrar el análisis en los top performers. |

**Métricas de seguimiento ético**

| Métrica | Frecuencia de medición | Responsable |
|---|---|---|
| Tasa de aceptación de sugerencias AI-01 (% de campos que el usuario acepta sin editar) | Mensual | AI Owner |
| Tasa de edición de reportes AI-02 antes de exportar (% de reportes modificados) | Mensual | AI Owner |
| Número de incidentes de contenido inapropiado detectados por el filtro de salida | Por incidente + revisión mensual | AI Owner + Seguridad |
| Satisfacción de Admin Locales con el asistente de catálogo (encuesta NPS in-app, muestra aleatoria) | Trimestral | Producto |

---

#### 3.6.5 Humano en el ciclo

La supervisión humana es un requisito no negociable en ambas funciones de IA de MallHub v1.0. Ningún output del modelo puede llegar a usuarios finales (compradores) sin revisión explícita de un ser humano.

**Mapa de puntos de revisión humana**

```
AI-01 — Asistente de publicación de catálogo
─────────────────────────────────────────────
[Admin Local] Sube imagen / escribe nombre
       │
       ▼
[Sistema] Envía a API de Anthropic
       │
       ▼
[Sistema] Valida y presenta sugerencias con badge "Sugerido por IA"
       │
       ▼
[Admin Local] ◄─── REVISIÓN OBLIGATORIA ───►
  ├── Acepta sugerencia tal cual
  ├── Edita parcialmente
  ├── Descarta y completa manualmente
  └── Descarta todo y empieza desde cero
       │
       ▼
[Admin Local] Confirma publicación (toca "Publicar")
       │
       ▼
[Sistema] Producto visible en MallHub App para compradores

AI-02 — Generador de reportes de negocio
─────────────────────────────────────────
[Admin CC] Selecciona período y filtros
       │
       ▼
[Sistema] Agrega KPIs y envía a API de Anthropic
       │
       ▼
[Sistema] Presenta reporte narrativo en formato editable
       │
       ▼
[Admin CC] ◄─── REVISIÓN OBLIGATORIA ───►
  ├── Acepta y exporta
  ├── Edita secciones antes de exportar
  └── Descarta y exporta solo datos tabulares
       │
       ▼
[Admin CC] Toca "Exportar" (confirmación explícita)
       │
       ▼
[Sistema] Genera PDF/Excel con el contenido revisado
```

**Confirmación obligatoria antes de publicar contenido generado por IA**

En AI-01, si el Admin Local intenta publicar un producto sin haber modificado ninguno de los campos generados por IA, el sistema presenta el diálogo: *"¿Confirmas publicar el contenido generado por IA sin cambios?"* El usuario debe tocar "Confirmar" explícitamente. Este paso no puede omitirse ni automatizarse.

**Escalación ante fallos de calidad**

Si el Admin Local o el Admin CC reporta que el contenido generado es inapropiado, incorrecto o dañino, debe existir un mecanismo de reporte visible en la interfaz (botón "Reportar problema con la IA" junto al contenido generado) que registra el incidente en el sistema de soporte interno con los metadatos de la llamada (timestamp, model_id, hash del prompt) para revisión del AI Owner.

**Restricción de autonomía del sistema de IA**

El sistema de IA en MallHub v1.0 no tiene permitido:

- Publicar, modificar ni eliminar productos o contenido de forma autónoma.
- Enviar notificaciones push a compradores de forma autónoma.
- Modificar precios, disponibilidad de stock ni configuración del mall de forma autónoma.
- Iniciar ninguna transacción financiera.
- Acceder a datos de otros tenants (malls) distintos al del usuario que disparó la llamada.

Cualquier acción consecuente con el output de IA requiere una acción positiva del usuario humano (tocar un botón, confirmar un diálogo).

**Retroalimentación y mejora continua**

El sistema debe registrar, en los metadatos de cada llamada, si el usuario aceptó, editó o descartó el output. Esta señal de retroalimentación implícita se usará para:
1. Calcular las métricas de calidad definidas en §3.6.4.
2. Informar las iteraciones de prompt engineering del AI Owner.
3. Decidir si se necesita una evaluación formal con el proveedor ante una degradación sistemática de la calidad.

Esta retroalimentación **no se comparte con Anthropic** para entrenamiento del modelo.

---

#### 3.6.6 Ciclo de vida y operaciones del modelo

MallHub no gestiona el ciclo de vida del modelo de IA en el sentido tradicional (entrenamiento, evaluación, despliegue de pesos). Lo que sí gestiona es el ciclo de vida de la **integración con la API**, los **prompts de sistema** y los **criterios de calidad** del output.

**Despliegue inicial**

El despliegue de las funciones de IA (AI-01 y AI-02) en producción está condicionado a superar los criterios de la PoC (§3.5.9). Una vez superada la PoC, las funciones se despliegan como parte del release de MallHub v1.0. Los prompts de sistema se almacenan versionados en el repositorio del proyecto, no en el código fuente directamente, para facilitar su actualización sin un despliegue completo de la aplicación.

**Gestión de versiones de prompts**

Los system prompts son artefactos versionados con el mismo rigor que el código:

| Artefacto | Control de versiones | Repositorio |
|---|---|---|
| System prompt AI-01 | Git, semver de prompt (ej. `v1.0.0`) | Repositorio del proyecto, carpeta `/ai/prompts/` |
| System prompt AI-02 | Git, semver de prompt | Repositorio del proyecto, carpeta `/ai/prompts/` |
| Configuración de modelo (model_id, max_tokens, temperature) | Git, archivo de configuración por entorno | Repositorio del proyecto, carpeta `/ai/config/` |

Cualquier cambio en un prompt requiere: descripción del cambio en el commit, ejecución del conjunto de evaluación (mínimo 20 ejemplos del dataset de validación) y aprobación del AI Owner antes de despliegue en producción. Esto sigue el proceso de gestión de cambios estándar (§3.5.10) con categoría "Normal" para ajustes menores y "Mayor" para cambios que modifiquen el comportamiento del modelo de forma significativa.

**Monitoreo continuo en producción**

El sistema debe registrar automáticamente, para cada llamada a la API de Anthropic, los siguientes metadatos en el log de IA:

| Campo | Descripción |
|---|---|
| `timestamp` | Fecha y hora UTC de la llamada |
| `feature_id` | `AI-01` o `AI-02` |
| `tenant_id` | ID del mall del usuario que disparó la llamada |
| `user_id` | ID del Admin Local o Admin CC (nunca ID de compradores) |
| `model_id` | Identificador del modelo de Anthropic utilizado |
| `prompt_version` | Versión del system prompt aplicado |
| `tokens_used` | Tokens de entrada y salida (para control de costos) |
| `latency_ms` | Tiempo de respuesta de la API en milisegundos |
| `result` | `success` / `parse_error` / `timeout` / `api_error` / `rate_limited` |
| `user_action` | `accepted` / `edited` / `discarded` / `not_reviewed` (para métricas de calidad) |

Estos logs se revisan semanalmente por el AI Owner durante el piloto y mensualmente a partir de la Fase 2.

**Alertas de degradación de calidad**

El sistema debe emitir una alerta al AI Owner (email + canal de Slack o equivalente) cuando:
- La tasa de error de la API supera el **8%** en una ventana de 24 horas.
- La tasa de "discarded" (usuario descarta todo el output) supera el **30%** en una ventana de 7 días para cualquiera de las dos funciones, indicando posible degradación de calidad percibida.
- El gasto acumulado de API alcanza el **80% del presupuesto mensual** (USD 160 de los USD 200 presupuestados).

**Cambio de modelo (upgrade o deprecación)**

Cuando Anthropic depreca un modelo o publica una nueva versión que puede afectar el comportamiento:

1. El AI Owner evalúa el nuevo modelo ejecutando el conjunto de evaluación completo (dataset de validación + 10 ejemplos adicionales del entorno de staging).
2. Si la calidad es igual o superior, se actualiza el `model_id` en la configuración y se despliega como cambio "Normal".
3. Si la calidad es inferior en alguna dimensión relevante, se analiza si el prompt puede ajustarse para recuperarla antes de migrar.
4. La migración de modelo nunca se realiza en producción sin evaluación previa en staging.

**Retiro de una función de IA**

Si una función de IA debe retirarse (por decisión de producto, por incumplimiento ético, por degradación irreversible de la calidad, o por cambio en los términos del proveedor), el proceso es:

1. La función se desactiva mediante feature flag sin despliegue de código.
2. El modo manual queda activo como reemplazo inmediato (garantizado por el diseño de fallback, §3.6.3).
3. Se notifica a los usuarios afectados (Admin Locales y/o Admin CC) mediante mensaje en la app y email.
4. Los logs de auditoría de IA de la función retirada se conservan durante 12 meses desde la fecha de retiro.

## 4. Verificación

Esta sección mapea cada requisito del SRS a su método de verificación, artefacto de prueba y estado de validación. La matriz cubre los requisitos funcionales (§2.6, §3.2), las interfaces (§3.1), los atributos de calidad (§3.3), el cumplimiento (§3.4) y los requisitos de IA (§3.6). Los requisitos diferidos a fases posteriores (`[F]`) se incluyen con estado "Diferido" para trazabilidad completa.

### Convenciones

**Métodos de verificación**

| Código | Método | Descripción |
|---|---|---|
| **T** | Test | Prueba ejecutable (automatizada o manual) con resultado pass/fail verificable |
| **I** | Inspección | Revisión de código, configuración, documento o artefacto por un revisor calificado |
| **A** | Análisis | Evaluación mediante cálculo, modelado o comparación con un umbral numérico |
| **D** | Demostración | Ejecución del sistema en condiciones reales o de staging ante un revisor |

**Estados**

| Estado | Significado |
|---|---|
| `Pendiente` | Requisito definido; artefacto de prueba no creado aún |
| `En progreso` | Artefacto de prueba en desarrollo |
| `Verificado` | Prueba ejecutada y aprobada en el entorno objetivo |
| `Fallido` | Prueba ejecutada y no superada; existe defecto abierto |
| `Diferido` | Requisito de fase posterior; no aplica para v1.0 |
| `No aplica` | El requisito no requiere prueba adicional (derivado de otro verificado) |

---

### 4.1 Requisitos funcionales (§2.6 · §3.2)

#### MallHub App — Funcionalidades de Invitado y Cliente Registrado

| ID del requisito | Descripción | Método | Artefacto de prueba / Referencia | Estado | Evidencia |
|---|---|---|---|---|---|
| REQ-APP-00 | Navegación pública sin registro | T + D | Historias US-INV-02 a US-INV-14 y US-INV-17; test E2E de flujo público (invitado) | Pendiente | — |
| REQ-APP-01 | Onboarding y autenticación | T | Historias US-INV-01, US-INV-15, US-INV-16, US-INV-17, US-CR-01, US-CR-02, US-CR-03, US-CR-04 y US-CR-05; test unitario de validación JWT | Pendiente | — |
| REQ-APP-02 | Home Feed y directorio de tiendas | T + D | Historias US-INV-04, US-INV-05, US-INV-06 y US-INV-07; test de renderizado con datos reales de staging | Pendiente | — |
| REQ-APP-03 | Búsqueda y filtros de productos | T + A | Historias US-INV-09 y US-INV-10; test de debounce (300 ms medidos con timer); test de relevancia de resultados | Pendiente | — |
| REQ-APP-04 | Perfil de tienda y catálogo de productos | T | Historias US-INV-07 y US-INV-08; test de tabs (Catálogo / Información / Reseñas) | Pendiente | — |
| REQ-APP-05 | Flujo de Click & Collect — reserva + QR | T + D | Historias US-CR-08, US-CR-09, US-CR-10 y US-CR-11; test end-to-end del ciclo completo (App → Store → notificación → QR); test de idempotencia con `idempotency_key` | Pendiente | — |
| REQ-APP-06 | Mis reservas y seguimiento de pedidos | T | Historias US-CR-12 y US-CR-13; test de cambio de estado vía WebSocket | Pendiente | — |
| REQ-APP-07 | Ofertas y promociones activas | T | Historia US-INV-13; test de contador flash (decremento en tiempo real ±1 s) | Pendiente | — |
| REQ-APP-08 | Calendario de eventos del mall | T | Historias US-INV-11, US-INV-12 y US-CR-18; test de toggle lista/calendario | Pendiente | — |
| REQ-APP-09 | Mapa interactivo del mall | T + D | Historia US-INV-14; test de carga de SVG y pins de tiendas; demo en dispositivo físico | Pendiente | — |
| REQ-APP-10 | Favoritos (tiendas y productos) | T | Historias US-CR-15, US-CR-16, US-CR-17 y US-CR-21; test de persistencia en servidor tras cierre y reapertura de app | Pendiente | — |
| REQ-APP-11 | Calificaciones y reseñas de tiendas | T | Historia US-CR-14 (planificada para v2.0) | Diferido | — |
| REQ-APP-12 | Regateo / negociación de precios | T | No especificado en v1.0 | Diferido | — |

#### MallHub Store — Admin Local

| ID del requisito | Descripción | Método | Artefacto de prueba / Referencia | Estado | Evidencia |
|---|---|---|---|---|---|
| REQ-STR-01 | Onboarding y perfil de tienda | T + D | Historias US-AL-01, US-AL-02, US-AL-03, US-AL-04 y US-AL-20; demo de flujo completo de registro hasta aprobación | Pendiente | — |
| REQ-STR-02 | Gestión de catálogo — CRUD de productos | T | Historias US-AL-06, US-AL-07, US-AL-08, US-AL-09, US-AL-10, US-AL-11, US-AL-12, US-AL-13 y US-AL-14; test CRUD completo (crear, leer, editar, desactivar, eliminar); test de validación de imágenes (formato, tamaño) | Pendiente | — |
| REQ-STR-03 | Gestión de reservas entrantes | T + D | Historias US-AL-15, US-AL-16, US-AL-17, US-AL-18 y US-AL-19; test de recepción en tiempo real; test de escaneo QR; demo del ciclo completo con dispositivo físico | Pendiente | — |
| REQ-STR-04 | Publicación de promociones y ofertas flash | T | Historias US-AL-21 y US-AL-22; test de validación de fechas; test de expiración automática de oferta flash | Pendiente | — |
| REQ-STR-05 | Dashboard básico de tienda | T | Historias US-AL-05 y US-AL-23; test de KPIs básicos con datos de staging | Pendiente | — |
| REQ-STR-06 | Analytics avanzados — Plan Pro | T | No especificado en v1.0 | Diferido | — |
| REQ-STR-07 | Gestión de plan y facturación — autoservicio | T | No especificado en v1.0 | Diferido | — |

#### MallHub Insights — Admin CC

| ID del requisito | Descripción | Método | Artefacto de prueba / Referencia | Estado | Evidencia |
|---|---|---|---|---|---|
| REQ-INS-01 | Dashboard principal de KPIs del mall | T + A | Historias US-ACC-04, US-ACC-05 y US-ACC-06; test de aislamiento de tenant (Admin CC no ve datos de otro mall); medición de desfase máximo de datos (≤ 5 min) | Pendiente | — |
| REQ-INS-02 | Gestión de eventos del mall | T | Historias US-ACC-13, US-ACC-14, US-ACC-15, US-ACC-16 y US-ACC-17; test de publicación y visibilidad en App; test de push notification programada | Pendiente | — |
| REQ-INS-03 | Gestión y aprobación de tiendas del mall | T | Historias US-ACC-18, US-ACC-19, US-ACC-20, US-ACC-21, US-ACC-22, US-ACC-23 y US-ACC-24; test de flujo completo (solicitud → aprobación → visibilidad en App) | Pendiente | — |
| REQ-INS-04 | Configuración del perfil del mall | T | Historias US-ACC-25, US-ACC-26, US-ACC-27 y US-ACC-28; test de actualización de mapa SVG | Pendiente | — |
| REQ-INS-05 | Inteligencia de tiendas — heatmap | T + D | Historias US-ACC-09, US-ACC-10, US-ACC-11 y US-ACC-12; demo de heatmap con datos del piloto | Pendiente | — |
| REQ-INS-06 | Exportación de reportes PDF / Excel | T + D | Historias US-ACC-07, US-ACC-08 y US-ACC-12; test de generación de PDF y Excel con datos reales; verificación de apertura del diálogo nativo del SO | Pendiente | — |
| REQ-INS-07 | Gestión de publicidad y banners | T | No especificado en v1.0 | Diferido | — |
| REQ-INS-08 | Reportes avanzados y personalizados | T | No especificado en v1.0 | Diferido | — |

#### MallHub Insights — Admin Plataforma (Backoffice)

| ID del requisito | Descripción | Método | Artefacto de prueba / Referencia | Estado | Evidencia |
|---|---|---|---|---|---|
| REQ-ADM-01 | Activación de malls y onboarding de tenants | T + D | Historias US-AP-08, US-AP-09, US-AP-10, US-AP-11 y US-AP-12; demo de creación de mall + login del Admin CC con credenciales provisionales | Pendiente | — |
| REQ-ADM-02 | Aprobación / rechazo de registros de tiendas | T | Historias US-AP-13 y US-AP-14; test de flujo de moderación desde backoffice | Pendiente | — |
| REQ-ADM-03 | Moderación de contenido — catálogos, imágenes | T | Historias US-AP-15 y US-AP-16; test de retiro de producto y notificación al Admin Local | Pendiente | — |
| REQ-ADM-04 | Gestión de suscripciones y facturación | T + I | Historias US-AP-17, US-AP-18 y US-AP-19; inspección de generación de factura electrónica XML DIAN | Pendiente | — |
| REQ-ADM-05 | Monitor de salud de la plataforma — audit log | T + D | Historias US-AP-05, US-AP-06 y US-AP-07; demo de panel de semáforo en staging; verificación de inmutabilidad del audit log | Pendiente | — |
| REQ-ADM-06 | Gestión de campañas publicitarias | T | No especificado en v1.0 | Diferido | — |

#### Infraestructura transversal

| ID del requisito | Descripción | Método | Artefacto de prueba / Referencia | Estado | Evidencia |
|---|---|---|---|---|---|
| REQ-INF-01 | Autenticación y autorización multi-rol JWT / OAuth 2.0 | T + I | Test unitario de emisión/validación JWT (RS256); test de RBAC (cada rol accede solo a sus recursos); test de OAuth 2.0 PKCE con Google; inspección de almacenamiento en keychain | Pendiente | — |
| REQ-INF-02 | Sistema de notificaciones push | T + D | Test de entrega de push en dispositivo iOS físico (APNs) y Android físico (FCM); test de notificación de escritorio (Tauri); medición de latencia de entrega (< 3 s) | Pendiente | — |
| REQ-INF-03 | Integración con pasarela de pagos | T + I | Test de flujo de pago end-to-end en sandbox de la pasarela; test de webhook con firma HMAC; inspección de que ningún PAN pasa por servidores de MallHub | Pendiente | — |
| REQ-INF-04 | Almacenamiento y CDN de medios | T + A | Test de upload de imagen (JPEG/PNG/WebP, límite 2 MB); test de acceso desde CDN con URL firmada; test de rechazo de formato inválido; medición de latencia de CDN (< 500 ms P95 desde Colombia) | Pendiente | — |
| REQ-INF-05 | Motor de analytics y pipeline de datos | T + A | Test de ingesta de evento de comportamiento y verificación en BigQuery; medición de desfase máximo (≤ 5 min); test de aislamiento de datos por tenant_id | Pendiente | — |
| REQ-INF-06 | Internacionalización — i18n | I | Inspección de código: ausencia de strings hardcodeadas en componentes; revisión de archivos de traducción por locale; verificación de uso de `Intl` API | Diferido | — |

---

### 4.2 Interfaces externas (§3.1)

| ID del requisito | Descripción | Método | Artefacto de prueba / Referencia | Estado | Evidencia |
|---|---|---|---|---|---|
| IU-APP-01 a IU-APP-15 | Interfaces de usuario — MallHub App | T | Escenarios Gherkin de historias US-INV-* y US-CR-*; test de accesibilidad Lighthouse (≥ 90/100) en las 16 pantallas CORE | Pendiente | — |
| IU-STR-01 a IU-STR-10 | Interfaces de usuario — MallHub Store | T + D | Escenarios Gherkin de historias US-AL-*; test de resolución mínima 1280 × 800 px; demo en macOS y Windows | Pendiente | — |
| IU-INS-01 a IU-INS-11 | Interfaces de usuario — MallHub Insights | T + D | Escenarios Gherkin de historias US-ACC-* y US-AP-*; test de escalado a 4K; demo con datos reales del piloto | Pendiente | — |
| IH-01 | Cámara trasera — captura de imágenes | T | Test en dispositivo físico iOS y Android: captura desde cámara en formulario de producto; captura para escaneo QR | Pendiente | — |
| IH-02 | GPS / geolocalización | T | Test en dispositivo físico: detección de mall cercano; test de fallback a selección manual cuando se deniega el permiso | Pendiente | — |
| IH-03 | Almacenamiento local — Mobile | T | Test de acceso offline al QR cacheado; test de límite de tamaño de caché de imágenes | Pendiente | — |
| IH-04 | Almacenamiento local — Desktop | T | Test de exportación de reporte PDF/Excel al filesystem; test de diálogo nativo de selección de ruta | Pendiente | — |
| IH-05 | Pantalla / resolución — Desktop | T | Test de redimensionamiento de ventana; test con monitor externo de resolución diferente | Pendiente | — |
| IH-06 | Notificaciones del SO | T + D | Test de integración con centro de notificaciones de iOS, Android, macOS y Windows | Pendiente | — |
| ISW-PAY-01 a ISW-PAY-04 | Pasarela de pagos | T + I | Test en sandbox de la pasarela; test de respuesta ante timeout; inspección de ausencia de PAN en logs | Pendiente | — |
| ISW-PUSH-01 a ISW-PUSH-05 | Notificaciones push — APNs / FCM / Desktop | T | Test de entrega en background y foreground; test de payload (dentro de límites de tamaño); test de respeto de suscripción del usuario | Pendiente | — |
| ISW-MAP-01 a ISW-MAP-03 | Servicio de mapas y geolocalización | T | Test de carga del mapa base (Google Maps / Mapbox); test de SVG interno; test de fallback a selección manual sin servicio externo | Pendiente | — |
| ISW-ANL-01 a ISW-ANL-03 | Servicio de analytics y BI | T + A | Test de ingesta de evento; medición de latencia de datos (≤ 5 min); test de aislamiento de tenant en consultas | Pendiente | — |
| ISW-STG-01 a ISW-STG-04 | Almacenamiento de medios — CDN | T | Test de upload JPEG/PNG/WebP; test de rechazo de formato inválido; test de acceso desde CDN; test de generación de thumbnails | Pendiente | — |
| ISW-AUTH-01 a ISW-AUTH-05 | Autenticación y autorización | T + I | Test de expiración y refresh de JWT; test de 2FA TOTP para Admin Plataforma; test de RBAC por rol; inspección de almacenamiento seguro en keychain | Pendiente | — |
| IC-01 a IC-08 | Interfaces de comunicación | T + I | Test de TLS en todos los endpoints; test de reconexión WebSocket con backoff; test de validación de firma en webhook; inspección de protocolo via proxy de interceptación (staging) | Pendiente | — |

---

### 4.3 Calidad del servicio (§3.3)

#### Rendimiento

| ID del requisito | Descripción | Método | Artefacto de prueba / Referencia | Estado | Evidencia |
|---|---|---|---|---|---|
| NFR-PERF-01 | Latencia API — GET catálogo (P95 < 400 ms) | A | Test de carga con k6 / Gatling: 500 req/s concurrentes; medición P50/P95/P99 por endpoint | Pendiente | — |
| NFR-PERF-02 | Latencia API — POST reserva (P95 < 1.200 ms) | A | Misma suite de carga; medición específica de endpoint de creación de reserva | Pendiente | — |
| NFR-PERF-03 | Latencia API — Dashboard KPIs (P95 < 2.000 ms) | A | Test de carga del endpoint de analytics; verificación con consultas reales a BigQuery | Pendiente | — |
| NFR-PERF-04 | Búsqueda — debounce de 300 ms | T | Test unitario: medición de tiempo entre última tecla y lanzamiento de request HTTP | Pendiente | — |
| NFR-PERF-05 | FCP App móvil (4G) < 1,5 s · TTI < 3 s | A | Lighthouse audit en dispositivo físico (Chrome DevTools + emulación 4G) | Pendiente | — |
| NFR-PERF-06 | Arranque en frío — Desktop < 2 s | A | Medición manual con stopwatch en máquina objetivo (macOS + Windows) | Pendiente | — |
| NFR-PERF-07 | Uso de RAM — App < 120 MB en reposo | A | Android Studio profiler + Instruments (iOS); medición tras 5 min de uso normal | Pendiente | — |
| NFR-PERF-08 | Bundle instalable App < 50 MB | A | Medición del artefacto .ipa / .aab post-build en pipeline CI | Pendiente | — |
| NFR-PERF-09 | Desfase máximo de analytics ≤ 5 min | A | Test de ingesta de evento artificial y verificación de aparición en dashboard; medición de latencia | Pendiente | — |
| NFR-PERF-10 | Actualización WebSocket ≤ 3 s | A | Test instrumentado: timestamp en evento del Admin Local vs timestamp de recepción en App del Cliente | Pendiente | — |
| NFR-PERF-11 | Push notifications — throughput 10.000 notif/min | A | Test de carga del servicio de push; verificación de cola sin acumulación > 60 s | Pendiente | — |

#### Seguridad

| ID del requisito | Descripción | Método | Artefacto de prueba / Referencia | Estado | Evidencia |
|---|---|---|---|---|---|
| NFR-SEC-01 | TLS 1.2 mínimo en todas las conexiones | I + T | Inspección de configuración del servidor; test con ssllabs.com (objetivo: A o A+) | Pendiente | — |
| NFR-SEC-02 | JWT RS256 — expiración 60 min / refresh 30 días | T + I | Test unitario de emisión y validación; test de rechazo de token expirado; inspección del algoritmo en el header del JWT | Pendiente | — |
| NFR-SEC-03 | Tokens en keychain nativo — no en localStorage | I | Inspección de código: búsqueda de referencias a `localStorage` / `sessionStorage` para tokens de sesión | Pendiente | — |
| NFR-SEC-04 | 2FA TOTP obligatorio para Admin Plataforma | T | Test de login sin 2FA configurado (debe ser rechazado); test de login con código TOTP válido e inválido | Pendiente | — |
| NFR-SEC-05 | Aislamiento multi-tenant — acceso cruzado prohibido | T | Test de penetración básico: token de Admin CC del mall A intentando acceder a datos del mall B; debe devolver 403 | Pendiente | — |
| NFR-SEC-06 | Rate limiting — autenticación ≤ 10 req/IP/min | T | Test con k6: superar el límite y verificar respuesta 429 con Retry-After | Pendiente | — |
| NFR-SEC-07 | Bloqueo de cuenta tras 5 intentos fallidos | T | Test manual de 5 intentos con contraseña incorrecta; verificar bloqueo de 15 min y email de alerta | Pendiente | — |
| NFR-SEC-08 | Sin almacenamiento de PAN (PCI-DSS) | I + T | Inspección de logs del servidor: ausencia de patrones de PAN; test de intercepción de tráfico en sandbox de pagos | Pendiente | — |
| NFR-SEC-09 | Validación de tipo MIME real de imágenes | T | Test: enviar archivo .exe con extensión .jpg; debe ser rechazado con error específico | Pendiente | — |
| NFR-SEC-10 | Audit log inmutable — todas las acciones admin | T + I | Test de intento de modificación del log por Admin Plataforma (debe fallar); inspección de ausencia de endpoints DELETE/UPDATE sobre el log | Pendiente | — |
| NFR-SEC-11 | Secretos gestionados en vault — no en código fuente | I | Escaneo automatizado con truffleHog o equivalente sobre el repositorio completo | Pendiente | — |
| NFR-SEC-12 | OWASP Top 10 — inyección SQL / XSS / CSRF | T | Test de penetración básico (OWASP ZAP o Burp Suite Community) sobre endpoints de autenticación, búsqueda y creación de reservas | Pendiente | — |

#### Confiabilidad

| ID del requisito | Descripción | Método | Artefacto de prueba / Referencia | Estado | Evidencia |
|---|---|---|---|---|---|
| NFR-REL-01 | Tasa de errores 5xx < 0,1% bajo carga nominal | A | Medición en test de carga (500 req/s, 30 min): porcentaje de respuestas 5xx | Pendiente | — |
| NFR-REL-02 | Idempotencia de creación de reserva | T | Test: enviar la misma solicitud de reserva con el mismo `idempotency_key` dos veces; verificar que solo se crea una reserva | Pendiente | — |
| NFR-REL-03 | Degradación elegante — mapa no disponible | T | Test de apagado del servicio de mapas en staging; verificar que el resto de la App sigue funcionando | Pendiente | — |
| NFR-REL-04 | Degradación elegante — API de IA no disponible | T | Test de mock de timeout en Anthropic API; verificar que Store y Insights continúan operando en modo manual | Pendiente | — |
| NFR-REL-05 | Reconexión WebSocket con backoff exponencial | T + A | Test: cortar la conexión y medir los intentos de reconexión (intervalos crecientes con jitter); verificar reconexión exitosa tras 5 intentos | Pendiente | — |
| NFR-REL-06 | MTTR ante incidente P1 < 2 horas | D | Drill de recuperación de incidente simulado en staging (documentado en runbook) | Pendiente | — |

#### Disponibilidad

| ID del requisito | Descripción | Método | Artefacto de prueba / Referencia | Estado | Evidencia |
|---|---|---|---|---|---|
| NFR-AVA-01 | SLA API Backend ≥ 99,5% mensual | A | Revisión mensual de datos de uptime del proveedor cloud + monitoring propio | Pendiente | — |
| NFR-AVA-02 | SLA Base de datos ≥ 99,9% mensual | A | Misma revisión | Pendiente | — |
| NFR-AVA-03 | RTO ante fallo de instancia < 30 s | T + A | Test de terminación de instancia (chaos engineering básico) en staging; medición del tiempo hasta restablecimiento de tráfico | Pendiente | — |
| NFR-AVA-04 | RPO ante pérdida de datos < 1 hora | D | Drill de restore desde backup: crear dato, simular pérdida, restaurar y verificar; medir tiempo desde último backup | Pendiente | — |
| NFR-AVA-05 | Backup exitoso — frecuencia horaria | A + I | Inspección de política de backup configurada; verificación de historial de snapshots en el proveedor cloud | Pendiente | — |
| NFR-AVA-06 | Drill de disaster recovery cada 60 días | D | Ejercicio documentado de restore completo con resultado pass/fail y tiempo medido | Pendiente | — |

#### Observabilidad

| ID del requisito | Descripción | Método | Artefacto de prueba / Referencia | Estado | Evidencia |
|---|---|---|---|---|---|
| NFR-OBS-01 | Logs JSON estructurados con campos obligatorios | I | Inspección de muestra de 10 entradas de log de producción: verificar presencia de todos los campos mínimos (`timestamp`, `level`, `service`, `trace_id`, `tenant_id`) | Pendiente | — |
| NFR-OBS-02 | Métricas de negocio en dashboard de monitoreo | D | Demo del dashboard de monitoreo mostrando las 15 métricas mínimas definidas en §3.3.5 | Pendiente | — |
| NFR-OBS-03 | Trazabilidad distribuida con `trace_id` | T | Test: ejecutar una reserva completa y verificar que el `trace_id` aparece en los logs de todos los servicios involucrados | Pendiente | — |
| NFR-OBS-04 | Alerta de error rate > 1% en < 2 min | T | Test en staging: introducir errores artificiales; verificar que la alerta se dispara dentro del tiempo esperado | Pendiente | — |
| NFR-OBS-05 | Panel de semáforo para Admin Plataforma — TTR ≤ 60 s | T + A | Test de cambio de estado de un servicio; medición del tiempo hasta que el panel refleja el cambio | Pendiente | — |

#### Escalabilidad

| ID del requisito | Descripción | Método | Artefacto de prueba / Referencia | Estado | Evidencia |
|---|---|---|---|---|---|
| NFR-SCA-01 | Backend stateless — sin estado de sesión en memoria | I | Inspección de código: ausencia de variables de sesión en memoria de la instancia; verificación con 2 instancias en paralelo | Pendiente | — |
| NFR-SCA-02 | Auto-scaling — nueva instancia en < 60 s | A + D | Demo de configuración de auto-scaling en staging; medición del tiempo de aprovisionamiento | Pendiente | — |
| NFR-SCA-03 | Capacidad v1.0: 500 req/s sin degradación | A | Test de carga sostenida a 500 req/s durante 10 min; P95 dentro de umbrales definidos en §3.3.1 | Pendiente | — |

#### Accesibilidad

| ID del requisito | Descripción | Método | Artefacto de prueba / Referencia | Estado | Evidencia |
|---|---|---|---|---|---|
| NFR-ACC-01 | WCAG 2.1 AA — contraste texto normal ≥ 4.5:1 | A + T | Audit Lighthouse Accessibility en las 16 pantallas CORE; medición de ratio con herramienta Colour Contrast Analyser | Pendiente | — |
| NFR-ACC-02 | Compatibilidad con VoiceOver (iOS) y TalkBack (Android) | T + D | Test manual con VoiceOver activado en iPhone; test con TalkBack en Android; verificar navegación de los flujos CORE | Pendiente | — |
| NFR-ACC-03 | Todos los elementos interactivos con nombre ARIA | I + T | axe-core integrado en pipeline CI; umbral máximo: 0 errores de nivel AA en pantallas CORE | Pendiente | — |
| NFR-ACC-04 | Lighthouse Accessibility ≥ 90/100 — pantallas CORE | A | Ejecución de Lighthouse sobre las 16 URLs de pantallas CORE en staging | Pendiente | — |

---

### 4.4 Cumplimiento (§3.4)

| ID del requisito | Descripción | Método | Artefacto de prueba / Referencia | Estado | Evidencia |
|---|---|---|---|---|---|
| COMP-01 | Ley 1581 — aviso de privacidad con aceptación explícita | I + D | Inspección del flujo de registro: verificar checkbox obligatorio; demo con captura de pantalla | Pendiente | — |
| COMP-02 | Ley 1581 — derecho de acceso y descarga de datos | D | Demo del flujo de solicitud de datos; verificación de entrega en ≤ 15 días hábiles | Pendiente | — |
| COMP-03 | Ley 1581 — derecho de supresión de cuenta | T + D | Test de eliminación de cuenta: verificar desactivación en < 48 h y anonimización en ≤ 30 días | Pendiente | — |
| COMP-04 | Ley 1581 — sin PII de compradores en prompts de IA | I | Inspección del código de construcción de prompts: grep de accesos a campos `email`, `phone`, `name` de usuarios en el módulo de IA | Pendiente | — |
| COMP-05 | DIAN — factura electrónica XML válida | I + D | Generación de factura de prueba y validación contra el validador de la DIAN; revisión por asesor contable | Pendiente | — |
| COMP-06 | PCI-DSS SAQ A — sin PAN en servidores MallHub | I + T | Test de interceptación en sandbox: verificar que ningún request hacia servidores MallHub contiene PAN; inspección de logs del servidor | Pendiente | — |
| COMP-07 | Apple App Store — Privacy Manifest y permisos declarados | I | Revisión del `PrivacyInfo.xcprivacy` y `Info.plist` contra las App Store Review Guidelines vigentes antes de la sumisión | Pendiente | — |
| COMP-08 | Google Play — Data Safety Form completo | I | Revisión del formulario de Data Safety en Google Play Console antes de la publicación | Pendiente | — |
| COMP-09 | Anthropic Usage Policy — sin datos personales en prompts | I | Inspección del código de AI-01 y AI-02: verificar sanitización de PII antes del envío a la API | Pendiente | — |
| COMP-10 | Anthropic — revisión humana obligatoria antes de publicar | T | Test: intentar publicar un producto con campos de IA sin editar; verificar que el diálogo de confirmación es obligatorio e ineludible | Pendiente | — |

---

### 4.5 Requisitos de IA/ML (§3.6)

| ID del requisito | Descripción | Método | Artefacto de prueba / Referencia | Estado | Evidencia |
|---|---|---|---|---|---|
| AI-01-PERF | Latencia AI-01 (imagen → campos en pantalla) < 12 s | A | Medición en 20 llamadas sucesivas con imágenes reales del dataset de validación; cálculo de P50 y P90 | Pendiente | — |
| AI-01-QUAL | Tasa de respuesta útil AI-01 ≥ 75% | A | Evaluación del dataset de validación (20 imágenes); anotación manual de "útil / no útil sin edición mayor" por el equipo de producto | Pendiente | — |
| AI-01-ERR | Tasa de error AI-01 < 5% | A | Medición en 100 llamadas de prueba en staging; conteo de respuestas vacías / JSON inválido / timeout | Pendiente | — |
| AI-02-PERF | Latencia AI-02 (generar reporte) < 30 s | A | Medición en 10 llamadas con distintos rangos de fechas y volúmenes de datos; cálculo de tiempo extremo a extremo | Pendiente | — |
| AI-02-QUAL | Tasa de respuesta estructurada válida AI-02 ≥ 90% | A | Verificación de que las 5 secciones obligatorias están presentes y tienen contenido coherente con los datos enviados | Pendiente | — |
| AI-CTL-01 | Bloqueo de PII en prompt — ningún PAN o dato personal | I + T | Inspección del módulo de sanitización; test de inyección: enviar nombre de producto con email embebido y verificar que es bloqueado | Pendiente | — |
| AI-CTL-02 | Filtro de salida — contenido inapropiado rechazado | T | Test de prompt diseñado para generar contenido inapropiado; verificar que el filtro lo detecta y deja el campo vacío | Pendiente | — |
| AI-CTL-03 | Circuit breaker se activa ante error rate > 20% | T | Test en staging: simular errores de Anthropic API al 25%; verificar deshabilitación de funciones de IA y restauración tras cooldown | Pendiente | — |
| AI-CTL-04 | Rate limit por usuario — AI-01 ≤ 20 llamadas/hora | T | Test: superar el límite desde la misma cuenta; verificar respuesta de error adecuada y que no se realizan llamadas adicionales a la API | Pendiente | — |
| AI-CTL-05 | Presupuesto mensual — alerta al 80% | T + D | Test en staging con contador de gasto simulado; verificar que la alerta al AI Owner se dispara al alcanzar el umbral | Pendiente | — |
| AI-HITL-01 | Publicación con contenido IA requiere confirmación explícita | T | Escenarios Gherkin CA-LOC-03-H; test automatizado del flujo de publicación sin edición | Pendiente | — |
| AI-HITL-02 | Sistema de IA no ejecuta ninguna acción autónoma | I + T | Inspección de código: ausencia de llamadas directas a endpoints de escritura desde el módulo de IA sin acción de usuario; test de intento de publicación automática | Pendiente | — |
| AI-OPS-01 | Logs de IA con todos los metadatos requeridos | I | Inspección de una muestra de 10 entradas de log de IA; verificar presencia de todos los campos definidos en §3.6.6 | Pendiente | — |
| AI-OPS-02 | Prompts versionados en Git con evaluación pre-despliegue | I | Inspección del repositorio: verificar existencia de carpeta `/ai/prompts/` con versionado y evidencia de evaluación en último commit de cambio de prompt | Pendiente | — |

---

## 5. Apéndices

---

### Apéndice A — Historial de revisiones del documento

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| **0.1** | 2026-04 | Equipo de Producto MallHub | Borrador inicial: Secciones 1 y 2 (Introduction, Overall Description) |
| **0.2** | 2026-04 | Equipo de Producto MallHub | Sección 3.1 (Interfaces externas) y 3.2 (Funciones — Invitado y Cliente Registrado) |
| **0.3** | 2026-04 | Equipo de Producto MallHub | Sección 3.2 completa (Admin Local, Admin CC, Admin Plataforma) |
| **0.4** | 2026-04 | Equipo de Producto MallHub | Secciones 3.3 a 3.5 (Calidad del servicio, Cumplimiento, Diseño e implementación) |
| **0.5** | 2026-04 | Equipo de Producto MallHub | Sección 3.6 (IA/ML) |
| **0.6** | 2026-04 | Equipo de Producto MallHub | Sección 4 (Verificación) y Sección 5 (Apéndices) |
| **1.0** | *(pendiente)* | Equipo de Producto + Tech Lead | Revisión final, aprobación y baseline para inicio de desarrollo de v1.0 |

> El documento alcanza el estado **baseline (v1.0)** cuando es formalmente aprobado por el Product Manager y el Tech Lead de MallHub. A partir de ese momento, cualquier cambio sigue el proceso documentado en §3.5.10.

---

### Apéndice B — Matriz de trazabilidad de requisitos

Esta matriz conecta los requisitos funcionales de alto nivel (§2.6) con los casos de uso que los especifican (§3.2) y con los IDs de los escenarios Gherkin que los verifican.

| REQ ID | Caso(s) de uso | Escenarios Gherkin principales | Archivo de especificación |
|---|---|---|---|
| REQ-APP-00 | US-INV-02 a US-INV-14, US-INV-17 | Escenarios definidos en las historias US-INV-02..14 y US-INV-17 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-APP-01 | US-INV-01, US-INV-15, US-INV-16, US-INV-17, US-CR-01..05 | Escenarios definidos en las historias US-INV-01, US-INV-15, US-INV-16, US-INV-17 y US-CR-01..05 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-APP-02 | US-INV-04, US-INV-05, US-INV-06, US-INV-07 | Escenarios definidos en las historias US-INV-04..07 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-APP-03 | US-INV-09, US-INV-10 | Escenarios definidos en las historias US-INV-09 y US-INV-10 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-APP-04 | US-INV-07, US-INV-08 | Escenarios definidos en las historias US-INV-07 y US-INV-08 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-APP-05 | US-CR-08, US-CR-09, US-CR-10, US-CR-11 | Escenarios definidos en las historias US-CR-08..11 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-APP-06 | US-CR-12, US-CR-13 | Escenarios definidos en las historias US-CR-12 y US-CR-13 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-APP-07 | US-INV-13 | Escenarios definidos en la historia US-INV-13 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-APP-08 | US-INV-11, US-INV-12, US-CR-18 | Escenarios definidos en las historias US-INV-11, US-INV-12 y US-CR-18 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-APP-09 | US-INV-14 | Escenarios definidos en la historia US-INV-14 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-APP-10 | US-CR-15, US-CR-16, US-CR-17, US-CR-21 | Escenarios definidos en las historias US-CR-15, US-CR-16, US-CR-17 y US-CR-21 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-STR-01 | US-AL-01, US-AL-02, US-AL-03, US-AL-04, US-AL-20 | Escenarios definidos en las historias US-AL-01, US-AL-02, US-AL-03, US-AL-04 y US-AL-20 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-STR-02 | US-AL-06 a US-AL-14 | Escenarios definidos en las historias US-AL-06..14 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-STR-03 | US-AL-15 a US-AL-19 | Escenarios definidos en las historias US-AL-15..19 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-STR-04 | US-AL-21, US-AL-22 | Escenarios definidos en las historias US-AL-21 y US-AL-22 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-STR-05 | US-AL-05, US-AL-23 | Escenarios definidos en las historias US-AL-05 y US-AL-23 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-INS-01 | US-ACC-04, US-ACC-05, US-ACC-06 | Escenarios definidos en las historias US-ACC-04, US-ACC-05 y US-ACC-06 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-INS-02 | US-ACC-13 a US-ACC-17 | Escenarios definidos en las historias US-ACC-13..17 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-INS-03 | US-ACC-18 a US-ACC-24 | Escenarios definidos en las historias US-ACC-18..24 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-INS-04 | US-ACC-25 a US-ACC-28 | Escenarios definidos en las historias US-ACC-25..28 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-INS-05 | US-ACC-09, US-ACC-10, US-ACC-11, US-ACC-12 | Escenarios definidos en las historias US-ACC-09..12 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-INS-06 | US-ACC-07, US-ACC-08, US-ACC-12 | Escenarios definidos en las historias US-ACC-07, US-ACC-08 y US-ACC-12 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-ADM-01 | US-AP-08, US-AP-09, US-AP-10, US-AP-11, US-AP-12 | Escenarios definidos en las historias US-AP-08..12 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-ADM-02 | US-AP-13, US-AP-14 | Escenarios definidos en las historias US-AP-13 y US-AP-14 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-ADM-03 | US-AP-15, US-AP-16 | Escenarios definidos en las historias US-AP-15 y US-AP-16 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-ADM-04 | US-AP-17, US-AP-18, US-AP-19 | Escenarios definidos en las historias US-AP-17, US-AP-18 y US-AP-19 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-ADM-05 | US-AP-05, US-AP-06, US-AP-07 | Escenarios definidos en las historias US-AP-05, US-AP-06 y US-AP-07 | `SoftwareRequirementsSpecification.md` (§3.2) |
| REQ-INF-01 | US-CR-03, US-CR-05, US-AL-03, US-ACC-01, US-AP-01, ISW-AUTH-01..05 | Escenarios de autenticación y autorización en las historias US-CR-03, US-AL-03, US-ACC-01 y US-AP-01 | `SoftwareRequirementsSpecification.md` (§3.1.3, §3.2) |
| REQ-INF-02 | US-CR-18, US-CR-19, US-CR-20, US-AL-15, US-ACC-17 | Escenarios de recepción y preferencias de notificaciones en US-CR-18, US-CR-19, US-CR-20, US-AL-15 y US-ACC-17 | `SoftwareRequirementsSpecification.md` (§3.1.3, §3.2) |
| REQ-INF-03 | US-CR-08, US-CR-09, ISW-PAY-01..04 | Escenarios de pago/reserva del flujo Click & Collect y verificación en sandbox de pasarela | `SoftwareRequirementsSpecification.md` (§3.1.3, §3.2) |
| REQ-INF-04 | US-AL-07, US-AL-10, US-ACC-26, ISW-STG-01..04, IH-03, IH-04 | Escenarios de carga/gestión de imágenes y pruebas de almacenamiento/CDN | `SoftwareRequirementsSpecification.md` (§3.1.2, §3.1.3, §3.2) |
| REQ-INF-05 | US-ACC-04, US-ACC-05, US-ACC-06, US-AP-06, ISW-ANL-01..03 | Escenarios de dashboard y medición de desfase de analytics | `SoftwareRequirementsSpecification.md` (§3.1.3, §3.2) |

---

### Apéndice C — Elementos abiertos y decisiones pendientes

Los siguientes puntos requieren decisión o información adicional antes de que el SRS alcance el estado baseline v1.0.

| ID | Elemento | Sección afectada | Responsable | Fecha límite | Estado |
|---|---|---|---|---|---|
| **OI-01** | Confirmar pasarela de pago primaria para el piloto: ¿Wompi o MercadoPago? La integración de sandbox debe iniciarse con la selección definitiva. | §3.1.3 ISW-PAY, §2.5 D-01 | Head of Product + CTO | Antes de M1 (Alpha) | Abierto |
| **OI-02** | Confirmar si el Admin Plataforma tiene vista separada en MallHub Insights (dashboard propio) o accede al mismo dashboard que el Admin CC con permisos ampliados. Afecta la arquitectura de navegación y el RBAC de Insights. | §3.2 F-APL, §3.1.1 IU-INS-10 | Product Manager | Antes de inicio de sprint de Insights | Abierto |
| **OI-03** | Definir el catálogo cerrado de categorías de tienda disponibles en el mall. Actualmente se menciona "Moda, Gastronomía, Tecnología, Servicios" como ejemplo. Se necesita la lista completa y canónica con IDs. | §3.2 US-AL-01, §3.6.1 AI-01 | Product Manager + primer Admin CC piloto | Antes de M2 (Beta) | Abierto |
| **OI-04** | Confirmar si el pago digital (pasarela en la app) se incluye en v1.0 o se difiere a v2.0. La documentación actual es ambigua: §2.3 menciona "click & collect sin pago digital en v1.0 si es necesario" pero REQ-INF-03 lo lista como Core. | §2.3 restricciones, §2.6 REQ-INF-03, US-CR-09 | Head of Product | Antes de M1 (Alpha) | **Crítico — debe resolverse antes del baseline** |
| **OI-05** | Definir el proveedor de mapas: ¿Google Maps o Mapbox? Afecta el presupuesto de infraestructura (Google Maps tiene tarificación por carga de mapa), la dependencia de proveedor y la implementación del plugin Tauri de geolocalización. | §3.1.3 ISW-MAP, §2.5 D-04 | CTO + Finance | Antes de inicio del sprint de mapas | Abierto |
| **OI-06** | Confirmar si el reporte generado por IA (US-ACC-07/US-ACC-08) debe llevar marca de agua o disclaimer visible en el PDF exportado indicando que fue asistido por IA. Actualmente el SRS solo requiere que esté indicado en la interfaz de edición. | §3.6.4 Ética, §3.4.6 Anthropic | Product Manager + Legal | Antes de M3 (Lanzamiento piloto) | Abierto |
| **OI-07** | Revisar los umbrales de rendimiento de la API de IA (§3.6.1) con datos reales de la PoC. Los valores actuales (< 12 s para AI-01, < 30 s para AI-02) son estimaciones; deben ajustarse tras la PoC de Anthropic API. | §3.6.1, §3.5.9 | AI Owner + CTO | Tras completar PoC de IA | Abierto |
| **OI-08** | Definir la política de retención de contenido de tiendas que cierran o son suspendidas: ¿cuánto tiempo se conservan sus catálogos, imágenes y datos de reservas antes de ser eliminados o archivados? | §3.4.1 Ley 1581, §3.5.10 | Legal + Product Manager | Antes de baseline v1.0 | Abierto |

---

### Apéndice D — Diagrama de contexto del sistema

El siguiente diagrama muestra las relaciones entre MallHub y los sistemas externos con los que interactúa, desde la perspectiva de los actores y los flujos de datos principales.

```
                                     ┌─────────────────────────────────────────────────────┐
                                     │                   MALLHUB PLATFORM                  │
                                     │                                                     │
   ┌──────────────┐  Navega/         │  ┌─────────────┐    REST/WSS   ┌─────────────────┐  │
   │   Invitado   │──reserva────────►│  │ MallHub App │◄─────────────►│   API Backend   │  │
   └──────────────┘                  │  │ Tauri Mobile│               │  (REST + WSS)   │  │
                                     │  └─────────────┘               └────────┬────────┘  │
   ┌──────────────┐  Navega/         │                                         │           │
   │   Cliente    │──reserva────────►│                                         │           │
   │  Registrado  │                  │  ┌─────────────┐    REST/WSS   ┌────────▼────────┐  │
   └──────────────┘                  │  │MallHub Store│◄─────────────►│  Base de Datos  │  │
                                     │  │Tauri Desktop│               │  (PostgreSQL)   │  │
   ┌──────────────┐  Gestiona/       │  └─────────────┘               └────────┬────────┘  │
   │ Admin Local  │──catálogo/──────►│                                         │           │
   └──────────────┘  reservas        │  ┌─────────────┐    REST       ┌────────▼────────┐  │
                                     │  │  MallHub    │◄─────────────►│   Analytics     │  │
   ┌──────────────┐  Consulta/       │  │  Insights   │               │   Pipeline      │  │
   │  Admin CC    │──reportes───────►│  │Tauri Desktop│               │  (BigQuery)     │  │
   └──────────────┘                  │  └─────────────┘               └─────────────────┘  │
                                     │                                                     │
   ┌──────────────┐  Administra      │                                                     │
   │    Admin     │──plataforma─────►│                                                     │
   │  Plataforma  │                  │                                                     │
   └──────────────┘                  └─────────────────────────────────────────────────────┘
                                                         │
                          ┌──────────────────────────────┼─────────────────────────────────┐
                          │                              │                                 │
                   ┌──────▼──────┐              ┌────────▼────────┐            ┌──────────▼─────────┐
                   │  Pasarela   │              │  APNs / FCM     │            │   CDN              │
                   │  de Pago    │              │  Push Notif.    │            │  (CloudFront/CDN)  │
                   │ (Wompi/MP)  │              └─────────────────┘            └────────────────────┘
                   └─────────────┘
                          │
              ┌───────────┼────────────┐
              │           │            │
       ┌──────▼──┐  ┌─────▼────┐  ┌──▼────────┐
       │ Google  │  │ Anthropic│  │  Google   │
       │  Maps / │  │   API    │  │  OAuth    │
       │  Mapbox │  │  (Claude)│  │ (2.0)     │
       └─────────┘  └──────────┘  └───────────┘

Flujos de datos principales:
──► Solicitud del cliente hacia la plataforma
◄── Respuesta / notificación de la plataforma al cliente
```

---

### Apéndice E — Convenciones de nomenclatura del SRS

#### Identificadores de requisitos

| Prefijo | Tipo de requisito | Ejemplo |
|---|---|---|
| `REQ-APP-NN` | Requisito funcional — MallHub App | REQ-APP-05 |
| `REQ-STR-NN` | Requisito funcional — MallHub Store | REQ-STR-02 |
| `REQ-INS-NN` | Requisito funcional — MallHub Insights | REQ-INS-01 |
| `REQ-ADM-NN` | Requisito funcional — Backoffice Admin Plataforma | REQ-ADM-03 |
| `REQ-INF-NN` | Requisito de infraestructura transversal | REQ-INF-01 |
| `IU-APP-NN` | Requisito de interfaz de usuario — App | IU-APP-07 |
| `IU-STR-NN` | Requisito de interfaz de usuario — Store | IU-STR-05 |
| `IU-INS-NN` | Requisito de interfaz de usuario — Insights | IU-INS-03 |
| `IH-NN` | Requisito de interfaz de hardware | IH-02 |
| `ISW-PAY-NN` | Requisito de interfaz de software — Pagos | ISW-PAY-01 |
| `ISW-PUSH-NN` | Requisito de interfaz de software — Push | ISW-PUSH-03 |
| `ISW-MAP-NN` | Requisito de interfaz de software — Mapas | ISW-MAP-02 |
| `ISW-ANL-NN` | Requisito de interfaz de software — Analytics | ISW-ANL-01 |
| `ISW-STG-NN` | Requisito de interfaz de software — Storage | ISW-STG-02 |
| `ISW-AUTH-NN` | Requisito de interfaz de software — Autenticación | ISW-AUTH-04 |
| `IC-NN` | Requisito de interfaz de comunicación | IC-06 |
| `NFR-PERF-NN` | NFR — Rendimiento | NFR-PERF-05 |
| `NFR-SEC-NN` | NFR — Seguridad | NFR-SEC-05 |
| `NFR-REL-NN` | NFR — Confiabilidad | NFR-REL-02 |
| `NFR-AVA-NN` | NFR — Disponibilidad | NFR-AVA-04 |
| `NFR-OBS-NN` | NFR — Observabilidad | NFR-OBS-01 |
| `NFR-SCA-NN` | NFR — Escalabilidad | NFR-SCA-03 |
| `NFR-ACC-NN` | NFR — Accesibilidad | NFR-ACC-02 |
| `COMP-NN` | Requisito de cumplimiento | COMP-05 |
| `AI-NN-XXX` | Requisito de IA/ML | AI-01-PERF |
| `US-INV-NN` | Historia de usuario — Invitado | US-INV-07 |
| `US-CR-NN` | Historia de usuario — Cliente Registrado | US-CR-09 |
| `US-AL-NN` | Historia de usuario — Admin Local | US-AL-07 |
| `US-ACC-NN` | Historia de usuario — Admin CC | US-ACC-08 |
| `US-AP-NN` | Historia de usuario — Admin Plataforma | US-AP-08 |
| `CA-XXX-NN-S` | Criterio de aceptación Gherkin | CA-LOC-03-A |
| `A-NN` | Supuesto del sistema | A-04 |
| `D-NN` | Dependencia externa | D-07 |
| `OI-NN` | Elemento abierto (open issue) | OI-04 |

#### Marcadores de prioridad y fase

| Marcador | Significado |
|---|---|
| `[M] Core` | Incluido en MVP v1.0; sin este requisito el producto no puede operar |
| `[M] Importante` | Incluido en MVP v1.0; añade valor significativo |
| `[F]` | Diferido a fase posterior (v2.0 o v3.0); no aplica para el launch readiness |

---

### Apéndice F — Referencias normativas y bibliografía

| Ref. | Título | Versión / Fecha | URL / Ubicación |
|---|---|---|---|
| R1 | MallHub — Análisis de Startup y Resumen Ejecutivo | v1.0 · 2026 | Archivo interno del proyecto |
| R2 | MallHub — Business Model Canvas | v1.0 · 2026 | Archivo interno del proyecto |
| R3 | MallHub UX/UI — Documento Técnico: Arquitectura completa de producto | v1.0 · 2026 | Archivo interno del proyecto |
| R4 | MallHub — Sistema de Color: Paleta Emerald Market | v1.0 · 2026-03 | Archivo interno del proyecto (**Nota:** sección 9.2 tokens React Native obsoleta) |
| R5 | IEEE Std 830-1998 — Recommended Practice for SRS | 1998 | https://standards.ieee.org |
| R6 | ISO/IEC/IEEE 29148:2018 — Requirements Engineering | 2018 | https://www.iso.org/standard/72089.html |
| R7 | Web Content Accessibility Guidelines (WCAG) 2.1 | 2018-06-05 | https://www.w3.org/TR/WCAG21/ |
| R8 | Tauri v2 — Official Documentation | 2.0 · 2024-10 | https://v2.tauri.app/start/ |
| R9 | Ley 1581 de 2012 — Protección de Datos Personales (Colombia) | 2012 | https://www.funcionpublica.gov.co |
| R10 | Decreto 1377 de 2013 — Reglamentario Ley 1581 | 2013 | https://www.funcionpublica.gov.co |
| R11 | DIAN — Anexo Técnico Facturación Electrónica | Versión vigente | https://www.dian.gov.co |
| R12 | PCI-DSS v4.0 — Payment Card Industry Data Security Standard | v4.0 · 2022 | https://www.pcisecuritystandards.org |
| R13 | Anthropic — Usage Policy | Vigente | https://www.anthropic.com/policies/usage |
| R14 | Apple App Store Review Guidelines | Vigente | https://developer.apple.com/app-store/review/guidelines/ |
| R15 | Google Play Developer Program Policies | Vigente | https://play.google.com/about/developer-content-policy/ |
| R16 | Semantic Versioning 2.0.0 | 2.0.0 | https://semver.org |
| R17 | Keep a Changelog | v1.1.0 | https://keepachangelog.com |
| R18 | OpenTelemetry Specification | v1.x | https://opentelemetry.io/docs/specs/ |

---

*MallHub SRS v1.0 — Documento confidencial preparado por el Equipo de Producto MallHub · 2026*
*Este documento es el registro oficial de requisitos del sistema para MallHub v1.0 y constituye la línea base contractual entre producto, ingeniería y QA para el ciclo de desarrollo del MVP.*
