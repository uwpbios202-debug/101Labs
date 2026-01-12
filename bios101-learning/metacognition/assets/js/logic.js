// logic.js - Metacognition Discovery Lab
// State management and core functionality for multi-page setup

const STORAGE_KEY = 'metacognitionDiscoveryLab';

// Define experiment order for metacognitive development
const experimentOrder = [
    'calibration',
    'pretest',
    'activerecallarena',
    'spacingvscramming',
    'interleavinggauntlet',
    'encoding',
    'environment',
    'timeofday',
    'dualtaskchallenge',
    'combined'
];

// Define default state
const defaultState = {
    experiments: {},
    lastViewedExperimentId: experimentOrder[0],
    progressPercentage: 0,
    currentExperimentIndex: 0
};

// Initialize experiments in default state
experimentOrder.forEach(expId => {
    defaultState.experiments[expId] = {
        id: expId,
        completed: false,
        personalReflection: '',
        reflectionWordCount: 0,
        curiosityResponse: '',
        curiosityExplanation: '',
        rqUnderstanding: '',
        hypothesisFormatCorrect: false,
        predictionChoice: '',
        predictionConfidence: '',
        resultsReflection: '',
        resultsReflectionWordCount: 0,
        experimentDesign: {
            course: '',
            material: '',
            change: '',
            measure: '',
            start: '',
            eval: ''
        },
        experimentCommit: false,
        completedDate: null,
        currentPhase: 1 // Track which phase the user is on for this experiment
    };
});

// ==================== STATE MANAGEMENT ====================

let state = loadState();

// Load state from localStorage
function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return structuredClone(defaultState);
        const parsed = JSON.parse(raw);
        // Merge with default to ensure new properties exist
        const merged = { ...structuredClone(defaultState), ...parsed };
        // Ensure all experiments exist
        experimentOrder.forEach(expId => {
            if (!merged.experiments[expId]) {
                merged.experiments[expId] = structuredClone(defaultState.experiments[expId]);
            }
        });
        return merged;
    } catch (e) {
        console.error('Error loading state:', e);
        return structuredClone(defaultState);
    }
}

// Save state to localStorage
function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        updateGlobalProgressUI(); // Update progress whenever state changes
        updateExperimentChips(); // Update dashboard chips if on dashboard
        return true;
    } catch (e) {
        console.error('Error saving state:', e);
        return false;
    }
}

// Reset all data
function resetAllData() {
    if (confirm('This will clear ALL your saved data and reset the lab. Are you sure?')) {
        localStorage.removeItem(STORAGE_KEY);
        state = structuredClone(defaultState);
        window.location.href = 'index.html'; // Return to landing page
    }
}

// ==================== UTILITY FUNCTIONS ====================

// Count words in a string
function countWords(str) {
    return str.trim().match(/\b\w+\b/g)?.length || 0;
}

// Get current experiment ID from URL or page
function getCurrentExperimentId() {
    // Try to get from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const expId = urlParams.get('exp');
    
    if (expId && experimentOrder.includes(expId)) {
        return expId;
    }
    
    // Try to get from data attribute
    const expElement = document.querySelector('[data-experiment-id]');
    if (expElement) {
        const id = expElement.getAttribute('data-experiment-id');
        if (experimentOrder.includes(id)) return id;
    }
    
    // Default to calibration
    return 'calibration';
}

// Get experiment index by ID
function getExperimentIndex(expId) {
    return experimentOrder.indexOf(expId);
}

// Get next experiment ID
function getNextExperimentId(currentExpId) {
    const currentIndex = experimentOrder.indexOf(currentExpId);
    if (currentIndex < experimentOrder.length - 1) {
        return experimentOrder[currentIndex + 1];
    }
    return null;
}

// Get previous experiment ID
function getPreviousExperimentId(currentExpId) {
    const currentIndex = experimentOrder.indexOf(currentExpId);
    if (currentIndex > 0) {
        return experimentOrder[currentIndex - 1];
    }
    return null;
}

// Get experiment completion status
function getExperimentStatus(expId) {
    const exp = state.experiments[expId];
    if (!exp) return 'not-started';
    
    if (exp.completed) return 'completed';
    if (exp.resultsReflectionWordCount >= 75) return 'phase6';
    if (exp.predictionChoice) return 'phase3c';
    if (exp.hypothesisFormatCorrect) return 'phase3b';
    if (exp.rqUnderstanding) return 'phase3a';
    if (exp.curiosityResponse) return 'phase2';
    if (exp.reflectionWordCount >= 50) return 'phase1';
    return 'not-started';
}

// Get experiment completion percentage
function getExperimentProgress(expId) {
    const exp = state.experiments[expId];
    if (!exp) return 0;
    
    if (exp.completed) return 100;
    
    const phases = [
        exp.reflectionWordCount >= 50,
        exp.curiosityResponse,
        exp.rqUnderstanding,
        exp.hypothesisFormatCorrect,
        exp.predictionChoice && exp.predictionConfidence,
        exp.resultsReflectionWordCount >= 75,
        exp.experimentCommit
    ];
    
    const completedPhases = phases.filter(Boolean).length;
    return Math.round((completedPhases / 7) * 100);
}

// ==================== GLOBAL UI UPDATES ====================

// Update global progress UI (for header)
function updateGlobalProgressUI() {
    const progressBar = document.getElementById('globalProgressBar');
    const progressLabel = document.getElementById('globalProgressLabel');
    
    if (!progressBar || !progressLabel) return;
    
    const total = experimentOrder.length;
    const completed = experimentOrder.filter(expId => state.experiments[expId].completed).length;
    const percentage = Math.round((completed / total) * 100);
    
    progressBar.style.width = `${percentage}%`;
    progressLabel.textContent = `${completed} of ${total} experiments completed`;
    
    // Update progress labels if they exist
    updateProgressLabels();
    
    // Update roadmap progress if on roadmap page
    const roadmapProgress = document.getElementById('roadmapProgress');
    if (roadmapProgress) {
        roadmapProgress.textContent = completed;
    }
}

// Update progress labels in header
function updateProgressLabels() {
    const labelsContainer = document.getElementById('progressLabels');
    if (!labelsContainer) return;
    
    labelsContainer.innerHTML = '';
    
    experimentOrder.forEach((expId, index) => {
        const exp = state.experiments[expId];
        const data = window.experimentData ? window.experimentData[expId] : { title: `Experiment ${index + 1}` };
        const label = document.createElement('div');
        label.className = 'progress-label-item';
        
        // Shorten title for mobile
        let titleText = data.title || `Exp ${index + 1}`;
        if (window.innerWidth < 640) {
            titleText = `${index + 1}. ${titleText.substring(0, 8)}...`;
        } else {
            titleText = `${index + 1}. ${titleText.substring(0, 12)}...`;
        }
        
        label.textContent = titleText;
        
        if (exp.completed) {
            label.classList.add('completed');
        }
        
        // Check if this is the current experiment page
        const currentExpId = getCurrentExperimentId();
        if (expId === currentExpId) {
            label.classList.add('current');
        }
        
        labelsContainer.appendChild(label);
    });
}

// Update experiment chips on dashboard
function updateExperimentChips() {
    experimentOrder.forEach(expId => {
        const chip = document.getElementById(`chip-${expId}`);
        if (!chip) return;
        
        const status = getExperimentStatus(expId);
        const progress = getExperimentProgress(expId);
        
        switch (status) {
            case 'completed':
                chip.textContent = 'Completed ✓';
                chip.className = 'chip completed';
                break;
            case 'phase6':
            case 'phase3c':
            case 'phase3b':
            case 'phase3a':
            case 'phase2':
            case 'phase1':
                chip.textContent = `${progress}% complete`;
                chip.className = 'chip';
                break;
            default:
                chip.textContent = 'Not started';
                chip.className = 'chip';
        }
    });
}

// ==================== EXPERIMENT PAGE FUNCTIONS ====================

// Initialize an experiment page
function initializeExperimentPage() {
    const expId = getCurrentExperimentId();
    state.lastViewedExperimentId = expId;
    state.currentExperimentIndex = getExperimentIndex(expId);
    saveState();
    
    const exp = state.experiments[expId];
    const data = window.experimentData ? window.experimentData[expId] : null;
    
    if (!data) {
        console.error('Experiment data not found for:', expId);
        return;
    }
    
    // Update page title with experiment name
    document.title = `${data.title} - Metacognition Discovery Lab`;
    
    // Set experiment ID as data attribute
    document.body.setAttribute('data-experiment-id', expId);
    
    // Populate experiment data
    populateExperimentData(expId, data);
    
    // Hydrate form fields with saved data
    hydrateExperimentForm(expId, exp);
    
    // Set up phase navigation
    setupPhaseNavigation(expId, exp);
    
    // Update UI based on current phase
    updatePhaseVisibility(expId, exp);
    
    // Set up event listeners
    setupExperimentEventListeners(expId);
    
    // Update global UI
    updateGlobalProgressUI();
}

// Populate experiment data in the page
function populateExperimentData(expId, data) {
    // Observation
    const observationBox = document.getElementById('observationBox');
    if (observationBox) observationBox.innerHTML = `<p>${data.observation}</p>`;
    
    // Curiosity
    const curiosityBox = document.getElementById('curiosityBox');
    if (curiosityBox) curiosityBox.innerHTML = `<p><strong>${data.curiosity}</strong></p>`;
    
    // Research Question
    const researchQuestionText = document.getElementById('researchQuestionText');
    if (researchQuestionText) researchQuestionText.textContent = data.rq;
    
    // Hypothesis
    const hypothesisContent = document.getElementById('hypothesisContent');
    if (hypothesisContent) {
        hypothesisContent.innerHTML = `
            <h3>Your Hypothesis</h3>
            <div class="observation-box">
                <p>${data.hypothesis}</p>
            </div>
            <p class="meta" style="margin-top:0.5rem;"><strong>Why this works:</strong> ${data.why}</p>
        `;
    }
    
    // Prediction options
    const predictionChoice = document.getElementById('predictionChoice');
    if (predictionChoice && data.predictionOptions) {
        predictionChoice.innerHTML = '<option value="">— Select your prediction —</option>';
        data.predictionOptions.forEach(opt => {
            predictionChoice.innerHTML += `<option value="${opt.value}">${opt.label}</option>`;
        });
    }
    
    // Study design
    const designContent = document.getElementById('designContent');
    if (designContent) {
        designContent.innerHTML = `
            <h3>The Study Design: ${data.study}</h3>
            <div class="observation-box">
                <p>${data.design}</p>
            </div>
        `;
    }
    
    // Results interpretation
    const resultsInterpretation = document.getElementById('resultsInterpretation');
    if (resultsInterpretation) resultsInterpretation.innerHTML = data.resultsSummary;
    
    // Real study data
    if (data.realData) {
        document.getElementById('studyCitation').textContent = data.realData.citation;
        document.getElementById('studySample').textContent = data.realData.sample;
        document.getElementById('studyEffect').textContent = data.realData.effectSize;
        document.getElementById('statisticalResults').textContent = data.realData.stats;
        document.getElementById('researchConclusion').textContent = data.realData.conclusion;
        document.getElementById('researchImplication').textContent = data.realData.implication;
        const significance = document.getElementById('significanceResult');
        if (significance) {
            significance.textContent = data.realData.stats.includes('p <') ? 
                'Statistically significant (p < .05)' : 'Not statistically significant';
        }
    }
    
    // Experiment title
    const experimentTitle = document.getElementById('experimentTitle');
    if (experimentTitle) experimentTitle.textContent = data.title;
    
    const experimentSubtitle = document.getElementById('experimentSubtitle');
    if (experimentSubtitle) experimentSubtitle.textContent = data.subtitle;
}

// Hydrate form fields with saved data
function hydrateExperimentForm(expId, exp) {
    if (!exp) return;
    
    // Phase 1: Reflection
    const reflectionText = document.getElementById('reflectionText');
    if (reflectionText) reflectionText.value = exp.personalReflection || '';
    
    // Phase 2: Curiosity
    if (exp.curiosityResponse) {
        const curiosityRadio = document.querySelector(`input[name="curiosityResponse"][value="${exp.curiosityResponse}"]`);
        if (curiosityRadio) curiosityRadio.checked = true;
    }
    
    const curiosityExplanation = document.getElementById('curiosityExplanation');
    if (curiosityExplanation) curiosityExplanation.value = exp.curiosityExplanation || '';
    
    // Phase 3a: RQ Understanding
    const rqUnderstanding = document.getElementById('rqUnderstanding');
    if (rqUnderstanding) rqUnderstanding.value = exp.rqUnderstanding || '';
    
    // Phase 3b: Hypothesis format (already handled by visibility)
    
    // Phase 3c: Prediction
    const predictionChoice = document.getElementById('predictionChoice');
    if (predictionChoice) predictionChoice.value = exp.predictionChoice || '';
    
    const predictionConfidence = document.getElementById('predictionConfidence');
    if (predictionConfidence) predictionConfidence.value = exp.predictionConfidence || 3;
    
    const confValue = document.getElementById('confValue');
    if (confValue) confValue.textContent = exp.predictionConfidence || 3;
    
    // Phase 5: Results reflection
    const resultsReflection = document.getElementById('resultsReflection');
    if (resultsReflection) resultsReflection.value = exp.resultsReflection || '';
    
    // Phase 6: Experiment design
    document.getElementById('expCourse').value = exp.experimentDesign.course || '';
    document.getElementById('expMaterial').value = exp.experimentDesign.material || '';
    document.getElementById('expChange').value = exp.experimentDesign.change || '';
    document.getElementById('expMeasure').value = exp.experimentDesign.measure || '';
    document.getElementById('expStart').value = exp.experimentDesign.start || '';
    document.getElementById('expEval').value = exp.experimentDesign.eval || '';
    document.getElementById('expCommit').checked = exp.experimentCommit || false;
    
    // Update word counts
    updateReflectionMeta();
    updateResultsReflectionMeta();
    
    // Validate all inputs
    validateReflectionInput();
    validateCuriosityInputs();
    validateRQUnderstanding();
    validatePredictionInputs();
    validateResultsReflection();
    validateExperimentDesign();
}

// Set up phase navigation
function setupPhaseNavigation(expId, exp) {
    // Update next/previous buttons
    const nextExpId = getNextExperimentId(expId);
    const prevExpId = getPreviousExperimentId(expId);
    
    // Dashboard link
    const dashboardLinks = document.querySelectorAll('[data-nav="dashboard"]');
    dashboardLinks.forEach(link => {
        link.href = '../dashboard.html';
    });
    
    // Previous experiment link (if exists)
    const prevButtons = document.querySelectorAll('[data-nav="prev-experiment"]');
    if (prevExpId && prevButtons.length > 0) {
        prevButtons.forEach(btn => {
            btn.href = `./${getExperimentIndex(prevExpId) + 1}-${prevExpId}.html`;
            btn.style.display = 'inline-flex';
        });
    }
    
    // Next experiment link (if exists)
    const nextButtons = document.querySelectorAll('[data-nav="next-experiment"]');
    if (nextExpId && nextButtons.length > 0) {
        nextButtons.forEach(btn => {
            btn.href = `./${getExperimentIndex(nextExpId) + 1}-${nextExpId}.html`;
            btn.style.display = 'inline-flex';
        });
    }
    
    // Complete experiment button - goes to dashboard
    const completeButtons = document.querySelectorAll('[data-complete-experiment]');
    completeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            completeExperiment(expId);
        });
    });
}

// Update phase visibility based on progress
function updatePhaseVisibility(expId, exp) {
    const phases = ['phase1', 'phase2', 'phase3a', 'phase3b', 'phase3c', 'phase4', 'phase5', 'phase6', 'phase7'];
    
    // Hide all phases first
    phases.forEach(phaseId => {
        const phase = document.getElementById(phaseId);
        if (phase) phase.classList.add('hidden');
    });
    
    // Always show Phase 1
    const phase1 = document.getElementById('phase1');
    if (phase1) phase1.classList.remove('hidden');
    
    // Show subsequent phases based on progress
    if (exp.reflectionWordCount >= 50) {
        const phase2 = document.getElementById('phase2');
        if (phase2) phase2.classList.remove('hidden');
    }
    
    if (exp.curiosityResponse) {
        const phase3a = document.getElementById('phase3a');
        if (phase3a) phase3a.classList.remove('hidden');
    }
    
    if (exp.rqUnderstanding) {
        const phase3b = document.getElementById('phase3b');
        if (phase3b) phase3b.classList.remove('hidden');
    }
    
    if (exp.hypothesisFormatCorrect) {
        const phase3c = document.getElementById('phase3c');
        if (phase3c) phase3c.classList.remove('hidden');
    }
    
    if (exp.predictionChoice) {
        const phase4 = document.getElementById('phase4');
        if (phase4) phase4.classList.remove('hidden');
    }
    
    if (exp.predictionConfidence) {
        const phase5 = document.getElementById('phase5');
        if (phase5) phase5.classList.remove('hidden');
    }
    
    if (exp.resultsReflectionWordCount >= 75) {
        const phase6 = document.getElementById('phase6');
        if (phase6) phase6.classList.remove('hidden');
    }
    
    if (exp.completed) {
        const phase7 = document.getElementById('phase7');
        if (phase7) phase7.classList.remove('hidden');
    }
}

// Set up event listeners for experiment page
function setupExperimentEventListeners(expId) {
    // Phase 1: Reflection
    const reflectionText = document.getElementById('reflectionText');
    if (reflectionText) {
        reflectionText.addEventListener('input', function() {
            state.experiments[expId].personalReflection = this.value;
            validateReflectionInput();
            saveState();
        });
    }
    
    const reflectionContinueBtn = document.getElementById('reflectionContinueBtn');
    if (reflectionContinueBtn) {
        reflectionContinueBtn.addEventListener('click', function() {
            navigateToPhase('phase2');
        });
    }
    
    // Phase 2: Curiosity
    const curiosityRadios = document.querySelectorAll('input[name="curiosityResponse"]');
    curiosityRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            state.experiments[expId].curiosityResponse = this.value;
            validateCuriosityInputs();
            saveState();
        });
    });
    
    const curiosityExplanation = document.getElementById('curiosityExplanation');
    if (curiosityExplanation) {
        curiosityExplanation.addEventListener('input', function() {
            state.experiments[expId].curiosityExplanation = this.value;
            saveState();
        });
    }
    
    const curiosityContinueBtn = document.getElementById('curiosityContinueBtn');
    if (curiosityContinueBtn) {
        curiosityContinueBtn.addEventListener('click', function() {
            navigateToPhase('phase3a');
        });
    }
    
    // Phase 3a: RQ Understanding
    const rqUnderstanding = document.getElementById('rqUnderstanding');
    if (rqUnderstanding) {
        rqUnderstanding.addEventListener('change', function() {
            state.experiments[expId].rqUnderstanding = this.value;
            validateRQUnderstanding();
            saveState();
        });
    }
    
    const rqContinueBtn = document.getElementById('rqContinueBtn');
    if (rqContinueBtn) {
        rqContinueBtn.addEventListener('click', function() {
            navigateToPhase('phase3b');
        });
    }
    
    // Phase 3b: Hypothesis format quiz
    const hypothesisRadios = document.querySelectorAll('input[name="hypothesisFormat"]');
    hypothesisRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            handleHypothesisQuiz(expId, this.value);
        });
    });
    
    const hypothesisContinueBtn = document.getElementById('hypothesisContinueBtn');
    if (hypothesisContinueBtn) {
        hypothesisContinueBtn.addEventListener('click', function() {
            navigateToPhase('phase3c');
        });
    }
    
    // Phase 3c: Prediction
    const predictionChoice = document.getElementById('predictionChoice');
    if (predictionChoice) {
        predictionChoice.addEventListener('change', function() {
            state.experiments[expId].predictionChoice = this.value;
            validatePredictionInputs();
            saveState();
        });
    }
    
    const predictionConfidence = document.getElementById('predictionConfidence');
    if (predictionConfidence) {
        predictionConfidence.addEventListener('input', function() {
            const val = this.value;
            const confValue = document.getElementById('confValue');
            if (confValue) confValue.textContent = val;
            state.experiments[expId].predictionConfidence = val;
            validatePredictionInputs();
            saveState();
        });
    }
    
    const predictionContinueBtn = document.getElementById('predictionContinueBtn');
    if (predictionContinueBtn) {
        predictionContinueBtn.addEventListener('click', function() {
            navigateToPhase('phase4');
        });
    }
    
    // Phase 4: Design
    const designContinueBtn = document.getElementById('designContinueBtn');
    if (designContinueBtn) {
        designContinueBtn.addEventListener('click', function() {
            navigateToPhase('phase5');
        });
    }
    
    // Phase 5: Results
    const resultsReflection = document.getElementById('resultsReflection');
    if (resultsReflection) {
        resultsReflection.addEventListener('input', function() {
            state.experiments[expId].resultsReflection = this.value;
            validateResultsReflection();
            saveState();
        });
    }
    
    const resultsContinueBtn = document.getElementById('resultsContinueBtn');
    if (resultsContinueBtn) {
        resultsContinueBtn.addEventListener('click', function() {
            navigateToPhase('phase6');
        });
    }
    
    // Phase 6: Experiment design
    const expFields = ['expCourse', 'expMaterial', 'expChange', 'expMeasure', 'expStart', 'expEval'];
    expFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                const fieldName = fieldId.replace('exp', '').toLowerCase();
                const property = fieldName === 'start' ? 'start' : fieldName === 'eval' ? 'eval' : fieldName;
                state.experiments[expId].experimentDesign[property] = this.value;
                validateExperimentDesign();
                saveState();
            });
        }
    });
    
    const expCommit = document.getElementById('expCommit');
    if (expCommit) {
        expCommit.addEventListener('change', function() {
            state.experiments[expId].experimentCommit = this.checked;
            validateExperimentDesign();
            saveState();
        });
    }
    
    const commitContinueBtn = document.getElementById('commitContinueBtn');
    if (commitContinueBtn) {
        commitContinueBtn.addEventListener('click', function() {
            completeExperiment(expId);
        });
    }
    
    // Phase 7: Completion
    const nextExperimentBtn = document.getElementById('nextExperimentBtn');
    if (nextExperimentBtn) {
        nextExperimentBtn.addEventListener('click', function() {
            const nextExpId = getNextExperimentId(expId);
            if (nextExpId) {
                window.location.href = `./${getExperimentIndex(nextExpId) + 1}-${nextExpId}.html`;
            } else {
                window.location.href = '../dashboard.html';
            }
        });
    }
}

// Navigation between phases
function navigateToPhase(phaseId) {
    const phase = document.getElementById(phaseId);
    if (phase) {
        // Hide all phases
        const phases = ['phase1', 'phase2', 'phase3a', 'phase3b', 'phase3c', 'phase4', 'phase5', 'phase6', 'phase7'];
        phases.forEach(p => {
            const el = document.getElementById(p);
            if (el) el.classList.add('hidden');
        });
        
        // Show target phase
        phase.classList.remove('hidden');
        
        // Scroll to top of phase
        phase.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Update current phase in state
        const expId = getCurrentExperimentId();
        const phaseNumber = parseInt(phaseId.replace('phase', ''));
        state.experiments[expId].currentPhase = phaseNumber;
        saveState();
    }
}

// Handle hypothesis quiz
function handleHypothesisQuiz(expId, selectedValue) {
    const feedback = document.getElementById('hypothesisFeedback');
    const continueBtn = document.getElementById('hypothesisContinueBtn');
    
    if (!feedback || !continueBtn) return;
    
    feedback.style.display = 'block';
    
    if (selectedValue === 'correct_answer') {
        feedback.style.backgroundColor = '#e8f5e9';
        feedback.style.borderLeft = '3px solid #4caf50';
        feedback.innerHTML = '<p><strong>Correct!</strong> A Hypothesis is a testable and falsifiable statement that proposes an <em>answer</em> to the research question.</p>';
        continueBtn.disabled = false;
        state.experiments[expId].hypothesisFormatCorrect = true;
    } else if (selectedValue === 'prediction_error') {
        feedback.style.backgroundColor = '#fff3e0';
        feedback.style.borderLeft = '3px solid #ff9800';
        feedback.innerHTML = '<p><strong>Not quite.</strong> That is the format for a <strong>Prediction</strong> (Phase 3c). A Hypothesis is the proposed <em>answer</em> that leads to that prediction.</p>';
        continueBtn.disabled = true;
        state.experiments[expId].hypothesisFormatCorrect = false;
    } else {
        feedback.style.backgroundColor = '#ffebee';
        feedback.style.borderLeft = '3px solid #f44336';
        feedback.innerHTML = '<p><strong>Incorrect.</strong> A hypothesis is not a known fact; it is a proposal to be tested.</p>';
        continueBtn.disabled = true;
        state.experiments[expId].hypothesisFormatCorrect = false;
    }
    
    saveState();
}

// Complete an experiment
function completeExperiment(expId) {
    const exp = state.experiments[expId];
    
    // Validate all requirements are met
    if (exp.reflectionWordCount < 50) {
        alert('Please complete your reflection in Phase 1 (minimum 50 words).');
        navigateToPhase('phase1');
        return;
    }
    
    if (!exp.curiosityResponse) {
        alert('Please answer the curiosity question in Phase 2.');
        navigateToPhase('phase2');
        return;
    }
    
    if (!exp.hypothesisFormatCorrect) {
        alert('Please correctly answer the hypothesis question in Phase 3b.');
        navigateToPhase('phase3b');
        return;
    }
    
    if (!exp.predictionChoice || !exp.predictionConfidence) {
        alert('Please make a prediction in Phase 3c.');
        navigateToPhase('phase3c');
        return;
    }
    
    if (exp.resultsReflectionWordCount < 75) {
        alert('Please complete your results reflection in Phase 5 (minimum 75 words).');
        navigateToPhase('phase5');
        return;
    }
    
    // Check experiment design
    const design = exp.experimentDesign;
    if (!design.course || !design.material || !design.change || !design.measure || !design.start || !design.eval) {
        alert('Please complete all fields in your experiment design (Phase 6).');
        navigateToPhase('phase6');
        return;
    }
    
    if (!exp.experimentCommit) {
        alert('Please commit to running your experiment by checking the box in Phase 6.');
        navigateToPhase('phase6');
        return;
    }
    
    // Mark as completed
    exp.completed = true;
    exp.completedDate = new Date().toISOString().split('T')[0];
    exp.currentPhase = 7;
    
    saveState();
    
    // Show completion phase
    navigateToPhase('phase7');
    
    // If all experiments are completed, show roadmap completion
    const completedCount = experimentOrder.filter(id => state.experiments[id].completed).length;
    if (completedCount === experimentOrder.length) {
        const roadmapLink = document.getElementById('roadmapLink');
        if (roadmapLink) {
            roadmapLink.style.display = 'inline-flex';
            roadmapLink.href = '../roadmap.html';
        }
    }
}

// ==================== VALIDATION FUNCTIONS ====================

// Update reflection word count
function updateReflectionMeta() {
    const text = document.getElementById('reflectionText');
    const meta = document.getElementById('reflectionMeta');
    
    if (!text || !meta) return 0;
    
    const words = countWords(text.value);
    meta.textContent = words;
    
    const expId = getCurrentExperimentId();
    state.experiments[expId].reflectionWordCount = words;
    return words;
}

// Update results reflection word count
function updateResultsReflectionMeta() {
    const text = document.getElementById('resultsReflection');
    const meta = document.getElementById('reflectionWordCount');
    
    if (!text || !meta) return 0;
    
    const words = countWords(text.value);
    meta.textContent = words;
    
    const expId = getCurrentExperimentId();
    state.experiments[expId].resultsReflectionWordCount = words;
    return words;
}

// Validate Phase 1 reflection input
function validateReflectionInput() {
    const words = updateReflectionMeta();
    const btn = document.getElementById('reflectionContinueBtn');
    if (btn) btn.disabled = words < 50;
}

// Validate Phase 2 curiosity inputs
function validateCuriosityInputs() {
    const response = document.querySelector('input[name="curiosityResponse"]:checked');
    const btn = document.getElementById('curiosityContinueBtn');
    if (btn) btn.disabled = !response;
}

// Validate Phase 3a RQ understanding
function validateRQUnderstanding() {
    const understanding = document.getElementById('rqUnderstanding');
    const btn = document.getElementById('rqContinueBtn');
    if (btn) btn.disabled = !understanding || !understanding.value;
}

// Validate Phase 3c prediction inputs
function validatePredictionInputs() {
    const choice = document.getElementById('predictionChoice');
    const conf = document.getElementById('predictionConfidence');
    const btn = document.getElementById('predictionContinueBtn');
    
    if (!btn) return;
    
    const hasChoice = choice && choice.value;
    const hasConf = conf && conf.value && Number(conf.value) >= 1 && Number(conf.value) <= 5;
    btn.disabled = !(hasChoice && hasConf);
}

// Validate Phase 5 results reflection
function validateResultsReflection() {
    const words = updateResultsReflectionMeta();
    const btn = document.getElementById('resultsContinueBtn');
    if (btn) btn.disabled = words < 75;
}

// Validate Phase 6 experiment design
function validateExperimentDesign() {
    const expId = getCurrentExperimentId();
    const design = state.experiments[expId].experimentDesign;
    const allFilled = design.course && design.material && design.change && design.measure && design.start && design.eval;
    const commit = document.getElementById('expCommit')?.checked || false;
    const btn = document.getElementById('commitContinueBtn');
    
    if (btn) btn.disabled = !(allFilled && commit);
}

// ==================== DASHBOARD FUNCTIONS ====================

// Initialize dashboard page
function initializeDashboardPage() {
    buildDashboardGrid();
    updateGlobalProgressUI();
    updateExperimentChips();
    setupDashboardEventListeners();
}

// Build the dashboard grid
function buildDashboardGrid() {
    const grid = document.getElementById('experimentGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    experimentOrder.forEach((expId, index) => {
        const data = window.experimentData ? window.experimentData[expId] : { 
            title: `Experiment ${index + 1}`, 
            subtitle: 'Metacognitive development' 
        };
        const exp = state.experiments[expId];
        const status = getExperimentStatus(expId);
        const progress = getExperimentProgress(expId);
        
        const card = document.createElement('section');
        card.className = 'card';
        card.innerHTML = `
            <h2>${data.title}</h2>
            <p style="color: var(--muted); font-style: italic; font-size: 0.95rem; margin-bottom: 0.5rem;">${data.subtitle}</p>
            <p style="font-size: 0.8rem; margin-bottom: 0.5rem;"><strong>Step ${index + 1}/10</strong> in metacognitive development</p>
            <div class="progress-track" style="height: 4px; background: var(--progress-track); border-radius: 2px; margin: 0.5rem 0;">
                <div class="progress-bar" style="height: 100%; width: ${progress}%; background: var(--progress-bar); border-radius: 2px; transition: width 0.3s ease;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.5rem;">
                <span class="chip" id="chip-${expId}">${status === 'completed' ? 'Completed' : `${progress}% complete`}</span>
                <a href="experiments/${index + 1}-${expId}.html" class="btn btn-sm btn-secondary">${exp.completed ? 'Review' : 'Open'}</a>
            </div>
        `;
        
        if (exp.completed) {
            card.querySelector('.chip').classList.add('completed');
        }
        
        grid.appendChild(card);
    });
}

// Set up dashboard event listeners
function setupDashboardEventListeners() {
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // Reset button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAllData);
    }
    
    // Roadmap button
    const roadmapBtn = document.getElementById('roadmapBtn');
    if (roadmapBtn) {
        roadmapBtn.addEventListener('click', function() {
            const completedCount = experimentOrder.filter(id => state.experiments[id].completed).length;
            if (completedCount === experimentOrder.length) {
                window.location.href = 'roadmap.html';
            } else {
                alert(`Complete all ${experimentOrder.length} experiments to unlock your personalized roadmap. Currently: ${completedCount}/${experimentOrder.length}`);
            }
        });
    }
}

// ==================== LANDING PAGE FUNCTIONS ====================

// Initialize landing page
function initializeLandingPage() {
    const startBtn = document.getElementById('startJourneyBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
}

// ==================== ROADMAP PAGE FUNCTIONS ====================

// Initialize roadmap page
function initializeRoadmapPage() {
    updateGlobalProgressUI();
    
    const completedCount = experimentOrder.filter(id => state.experiments[id].completed).length;
    const roadmapContent = document.querySelector('#view-roadmap .observation-box');
    
    if (!roadmapContent) return;
    
    if (completedCount === experimentOrder.length) {
        roadmapContent.innerHTML = `
            <h3>Your Personalized PreMed Study Roadmap</h3>
            <p>Congratulations! You've completed all ${experimentOrder.length} metacognitive experiments.</p>
            <p>Your personalized roadmap is being generated based on your reflections and experiment designs.</p>
            <p><strong>Key insights from your journey:</strong></p>
            <ul>
                <li>You've learned to monitor your own learning (metacognitive awareness)</li>
                <li>You understand the science behind effective study strategies</li>
                <li>You've committed to specific changes in your study habits</li>
            </ul>
            <div style="margin-top: 2rem; padding: 1rem; background: #f0f9f0; border-radius: 0.5rem;">
                <h4>Your Top 3 Evidence-Based Strategies:</h4>
                <p>Based on your experiment results, these strategies showed the strongest impact:</p>
                <ol>
                    <li><strong>Active Recall</strong> - Testing yourself instead of rereading</li>
                    <li><strong>Spaced Practice</strong> - Distributing study sessions over time</li>
                    <li><strong>Interleaving</strong> - Mixing different types of problems</li>
                </ol>
            </div>
            <div style="margin-top: 1rem;">
                <button class="btn btn-primary" id="downloadRoadmapBtn" style="margin-right: 0.5rem;">Download Roadmap PDF</button>
                <a href="dashboard.html" class="btn btn-secondary">Return to Dashboard</a>
            </div>
        `;
        
        const downloadBtn = document.getElementById('downloadRoadmapBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', generateRoadmapPDF);
        }
    } else {
        roadmapContent.innerHTML = `
            <h3>Roadmap Locked</h3>
            <p>Complete all metacognitive experiments to unlock your personalized PreMed learning strategy roadmap.</p>
            <p><strong>Progress:</strong> ${completedCount}/${experimentOrder.length} experiments completed</p>
            <a href="dashboard.html" class="btn btn-primary" style="margin-top: 1rem;">Return to Experiments</a>
        `;
    }
}

// Generate roadmap PDF (placeholder)
function generateRoadmapPDF() {
    alert('Roadmap PDF generation would be implemented here. In a production environment, this would generate a personalized PDF based on the user\'s experiment results.');
    // This would typically call a backend service or use a frontend PDF library
}

// ==================== EXPORT FUNCTION ====================

// Export all data
function exportData() {
    let text = 'Metacognition Discovery Lab -- UW-Parkside PreMed\n';
    text += '='.repeat(80) + '\n\n';
    text += 'Export Date: ' + new Date().toLocaleDateString() + '\n';
    text += 'Completed Experiments: ' + experimentOrder.filter(id => state.experiments[id].completed).length + '/10\n\n';
    
    experimentOrder.forEach(expId => {
        const exp = state.experiments[expId];
        const data = window.experimentData ? window.experimentData[expId] : { title: `Experiment ${getExperimentIndex(expId) + 1}` };
        
        text += data.title.toUpperCase() + '\n';
        text += '-'.repeat(80) + '\n';
        
        // Phase 1 Reflection
        text += 'PERSONAL REFLECTION:\n';
        text += (exp.personalReflection || '[Not completed]') + '\n\n';
        
        // Phase 2 Curiosity
        text += 'CURIOSITY RESPONSE: ';
        text += (exp.curiosityResponse ? exp.curiosityResponse.toUpperCase() : '[Not completed]');
        if (exp.curiosityExplanation) {
            text += '\nExplanation: ' + exp.curiosityExplanation;
        }
        text += '\n\n';
        
        // Phase 3 Prediction
        text += 'PREDICTION: ' + (exp.predictionChoice || '[Not made]');
        text += ' | Confidence: ' + (exp.predictionConfidence || '[N/A]') + '/5\n\n';
        
        // Phase 5 Results Reflection
        if (exp.resultsReflection) {
            text += 'RESULTS REFLECTION:\n';
            text += exp.resultsReflection + '\n\n';
        }
        
        // Phase 6 Experiment Design
        text += 'PERSONAL EXPERIMENT DESIGN:\n';
        text += 'Course: ' + (exp.experimentDesign.course || '[Not set]') + '\n';
        text += 'Material: ' + (exp.experimentDesign.material || '[Not set]') + '\n';
        text += 'Change: ' + (exp.experimentDesign.change || '[Not set]') + '\n';
        text += 'Success Measure: ' + (exp.experimentDesign.measure || '[Not set]') + '\n';
        text += 'Start: ' + (exp.experimentDesign.start || '[Not set]') + ' | Evaluate: ' + (exp.experimentDesign.eval || '[Not set]') + '\n';
        text += 'Commitment: ' + (exp.experimentCommit ? 'Yes' : 'No') + '\n';
        
        text += 'Completed: ' + (exp.completed ? 'Yes (' + exp.completedDate + ')' : 'No') + '\n\n\n';
    });
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metacognition-discovery-lab-export.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==================== CHART FUNCTIONS ====================

let currentChartInstance = null;

// Render chart based on experiment type
function renderChart() {
    const ctx = document.getElementById('resultsChart')?.getContext('2d');
    if (!ctx) return;
    
    if (currentChartInstance) currentChartInstance.destroy();
    
    const expId = getCurrentExperimentId();
    const data = window.experimentData ? window.experimentData[expId] : null;
    if (!data) return;
    
    const chartType = data.chartType || 'bar';
    
    // Chart configurations based on experiment type
    const configs = {
        calibration: {
            type: 'bar',
            data: {
                labels: ['No Tracking', 'With Tracking'],
                datasets: [{
                    label: 'Average Grade',
                    data: [72, 79],
                    backgroundColor: ['#cbd5e1', '#016836'],
                    borderColor: ['#4b5563', '#00502f'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Impact of Calibration Awareness' }
                },
                scales: {
                    y: { beginAtZero: true, max: 100, title: { display: true, text: 'Grade (%)' } }
                }
            }
        },
        activerecall: {
            type: 'bar',
            data: {
                labels: ['Repeated Reading', 'Retrieval Practice'],
                datasets: [{
                    label: 'Retention (%)',
                    data: [40, 80],
                    backgroundColor: ['#cbd5e1', '#016836'],
                    borderColor: ['#4b5563', '#00502f'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Retention Performance 1 Week Later' }
                },
                scales: {
                    y: { beginAtZero: true, max: 100, title: { display: true, text: 'Retention (%)' } }
                }
            }
        },
        spacing: {
            type: 'bar',
            data: {
                labels: ['Massed', 'Spaced', 'Spaced + Retrieval'],
                datasets: [{
                    label: 'Delayed Retention (%)',
                    data: [67, 74, 86],
                    backgroundColor: ['#94a3b8', '#4b7c4c', '#016836'],
                    borderColor: ['#4b5563', '#00502f', '#00502f'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Retention 1-4 Weeks After Study' }
                },
                scales: {
                    y: { beginAtZero: true, max: 100, title: { display: true, text: 'Retention (%)' } }
                }
            }
        }
    };
    
    const config = configs[chartType] || configs.calibration;
    currentChartInstance = new Chart(ctx, config);
}

// ==================== PAGE INITIALIZATION ====================

// Initialize appropriate page based on current URL/path
function initializePage() {
    const path = window.location.pathname;
    
    // Load experiment data if available
    if (typeof window.experimentData === 'undefined') {
        console.warn('experimentData not found. Make sure data.js is loaded before logic.js');
    }
    
    // Determine page type and initialize
    if (path.includes('experiments/') || document.querySelector('#phase1')) {
        // Experiment page
        initializeExperimentPage();
        
        // Render chart when phase 5 is shown
        const phase5Btn = document.getElementById('designContinueBtn');
        if (phase5Btn) {
            phase5Btn.addEventListener('click', renderChart);
        }
        
        // Also render chart if we're already on phase 5
        if (document.getElementById('phase5') && !document.getElementById('phase5').classList.contains('hidden')) {
            setTimeout(renderChart, 100); // Small delay to ensure DOM is ready
        }
    } else if (path.includes('dashboard.html') || document.querySelector('#experimentGrid')) {
        // Dashboard page
        initializeDashboardPage();
    } else if (path.includes('roadmap.html') || document.querySelector('#view-roadmap')) {
        // Roadmap page
        initializeRoadmapPage();
    } else if (path.includes('index.html') || document.querySelector('#view-landing')) {
        // Landing page
        initializeLandingPage();
    }
    
    // Always update global progress UI
    updateGlobalProgressUI();
    
    // Set up mobile menu if exists
    setupMobileMenu();
}

// Set up mobile navigation menu
function setupMobileMenu() {
    const toggleBtn = document.querySelector('.bios-toggle');
    const menus = document.getElementById('biosMenus');
    
    if (toggleBtn && menus) {
        toggleBtn.addEventListener('click', function() {
            menus.classList.toggle('open');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.bios-nav')) {
                menus.classList.remove('open');
            }
        });
    }
}

// ==================== INITIALIZE ON LOAD ====================

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

// Make functions available globally if needed
window.metacognitionLab = {
    state,
    saveState,
    resetAllData,
    exportData,
    getCurrentExperimentId,
    getExperimentStatus,
    getExperimentProgress,
    updateGlobalProgressUI
};