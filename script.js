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