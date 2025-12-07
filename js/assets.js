export const Assets = {
    player: new Image(), bg: new Image(), energy: new Image(),
    enemy1: new Image(), enemy2: new Image(), enemy3: new Image(), enemy4: new Image(),
    loadedCount: 0,
    total: 7,
    errors: []
};

export function loadAssets(onComplete) {
    const checkLoad = () => {
        Assets.loadedCount++;
        if (Assets.loadedCount >= Assets.total) onComplete(Assets.errors);
    };

    const load = (key, src) => {
        Assets[key].src = src;
        Assets[key].onload = checkLoad;
        Assets[key].onerror = () => { Assets.errors.push(key); checkLoad(); };
    };

    load('player', 'assets/images/player.png');
    load('bg', 'assets/images/bg.png');
    load('energy', 'assets/images/energy.png');
    load('enemy1', 'assets/images/enemy1.jpg');
    load('enemy2', 'assets/images/enemy2.jpg');
    load('enemy3', 'assets/images/enemy3.jpg');
    load('enemy4', 'assets/images/enemy4.jpg');
}