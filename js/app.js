/* ============================================================
   CONTROL DE EQUIPOS — AssetFlow
   Lógica + Navegación Sidebar
   ============================================================ */

const CLAVE = "equiposEmpresa";

// Referencias
const codigoInput     = document.getElementById("codigo");
const tipoInput       = document.getElementById("tipo");
const marcaInput      = document.getElementById("marca");
const modeloInput     = document.getElementById("modelo");
const codigoAsignar   = document.getElementById("codigoAsignar");
const trabajadorInput = document.getElementById("trabajador");
const codigoDevolver  = document.getElementById("codigoDevolver");
const buscarInput     = document.getElementById("buscar");
const filtroSelect    = document.getElementById("filtro");
const tabla           = document.getElementById("tabla");
const mensajeDiv      = document.getElementById("mensaje");
const tituloSeccion   = document.getElementById("tituloSeccion");

/* ============================================================
   NAVEGACIÓN ENTRE SECCIONES (Sidebar)
   ============================================================ */
function mostrarSeccion(idSeccion) {
  // Ocultar todas las secciones
  document.querySelectorAll('.seccion').forEach(sec => sec.classList.remove('activa'));
  // Mostrar la seleccionada
  document.getElementById('seccion-' + idSeccion).classList.add('activa');
  
  // Actualizar título del topbar
  const titulos = {
    'dashboard': 'Dashboard',
    'registrar': 'Registrar Equipo',
    'asignar': 'Asignar Equipo',
    'devolver': 'Devolver Equipo',
    'inventario': 'Inventario'
  };
  tituloSeccion.innerText = titulos[idSeccion] || 'Dashboard';

  // Actualizar menú activo
  document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
  event.target.closest('a').classList.add('active');
  
  // Si entramos a inventario, refrescar tabla
  if (idSeccion === 'inventario') {
    mostrarEquipos();
  }
}

/* ============================================================
   LOCALSTORAGE
   ============================================================ */
function obtenerEquipos() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) || [];
  } catch (e) {
    return [];
  }
}

function guardarEquipos(equipos) {
  localStorage.setItem(CLAVE, JSON.stringify(equipos));
}

/* ============================================================
   MENSAJES
   ============================================================ */
function mostrarMensaje(texto, color) {
  mensajeDiv.innerText = texto;
  mensajeDiv.style.color = color;
  mensajeDiv.style.background = color + "22";
  mensajeDiv.style.borderLeft = "4px solid " + color;

  // Alerta para errores (opcional, quitar si molesta)
  // if (color === "#ef4444") alert(texto);

  setTimeout(() => {
    mensajeDiv.innerText = "";
    mensajeDiv.style.background = "transparent";
    mensajeDiv.style.borderLeft = "none";
  }, 3000);
}

/* ============================================================
   VALIDACIONES
   ============================================================ */
const esTexto = (valor) => /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor);
const esCodigo = (valor) => /^[A-Z]{2,4}-\d{3}$/.test(valor);

/* ============================================================
   REGISTRAR EQUIPO
   ============================================================ */
function registrarEquipo() {
  const codigo = codigoInput.value.trim().toUpperCase();
  const tipo   = tipoInput.value.trim();
  const marca  = marcaInput.value.trim();
  const modelo = modeloInput.value.trim();

  if (!codigo || !tipo || !marca || !modelo) {
    mostrarMensaje("❌ Todos los campos son obligatorios", "#ef4444");
    return;
  }

  if (!esCodigo(codigo)) {
    mostrarMensaje("❌ Código inválido. Formato: LAP-001", "#ef4444");
    return;
  }

  if (!esTexto(tipo)) { mostrarMensaje("❌ Tipo: solo texto", "#ef4444"); return; }
  if (!esTexto(marca)) { mostrarMensaje("❌ Marca: solo texto", "#ef4444"); return; }

  const equipos = obtenerEquipos();
  if (equipos.some(eq => eq.codigo === codigo)) {
    mostrarMensaje("❌ Ya existe un equipo con ese código", "#ef4444");
    return;
  }

  equipos.push({ codigo, tipo, marca, modelo, estado: "disponible", trabajador: "" });
  guardarEquipos(equipos);
  mostrarMensaje("✅ Equipo registrado correctamente", "#10b981");

  codigoInput.value = tipoInput.value = marcaInput.value = modeloInput.value = "";
  mostrarEquipos();
  mostrarSeccion('inventario'); // Redirigir al inventario tras registrar
}

/* ============================================================
   ASIGNAR EQUIPO
   ============================================================ */
function asignarEquipo() {
  const codigo     = codigoAsignar.value.trim().toUpperCase();
  const trabajador = trabajadorInput.value.trim();

  if (!codigo || !trabajador) { mostrarMensaje("❌ Datos incompletos", "#ef4444"); return; }
  if (!esTexto(trabajador)) { mostrarMensaje("❌ Trabajador: solo texto", "#ef4444"); return; }

  const equipos = obtenerEquipos();
  const equipo = equipos.find(eq => eq.codigo === codigo);

  if (!equipo) { mostrarMensaje("❌ No existe un equipo con ese código", "#ef4444"); return; }
  if (equipo.estado === "asignado") {
    mostrarMensaje(`❌ Ya está asignado a ${equipo.trabajador}`, "#ef4444");
    return;
  }

  equipo.estado = "asignado";
  equipo.trabajador = trabajador;
  guardarEquipos(equipos);
  mostrarMensaje(`✅ Asignado a ${trabajador}`, "#10b981");

  codigoAsignar.value = trabajadorInput.value = "";
  mostrarEquipos();
  mostrarSeccion('inventario');
}

/* ============================================================
   DEVOLVER EQUIPO
   ============================================================ */
function devolverEquipo() {
  const codigo = codigoDevolver.value.trim().toUpperCase();
  if (!codigo) { mostrarMensaje("❌ Ingresa el código", "#ef4444"); return; }

  const equipos = obtenerEquipos();
  const equipo = equipos.find(eq => eq.codigo === codigo);

  if (!equipo) { mostrarMensaje("❌ Equipo no encontrado", "#ef4444"); return; }
  if (equipo.estado !== "asignado") { mostrarMensaje("❌ Ese equipo no está asignado", "#ef4444"); return; }

  equipo.estado = "disponible";
  equipo.trabajador = "";
  guardarEquipos(equipos);
  mostrarMensaje("✅ Equipo devuelto correctamente", "#10b981");

  codigoDevolver.value = "";
  mostrarEquipos();
  mostrarSeccion('inventario');
}

/* ============================================================
   ELIMINAR EQUIPO
   ============================================================ */
function eliminarEquipo(codigo) {
  if (!confirm(`¿Eliminar el equipo ${codigo}?`)) return;
  let equipos = obtenerEquipos().filter(eq => eq.codigo !== codigo);
  guardarEquipos(equipos);
  mostrarMensaje("🗑️ Equipo eliminado", "#ef4444");
  mostrarEquipos();
}

/* ============================================================
   MOSTRAR EQUIPOS (Tabla + Contadores)
   ============================================================ */
function mostrarEquipos() {
  const equipos = obtenerEquipos();
  const filtro = filtroSelect.value;
  const busqueda = buscarInput.value.toLowerCase().trim();

  // Contadores Dashboard
  document.getElementById("totalEquipos").innerText = equipos.length;
  document.getElementById("totalDisponibles").innerText = equipos.filter(e => e.estado === "disponible").length;
  document.getElementById("totalAsignados").innerText = equipos.filter(e => e.estado === "asignado").length;

  tabla.innerHTML = "";

  const filtrados = equipos.filter(eq => {
    if (filtro !== "todos" && eq.estado !== filtro) return false;
    if (busqueda && !eq.codigo.toLowerCase().includes(busqueda)) return false;
    return true;
  });

  if (filtrados.length === 0) {
    tabla.innerHTML = "<tr class='vacio'><td colspan='7'>Sin equipos para mostrar</td></tr>";
    return;
  }

  filtrados.forEach(eq => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><strong>${eq.codigo}</strong></td>
      <td>${eq.tipo}</td>
      <td>${eq.marca}</td>
      <td>${eq.modelo}</td>
      <td><span class="${eq.estado}">${eq.estado}</span></td>
      <td>${eq.trabajador || "—"}</td>
      <td>
        <button class="btn-eliminar" onclick="eliminarEquipo('${eq.codigo}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tabla.appendChild(fila);
  });
}

/*