# Sistema de Facturación & Gestión para Freelancers (SaaS)

Este repositorio contiene una plataforma SaaS (Software as a Service) diseñada para optimizar la administración de clientes y la emisión, control y seguimiento de facturas para trabajadores independientes. El proyecto está estructurado bajo una arquitectura de **Monorepo**, manteniendo un desacoplamiento total entre el backend y el frontend para facilitar su escalabilidad y despliegue independiente.

## 🚀 Arquitectura y Stack Tecnológico

La plataforma aprovecha las últimas versiones estables del ecosistema de desarrollo web para garantizar un alto rendimiento, seguridad y mantenibilidad:

### 🖥️ Backend (API REST) — `factura-facil-backend`
* **Framework:** Laravel 12 (PHP 8.2+)
* **Autenticación:** Implementación de tokens seguros mediante **JWT (JSON Web Tokens)** a través de una base estructurada con Laravel Breeze (API).
* **Base de Datos:** Arquitectura relacional con migraciones optimizadas y seeders para la gestión de clientes, estados de facturas (`pending`, `paid`, `canceled`) y flujos relacionales.
* **Seguridad & Buenas Prácticas:** Middlwares personalizados para control de accesos, políticas de CORS configuradas y validación estricta de peticiones (Form Requests).

### 🅰️ Frontend (SPA) — `factura-facil-frontend`
* **Framework:** Angular 21 & TypeScript
* **Estilos & UI:** Tailwind CSS, utilizando un diseño adaptativo, limpio y moderno, optimizado para flujos de trabajo rápidos.
* **Gestión de Formularios:** Uso intensivo de **Formularios Reactivos** con validaciones dinámicas avanzadas (como expresiones regulares para folios internos y validadores cruzados personalizados para seguridad).
* **Optimización HTTP:** Interceptores avanzados (`authInterceptor`) encargados de inyectar automáticamente las cabeceras de autorización Bearer leyendo el estado persistido del usuario.

## ⚙️ Características Principales del Sistema

1. **Gestión de Clientes (CRUD):** Registro completo de clientes, incluyendo almacenamiento de identificaciones fiscales (RFC) esenciales para la facturación.
2. **Módulo de Facturas Dinámico:** Creación de comprobantes, asignación de folios bajo nomenclatura estricta, filtrado por estados de cobro y generación de links de pago externos.
3. **Seguridad del Perfil:** Panel adaptativo para la actualización de datos generales del freelancer e interfaces de cambio de credenciales con validación en tiempo real.
4. **Persistencia Eficiente:** Sincronización inmediata entre las respuestas de la API y el estado local de la sesión en el navegador (`localStorage` / `user_data`).

## 🛠️ Instrucciones de Configuración Local

### Requisitos Previos
* PHP >= 8.2 & Composer
* Node.js & Angular CLI >= 21
* Servidor de Base de Datos (MySQL / PostgreSQL)

### Clonar el repositorio
```bash
git clone [https://github.com/Eduardo-07max/Sistema-de-facturaci-n.git](https://github.com/Eduardo-07max/Sistema-de-facturaci-n.git)
cd Sistema-de-facturaci-n

Configuración del Backend
1 Navega a la carpeta: cd factura-facil-backend

2 Instala dependencias: composer install

3 Copia el archivo de entorno: cp .env.example .env (y configura tus credenciales de base de datos)

4 Genera la clave de la app: php artisan key:generate

5 Ejecuta las migraciones: php artisan migrate

6 Inicia el servidor: php artisan serve

Configuración del Frontend
1 Navega a la carpeta: cd ../factura-facil-frontend

2 Instala dependencias: npm install

3 Inicia el entorno de desarrollo: ng serve

4 Abre en tu navegador: http://localhost:4200

Desarrollado con enfoque en buenas prácticas de ingeniería de software, separación de responsabilidades y diseño de sistemas modulares.

