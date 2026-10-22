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

// ==========================================
// 6. КАРТА ЦЕЛЕЙ (map.html)
// ==========================================
function showHitInfo(title, text) {
    const panel = document.getElementById('infoPanel');
    if (!panel) return;

    panel.innerHTML = `
        <h3 style="color: #f44336; margin-top: 0;">🎯 ${title}</h3>
        <p style="margin: 0; font-size: 15px;">${text}</p>
    `;
    
    // Легкая анимация появления
    panel.style.opacity = '0';
    setTimeout(() => {
        panel.style.transition = 'opacity 0.3s';
        panel.style.opacity = '1';
    }, 10);
}


function startDroneAnimationInline() {
    const enemy = document.getElementById('simEnemyInline');
    const aiLock = document.getElementById('simAiLockInline');
    const explosion = document.getElementById('simExplosionInline');
    const status = document.getElementById('simStatusInline');
    
    if (!enemy) return;

    enemy.style.transition = 'none';
    enemy.style.left = '120%';
    aiLock.classList.remove('active');
    explosion.classList.remove('active');
    status.innerText = "Поиск цели...";
    status.style.color = "#00FF00";

    setTimeout(() => {
        enemy.style.transition = 'left 2s linear';
        enemy.style.left = '55%'; 
        
        setTimeout(() => {
            aiLock.classList.add('active');
            status.innerText = "ЦЕЛЬ РАСПОЗНАНА: ТАНК";
            status.style.color = "#f44336";
            
            setTimeout(() => {
                status.innerText = "ПУСК!";
                status.style.color = "#FF9800";
                explosion.classList.add('active');
                
                setTimeout(() => {
                    enemy.style.left = '150%'; 
                    status.innerText = "ЦЕЛЬ ПОРАЖЕНА.";
                    status.style.color = "#4CAF50";
                    aiLock.classList.remove('active');
                }, 1000);
            }, 1500);
        }, 2000);
    }, 500);
}

// ==========================================
// 9. БЛОК 8: Проверка координатной сетки
// ==========================================
function checkGrid(cell, isCorrect) {
    const result = document.getElementById('gridResult');
    if (!result) return;
    
    result.style.display = 'block';
    
    // Сбрасываем цвета у всех ячеек
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(c => {
        c.style.background = '#333';
        c.style.border = 'none';
    });

    if (isCorrect) {
        result.style.color = '#4CAF50';
        result.innerText = '✅ Верно! Квадрат 2-Б — это центр. Именно туда нужно передавать координаты.';
        
        // Подсвечиваем правильную ячейку
        const correctCell = Array.from(cells).find(c => c.innerText === '2-Б');
        if (correctCell) {
            correctCell.style.background = '#4CAF50';
            correctCell.style.border = '2px solid #fff';
        }
    } else {
        result.style.color = '#f44336';
        result.innerText = '❌ Неверно. Вспомни: первая цифра — это строка (сверху вниз), буква — это столбец (слева направо).';
    }
}

// ==========================================
// 10. БЛОК 9: Мини-игра "Держи баланс"
// ==========================================
let droneX = 0;
let droneY = 0;
let driftInterval;

// Функция для запуска дрейфа (дрон сам начинает наклоняться)
function startDroneDrift() {
    clearInterval(driftInterval);
    driftInterval = setInterval(() => {
        // Если игра окончена, не двигаем
        if (Math.abs(droneX) > 100 || Math.abs(droneY) > 80) return;
        
        // Случайный дрейф
        droneX += (Math.random() - 0.5) * 15;
        droneY += (Math.random() - 0.5) * 15;
        updateDronePosition();
    }, 1500); // Дрейф каждые 1.5 секунды
}

// Движение дрона по кнопкам
function moveDrone(dx, dy) {
    // Проверяем, не вылетел ли дрон
    if (Math.abs(droneX) > 100 || Math.abs(droneY) > 80) return;

    // Двигаем
    droneX += dx;
    droneY += dy;
    updateDronePosition();
}

// Обновление позиции на экране
function updateDronePosition() {
    const obj = document.getElementById('droneGameObj');
    const status = document.getElementById('gameStatus');
    if (!obj || !status) return;

    // Ограничиваем движение (границы экрана)
    if (droneX > 120) droneX = 120;
    if (droneX < -120) droneX = -120;
    if (droneY > 90) droneY = 90;
    if (droneY < -90) droneY = -90;

    // Применяем смещение
    obj.style.transform = `translate(calc(-50% + ${droneX}px), calc(-50% + ${droneY}px))`;

    // Проверка на "вылет"
    if (Math.abs(droneX) >= 120 || Math.abs(droneY) >= 90) {
        obj.style.background = '#f44336';
        obj.style.boxShadow = '0 0 20px #f44336';
        status.innerText = "❌ ДРОН РАЗБИЛСЯ! Нажми 'ЦЕНТР' для рестарта.";
        status.style.color = "#f44336";
        clearInterval(driftInterval);
    } else if (Math.abs(droneX) > 80 || Math.abs(droneY) > 60) {
        status.innerText = "⚠️ Опасно! Дрон теряет управление!";
        status.style.color = "#FF9800";
    } else {
        status.innerText = "✅ Статус: Полет нормальный";
        status.style.color = "#4CAF50";
    }
}

// Сброс игры (при нажатии "Центр")
function resetDroneGame() {
    droneX = 0;
    droneY = 0;
    const obj = document.getElementById('droneGameObj');
    const status = document.getElementById('gameStatus');
    if (obj) {
        obj.style.background = '#4CAF50';
        obj.style.boxShadow = '0 0 10px #4CAF50';
    }
    if (status) {
        status.innerText = "Статус: Полет нормальный";
        status.style.color = "#4CAF50";
    }
    updateDronePosition();
    startDroneDrift();
}

// Привязка кнопки "Центр" к рестарту
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('button[onclick="moveDrone(0, 0)"]');
    if (btn) {
        btn.addEventListener('click', resetDroneGame);
        // Запускаем дрейф при загрузке страницы
        startDroneDrift();
    }
});