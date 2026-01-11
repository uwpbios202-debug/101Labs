// Quiz Data
const quizData = [
    {
        number: 1,
        timestamp: "00:00:10.800",
        type: "Multiple Choice",
        question: "What term do scientists use to describe the structure of the cell membrane?",
        options: ["Rigid framework", "Fluid mosaic", "Static barrier", "Solid wall"],
        correctAnswer: "B",
        points: 1,
        explanation: "Scientists describe the cell membrane structure as a 'fluid mosaic' because it is made up of different parts (like a mosaic) and has flexibility (fluid).",
        hasTriggered: false
    },
    {
        number: 2,
        timestamp: "00:00:35.040",
        type: "Fill in the Blank",
        question: "The cell membrane has two layers of phospholipids referred to as a lipid ______.",
        correctAnswer: "bilayer",
        points: 1,
        explanation: "The cell membrane consists of two layers of phospholipids, which is called a lipid bilayer (bi = two).",
        hasTriggered: false
    },
    {
        number: 3,
        timestamp: "00:00:43.440",
        type: "True/False",
        question: "The phospholipids in the lipid bilayer are rigid and cannot move.",
        options: ["TRUE", "FALSE"],
        correctAnswer: "B",
        points: 1,
        explanation: "False - the lipid bilayer is not rigid. The phospholipids have the ability to move in a flexible, wave-like motion.",
        hasTriggered: false
    },
    {
        number: 4,
        timestamp: "00:00:58.239",
        type: "Multiple Choice",
        question: "The round head portions of phospholipids are hydrophilic, which means they are:",
        options: ["Repelled by water", "Attracted to water", "Neutral to water", "Dissolved by water"],
        correctAnswer: "B",
        points: 1,
        explanation: "Hydrophilic means 'water-loving' - these parts are attracted to water.",
        hasTriggered: false
    },
    {
        number: 5,
        timestamp: "00:01:04.400",
        type: "Multiple Choice",
        question: "What does 'extracellular fluid' mean?",
        options: ["Fluid inside the cell", "Fluid in the nucleus", "Fluid outside the cell", "Fluid in the membrane"],
        correctAnswer: "C",
        points: 1,
        explanation: "Extracellular fluid is the fluid outside the cell (extra = outside).",
        hasTriggered: false
    },
    {
        number: 6,
        timestamp: "00:01:18.479",
        type: "Multiple Choice",
        question: "Where do the hydrophilic phospholipid heads of the outer layer orient toward?",
        options: ["Toward each other", "Toward the cytoplasm", "Toward the extracellular fluid", "Away from all water"],
        correctAnswer: "C",
        points: 1,
        explanation: "The hydrophilic (water-loving) heads of the outer layer orient toward the extracellular fluid, which is mostly water.",
        hasTriggered: false
    },
    {
        number: 7,
        timestamp: "00:01:28.400",
        type: "Fill in the Blank",
        question: "The phospholipid tails are ______, which means watery areas repel them.",
        correctAnswer: "hydrophobic",
        points: 1,
        explanation: "Hydrophobic means 'water-fearing' - these parts are repelled by water.",
        hasTriggered: false
    },
    {
        number: 8,
        timestamp: "00:01:38.000",
        type: "Multiple Choice",
        question: "In what direction do the hydrophobic phospholipid tails orient?",
        options: ["Toward the cytoplasm", "Toward the extracellular fluid", "Toward each other, away from water", "Randomly in all directions"],
        correctAnswer: "C",
        points: 1,
        explanation: "The hydrophobic tails orient toward each other in a direction as far away from watery content as possible.",
        hasTriggered: false
    },
    {
        number: 9,
        timestamp: "00:01:48.799",
        type: "True/False",
        question: "Proteins are embedded in the phospholipid layers of the cell membrane.",
        options: ["TRUE", "FALSE"],
        correctAnswer: "A",
        points: 1,
        explanation: "True - there are scattered proteins embedded in the phospholipid layers, some with carbohydrates attached.",
        hasTriggered: false
    },
    {
        number: 10,
        timestamp: "00:02:01.759",
        type: "Multiple Choice",
        question: "In the fluid mosaic model, what kind of boundary does the cell membrane create?",
        options: ["A rigid boundary", "A flexible boundary", "A permanent boundary", "A solid boundary"],
        correctAnswer: "B",
        points: 1,
        explanation: "The cell membrane creates a flexible boundary around the cell, not a rigid one.",
        hasTriggered: false
    },
    {
        number: 11,
        timestamp: "00:02:12.080",
        type: "Multiple Choice",
        question: "How do some molecules get through the cell membrane?",
        options: ["They break through the membrane", "They seep through spaces between phospholipids", "They dissolve the membrane", "They create holes in the membrane"],
        correctAnswer: "B",
        points: 1,
        explanation: "Some molecules can seep through the little spaces in between the phospholipids that make up the semipermeable cell membrane.",
        hasTriggered: false
    },
    {
        number: 12,
        timestamp: "00:02:21.200",
        type: "True/False",
        question: "All molecules can fit through the spaces between phospholipids in the cell membrane.",
        options: ["TRUE", "FALSE"],
        correctAnswer: "B",
        points: 1,
        explanation: "False - some molecules are too big to fit through the cell membrane between the phospholipids.",
        hasTriggered: false
    },
    {
        number: 13,
        timestamp: "00:02:32.000",
        type: "Multiple Choice",
        question: "How do larger molecules pass through the cell membrane?",
        options: ["They can't pass through", "They dissolve the membrane", "They move through proteins embedded in the membrane", "They squeeze between phospholipids"],
        correctAnswer: "C",
        points: 1,
        explanation: "Larger molecules move through proteins embedded in the cell membrane.",
        hasTriggered: false
    },
    {
        number: 14,
        timestamp: "00:02:43.840",
        type: "Multiple Choice",
        question: "What structures do substances pass through when moving via proteins in the cell membrane?",
        options: ["Holes in the phospholipids", "Tunnels made up of proteins", "Gaps in the membrane", "Channels in the carbohydrates"],
        correctAnswer: "B",
        points: 1,
        explanation: "Substances move through tunnels made up of proteins embedded in the cell membrane.",
        hasTriggered: false
    },
    {
        number: 15,
        timestamp: "00:02:48.879",
        type: "True/False",
        question: "Molecules can move both into and out of the cell through protein tunnels.",
        options: ["TRUE", "FALSE"],
        correctAnswer: "A",
        points: 1,
        explanation: "True - molecules can move through proteins either from the extracellular area into the cell, or from the intracellular area out of the cell.",
        hasTriggered: false
    }
];

// Quiz State
let player, currentQuestion = null, score = 0, questionsAnswered = 0, userAnswer = null, hasStarted = false;

// Video Player Setup
function initializePlayer() {
    player = document.getElementById('video-player');
    
    document.getElementById('playBtn').addEventListener('click', () => {
        player.play();
        if (!hasStarted) {
            hasStarted = true;
            document.getElementById('instructions').classList.add('hidden');
            document.getElementById('scoreDisplay').classList.remove('hidden');
            document.getElementById('totalQuestions').textContent = quizData.length;
        }
    });
    
    document.getElementById('pauseBtn').addEventListener('click', () => player.pause());
    document.getElementById('restartBtn').addEventListener('click', resetQuiz);
    
    document.getElementById('rewind5Btn').addEventListener('click', () => {
        player.currentTime = Math.max(0, player.currentTime - 5);
    });
    document.getElementById('forward5Btn').addEventListener('click', () => {
        player.currentTime = Math.min(player.duration, player.currentTime + 5);
    });
    document.getElementById('rewind10Btn').addEventListener('click', () => {
        player.currentTime = Math.max(0, player.currentTime - 10);
    });
    document.getElementById('forward10Btn').addEventListener('click', () => {
        player.currentTime = Math.min(player.duration, player.currentTime + 10);
    });

    player.addEventListener('play', checkForQuestions);
    player.addEventListener('timeupdate', checkForQuestions);
}

window.onload = initializePlayer;

function timestampToSeconds(timestamp) {
    const parts = timestamp.split(':');
    const hours = parts.length === 3 ? parseInt(parts[0]) : 0;
    const minutes = parts.length === 3 ? parseInt(parts[1]) : parseInt(parts[0]);
    const seconds = parseFloat(parts[parts.length === 3 ? 2 : 1]);
    return hours * 3600 + minutes * 60 + seconds;
}

function checkForQuestions() {
    if (player.paused || player.ended) return;
    const currentTime = player.currentTime;
    
    for (let question of quizData) {
        if (!question.hasTriggered) {
            const triggerTime = timestampToSeconds(question.timestamp);
            if (currentTime >= triggerTime) {
                question.hasTriggered = true;
                showQuestion(question);
                player.pause();
                break;
            }
        }
    }
}

function showQuestion(question) {
    currentQuestion = question;
    userAnswer = null;
    document.getElementById('questionContent').classList.add('hidden');
    
    setTimeout(() => {
        document.getElementById('questionContent').classList.remove('hidden');
        document.getElementById('questionText').textContent = `Question ${question.number}: ${question.question}`;
        
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';

        if (question.type === 'Fill in the Blank') {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'fill-blank-input';
            input.id = 'fillBlankInput';
            input.placeholder = 'Type your answer here...';
            optionsContainer.appendChild(input);
        } else {
            question.options.forEach((option, index) => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
                btn.onclick = () => selectAnswer(String.fromCharCode(65 + index));
                btn.id = `option${String.fromCharCode(65 + index)}`;
                optionsContainer.appendChild(btn);
            });
        }

        document.getElementById('submitBtn').classList.remove('hidden');
        document.getElementById('feedbackContainer').classList.add('hidden');
    }, 100);
}

function selectAnswer(answer) {
    userAnswer = answer;
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.style.background = 'var(--uwp-white)';
        btn.style.borderColor = 'var(--uwp-gray)';
    });
    document.getElementById(`option${answer}`).style.background = 'var(--uwp-light-gray)';
    document.getElementById(`option${answer}`).style.borderColor = 'var(--uwp-green)';
}

document.getElementById('submitBtn').addEventListener('click', () => {
    if (currentQuestion.type === 'Fill in the Blank') {
        userAnswer = document.getElementById('fillBlankInput').value.trim();
    }

    if (!userAnswer) {
        alert('Please select or enter an answer!');
        return;
    }

    const isCorrect = userAnswer.toUpperCase() === currentQuestion.correctAnswer.toUpperCase();
    
    if (isCorrect) score += currentQuestion.points;
    questionsAnswered++;

    document.getElementById('currentScore').textContent = score;

    const feedbackContainer = document.getElementById('feedbackContainer');
    feedbackContainer.innerHTML = `<strong>${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong><br>${currentQuestion.explanation}`;
    feedbackContainer.style.borderLeftColor = isCorrect ? '#28a745' : '#dc3545';
    feedbackContainer.classList.remove('hidden');

    if (currentQuestion.type !== 'Fill in the Blank') {
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
            const letter = btn.id.replace('option', '');
            if (letter === currentQuestion.correctAnswer) {
                btn.classList.add('correct');
            } else if (letter === userAnswer && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });
    }

    document.getElementById('submitBtn').classList.add('hidden');
    
    setTimeout(() => {
        if (questionsAnswered >= quizData.length) {
            document.getElementById('questionContent').classList.add('hidden');
            showFinalResults();
        } else {
            player.play();
            checkForQuestions();
        }
    }, 500);
});

function showFinalResults() {
    const percentage = Math.round((score / quizData.length) * 100);
    document.getElementById('finalResults').classList.remove('hidden');
    document.getElementById('finalScore').textContent = `${score} / ${quizData.length} (${percentage}%)`;
    
    let message = '';
    if (percentage >= 90) {
        message = 'Excellent! You have mastered cell membrane structure!';
    } else if (percentage >= 80) {
        message = 'Great job! You understand the key concepts well.';
    } else if (percentage >= 70) {
        message = 'Good effort! Review the material to strengthen your understanding.';
    } else {
        message = 'Keep studying! Consider rewatching the video and retaking the quiz.';
    }
    document.getElementById('finalMessage').textContent = message;
}

function resetQuiz() {
    score = 0;
    questionsAnswered = 0;
    currentQuestion = null;
    userAnswer = null;
    hasStarted = false;

    quizData.forEach(q => q.hasTriggered = false);

    document.getElementById('currentScore').textContent = '0';
    document.getElementById('questionContent').classList.add('hidden');
    document.getElementById('finalResults').classList.add('hidden');
    document.getElementById('scoreDisplay').classList.add('hidden');
    document.getElementById('instructions').classList.remove('hidden');

    player.currentTime = 0;
    player.pause();
}

document.getElementById('retakeBtn').addEventListener('click', resetQuiz);
