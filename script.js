// Variables globales
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let publicaciones = JSON.parse(localStorage.getItem('publicaciones')) || [];
let usuarioActual = localStorage.getItem('usuarioActual');

// Mostrar y ocultar formularios
document.getElementById('mostrar-registro').addEventListener('click', () => {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('registro-form').style.display = 'block';
});

document.getElementById('mostrar-login').addEventListener('click', () => {
    document.getElementById('registro-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
});

// Función de Registro
document.getElementById('registro-btn').addEventListener('click', function() {
    const usuario = document.getElementById('registro-usuario').value;
    const password = document.getElementById('registro-password').value;

    if (usuario.trim() && password.trim()) {
        const usuarioExistente = usuarios.find(u => u.usuario === usuario);
        if (!usuarioExistente) {
            usuarios.push({ usuario, password });
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            alert("Registro exitoso, ahora puedes iniciar sesión.");
            document.getElementById('registro-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        } else {
            alert("El usuario ya existe.");
        }
    } else {
        alert("Por favor, completa todos los campos.");
    }
});

// Función de Login
document.getElementById('login-btn').addEventListener('click', function() {
    const usuario = document.getElementById('login-usuario').value;
    const password = document.getElementById('login-password').value;

    const usuarioEncontrado = usuarios.find(u => u.usuario === usuario && u.password === password);
    if (usuarioEncontrado) {
        localStorage.setItem('usuarioActual', usuario);
        usuarioActual = usuario;
        mostrarForo();
    } else {
        alert("Usuario o contraseña incorrectos.");
    }
});

// Mostrar foro después del login
function mostrarForo() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('registro-form').style.display = 'none';
    document.getElementById('foro').style.display = 'block';
    document.getElementById('usuario-bienvenida').textContent = `Bienvenido, ${usuarioActual}`;
    cargarPublicaciones();
}

// Publicar un nuevo tema
document.getElementById('publicar-btn').addEventListener('click', function() {
    const titulo = document.getElementById('titulo').value;
    const contenido = document.getElementById('contenido').value;

    const archivos = document.getElementById('archivo').files; // Obtener archivos adjuntos

    if (titulo.trim() && contenido.trim()) {
        const nuevaPublicacion = {
            usuario: usuarioActual,
            titulo,
            contenido,
            adjuntos: [],
            fecha: new Date().toLocaleString()
        };

        if (archivos.length > 0) {
            let archivosProcesados = 0;
            for (let i = 0; i < archivos.length; i++) {
                const archivo = archivos[i];
                const reader = new FileReader();

                reader.onload = function(e) {
                    nuevaPublicacion.adjuntos.push({
                        nombre: archivo.name,
                        tipo: archivo.type,
                        contenido: e.target.result
                    });
                    archivosProcesados++;
                    if (archivosProcesados === archivos.length) {
                        guardarPublicacion(nuevaPublicacion);
                    }
                };

                reader.readAsDataURL(archivo); // Leer archivo como base64
            }
        } else {
            guardarPublicacion(nuevaPublicacion);
        }
    } else {
        alert("Por favor, rellena todos los campos.");
    }
});

// Función para guardar y agregar la publicación
function guardarPublicacion(publicacion) {
    publicaciones.push(publicacion);
    localStorage.setItem('publicaciones', JSON.stringify(publicaciones));
    agregarPublicacion(publicacion);

    // Limpiar campos
    document.getElementById('titulo').value = '';
    document.getElementById('contenido').value = '';
    document.getElementById('archivo').value = '';
    document.getElementById('adjuntos-preview').innerHTML = '';
}

// Previsualización de archivos adjuntos
document.getElementById('archivo').addEventListener('change', function() {
    const archivos = document.getElementById('archivo').files;
    const preview = document.getElementById('adjuntos-preview');
    preview.innerHTML = '';

    for (let i = 0; i < archivos.length; i++) {
        const archivo = archivos[i];
        const reader = new FileReader();

        reader.onload = function(e) {
            const div = document.createElement('div');
            if (archivo.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = e.target.result;
                div.appendChild(img);
            } else if (archivo.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = e.target.result;
                video.controls = true;
                div.appendChild(video);
            } else {
                const p = document.createElement('p');
                p.textContent = archivo.name;
                div.appendChild(p);
            }
            preview.appendChild(div);
        };

        reader.readAsDataURL(archivo);
    }
});

// Cargar publicaciones al iniciar sesión
function cargarPublicaciones() {
    document.getElementById('lista-publicaciones').innerHTML = '';
    publicaciones.forEach(publicacion => {
        agregarPublicacion(publicacion);
    });
}

// Función para agregar publicación al DOM
function agregarPublicacion(publicacion, contenedor = document.getElementById('lista-publicaciones')) {
    const publicacionDiv = document.createElement('div');
    publicacionDiv.classList.add('publicacion');

    const tituloElemento = document.createElement('h3');
    tituloElemento.textContent = `${publicacion.titulo} (por <a href="#" class="ver-perfil" data-usuario="${publicacion.usuario}">${publicacion.usuario}</a> - ${publicacion.fecha})`;

    const contenidoElemento = document.createElement('p');
    contenidoElemento.textContent = publicacion.contenido;

    publicacionDiv.appendChild(tituloElemento);
    publicacionDiv.appendChild(contenidoElemento);

    // Mostrar adjuntos si los hay
    if (publicacion.adjuntos && publicacion.adjuntos.length > 0) {
        const adjuntosDiv = document.createElement('div');
        adjuntosDiv.classList.add('adjuntos');

        publicacion.adjuntos.forEach(adjunto => {
            const adjuntoDiv = document.createElement('div');
            adjuntoDiv.classList.add('adjunto');

            if (adjunto.tipo.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = adjunto.contenido;
                adjuntoDiv.appendChild(img);
            } else if (adjunto.tipo.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = adjunto.contenido;
                video.controls = true;
                adjuntoDiv.appendChild(video);
            } else {
                const enlace = document.createElement('a');
                enlace.href = adjunto.contenido;
                enlace.download = adjunto.nombre;
                enlace.textContent = adjunto.nombre;
                adjuntoDiv.appendChild(enlace);
            }

            adjuntosDiv.appendChild(adjuntoDiv);
        });

        publicacionDiv.appendChild(adjuntosDiv);
    }

    // Añadir el elemento de publicación al contenedor
    contenedor.appendChild(publicacionDiv);
}

// Buscar publicaciones por palabra clave
document.getElementById('buscador-btn').addEventListener('click', function() {
    const query = document.getElementById('buscador-input').value.toLowerCase();
    const publicacionesFiltradas = publicaciones.filter(publicacion =>
        publicacion.titulo.toLowerCase().includes(query) ||
        publicacion.contenido.toLowerCase().includes(query)
    );

    document.getElementById('lista-publicaciones').innerHTML = '';
    publicacionesFiltradas.forEach(publicacion => {
        agregarPublicacion(publicacion);
    });
});

// Mostrar perfil de un usuario
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('ver-perfil')) {
        event.preventDefault();
        const usuario = event.target.dataset.usuario;
        mostrarPerfil(usuario);
    }
});

function mostrarPerfil(usuario) {
    document.getElementById('foro').style.display = 'none';
    document.getElementById('perfil').style.display = 'block';
    document.getElementById('usuario-nombre').textContent = `Perfil de ${usuario}`;
    
    // Filtrar y mostrar las publicaciones del usuario
    const publicacionesUsuario = publicaciones.filter(p => p.usuario === usuario);
    mostrarPublicacionesUsuario(publicacionesUsuario);
}

function mostrarPublicacionesUsuario(publicacionesUsuario) {
    const listaPublicacionesUsuario = document.getElementById('lista-publicaciones-usuario');
    listaPublicacionesUsuario.innerHTML = '';

    publicacionesUsuario.forEach(publicacion => {
        agregarPublicacion(publicacion, listaPublicacionesUsuario);
    });
}

// Volver al foro desde el perfil
document.getElementById('volver-btn').addEventListener('click', function() {
    document.getElementById('perfil').style.display = 'none';
    document.getElementById('foro').style.display = 'block';
});
