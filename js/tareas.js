const URL_BASE = "http://localhost:3000";

const listaTareas = document.getElementById("lista-tareas");

// ==========================================
// 1. LEER: Obtener y Renderizar Tareas
// ==========================================
window.obtenerYRenderizarTareas = async function (proyectoId) {
  try {
    const response = await axios.get(
      `${URL_BASE}/tareas?proyectoId=${proyectoId}`,
    );

    const tareas = response.data;

    if (tareas.length === 0) {
      listaTareas.innerHTML =
        '<p class="text-muted text-center mt-4">Este proyecto no tiene tareas.</p>';
      return;
    }

    let html = "";

    // Usamos un bucle para renderizar la lista de tareas
    tareas.forEach((tarea) => {
      let badgeEstado = "";

      // Aplicamos estilos visuales según el estado
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

            <p class="card-text mb-1">
              👤 Responsable: ${tarea.responsable}
            </p>

            <span class="badge ${badgeEstado}">
              ${tarea.estado}
            </span>

            <div class="d-flex gap-2 mt-3">

              <button
                class="btn btn-sm btn-outline-secondary"
                onclick="editarTarea('${tarea.id}')">
                Editar
              </button>

              <button
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

  const datosTarea = {
    nombre: inputNombre.value,
    responsable: inputResponsable.value,
    estado: "Pendiente",
    proyectoId: window.proyectoActivoId,
  };

  try {
    await axios.post(`${URL_BASE}/tareas`, datosTarea);

    // Limpiamos los inputs
    inputNombre.value = "";
    inputResponsable.value = "";

    // Cerramos el modal
    const modalElemento = document.getElementById("modalCrearTarea");

    const modalInstancia =
      bootstrap.Modal.getInstance(modalElemento) ||
      new bootstrap.Modal(modalElemento);

    modalInstancia.hide();

    // Refrescamos la lista
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

    // Guardamos el ID oculto
    document.getElementById("modal-editar-tarea-id").value = tarea.id;

    // Rellenamos los campos
    document.getElementById("modal-editar-tarea-nombre").value =
      tarea.nombre;

    document.getElementById("modal-editar-tarea-resp").value =
      tarea.responsable;

    document.getElementById("modal-editar-tarea-estado").value =
      tarea.estado;

    // Mostramos el modal
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
    // PATCH para modificar únicamente los campos necesarios
    await axios.patch(`${URL_BASE}/tareas/${id}`, {
      nombre,
      responsable,
      estado,
    });

    // Cerramos el modal
    const modalElemento =
      document.getElementById("modalEditarTarea");

    const modalInstancia =
      bootstrap.Modal.getInstance(modalElemento);

    modalInstancia.hide();

    // Refrescamos el DOM sin recargar la página
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
      "⚠️ ¿Estás seguro? Se eliminará la tarea y todos sus comentarios.",
    )
  ) {
    return;
  }

  try {
    // 1. Obtener comentarios asociados
    const response = await axios.get(
      `${URL_BASE}/comentarios?tareaId=${id}`,
    );

    const comentarios = response.data;

    // 2. Eliminar comentarios uno por uno
    for (const comentario of comentarios) {
      await axios.delete(
        `${URL_BASE}/comentarios/${comentario.id}`,
      );
    }

    // 3. Eliminar la tarea
    await axios.delete(`${URL_BASE}/tareas/${id}`);

    // 4. Actualizar pantalla inmediatamente
    obtenerYRenderizarTareas(window.proyectoActivoId);
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
  }
};