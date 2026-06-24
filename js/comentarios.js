// ==========================================
// MÓDULO DE COMENTARIOS
// ==========================================

const listaComentarios = document.getElementById("lista-comentarios");

// LEER: Obtener y renderizar del más reciente al más antiguo
window.obtenerYRenderizarComentarios = async function (tareaId) {
    try {
        const res = await axios.get(`${URL_BASE}/comentarios?tareaId=${tareaId}`);
        let comentarios = res.data;

        // Invertimos el array para que los más recientes salgan arriba
        comentarios = comentarios.reverse();

        if (comentarios.length === 0) {
            listaComentarios.innerHTML = '<p class="text-muted text-center mt-4">No hay comentarios de avance.</p>';
            return;
        }

        let html = "";
        comentarios.forEach((comentario) => {
            html += `
                <div class="card mb-2 bg-light border-warning border-opacity-50 shadow-sm">
                    <div class="card-body py-2">
                        <p class="card-text small mb-1 fst-italic">"${comentario.texto}"</p>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <span class="badge bg-white text-dark border">📅 ${comentario.fecha}</span>
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-sm btn-outline-secondary py-0" onclick="editarComentario('${comentario.id}', '${comentario.texto}')">Editar</button>
                                <button type="button" class="btn btn-sm btn-outline-danger py-0" onclick="eliminarComentario('${comentario.id}')">Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        listaComentarios.innerHTML = html;
    } catch (error) {
        console.error("Error al cargar comentarios:", error);
    }
};

// CREAR: Nuevo comentario con fecha formateada
window.crearComentario = async function (event) {
    if (event) event.preventDefault(); // 🛑 Evita la recarga

    const inputTexto = document.getElementById("modal-comentario-texto");

    if (!inputTexto.value.trim()) {
        alert("Escribí un comentario antes de publicar.");
        return;
    }

    // Formatear fecha a DD-MM-YYYY
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    const anio = hoy.getFullYear();
    const fechaFormateada = `${dia}-${mes}-${anio}`;

    const nuevoComentario = {
        texto: inputTexto.value,
        tareaId: window.tareaActivaId, // SOLUCIÓN: Guardamos el ID tal cual, sin usar parseInt()
        fecha: fechaFormateada
    };

    try {
        await axios.post(`${URL_BASE}/comentarios`, nuevoComentario);

        inputTexto.value = "";
        const modalElemento = document.getElementById("modalCrearComentario");
        bootstrap.Modal.getInstance(modalElemento).hide();

        window.obtenerYRenderizarComentarios(window.tareaActivaId);
    } catch (error) {
        console.error("Error al crear el comentario:", error);
    }
};

// ACTUALIZAR: Preparar edición de comentario
window.editarComentario = function (id, texto) {
    document.getElementById("modal-editar-comentario-id").value = id;
    document.getElementById("modal-editar-comentario-texto").value = texto;

    const modalElemento = document.getElementById("modalEditarComentario");
    new bootstrap.Modal(modalElemento).show();
};

// ACTUALIZAR: Guardar edición del texto usando PATCH
window.guardarEdicionComentario = async function (event) {
    if (event) event.preventDefault(); // 🛑 Evita la recarga

    const id = document.getElementById("modal-editar-comentario-id").value;
    const nuevoTexto = document.getElementById("modal-editar-comentario-texto").value;

    if (!nuevoTexto.trim()) {
        alert("El comentario no puede estar vacío.");
        return;
    }

    try {
        await axios.patch(`${URL_BASE}/comentarios/${id}`, {
            texto: nuevoTexto
        });

        const modalElemento = document.getElementById("modalEditarComentario");
        bootstrap.Modal.getInstance(modalElemento).hide();

        window.obtenerYRenderizarComentarios(window.tareaActivaId);
    } catch (error) {
        console.error("Error al actualizar el comentario:", error);
    }
};

// ELIMINAR: Borrar un comentario específico
window.eliminarComentario = async function (id) {
    if (!confirm("¿Seguro que querés borrar este comentario?")) return;

    try {
        await axios.delete(`${URL_BASE}/comentarios/${id}`);
        window.obtenerYRenderizarComentarios(window.tareaActivaId);
    } catch (error) {
        console.error("Error al eliminar el comentario:", error);
    }
};