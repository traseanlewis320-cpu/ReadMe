// New XP calculation based on accuracy
function calculateXP(accuracy) {
    return accuracy / 10;
}

// Level unlocking based on completion percentage
function unlockLevel(completedBooks, totalBooks, level) {
    const requiredCompletion = 0.9; // 90% to unlock
    if ((completedBooks / totalBooks) >= requiredCompletion) {
        return `Level ${level} unlocked!`; // Return level unlocked message
    }
    return `Keep going! You need to complete more books to unlock level ${level}.`;
}