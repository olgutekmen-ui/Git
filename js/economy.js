export const Economy = {
    data: {
        aurum: 0,
        unlockedTrail: false
    },

    init() {
        if(localStorage.getItem('vyraData')) {
            this.data = JSON.parse(localStorage.getItem('vyraData'));
        }
        this.updateUI();
    },

    save() {
        localStorage.setItem('vyraData', JSON.stringify(this.data));
        this.updateUI();
    },

    updateUI() {
        // Safe check in case UI isn't loaded yet
        const walletEl = document.getElementById('menu-wallet');
        if(walletEl) walletEl.innerText = this.data.aurum;
        
        // Update Shop Buttons
        this.updateButton('price-shield', 100, false, "EQUIPPED");
        this.updateButton('price-trail', 500, this.data.unlockedTrail, "OWNED");
    },

    updateButton(id, cost, isOwned, ownedText) {
        const el = document.getElementById(id);
        if(!el) return;
        
        if (isOwned) {
            el.innerText = ownedText;
            el.style.color = "#00ff00";
        } else {
            el.innerText = `${cost} 💎`;
            el.style.color = this.data.aurum >= cost ? "#ffd700" : "#555";
        }
    },

    buyShield(activeBoosts) {
        if (activeBoosts.shield) return; 
        if (this.data.aurum >= 100) {
            this.data.aurum -= 100;
            activeBoosts.shield = true;
            this.save();
        }
    },

    buyTrail() {
        if (this.data.unlockedTrail) return;
        if (this.data.aurum >= 500) {
            this.data.aurum -= 500;
            this.data.unlockedTrail = true;
            this.save();
        }
    }
};