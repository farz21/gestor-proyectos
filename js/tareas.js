// ==========================================
// MÓDULO DE TAREAS
// ==========================================

window.tareaActivaId = null;
window.filtroActualEstado = "Todos"; // 🌟 Variable para tu nuevo filtro visual
const listaTareas = document.getElementById("lista-tareas");

// 🌟 Función para que funcione el select del HTML
window.filtrarTareas = function () {
    window.filtroActualEstado = document.getElementById("filtro-tareas-estado").value;
    window.obtenerYRenderizarTareas(window.proyectoActivoId);
};

// LEER: Obtener y Renderizar Tareas filtradas por proyecto
window.obtenerYRenderizarTareas = async function (proyectoId) {
  try {
    // 🌟 SOLUCIÓN: Traemos todas las tareas y filtramos seguro en JavaScript
    const res = await axios.get(`${URL_BASE}/tareas`);
    let tareas = res.data.filter(t => String(t.proyectoId) === String(proyectoId)); 

    // Aplicamos el filtro visual del select
    if (window.filtroActualEstado !== "Todos") {
        tareas = tareas.filter(t => t.estado === window.filtroActualEstado);
    }

    if (tareas.length === 0) {
      listaTareas.innerHTML =
        '<p class="text-muted text-center mt-4">No hay tareas para este proyecto.</p>';
      document.getElementById("lista-comentarios").innerHTML =
        '<p class="text-muted text-center mt-4">Seleccioná una tarea para ver el progreso.</p>';
      return;
    }

    let html = "";
    tareas.forEach((tarea) => {
      let badgeColor = "bg-secondary";
      if (tarea.estado === "Pendiente") badgeColor = "bg-warning text-dark";
      if (tarea.estado === "En progreso") badgeColor = "bg-primary";
      if (tarea.estado === "Completada") badgeColor = "bg-success";

      const claseActiva =
        String(tarea.id) === String(window.tareaActivaId)
          ? "border-primary border-2 shadow-sm"
          : "";

      html += `
                <div class="card mb-2 tarjeta-interactiva animar-entrada ${claseActiva}" onclick="seleccionarTarea('${tarea.id}')" style="cursor: pointer;">
                    <div class="card-body py-2">
                        <div class="d-flex justify-content-between align-items-start mb-1">
                            <h6 class="card-title mb-0">${tarea.nombre}</h6>
                            <span class="badge ${badgeColor}">${tarea.estado}</span>
                        </div>
                        <p class="card-text small text-muted mb-2">👤 Responsable: ${tarea.responsable}</p>
                        <div class="d-flex gap-2">
                            <button type="button" class="btn btn-sm btn-outline-secondary py-0" onclick="event.stopPropagation(); editarTarea('${tarea.id}', '${tarea.nombre}', '${tarea.responsable}', '${tarea.estado}')"><i class="bi bi-pencil-square"></i> Editar</button>
                            <button type="button" class="btn btn-sm btn-outline-danger py-0" onclick="event.stopPropagation(); eliminarTarea('${tarea.id}')"><i class="bi bi-trash3"></i> Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
    });

    listaTareas.innerHTML = html; 
  } catch (error) {
    console.error("Error al cargar las tareas:", error);
  }
};

window.seleccionarTarea = function (id) {
  window.tareaActivaId = id; 
  document
    .getElementById("contenedor-boton-comentario")
    .classList.remove("d-none");

  window.obtenerYRenderizarTareas(window.proyectoActivoId);

  if (typeof window.obtenerYRenderizarComentarios === "function") {
    window.obtenerYRenderizarComentarios(window.tareaActivaId);
  }
};

// CREAR: Añadir una nueva tarea
window.crearTarea = async function (event) {
  if (event) event.preventDefault(); 

  const inputNombre = document.getElementById("modal-tarea-nombre");
  const inputResp = document.getElementById("modal-tarea-resp");

  if (!inputNombre.value.trim() || !inputResp.value.trim()) {
    alert("Por favor, completá todos los campos.");
    return;
  }

  const nuevaTarea = {
    nombre: inputNombre.value,
    responsable: inputResp.value,
    estado: "Pendiente",
    proyectoId: window.proyectoActivoId, 
  };

  try {
    await axios.post(`${URL_BASE}/tareas`, nuevaTarea);

    inputNombre.value = "";
    inputResp.value = "";
    const modalElemento = document.getElementById("modalCrearTarea");
    bootstrap.Modal.getInstance(modalElemento).hide();

    // Reseteamos el filtro a "Todos" para que la tarea nueva siempre se vea
    document.getElementById("filtro-tareas-estado").value = "Todos";
    window.filtroActualEstado = "Todos";

    window.obtenerYRenderizarTareas(window.proyectoActivoId);
    
    if (typeof window.cargarProyectos === "function") {
      window.cargarProyectos();
    }
  } catch (error) {
    console.error("Error al crear la tarea:", error);
  }
};

// EDITAR: Preparar edición
window.editarTarea = function (id, nombre, resp, estado) {
  document.getElementById("modal-editar-tarea-id").value = id;
  document.getElementById("modal-editar-tarea-nombre").value = nombre;
  document.getElementById("modal-editar-tarea-resp").value = resp;
  document.getElementById("modal-editar-tarea-estado").value = estado;

  const modalElemento = document.getElementById("modalEditarTarea");
  new bootstrap.Modal(modalElemento).show();
};

// ACTUALIZAR: Guardar edición usando PATCH
window.guardarEdicionTarea = async function (event) {
  if (event) event.preventDefault(); 

  const id = document.getElementById("modal-editar-tarea-id").value;
  const nuevoNombre = document.getElementById("modal-editar-tarea-nombre").value;
  const nuevoResp = document.getElementById("modal-editar-tarea-resp").value;
  const nuevoEstado = document.getElementById("modal-editar-tarea-estado").value;

  if (!nuevoNombre.trim() || !nuevoResp.trim()) {
    alert("Los campos no pueden estar vacíos.");
    return;
  }

  try {
    await axios.patch(`${URL_BASE}/tareas/${id}`, {
      nombre: nuevoNombre,
      responsable: nuevoResp,
      estado: nuevoEstado,
    });

    const modalElemento = document.getElementById("modalEditarTarea");
    bootstrap.Modal.getInstance(modalElemento).hide();

    window.obtenerYRenderizarTareas(window.proyectoActivoId);
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
  }
};

// ELIMINAR: Borrado con cascada 
window.eliminarTarea = async function (id) {
  if (!confirm("⚠️ ¿Eliminar tarea? También se borrarán todos sus comentarios.")) return;

  try {
    const resComentarios = await axios.get(`${URL_BASE}/comentarios?tareaId=${id}`);
    for (const comentario of resComentarios.data) {
      await axios.delete(`${URL_BASE}/comentarios/${comentario.id}`);
    }

    await axios.delete(`${URL_BASE}/tareas/${id}`);

    if (window.tareaActivaId == id) {
      window.tareaActivaId = null;
      document.getElementById("lista-comentarios").innerHTML =
        '<p class="text-muted text-center mt-4">Seleccioná una tarea para ver el progreso.</p>';
      document
        .getElementById("contenedor-boton-comentario")
        .classList.add("d-none");
    }

    window.obtenerYRenderizarTareas(window.proyectoActivoId);
    
    if (typeof window.cargarProyectos === "function") {
      window.cargarProyectos();
    }
  } catch (error) {
    console.error("Error al eliminar la tarea:", error);
  }
};