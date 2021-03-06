var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// De variabelen
var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

// Geeft aan dat dit een nieuw spel is.
var game = new Phaser.Game(config);

// Maakt de pictures van tevoren.
function preload ()
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

// Laad alle sprites vanuit de preload in de browser.
function create ()
{
    // Voegt de lucht toe met een bepaalde groote.
    this.add.image(400, 300, 'sky');

    // De platformen krijgen een vaste plek (staticGroup) zodat ze niet begewen.
    platforms = this.physics.add.staticGroup();

    // Hier krijgen de platformen een bepaalde groote.
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    // Hier krijgen ze de coordinaten waar ze in het speelveld staan.
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // Hier word de player gemaakt en krijgt het gravity/physics.
    player = this.physics.add.sprite(100, 450, 'dude');

    // Als de player op de grond land krijgt hij een kleine bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Als de player naar links loopt krijgt hij een kleine animatie die looped.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    // Als de player zich draait krijgt hij een kleine animatie.
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    // Hier geld hetzelfde als bij naar links lopen.
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // Maakt de controls aan.
    cursors = this.input.keyboard.createCursorKeys();

    // Hier worden er steren van boven af over het speelveld verplaatst.
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    // Hier ook krijgen de sterren een kleine bounce als ze op de grond landen.
    stars.children.iterate(function (child) {
    
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });


    bombs = this.physics.add.group();

    // De score die je op het scherm ziet.
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    // Alle objecten in het speelveld krijgt een collider zodat niet alles door elkaar heen valt.
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    // Als je een ster aanraakt bots je er niet tegen aan.
    this.physics.add.overlap(player, stars, collectStar, null, this);


    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
    // Als je game over bent restart het spel zich.
    if (gameOver)
    {
        return;
    }

    // Als je het linker pijltje inclick speelt de animatie af als je naar links gaat.
    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    // Als je het rechter pijltje inclick speelt de animatie af als je naar rechts gaat.
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    // Als je draait speelt een draai animatie af.
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    // Als je pijltje omhoog klikt "Spring" je.
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
}

// Als je een ster op pakt
function collectStar (player, star)
{
    // Hier word de sprite weg gehaalt als je hem aanraakt
    star.disableBody(true, true);

    // De score voor iedere ster
    score += 10;
    
    // De tekst van jouw score
    scoreText.setText('Score: ' + score);

    // Als er geen sterren meer zijn reset het zich en begint er een nieuw level
    if (stars.countActive(true) === 0)
    {
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        // Zet de random locatie van de bom op het speelveld
        var bomb = bombs.create(x, 16, 'bomb');
        
        // De bounce die de bom heeft.
        bomb.setBounce(1);

        // Als de bom tegen de rand van de wereld aankomt ketst die gewoon af.
        bomb.setCollideWorldBounds(true);
        
        // De snelheid die de bom heeft.
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}

// Als de player word geraakt door eem bom
function hitBomb (player, bomb)
{
    // Alles word stil gezet
    this.physics.pause();

    // De player krijgt een kleur als het geraakt it
    player.setTint(0xff0000);

    player.anims.play('turn');

    // De game over word aangezet
    gameOver = true;
}