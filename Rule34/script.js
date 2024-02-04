// Переменная которая хранит в себе во выбраном
var selected = [];
// Функция-конструктор скрипта
function SelectWithJson(options) {
  // Параметры прокрутки
  var perPage = options.perPage || 10; // Количество опций для загрузки на каждую страницу
  var nextPage = options.nextPage || 2; // Номер следующей страницы для загрузки (начинается с 2, так как первая страница уже загружена)

  // Путь до JSON-файла
  var jsonUrl = options.jsonUrl || 'tags_general.json';

  // Функция для загрузки опций с JSON
  function loadOptions(page, callback) {
    // Загрузка опций с JSON
    $.getJSON(jsonUrl, { page: page, per_page: perPage }, function(data) {
      // Создание массива опций
      var options = [];

      // Добавление каждой опции в массив
      for (var i = 0; i < data.length; i++) {
        options.push({
          id: data[i].value,
          title: data[i].text
        });
      }

      // Вызов callback функции для передачи опций
      callback(options);
    });
  }

  // Инициализация Selectize.js с плагином Infinite Scroll
  var $select = $(options.selector).selectize({
    maxItems: null,
    valueField: 'id',
    labelField: 'title',
    searchField: 'title',
    plugins: ['infinite_scroll','remove_button'],
    preload: true,
    
    load: function(query, callback) {
      loadOptions(1, callback); // Загрузка первой страницы опций
    },
    onChange: function(value) {
      // Получение информации о выбранном значении
      var selectorKey = options.selector.substring(1);
      var selectedValue = value.map(function(val) {
        if (selectorKey.startsWith('tags_minus_')) {
          return '-' + val;
        } else if (selectorKey.startsWith('tags_')) {
          return '+' + val;
        }
      });
    
      // Добавляем или обновляем информацию в объекте selected
      selected[selectorKey] = selectedValue;
    
      console.log(options.selector + ':', selected);
    }
  });

  // Загрузка следующих страниц опций по мере прокрутки
  $select[0].selectize.on('dropdown_open', function() {
    if ($select[0].selectize.currentResults.items.length >= $select[0].selectize.settings.maxOptions) {
      // Загружаем следующую страницу опций, если текущее количество опций равно максимальному количеству опций
      loadOptions(nextPage, function(options) {
        $select[0].selectize.addOption(options);
        nextPage++;
      });
    }
  });
}

// Инициализация скрипта для каждого селекта
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
  }
});



let tg = window.Telegram.WebApp;
tg.expand();
tg.MainButton.textColor = '#FFFFFF';
tg.MainButton.color = '#2cab37';
Telegram.WebApp.onEvent("mainButtonClicked", function(){
	tg.sendData(selected);
});