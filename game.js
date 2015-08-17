Math.seed = function (s) {
    return function () {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
    };
};

$(document).ready(function() {
  if (window.location.hash.substring(1)) {
    loadGame();
  } else {
    back();
  }
});

function back() {
    window.location.hash = '';
    $('#setup').show();
    $('#game').hide();
    return false;
}

function createGame() {
  var id = getId();
  window.location.hash = id;
  return loadGame();
}

function loadGame() {
  var id = window.location.hash.substring(1).toUpperCase();
  setId(id);
  renderGame(id);
  $('#setup').hide();
  $('#game').show();
  $('#game-id').text('(' + id + ')');
  return false;
}

function renderGame(id) {
  var values = fromId(id);
  var rand = Math.seed(values.rand);
  var $grid = $('#grid');
  var $table = $('<table class="grid"></table>');
  var labels = [ 'Person', 'Place', 'Thing' ];
  var $tr;
  var i, j;
  var cards;

  $tr = $('<tr><th>&nbsp;</th></tr>');
  for (i = 1; i <= values.cards; i++) {
    $tr.append('<th>' + i + '</th>');
  }
  $table.append($tr);

  for (i = 0; i < 3; i++) {
    $tr = $('<tr><th>' + labels[i] + '</th></tr>');
    cards = randomizeCards(values, rand);
    for (j = 0; j < values.cards; j++) {
      $tr.append('<td class="' + cards[j].color + '">' + cards[j].letter + '</td>');
    }
    $table.append($tr);
  }

  $grid.html($table);
}

function randomizeCards(values, rand) {
  var cards = [];
  for (i = 0; i < 6; i++) {
    if (values.players[i]) {
      cards.push($.extend({ 'rand': rand() }, cardTypes[i]));
    }
  }
  cards.push($.extend({ 'rand': rand() }, cardTypes[6]));
  for (i = 1; i < values.difficulty; i++) {
    cards.push($.extend({ 'rand': rand() }, cardTypes[7]));
  };
  cards.sort(function(x,y) { return x.rand - y.rand; });
  return cards;
}

function getId() {
  var values = {
    'players' : [ false, false, false, false, false, false ],
    'difficulty': $('input:radio[name="difficulty"]:checked').val(),
    'rand': Math.random() * 0x8000
  };
  for (i = 0; i < 6; i++)
    values.players[i] = $('#' + cardTypes[i].color).is(':checked');
  return toId(values);
}

function setId(id) {
  var values = fromId(id);
  for (i = 0; i < 6; i++)
    $('#' + cardTypes[i].color).prop('checked', values.players[i]);
  $('#d' + values.difficulty).prop('checked', true);
}

function toId(values) {
  var id = ((values.rand & flags.rand) << 9);
  for (i = 0; i < 6; i++)
    id = values.players[i] ? (id | flags.players[i]) : id;
  id |= values.difficulty;
  return id.toString(16).toUpperCase();
}

function fromId(val) {
  var id = parseInt(val, 16);
  var values = {
    'difficulty': id & flags.difficulty,
    'players' : [ false, false, false, false, false, false ],
    'rand': (id >> 9) & flags.rand,
    'cards': id & flags.difficulty
  };
  for (i = 0; i < 6; i++) {
    if (id & flags.players[i]) {
      values.players[i] = true;
      values.cards++;
    }
  }
  return values;
}

var flags = {
  difficulty: 0x7,
  players: [ 0x8, 0x10, 0x20, 0x40, 0x80, 0x100 ],
  rand: 0x7fff
};

var cardTypes = [
  { 'color': 'red', 'type': 'player', 'letter': 'R' },
  { 'color': 'blue', 'type': 'player', 'letter': 'B' },
  { 'color': 'green', 'type': 'player', 'letter': 'G' },
  { 'color': 'yellow', 'type': 'player', 'letter': 'Y' },
  { 'color': 'white', 'type': 'player', 'letter': 'W' },
  { 'color': 'pink', 'type': 'player', 'letter': 'P' },
  { 'color': 'black', 'type': 'killer', 'letter': 'X' },
  { 'color': 'grey', 'type': 'fake', 'letter': '&nbsp;' }
]
