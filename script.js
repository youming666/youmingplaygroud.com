class Game {
    constructor() {
        this.score = 0;
        this.lives = 3;
        this.maxSlots = 7;
        this.selectedCards = [];
        this.slots = [];
        this.cards = [];
        this.emojiList = ['🐑', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁'];
        this.level = 1;
        this.cardsPerLayer = 9;
        this.totalLayers = 1;
        this.timeLeft = 60;//120;
        this.timer = null;
        this.isGameStarted = false;
        this.playerName = '';
        
        this.gameBoard = document.getElementById('gameBoard');
        this.slotContainer = document.getElementById('slotContainer');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.startButton = document.getElementById('startGame');
        this.playerNameInput = document.getElementById('playerName');
        this.randomNameButton = document.getElementById('randomName');
        
        this.createNotificationElement();
        
        console.log('Game 构造函数执行');
        console.log(this.gameBoard, this.slotContainer);
        
        this.init();
        this.setupEventListeners();
        this.generateRandomName();
    }
    
    createNotificationElement() {
        this.notification = document.createElement('div');
        this.notification.className = 'notification';
        this.notification.style.display = 'none';
        document.body.appendChild(this.notification);
        
        this.timerElement = document.createElement('div');
        this.timerElement.className = 'timer';
        this.timerElement.textContent = '01:00';
        document.querySelector('.game-header').appendChild(this.timerElement);
    }
    
    showNotification(message, type = 'info') {
        this.notification.textContent = message;
        this.notification.className = `notification ${type}`;
        this.notification.style.display = 'block';
        setTimeout(() => {
            this.notification.style.display = 'none';
        }, 3000);
    }
    
    init() {
        this.slotContainer.innerHTML = '';
        this.slots = [];
        for (let i = 0; i < this.maxSlots; i++) {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.dataset.index = i;
            this.slotContainer.appendChild(slot);
            this.slots.push(slot);
        }
        this.generateCards();
        this.showLevelStart();
    }
    
    showLevelStart() {
        let message = `第 ${this.level} 关`;
        // if (this.level <= 3) {
        //     message += ' - 新手教程';
        // } else if (this.level <= 7) {
        //     message += ' - 初级挑战';
        // } else if (this.level <= 12) {
        //     message += ' - 高级挑战';
        // } else {
        //     message += ' - 终极挑战';
        // }
        this.showNotification(message, 'level');
    }
    
    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timeLeft = 60;//120;
        this.updateTimerDisplay();
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) {
                this.gameOver();
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        if (this.timeLeft <= 30) {
            this.timerElement.classList.add('warning');
        } else {
            this.timerElement.classList.remove('warning');
        }
    }
    
    gameOver() {
        clearInterval(this.timer);
        this.showNotification('时间到！游戏结束', 'info');
        setTimeout(() => {
            this.resetGame();
        }, 2000);
    }
    
    adjustDifficulty() {
        if (this.level <= 3) {
            this.cardsPerLayer = 12;
            this.totalLayers = 1;
            this.usedEmojis = this.emojiList.slice(0, 4);
            this.layoutType = 'flat';
        } else if (this.level <= 7) {
            this.cardsPerLayer = 15;
            this.totalLayers = 2;
            this.usedEmojis = this.emojiList.slice(0, 6);
            this.layoutType = 'partial';
        } else if (this.level <= 12) {
            this.cardsPerLayer = 18;
            this.totalLayers = 3;
            this.usedEmojis = this.emojiList.slice(0, 8);
            this.layoutType = 'strategic';
        } else {
            this.cardsPerLayer = 21;
            this.totalLayers = 4;
            this.usedEmojis = this.emojiList;
            this.layoutType = 'chaos';
        }
    }
    
    generateCards() {
        this.gameBoard.innerHTML = '';
        this.cards = [];
        this.adjustDifficulty();
        const totalCards = this.cardsPerLayer * this.totalLayers;
        const cardPool = [];
        const emojiCount = Math.floor(totalCards / (this.usedEmojis.length * 3)) * 3;
        this.usedEmojis.forEach(emoji => {
            for (let i = 0; i < emojiCount; i++) {
                cardPool.push(emoji);
            }
        });
        for (let i = cardPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardPool[i], cardPool[j]] = [cardPool[j], cardPool[i]];
        }
        let cardIndex = 0;
        for (let layer = 0; layer < this.totalLayers; layer++) {
            for (let i = 0; i < this.cardsPerLayer; i++) {
                if (cardIndex < cardPool.length) {
                    this.createCard(cardPool[cardIndex], layer);
                    cardIndex++;
                }
            }
        }
        console.log('generateCards 被调用');
    }
    
    createCard(emoji, layer) {
        const card = document.createElement('div');
        card.className = 'card';
        card.textContent = emoji;
        card.dataset.layer = layer;
        card.dataset.emoji = emoji;
        switch (this.layoutType) {
            case 'flat':
                const gridSize = Math.ceil(Math.sqrt(this.cardsPerLayer));
                const cardWidth = 60;
                const cardHeight = 80;
                const spacing = 10;
                const index = this.cards.filter(c => c.dataset.layer === layer.toString()).length;
                const row = Math.floor(index / gridSize);
                const col = index % gridSize;
                const totalGridWidth = gridSize * (cardWidth + spacing) - spacing;
                const totalGridHeight = Math.ceil(this.cardsPerLayer / gridSize) * (cardHeight + spacing) - spacing;
                const startX = (this.gameBoard.offsetWidth - totalGridWidth) / 2;
                const startY = (this.gameBoard.offsetHeight - totalGridHeight) / 2;
                const x = startX + col * (cardWidth + spacing);
                const y = startY + row * (cardHeight + spacing);
                card.style.left = `${x}px`;
                card.style.top = `${y}px`;
                break;
            case 'partial':
                const baseX = Math.random() * (this.gameBoard.offsetWidth - 60);
                const baseY = Math.random() * (this.gameBoard.offsetHeight - 80);
                card.style.left = `${baseX + layer * 10}px`;
                card.style.top = `${baseY + layer * 10}px`;
                break;
            case 'strategic':
                const centerX = this.gameBoard.offsetWidth / 2;
                const centerY = this.gameBoard.offsetHeight / 2;
                const radius = Math.min(centerX, centerY) * 0.8;
                const angle = (Math.random() * Math.PI * 2);
                card.style.left = `${centerX + Math.cos(angle) * radius * (1 - layer * 0.2)}px`;
                card.style.top = `${centerY + Math.sin(angle) * radius * (1 - layer * 0.2)}px`;
                break;
            case 'chaos':
                const randomX = Math.random() * (this.gameBoard.offsetWidth - 60);
                const randomY = Math.random() * (this.gameBoard.offsetHeight - 80);
                card.style.left = `${randomX}px`;
                card.style.top = `${randomY}px`;
                const rotation = Math.random() * 20 - 10;
                card.style.transform = `rotate(${rotation}deg)`;
                break;
        }
        card.style.zIndex = layer;
        this.gameBoard.appendChild(card);
        this.cards.push(card);
        console.log('添加卡牌', emoji, layer);
    }
    
    setupEventListeners() {
        this.gameBoard.addEventListener('click', (e) => {
            if (!this.isGameStarted) return;
            const card = e.target.closest('.card');
            if (!card) return;
            this.handleCardClick(card);
        });
        this.slotContainer.addEventListener('click', (e) => {
            if (!this.isGameStarted) return;
            const slot = e.target.closest('.slot');
            if (!slot || !slot.firstChild) return;
            this.handleSlotClick(slot);
        });
        this.startButton.addEventListener('click', () => {
            if (!this.isGameStarted) {
                if (!this.playerName) {
                    this.generateRandomName();
                }
                this.startGame();
            }
        });
        document.getElementById('revive').addEventListener('click', () => {
            if (!this.isGameStarted) return;
            if (this.lives > 0) {
                this.lives--;
                this.livesElement.textContent = this.lives;
                this.clearSlots();
            }
        });
        document.getElementById('reset').addEventListener('click', () => {
            this.resetGame();
        });
        this.randomNameButton.addEventListener('click', () => {
            this.generateRandomName();
        });
        this.playerNameInput.addEventListener('input', (e) => {
            this.playerName = e.target.value.trim() || this.playerName;
        });
    }
    
    handleCardClick(card) {
        if (this.isCardBlocked(card)) return;
        if (card.classList.contains('selected')) {
            this.removeCardFromSlot(card);
            return;
        }
        if (this.selectedCards.length >= this.maxSlots) {
            alert('卡槽已满！');
            return;
        }
        this.moveCardToSlot(card);
    }
    
    handleSlotClick(slot) {
        const slotCard = slot.firstChild;
        if (!slotCard) return;
        const originalCard = this.cards.find(card => 
            card.dataset.emoji === slotCard.dataset.emoji && 
            card.classList.contains('selected')
        );
        if (originalCard) {
            this.removeCardFromSlot(originalCard);
        }
    }
    
    moveCardToSlot(card) {
        const emptySlotIndex = this.slots.findIndex(slot => !slot.hasChildNodes());
        if (emptySlotIndex === -1) return;
        const slot = this.slots[emptySlotIndex];
        const slotCard = document.createElement('div');
        slotCard.className = 'card';
        slotCard.textContent = card.textContent;
        slotCard.dataset.emoji = card.dataset.emoji;
        slotCard.dataset.originalCard = card.dataset.emoji;
        slot.appendChild(slotCard);
        card.classList.add('selected');
        card.style.visibility = 'hidden';
        this.selectedCards.push(card);
        this.checkForMatches();
    }
    
    removeCardFromSlot(card) {
        const slot = Array.from(this.slots).find(slot => 
            slot.firstChild && slot.firstChild.dataset.originalCard === card.dataset.emoji
        );
        if (slot) {
            slot.innerHTML = '';
            card.classList.remove('selected');
            card.style.visibility = 'visible';
            this.selectedCards = this.selectedCards.filter(c => c !== card);
        }
    }
    
    isCardBlocked(card) {
        const cardRect = card.getBoundingClientRect();
        const cardLayer = parseInt(card.dataset.layer);
        const visibleCards = this.cards.filter(c => 
            c !== card && 
            c.style.visibility !== 'hidden' && 
            parseInt(c.dataset.layer) > cardLayer
        );
        return visibleCards.some(otherCard => {
            const otherRect = otherCard.getBoundingClientRect();
            const isOverlapping = !(
                cardRect.right < otherRect.left || 
                cardRect.left > otherRect.right || 
                cardRect.bottom < otherRect.top || 
                cardRect.top > otherRect.bottom
            );
            return isOverlapping;
        });
    }
    
    checkForMatches() {
        const emojiCount = {};
        const slotCards = Array.from(this.slots)
            .filter(slot => slot.hasChildNodes())
            .map(slot => slot.firstChild);
        slotCards.forEach(card => {
            const emoji = card.dataset.emoji;
            emojiCount[emoji] = (emojiCount[emoji] || 0) + 1;
        });
        for (const [emoji, count] of Object.entries(emojiCount)) {
            if (count >= 3) {
                this.removeMatchedCards(emoji);
                this.score += 10;
                this.scoreElement.textContent = this.score;
                this.updateLeaderboard(this.score);
            }
        }
    }
    
    removeMatchedCards(emoji) {
        this.slots.forEach(slot => {
            if (slot.firstChild && slot.firstChild.dataset.emoji === emoji) {
                slot.innerHTML = '';
            }
        });
        const matchedCards = this.selectedCards.filter(card => card.dataset.emoji === emoji);
        matchedCards.forEach(card => {
            card.remove();
            this.cards = this.cards.filter(c => c !== card);
        });
        this.selectedCards = this.selectedCards.filter(card => !matchedCards.includes(card));
        this.checkLevelComplete();
    }
    
    clearSlots() {
        this.slots.forEach(slot => {
            slot.innerHTML = '';
        });
        this.selectedCards.forEach(card => {
            card.classList.remove('selected');
            card.style.visibility = 'visible';
        });
        this.selectedCards = [];
    }
    
    resetGame() {
        this.isGameStarted = false;
        this.startButton.style.display = 'block';
        this.playerNameInput.disabled = false;
        this.randomNameButton.disabled = false;
        this.playerNameInput.style.opacity = '1';
        this.randomNameButton.style.opacity = '1';
        clearInterval(this.timer);
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = this.lives;
        this.clearSlots();
        this.init();
        this.updateLeaderboard(0);
    }
    
    checkLevelComplete() {
        if (this.cards.length === 0) {
            clearInterval(this.timer);
            this.level++;
            this.showNotification(`恭喜通过第 ${this.level - 1} 关！`, 'success');
            setTimeout(() => {
                this.generateCards();
                this.showLevelStart();
                this.startTimer();
            }, 2000);
        }
    }

    startGame() {
        this.isGameStarted = true;
        this.startButton.style.display = 'none';
        this.playerNameInput.disabled = true;
        this.randomNameButton.disabled = true;
        this.playerNameInput.style.opacity = '0.6';
        this.randomNameButton.style.opacity = '0.6';
        this.startTimer();
        this.showNotification(`欢迎 ${this.playerName} 开始游戏！`, 'info');
    }

    generateRandomName() {
        const adjectives = ['快乐的', '聪明的', '勇敢的', '可爱的', '机智的', '活泼的', '温柔的', '善良的', '阳光的', '快乐的'];
        const nouns = ['小羊', '小兔', '小鹿', '小象', '小虎', '小狮', '小熊猫', '小猫咪', '小狗狗', '小狐狸'];
        const numbers = Math.floor(Math.random() * 1000);
        
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        
        this.playerName = `${randomAdjective}${randomNoun}${numbers}`;
        this.playerNameInput.value = this.playerName;
    }

    updateLeaderboard(newScore) {
        let player = leaderboardData.find(e => e.name === this.playerName);
        if (!player) {
            player = { name: this.playerName, score: newScore };
            leaderboardData.push(player);
        } else {
            player.score = newScore;
        }
        leaderboardData.sort((a, b) => b.score - a.score);
        leaderboardData.length = 10;
        renderLeaderboard();
        saveLeaderboardData();
    }
}

window.onload = () => {
    loadLeaderboardData();
    renderLeaderboard();
    new Game();
};

// 排行榜数据结构和操作
const STORAGE_KEY = 'yangGameLeaderboard';
let leaderboardData = [];

// 从localStorage加载排行榜数据
function loadLeaderboardData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        leaderboardData = JSON.parse(savedData);
    } else {
        // 如果没有保存的数据，使用默认数据
        leaderboardData = [
            { name: '玩家1', score: 0 },
            { name: '玩家2', score: 0 },
            { name: '玩家3', score: 0 },
            { name: '玩家4', score: 0 },
            { name: '玩家5', score: 0 },
            { name: '玩家6', score: 0 },
            { name: '玩家7', score: 0 },
            { name: '玩家8', score: 0 },
            { name: '玩家9', score: 0 },
            { name: '玩家10', score: 0 },
        ];
    }
}

function renderLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    leaderboardData.slice(0, 10).forEach((entry, idx) => {
        const li = document.createElement('li');
        li.className = 'leaderboard-item';
        li.innerHTML = `<span class="rank">${idx + 1}</span><span class="name">${entry.name}</span><span class="score">${entry.score}</span>`;
        list.appendChild(li);
    });
}

// 保存排行榜数据到localStorage
function saveLeaderboardData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboardData));
}

document.addEventListener('DOMContentLoaded', () => {
    renderLeaderboard();
});
