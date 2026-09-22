"use strict";

const CLAVE = "equiposEmpresa";
const CODIGO_RE = /^[A-Z]{2,4}-\d{3}$/;
const TEXTO_RE = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ][A-Za-zÁÉÍÓÚÜáéíóúüÑñ0-9 .,'()/-]*$/;

document.addEventListener("DOMContentLoaded", () => {
  const elementos = {
    codigo: document.getElementById("codigo"),
    tipo: document.getElementById("tipo"),
    marca: document.getElementById("marca"),
    modelo: document.getElementById("modelo"),
    codigoAsignar: document.getElementById("codigoAsignar"),
    trabajador: document.getElementById("trabajador"),
    codigoDevolver: document.getElementById("codigoDevolver"),
    buscar: document.getElementById("buscar"),
    filtro: document.getElementById("filtro"),
    tabla: document.getElementById("tabla"),
    mensaje: document.getElementById("mensaje"),
    titulo: document.getElementById("tituloSeccion"),
    total: document.getElementById("totalEquipos"),
    disponibles: document.getElementById("totalDisponibles"),
    asignados: document.getElementById("totalAsignados"),
  };

  const titulos = {
    dashboard: "Dashboard",
    registrar: "Registrar equipo",
    asignar: "Asignar equipo",
    devolver: "Devolver equipo",
    inventario: "Inventario",
  };
  let temporizadorMensaje;

  function obtenerEquipos() {
    try {
      const datos = JSON.parse(localStorage.getItem(CLAVE) || "[]");
      return Array.isArray(datos) ? datos : [];
    } catch {
      return [];
    }
  }

  function guardarEquipos(equipos) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(equipos));
      return true;
    } catch {
      mostrarMensaje("No se pudo guardar la información en este navegador.", "error");
      return false;
    }
  }

  function mostrarMensaje(texto, tipo = "exito") {
    clearTimeout(temporizadorMensaje);
    elementos.mensaje.textContent = texto;
    elementos.mensaje.className = `visible ${tipo}`;
    elementos.mensaje.style.color = tipo === "error" ? "#fecaca" : "#bbf7d0";
    elementos.mensaje.style.background = tipo === "error" ? "#451a1a" : "#064e3b";
    elementos.mensaje.style.borderLeftColor = tipo === "error" ? "#ef4444" : "#10b981";

    temporizadorMensaje = window.setTimeout(() => {
      elementos.mensaje.className = "";
    }, 3500);
  }

  function normalizarCodigo(valor) {
    return valor.trim().toUpperCase();
  }

  function esTextoValido(valor) {
    return TEXTO_RE.test(valor.trim());
  }

  function mostrarSeccion(idSeccion) {
    const seccion = document.getElementById(`seccion-${idSeccion}`);
    if (!seccion || !titulos[idSeccion]) return;

    document.querySelectorAll(".seccion").forEach((item) => {
      const activa = item === seccion;
      item.hidden = !activa;
      item.classList.toggle("activa", activa);
    });
    elementos.titulo.textContent = titulos[idSeccion];

    document.querySelectorAll(".menu button").forEach((boton) => {
      const activo = boton.dataset.seccion === idSeccion;
      boton.classList.toggle("active", activo);
      boton.toggleAttribute("aria-current", activo);
    });

    if (idSeccion === "inventario") mostrarEquipos();
  }

  function crearCelda(texto) {
    const celda = document.createElement("td");
    celda.textContent = texto || "—";
    return celda;
  }

  function mostrarEquipos() {
    const equipos = obtenerEquipos();
    const filtro = elementos.filtro.value;
    const busqueda = elementos.buscar.value.trim().toLocaleLowerCase("es");

    elementos.total.textContent = equipos.length;
    elementos.disponibles.textContent = equipos.filter((equipo) => equipo.estado === "disponible").length;
    elementos.asignados.textContent = equipos.filter((equipo) => equipo.estado === "asignado").length;
    elementos.tabla.replaceChildren();

    const filtrados = equipos.filter((equipo) => {
      if (filtro !== "todos" && equipo.estado !== filtro) return false;
      const contenido = [equipo.codigo, equipo.tipo, equipo.marca, equipo.modelo, equipo.trabajador]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es");
      return !busqueda || contenido.includes(busqueda);
    });

    if (filtrados.length === 0) {
      const fila = document.createElement("tr");
      fila.className = "vacio";
      const celda = document.createElement("td");
      celda.colSpan = 7;
      celda.textContent = "Sin equipos para mostrar";
      fila.append(celda);
      elementos.tabla.append(fila);
      return;
    }

    filtrados.forEach((equipo) => {
      const fila = document.createElement("tr");
      const codigo = crearCelda(equipo.codigo);
      const codigoFuerte = document.createElement("strong");
      codigoFuerte.textContent = equipo.codigo;
      codigo.replaceChildren(codigoFuerte);

      const estado = document.createElement("td");
      const etiqueta = document.createElement("span");
      etiqueta.className = `estado ${equipo.estado === "asignado" ? "asignado" : "disponible"}`;
      etiqueta.textContent = equipo.estado === "asignado" ? "Asignado" : "Disponible";
      estado.append(etiqueta);

      const acciones = document.createElement("td");
      const eliminar = document.createElement("button");
      eliminar.type = "button";
      eliminar.className = "btn-eliminar";
      eliminar.setAttribute("aria-label", `Eliminar ${equipo.codigo}`);
      eliminar.innerHTML = '<i class="fa-solid fa-trash" aria-hidden="true"></i>';
      eliminar.addEventListener("click", () => eliminarEquipo(equipo.codigo));
      acciones.append(eliminar);

      fila.append(codigo, crearCelda(equipo.tipo), crearCelda(equipo.marca), crearCelda(equipo.modelo), estado, crearCelda(equipo.trabajador), acciones);
      elementos.tabla.append(fila);
    });
  }

  function eliminarEquipo(codigo) {
    if (!window.confirm(`¿Eliminar el equipo ${codigo}?`)) return;
    const equipos = obtenerEquipos().filter((equipo) => equipo.codigo !== codigo);
    if (guardarEquipos(equipos)) {
      mostrarMensaje("Equipo eliminado.", "exito");
      mostrarEquipos();
    }
  }

  document.querySelectorAll(".menu button").forEach((boton) => {
    boton.addEventListener("click", () => mostrarSeccion(boton.dataset.seccion));
  });

  document.getElementById("formRegistrar").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const codigo = normalizarCodigo(elementos.codigo.value);
    const tipo = elementos.tipo.value.trim();
    const marca = elementos.marca.value.trim();
    const modelo = elementos.modelo.value.trim();

    if (!CODIGO_RE.test(codigo)) return mostrarMensaje("Código inválido. Usa un formato como LAP-001.", "error");
    if (![tipo, marca, modelo].every(esTextoValido)) return mostrarMensaje("Tipo, marca y modelo contienen caracteres no permitidos.", "error");

    const equipos = obtenerEquipos();
    if (equipos.some((equipo) => equipo.codigo === codigo)) return mostrarMensaje("Ya existe un equipo con ese código.", "error");

    equipos.push({ codigo, tipo, marca, modelo, estado: "disponible", trabajador: "" });
    if (guardarEquipos(equipos)) {
      evento.currentTarget.reset();
      mostrarMensaje("Equipo registrado correctamente.", "exito");
      mostrarSeccion("inventario");
    }
  });

  document.getElementById("formAsignar").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const codigo = normalizarCodigo(elementos.codigoAsignar.value);
    const trabajador = elementos.trabajador.value.trim();

    if (!CODIGO_RE.test(codigo)) return mostrarMensaje("Código inválido. Usa un formato como LAP-001.", "error");
    if (!esTextoValido(trabajador)) return mostrarMensaje("El nombre del trabajador contiene caracteres no permitidos.", "error");

    const equipos = obtenerEquipos();
    const equipo = equipos.find((item) => item.codigo === codigo);
    if (!equipo) return mostrarMensaje("No existe un equipo con ese código.", "error");
    if (equipo.estado === "asignado") return mostrarMensaje(`El equipo ya está asignado a ${equipo.trabajador}.`, "error");

    equipo.estado = "asignado";
    equipo.trabajador = trabajador;
    if (guardarEquipos(equipos)) {
      evento.currentTarget.reset();
      mostrarMensaje(`Equipo asignado a ${trabajador}.`, "exito");
      mostrarSeccion("inventario");
    }
  });

  document.getElementById("formDevolver").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const codigo = normalizarCodigo(elementos.codigoDevolver.value);
    if (!CODIGO_RE.test(codigo)) return mostrarMensaje("Código inválido. Usa un formato como LAP-001.", "error");

    const equipos = obtenerEquipos();
    const equipo = equipos.find((item) => item.codigo === codigo);
    if (!equipo) return mostrarMensaje("Equipo no encontrado.", "error");
    if (equipo.estado !== "asignado") return mostrarMensaje("Ese equipo no está asignado.", "error");

    equipo.estado = "disponible";
    equipo.trabajador = "";
    if (guardarEquipos(equipos)) {
      evento.currentTarget.reset();
      mostrarMensaje("Equipo devuelto correctamente.", "exito");
      mostrarSeccion("inventario");
    }
  });

  elementos.buscar.addEventListener("input", mostrarEquipos);
  elementos.filtro.addEventListener("change", mostrarEquipos);
  mostrarEquipos();
});
