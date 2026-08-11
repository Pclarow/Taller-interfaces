let recognition;
let transcripcion = "Haz clic en el botón y di algo...";
let esEscuchando = false;

// Variables para audio
let mic;
let fft;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100); // Modo HSB para colores más vibrantes y coloridos
  
  // Configuración de audio
  mic = new p5.AudioIn();
  mic.start();
  
  fft = new p5.FFT(0.8, 128); // 128 bandas para barras de frecuencia más definidas
  fft.setInput(mic);

  // Reconocimiento de voz
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = function(event) {
      let textoActual = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        textoActual += event.results[i][0].transcript;
      }
      transcripcion = textoActual;
    };

    recognition.onerror = function(event) {
      console.error("Error en reconocimiento: ", event.error);
    };

    recognition.onend = function() {
      if (esEscuchando) {
        recognition.start();
      }
    };
  } else {
    transcripcion = "Tu navegador no soporta reconocimiento de voz. Usa Google Chrome.";
  }

  // Botón de control
  let boton = createButton('Iniciar / Detener Micrófono');
  boton.position(20, 20);
  boton.style('padding', '12px 24px');
  boton.style('font-size', '14px');
  boton.style('background-color', '#ff007f');
  boton.style('color', 'white');
  boton.style('border', 'none');
  boton.style('border-radius', '8px');
  boton.style('cursor', 'pointer');
  boton.style('z-index', '10');
  boton.style('box-shadow', '0 0 10px rgba(255,0,127,0.5)');
  boton.mousePressed(toggleMic);
}

function draw() {
  background(240, 30, 8, 0.3); // Estela suave de fondo

  // Obtener datos de audio
  let volumen = mic.getLevel();
  let espectro = fft.analyze();
  
  // Calcular frecuencia dominante aproximada
  let centroid = fft.getCentroid(); // Devuelve la frecuencia central en Hz

  // --- INTERFAZ GRÁFICA DE FRECUENCIAS (Colorida Estilo Neón) ---
  let anchoBarra = width / espectro.length;
  for (let i = 0; i < espectro.length; i++) {
    let hFrec = map(espectro[i], 0, 255, 0, height * 0.35);
    
    // Generar un color dinámico basado en la posición de la barra (Arcoíris)
    let tono = map(i, 0, espectro.length, 0, 360);
    fill(tono, 90, 100);
    noStroke();
    
    // Dibujar barras desde abajo hacia arriba con efecto redondeado
    rect(i * anchoBarra, height - hFrec, anchoBarra - 3, hFrec, 4);
  }

  // --- PANEL DE INFORMACIÓN Y FRECUENCIA ---
  colorMode(RGB, 255, 255, 255); // Volvemos temporalmente a RGB para textos y cajas estándar
  
  // Caja de Volumen y Frecuencia
  fill(30, 30, 45, 220);
  stroke(100, 100, 200);
  strokeWeight(2);
  rect(20, height - 90, 260, 70, 10);

  // Barra de Volumen interior
  let anchoVolumen = map(volumen, 0, 0.3, 0, 220, true);
  noStroke();
  fill(0, 255, 150);
  rect(40, height - 45, anchoVolumen, 12, 6);

  // Textos de audio
  fill(255);
  textSize(13);
  textAlign(LEFT, CENTER);
  text("Volumen del Micrófono", 40, height - 65);
  
  // Mostrar Frecuencia Dominante en Hz
  let freqTexto = isNaN(centroid) ? "0 Hz" : nf(centroid, 0, 1) + " Hz";
  text("Frecuencia aprox: " + freqTexto, 40, height - 20);

  // --- ESTADO DEL RECONOCIMIENTO DE VOZ ---
  textSize(18);
  textAlign(CENTER, TOP);
  if (esEscuchando) {
    fill(100, 255, 150);
    text("● Escuchando activamente...", width / 2, 25);
  } else {
    fill(255, 100, 100);
    text("○ Micrófono pausado", width / 2, 25);
  }

  // --- CAJA DE TRANSCRIPCIÓN DE TEXTO ---
  fill(30, 30, 45, 220);
  stroke(150, 100, 255);
  strokeWeight(2);
  rectMode(CENTER);
  rect(width / 2, height / 2 - 20, width * 0.8, height * 0.35, 20);

  // Texto transcrito en pantalla
  noStroke();
  fill(255);
  textSize(26);
  textAlign(CENTER, CENTER);
  textWrap(WORD);
  text(transcripcion, width / 2 - width * 0.36, height / 2 - height * 0.15, width * 0.72, height * 0.25);
  
  // Restaurar modo HSB para el siguiente fotograma
  colorMode(HSB, 360, 100, 100);
}

function toggleMic() {
  userStartAudio();

  if (!recognition) return;
  
  if (!esEscuchando) {
    recognition.start();
    esEscuchando = true;
  } else {
    recognition.stop();
    esEscuchando = false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
} 