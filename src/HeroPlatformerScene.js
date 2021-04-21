import Phaser from 'phaser';

// Load game images
import image_steve_stop from './assets/steve_stop.png';
import image_grass_block from './assets/grass_block.png';

// Define constants which will be widely used
let screen_velocity = 20;
let highest_score_storage = 'hero_platformer_hiscore';

/**
 * Class of Hero Platformer Scene
 * The class must have the below methods:
 * - constructor()
 * - preload()
 * - create()
 * - update()
 */
export default class HeroPlatformerScene extends Phaser.Scene{
    /**
     * Construct this scene
     * inheriting Phaser.Scene with a parameter of this name.
     */
    constructor() {
        super('HeroPlatformerScene');
    }

    /**
     * What we do before the game is loaded.
     */
    preload() {
        this.load.image('hero', image_steve_stop);   // Load the hero image
        this.load.image('grass_block', image_grass_block);    // Load the grass block image 
    }

    /**
     * What we do when the game has just started.
     * We create all essential elements of the game.
     */
    create() {
        this.create_hero();
        this.create_grass_blocks();
        this.create_score_text();
    }

    /**
     * We create the hero in this method.
     */
    create_hero() {
        // Set the hero's start position (x,y) as the center of the screen
        let hero_start_x = this.game.config.width / 2;
        let hero_start_y = this.game.config.height / 2;        
        let hero_name = 'hero';    // Each sprite should have a name
        this.hero = this.physics.add.sprite(hero_start_x, hero_start_y, hero_name);

        // Adjust the sprite scale not too large or too small
        let hero_display_scale = 0.3;
        this.hero.setScale(hero_display_scale);

        // Set the sprite gravity effect (able to fall down)
        let steve_gravity = 400;
        this.hero.body.gravity.y = steve_gravity;

        // Define a method "hero_jump" when "pointerdown" event is received.
        this.input.on('pointerdown', this.hero_jump, this);
    }

    /**
     * This method is to handle how the hero can jump.
     */
    hero_jump() {
        let is_standing = this.hero.body.blocked.down || this.hero.body.touching.down;
        if (is_standing) {
            // Hero can jump only on a platform, not in the air.
            // jumping up at speed rate 200 initially
            this.hero.body.velocity.y = -1 * 400;
        }
    }

    /**
     * We create grass blocks in this method.
     */
    create_grass_blocks() {
        // Generate a group of grass blocks
        // from (0,bottom) and repeat 12 times per 30 units to the right 
        this.grass_group = this.physics.add.group(
            {
                key: 'grass_block'
                , repeat: 12
                , setXY: {
                    x: 0
                    , y: this.game.config.height - 30
                    , stepX: 30
                }
            } 
        );

        // Create more grass platforms in the beginning
        this.grass_group.createMultiple(
            {
                key: 'grass_block'
                , repeat: 6
                , setXY: {
                    x: 260
                    , y: this.game.config.height - 150
                    , stepX: 30
                }
            } 
        );
        
        // For each child block, scale down the size and fix it not moveable
        this.grass_group.children.iterate(
            (child) => {
                child.setScale(0.05, 0.05);
                child.setImmovable(true);
            }
        );

        // grass grounds are scrolling to the left
        this.grass_group.setVelocityX(-1 * screen_velocity);

        // Make grass blocks and hero be bound to each other
        this.physics.add.collider(this.grass_group, this.hero);
    }

    /**
     * Create a text of current score
     */
    create_score_text() {
        this.score = 0;
        this.topScore = localStorage.getItem(highest_score_storage) == null ? 0 : localStorage.getItem(highest_score_storage);
        this.scoreText = this.add.text(10, 10, '');
        this.updateScore(this.score);
    }

    /**
     * What we do when the game is being played.
     */
    update(){
        if (this.hero.body.x > this.game.config.width / 2) {
            // Move the hero to the left if it is on right side
            this.hero.setVelocityX(-1 * screen_velocity);
        } else if (this.hero.body.x < this.game.config.width / 2) {
            // Move the hero to the right if it is on left side
            this.hero.setVelocityX(screen_velocity);
        }

        // If the right ground is moving to provide more space, fill it up
        if (this.getRightMostGrass().x < this.game.config.width - 90) {
            // Create more grass platforms
            this.grass_group.createMultiple(
                {
                    key: 'grass_block'
                    , repeat: 3
                    , setXY: {
                        x: this.game.config.width
                        , y: this.game.config.height - 30
                        , stepX: 30
                    }
                } 
            );
            // For each child block, scale down the size and fix it not moveable
            this.grass_group.children.iterate(
                (child) => {
                    child.setScale(0.05, 0.05);
                    child.setImmovable(true);
                    child.body.velocity.x = -1 * screen_velocity;
                }
            );
            // Add scores when new grass grounds are created.
            this.updateScore(3);
        }

        // Randomly create grass blocks in the front
        /*
        var random_number = Math.floor(Math.random() * 14);
        if (random_number > 12) {
            let target_x = 260;
            let target_y = this.getGridY(this.hero.body.y);
            // Only place a grass block if no overlapped item exists.
            if (!this.hasAnySprite(target_x, target_y)) {
                this.grass_group.createMultiple(
                    {
                        key: 'grass_block'
                        , repeat: 3
                        , setXY: {
                            x: target_x
                            , y: target_y
                            , stepX: 30
                        }
                    } 
                );
                this.grass_group.children.iterate(
                    (child) => {
                        child.setScale(0.05, 0.05);
                        child.setImmovable(true);
                        child.body.velocity.x = -1 * screen_velocity;
                    }
                );
            }
        }
        */
    }
    
    /**
     * When Update a Score
     * @param {*} inc   increased score
     */
     updateScore(inc){
        this.score += inc;
        this.scoreText.text = 'Score: ' + this.score + '\nBest: ' + this.topScore;
    }

    /**
     * Utility method to get the right most grass object
     * @returns the right most grass object
     */
    getRightMostGrass() {
        let rightMostChild = null
        this.grass_group.children.iterate(
            (child) => {
                if (rightMostChild == null) {
                    rightMostChild = child;
                } else if (rightMostChild.body.x < child.body.x) {
                    rightMostChild = child;
                }
            }
        );
        return rightMostChild;
    }

    /**
     * Calculate Y of a grid based on the given general coordinate y
     * so that the block is within a grid, not between grids.
     * @param {*} coord_y   The general y coordinate
     * @return  y of the grid belong to the given y
     */
    getGridY(coord_y) {
        var ground_y = this.game.config.height - 30;
        var diff_from_ground = coord_y - ground_y;
        var count_of_grid = Math.floor(diff_from_ground / 30);
        return count_of_grid * 30 + ground_y;
    }

    /**
     * Check whether the given coordinates is overlapped with any sprite
     * @param {*} coord_x   Given X cooridnate
     * @param {*} coord_y   Given Y coorindate
     * @returns     true if overlapped; else false
     */
    hasAnySprite(coord_x, coord_y) {
        // Check if overlapped with hero
        if (this.hero.getBounds().contains(coord_x, coord_y)) {
            return true;
        }
        // Check if overlapped with grass
        this.grass_group.children.iterate(
            (child) => {
                if (child.getBounds().contains(coord_x, coord_y)) {
                    return true;
                }
            }
        );
        // Nothing is overlapped
        return false;
    }
}