let tg = window.Telegram.WebApp;

tg.expand();

tg.MainButton.textColor = '#FFFFFF';
tg.MainButton.color = '#2cab37';

var selected = {};

function SelectWithJson(options) {
  var perPage = options.perPage || 10;
  var nextPage = options.nextPage || 2;

  var jsonUrl = options.jsonUrl || 'tags_general.json';

  function loadOptions(page, callback) {
    $.getJSON(jsonUrl, { page: page, per_page: perPage }, function(data) {
      var options = [];
      for (var i = 0; i < data.length; i++) {
        options.push({
          id: data[i].value,
          title: data[i].text
        });
      }
      callback(options);
    });
  }

  var $select = $(options.selector).selectize({
    maxItems: null,
    valueField: 'id',
    labelField: 'title',
    searchField: 'title',
    plugins: ['infinite_scroll', 'remove_button'],
    preload: true,

    load: function(query, callback) {
      loadOptions(1, callback);
    },
    onChange: function(value) {
      var selectorKey = options.selector.substring(1);
      var selectedValue = value.map(function(val) {
        if (selectorKey.startsWith('tags_minus_')) {
          return '-' + val;
        } else if (selectorKey.startsWith('tags_')) {
          return '+' + val;
        }
      });

      selected[selectorKey] = selectedValue;
      console.log(options.selector + ':', selected);

      checkSelectedOptions();
    }
  });

  $select[0].selectize.on('dropdown_open', function() {
    if ($select[0].selectize.currentResults.items.length >= $select[0].selectize.settings.maxOptions) {
      loadOptions(nextPage, function(options) {
        $select[0].selectize.addOption(options);
        nextPage++;
      });
    }
  });
}

function checkSelectedOptions() {
  var selectedOptionsCount = 0;
  for (var key in selected) {
    if (selected.hasOwnProperty(key) && selected[key].length > 0) {
      selectedOptionsCount += selected[key].length;
    }
  }
  
  tg.MainButton.setText("Вы выбрали " + selectedOptionsCount + " опций!");
  
  if (selectedOptionsCount > 0) {
    tg.MainButton.show();
  } else {
    tg.MainButton.hide();
  }
}

// Функция для увеличения счетчика
function increaseSelectedOptionsCount() {
  var selectedOptionsCount = parseInt(tg.MainButton.getText().match(/\d+/)); // Получаем текущее значение счетчика
  selectedOptionsCount++; // Увеличиваем счетчик на 1
  tg.MainButton.setText("Вы выбрали " + selectedOptionsCount + " опций!");
}

// Функция для уменьшения счетчика
function decreaseSelectedOptionsCount() {
  var selectedOptionsCount = parseInt(tg.MainButton.getText().match(/\d+/)); // Получаем текущее значение счетчика
  if (selectedOptionsCount > 0) {
    selectedOptionsCount--; // Уменьшаем счетчик на 1
    tg.MainButton.setText("Вы выбрали " + selectedOptionsCount + " опций!");
  }
}

$(document).ready(function() {
  var selects = [
    { selector: '.tags_general', jsonUrl: 'tags_general.json' },
    { selector: '.tags_content', jsonUrl: 'tags_content.json' },
    { selector: '.tags_universe', jsonUrl: 'tags_universe.json' },
    { selector: '.tags_character', jsonUrl: 'tags_universe.json' },
    { selector: '.tags_minus_general', jsonUrl: 'tags_general.json' },
    { selector: '.tags_minus_content', jsonUrl: 'tags_content.json' },
    { selector: '.tags_minus_universe', jsonUrl: 'tags_universe.json' },
    { selector: '.tags_minus_character', jsonUrl: 'tags_universe.json' },
  ];
  for (var i = 0; i < selects.length; i++) {
    new SelectWithJson(selects[i]);
    checkSelectedOptions();
  }
});

Telegram.WebApp.onEvent("mainButtonClicked", function(){
  tg.sendData(selected);
  tg.collapse();
});

Telegram.WebApp.onEvent("increaseButtonClicked", function(){
  increaseSelectedOptionsCount();
});

Telegram.WebApp.onEvent("decreaseButtonClicked", function(){
  decreaseSelectedOptionsCount();
});
