class Modal {
  /**
   * При создании экземпляра класса, мы передаём в него
   * объект с настройками. Он становится доступен
   * в конструкторе класса в виде переменной props
   */
  constructor(props) {
    /**
     * Для удобства некоторые свойства можно не передавать
     * Мы должны заполнить их начальными значениями
     * Это можно сделать применив метод Object.assign
     */
    const defaultConfig = {
      linkAttributeName: 'data-modal',
      beforeOpen: () => { },
      afterClose: () => { },
    }
    this.config = Object.assign(defaultConfig, props);

    // Создаём триггеры состояния, полезные переменные и.т.д.
    this.isOpened = false; // открыто ли окно
    this.openedWindow = false; // ссылка на открытый .modal
    this._modalBlock = false; // ссылка на открытый .modal__window
    this.starter = false; // ссылка на элемент "открыватель" текущего окна (он нужен для возвращения фокуса на него)
    this._nextWindows = false; // ссылка на .modal который нужно открыть
    this._scrollPosition = 0; // текущая прокрутка
    this._reopenTrigger = false; // признак, чтобы попросить при закрытии модального окна сразу открыть другое
    this._focusElements = [  // Все возможные CSS селекторы элементов, на которые может быть передан фокус
      'a[href]',
      'area[href]',
      'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
      'select:not([disabled]):not([aria-hidden])',
      'textarea:not([disabled]):not([aria-hidden])',
      'button:not([disabled]):not([aria-hidden])',
      'iframe',
      'object',
      'embed',
      '[contenteditable]',
      '[tabindex]:not([tabindex^="-"])'
    ];

    // Создаём только одну подложку на все модальные окна в HTML страницы
    // и вставляем её в конец body
    // В свойство this._overlay будет положен div с визуальной подложкой
    const existingOverlay = document.querySelector('.modal__overlay');
    if (existingOverlay) {
      this._overlay = existingOverlay;
    } else {
      this._overlay = document.createElement('div');
      this._overlay.classList.add('modal__overlay');
      document.body.appendChild(this._overlay);
    }

    //Запускаем метод для обработки событий
    this.eventsFeeler();
  }

  eventsFeeler() {
    /**
     * Нужно обработать открытие окон по клику на элементы с data-атрибутом
     * который мы установили в конфигурации - this.config.linkAttributeName
     * Здесь мы используем делегирование события клика, чтобы обойтись одним
     * лишь обработчиком события на элементе html
     */
    document.addEventListener("click", (e) => {
      // Определяем попал ли клик на элемент, который открывает окно
      const clickedLink = e.target.closest(`[${this.config.linkAttributeName}]`);

      // Если действительно клик был на элементе открытия окна, находим подходящее окно,
      // заполняем свойства _nextWindows и _starter и вызываем метод open
      if (clickedLink) {
        e.preventDefault();
        this.starter = clickedLink;
        const targetSelector = this.starter.getAttribute(this.config.linkAttributeName);
        this._nextWindows = document.querySelector(targetSelector);
        this.open();
        return;
      }

      // Если событие вызвано на элементе с data-атрибутом data-close,
      // значит вызовем метод закрытия окна
      if (e.target.closest('[data-close]')) {
        this.close();
      }
    });

    // Обработаем клавишу escape и tab
    window.addEventListener("keydown", (e) => {
      //закрытие окна по escape
      if (e.which === 27 && this.isOpened) {
        e.preventDefault();
        this.close();
        return;
      }

      /** Вызовем метод для управления фокусом по Tab
       * и всю ответственность переложим на него
       */
      if (e.which === 9 && this.isOpened) {
        this.focusCatcher(e);
      }
    });

    /* Закрытие модального окна по клику на Overlay */
    document.addEventListener('mousedown', (e) => {
      /**
       * Проверяем было ли нажатие над .modal__window-wrap,
       * и отмечаем это в свойстве this._overlayChecker
       */
      if (!e.target.classList.contains('modal__window-wrap')) return;
      this._overlayChecker = true;
    });

    /* Закрытие модального окна по клику на Overlay – продолжение */
    document.addEventListener('mouseup', (e) => {
      /**
       * Проверяем было ли отпускание мыши над .modal__window-wrap,
       * и если нажатие тоже было на нём, то закрываем окно
       * и обнуляем this._overlayChecker в любом случае
       */
      if (this._overlayChecker && e.target.classList.contains('modal__window-wrap')) {
        e.preventDefault();
        this._overlayChecker = !this._overlayChecker;
        this.close();
        return;
      }
      this._overlayChecker = false;
    });
  }

  /** Метод для открытия модального окна **/
  open() {
    if (!this._nextWindows) {
      console.log('Warning: modal selector is not found');
      return;
    }

    // Если мы хотим открыть новое модальное окно, а у нас уже открыто другое окно
    if (this.isOpened) {
      this._reopenTrigger = true;
      this.close();
      return;
    }

    this.openedWindow = this._nextWindows;
    this._modalBlock = this.openedWindow.querySelector('.modal__window');
    this.config.beforeOpen(this);

    /** Вызываем метод управления скроллом
     * он будет блокировать/разблокировать
     * страницу в зависимости от свойства this.isOpened
     */
    this._bodyScrollControl();
    this._overlay.classList.add("modal__overlay_active");
    this.openedWindow.classList.add("modal_active");
    this.openedWindow.setAttribute('aria-hidden', 'false');

    this.focusControl(); // Вызываем метод перевода фокуса
    this.isOpened = true;
  }

  /** Метод закрытия текущего окна **/
  close(){
    if (!this.isOpened) return;
    this.openedWindow.classList.remove("modal_active");
    this._overlay.classList.remove("modal__overlay_active");
    this.openedWindow.setAttribute('aria-hidden', 'true');

    // Возвращаем фокус на элемент которым открылось окно
    this.focusControl();

    // Возвращаем скролл
    this._bodyScrollControl();
    this.isOpened = false;

    // Если был передан колбек, который нужно выполнять при закрытии окна - выполняем его
    this.config.afterClose(this);

    // Если при закрытии текущего модального окна сразу нужно открыть другое
    if (this._reopenTrigger) {
      this._reopenTrigger = false;
      this.open();
    }
  }

  _bodyScrollControl() {
    // Находим тег html и сохраняем его
    const html = document.documentElement;

    if (this.isOpened === true) {
      // Разблокировка страницы
      html.classList.remove("modal__opened");
      // Убираем временный margin на ширину скроллбара, если добавляли его при открытии модального окна
      html.style.marginRight = "";

      // Прокручиваем страницу туда где она была до открытия модалки
      window.scrollTo(0, this._scrollPosition);
      html.style.top = "";

      return;
    }

    // Блокировка страницы
    this._scrollPosition = window.pageYOffset; // Запоминаем текущую прокрутку страницы
    html.style.top = `${-this._scrollPosition}px`; // Установим свойство top у html равное прокрутке
    html.classList.add("modal__opened");

    // Определяем фактический размер скроллбара в браузере
    // Так как скроллбар пропадет при появлении модального окна - нужно компенсировать его ширину
    const marginSize = window.innerWidth - html.clientWidth;
    // Ширина скроллбара равна разнице ширины окна и ширины документа (селектора html)
    if (marginSize) {
      html.style.marginRight = `${marginSize}px`;
    }
  }

  // Метод переносит фокус с элемента открывающего окно в само окно, и обратно, когда окно закрывается
  // Если окно открывается – находим первый элемент в окне, на который можно поставить фокус
  // Если же окно закрывается – то переводим фокус на this.starter
  focusControl() {
    const nodes = this.openedWindow.querySelectorAll(this._focusElements);
    if (this.isOpened && this.starter) {
      this.starter.focus();
    } else {
      if (nodes.length) nodes[0].focus();
    }
  }

  // Пока модальное окно открыто, табуляция будет работать только по элементам окна по кругу
  focusCatcher(e) {
    // Находим все элементы внутри модального окна, на которые можно сфокусироваться
    const nodes = this.openedWindow.querySelectorAll(this._focusElements);

    // Преобразуем в массив
    const nodesArray = Array.prototype.slice.call(nodes);

    // Если фокуса нет в окне, то вставляем фокус на первый элемент
    if (!this.openedWindow.contains(document.activeElement)) {
      nodesArray[0].focus();
      e.preventDefault();
    } else {
      const focusedItemIndex = nodesArray.indexOf(document.activeElement)
      if (e.shiftKey && focusedItemIndex === 0) {
        // Перенос фокуса на последний элемент
        nodesArray[nodesArray.length - 1].focus();
        e.preventDefault();
      }
      if (!e.shiftKey && focusedItemIndex === nodesArray.length - 1) {
        // Перенос фокуса на первый элемент
        nodesArray[0].focus();
        e.preventDefault();
      }
    }
  }
}