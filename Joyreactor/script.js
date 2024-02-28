var tg = window.Telegram.WebApp;

tg.expand(); // Открывает приложение во весь экран

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

      selected[selectorKey] = selectedValue;
      console.log(selected);

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
    tg.MainButton.setText("Подтвердить")
    tg.MainButton.show(); // Показывает кнопку "MainButton"
  } else {
    tg.MainButton.hide(); // Скрывает кнопку "MainButton"
  }
}

// Инициализация скрипта для каждого селекта
$(document).ready(function() {
  var selects = [
    { selector: '#tags_joyreactor_general', jsonUrl: 'tags_joyreactor.json' },
    { selector: '#tags_joyreactor_minus_general', jsonUrl: 'tags_joyreactor.json' }
  ];

  for (var i = 0; i < selects.length; i++) {
    new SelectWithJson(selects[i]);
    checkSelectedOptions(); // Проверяем выбранные опции после инициализации
  }

  Telegram.WebApp.onEvent("mainButtonClicked", function() {
    try {
      var selectedString = JSON.stringify(selected); // Преобразуем selected в строку
      tg.sendData(selectedString); // Отправляем строку с данными в телеграм-бот
    } catch (err) {
      tg.sendData("Error2: " + err);
    }
  });
});

