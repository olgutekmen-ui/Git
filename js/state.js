export const State = {
    isPlaying: false,
    score: 0,
    distance: 0,
    flowMultiplier: 1.0,
    flowCharge: 0,
    isFlowState: false,
    gameSpeed: 6.0,
    runAurum: 0, // Money this run
    
    // Config
    LANE_WIDTH_BASE: 140,
    PLAYER_Z_DEPTH: 100,
    
    // Player State
    player: {
        lane: 1, // 0, 1, 2
        state: 'RUN', // RUN, JUMP, SLIDE
        animTimer: 0,
        invulnerable: false
    },
    
    activeBoosts: { shield: false },
    
    // Entities
    obstacles: [],
    particles: [],
    texts: []
};