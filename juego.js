const pantalla = document.getElementById("canvas");
const pincel = pantalla.getContext("2d");
const radio = 20;
let xAle, yAle;
let puntaje = 0;
let tiempoRestante = 60;
let nivel = 1;
let intervaloMovimiento, intervaloTiempo;
let juegoPausado = false;
let juegoTerminado = false;

function dibujarCirculo(x, y, radio, color) {
    pincel.fillStyle = color;
    pincel.beginPath();
    pincel.arc(x, y, radio, 0, 2 * Math.PI);
    pincel.fill();
}

function limpiarPantalla() {
    pincel.clearRect(0, 0, pantalla.width, pantalla.height);
}

function moverObjetivo() {
    if (juegoTerminado || juegoPausado) return;

    const nuevoX = sorteo(pantalla.width - (radio + 20) * 2) + (radio + 20);
    const nuevoY = sorteo(pantalla.height - (radio + 20) * 2) + (radio + 20);

    const deltaX = (nuevoX - xAle) / 20;
    const deltaY = (nuevoY - yAle) / 20;

    let pasos = 0;

    function animarMovimiento() {
        if (pasos < 20) {
            limpiarPantalla();
            xAle += deltaX;
            yAle += deltaY;
            dibujarObjetivo(xAle, yAle);
            pasos++;
            if (!juegoPausado) {
                requestAnimationFrame(animarMovimiento);
            }
        } else {
            xAle = nuevoX;
            yAle = nuevoY;
            dibujarObjetivo(xAle, yAle);
        }
    }
    animarMovimiento();
}

function actualizarPantalla() {
    moverObjetivo();
}

function actualizarPuntaje() {
    document.getElementById("puntaje").innerText = "Puntaje: " + puntaje;
}

function actualizarTiempo() {
    document.getElementById("tiempo").innerText = "Tiempo: " + tiempoRestante;
}

function ajustarNivel() {
    if (juegoTerminado || juegoPausado) return;

    nivel = Math.floor(puntaje / 10) + 1;
    clearInterval(intervaloMovimiento);
    intervaloMovimiento = setInterval(actualizarPantalla, 1000 / nivel);
}

function verificarVictoria() {
    if (puntaje >= 50) {
        juegoTerminado = true;
        clearInterval(intervaloMovimiento);
        clearInterval(intervaloTiempo);
        document.getElementById("mensaje").innerText = "¡Felicidades! Ganaste con " + puntaje + " puntos.";
    }
}

function mostrarDestello(x, y, puntos) {
    const colorDestello = puntos >= 5 ? "#00ff00" : (puntos >= 3 ? "#ffff00" : "#ff0000");
    pincel.fillStyle = colorDestello;
    pincel.beginPath();
    pincel.arc(x, y, radio + puntos * 2, 0, 2 * Math.PI);
    pincel.fill();
    setTimeout(actualizarPantalla, 100);
}

function disparar(evento) {
    if (juegoPausado || juegoTerminado) return;

    const x = evento.pageX - pantalla.offsetLeft;
    const y = evento.pageY - pantalla.offsetTop;

    const dist = Math.sqrt(Math.pow(x - xAle, 2) + Math.pow(y - yAle, 2));
    let puntos = 0;

    if (dist <= radio + 20) {
        if (dist <= radio) {
            puntos = 5;
        } else if (dist <= radio + 10) {
            puntos = 3;
        } else {
            puntos = 1;
        }
        puntaje += puntos;
        mostrarDestello(xAle, yAle, puntos);
    }

    actualizarPuntaje();
    ajustarNivel();
    verificarVictoria();
    actualizarPantalla();
}

function reiniciarJuego() {
    puntaje = 0;
    tiempoRestante = 60;
    nivel = 1;
    juegoPausado = false;
    juegoTerminado = false;
    document.getElementById("pausar").innerText = "Pausar";
    actualizarPuntaje();
    actualizarTiempo();
    document.getElementById("mensaje").innerText = "";
    clearInterval(intervaloMovimiento);
    clearInterval(intervaloTiempo);
    intervaloMovimiento = setInterval(actualizarPantalla, 1000);
    intervaloTiempo = setInterval(reducirTiempo, 1000);
    actualizarPantalla();
}

function reducirTiempo() {
    if (!juegoPausado && tiempoRestante > 0) {
        tiempoRestante--;
        actualizarTiempo();
        if (tiempoRestante <= 0) {
            juegoTerminado = true;
            clearInterval(intervaloMovimiento);
            clearInterval(intervaloTiempo);
            document.getElementById("mensaje").innerText = "¡Tiempo terminado! Puntaje final: " + puntaje;
        }
    }
}

function cuentaRegresiva(inicio, callback) {
    const mensaje = document.getElementById("mensaje");
    let tiempo = inicio;

    function actualizaCuenta() {
        if (tiempo > 0) {
            mensaje.innerText = "Comenzando en: " + tiempo;
            tiempo--;
            setTimeout(actualizaCuenta, 1000);
        } else {
            mensaje.innerText = "";
            callback();
        }
    }

    actualizaCuenta();
}

function pausarJuego() {
    if (juegoTerminado) return;

    juegoPausado = !juegoPausado;
    if (juegoPausado) {
        clearInterval(intervaloMovimiento);
        clearInterval(intervaloTiempo);
        document.getElementById("pausar").innerText = "Reanudar";
    } else {
        intervaloMovimiento = setInterval(actualizarPantalla, 1000 / nivel);
        intervaloTiempo = setInterval(reducirTiempo, 1000);
        document.getElementById("pausar").innerText = "Pausar";
    }
}

function sorteo(maximo) {
    return Math.floor(Math.random() * maximo);
}

function dibujarObjetivo(x, y) {
    dibujarCirculo(x, y, radio + 20, "red");
    dibujarCirculo(x, y, radio + 10, "white");
    dibujarCirculo(x, y, radio, "red");
}

pantalla.onmouseover = function() {
    pantalla.style.cursor = "pointer";
};

pantalla.onmouseout = function() {
    pantalla.style.cursor = "default";
};

pantalla.onclick = disparar;
document.getElementById("reiniciar").onclick = function() {
    cuentaRegresiva(3, reiniciarJuego);
};
document.getElementById("pausar").onclick = pausarJuego;

cuentaRegresiva(3, reiniciarJuego);
