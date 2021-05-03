import Phaser from 'phaser';

// Load game images
import image_steve_stop from './assets/steve_stop.png';
import image_grass_block from './assets/grass_block.png';
import image_melody_stand from './assets/melody_stand.png';
import image_shuriken from './assets/shuriken.png';

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
        this.load.image('melody', image_melody_stand);    // Load the melody image 
        this.load.image('shuriken', image_shuriken);    // Load Shuriken image
    }

    /**
     * What we do when the game has just started.
     * We create all essential elements of the game.
     */
    create() {
        this.create_hero();
        this.create_grass_blocks();
        this.melody_troop = this.physics.add.group();
        this.shuriken_group = this.physics.add.group();
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

        // Set the sprite gravity effect (able to fall down)
        let steve_gravity = 400;
        this.hero.body.gravity.y = steve_gravity;

        // Define a method "hero_jump" when "pointerdown" event is received.
        this.input.on('pointerdown', this.hero_jump, this);
    }

    /**
     * This method is to handle how the hero can jump.
     */
    hero_jump(pointer) {
        if (this.hero.getBounds().contains(pointer.x, pointer.y)) {
            this.shoot_weapon();
        } else {
            let is_standing = this.hero.body.blocked.down || this.hero.body.touching.down;
            if (is_standing) {
                // Hero can jump only on a platform, not in the air.
                // jumping up at speed rate 200 initially
                this.hero.body.velocity.y = -1 * 400;
            }
        }
    }

    /**
     * This method is to handle how you shoot a weapon.
     */
    shoot_weapon() {
        let weapon_name = 'shuriken';    // Each sprite should have a name
        var weapon = this.shuriken_group.create(
            this.hero.body.x + 30
            , this.hero.body.y + 30
            , weapon_name
        );
        weapon.setVelocityX(10 * screen_velocity);
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
                    x: 300
                    , y: this.game.config.height - 150
                    , stepX: 30
                }
            } 
        );
        
        // For each child block, scale down the size and fix it not moveable
        this.grass_group.children.each(
            (child) => {
                child.setImmovable(true);
            }
        );

        // grass grounds are scrolling to the left
        this.grass_group.setVelocityX(-1 * screen_velocity);

        // Make grass blocks and hero be bound to each other
        this.physics.add.collider(this.grass_group, this.hero);
    }

    /**
     * Method: create an enemy #1: Melody
     */
     create_melody(pos_x, pos_y) {
        // Set the character's start position (pos_x,pos_y) as the center of the screen
        let melody_name = 'melody';    // Each sprite should have a name
        this.melody_troop.create(
            pos_x
            , pos_y
            , melody_name
        );

        // Set the sprite gravity effect (able to fall down)
        let melody_gravity = 400;
        this.melody_troop.children.each(
            (child) => {
                child.body.gravity.y = melody_gravity;
            }
        );

        // Make grass blocks and melody be bound to each other
        this.physics.add.collider(this.grass_group, this.melody_troop);
        
        this.melody_troop.setVelocityX(-1 * screen_velocity);
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

        // Remove child melody if it is out of screen (left side)
        this.melody_troop.children.each(
            (child) => {
                if (child.body.x < 0) {
                    this.melody_troop.remove(child);
                    child.destroy();
                }
                // // Remove child melody if it touches Shuriken
                var touchShuriken = false
                this.shuriken_group.children.each(
                    (shuriken) => {
                        if (Phaser.Geom.Rectangle.Overlaps(shuriken.getBounds(), child.getBounds())) {
                            touchShuriken = true;
                        }
                    }
                );
                if (touchShuriken) {
                    this.melody_troop.remove(child);
                    child.destroy();
                }
            }
        );        

        // Remove child grass if it is out of screen (left side)
        this.grass_group.children.each(
            (child) => {
                if (child.body.x < 0) {
                    this.grass_group.remove(child);
                    child.destroy();
                    // Add scores when new grass grounds are removed.
                    this.updateScore(1);
                }
            }
        );

        // Remove child shuriken if it is out of screen (right side)
        this.shuriken_group.children.each(
            (child) => {
                if (child.body.x > this.game.config.width) {
                    this.shuriken_group.remove(child);
                    child.destroy();
                }
            }
        );  

        // If the right ground is moving to provide more space, fill it up
        if (this.getRightMostGrass().x < this.game.config.width - 90) {
            /**
             * Randomly create grass blocks in the front
             * 0 - ground
             * 1 - lower than the player
             * 2 - as high as the player
             * 3 - higher than the player
             */
            var random_make_grass = Math.floor(Math.random() * 4);
            var target_y = 0;
            switch(random_make_grass) {
                case 1:
                    target_y = this.getGridY(this.hero.body.y + 30);
                    break;
                case 2:
                    target_y = this.getGridY(this.hero.body.y);
                    break;
                case 3:
                    target_y = this.getGridY(this.hero.body.y - 30);
                    break;
                default:
                    target_y = this.game.config.height - 30;
                    break;
            }
            var num_of_blocks = Math.floor(Math.random() * 5) + 1;  
            // Create more grass platforms
            this.grass_group.createMultiple(
                {
                    key: 'grass_block'
                    , repeat: num_of_blocks
                    , setXY: {
                        x: this.game.config.width
                        , y: target_y
                        , stepX: 30
                    }
                } 
            );
            // For each child block, scale down the size and fix it not moveable
            this.grass_group.children.each(
                (child) => {
                    child.setImmovable(true);
                    child.body.velocity.x = -1 * screen_velocity;
                }
            );
            // Create a melody on top of the right most grass
            this.create_melody(this.game.config.width, target_y - 60);
        }
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
        var diff_from_ground = ground_y - coord_y;
        var count_of_grid = Math.floor(diff_from_ground / 30);
        return ground_y - count_of_grid * 30;
    }

    /**
     * Check whether the given rectangle is overlapped with any sprite
     * @param {*} rect   Given rectangle
     * @returns     true if overlapped; else false
     */
    hasAnySprite(rect) {
        console.log(this.grass_group.children.size)
        // Check if overlapped with hero
        if (Phaser.Geom.Rectangle.Overlaps(this.hero.getBounds(), rect)) {
            return true;
        }
        console.log("hero: " + this.hero.body.x + ", " + this.hero.body.y);
        console.log("rect: " + rect.left + ", " + rect.right + "|"+ rect.top + ", " + rect.bottom);
        // Check if overlapped with grass
        this.grass_group.children.iterate(
            (child) => {
                if (Phaser.Geom.Rectangle.Overlaps(child.getBounds(), rect)) {
                    return true;
                } else {
                    // console.log(child.getBounds().left + " vs " + rect.left + ", " + child.getBounds().right + " vs " + rect.right + "|"+ child.getBounds().top + " vs " + rect.top + ", " + child.getBounds().bottom + " vs " + rect.bottom);
                    // console.log(rect.left + ", " + rect.right + "|"+ rect.top + ", " + rect.bottom);
                    console.log(child.getBounds().left + ", " + child.getBounds().right + "|"+ child.getBounds().top + ", " + child.getBounds().bottom);
                }
            }
        );
        // Nothing is overlapped
        return false;
    }
}