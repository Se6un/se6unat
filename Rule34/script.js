let tg = window.Telegram.WebApp;

tg.expand();

tg.MainButton.textColor = '#FFFFFF';
tg.MainButton.color = '#2cab37';

// Переменная, которая хранит выбранные опции
var selected = {}; // Объявляем selected в более широкой области видимости

// Функция-конструктор скрипта
function SelectWithJson(options) {
  var perPage = options.perPage || 10; // Количество опций для загрузки на каждую страницу
  var nextPage = options.nextPage || 2; // Номер следующей страницы для загрузки

  var jsonUrl = options.jsonUrl || 'tags_general.json'; // Путь до JSON-файла

  function loadOptions(page, callback) {
    // Загрузка опций с JSON
    $.getJSON(jsonUrl, { page: page, per_page: perPage }, function(data) {
      var options = [];

      // Добавление каждой опции в массив
      for (var i = 0; i < data.length; i++) {
        options.push({
          id: data[i].value,
          title: data[i].text
        });
      }

      callback(options); // Вызов callback функции для передачи опций
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
      loadOptions(1, callback); // Загрузка первой страницы опций
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

      checkSelectedOptions(); // Проверяем выбранные опции после каждого изменения
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

// Функция для проверки выбранных опций и отображения/скрытия кнопки "MainButton"
function checkSelectedOptions() {
  var hasSelected = false; // Флаг, указывающий наличие выбранных опций
  for (var key in selected) {
    if (selected.hasOwnProperty(key) && selected[key].length > 0) {
      hasSelected = true;
      break;
    }
  }
  if (hasSelected) {
    tg.MainButton.show(); // Показывает кнопку "MainButton"
  } else {
    tg.MainButton.hide(); // Скрывает кнопку "MainButton"
  }
}

// Инициализация скрипта для каждого селекта
$(document).ready(function() {
  var selects = [
    { selector: '#tags_general', jsonUrl: 'tags_general.json' },
    { selector: '#tags_content', jsonUrl: 'tags_content.json' },
    { selector: '#tags_universe', jsonUrl: 'tags_universe.json' },
    { selector: '#tags_character', jsonUrl: 'tags_universe.json' },
    { selector: '#tags_minus_general', jsonUrl: 'tags_general.json' },
    { selector: '#tags_minus_content', jsonUrl: 'tags_content.json' },
    { selector: '#tags_minus_universe', jsonUrl: 'tags_universe.json' },
    { selector: '#tags_minus_character', jsonUrl: 'tags_universe.json' },
  ];

  for (var i = 0; i < selects.length; i++) {
    new SelectWithJson(selects[i]);
    checkSelectedOptions(); // Проверяем выбранные опции после инициализации
  }
});

let item = "";

let btn1 = document.getElementById("btn1");

btn1.addEventListener("click", function(){
	if (tg.MainButton.isVisible) {
		tg.MainButton.hide();
	}
	else {
		tg.MainButton.setText("Вы выбрали товар 1!");
		item = "1";
		tg.MainButton.show();
	}
});

Telegram.WebApp.onEvent("mainButtonClicked", function(){
  tg.sendData(selected);
  tg.collapse(); // Закрываем WebApp после отправки данных
});

