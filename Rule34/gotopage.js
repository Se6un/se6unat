// Функция для перехода на указанную страницу
function goToPage(pageNumber) {
  var pages = document.getElementsByClassName("page");
  Array.from(pages).forEach(function(page) {
    page.classList.remove("active-page");
    page.style.opacity = 0;
    page.style.transform = "translateY(-100%)";
  });
  pages[pageNumber - 1].classList.add("active-page");
  setTimeout(function() {
    pages[pageNumber - 1].style.transform = "translateY(0)";
    pages[pageNumber - 1].style.opacity = 1;
  }, 50);
}

// Отображение первой страницы при загрузке сайта
window.addEventListener("load", function() {
  goToPage(1);
});