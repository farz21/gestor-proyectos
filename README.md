# Gestor de Proyectos Personales y Tareas Colaborativas

Una aplicación web de gestión de proyectos (estilo Trello/Notion) desarrollada como proyecto académico para la asignatura Programacion. Permite organizar proyectos, dividirlos en tareas con estados y registrar comentarios de avance, consumiendo una API REST simulada localmente.

## Características Principales (CRUD Completo)

La aplicación funciona como una **Single Page Application (SPA)**, actualizando el DOM dinámicamente sin recargar la página. Cuenta con tres módulos interconectados:

* **Proyectos:** Creación, lectura, edición (reemplazo completo) y eliminación en cascada.
* **Tareas:** Asignación a proyectos, filtrado en tiempo real por estado (Pendiente, En progreso, Completada) y gestión de responsables.
* **Comentarios:** Registro de avances cronológicos por tarea con formateo automático de fecha.

## Tecnologías y Herramientas Utilizadas

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla ES6+).
* **Diseño UI:** Bootstrap 5 (Componentes, Modales, Utilidades) y Bootstrap Icons.
* **Peticiones HTTP:** Axios (Uso intensivo de métodos `GET`, `POST`, `PUT`, `PATCH` y `DELETE` mediante `async/await`).
* **Backend Fake:** `json-server` para simular una base de datos relacional y respuestas de servidor.
