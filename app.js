function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function findColorClass(num) {
  //find matching 'light up' color for buttons
  var result = '';
  if (num === 1) {
    result = 'green-light';
  } else if ( num === 2) {
    result = 'red-light';
  } else if ( num === 3 ) {
    result = 'yellow-light';
  } else {
    result = 'blue-light';
  }
  return result;
}

var simon = {
  on: false,
  gamePattern: [],
  timeInterval: 1500,
  turnCount: 0,
  turn: 'computer',
  strict: false,
  onOffSwitch: function() {
    $("#on-switch").on('click', function() {
      simon.on = simon.on ? false : true;
      var $count = $("#count span");

      if (simon.on ) {
        $count.text('- -');
      } else {
        $count.text('');
        $('.strict-light').css('background-color', '#ccc');
        return;
      }
    });
  },
  playRound: function() {
    simon.turn = 'computer';
    simon.displayPattern();
    simon.displayCount();
  },
  startGame: function() {
    $('#start button').on('click', function() {
      if (!simon.on) { return; } //disable if game isn't on

      simon.reset();
      simon.playRound();
    });
  },
  displayError: function() {
    //make each div flash
    [1, 2, 3, 4].forEach(function(num) {
      simon.lightUpDiv(num);
      simon.lightUpDiv(num);
    });
    $('#count span').text('! !').animate({opacity:0},200,"linear",function(){
      $(this).animate({opacity:1},300);
    });
    //error sound
    $('#error-sound')[0].play();
  },
  lightUpDiv: function(num) {
    if (!simon.on) { return; }
    $div = $('#' + num),
    col = findColorClass(num);
    $div.addClass(col, 300);
    $div.removeClass(col, 300);
  },
  processPlayerMove: function(num) {
    simon.lightUpDiv(num);
    $("#" + num + ' ' + 'audio')[0].play();
  },
  displayWin: function() {
    $msg = $("#winning-msg");
    $msg.fadeToggle(1000, function() {
      $msg.fadeToggle(1000);
    });
  },
  speedUp: function() {
    this.timeInterval -= 300;
  },
  buttonClick: function() {
    $('.button').on('mousedown', function(e) {
      if ( simon.turn !== 'player' ) { return; } //has to be player's turn for buttons to work

      var num = +$(e.target).attr('id'),
          correctMove = simon.gamePattern[simon.turnCount];

      if ( num === correctMove && simon.turnCount === simon.gamePattern.length - 1 ) {
        if ( simon.gamePattern.length % 5 === 0 ) {
          simon.speedUp();
        }

        simon.processPlayerMove(num);
        simon.turnCount = 0;

        if (simon.gamePattern.length === 20 ) {
          //win notification
          simon.displayWin();
          simon.gamePattern = [];
          simon.timeInterval = 1500;
        }
        simon.addNextSequence();
        _.delay( simon.playRound, 2000 );
      } else if ( num !== correctMove ) {
        simon.displayError();
        simon.turnCount = 0;

        if (simon.strict) {
          simon.gamePattern = [];
          simon.addNextSequence();
        }
        _.delay(simon.playRound, 1600);
      } else if ( num === correctMove ) {
        simon.processPlayerMove(num);
        simon.turnCount += 1;
      }
    });
  },
  displayCount:function() {
    var $el = $('#count span');
    $el.text(this.gamePattern.length);
    $el.animate({opacity:0},200,"linear",function(){
      $(this).animate({opacity:1},300);
    });
  },
  addNextSequence: function() {
    var next = Math.round( getRandomArbitrary(1, 4) );
    this.gamePattern.push(next);
  },
  displayPattern: function() {
    var start = 0,
        end = simon.gamePattern.length - 1,
        timeoutID;

    var displayPattern = setInterval(function() {
      if (!simon.on) { return; }
      if( start === end ) {
        clearInterval( displayPattern );
        simon.turn = 'player';
      }

      var num = simon.gamePattern[start];
      var $div = $('#' + num),
          color = findColorClass(num);
      var sound = $("#" + num + ' ' + 'audio')[0];
      sound.play();
      $div.addClass(color, simon.timeInterval/2);
      $div.removeClass(color, simon.timeInterval/2);

      start += 1;
    }, simon.timeInterval);
  },
  reset: function() {
    this.gamePattern = [];
    this.turn = 'computer';
    this.addNextSequence();
  },
  strictMode: function() {
    $("#strict button").on("click", function() {
      if (!simon.on) { return; }

      $btn = $("#strict .strict-light");
      simon.strict = simon.strict ? false : true;

      if (simon.strict) {
        $btn.css('background-color', 'red');
      } else {
        $btn.css('background-color', '#ccc');
      }
    });
  },
  bind: function() {
    this.onOffSwitch();
    this.startGame();
    this.buttonClick();
    this.strictMode();
  },
  init: function() {
    this.bind();
  }
}
