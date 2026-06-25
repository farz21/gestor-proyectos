const URL_BASE = "http://localhost:3000"; // URL base para las solicitudes a json-server
const listaProyectos = document.getElementById("lista-proyectos");

// Variable global para que los módulos de tareas y comentarios sepan qué proyecto está seleccionado
window.proyectoActivoId = null;

// ==========================================
// 1. LEER: Obtener y Renderizar Proyectos
// ==========================================
async function cargarProyectos() {
  try {
    const [resProyectos, resTareas] = await Promise.all([
      axios.get(`${URL_BASE}/proyectos`),
      axios.get(`${URL_BASE}/tareas`),
    ]);

    const proyectos = resProyectos.data; 
    const tareas = resTareas.data;

    if (proyectos.length === 0) {
      listaProyectos.innerHTML =
        '<p class="text-muted text-center mt-3">No hay proyectos creados.</p>';
      return;
    }

    let html = "";
    proyectos.forEach((proyecto) => {
      // 🌟 COMPARACIÓN SEGURA: Convertimos ambos componentes a String para evitar fallos de tipo
      const cantidadTareas = tareas.filter(
        (t) => String(t.proyectoId) === String(proyecto.id),
      ).length;

      // 🌟 CLASE ACTIVA SEGURA: Comparación basada en texto plano
      const claseActiva =
        String(proyecto.id) === String(window.proyectoActivoId) ? "tarjeta-activa" : "";

      const partes = proyecto.fechaLimite.split("-");
      const fechaFormateada = `${partes[2]}-${partes[1]}-${partes[0]}`;

      html += `
                <div class="card mb-2 tarjeta-interactiva ${claseActiva}" onclick="seleccionarProyecto('${proyecto.id}')">
                    <div class="card-body py-2">
                        <h5 class="card-title fs-6 mb-1 text-primary">${proyecto.nombre}</h5>
                        <p class="card-text small text-muted mb-1">${proyecto.descripcion}</p>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <span class="badge bg-light text-dark border">📅 ${fechaFormateada}</span>
                            <span class="badge bg-primary">📋 Tareas: ${cantidadTareas}</span>
                        </div>
                        <div class="d-flex gap-2 mt-2">
                            <button type="button" class="btn btn-sm btn-outline-secondary py-0" onclick="event.stopPropagation(); editarProyecto('${proyecto.id}', '${proyecto.nombre}', '${proyecto.descripcion}', '${proyecto.fechaLimite}')"><i class="bi bi-pencil-square"></i> Editar</button>
                            <button type="button" class="btn btn-sm btn-outline-danger py-0" onclick="event.stopPropagation(); eliminarProyecto('${proyecto.id}')"><i class="bi bi-trash3"></i> Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
    });

    listaProyectos.innerHTML = html; 
  } catch (error) {
    console.error("Error al cargar proyectos:", error);
  }
}

window.cargarProyectos = cargarProyectos;

// Función auxiliar para activar un proyecto
window.seleccionarProyecto = function (id) {
  window.proyectoActivoId = id; 
  window.tareaActivaId = null; 

  // 1. Revela el botón de tareas
  document.getElementById("contenedor-boton-tarea").classList.remove("d-none");
  
  // 🌟 2. REVELA EL FILTRO (ESTA ES LA LÍNEA QUE FALTA)
  document.getElementById("contenedor-filtro-tarea").classList.remove("d-none");
  
  // 3. Oculta el contenedor del botón de comentarios
  document.getElementById("contenedor-boton-comentario").classList.add("d-none");

  // 4. Limpiamos la columna de comentarios
  document.getElementById("lista-comentarios").innerHTML =
    '<p class="text-muted text-center mt-4">Seleccioná una tarea para ver el progreso.</p>';

  window.cargarProyectos(); 

  if (typeof window.obtenerYRenderizarTareas === "function") {
    window.obtenerYRenderizarTareas(window.proyectoActivoId);
  }
};

// ==========================================
// 2. CREAR: Agregar Nuevo Proyecto
// ==========================================
window.crearProyecto = async function (event) {
  if (event) event.preventDefault(); 

  const inputNombre = document.getElementById("modal-proyecto-nombre");
  const inputDesc = document.getElementById("modal-proyecto-desc");
  const inputFecha = document.getElementById("modal-proyecto-fecha");

  if (!inputNombre.value.trim() || !inputDesc.value.trim() || !inputFecha.value) {
    alert("Por favor, completá todos los campos del proyecto.");
    return;
  }

  const datosProyecto = {
    nombre: inputNombre.value,
    descripcion: inputDesc.value,
    fechaLimite: inputFecha.value,
  };

  try {
    await axios.post(`${URL_BASE}/proyectos`, datosProyecto);

    inputNombre.value = "";
    inputDesc.value = "";
    inputFecha.value = "";

    const modalElemento = document.getElementById("modalCrearProyecto");
    const modalInstancia = bootstrap.Modal.getInstance(modalElemento) || new bootstrap.Modal(modalElemento);
    modalInstancia.hide();

    cargarProyectos();
  } catch (error) {
    console.error("Error al crear proyecto:", error);
  }
};

// ==========================================
// 3. ACTUALIZAR: Reemplazar o Modificar Datos
// ==========================================
window.editarProyecto = function (id, nombreAct, descAct, fechaAct) {
  document.getElementById("modal-editar-id").value = id;
  document.getElementById("modal-editar-nombre").value = nombreAct;
  document.getElementById("modal-editar-desc").value = descAct;
  document.getElementById("modal-editar-fecha").value = fechaAct;

  const modalElemento = document.getElementById("modalEditarProyecto");
  const modalInstancia = new bootstrap.Modal(modalElemento);
  modalInstancia.show();
};

window.guardarEdicionProyecto = async function (event) {
  if (event) event.preventDefault(); 

  const id = document.getElementById("modal-editar-id").value;
  const nuevoNombre = document.getElementById("modal-editar-nombre").value;
  const nuevaDesc = document.getElementById("modal-editar-desc").value;
  const nuevaFecha = document.getElementById("modal-editar-fecha").value;

  if (!nuevoNombre.trim() || !nuevaDesc.trim() || !nuevaFecha) {
    alert("Por favor, no dejes campos vacíos.");
    return;
  }

  try {
    await axios.patch(`${URL_BASE}/proyectos/${id}`, {
      nombre: nuevoNombre,
      descripcion: nuevaDesc,
      fechaLimite: nuevaFecha,
    });

    const modalElemento = document.getElementById("modalEditarProyecto");
    const modalInstancia = bootstrap.Modal.getInstance(modalElemento);
    modalInstancia.hide();

    cargarProyectos();
  } catch (error) {
    console.error("Error al editar proyecto:", error);
  }
};

// ==========================================
// 4. ELIMINAR: Borrado en Cascada Doble
// ==========================================
window.eliminarProyecto = async function (id) {
  if (!confirm("⚠️ ¿Estás seguro? Esto eliminará el proyecto, todas sus tareas y sus respectivos comentarios.")) return;

  try {
    const resTareas = await axios.get(`${URL_BASE}/tareas?proyectoId=${id}`);
    const tareasAsociadas = resTareas.data;

    for (const tarea of tareasAsociadas) {
      const resComentarios = await axios.get(`${URL_BASE}/comentarios?tareaId=${tarea.id}`);
      for (const comentario of resComentarios.data) {
        await axios.delete(`${URL_BASE}/comentarios/${comentario.id}`);
      }
      await axios.delete(`${URL_BASE}/tareas/${tarea.id}`);
    }

    await axios.delete(`${URL_BASE}/proyectos/${id}`);

    if (String(window.proyectoActivoId) === String(id)) {
      window.proyectoActivoId = null;
      document.getElementById("lista-tareas").innerHTML =
        '<p class="text-muted text-center mt-4">Seleccioná un proyecto para ver sus tareas.</p>';
      document.getElementById("lista-comentarios").innerHTML =
        '<p class="text-muted text-center mt-4">Seleccioná una tarea para ver el progreso.</p>';
    }

    cargarProyectos(); 
  } catch (error) {
    console.error("Error en la eliminación en cascada:", error);
  }
};

// --- INICIALIZACIÓN ---
cargarProyectos();