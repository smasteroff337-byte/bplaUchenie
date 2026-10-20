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

// --- FPV СИМУЛЯТОР ---
let simInterval;

function startSimulation(type) {
    // Сброс предыдущей симуляции
    clearInterval(simInterval);
    const spd = document.getElementById('hudSpd');
    const alt = document.getElementById('hudAlt');
    const bat = document.getElementById('hudBat');
    const lat = document.getElementById('hudLat');
    const lon = document.getElementById('hudLon');
    const mode = document.getElementById('hudMode');
    const rssi = document.getElementById('hudRssi');
    const status = document.getElementById('fpvStatus');

    spd.innerText = "65";
    alt.innerText = "120";
    bat.innerText = "98";
    lat.innerText = "47.3821";
    lon.innerText = "52.5630";
    mode.innerText = "MANUAL";
    rssi.innerText = "99";
    status.classList.remove('active');

    let time = 0;

    if (type === 1) {
        // СИТУАЦИЯ 1: Просто потеря связи
        simInterval = setInterval(() => {
            time++;
            if (time < 3) {
                // Летим нормально
                spd.innerText = parseInt(spd.innerText) + 2;
                lat.innerText = (parseFloat(lat.innerText) + 0.0001).toFixed(4);
            } else if (time === 3) {
                // Потеря связи
                rssi.innerText = "0";
                rssi.style.color = "#f44336";
                status.innerText = "СИГНАЛ ПОТЕРЯН! FAILSAFE АКТИВИРОВАН";
                status.classList.add('active');
            } else if (time > 3) {
                // Дрон пытается вернуться
                mode.innerText = "RTH (RETURN)";
                spd.innerText = "25";
                lat.innerText = (parseFloat(lat.innerText) - 0.0002).toFixed(4);
            }
        }, 800);

    } else if (type === 2) {
        // СИТУАЦИЯ 2: РЭБ и Автономный режим
        simInterval = setInterval(() => {
            time++;
            if (time < 3) {
                spd.innerText = parseInt(spd.innerText) + 3;
                lat.innerText = (parseFloat(lat.innerText) + 0.0002).toFixed(4);
            } else if (time === 3) {
                // РЭБ глушит связь
                rssi.innerText = "0";
                rssi.style.color = "#f44336";
                status.innerText = "РЭБ! ВРАГ ЗАГЛУШЕН. ЗАХВАТ ЦЕЛИ!";
                status.classList.add('active');
            } else if (time === 4) {
                // Дрон переходит в автономный режим, координаты замирают
                mode.innerText = "AUTONOMOUS";
                mode.style.color = "#FF9800";
                spd.innerText = "80";
                status.innerText = "АВТОНОМНЫЙ ПОЛЕТ. ЦЕЛЬ В КАДРЕ.";
                status.style.color = "#4CAF50";
            } else if (time > 4) {
                // Продолжает лететь сам
                spd.innerText = "85";
                alt.innerText = parseInt(alt.innerText) - 2; // Снижается к цели
            }
        }, 800);
    }
}