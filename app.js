/**
 * Literacy Leap - AI Reading Coach Logic
 */

const stories = [
    { id: 1, level: 1, title: "The Cat", text: "The cat sat on the mat. The cat is fat. The cat is black. I love the cat.", frameworks: { step: "Step 1", fp: "A-C", r2r: "Pre-Level 1" } },
    { id: 2, level: 1, title: "My Red Pen", text: "I have a red pen. The red pen is on the bed. I like to write with my red pen.", frameworks: { step: "Step 1", fp: "A-C", r2r: "Pre-Level 1" } },
    { id: 3, level: 2, title: "The Big Jump", text: "The green frog wanted to jump over the big blue pond. He took a deep breath and jumped as high as he could. Splash! He landed in the water.", frameworks: { step: "Step 2", fp: "D-G", r2r: "Level 1" } },
    { id: 4, level: 2, title: "Lost Mittens", text: "Nikki lost her white mittens in the snow. Her mother told her to look by the tall pine tree. She found them near the wooden bench.", frameworks: { step: "Step 2", fp: "D-G", r2r: "Level 1" } },
    { id: 5, level: 3, title: "The Brave Knight", text: "In a distant kingdom, a brave knight stood guard at the stone castle. He wore shiny armor that shimmered in the morning sun. Many people traveled from very far to see the golden flags flying from the highest towers.", frameworks: { step: "Step 3", fp: "H-M", r2r: "Level 2" } },
    { id: 6, level: 4, title: "The Secret Garden", text: "Deep within the ancient forest, there was a garden that nobody had visited for nearly a hundred years. The iron gate was covered in thick green vines and beautiful purple flowers. Somewhere hidden beneath the soil, a tiny silver key waited for someone to find it.", frameworks: { step: "Step 4", fp: "N-Q", r2r: "Level 3" } },
    { id: 7, level: 5, title: "Ocean Wonders", text: "The vast ocean is home to creatures that are far more mysterious than anything on the land. Giant whales migrate thousands of miles across cold and currents. Colorful coral reefs provide shelter for tiny fish while the deep trenches remain largely unexplored by human divers.", frameworks: { step: "Step 4", fp: "Q-R", r2r: "Level 3" } },
    { id: 8, level: 6, title: "The Steam Engine", text: "During the Industrial Revolution, the steam engine changed how people moved and worked. It allowed trains to carry heavy goods across long distances much faster than horses could. Factories no longer needed to be by rivers because they could use steam power instead of water wheels.", frameworks: { step: "Step 5", fp: "S-T", r2r: "Advanced" } },
    { id: 9, level: 7, title: "Galactic Journey", text: "A narrow beam of light pierced the darkness of the spaceship cockpit as it approached the rings of Saturn. Captain Orion adjusted the steering while the crew prepared the landing gear. They were looking for signs of frozen water on the surface of the moon Enceladus.", frameworks: { step: "Advanced", fp: "U-V", r2r: "Expert" } },
    { id: 10, level: 8, title: "The Renaissance", text: "The Renaissance was a period of incredible artistic and scientific discovery in Europe. Artists like Da Vinci studied anatomy to make their paintings realistic, while astronomers like Galileo looked through telescopes to understand the stars. This era bridged the gap between the middle ages and modern times.", frameworks: { step: "Advanced", fp: "W-X", r2r: "Expert" } },
    { id: 11, level: 9, title: "Metamorphosis", text: "Biological metamorphosis is the dramatic process by which an animal physically develops after birth or hatching. A caterpillar consumes vast amounts of leaves before spinning a protective cocoon. Inside this silken shell, its body completely reorganizes until a butterfly eventually emerges with delicate wings.", frameworks: { step: "High", fp: "Y-Z", r2r: "Science" } },
    { id: 12, level: 10, title: "Classical Wisdom", text: "Philosophy encourages us to question the nature of existence and the structure of our societies. Ancient thinkers debated concepts of justice, virtue, and logic in the public squares of Athens. Their profound observations continue to influence modern legal systems and individual moral frameworks today.", frameworks: { step: "Expert", fp: "Z+", r2r: "Classical" } }
];

// Application State
let appState = {
    currentLevel: 1,
    currentXP: 0,
    activeStory: null,
    isRecording: false,
    startTime: null,
    endTime: null,
    recognition: null,
    lastTranscript: "",
    sessions: []
};

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

const earnedBadges = new Set();
const badgeIcons = { perfect: "🌟", levelUp: "🏆", fast: "⚡", reader: "📚" };

// Initialize App
function init() {
    renderStorySelection();
    setupSpeechRecognition();
    updateUIHeader();
}

// Render Story Cards
function renderStorySelection() {
    storyGrid.innerHTML = '';
    
    const sortedStories = [...stories].sort((a, b) => {
        if(a.level === appState.currentLevel) return -1;
        if(b.level === appState.currentLevel) return 1;
        return a.level - b.level;
    });

    sortedStories.forEach(story => {
        const isLocked = story.level > appState.currentLevel;
        const card = document.createElement('div');
        card.className = `story-card ${isLocked ? 'locked' : ''}`;
        if(isLocked) card.style.opacity = '0.5';

        card.innerHTML = `
            <span class="badge level-${story.level}">Level ${story.level}</span>
            <h3 class="card-title">${story.title}</h3>
            <p style="font-size: 0.85rem; color: #636e72;">
                ${story.frameworks.step} • ${story.frameworks.fp} • ${story.frameworks.r2r}
            </p>
            <button class="btn-secondary" style="margin-top: auto; width: 100%;" ${isLocked ? 'disabled' : ''}>
                ${isLocked ? 'Locked' : 'Start Reading'}
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
    appState.lastTranscript = ""; 
    selectionScreen.classList.add('hidden');
    readerScreen.classList.remove('hidden');
    resultsScreen.classList.add('hidden');

    document.getElementById('active-book-title').textContent = story.title;
    const badge = document.getElementById('level-badge');
    badge.textContent = `Level ${story.level}`;
    badge.className = `badge level-${story.level}`;
    
    textDisplay.innerHTML = story.text.split(' ').map(word => `<span class="read-word">${word}</span>`).join(' ');
    
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
    utterance.rate = 0.8;
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
            let finalTranscriptChunk = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscriptChunk += event.results[i][0].transcript;
                }
            }
            if (finalTranscriptChunk) {
                appState.lastTranscript += " " + finalTranscriptChunk;
            }
        };

        appState.recognition.onerror = (err) => {
            console.error("Speech Error:", err);
            stopReading();
        };

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
    
    setTimeout(() => {
        analyzeReading(appState.lastTranscript.trim());
    }, 800);
}

function analyzeReading(spokenText) {
    if (!spokenText) {
        alert("We didn't hear much! Try reading out loud closer to the mic.");
        return;
    }

    const originalText = appState.activeStory.text;
    const cleanOriginal = originalText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    const originalWords = cleanOriginal.trim().split(/\s+/);
    const spokenWords = spokenText.toLowerCase().trim().split(/\s+/);
    
    let correctCount = 0;
    let mistakes = [];
    let spokenPtr = 0;

    originalWords.forEach((word) => {
        let found = false;
        const searchWindow = 4; 
        
        for (let i = spokenPtr; i < Math.min(spokenPtr + searchWindow, spokenWords.length); i++) {
            if (spokenWords[i] === word) {
                found = true;
                spokenPtr = i + 1;
                break;
            }
        }

        if (found) {
            correctCount++;
        } else {
            mistakes.push(word);
        }
    });

    const accuracy = (correctCount / originalWords.length) * 100;
    const duration = ((appState.endTime - appState.startTime) / 1000).toFixed(1);

    showResults(accuracy, duration, mistakes);
}

function showResults(accuracy, time, mistakes) {
    const originalWords = appState.activeStory.text.split(' ');
    textDisplay.innerHTML = originalWords.map(word => {
        const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        const isCorrect = !mistakes.includes(cleanWord);
        return `<span class="${isCorrect ? 'correct' : 'mistake'}">${word}</span>`;
    }).join(' ');

    setTimeout(() => {
        readerScreen.classList.add('hidden');
        resultsScreen.classList.remove('hidden');

        const circlePercent = accuracy.toFixed(0);
        accuracyVal.textContent = `${circlePercent}%`;
        accuracyPath.setAttribute('stroke-dasharray', `${circlePercent}, 100`);
        timeVal.textContent = `${time}s`;

        const toggleBtn = document.getElementById('toggle-mistakes-btn');
        if (mistakes.length > 0) {
            mistakesList.innerHTML = [...new Set(mistakes)].map(m => `<span class="word-tag">${m}</span>`).join('');
            toggleBtn.classList.remove('hidden');
            mistakesSection.classList.add('hidden'); // Ensure it starts collapsed
        } else {
            toggleBtn.classList.add('hidden');
            if (accuracy >= 95) {
                triggerConfetti();
                addBadge('perfect');
                celebrateMascot();
            }
        }

        if (accuracy > 90 && time < 15) addBadge('fast');

        if (accuracy >= 85) {
            appState.currentXP += 25;
            if (appState.currentXP >= 100) {
                appState.currentXP = 0;
                appState.currentLevel = Math.min(10, appState.currentLevel + 1);
                
                const levelDisplay = document.createElement('div');
                levelDisplay.className = 'feedback-toast';
                levelDisplay.innerHTML = `<h3>Level Up! Now Level ${appState.currentLevel} 🚀</h3>`;
                document.body.appendChild(levelDisplay);
                setTimeout(() => levelDisplay.remove(), 3000);
                
                renderStorySelection(); // Unlock new books immediately
            }
        }
        updateUIHeader();
    }, 1200);
}

function triggerConfetti() {
    const container = document.querySelector('.confetti-container');
    if(!container) return;
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

function updateUIHeader() {
    document.getElementById('current-level').textContent = appState.currentLevel;
    document.getElementById('xp-text').textContent = `${appState.currentXP}%`;
    document.querySelector('.xp-bar-fill').style.width = `${appState.currentXP}%`;
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
    if(mascot) {
        mascot.classList.add('success-glow');
        setTimeout(() => mascot.classList.remove('success-glow'), 3000);
    }
}

// Event Listeners
document.getElementById('toggle-mistakes-btn').addEventListener('click', (e) => {
    const container = document.getElementById('mistakes-container');
    const isHidden = container.classList.toggle('hidden');
    e.target.textContent = isHidden ? "View Detailed Report" : "Hide Detailed Report";
});

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

window.addEventListener('DOMContentLoaded', init);
