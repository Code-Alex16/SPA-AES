    // ========== FUNCIONES PARA LEER ARCHIVOS ==========
    function leerArchivo(idArchivo, callback) {
        var archivoInput = document.getElementById(idArchivo);
        var archivo = archivoInput.files[0];

        if (archivo) {
            var lector = new FileReader();
            lector.onload = function(e) {
                callback(e.target.result);
            };
            lector.readAsText(archivo);
        }
    }

    // ========== FUNCIONES PARA MOSTRAR ALERTAS ==========
    function mostrarAlerta(idContenedor, mensaje, tipo) {
        var contenedor = document.getElementById(idContenedor);
        var claseAlerta = tipo === 'error' ? 'alerta-error' : 'alerta-exito';
        contenedor.innerHTML = '<div class="alerta ' + claseAlerta + '">' + mensaje + '</div>';

        setTimeout(function() {
            contenedor.innerHTML = '';
        }, 5000);
    }

    // ========== FUNCIONES AES ==========
    function encriptarAES() {
        var texto = document.getElementById('texto-aes').value;
        var clave = document.getElementById('clave-aes').value;
        var archivo = document.getElementById('archivo-aes');

        if (!clave) {
            mostrarAlerta('alerta-aes', 'Por favor ingresa una contraseña', 'error');
            return;
        }

        if (archivo.files.length > 0) {
            leerArchivo('archivo-aes', function(contenidoArchivo) {
                try {
                    var cifrado = CryptoJS.AES.encrypt(contenidoArchivo, clave).toString();
                    document.getElementById('resultado-aes').textContent = cifrado;
                    document.getElementById('texto-aes').value = '';
                    mostrarAlerta('alerta-aes', 'Archivo encriptado con AES-256. Puedes descargarlo y desencriptarlo después.', 'exito');
                } catch (error) {
                    mostrarAlerta('alerta-aes', 'Error al encriptar el archivo. Verifica que sea un archivo de texto válido.', 'error');
                }
            });
        } else {
            if (!texto) {
                mostrarAlerta('alerta-aes', 'Por favor ingresa un texto o carga un archivo', 'error');
                return;
            }
            try {
                var cifrado = CryptoJS.AES.encrypt(texto, clave).toString();
                document.getElementById('resultado-aes').textContent = cifrado;
                mostrarAlerta('alerta-aes', 'Texto encriptado con AES-256 correctamente', 'exito');
            } catch (error) {
                mostrarAlerta('alerta-aes', 'Error al encriptar. Intenta nuevamente.', 'error');
            }
        }
    }

    function desencriptarAES() {
        var textoAreaCifrado = document.getElementById('texto-aes').value.trim();
        var resultadoCifrado = document.getElementById('resultado-aes').textContent.trim();
        var clave = document.getElementById('clave-aes').value;
        var archivo = document.getElementById('archivo-aes');

        if (!clave) {
            mostrarAlerta('alerta-aes', 'Por favor ingresa la contraseña', 'error');
            return;
        }

        // Si hay un archivo, leerlo primero
        if (archivo.files.length > 0) {
            leerArchivo('archivo-aes', function(contenidoArchivo) {
                intentarDesencriptar(contenidoArchivo.trim(), clave);
            });
        } else {
            // Prioridad: 1) texto en textarea, 2) texto en resultado
            var textoCifrado = textoAreaCifrado || resultadoCifrado;

            if (!textoCifrado) {
                mostrarAlerta('alerta-aes', 'No hay texto cifrado. Pégalo en el campo de texto, carga un archivo o encripta primero.', 'error');
                return;
            }

            intentarDesencriptar(textoCifrado, clave);
        }
    }

    function intentarDesencriptar(textoCifrado, clave) {
        try {
            var bytes = CryptoJS.AES.decrypt(textoCifrado, clave);
            // console.log(bytes)
            var textoOriginal = bytes.toString(CryptoJS.enc.Utf8);

            if (!textoOriginal) {
                mostrarAlerta('alerta-aes', 'Error: Contraseña incorrecta o texto cifrado inválido', 'error');
                return;
            }

            document.getElementById('resultado-aes').textContent = textoOriginal;
            mostrarAlerta('alerta-aes', 'Texto desencriptado correctamente con AES-256', 'exito');
        } catch (error) {
            mostrarAlerta('alerta-aes', 'Error al desencriptar. Verifica que la contraseña sea correcta y el texto esté bien cifrado.', 'error');
        }
    }

    // ========== FUNCIÓN PARA DESCARGAR EL RESULTADO ==========
    function descargarResultado() {
        var resultado = document.getElementById('resultado-aes').textContent.trim();

        if (!resultado) {
            mostrarAlerta('alerta-aes', 'No hay nada que descargar. Primero encripta o desencripta algo.', 'error');
            return;
        }

        // Crear un blob con el contenido
        var blob = new Blob([resultado], { type: 'text/plain;charset=utf-8' });

        // Crear un enlace temporal para descargar
        var enlace = document.createElement('a');
        enlace.href = URL.createObjectURL(blob);

        // Nombre del archivo con fecha y hora
        var fecha = new Date();
        var nombreArchivo = 'cifrado_AES_' +
            fecha.getFullYear() +
            ('0' + (fecha.getMonth() + 1)).slice(-2) +
            ('0' + fecha.getDate()).slice(-2) + '_' +
            ('0' + fecha.getHours()).slice(-2) +
            ('0' + fecha.getMinutes()).slice(-2) +
            ('0' + fecha.getSeconds()).slice(-2) +
            '.txt';

        enlace.download = nombreArchivo;

        // Simular click para descargar
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);

        // Liberar el objeto URL
        URL.revokeObjectURL(enlace.href);

        mostrarAlerta('alerta-aes', 'Archivo descargado: ' + nombreArchivo, 'exito');
    }

    // ========== Limpieza de Inputs ===========
    function limpiarAES() {
        document.getElementById('texto-aes').value = '';
        document.getElementById('resultado-aes').textContent = '';
        document.getElementById('archivo-aes').value = '';
        document.getElementById('alerta-aes').innerHTML = '';
        mostrarAlerta('alerta-aes', 'Campos limpiados correctamente', 'exito');
    }

    // ========== Manejo de archivo al cargar ===========
    document.getElementById('archivo-aes').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            var nombreArchivo = e.target.files[0].name;
            mostrarAlerta('alerta-aes', 'Archivo cargado: ' + nombreArchivo, 'exito');
        }
    });
