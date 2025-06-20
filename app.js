let usuarios = [
    { nombre: "Jespah Díaz", pin: "2218", tipo: "admin" },
    { nombre: "Angie Romero", pin: "1016", tipo: "user" }
];
let registros = [];
let usuarioActual = null;
let tipoRegistro = null;
let selfieDataUrl = "";
let horarios = [];

function guardarUsuarios() { localStorage.setItem('usuariosFrida', JSON.stringify(usuarios)); }
function cargarUsuarios() { let data = localStorage.getItem('usuariosFrida'); if (data) usuarios = JSON.parse(data);}
function guardarRegistros() { localStorage.setItem('registrosFrida', JSON.stringify(registros)); }
function cargarRegistros() { let data = localStorage.getItem('registrosFrida'); if (data) registros = JSON.parse(data);}
function guardarHorarios() { localStorage.setItem('horariosFrida', JSON.stringify(horarios)); }
function cargarHorarios() { let data = localStorage.getItem('horariosFrida'); if (data) horarios = JSON.parse(data);}

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();
    cargarUsuarios();
    let pin = document.getElementById("pin").value.trim();
    let user = usuarios.find(u => u.pin === pin);
    if (!user) {
        alert("PIN incorrecto.");
        return;
    }
    usuarioActual = user;
    document.getElementById("login").style.display = "none";
    if (user.tipo === "admin") {
        mostrarPanelAdmin();
    } else {
        document.getElementById("registro").style.display = "block";
        mostrarBotonesEntradaSalida();
        document.getElementById("selfieArea").style.display = "none";
        document.getElementById("btnEnviar").style.display = "none";
        document.getElementById("selfiePreview").style.display = "none";
        document.getElementById("btnSelfie").style.display = "inline-block";
        document.getElementById("mensajeRegistro").innerText = "";
    }
});

function mostrarBotonesEntradaSalida() {
    cargarRegistros();
    let ultRegistro = registros.filter(r => r.nombre === usuarioActual.nombre).slice(-1)[0];
    if (!ultRegistro || ultRegistro.tipo === "Salida") {
        document.getElementById("btnEntrada").style.display = "inline-block";
        document.getElementById("btnSalida").style.display = "none";
    } else {
        document.getElementById("btnEntrada").style.display = "none";
        document.getElementById("btnSalida").style.display = "inline-block";
    }
}

document.getElementById("btnEntrada").onclick = function() {
    tipoRegistro = "Entrada";
    mostrarSelfie();
};
document.getElementById("btnSalida").onclick = function() {
    tipoRegistro = "Salida";
    mostrarSelfie();
};

function mostrarSelfie() {
    document.getElementById("selfieArea").style.display = "block";
    document.getElementById("btnEnviar").style.display = "none";
    selfieDataUrl = "";
    document.getElementById("btnSelfie").style.display = "inline-block";
    if (tipoRegistro === "Entrada") {
        document.getElementById("btnEntrada").classList.remove("btn-inactivo");
        document.getElementById("btnSalida").classList.add("btn-inactivo");
        document.getElementById("btnEntrada").disabled = true;
        document.getElementById("btnSalida").disabled = false;
    } else {
        document.getElementById("btnSalida").classList.remove("btn-inactivo");
        document.getElementById("btnEntrada").classList.add("btn-inactivo");
        document.getElementById("btnEntrada").disabled = false;
        document.getElementById("btnSalida").disabled = true;
    }
    document.getElementById("btnEntrada").style.opacity = "1";
    document.getElementById("btnSalida").style.opacity = "1";
    document.getElementById("selfieInstructions").style.display = "block";
    document.getElementById("video").style.display = "block";
    document.getElementById("canvas").style.display = "none";
    document.getElementById("selfiePreview").style.display = "none";
    iniciarCamara();
}

function iniciarCamara() {
    let video = document.getElementById("video");
    let canvas = document.getElementById("canvas");
    canvas.style.display = "none";
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.play();
        });
}

document.getElementById("btnSelfie").onclick = function() {
    let video = document.getElementById("video");
    let canvas = document.getElementById("canvas");
    canvas.getContext('2d').drawImage(video, 0, 0, 320, 240);
    selfieDataUrl = canvas.toDataURL('image/png');
    document.getElementById("selfiePreview").src = selfieDataUrl;
    document.getElementById("selfiePreview").style.display = "block";
    document.getElementById("btnEnviar").style.display = "inline-block";
    document.getElementById("video").style.display = "none";
    document.getElementById("canvas").style.display = "none";
    document.getElementById("selfieInstructions").style.display = "none";
    document.getElementById("btnSelfie").style.display = "none";
    if (video.srcObject) {
        let tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }
};

document.getElementById("btnEnviar").onclick = function() {
    if (!selfieDataUrl) {
        alert("Debes tomar una selfie.");
        return;
    }
    let fechaHora = new Date().toLocaleString();
    registros.push({
        fechaHora,
        nombre: usuarioActual.nombre,
        tipo: tipoRegistro,
        selfie: selfieDataUrl
    });
    guardarRegistros();
    document.getElementById("mensajeRegistro").innerText = "¡Registro guardado exitosamente!";
    setTimeout(() => {
        usuarioActual = null;
        document.getElementById("mensajeRegistro").innerText = "";
        document.getElementById("registro").style.display = "none";
        document.getElementById("selfieArea").style.display = "none";
        document.getElementById("btnEnviar").style.display = "none";
        document.getElementById("selfiePreview").style.display = "none";
        document.getElementById("login").style.display = "block";
        document.getElementById("loginForm").reset();
    }, 1800);
};

function mostrarPanelAdmin() {
    document.getElementById("adminPanel").style.display = "block";
    actualizarListaUsuarios();
    actualizarTablaRegistros();
    actualizarFiltroEmpleado();
    cargarHorarios();
    mostrarHorarios();
    document.getElementById("filtroFecha").value = new Date().toISOString().substr(0,10);
    filtrarRegistros();
    document.querySelectorAll('.collapsible-content').forEach(c => c.style.display = "none");
    document.querySelectorAll('.collapsible-header').forEach(h=>h.classList.remove('expanded'));
}
document.getElementById("btnSalirAdmin").onclick = function() {
    document.getElementById("adminPanel").style.display = "none";
    usuarioActual = null;
    document.getElementById("login").style.display = "block";
    document.getElementById("loginForm").reset();
};

document.getElementById("userForm").addEventListener("submit", function(e) {
    e.preventDefault();
    let nombre = document.getElementById("nombreUsuario").value.trim();
    let pin = document.getElementById("pinUsuario").value.trim();
    let tipo = document.getElementById("tipoUsuario").value;
    if (!nombre || !pin) return;
    let idx = usuarios.findIndex(u => u.pin === pin);
    if (idx >= 0) {
        usuarios[idx] = { nombre, pin, tipo };
    } else {
        usuarios.push({ nombre, pin, tipo });
    }
    guardarUsuarios();
    actualizarListaUsuarios();
    this.reset();
});

function actualizarListaUsuarios() {
    let ul = document.getElementById("userList");
    ul.innerHTML = "";
    usuarios.forEach((u, i) => {
        let li = document.createElement("li");
        li.textContent = `${u.nombre} (${u.pin}) [${u.tipo}] `;
        let edit = document.createElement("button");
        edit.textContent = "Editar";
        edit.onclick = function() {
            document.getElementById("editIndex").value = i;
            document.getElementById("editNombre").value = u.nombre;
            document.getElementById("editPin").value = u.pin;
            document.getElementById("editTipo").value = u.tipo;
            document.getElementById("editUserForm").style.display = "block";
        };
        li.appendChild(edit);
        let del = document.createElement("button");
        del.textContent = "Eliminar";
        del.style.background = "#ec6730";
        del.onclick = function() {
            if(confirm("¿Eliminar este usuario?")) {
                usuarios.splice(i,1);
                guardarUsuarios();
                actualizarListaUsuarios();
            }
        };
        li.appendChild(del);
        ul.appendChild(li);
    });
}
document.getElementById("editUserForm").addEventListener("submit", function(e){
    e.preventDefault();
    let idx = document.getElementById("editIndex").value;
    usuarios[idx] = {
        nombre: document.getElementById("editNombre").value.trim(),
        pin: document.getElementById("editPin").value.trim(),
        tipo: document.getElementById("editTipo").value
    };
    guardarUsuarios();
    document.getElementById("editUserForm").style.display = "none";
    actualizarListaUsuarios();
});
document.getElementById("editUserForm").addEventListener("reset", function(){
    document.getElementById("editUserForm").style.display = "none";
});

document.getElementById("btnCargarHorario").onclick = function() {
    let file = document.getElementById("inputHorario").files[0];
    if (!file) return alert("Selecciona un archivo de horario (.csv)");
    let reader = new FileReader();
    reader.onload = function(e) {
        let text = e.target.result;
        horarios = [];
        let lines = text.trim().split('\n');
        for(let i=1;i<lines.length;i++){
            let [nombre, dia, entrada, salida] = lines[i].split(',');
            horarios.push({nombre: nombre.trim(), dia: dia.trim(), entrada: entrada.trim(), salida: salida.trim()});
        }
        guardarHorarios();
        mostrarHorarios();
        alert("Horarios cargados.");
    };
    reader.readAsText(file);
};
function mostrarHorarios() {
    cargarHorarios();
    let d = document.getElementById("horariosCargados");
    if (!horarios.length) {
        d.innerHTML = "<em>No hay horarios cargados.</em>";
        return;
    }
    let html = `<table style="width:100%;font-size:0.95rem;"><thead>
        <tr><th>Empleado</th><th>Día</th><th>Entrada</th><th>Salida</th></tr></thead><tbody>`;
    horarios.forEach(h=>{
        html += `<tr><td>${h.nombre}</td><td>${h.dia}</td><td>${h.entrada}</td><td>${h.salida}</td></tr>`;
    });
    html += "</tbody></table>";
    d.innerHTML = html;
}

function actualizarFiltroEmpleado() {
    cargarUsuarios();
    let select = document.getElementById("filtroEmpleado");
    select.innerHTML = `<option value="">Todos</option>`;
    usuarios.forEach(u=>{
        select.innerHTML += `<option value="${u.nombre}">${u.nombre}</option>`;
    });
}
document.getElementById("filtroFecha").addEventListener("change", filtrarRegistros);
document.getElementById("filtroEmpleado").addEventListener("change", filtrarRegistros);

function filtrarRegistros() {
    cargarRegistros();
    let fechaFiltro = document.getElementById("filtroFecha").value;
    let empleadoFiltro = document.getElementById("filtroEmpleado").value;
    let filtrados = registros.filter(r => {
        let coincideFecha = true;
        if (fechaFiltro) {
            let fechaReg = (r.fechaHora || '').split(',')[0].trim();
            let [dd, mm, yyyy] = fechaReg.split('/');
            if (yyyy && mm && dd) {
                let fechaRegISO = `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
                coincideFecha = (fechaFiltro === fechaRegISO);
            } else {
                coincideFecha = false;
            }
        }
        let coincideEmpleado = (!empleadoFiltro || r.nombre === empleadoFiltro);
        return coincideFecha && coincideEmpleado;
    });
    renderTablaRegistros(filtrados);
}

function actualizarTablaRegistros() {
    cargarRegistros();
    filtrarRegistros();
}
function renderTablaRegistros(lista) {
    let tbody = document.getElementById("tablaRegistros").querySelector("tbody");
    tbody.innerHTML = "";
    lista = [...lista].reverse();
    lista.forEach((reg) => {
        let tr = document.createElement("tr");
        tr.innerHTML = `<td>${reg.fechaHora}</td><td>${reg.nombre}</td><td>${reg.tipo}</td>
            <td><img src="${reg.selfie}" alt="Selfie" style="max-width:60px;border-radius:8px;"></td>
            <td><button class="btn-eliminar" data-fecha="${reg.fechaHora}" data-nombre="${reg.nombre}" data-tipo="${reg.tipo}">Eliminar</button></td>`;
        tbody.appendChild(tr);
    });
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.onclick = function() {
            if(confirm("¿Eliminar este registro?")) {
                let fecha = btn.getAttribute("data-fecha");
                let nombre = btn.getAttribute("data-nombre");
                let tipo = btn.getAttribute("data-tipo");
                cargarRegistros();
                let idx = registros.findIndex(r => r.fechaHora === fecha && r.nombre === nombre && r.tipo === tipo);
                if(idx > -1){
                    registros.splice(idx,1);
                    guardarRegistros();
                    filtrarRegistros();
                }
            }
        }
    });
}
document.getElementById("btnExportar").onclick = function() {
    cargarRegistros();
    let fechaFiltro = document.getElementById("filtroFecha").value;
    let empleadoFiltro = document.getElementById("filtroEmpleado").value;
    let lista = registros.filter(r=>{
        let coincideFecha = true;
        if (fechaFiltro) {
            let fechaReg = (r.fechaHora || '').split(',')[0].trim();
            let [dd, mm, yyyy] = fechaReg.split('/');
            if (yyyy && mm && dd) {
                let fechaRegISO = `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
                coincideFecha = (fechaFiltro === fechaRegISO);
            } else {
                coincideFecha = false;
            }
        }
        let coincideEmpleado = (!empleadoFiltro || r.nombre === empleadoFiltro);
        return coincideFecha && coincideEmpleado;
    });
    let csv = "Fecha y Hora,Nombre,Tipo,Selfie\n";
    lista.forEach(reg => {
        csv += `"${reg.fechaHora}","${reg.nombre}","${reg.tipo}","${reg.selfie}"\n`;
    });
    let blob = new Blob([csv], {type: "text/csv"});
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "registros_frida.csv";
    a.click();
};

// Bloques colapsables (default cerrados)
document.querySelectorAll('.collapsible-header').forEach(header => {
    header.onclick = function() {
        const content = this.nextElementSibling;
        if(content.style.display === "none" || !content.style.display) {
            content.style.display = "block";
            this.classList.add("expanded");
        } else {
            content.style.display = "none";
            this.classList.remove("expanded");
        }
    };
});
window.onload = function() {
    cargarUsuarios();
    cargarRegistros();
    cargarHorarios();
    document.querySelectorAll('.collapsible-content').forEach(c => c.style.display = "none");
    document.querySelectorAll('.collapsible-header').forEach(h=>h.classList.remove('expanded'));
};