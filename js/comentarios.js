const URL_BASE = "http://localhost:3000";

const listaComentarios = document.getElementById("lista-comentarios");

// Variable global para saber qué tarea está seleccionada
window.tareaActivaId = null;

// ==========================================
// 1. LEER: Obtener y Renderizar Comentarios
// ==========================================
window.obtenerYRenderizarComentarios = async function (id) {

  // Guardamos la tarea seleccionada
  window.tareaActivaId = parseInt(id);

  // Mostramos el botón para crear comentarios
  document
    .getElementById("contenedor-boton-comentario")
    .classList.remove("d-none");

  try {

    // Traemos únicamente los comentarios de la tarea seleccionada
    const response = await axios.get(
      `${URL_BASE}/comentarios?tareaId=${id}`
    );

    const comentarios = response.data;

    // Ordenamos del más reciente al más antiguo
    comentarios.sort((a, b) => {
      return b.id - a.id;
    });

    if (comentarios.length === 0) {

      listaComentarios.innerHTML =
        '<p class="text-muted text-center mt-3">No hay comentarios.</p>';

      return;
    }

    let html = "";

    // Recorremos los comentarios y construimos el HTML
    comentarios.forEach((comentario) => {

      html += `
        <div class="card mb-2">
            <div class="card-body">

                <p class="mb-1">
                    ${comentario.texto}
                </p>

                <small class="text-muted">
                    ${comentario.fecha}
                </small>

                <div class="mt-2">

                    <button
                      class="btn btn-sm btn-outline-secondary"
                      onclick="editarComentario(
                        '${comentario.id}',
                        '${comentario.texto}'
                      )">

                      Editar

                    </button>

                    <button
                      class="btn btn-sm btn-outline-danger"
                      onclick="eliminarComentario(
                        '${comentario.id}'
                      )">

                      Eliminar

                    </button>

                </div>

            </div>
        </div>
      `;
    });

    listaComentarios.innerHTML = html;

  } catch (error) {

    console.error(
      "Error al cargar comentarios:",
      error
    );

  }
};

// ==========================================
// 2. CREAR: Agregar Comentario
// ==========================================
window.crearComentario = async function () {

  const inputTexto =
    document.getElementById(
      "modal-comentario-texto"
    );

  if (!inputTexto.value.trim()) {

    alert("Escribí un comentario.");

    return;
  }

  const datosComentario = {

    texto: inputTexto.value,

    tareaId: window.tareaActivaId,

    fecha: new Date().toLocaleDateString()

  };

  try {

    await axios.post(
      `${URL_BASE}/comentarios`,
      datosComentario
    );

    // Limpiamos el textarea
    inputTexto.value = "";

    // Cerramos el modal
    const modalElemento =
      document.getElementById(
        "modalCrearComentario"
      );

    const modalInstancia =
      bootstrap.Modal.getInstance(
        modalElemento
      );

    modalInstancia.hide();

    // Actualizamos la lista
    obtenerYRenderizarComentarios(
      window.tareaActivaId
    );

  } catch (error) {

    console.error(
      "Error al crear comentario:",
      error
    );

  }
};

// ==========================================
// 3. ABRIR MODAL DE EDICIÓN
// ==========================================
window.editarComentario = function (
  id,
  textoActual
) {

  document.getElementById(
    "modal-editar-comentario-id"
  ).value = id;

  document.getElementById(
    "modal-editar-comentario-texto"
  ).value = textoActual;

  const modalElemento =
    document.getElementById(
      "modalEditarComentario"
    );

  const modalInstancia =
    new bootstrap.Modal(
      modalElemento
    );

  modalInstancia.show();
};

// ==========================================
// 4. ACTUALIZAR: Editar Comentario
// ==========================================
window.guardarEdicionComentario = async function () {

  const id = document.getElementById(
    "modal-editar-comentario-id"
  ).value;

  const nuevoTexto = document.getElementById(
    "modal-editar-comentario-texto"
  ).value;

  if (!nuevoTexto.trim()) {

    alert(
      "El comentario no puede estar vacío."
    );

    return;
  }

  try {

    await axios.patch(
      `${URL_BASE}/comentarios/${id}`,
      {
        texto: nuevoTexto
      }
    );

    // Cerramos el modal
    const modalElemento =
      document.getElementById(
        "modalEditarComentario"
      );

    const modalInstancia =
      bootstrap.Modal.getInstance(
        modalElemento
      );

    modalInstancia.hide();

    // Actualizamos la lista
    obtenerYRenderizarComentarios(
      window.tareaActivaId
    );

  } catch (error) {

    console.error(
      "Error al editar comentario:",
      error
    );

  }
};

// ==========================================
// 5. ELIMINAR: Borrar Comentario
// ==========================================
window.eliminarComentario = async function (id) {

  if (
    !confirm(
      "¿Seguro que deseas eliminar este comentario?"
    )
  ) return;

  try {

    await axios.delete(
      `${URL_BASE}/comentarios/${id}`
    );

    // Actualizamos la lista
    obtenerYRenderizarComentarios(
      window.tareaActivaId
    );

  } catch (error) {

    console.error(
      "Error al eliminar comentario:",
      error
    );

  }
};