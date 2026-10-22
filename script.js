function checkAnswer(button, isCorrect, resultId) {
    // Находим блок теста, в котором нажали кнопку
    const container = button.closest('.quiz-box');
    
    // Отключаем все кнопки в этом блоке, чтобы нельзя было нажать дважды
    const buttons = container.querySelectorAll('.quiz-option');
    buttons.forEach(btn => btn.disabled = true);

    // Показываем блок с результатом
    const resultDiv = document.getElementById(resultId);
    resultDiv.style.display = 'block';

    if (isCorrect) {
        button.style.backgroundColor = '#4CAF50'; 
        button.style.color = '#fff';
        button.style.borderColor = '#4CAF50';
        resultDiv.innerHTML = '✅ Верно! Ты понял, как это работает.';
        resultDiv.className = 'quiz-result result-correct';
    } else {
        button.style.backgroundColor = '#f44336'; 
        button.style.color = '#fff';
        button.style.borderColor = '#f44336';
        resultDiv.innerHTML = '❌ Неверно. Правильный ответ подсвечен зеленым (обнови страницу, чтобы попробовать снова).';
        resultDiv.className = 'quiz-result result-wrong';
        
        // Подсвечиваем правильный ответ зеленым
        buttons.forEach(btn => {
            if (btn.getAttribute('onclick').includes('true')) {
                btn.style.backgroundColor = '#4CAF50';
                btn.style.color = '#fff';
                btn.style.borderColor = '#4CAF50';
            }
        });
    }
}

// ==========================================
// 1. АУДИО (Звуки)
// ==========================================
let audioCtx;
let motorOsc = null;
let noiseNode = null;

function initAudio() {
    if (!audioCtx) {
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
}

function playMotorSound() {
    initAudio();
    if (!audioCtx) return;
    stopAudio();
    try {
        motorOsc = audioCtx.createOscillator();
        const motorGain = audioCtx.createGain();
        motorOsc.type = 'sawtooth';
        motorOsc.frequency.setValueAtTime(80, audioCtx.currentTime);
        motorGain.gain.setValueAtTime(0, audioCtx.currentTime);
        motorGain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.5);
        motorOsc.connect(motorGain);
        motorGain.connect(audioCtx.destination);
        motorOsc.start();
    } catch (e) {}
}

function playNoiseSound() {
    initAudio();
    if (!audioCtx) return;
    stopAudio();
    try {
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
        noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = buffer;
        noiseNode.loop = true;
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.value = 0.05;
        noiseNode.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        noiseNode.start();
    } catch (e) {}
}

function stopAudio() {
    if (motorOsc) { try { motorOsc.stop(); } catch(e){} try { motorOsc.disconnect(); } catch(e){} motorOsc = null; }
    if (noiseNode) { try { noiseNode.stop(); } catch(e){} try { noiseNode.disconnect(); } catch(e){} noiseNode = null; }
}

// ==========================================
// 2. ТЕСТЫ
// ==========================================
function checkAnswer(button, isCorrect, resultId) {
    const container = button.closest('.quiz-box');
    if (!container) return;
    const buttons = container.querySelectorAll('.quiz-option');
    buttons.forEach(btn => btn.disabled = true);
    const resultDiv = document.getElementById(resultId);
    if (!resultDiv) return;
    resultDiv.style.display = 'block';

    if (isCorrect) {
        button.style.backgroundColor = '#4CAF50';
        button.style.color = '#fff';
        resultDiv.innerHTML = '✅ Верно!';
        resultDiv.className = 'quiz-result result-correct';
    } else {
        button.style.backgroundColor = '#f44336';
        button.style.color = '#fff';
        resultDiv.innerHTML = '❌ Неверно.';
        resultDiv.className = 'quiz-result result-wrong';
        buttons.forEach(btn => {
            if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes('true')) {
                btn.style.backgroundColor = '#4CAF50';
                btn.style.color = '#fff';
            }
        });
    }
}

// ==========================================
// 3. СИМУЛЯТОР (С ТАНКОМ И ЗВУКОМ)
// ==========================================
let simInterval;

function startSimulation(type) {
    clearInterval(simInterval);
    
    const spd = document.getElementById('hudSpd');
    const alt = document.getElementById('hudAlt');
    const bat = document.getElementById('hudBat');
    const lat = document.getElementById('hudLat');
    const lon = document.getElementById('hudLon');
    const mode = document.getElementById('hudMode');
    const rssi = document.getElementById('hudRssi');
    const status = document.getElementById('fpvStatus');
    const target = document.getElementById('fpvTarget');
    const lockBox = document.getElementById('targetLock');
    const label = document.getElementById('targetLabel');

    if (!spd || !status) return;

    // СБРОС ВСЕГО
    spd.innerText = "65"; alt.innerText = "120"; bat.innerText = "98";
    lat.innerText = "47.3821"; lon.innerText = "52.5630";
    mode.innerText = "MANUAL"; mode.style.color = "#00FF00"; 
    rssi.innerText = "99"; rssi.style.color = "#00FF00";
    status.classList.remove('active');
    status.style.color = "#f44336";
    
    if (target) target.style.display = 'none';
    if (lockBox) lockBox.style.display = 'none';
    if (label) label.style.display = 'none';

    playMotorSound();
    let time = 0;

    if (type === 1) {
        simInterval = setInterval(() => {
            time++;
            if (time < 3) {
                spd.innerText = parseInt(spd.innerText) + 2;
                lat.innerText = (parseFloat(lat.innerText) + 0.0001).toFixed(4);
            } else if (time === 3) {
                rssi.innerText = "0";
                rssi.style.color = "#f44336";
                status.innerText = "СИГНАЛ ПОТЕРЯН! FAILSAFE";
                status.classList.add('active');
                playNoiseSound();
            } else if (time > 3) {
                mode.innerText = "RTH (RETURN)";
                mode.style.color = "#FF9800";
                spd.innerText = "25";
                lat.innerText = (parseFloat(lat.innerText) - 0.0002).toFixed(4);
            }
        }, 800);

    } else if (type === 2) {
        simInterval = setInterval(() => {
            time++;
            if (time < 3) {
                spd.innerText = parseInt(spd.innerText) + 3;
                lat.innerText = (parseFloat(lat.innerText) + 0.0002).toFixed(4);
            } else if (time === 3) {
                rssi.innerText = "0";
                rssi.style.color = "#f44336";
                status.innerText = "РЭБ! ПОИСК ЦЕЛИ...";
                status.classList.add('active');
                if (target) target.style.display = 'block';
                playNoiseSound();
            } else if (time === 4) {
                mode.innerText = "AUTONOMOUS";
                mode.style.color = "#FF9800";
                spd.innerText = "80";
                status.innerText = "ЦЕЛЬ ЗАХВАЧЕНА.";
                status.style.color = "#4CAF50";
                if (lockBox) lockBox.style.display = 'block';
                if (label) label.style.display = 'block';
                if (noiseNode) { try { noiseNode.stop(); } catch(e){} noiseNode = null; }
            } else if (time > 4) {
                spd.innerText = "85";
                alt.innerText = parseInt(alt.innerText) - 2;
            }
        }, 800);
    }
}

// ==========================================
// 4. СИМУЛЯТОР ИИ (Блок 5)
// ==========================================
let aiInterval;

function startAISimulation() {
    clearInterval(aiInterval);
    
    const aiStatus = document.getElementById('aiStatus');
    const aiConf = document.getElementById('aiConf');
    const aiTarget = document.getElementById('aiTarget');
    const aiLock = document.getElementById('aiLock');
    const aiNoise = document.getElementById('aiNoise');
    
    // Если элементов нет на странице, выходим
    if (!aiStatus) return;

    // Сброс
    aiStatus.innerText = "SCANNING...";
    aiConf.innerText = "0";
    aiTarget.style.display = 'block'; // Танк есть, но он серый и в шуме
    aiTarget.style.background = '#555';
    aiLock.style.display = 'none';
    aiNoise.style.opacity = '0.8'; // Много шума

    let time = 0;

    aiInterval = setInterval(() => {
        time++;
        
        if (time === 1) {
            aiStatus.innerText = "ANALYZING PIXELS...";
            aiConf.innerText = "15";
        } 
        else if (time === 2) {
            aiStatus.innerText = "ERROR: NOISE DETECTED";
            aiStatus.style.color = "#f44336";
            aiConf.innerText = "35";
        }
        else if (time === 3) {
            aiStatus.innerText = "FILTERING IMAGE...";
            aiStatus.style.color = "#2196F3";
            aiConf.innerText = "65";
            aiNoise.style.opacity = '0.3'; // Шум становится меньше
        }
        else if (time === 4) {
            aiStatus.innerText = "PATTERN MATCHED";
            aiStatus.style.color = "#4CAF50";
            aiConf.innerText = "92";
            aiNoise.style.opacity = '0'; // Шум убирается полностью
            
            // Танк становится красным (распознан)
            aiTarget.style.background = '#e53935';
            aiTarget.style.boxShadow = '0 0 15px rgba(229, 57, 53, 0.8)';
            aiTarget.style.borderLeftColor = '#b71c1c';
            
            // Появляется рамка
            aiLock.style.display = 'block';
        }
        else if (time > 4) {
            aiStatus.innerText = "TARGET LOCKED";
            aiConf.innerText = "99";
            clearInterval(aiInterval); // Останавливаем сканирование
        }
    }, 1000); // Каждую секунду
}

// ==========================================
// 5. СИМУЛЯТОР РЭБ (Блок 6)
// ==========================================
let rebInterval;

function startREBSimulation(mode) {
    clearInterval(rebInterval);
    const log = document.getElementById('rebLog');
    if (!log) return;

    log.innerHTML = "> Подключение к дрону...";
    
    let time = 0;
    
    rebInterval = setInterval(() => {
        time++;
        
        if (mode === 'normal') {
            // Обычный дрон
            if (time === 1) log.innerHTML += "<br>> Взлет разрешен. Сигнал 100%.";
            if (time === 2) log.innerHTML += "<br>> <span style='color:#f44336'>ВНИМАНИЕ: Обнаружена станция РЭБ!</span>";
            if (time === 3) log.innerHTML += "<br>> <span style='color:#f44336'>ПОМЕХИ! Сигнал 15%...</span>";
            if (time === 4) {
                log.innerHTML += "<br>> <span style='color:#f44336'>СВЯЗЬ ПОТЕРЯНА. ДРОН УПАЛ.</span>";
                clearInterval(rebInterval);
            }
        } else if (mode === 'hopping') {
            // Дрон с прыжками по частотам
            if (time === 1) log.innerHTML += "<br>> Взлет разрешен. Сигнал 100%.";
            if (time === 2) log.innerHTML += "<br>> <span style='color:#f44336'>ВНИМАНИЕ: Обнаружена станция РЭБ!</span>";
            if (time === 3) log.innerHTML += "<br>> <span style='color:#FF9800'>Смена частоты... 400MHz -> 433MHz -> 868MHz</span>";
            if (time === 4) log.innerHTML += "<br>> <span style='color:#4CAF50'>Помехи обойдены! Сигнал 85%.</span>";
            if (time === 5) {
                log.innerHTML += "<br>> <span style='color:#4CAF50'>Цель поражена. Возврат домой.</span>";
                clearInterval(rebInterval);
            }
        }
    }, 1000);
}