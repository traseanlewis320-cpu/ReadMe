/**
 * Literacy Leap - AI Reading Coach Logic
 * NEW XP SYSTEM:
 * - XP earned = Accuracy / 10
 * - Level unlocks at 90% book completion per level
 * - Tracks completed books per level
 */

const stories = [
    { id: 1, level: 1, title: "The Cat", text: "The cat sat on the mat. The cat is fat. The cat is black. I love the cat.", frameworks: { step: "Step 1", fp: "A-C", r2r: "Pre-Level 1" } },
    { id: 2, level: 1, title: "My Red Pen", text: "I have a red pen. The red pen is on the bed. I like to write with my red pen.", frameworks: { step: "Step 1", fp: "A-C", r2r: "Pre-Level 1" } },
    { id: 3, level: 2, title: "The Big Jump", text: "The green frog wanted to jump over the big blue pond. He took a deep breath and jumped as high as he could. Splash! He landed in the water.", frameworks: { step: "Step 2", fp: "D-G", r2r: "Level 1" } },
    { id: 4, level: 2, title: "Lost Mittens", text: "Nikki lost her white mittens in the snow. Her mother told her to look by the tall pine tree. She found them near the wooden bench.", frameworks: { step: "Step 2", fp: "D-G", r2r: "Level 1" } },
    { id: 5, level: 3, title: "The Brave Knight", text: "In a distant kingdom, a brave knight stood guard at the stone castle. He wore shiny armor that shimmered in the morning sun.", frameworks: { step: "Step 3", fp: "H-M", r2r: "Level 2" } },
    { id: 6, level: 4, title: "The Secret Garden", text: "Deep within the ancient forest, there was a garden that nobody had visited for nearly a hundred years. The iron gate was covered in thick green vines.", frameworks: { step: "Step 4", fp: "N-Q", r2r: "Level 3" } },
    { id: 7, level: 5, title: "Ocean Wonders", text: "The vast ocean is home to creatures that are far more mysterious than anything on land. Giant whales migrate thousands of miles across cold currents.", frameworks: { step: "Step 4", fp: "Q-R", r2r: "Level 3" } },
    { id: 8, level: 6, title: "The Steam Engine", text: "During the Industrial Revolution, the steam engine changed how people moved and worked. It allowed trains to carry goods much faster.", frameworks: { step: "Step 5", fp: "S-T", r2r: "Advanced" } },
    { id: 9, level: 7, title: "Galactic Journey", text: "A narrow beam of light pierced the darkness as it approached Saturn. Captain Orion adjusted the steering while the crew prepared.", frameworks: { step: "Advanced", fp: "U-V", r2r: "Expert" } },
    { id: 10, level: 8, title: "The Renaissance", text: "The Renaissance was a period of incredible artistic and scientific discovery. Artists studied anatomy to make paintings realistic.", frameworks: { step: "Advanced", fp: "W-X", r2r: "Expert" } },
    { id: 11, level: 9, title: "Metamorphosis", text: "Biological metamorphosis is the process by which animals develop after birth. A caterpillar spins a protective cocoon.", frameworks: { step: "High", fp: "Y-Z", r2r: "Science" } },
    { id: 12, level: 10, title: "Classical Wisdom", text: "Philosophy encourages us to question the nature of existence. Ancient thinkers debated justice, virtue, and logic.", frameworks: { step: "Expert", fp: "Z+", r2r: "Classical" } }
];

// Application State with NEW XP SYSTEM
let appState = {
    currentLevel: 1,
    currentXP: 0,
    booksCompletedThisLevel: {},
    activeStory: null,
    isRecording: false,
    startTime: null,
    endTime: null,
    recognition: null,
    sessions: [],
    completedStories: new Set()
};

// Initialize book tracking
for (let i = 1; i <= 10; i++) {
    appState.booksCompletedThisLevel[i] = 0;
}

// NEW XP HELPERS
function calculateXPFromAccuracy(accuracy) { return accuracy / 10; }

function getBooksRequiredForLevel(level) {
    const booksPerLevel = stories.filter(s => s.level === level).length;
    return Math.ceil(booksPerLevel * 0.9);
}

function checkLevelUnlock() {
    const booksRequired = getBooksRequiredForLevel(appState.currentLevel);
    const booksCompleted = appState.booksCompletedThisLevel[appState.currentLevel];
    
    if (booksCompleted >= booksRequired && appState.currentLevel < 10) {
        appState.currentLevel++;
        appState.booksCompletedThisLevel[appState.currentLevel] = 0;
        
        const levelDisplay = document.createElement('div');
        levelDisplay.className = 'feedback-toast';
        levelDisplay.innerHTML = `<h3>🎉 Level Up! Now Level ${appState.currentLevel}! 🚀</h3>`;
        document.body.appendChild(levelDisplay);
        setTimeout(() => levelDisplay.remove(), 3000);
        
        addBadge('levelUp');
        triggerConfetti();
    }
}

// [REST OF YOUR CODE REMAINS THE SAME - Keep all your existing functions]
// showResults() should include:
//   - const xpEarned = calculateXPFromAccuracy(accuracy);
//   - appState.currentXP += xpEarned;
//   - appState.completedStories.add(appState.activeStory.id);
//   - appState.booksCompletedThisLevel[appState.currentLevel]++;
//   - checkLevelUnlock();
