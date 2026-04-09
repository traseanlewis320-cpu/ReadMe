/**
 * Literacy Leap - AI Reading Coach Logic
 * Level 1: Sight words, simple sentences.
 * Level 2: Compound words, multi-word phrases.
 * Level 3: Paragraphs, descriptive language.
 * Level 4: Complex vocabulary, plot progression.
 */

const stories = [
    { 
        id: 1, 
        level: 1, 
        title: "The Cat", 
        text: "The cat sat on the mat. The cat is fat. The cat is black. I love the cat.",
        frameworks: { step: "Step 1", fp: "A-C", r2r: "Pre-Level 1" }
    },
    { 
        id: 2, 
        level: 1, 
        title: "My Red Pen", 
        text: "I have a red pen. The red pen is on the bed. I like to write with my red pen.",
        frameworks: { step: "Step 1", fp: "A-C", r2r: "Pre-Level 1" }
    },
    { 
        id: 3, 
        level: 2, 
        title: "The Big Jump", 
        text: "The green frog wanted to jump over the big blue pond. He took a deep breath and jumped as high as he could. Splash! He landed in the water.",
        frameworks: { step: "Step 2", fp: "D-G", r2r: "Level 1" }
    },
    { 
        id: 4, 
        level: 2, 
        title: "Lost Mittens", 
        text: "Nikki lost her white mittens in the snow. Her mother told her to look by the tall pine tree. She found them near the wooden bench.",
        frameworks: { step: "Step 2", fp: "D-G", r2r: "Level 1" }
    },
    { 
        id: 5, 
        level: 3, 
        title: "The Brave Knight", 
        text: "In a distant kingdom, a brave knight stood guard at the stone castle. He wore shiny armor that shimmered in the morning sun. Many people traveled from very far to see the golden flags flying from the highest towers.",
        frameworks: { step: "Step 3", fp: "H-M", r2r: "Level 2" }
    },
    { 
        id: 6, 
        level: 4, 
        title: "The Secret Garden", 
        text: "Deep within the ancient forest, there was a garden that nobody had visited for nearly a hundred years. The iron gate was covered in thick green vines and beautiful purple flowers. Somewhere hidden beneath the soil, a tiny silver key waited for someone to find it.",
        frameworks: { step: "Step 4", fp: "N-Q", r2r: "Level 3" }
    },
    { 
        id: 7, 
        level: 5, 
        title: "Ocean Wonders", 
        text: "The vast ocean is home to creatures that are far more mysterious than anything on the land. Giant whales migrate thousands of miles across cold and currents. Colorful coral reefs provide shelter for tiny fish while the deep trenches remain largely unexplored by human divers.",
        frameworks: { step: "Step 4", fp: "Q-R", r2r: "Level 3" }
    },
    { 
        id: 8, 
        level: 6, 
        title: "The Steam Engine", 
        text: "During the Industrial Revolution, the steam engine changed how people moved and worked. It allowed trains to carry heavy goods across long distances much faster than horses could. Factories no longer needed to be by rivers because they could use steam power instead of water wheels.",
        frameworks: { step: "Step 5", fp: "S-T", r2r: "Advanced" }
    },
    { 
        id: 9, 
        level: 7, 
        title: "Galactic Journey", 
        text: "A narrow beam of light pierced the darkness of the spaceship cockpit as it approached the rings of Saturn. Captain Orion adjusted the steering while the crew prepared the landing gear. They were looking for signs of frozen water on the surface of the moon Enceladus.",
        frameworks: { step: "Advanced", fp: "U-V", r2r: "Expert" }
    },
    { 
        id: 10, 
        level: 8, 
        title: "The Renaissance", 
        text: "The Renaissance was a period of incredible artistic and scientific discovery in Europe. Artists like Da Vinci studied anatomy to make their paintings realistic, while astronomers like Galileo looked through telescopes to understand the stars. This era bridged the gap between the middle ages and modern times.",
        frameworks: { step: "Advanced", fp: "W-X", r2r: "Expert" }
    },
    { 
        id: 11, 
        level: 9, 
        title: "Metamorphosis", 
        text: "Biological metamorphosis is the dramatic process by which an animal physically develops after birth or hatching. A caterpillar consumes vast amounts of leaves before spinning a protective cocoon. Inside this silken shell, its body completely reorganizes until a butterfly eventually emerges with delicate wings.",
        frameworks: { step: "High", fp: "Y-Z", r2r: "Science" }
    },
    { 
        id: 12, 
        level: 10, 
        title: "Classical Wisdom", 
        text: "Philosophy encourages us to question the nature of existence and the structure of our societies. Ancient thinkers debated concepts of justice, virtue, and logic in the public squares of Athens. Their profound observations continue to influence modern legal systems and individual moral frameworks today.",
        frameworks: { step: "Expert", fp: "Z+", r2r: "Classical" }
    }
];

// Application State
// Application State with Persistence
let appState = JSON.parse(localStorage.getItem('reading-app-state')) || {
    currentLevel: 1,
    currentXP: 0,
    completedStories: [], // List of completed story IDs
    activeStory: null,
    isRecording: false,
    startTime: null,
    endTime: null,
    recognition: null,
    sessions: []
};

function saveState() {
    localStorage.setItem('reading-app-state', JSON.stringify(appState));
}

// UI Elements
const selectionScreen = document.getElementById('selection-screen');
const readerScreen = document.getElementById('reader-screen');
const resultsScreen = document.getElementById('results-screen');
const storyGrid = document.getElementById('story-grid');
const recordBtn = document.getElementById('record-btn');
const textDisplay = document.getElementById('text-display');
const liveFeedback = document.getElementById('live-feedback');

const accuracyVal = document.getElementById('accuracy-val');
const accuracyPath = document.getElementById('accuracy-path');
const timeVal = document.getElementById('time-elapsed-val');
const mistakesSection = document.getElementById('mistakes-section');
const mistakesList = document.getElementById('mistakes-list');

// Initialize App
function init() {
    renderStorySelection();
    setupSpeechRecognition();
    updateUIHeader();
}

// Render Story Cards
function renderStorySelection() {
    storyGrid.innerHTML = '';
    
    // Group stories by level to handle sequential unlocking logic
    const levelGroups = {};
    stories.forEach(s => {
        if (!levelGroups[s.level]) levelGroups[s.level] = [];
        levelGroups[s.level].push(s);
    });

    // We sort stories globally primarily by level
    const sortedStories = [...stories].sort((a, b) => a.level - b.level);

    sortedStories.forEach(story => {
        const isCompleted = appState.completedStories.includes(story.id);
        const levelStories = levelGroups[story.level];
        const storyIndex = levelStories.findIndex(s => s.id === story.id);
        
        let isLocked = false;
        
        // Locked if level is too high
        if (story.level > appState.currentLevel) {
            isLocked = true;
        } 
        // Or if it's the current level but previous book isn't done
        else if (story.level === appState.currentLevel && storyIndex > 0) {
            const prevStory = levelStories[storyIndex - 1];
            if (!appState.completedStories.includes(prevStory.id)) {
                isLocked = true;
            }
        }

        const card = document.createElement('div');
        card.className = `story-card ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`;
        if(isLocked) card.style.opacity = '0.5';

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span class="badge level-${story.level}">Level ${story.level}</span>
                ${isCompleted ? '<span class="complete-check">✓</span>' : ''}
            </div>
            <h3 class="card-title">${story.title}</h3>
            <p style="font-size: 0.85rem; color: #636e72;">
                ${story.frameworks.step} • ${story.frameworks.fp} • ${story.frameworks.r2r}
            </p>
            <button class="btn-secondary" style="margin-top: auto; width: 100%;" ${isLocked ? 'disabled' : ''}>
                ${isLocked ? 'Locked' : (isCompleted ? 'Read Again' : 'Start Reading')}
            </button>
        `;

        if (!isLocked) {
            card.addEventListener('click', () => startReading(story));
        }
        storyGrid.appendChild(card);
    });
}

// Start Reading Logic
function startReading(story) {
    appState.activeStory = story;
    selectionScreen.classList.add('hidden');
    readerScreen.classList.remove('hidden');
    resultsScreen.classList.add('hidden');

    document.getElementById('active-book-title').textContent = story.title;
    document.getElementById('level-badge').textContent = `Level ${story.level}`;
    document.getElementById('level-badge').className = `badge level-${story.level}`;
    
    // Initial text display with word-level speech trigger
    textDisplay.innerHTML = story.text.split(' ').map(word => `<span class="read-word">${word}</span>`).join(' ');
    
    // Add interaction to each word
    document.querySelectorAll('.read-word').forEach(span => {
        span.addEventListener('click', (e) => {
            speakWord(e.target.textContent);
            e.target.style.color = 'var(--primary)';
            setTimeout(() => e.target.style.color = '', 600);
        });
    });
}

function speakWord(word) {
    const utterance = new SpeechSynthesisUtterance(word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,""));
    utterance.rate = 0.8; // Slower for learning
    utterance.pitch = 1.1; 
    window.speechSynthesis.speak(utterance);
}

// Speech Recognition Setup
function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        appState.recognition = new SpeechRecognition();
        appState.recognition.continuous = true;
        appState.recognition.interimResults = true;
        appState.recognition.lang = 'en-US';

        appState.recognition.onstart = () => {
            appState.isRecording = true;
            appState.startTime = Date.now();
            updateRecordBtnUI();
            liveFeedback.classList.remove('hidden');
        };

        appState.recognition.onend = () => {
            appState.isRecording = false;
            updateRecordBtnUI();
            liveFeedback.classList.add('hidden');
        };

        appState.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join(' ').toLowerCase();
            
            // Optional: You could do real-time highlighting here
            // For this version, we'll wait for the completion to analyze fully
        };

        appState.recognition.onerror = (err) => {
            console.error("Speech Error:", err);
            stopReading();
        };

        // Improved Analysis Method - moved inside setup
        appState.recognition.addEventListener('result', (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            
            if (finalTranscript) {
                appState.lastTranscript = (appState.lastTranscript || "") + " " + finalTranscript;
            }
        });

    } else {
        alert("This browser does not support speech recognition. Please try Chrome or Edge.");
    }
}

function updateRecordBtnUI() {
    const recordText = recordBtn.querySelector('.record-text');
    if (appState.isRecording) {
        recordBtn.classList.add('recording');
        recordText.textContent = "Stop (Finish)";
    } else {
        recordBtn.classList.remove('recording');
        recordText.textContent = "Start Reading";
    }
}

recordBtn.addEventListener('click', () => {
    if (!appState.isRecording) {
        appState.recognition.start();
    } else {
        stopReading();
    }
});

function stopReading() {
    appState.endTime = Date.now();
    appState.recognition.stop();
    
    // Web Speech API result can arrive after stop, so we use a small delay or event handling
    // For reliable results, we'll gather the final transcript from the results collection
    // and analyze.
    
    setTimeout(() => {
        const transcript = Array.from(appState.recognition.finalTranscript || "")
            .join(' ').toLowerCase();
        
        // Wait for final result then analyze
        // In many cases, we have to handle the onresult event as the source of truth
    }, 500);
}


function stopReading() {
    appState.endTime = Date.now();
    appState.recognition.stop();
    
    // Short grace period to collect final chunks
    setTimeout(() => {
        analyzeReading(appState.lastTranscript || "");
        appState.lastTranscript = ""; // Clear for next round
    }, 800);
}

function analyzeReading(spokenText) {
    if (!spokenText.trim()) {
        alert("We didn't hear much! Try reading out loud closer to the mic.");
        return;
    }

    const originalText = appState.activeStory.text;
    // Normalize: remove punctuation and extra whitespace
    const cleanOriginal = originalText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    const originalWords = cleanOriginal.trim().split(/\s+/);
    // FIX: Normalize spoken text by removing punctuation as well
    const cleanSpoken = spokenText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    const spokenWords = cleanSpoken.trim().split(/\s+/);
    
    let correctCount = 0;
    let mistakes = [];
    let spokenPtr = 0;

    /**
     * Sequential Alignment Algorithm:
     * We iterate through the original words and try to find a match in the 
     * spoken stream, respecting order and allowing for a small window of 
     * missed or repeated words.
     */
    originalWords.forEach((word) => {
        let found = false;
        // Look ahead in spoken text to find the current original word
        // Window size of 4 words allows for slight stumbles or restarts
        const searchWindow = 4; 
        
        for (let i = spokenPtr; i < Math.min(spokenPtr + searchWindow, spokenWords.length); i++) {
            if (spokenWords[i] === word) {
                found = true;
                spokenPtr = i + 1; // Advance pointer to after this match
                break;
            }
        }

        if (found) {
            correctCount++;
        } else {
            mistakes.push(word);
            // Don't advance spokenPtr on mistake, wait for the next original word to match
        }
    });

    // Accuracy is now strictly sequence-based
    const accuracy = (correctCount / originalWords.length) * 100;
    const duration = ((appState.endTime - appState.startTime) / 1000).toFixed(1);

    showResults(accuracy, duration, mistakes);
}

const earnedBadges = new Set();
const badgeIcons = {
    perfect: "🌟",
    levelUp: "🏆",
    fast: "⚡",
    reader: "📚"
};

function showResults(accuracy, time, mistakes) {
    // Highlight text display with feedback
    const originalWords = appState.activeStory.text.split(' ');
    textDisplay.innerHTML = originalWords.map(word => {
        const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        const isCorrect = !mistakes.includes(cleanWord);
        return `<span class="${isCorrect ? 'correct' : 'mistake'}">${word}</span>`;
    }).join(' ');

    // Show results after a short inspection period
    setTimeout(() => {
        readerScreen.classList.add('hidden');
        resultsScreen.classList.remove('hidden');

        // Animate Circle
        const circlePercent = accuracy.toFixed(0);
        accuracyVal.textContent = `${circlePercent}%`;
        accuracyPath.setAttribute('stroke-dasharray', `${circlePercent}, 100`);

        timeVal.textContent = `${time}s`;

        // Process Mistakes
        const toggleBtn = document.getElementById('toggle-mistakes-btn');
        if (mistakes.length > 0) {
            mistakesList.innerHTML = [...new Set(mistakes)].map(m => `<span class="word-tag">${m}</span>`).join('');
            toggleBtn.classList.remove('hidden');
        } else {
            mistakesSection.classList.add('hidden');
            toggleBtn.classList.add('hidden');
            if (accuracy >= 95) {
                triggerConfetti();
                addBadge('perfect');
                celebrateMascot();
            }
        }

        // 90% Accuracy Requirement to mark complete
        if (accuracy >= 90) {
            // Mark as completed if not already
            if (!appState.completedStories.includes(appState.activeStory.id)) {
                appState.completedStories.push(appState.activeStory.id);
            }
            
            // Only show Next Book button if 90%+ reached
            document.getElementById('next-book-btn').classList.remove('hidden');
            
            // New XP Logic: Accuracy ÷ 10
            appState.currentXP += (accuracy / 10);
            
            // Check if Level is fully completed to unlock next level
            const currentLevelStories = stories.filter(s => s.level === appState.currentLevel);
            const allStoriesDone = currentLevelStories.every(s => appState.completedStories.includes(s.id));
            
            if (allStoriesDone) {
                const nextLevel = appState.currentLevel + 1;
                if (nextLevel <= 10) {
                    appState.currentLevel = nextLevel;
                    // Reset XP on level up or keep it? User said "XP still = Accuracy ÷ 10", 
                    // which usually implies cumulative, but I'll add a level up toast.
                    showLevelUpToast(nextLevel);
                }
            }
            
            saveState();
        } else {
            // Accuracy < 90% - Cannot progress to next book yet
            document.getElementById('next-book-btn').classList.add('hidden');
        }
        updateUIHeader();
    }, 1200);
}

function triggerConfetti() {
    // Simple pure CSS/JS burst
    const container = document.querySelector('.confetti-container');
    container.innerHTML = '';
    for(let i=0; i<50; i++) {
        const p = document.createElement('div');
        p.style.cssText = `
            position: absolute;
            width: 10px; height: 10px;
            background: hsl(${Math.random()*360}, 100%, 50%);
            left: ${Math.random()*100}%; top: 100%;
            border-radius: 50%;
            animation: burst 1s ease-out forwards;
        `;
        container.appendChild(p);
    }
}

function showLevelUpToast(level) {
    const levelDisplay = document.createElement('div');
    levelDisplay.className = 'feedback-toast';
    levelDisplay.style.background = 'var(--success)';
    levelDisplay.innerHTML = `<h3>Level Up! Now Level ${level} 🚀</h3>`;
    document.body.appendChild(levelDisplay);
    setTimeout(() => levelDisplay.remove(), 4000);
    triggerConfetti();
}

function updateUIHeader() {
    document.getElementById('current-level').textContent = appState.currentLevel;
    
    // Cap XP display at 100% or show total? Requirement says XP = Accuracy / 10.
    // We'll treat XP as progress towards 100 or just a score.
    // For the UI bar, we'll use XP % 100 to show some movement.
    const displayXP = Math.floor(appState.currentXP);
    document.getElementById('xp-text').textContent = `${displayXP} XP`;
    document.querySelector('.xp-bar-fill').style.width = `${displayXP % 101}%`;
}

function addBadge(type) {
    if (earnedBadges.has(type)) return;
    earnedBadges.add(type);
    
    document.getElementById('badges-container').classList.remove('hidden');
    const badgeRow = document.getElementById('badges-list');
    const badge = document.createElement('div');
    badge.className = 'badge-item';
    badge.textContent = badgeIcons[type];
    badge.title = type.charAt(0).toUpperCase() + type.slice(1) + " Achievement!";
    badgeRow.appendChild(badge);
}

function celebrateMascot() {
    const mascot = document.querySelector('.rocket-mascot');
    mascot.classList.add('success-glow');
    setTimeout(() => mascot.classList.remove('success-glow'), 3000);
}

// Toggle Mistakes Section
document.getElementById('toggle-mistakes-btn').addEventListener('click', (e) => {
    const mistakesSection = document.getElementById('mistakes-container');
    const isHidden = mistakesSection.classList.toggle('hidden');
    e.target.textContent = isHidden ? "View Detailed Report" : "Hide Detailed Report";
});

// Navigation Events
document.getElementById('back-to-menu').addEventListener('click', () => {
    readerScreen.classList.add('hidden');
    selectionScreen.classList.remove('hidden');
    renderStorySelection();
});

document.getElementById('retry-btn').addEventListener('click', () => {
    startReading(appState.activeStory);
});

document.getElementById('next-book-btn').addEventListener('click', () => {
    resultsScreen.classList.add('hidden');
    selectionScreen.classList.remove('hidden');
    renderStorySelection();
});

/**
 * AIAssistant - Developer Diagnostic Tool
 */
class AIAssistant {
    constructor() {
        this.trigger = document.getElementById('ai-buddy-trigger');
        this.panel = document.getElementById('ai-buddy-panel');
        this.closeBtn = document.getElementById('close-ai');
        this.statusText = document.getElementById('ai-scan-text');
        this.setupListeners();
    }

    setupListeners() {
        this.trigger.onclick = () => {
            this.panel.classList.toggle('hidden');
            if (!this.panel.classList.contains('hidden')) this.runDiagnostics();
        };
        this.closeBtn.onclick = () => this.panel.classList.add('hidden');

        document.getElementById('sim-100-btn').onclick = () => this.simulateReading(100);
        document.getElementById('sim-50-btn').onclick = () => this.simulateReading(50);
        document.getElementById('reset-progress-btn').onclick = () => this.resetLevelProgress();
    }

    runDiagnostics() {
        this.statusText.textContent = "Analyzing app state...";
        setTimeout(() => {
            const completedCount = appState.completedStories.length;
            this.statusText.textContent = `All systems check. Level ${appState.currentLevel} active. ${completedCount} books completed.`;
        }, 800);
    }

    simulateReading(accuracy) {
        if (!appState.activeStory) return alert("Select a book first!");
        this.panel.classList.add('hidden');
        
        // Use a mock transcript that matches the book to get 100 or 50%
        let mockText = "";
        if (accuracy >= 90) {
            mockText = appState.activeStory.text;
        } else {
            mockText = appState.activeStory.text.split(' ').slice(0, Math.floor(appState.activeStory.text.split(' ').length / 2)).join(' ');
        }
        
        appState.startTime = Date.now();
        appState.endTime = Date.now() + 5000;
        
        analyzeReading(mockText);
    }

    resetLevelProgress() {
        if (confirm("Reset all progress? This cannot be undone.")) {
            localStorage.removeItem('reading-app-state');
            location.reload();
        }
    }
}

// Run Init
window.addEventListener('DOMContentLoaded', () => {
    init();
    window.aiAssistant = new AIAssistant();
});
