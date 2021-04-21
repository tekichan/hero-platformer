import Phaser from 'phaser';

// import game logic from external files
import HeroPlatformerScene from './HeroPlatformerScene'

/**
 * Phaser Game Configuration
 */
const gameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        width: 375,
        height: 667
    },
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 0
            }
        }
    },
    scene: [HeroPlatformerScene]
};

/**
 * Create an object of Phaser.Game using gameConfig configuration.
 * The object will build the game accordingly.
 */
const game = new Phaser.Game(gameConfig);
