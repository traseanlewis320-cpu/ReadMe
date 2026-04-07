// app.js

class User {
    constructor(name) {
        this.name = name;
        this.xp = 0;
        this.level = 1;
        this.booksCompleted = 0;
        this.levels = {
            1: 10,
            2: 20,
            3: 30
        };
    }

    earnXP(accuracy) {
        this.xp += accuracy / 10;
        this.checkLevelUp();
    }

    completeBook() {
        this.booksCompleted += 1;
        this.checkLevelUp();
    }

    checkLevelUp() {
        const currentLevelBooks = this.levels[this.level];
        if (this.booksCompleted >= currentLevelBooks * 0.90) {
            this.level += 1;
            console.log(`Level Up! Welcome to Level ${this.level}`);
        }
    }
}

const user = new User('John Doe');

// Sample usage
user.earnXP(100); // Earn XP based on accuracy
user.completeBook(); // Track books completed
