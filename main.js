// ============================================
// UTILIDADES GENERALES
// ============================================

/**
 * Lee un archivo de texto desde un input file
 * @param {string} idArchivo - ID del input file
 * @param {function} callback - Función que recibe el contenido
 */
function leerArchivo(idArchivo, callback) {
    const archivoInput = document.getElementById(idArchivo);
    const archivo = archivoInput.files[0];

    if (archivo) {
        const lector = new FileReader();
        lector.onload = (e) => callback(e.target.result);
        lector.onerror = () => {
            mostrarAlerta('alerta-aes', 'Error al leer el archivo.', 'error');
        };
        lector.readAsText(archivo);
    }
}

/**
 * Muestra una alerta temporal
 * @param {string} idContenedor - ID del contenedor de alertas
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - 'exito' o 'error'
 */
function mostrarAlerta(idContenedor, mensaje, tipo) {
    const contenedor = document.getElementById(idContenedor);
    const claseAlerta = tipo === 'error' ? 'alerta-error' : 'alerta-exito';
    contenedor.innerHTML = `<div class="alerta ${claseAlerta}">${mensaje}</div>`;

    setTimeout(() => {
        contenedor.innerHTML = '';
    }, 5000);
}

// ============================================
// LÓGICA DE CIFRADO/DESCIFRADO
// ============================================

/**
 * Carga los datos (desde textarea o archivo) y ejecuta la acción
 * @param {string} accion - 'encriptar' o 'desencriptar'
 */
function cargarDatos(accion) {
    const texto = document.getElementById('texto-aes').value.trim();
    const clave = document.getElementById('clave-aes').value;
    const archivo = document.getElementById('archivo-aes');

    // Validar que existe una clave
    if (!clave) {
        mostrarAlerta('alerta-aes', 'Por favor ingresa una contraseña.', 'error');
        return;
    }

    // Prioridad: archivo > textarea
    if (archivo.files.length > 0) {
        leerArchivo('archivo-aes', (contenido) => {
            ejecutarCifrado(accion, contenido.trim(), clave);
        });
    } else if (texto) {
        ejecutarCifrado(accion, texto, clave);
    } else {
        mostrarAlerta('alerta-aes', 'Ingresa un texto o carga un archivo.', 'error');
    }
}

/**
 * Ejecuta el cifrado o descifrado AES-256
 * @param {string} accion - 'encriptar' o 'desencriptar'
 * @param {string} contenido - Texto a procesar
 * @param {string} clave - Contraseña
 */
function ejecutarCifrado(accion, contenido, clave) {
    try {
        let resultado;

        if (accion === 'encriptar') {
            // ENCRIPTAR
            resultado = CryptoJS.AES.encrypt(contenido, clave).toString();
            mostrarAlerta('alerta-aes', 'Texto encriptado correctamente con AES-256.', 'exito');

        } else if (accion === 'desencriptar') {
            // DESENCRIPTAR
            const bytes = CryptoJS.AES.decrypt(contenido, clave);
            // convierte los bytes en texto legible con decodificador 8-bit Unicode Transformation Format
            // bytes = 75616e -> hexadecimal a lenguaje natural -> 75 u , 61 a, 6e n
            resultado = bytes.toString(CryptoJS.enc.Utf8);

            // Validar que se pudo descifrar
            if (!resultado) {
                mostrarAlerta('alerta-aes', 'Error: Clave incorrecta o texto cifrado inválido.', 'error');
                return;
            }

            mostrarAlerta('alerta-aes', 'Texto desencriptado correctamente con AES-256.', 'exito');
        }

        // Mostrar resultado
        document.getElementById('resultado-aes').textContent = resultado;

    } catch (error) {
        console.error('Error en cifrado:', error);
        mostrarAlerta('alerta-aes', 'Ocurrió un error durante el proceso. Verifica el formato del texto.', 'error');
    }
}

/**
 * Descarga el contenido del resultado como archivo .txt
 */
function descargarResultado() {
    const resultado = document.getElementById('resultado-aes').textContent.trim();

    if (!resultado) {
        mostrarAlerta('alerta-aes', 'No hay nada que descargar.', 'error');
        return;
    }

    try {
        // Crear blob con el contenido
        const blob = new Blob([resultado], { type: 'text/plain;charset=utf-8' });
        const enlace = document.createElement('a');
        enlace.href = URL.createObjectURL(blob);

        // Generar nombre de archivo con timestamp
        const fecha = new Date();
        const timestamp = fecha.toISOString()
            .replace(/[-:.TZ]/g, '')
            .slice(0, 14); // YYYYMMDDHHmmss

        enlace.download = `resultado_AES_${timestamp}.txt`;

        // Simular click para descargar
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);

        // Liberar memoria
        URL.revokeObjectURL(enlace.href);

        mostrarAlerta('alerta-aes', `Archivo descargado: resultado_AES_${timestamp}.txt`, 'exito');

    } catch (error) {
        console.error('Error al descargar:', error);
        mostrarAlerta('alerta-aes', 'Error al descargar el archivo.', 'error');
    }
}

/**
 * Limpia todos los campos del formulario
 */
function limpiarAES() {
    document.getElementById('texto-aes').value = '';
    document.getElementById('clave-aes').value = '';
    document.getElementById('resultado-aes').textContent = '';
    document.getElementById('archivo-aes').value = '';
    document.getElementById('alerta-aes').innerHTML = '';

    mostrarAlerta('alerta-aes', 'Campos limpiados correctamente.', 'exito');
}

// ============================================
// EVENT LISTENERS
// ============================================

// Botón Encriptar
document.getElementById('btn-encriptar').addEventListener('click', () => {
    cargarDatos('encriptar');
});

// Botón Desencriptar
document.getElementById('btn-desencriptar').addEventListener('click', () => {
    cargarDatos('desencriptar');
});

// Botón Limpiar
document.getElementById('btn-limpiar').addEventListener('click', limpiarAES);

// Botón Descargar
document.getElementById('btn-descargar').addEventListener('click', descargarResultado);

// Notificación al cargar archivo
document.getElementById('archivo-aes').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        const nombreArchivo = e.target.files[0].name;
        mostrarAlerta('alerta-aes', `Archivo cargado: ${nombreArchivo}`, 'exito');
    }
});

// Limpiar alerta al escribir en textarea
document.getElementById('texto-aes').addEventListener('input', () => {
    document.getElementById('alerta-aes').innerHTML = '';
});

// Limpiar alerta al escribir clave
document.getElementById('clave-aes').addEventListener('input', () => {
    document.getElementById('alerta-aes').innerHTML = '';
});
