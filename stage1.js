var stage1 = function(game) {
    var player;
    var spikes;
    var platforms;
    var cursors;

    var stars;
    var score;
    var scoreText;
    var resultText;
};

WebFontConfig = {
  
    active: function() { game.time.events.add(Phaser.Timer.SECOND, createText, this); },
    google: {
      families: ['Revalia', 'Righteous']
    }
    
};

stage1.prototype = {
  
    preload: function() {

        this.game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js');
        this.game.load.image('sky', 'assets/sky1.png');
        this.game.load.image('ground', 'assets/platform1.png');
        this.game.load.image('star', 'assets/star.png');
        this.game.load.spritesheet('shirokuma', 'assets/shirokuma.png', 32, 32);
        this.game.load.spritesheet('loli', 'assets/loli.png', 32, 48);
      
    },

    create: function() {

        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        // add background
        this.game.add.sprite(0, 0, 'sky');

        // add platforms
        platforms = this.game.add.group();
        platforms.enableBody = true;
        var ground = platforms.create(0, this.game.world.height - 64, 'ground');
        ground.scale.setTo(2, 2);
        ground.body.immovable = true;

        // add ledges
        var ledge = platforms.create(400, 400, 'ground');
        ledge.body.immovable = true;
        ledge = platforms.create(-150, 280, 'ground');
        ledge.body.immovable = true;
        ledge = platforms.create(395, 200, 'ground');
        ledge.scale.setTo(0.35, 1);
        ledge.body.immovable = true;
        ledge = platforms.create(680, 130, 'ground');
        ledge.scale.setTo(0.3, 1);
        ledge.body.immovable = true;
        
        // add player
        player = this.game.add.sprite(32, this.game.world.height - 150, 'loli');
        this.game.physics.arcade.enable(player);
        player.body.bounce.y = 0.2;
        player.body.gravity.y = 350;
        player.body.collideWorldBounds = true;
        player.animations.add('left', [0, 1, 2, 3], 8, true);
        player.animations.add('right', [5, 6, 7, 8], 8, true);
        player.health = 150;
        
        // add spikes
        spikes = [];
        spikes[0] = this.game.add.sprite(400, this.game.world.height - 150, 'shirokuma');
        spikes[1] = this.game.add.sprite(700, this.game.world.height - 400, 'shirokuma');
        
        for (var i = 0; i < spikes.length; i++) {
            this.initSpike(spikes[i]);
        }
        
        // set movement of spikes
        this.game.time.events.loop(Phaser.Timer.SECOND * 2, this.moveSpike1, this);
        this.game.time.events.loop(Phaser.Timer.SECOND, this.moveSpike2, this);

        // add stars
        stars = this.game.add.group();
        stars.enableBody = true;

        for (var i = 0; i < 12; i++) {
            var star = stars.create(i * 70, 0, 'star');
            star.body.gravity.y = 300;
            star.body.bounce.y = 0.5 + Math.random() * 0.4;
        }
     
        // add score text
        this.score = 0;
        scoreText = this.game.add.text(60, 60, 'score: 0', { fontSize: '32px', fill: '#FFF' });
        
        // add health text
        healthText = this.game.add.text(550, 55, 'HP: ' + player.health, { fontSize: '32px', fill: '#FFF' });
     
        // add level text
        var levelText = this.game.add.text(345, 20, 'Level 1', { fill: '#FFF' });
        levelText.font = 'Revalia';
        levelText.fontSize = 20;
     
        // set cursors
        cursors = this.game.input.keyboard.createCursorKeys();
        
    },

    update: function() {
            
        // game.time.events.add(Phaser.Timer.SECOND * 3, this.switchState, this);
        
        this.game.physics.arcade.collide(player, platforms);
        this.game.physics.arcade.collide(stars, platforms); 
        
        for (var i = 0; i < spikes.length; i++) {
            this.game.physics.arcade.collide(spikes[i], platforms);
        }
        
        player.body.velocity.x = 0;

        if (cursors.left.isDown) {
            player.body.velocity.x = -150;
            player.animations.play('left');
        } else if (cursors.right.isDown) {
            player.body.velocity.x = 150;
            player.animations.play('right');
        } else {
            player.animations.stop();
            player.frame = 4;
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.body.velocity.y = -320;
        }
        
        if (player.health > 0) {
            this.game.physics.arcade.overlap(player, stars, this.collectStar, null, this);
            this.game.physics.arcade.overlap(player, spikes, this.hurtPlayer, null, this);       
        }
        
        if (this.score == 120) {
            resultText = this.game.add.text(310, 200, 'STAGE CLEAR', { fill: '#FFF', wordWrap: true, wordWrapWidth: 6, align: 'center' });
            resultText.font = 'Righteous';
            resultText.fontSize = 50;
            
            player.body.enable = false;
            spikes[0].body.enable = false;
            spikes[1].body.enable = false;

            game.time.events.add(Phaser.Timer.SECOND * 3, upgrade.switchState, this, ['stage2']);
        }
        
    },

    initSpike: function(spike) {
        
        this.game.physics.arcade.enable(spike);
        spike.body.gravity.y = 300;
        spike.body.collideWorldBounds = true;
        spike.animations.add('left', [0, 1], 6, true);
        spike.animations.add('right', [2, 3], 6, true);
        
    },

    collectStar: function(player, star) {
        
        star.kill();
        
        this.score += 10;
        scoreText.text = 'score: ' + this.score;

    },

    moveSpike1: function() {

        var spikeMover = this.game.rnd.integerInRange(1, 2);
        
        if (spikes[0].body.position.x <= 200) {
            spikeMover = 1;
        } else if (spikes[0].body.position.x >= 300) {
            spikeMover = 2;
        }
        
        if (spikeMover == 1) {
            spikes[0].body.velocity.x = 50;
            spikes[0].animations.play('right');	
        }	else if (spikeMover == 2) {
            spikes[0].body.velocity.x = -50;
            spikes[0].animations.play('left');
        }
        
    },

    moveSpike2: function() {

        var spikeMover = this.game.rnd.integerInRange(1, 2);
        
        if (spikes[1].body.position.x <= 420) {
            spikeMover = 1;
        } else if (spikes[1].body.position.x >= 600) {
            spikeMover = 2;
        }
        
        if (spikeMover == 1) {
            spikes[1].body.velocity.x = 50;
            spikes[1].animations.play('right');	
        }	else if (spikeMover == 2) {
            spikes[1].body.velocity.x = -50;
            spikes[1].animations.play('left');
        }
        
    },

    hurtPlayer: function(player, spike) {

        if (player.x < spike.x + 32) {
            if (player.health > 10) {
                player.health -= 10;
                healthText.text = 'HP: ' + player.health;
                // toss the player a little bit to the left
                player.body.velocity.x = -300;
                player.animations.play('left');
            } else {
                this.killPlayer(player, spike);
            }           
        } else {
            if (player.health > 10) {
                player.health -= 10;
                healthText.text = 'HP: ' + player.health;
                // toss the player a little bit to the right
                player.body.velocity.x = 300;
                player.animations.play('right');   
            } else {
                this.killPlayer(player, spike);
            }
        }
        
    },

    killPlayer: function(player, spike) {
        
        player.kill();

        player.health = 0;
        healthText.text = 'HP: ' + player.health;
        
        spike.body.enable = false;

        resultText = this.game.add.text(320, 200, 'GAME OVER', {fill: '#FFF', wordWrap: true, wordWrapWidth: 5, align: 'center' });
        resultText.font = 'Righteous';
        resultText.fontSize = 50;
        
        var restart = this.game.add.text(320, 320, 'click to restart', {fill: '#FFF'});
        restart.fontSize = 22;
        
        window.onclick = function() {
            this.game.state.start('stage1');
        }
        
    },

}

