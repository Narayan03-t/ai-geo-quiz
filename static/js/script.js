let questions = [];
let currentQuestionIndex = 0;
let score = 0;

function startQuiz() {
    const numQuestions = document.getElementById('num-questions').value;
    fetch(`/get_questions?num=${numQuestions}`)
        .then(response => response.json())
        .then(data => {
            questions = data;
            if (questions.length === 0) {
                document.getElementById('feedback').innerHTML = "Failed to load questions. Please try again later.";
                document.getElementById('feedback').className = 'feedback incorrect';
                document.getElementById('feedback').style.display = 'block';
                return;
            }
            document.getElementById('start-screen').style.display = 'none';
            document.getElementById('question-container').style.display = 'block';
            showQuestion();
            refreshMap();
        })
        .catch(error => {
            console.error("Error fetching questions:", error);
            document.getElementById('feedback').innerHTML = "An error occurred while fetching questions.";
            document.getElementById('feedback').className = 'feedback incorrect';
            document.getElementById('feedback').style.display = 'block';
        });
}

function showQuestion() {
    const question = questions[currentQuestionIndex];
    document.getElementById('question-text').innerHTML = question.question;
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    document.getElementById('feedback').style.display = 'none'; // Hide feedback initially

    const answers = [...question.incorrect_answers, question.correct_answer];
    shuffleArray(answers);

    answers.forEach(answer => {
        const btn = document.createElement('button');
        btn.innerHTML = answer;
        btn.onclick = () => checkAnswer(answer, question.correct_answer);
        optionsDiv.appendChild(btn);
    });
}

function checkAnswer(selected, correct) {
    const feedbackDiv = document.getElementById('feedback');
    if (selected === correct) {
        score++;
        feedbackDiv.innerHTML = "✅ Correct!";
        feedbackDiv.className = 'feedback correct';
    } else {
        feedbackDiv.innerHTML = `❌ Wrong! Correct answer: ${correct}`;
        feedbackDiv.className = 'feedback incorrect';
    }
    feedbackDiv.style.display = 'block';

    // Disable all buttons after selection
    document.querySelectorAll('#options button').forEach(btn => btn.disabled = true);

    // Move to next question after 1.5 seconds
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            showResult();
        }
    }, 1500); // 1.5-second delay
    refreshMap();
}

function showResult() {
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('result-text').innerHTML = 
        `Your score: ${score} out of ${questions.length}`;
    refreshMap();
}

function restartQuiz() {
    score = 0;
    currentQuestionIndex = 0;
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    document.getElementById('feedback').style.display = 'none'; // Reset feedback
}

function refreshMap() {
    document.getElementById('map-iframe').src = `/map?score=${score}&rounds=${currentQuestionIndex + 1}`;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}