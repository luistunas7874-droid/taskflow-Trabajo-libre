# TaskFlow

TaskFlow es una aplicación web para organizar tareas, fechas límite y recordatorios. Está construida con Vue 3 y Vite, y guarda las tareas y preferencias en el almacenamiento local del navegador.

## Estado del proyecto

- **Repositorio público de GitHub:** pendiente de publicar y enlazar.
- **Aplicación en producción:** pendiente de desplegar y enlazar.

Al completar esos pasos, reemplaza estos estados por los enlaces reales. No hay una URL pública configurada en este momento.

## Funcionalidades

- Crear, completar, marcar como urgente y eliminar tareas.
- Asignar fechas y horas límite, y ver tareas en calendario.
- Filtrar tareas pendientes y completadas, o recorrerlas en una lista y un carrusel.
- Consultar el progreso y recibir recordatorios dentro de la aplicación.
- Cambiar el tema y el fondo de pantalla.
- Conservar tareas y preferencias en el navegador mediante `localStorage`.

## Tecnologías y conceptos de Vue

- **Reactividad y estado:** `ref`, `computed` y `watch`, encapsulados también en el composable `useTasks`.
- **Componentes:** `TaskForm`, `TaskItem`, `TaskFilters` y `TaskCalendar`.
- **Eventos y comunicación:** eventos emitidos por componentes y manejados en `App.vue`; `v-model` para el filtro.
- **Renderizado:** directivas `v-if`, `v-for`, bindings de atributos y `TransitionGroup`.

## Requisitos

- Node.js en una versión LTS compatible con Vite 8.
- npm.

## Ejecutar localmente

```bash
git clone <URL-publica-del-repositorio>
cd taskflow
npm install
npm run dev
```

Abre la URL local que indique Vite, normalmente `http://localhost:5173/`.

## Compilar para producción

```bash
npm run build
```

La compilación se genera en `dist/`. Para probarla localmente:

```bash
npm run preview
```

## Desplegar en Vercel

1. Publica el proyecto en un repositorio de GitHub y conéctalo a Vercel.
2. Selecciona **Vite** como framework. Usa `npm install` para instalar dependencias, `npm run build` para compilar y `dist` como directorio de salida.
3. Despliega el proyecto y reemplaza el estado de **Aplicación en producción** al inicio de este documento con la URL pública generada.

## Estructura del proyecto

```text
src/
├── assets/
├── components/
│   ├── TaskCalendar.vue
│   ├── TaskFilters.vue
│   ├── TaskForm.vue
│   └── TaskItem.vue
├── composables/
│   └── useTasks.js
├── App.vue
├── main.js
└── style.css
index.html
package.json
```
# ⚡ TaskFlow

TaskFlow es una aplicación web para organizar tareas, fechas límite y recordatorios. Está construida con Vue 3 y Vite, y guarda las tareas y preferencias en el almacenamiento local del navegador.

## 🚀 Enlaces del Proyecto

- 🔗 **Repositorio público en GitHub:** https://github.com/luistunas7874-droid/taskflow-Trabajo-libre
- 🌐 **Aplicación en producción:** https://taskflow-trabajo-libre.vercel.app/