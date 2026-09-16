/* ============================================================
   CONTROL DE EQUIPOS — Caso 10
   Persistencia con localStorage + Validaciones
   ============================================================ */

// 🔑 Clave para localStorage
const CLAVE = "equiposEmpresa";

/* ============================================================
   1. REFERENCIAS A LOS ELEMENTOS DEL HTML
   ============================================================ */
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

/* ============================================================
   2. LOCALSTORAGE
   ============================================================ */

// Lee el array de equipos. Si no existe, devuelve []
function obtenerEquipos() {
  return JSON.parse(localStorage.getItem(CLAVE)) || [];
}

// Guarda el array en localStorage (convertido a texto)
function guardarEquipos(equipos) {
  localStorage.setItem(CLAVE, JSON.stringify(equipos));
}

/* ============================================================
   3. MENSAJES EN PANTALLA
   ============================================================ */
function mostrarMensaje(texto, color) {
  // Mostramos el mensaje en el div
  mensajeDiv.innerText = texto;
  mensajeDiv.style.color = color;
  mensajeDiv.style.background = color + "22";

  // ✅ Si es un error, mostramos también un alert para que sea imposible no verlo
  if (color === "#ff7675") {
    alert(texto);
  }

  // Se borra solo a los 3 segundos
  setTimeout(function () {
    mensajeDiv.innerText = "";
    mensajeDiv.style.background = "transparent";
  }, 3000);
}

/* ============================================================
   4. VALIDACIONES
   ============================================================ */

// Solo letras y espacios (para tipo, marca, trabajador)
function esTexto(valor) {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor);
}

// Código con formato LAP-001
function esCodigo(valor) {
  return /^[A-Z]{2,4}-\d{3}$/.test(valor);
}

/* ============================================================
   5. REGISTRAR EQUIPO
   ============================================================ */
function registrarEquipo() {
  const codigo = codigoInput.value.trim().toUpperCase();
  const tipo   = tipoInput.value.trim();
  const marca  = marcaInput.value.trim();
  const modelo = modeloInput.value.trim();

  // Campos obligatorios
  if (!codigo || !tipo || !marca || !modelo) {
    mostrarMensaje("❌ Todos los campos son obligatorios", "#ff7675");
    return;
  }

  // Formato del código
  if (!esCodigo(codigo)) {
    mostrarMensaje("❌ Código inválido. Formato: LAP-001", "#ff7675");
    return;
  }

  // Tipo y marca: solo texto
  if (!esTexto(tipo)) {
    mostrarMensaje("❌ Tipo: solo texto, sin números", "#ff7675");
    return;
  }
  if (!esTexto(marca)) {
    mostrarMensaje("❌ Marca: solo texto, sin números", "#ff7675");
    return;
  }

  // Código único
  const equipos = obtenerEquipos();
  const existe = equipos.some(function (eq) { return eq.codigo === codigo; });
  if (existe) {
    mostrarMensaje("❌ Ya existe un equipo con ese código", "#ff7675");
    return;
  }

  // Guardamos el nuevo equipo
  equipos.push({
    codigo: codigo,
    tipo: tipo,
    marca: marca,
    modelo: modelo,
    estado: "disponible",
    trabajador: ""
  });

  guardarEquipos(equipos);
  mostrarMensaje("✅ Equipo registrado correctamente", "#00ff9d");

  // Limpiamos
  codigoInput.value = "";
  tipoInput.value   = "";
  marcaInput.value  = "";
  modeloInput.value = "";

  mostrarEquipos();
}

/* ============================================================
   6. ASIGNAR EQUIPO
   ============================================================ */
function asignarEquipo() {
  const codigo     = codigoAsignar.value.trim().toUpperCase();
  const trabajador = trabajadorInput.value.trim();

  if (!codigo || !trabajador) {
    mostrarMensaje("❌ Datos incompletos", "#ff7675");
    return;
  }

  if (!esTexto(trabajador)) {
    mostrarMensaje("❌ Trabajador: solo texto, sin números", "#ff7675");
    return;
  }

  const equipos = obtenerEquipos();
  const equipo = equipos.find(function (eq) { return eq.codigo === codigo; });

  if (!equipo) {
    mostrarMensaje("❌ No existe un equipo con ese código", "#ff7675");
    return;
  }

  if (equipo.estado === "asignado") {
    mostrarMensaje("❌ Ya está asignado a " + equipo.trabajador + ". Debe devolverse primero.", "#ff7675");
    return;
  }

  equipo.estado = "asignado";
  equipo.trabajador = trabajador;

  guardarEquipos(equipos);
  mostrarMensaje("✅ Asignado a " + trabajador, "#00ff9d");

  codigoAsignar.value   = "";
  trabajadorInput.value = "";

  mostrarEquipos();
}

/* ============================================================
   7. DEVOLVER EQUIPO
   ============================================================ */
function devolverEquipo() {
  const codigo = codigoDevolver.value.trim().toUpperCase();

  if (!codigo) {
    mostrarMensaje("❌ Ingresa el código del equipo", "#ff7675");
    return;
  }

  const equipos = obtenerEquipos();
  const equipo = equipos.find(function (eq) { return eq.codigo === codigo; });

  if (!equipo) {
    mostrarMensaje("❌ Equipo no encontrado", "#ff7675");
    return;
  }

  if (equipo.estado !== "asignado") {
    mostrarMensaje("❌ Ese equipo no está asignado actualmente", "#ff7675");
    return;
  }

  equipo.estado = "disponible";
  equipo.trabajador = "";

  guardarEquipos(equipos);
  mostrarMensaje("✅ Equipo devuelto correctamente", "#00ff9d");

  codigoDevolver.value = "";

  mostrarEquipos();
}

/* ============================================================
   8. ELIMINAR EQUIPO (extra)
   ============================================================ */
function eliminarEquipo(codigo) {
  if (!confirm("¿Eliminar el equipo " + codigo + "?")) return;

  let equipos = obtenerEquipos();
  equipos = equipos.filter(function (eq) { return eq.codigo !== codigo; });

  guardarEquipos(equipos);
  mostrarMensaje("🗑️ Equipo eliminado", "#ff7675");
  mostrarEquipos();
}

/* ============================================================
   9. MOSTRAR EQUIPOS EN LA TABLA + CONTADORES
   ============================================================ */
function mostrarEquipos() {
  const equipos = obtenerEquipos();
  const filtro = filtroSelect.value;
  const busqueda = buscarInput.value.toLowerCase().trim();

  // Contadores del dashboard
  document.getElementById("totalEquipos").innerText = equipos.length;
  document.getElementById("totalDisponibles").innerText =
    equipos.filter(function (e) { return e.estado === "disponible"; }).length;
  document.getElementById("totalAsignados").innerText =
    equipos.filter(function (e) { return e.estado === "asignado"; }).length;

  // Limpiamos la tabla
  tabla.innerHTML = "";

  // Filtramos
  const filtrados = equipos.filter(function (eq) {
    if (filtro !== "todos" && eq.estado !== filtro) return false;
    if (busqueda && !eq.codigo.toLowerCase().includes(busqueda)) return false;
    return true;
  });

  // Si no hay resultados
  if (filtrados.length === 0) {
    tabla.innerHTML = "<tr class='vacio'><td colspan='7'>Sin equipos para mostrar</td></tr>";
    return;
  }

  // Dibujamos cada equipo
  filtrados.forEach(function (eq) {
    const fila = document.createElement("tr");
    fila.innerHTML =
      "<td>" + eq.codigo + "</td>" +
      "<td>" + eq.tipo + "</td>" +
      "<td>" + eq.marca + "</td>" +
      "<td>" + eq.modelo + "</td>" +
      "<td class='" + eq.estado + "'>" + eq.estado + "</td>" +
      "<td>" + (eq.trabajador || "—") + "</td>" +
      "<td><button class='btn-eliminar' onclick=\"eliminarEquipo('" + eq.codigo + "')\">🗑️</button></td>";
    tabla.appendChild(fila);
  });
}

/* ============================================================
   10. INICIO
   ============================================================ */
window.onload = mostrarEquipos;