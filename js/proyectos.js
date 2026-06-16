const URL_BASE = "http://localhost:3000"; // 
const listaProyectos = document.getElementById("lista-proyectos");

// Variable global para que los módulos de tareas y comentarios sepan qué proyecto está seleccionado
window.proyectoActivoId = null;

// ==========================================
// 1. LEER: Obtener y Renderizar Proyectos
// ==========================================
async function cargarProyectos() { // [cite: 77]
    try {
        // Para mostrar la cantidad de tareas por proyecto, traemos ambos datos en paralelo [cite: 55]
        const [resProyectos, resTareas] = await Promise.all([
            axios.get(`${URL_BASE}/proyectos`), // [cite: 55]
            axios.get(`${URL_BASE}/tareas`)
        ]);

        const proyectos = resProyectos.data; // [cite: 79]
        const tareas = resTareas.data;

        if (proyectos.length === 0) {
            listaProyectos.innerHTML = '<p class="text-muted text-center mt-3">No hay proyectos creados.</p>';
            return;
        }

        let html = "";
        // Usamos un bucle para renderizar la lista de registros [cite: 80]
        proyectos.forEach(proyecto => {
            // Filtramos las tareas que pertenecen a este proyecto para contarlas [cite: 55]
            const cantidadTareas = tareas.filter(t => t.proyectoId == proyecto.id).length;

            // Verificamos si este proyecto es el que está activo actualmente para mantener la clase visual
            const claseActiva = proyecto.id === window.proyectoActivoId ? "tarjeta-activa" : "";

            html += `
                <div class="card mb-2 tarjeta-interactiva ${claseActiva}" onclick="seleccionarProyecto('${proyecto.id}')">
                    <div class="card-body py-2">
                        <h5 class="card-title fs-6 mb-1 text-primary">${proyecto.nombre}</h5>
                        <p class="card-text small text-muted mb-1">${proyecto.descripcion}</p>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <span class="badge bg-light text-dark border">📅 ${proyecto.fechaLimite}</span>
                            <span class="badge bg-primary">📋 Tareas: ${cantidadTareas}</span>
                        </div>
                        <div class="d-flex gap-2 mt-2">
                            <button type="button" class="btn btn-sm btn-outline-secondary py-0" onclick="event.stopPropagation(); editarProyecto('${proyecto.id}', '${proyecto.nombre}', '${proyecto.descripcion}', '${proyecto.fechaLimite}')">Editar</button>
                            <button type="button" class="btn btn-sm btn-outline-danger py-0" onclick="event.stopPropagation(); eliminarProyecto('${proyecto.id}')">Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
        });

        listaProyectos.innerHTML = html; // Actualiza el DOM de inmediato 
    } catch (error) {
        console.error("Error al cargar proyectos:", error);
    }
}

// Función auxiliar para activar un proyecto y comunicárselo al módulo de Tareas
window.seleccionarProyecto = function(id) {
    window.proyectoActivoId = parseInt(id);
    
    // Volvemos a renderizar los proyectos para que se pinte el borde azul de la tarjeta activa
    cargarProyectos();

    // Si tu compañero de Tareas ya creó su función para renderizar, la ejecutamos aquí
    if (typeof window.obtenerYRenderizarTareas === "function") {
        window.obtenerYRenderizarTareas(id);
    }
};

// ==========================================
// 2. CREAR: Agregar Nuevo Proyecto
// ==========================================
window.crearProyecto = async function() { // [cite: 77]
    const inputNombre = document.getElementById("modal-proyecto-nombre");
    const inputDesc = document.getElementById("modal-proyecto-desc");
    const inputFecha = document.getElementById("modal-proyecto-fecha");

    if (!inputNombre.value.trim() || !inputDesc.value.trim() || !inputFecha.value) {
        alert("Por favor, completá todos los campos del proyecto.");
        return;
    }

    const datosProyecto = { // [cite: 53]
        nombre: inputNombre.value,
        descripcion: inputDesc.value,
        fechaLimite: inputFecha.value
    };

    try {
        await axios.post(`${URL_BASE}/proyectos`, datosProyecto); // [cite: 53]
        
        // Limpiamos los campos de entrada
        inputNombre.value = "";
        inputDesc.value = "";
        inputFecha.value = "";

        // Cerramos el modal de creación
        const modalElemento = document.getElementById('modalCrearProyecto');
        const modalInstancia = bootstrap.Modal.getInstance(modalElemento) || new bootstrap.Modal(modalElemento);
        modalInstancia.hide();

        // Renderizamos de inmediato sin recargar la página 
        cargarProyectos();
    } catch (error) {
        console.error("Error al crear proyecto:", error);
    }
};

// ==========================================
// 3. ACTUALIZAR: Reemplazar o Modificar Datos (AHORA CON MODAL)
// ==========================================
// Esta función solo abre el modal y le inyecta los datos viejos
window.editarProyecto = function(id, nombreAct, descAct, fechaAct) { // [cite: 77]
    // Guardamos el ID en el input oculto
    document.getElementById("modal-editar-id").value = id;
    
    // Rellenamos los campos con la información actual
    document.getElementById("modal-editar-nombre").value = nombreAct;
    document.getElementById("modal-editar-desc").value = descAct;
    document.getElementById("modal-editar-fecha").value = fechaAct;

    // Mostramos el modal
    const modalElemento = document.getElementById('modalEditarProyecto');
    const modalInstancia = new bootstrap.Modal(modalElemento);
    modalInstancia.show();
};

// Esta función es la que llama el botón verde de "Guardar Cambios" dentro del modal
window.guardarEdicionProyecto = async function() {
    const id = document.getElementById("modal-editar-id").value;
    const nuevoNombre = document.getElementById("modal-editar-nombre").value;
    const nuevaDesc = document.getElementById("modal-editar-desc").value;
    const nuevaFecha = document.getElementById("modal-editar-fecha").value;

    if (!nuevoNombre.trim() || !nuevaDesc.trim() || !nuevaFecha) {
        alert("Por favor, no dejes campos vacíos.");
        return;
    }

    try {
        // Usamos PATCH para actualizar los campos modificados 
        await axios.patch(`${URL_BASE}/proyectos/${id}`, {
            nombre: nuevoNombre,
            descripcion: nuevaDesc,
            fechaLimite: nuevaFecha
        });
        
        // Escondemos el modal
        const modalElemento = document.getElementById('modalEditarProyecto');
        const modalInstancia = bootstrap.Modal.getInstance(modalElemento);
        modalInstancia.hide();

        cargarProyectos(); // Refresco inmediato del DOM 
    } catch (error) {
        console.error("Error al editar proyecto:", error);
    }
};

// ==========================================
// 4. ELIMINAR: Borrado en Cascada Doble
// ==========================================
window.eliminarProyecto = async function(id) { // [cite: 77]
    if (!confirm("⚠️ ¿Estás seguro? Esto eliminará el proyecto, todas sus tareas y sus respectivos comentarios.")) return;

    try {
        // 1. Conseguir todas las tareas asociadas a este proyecto [cite: 57]
        const resTareas = await axios.get(`${URL_BASE}/tareas?proyectoId=${id}`);
        const tareasAsociadas = resTareas.data;

        // 2. Iterar por cada tarea para borrar sus comentarios primero [cite: 57]
        for (const tarea of tareasAsociadas) {
            const resComentarios = await axios.get(`${URL_BASE}/comentarios?tareaId=${tarea.id}`);
            // Borramos los comentarios de esta tarea en particular
            for (const comentario of resComentarios.data) {
                await axios.delete(`${URL_BASE}/comentarios/${comentario.id}`);
            }
            // 3. Una vez limpia de comentarios, borramos la tarea [cite: 57]
            await axios.delete(`${URL_BASE}/tareas/${tarea.id}`);
        }

        // 4. Finalmente, cuando la cascada hacia abajo está limpia, eliminamos el proyecto [cite: 57]
        await axios.delete(`${URL_BASE}/proyectos/${id}`);

        // Si el proyecto eliminado era el que estaba activo en pantalla, limpiamos la selección
        if (window.proyectoActivoId === parseInt(id)) {
            window.proyectoActivoId = null;
            // Opcional: Limpiar los contenedores de tareas y comentarios de las otras columnas
            document.getElementById("lista-tareas").innerHTML = '<p class="text-muted text-center mt-4">Seleccioná un proyecto para ver sus tareas.</p>';
            document.getElementById("lista-comentarios").innerHTML = '<p class="text-muted text-center mt-4">Seleccioná una tarea para ver el progreso.</p>';
        }

        cargarProyectos(); // Actualiza el DOM de inmediato 
    } catch (error) {
        console.error("Error en la eliminación en cascada:", error);
    }
};

// --- INICIALIZACIÓN ---
// Ejecuta la lectura inicial apenas se procesa el script
cargarProyectos();