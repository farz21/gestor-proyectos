const listaTareas = document.getElementById("lista-tareas");

// ==========================================
// 1. LEER: Obtener y Renderizar Tareas
// ==========================================
window.obtenerYRenderizarTareas = async function (proyectoId) {
  try {
    const response = await axios.get(
      `${URL_BASE}/tareas?proyectoId=${proyectoId}`
    );

    const tareas = response.data;

    if (tareas.length === 0) {
      listaTareas.innerHTML =
        '<p class="text-muted text-center mt-4">Este proyecto no tiene tareas.</p>';
      return;
    }

    let html = "";

    tareas.forEach((tarea) => {
      let badgeEstado = "";

      if (tarea.estado === "Pendiente") {
        badgeEstado = "bg-danger";
      } else if (tarea.estado === "En progreso") {
        badgeEstado = "bg-warning text-dark";
      } else {
        badgeEstado = "bg-success";
      }

      html += `
        <div class="card mb-2">
          <div class="card-body">
            
            <h5 class="card-title">${tarea.nombre}</h5>

            <p class="card-text mb-2">
              👤 Responsable: ${tarea.responsable}
            </p>

            <span class="badge ${badgeEstado}">
              ${tarea.estado}
            </span>

            <div class="d-flex gap-2 mt-3">

              <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
                onclick="editarTarea('${tarea.id}')">
                Editar
              </button>

              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                onclick="eliminarTarea('${tarea.id}')">
                Eliminar
              </button>

            </div>

          </div>
        </div>
      `;
    });

    listaTareas.innerHTML = html;
  } catch (error) {
    console.error("Error al cargar tareas:", error);
  }
};

// ==========================================
// 2. CREAR: Agregar Nueva Tarea
// ==========================================
window.crearTarea = async function () {
  const inputNombre = document.getElementById("modal-tarea-nombre");
  const inputResponsable = document.getElementById("modal-tarea-resp");

  if (!inputNombre.value.trim() || !inputResponsable.value.trim()) {
    alert("Por favor completá todos los campos.");
    return;
  }

  if (!window.proyectoActivoId) {
    alert("Primero seleccioná un proyecto.");
    return;
  }

  const datosTarea = {
    nombre: inputNombre.value,
    responsable: inputResponsable.value,
    estado: "Pendiente",
    proyectoId: window.proyectoActivoId,
  };

  try {
    await axios.post(`${URL_BASE}/tareas`, datosTarea);

    inputNombre.value = "";
    inputResponsable.value = "";

    const modalElemento = document.getElementById("modalCrearTarea");

    const modalInstancia =
      bootstrap.Modal.getInstance(modalElemento) ||
      new bootstrap.Modal(modalElemento);

    modalInstancia.hide();

    obtenerYRenderizarTareas(window.proyectoActivoId);
  } catch (error) {
    console.error("Error al crear tarea:", error);
  }
};

// ==========================================
// 3. ACTUALIZAR: Abrir Modal de Edición
// ==========================================
window.editarTarea = async function (id) {
  try {
    const response = await axios.get(`${URL_BASE}/tareas/${id}`);

    const tarea = response.data;

    document.getElementById("modal-editar-tarea-id").value = tarea.id;

    document.getElementById("modal-editar-tarea-nombre").value =
      tarea.nombre;

    document.getElementById("modal-editar-tarea-resp").value =
      tarea.responsable;

    document.getElementById("modal-editar-tarea-estado").value =
      tarea.estado;

    const modalElemento =
      document.getElementById("modalEditarTarea");

    const modalInstancia =
      new bootstrap.Modal(modalElemento);

    modalInstancia.show();
  } catch (error) {
    console.error("Error al cargar tarea:", error);
  }
};

// ==========================================
// 4. ACTUALIZAR: Guardar Cambios
// ==========================================
window.guardarEdicionTarea = async function () {
  const id =
    document.getElementById("modal-editar-tarea-id").value;

  const nombre =
    document.getElementById("modal-editar-tarea-nombre").value;

  const responsable =
    document.getElementById("modal-editar-tarea-resp").value;

  const estado =
    document.getElementById("modal-editar-tarea-estado").value;

  if (!nombre.trim() || !responsable.trim()) {
    alert("Por favor completá todos los campos.");
    return;
  }

  try {
    await axios.patch(`${URL_BASE}/tareas/${id}`, {
      nombre,
      responsable,
      estado,
    });

    const modalElemento =
      document.getElementById("modalEditarTarea");

    const modalInstancia =
      bootstrap.Modal.getInstance(modalElemento);

    modalInstancia.hide();

    obtenerYRenderizarTareas(window.proyectoActivoId);
  } catch (error) {
    console.error("Error al editar tarea:", error);
  }
};

// ==========================================
// 5. ELIMINAR: Borrado en Cascada
// ==========================================
window.eliminarTarea = async function (id) {
  if (
    !confirm(
      "⚠️ ¿Estás seguro? Se eliminará la tarea y todos sus comentarios."
    )
  ) {
    return;
  }

  try {
    const response = await axios.get(
      `${URL_BASE}/comentarios?tareaId=${id}`
    );

    const comentarios = response.data;

    for (const comentario of comentarios) {
      await axios.delete(
        `${URL_BASE}/comentarios/${comentario.id}`
      );
    }

    await axios.delete(`${URL_BASE}/tareas/${id}`);

    obtenerYRenderizarTareas(window.proyectoActivoId);
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
  }
};