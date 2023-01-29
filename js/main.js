// Вычисляем верхний отступ нашего меню от начала страницы
const navbar = document.getElementById("nav");
const navPos = navbar.getBoundingClientRect().top;

// Получаем массив всех пунктов меню
const navbarLinks = document.querySelectorAll("#nav a");

// Изначально помечаем первый пункт меню активным
navbarLinks[0].classList.add("active");

// Получаем родительский элемент для меню
// Нам нужно будет прибавлять ему padding того же размера, что блок меню, когда будем меню доставать из потока
const container = document.getElementById("promo");

// Sticky nav menu should work only for big devices (not mobile)
if (document.documentElement.clientWidth > 780) {
  window.addEventListener("scroll", e => {

    const scrollPos = window.scrollY;

    if (scrollPos > navPos) {
      navbar.classList.add('fixed');
      container.classList.add('navbarOffsetMargin');
    } else {
      navbar.classList.remove('fixed');
      container.classList.remove('navbarOffsetMargin');
    }

    navbarLinks.forEach(link => {
      // Получаем блок на сайте, на который указывает ссылка в пункте меню
      const section = document.querySelector(link.hash);

      // Проверяем, доскроллил ли пользователь до данного блока или нет
      if (scrollPos + 80 > section.offsetTop && scrollPos + 80 < section.offsetTop + section.offsetHeight) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  });
}

/*** Clearing input fields after submitting ***/
document.querySelector(".capture-form__submit-button").addEventListener('click', () => {
  document.querySelector(".capture-form__phone-input").value = "";
});

document.querySelector(".promo__submit-button").addEventListener('click', () => {
  document.querySelector(".promo__phone-input").value = "";
});

const modalInputs = document.querySelectorAll(".modal__input");
const submitFormButtons = document.querySelectorAll(".modal__submit-button");
for (const button of submitFormButtons) {
  button.addEventListener('click', () => {
    for (const input of modalInputs) {
      input.value = "";
    }
  });
}

/**** Open / Close Mobile Menu ****/
const mobileMenuButton = document.getElementsByClassName("header__mobile-menu-button")[0];

mobileMenuButton.addEventListener('click', () => {
  navbar.classList.toggle("open");
});

/**** Initialize Modal Window ****/
const modal = new Modal({
  linkAttributeName: 'data-modal',
  beforeOpen: () => {
    const html = document.documentElement;
    html.style.scrollBehavior = "auto";
  },
  afterClose: () => {
    const html = document.documentElement;
    html.style.scrollBehavior = "smooth";
  },
});