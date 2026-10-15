const game = {
    cash: 0,
    meth: 0,
    purity: 50,
    clickPower: 1,
    globalMultiplier: 1,
    purityGainRate: 0.02,

    cooks: {
        jesse: { name: "Jesse Pinkman", cost: 50, power: 1, count: 0, desc: "Adds 1g/s" },
        todd: { name: "Todd Alquist", cost: 500, power: 15, count: 0, desc: "High yield, but -0.1% Purity/s", special: "unstable" },
        gale: { name: "Gale Boetticher", cost: 2000, power: 10, count: 0, desc: "Efficiency: Cooks cost 10% less", special: "special" },
        walter: { name: "Walter White", cost: 5000, power: 25, count: 0, desc: "Adds 25g/s and +Purity/s", special: "special" },
        declan: { name: "Declan", cost: 25000, power: 100, count: 0, desc: "Professional: Increases Purity gain by 50%", special: "special" },
        victor: { name: "Victor", cost: 75000, power: 300, count: 0, desc: "The Enforcer: Huge g/s but Jesse/Walt cost 2x", special: "legendary" },
        superlab_team: { name: "Superlab Team", cost: 250000, power: 1500, count: 0, desc: "Industrial scale production", special: "special" },
        twins: { name: "The Cousins", cost: 1000000, power: 500, count: 0, desc: "Doubles total Cook Rate", special: "legendary" }
    },
    dealers: {
        street: { name: "Street Dealer", cost: 100, power: 1, count: 0, desc: "Sells 1g/s" },
        mike: { name: "Mike Ehrmantraut", cost: 2500, power: 20, count: 0, desc: "Efficiency: Dealers 2x faster", special: "special" },
        saul: { name: "Saul Goodman", cost: 8000, power: 5, count: 0, desc: "Loophole: 20% chance to not consume meth on sale", special: "special" },
        skyler: { name: "Skyler White", cost: 15000, power: 0, count: 0, desc: "Bookkeeper: 15% more cash from all sales", special: "special" },
        huell: { name: "Huell Babineaux", cost: 30000, power: 10, count: 0, desc: "Protection: Purity floor 60%", special: "special" },
        lydia: { name: "Lydia Rodarte-Quayle", cost: 100000, power: 200, count: 0, desc: "International: Price +20%", special: "special" },
        cartel: { name: "Juarez Cartel", cost: 500000, power: 2500, count: 0, desc: "Massive distribution network", special: "legendary" },
        gus: { name: "Gus Fring", cost: 2500000, power: 15000, count: 0, desc: "The Chicken Man: Empire scale", special: "legendary" }
    },
    upgrades: {
        magnets: { name: "Magnets, Bitch!", cost: 1000, type: "autoclick", bonus: 1, bought: false, desc: "Auto-clicks 1/s" },
        rv_lab: { name: "The Crystal Ship", cost: 5000, type: "jesse_synergy", bonus: 2, bought: false, desc: "Jesse is 2x more productive" },
        car_wash: { name: "A1A Car Wash", cost: 25000, type: "cash_mult", bonus: 1.25, bought: false, desc: "Laundered money: 25% more cash" },
        vamonos: { name: "Vamonos Pest", cost: 100000, type: "global", bonus: 2, bought: false, desc: "Doubles everything" },
        honey_bee: { name: "Golden Moth Chemical", cost: 250000, type: "walt_gale_synergy", bonus: 2, bought: false, desc: "Walt & Gale 2x faster" },
        pollos: { name: "Pollos Hermanos", cost: 500000, type: "passive", bonus: 1000, bought: false, desc: "Passive $1000/s" },
        madrigal: { name: "Madrigal Supply", cost: 1500000, type: "global", bonus: 3, bought: false, desc: "Triples everything" },
        czech_route: { name: "Czech Connection", cost: 5000000, type: "price_mult", bonus: 2, bought: false, desc: "Doubles sell price" },
        blue_sky: { name: "Blue Sky Formula", cost: 10000000, type: "purity_cap", bonus: 99.1, bought: false, desc: "Sets Purity to 99.1%" }
    },

    cook: function() {
        this.meth += this.clickPower * this.globalMultiplier;
        this.updateUI();
    },

    buyItem: function(category, id) {
        let item = this[category][id];
        let actualCost = item.cost;

        if (category === 'cooks' && this.cooks.gale.count > 0) {
            actualCost *= Math.pow(0.9, this.cooks.gale.count);
        }

        if (this.cash >= actualCost) {
            this.cash -= actualCost;
            if (category === 'upgrades') {
                this.applyUpgrade(id);
            } else {
                item.count++;
                item.cost = Math.floor(item.cost * 1.25);
                if (id === 'victor') {
                    this.cooks.jesse.cost *= 2;
                    this.cooks.walter.cost *= 2;
                }
            }
            this.updateUI();
            ui.renderShop();
        } else {
            ui.notify("We need more capital, Jesse!");
        }
    },

    applyUpgrade: function(id) {
        let upg = this.upgrades[id];
        upg.bought = true;
        if (upg.type === "global") this.globalMultiplier *= upg.bonus;
        if (upg.type === "purity_cap") this.purity = upg.bonus;
        ui.notify("Upgrade: " + upg.name);
    },

    sellProduct: function(amount = this.meth) {
        if (amount <= 0 || this.meth <= 0) return;
        let toSell = Math.min(amount, this.meth);

        let consumptionMultiplier = 1;
        if (this.dealers.saul.count > 0 && Math.random() < 0.2) {
            consumptionMultiplier = 0;
            ui.notify("Saul found a loophole!");
        }

        let pricePerGram = (this.purity / 100) * 15;
        if (this.dealers.lydia.count > 0) pricePerGram *= (1 + (this.dealers.lydia.count * 0.2));
        if (this.upgrades.czech_route.bought) pricePerGram *= 2;

        let totalSale = toSell * pricePerGram;
        if (this.dealers.skyler.count > 0) totalSale *= (1 + (this.dealers.skyler.count * 0.15));
        if (this.upgrades.car_wash.bought) totalSale *= 1.25;

        this.cash += totalSale;
        this.meth -= (toSell * consumptionMultiplier);
    },

    updateUI: function() {
        document.getElementById('cash-display').innerText = Math.floor(this.cash).toLocaleString();
        document.getElementById('meth-display').innerText = Math.floor(this.meth).toLocaleString();
        document.getElementById('purity-display').innerText = this.purity.toFixed(1);
        document.getElementById('multiplier-display').innerText = this.globalMultiplier.toFixed(1);

        let pps = Object.values(this.cooks).reduce((a, b) => {
            let p = b.count * b.power;
            if (b.name === "Jesse Pinkman" && this.upgrades.rv_lab.bought) p *= 2;
            if ((b.name === "Walter White" || b.name === "Gale Boetticher") && this.upgrades.honey_bee.bought) p *= 2;
            return a + p;
        }, 0);
        if (this.cooks.twins.count > 0) pps *= (2 * this.cooks.twins.count);
        pps *= this.globalMultiplier;

        let sps = Object.values(this.dealers).reduce((a, b) => a + (b.count * b.power), 0);
        if (this.dealers.mike.count > 0) sps *= (2 * this.dealers.mike.count);

        document.getElementById('pps-display').innerText = Math.floor(pps).toLocaleString();
        document.getElementById('sps-display').innerText = Math.floor(sps).toLocaleString();

        let currentPrice = (this.purity / 100) * 15;
        if (this.dealers.lydia.count > 0) currentPrice *= (1 + (this.dealers.lydia.count * 0.2));
        if (this.upgrades.czech_route.bought) currentPrice *= 2;
        document.getElementById('price-display').innerText = currentPrice.toFixed(2);
    }
};

const ui = {
    currentTab: 'cooks',
    switchTab: function(t) { this.currentTab = t; this.renderShop(); },
    notify: function(m) { document.getElementById('status-message').innerText = m; },

    renderShop: function() {
        const list = document.getElementById('upgrade-list');
        list.innerHTML = '';
        let items = game[this.currentTab];

        for (let id in items) {
            let item = items[id];
            if (item.bought) continue;

            let div = document.createElement('div');
            let tierClass = item.special || "";
            div.className = `upgrade-item ${tierClass}`;

            let displayCost = item.cost;
            if (this.currentTab === 'cooks' && game.cooks.gale.count > 0) {
                displayCost *= Math.pow(0.9, game.cooks.gale.count);
            }

            div.innerHTML = `
                <div class="item-info">
                    <b>${item.name} ${item.count !== undefined ? '['+item.count+']' : ''}</b>
                    <small>${item.desc}</small>
                </div>
                <button onclick="game.buyItem('${this.currentTab}', '${id}')">
                    $${Math.floor(displayCost).toLocaleString()}
                </button>
            `;
            list.appendChild(div);
        }
    }
};

setInterval(() => {
    // 1. Purity Dynamics
    let pGain = game.purityGainRate;
    if (game.cooks.declan.count > 0) pGain *= (1 + (game.cooks.declan.count * 0.5));

    if (game.cooks.walter.count > 0) game.purity = Math.min(100, game.purity + (pGain * game.cooks.walter.count));
    if (game.cooks.todd.count > 0) game.purity = Math.max(10, game.purity - (0.01 * game.cooks.todd.count));

    if (game.dealers.huell.count > 0 && game.purity < 60) game.purity = 60;

    // 2. Production
    let pps = Object.values(game.cooks).reduce((a, b) => {
        let p = b.count * b.power;
        if (b.name === "Jesse Pinkman" && game.upgrades.rv_lab.bought) p *= 2;
        if ((b.name === "Walter White" || b.name === "Gale Boetticher") && game.upgrades.honey_bee.bought) p *= 2;
        return a + p;
    }, 0);
    if (game.cooks.twins.count > 0) pps *= (2 * game.cooks.twins.count);
    game.meth += (pps * game.globalMultiplier) / 10;

    // 3. Sales
    let sps = Object.values(game.dealers).reduce((a, b) => a + (b.count * b.power), 0);
    if (game.dealers.mike.count > 0) sps *= (2 * game.dealers.mike.count);
    if (sps > 0) game.sellProduct(sps / 10);

    // 4. Upgrades
    if (game.upgrades.pollos.bought) game.cash += 100;
    if (game.upgrades.magnets.bought) game.meth += (game.clickPower / 10);

    game.updateUI();
}, 100);

window.onload = () => { ui.renderShop(); game.updateUI(); };
