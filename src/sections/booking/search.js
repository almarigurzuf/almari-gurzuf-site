import flatpickr from 'flatpickr';

/**
 * Логика работы поисковой панели и календаря Flatpickr
 */
export function initSearchPanel() {
    const arrivalDate = document.getElementById('dfrom');
    const departureDate = document.getElementById('dto');
    const arrivalDisplay = document.getElementById('arrival_display');
    const departureDisplay = document.getElementById('departure_display');
    const adultsSelect = document.getElementById('adults');
    const adultsDisplay = document.getElementById('adults_display');
    const guestsGroup = document.getElementById('guests_group');
    const guestsDropdown = document.getElementById('guests_dropdown');
    const arrivalGroup = document.getElementById('arrival_group');
    const departureGroup = document.getElementById('departure_group');
    
    const mainCountEl = document.getElementById('main_count');
    const mainMinus = document.getElementById('main_minus');
    const mainPlus = document.getElementById('main_plus');
    const extraPlaceToggle = document.getElementById('extra_place');
    const applyGuestsBtn = document.getElementById('apply_guests');

    if (arrivalGroup && departureGroup) {
        if (arrivalGroup.classList.contains('flatpickr-initialized')) return;
        arrivalGroup.classList.add('flatpickr-initialized');

        const isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;

        if (arrivalDate) arrivalDate.value = "";
        if (departureDate) departureDate.value = "";

        // Инициализируем ВЫЕЗД
        const departurePicker = flatpickr("#departure_group", {
            locale: "ru",
            dateFormat: "Y-m-d",
            minDate: new Date().fp_incr(1),
            disableMobile: true,
            showMonths: 1,
            onOpen: (selectedDates, dateStr, instance) => {
                departureGroup.classList.add('active');
                document.body.classList.add('calendar-modal-open');
            },
            onClose: () => {
                departureGroup.classList.remove('active');
                document.body.classList.remove('calendar-modal-open');
            },
            onChange: (selectedDates, dateStr, instance) => {
                if (selectedDates.length > 0) {
                    const d = selectedDates[0];
                    const options = { day: 'numeric', month: 'long', weekday: 'long' };
                    if (departureDisplay) departureDisplay.innerText = d.toLocaleDateString('ru-RU', options);
                    if (departureDate) departureDate.value = dateStr;

                    setTimeout(() => {
                        if (guestsDropdown) {
                            guestsDropdown.classList.add('active');
                            guestsGroup.classList.add('active');
                            document.body.classList.add('calendar-modal-open');
                        }
                    }, 300);
                }
            }
        });

        // Инициализируем ЗАЕЗД
        const arrivalPicker = flatpickr("#arrival_group", {
            locale: "ru",
            dateFormat: "Y-m-d",
            minDate: "today",
            disableMobile: true,
            showMonths: 1,
            onOpen: (selectedDates, dateStr, instance) => {
                arrivalGroup.classList.add('active');
                document.body.classList.add('calendar-modal-open');
            },
            onClose: () => {
                arrivalGroup.classList.remove('active');
                document.body.classList.remove('calendar-modal-open');
            },
            onChange: (selectedDates, dateStr, instance) => {
                if (selectedDates.length > 0) {
                    const d = selectedDates[0];
                    const options = { day: 'numeric', month: 'long', weekday: 'long' };
                    if (arrivalDisplay) arrivalDisplay.innerText = d.toLocaleDateString('ru-RU', options);
                    if (arrivalDate) arrivalDate.value = dateStr;

                    if (departurePicker) {
                        departurePicker.set("minDate", dateStr);
                        departurePicker.jumpToDate(dateStr);
                        setTimeout(() => {
                            departurePicker.open();
                        }, 200);
                    }
                }
            }
        });

        // Гости (Counter Logic)
        if (guestsGroup && guestsDropdown) {
            let mainCount = 2;
            let extraPlace = false;

            const updateGuestsDisplay = () => {
                let text = `${mainCount} ${getGuestWord(mainCount)}`;
                if (extraPlace) text += ' + доп.';
                if (adultsDisplay) adultsDisplay.innerText = text;
                if (adultsSelect) {
                    const total = mainCount + (extraPlace ? 1 : 0);
                    adultsSelect.value = total > 6 ? 6 : total; 
                }
                if (mainMinus) mainMinus.disabled = mainCount <= 1;
                if (mainPlus) mainPlus.disabled = mainCount >= 6;
            };

            const getGuestWord = (count) => {
                const lastDigit = count % 10;
                if (count >= 11 && count <= 14) return 'гостей';
                if (lastDigit === 1) return 'гость';
                if (lastDigit >= 2 && lastDigit <= 4) return 'гостя';
                return 'гостей';
            };

            // Открытие/закрытие по клику на группу
            guestsGroup.addEventListener('click', (e) => {
                const isDropdownClick = e.target.closest('.luxury-dropdown');
                const isApplyBtn = e.target.id === 'apply_guests' || e.target.closest('#apply_guests');
                
                // Если клик по самому дропдауну (не по кнопке Применить), то не переключаем состояние
                if (isDropdownClick && !isApplyBtn) return;
                
                e.stopPropagation();
                const isActive = guestsDropdown.classList.toggle('active');
                guestsGroup.classList.toggle('active');
                
                if (isActive) {
                    document.body.classList.add('calendar-modal-open');
                } else {
                    document.body.classList.remove('calendar-modal-open');
                }
            });

            // Кнопки счетчика
            if (mainMinus) {
                mainMinus.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (mainCount > 1) {
                        mainCount--;
                        mainCountEl.innerText = mainCount;
                        updateGuestsDisplay();
                    }
                });
            }

            if (mainPlus) {
                mainPlus.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (mainCount < 6) {
                        mainCount++;
                        mainCountEl.innerText = mainCount;
                        updateGuestsDisplay();
                    }
                });
            }

            if (extraPlaceToggle) {
                extraPlaceToggle.addEventListener('change', (e) => {
                    extraPlace = e.target.checked;
                    updateGuestsDisplay();
                });
                // Предотвращаем закрытие при клике на сам переключатель
                extraPlaceToggle.closest('.luxury-switch').addEventListener('click', (e) => e.stopPropagation());
            }

            if (applyGuestsBtn) {
                applyGuestsBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    guestsDropdown.classList.remove('active');
                    guestsGroup.classList.remove('active');
                    document.body.classList.remove('calendar-modal-open');
                });
            }

            // Закрытие при клике вне
            document.addEventListener('click', (e) => {
                const isClickInsideGroup = guestsGroup.contains(e.target);
                const isClickInsideDropdown = guestsDropdown.contains(e.target);
                
                if (!isClickInsideGroup && !isClickInsideDropdown) {
                    guestsDropdown.classList.remove('active');
                    guestsGroup.classList.remove('active');
                    document.body.classList.remove('calendar-modal-open');
                }
            });
            
            updateGuestsDisplay();
        }

        // --- Обработка кнопки "Найти номер" ---
        const searchForm = document.querySelector('.luxury-search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                const arrival = document.getElementById('dfrom').value;
                const departure = document.getElementById('dto').value;

                if (!arrival || !departure) {
                    e.preventDefault();
                    
                    // Эффект тряски для привлечения внимания
                    const targetGroup = !arrival ? arrivalGroup : departureGroup;
                    targetGroup.classList.add('shake-error');
                    setTimeout(() => targetGroup.classList.remove('shake-error'), 500);

                    // Автоматически открываем календарь
                    if (!arrival) {
                        arrivalPicker.open();
                    } else {
                        departurePicker.open();
                    }
                }
            });
        }
    }
}
