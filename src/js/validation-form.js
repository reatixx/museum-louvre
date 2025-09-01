function generateTimeOptions() {
  const times = [];
  for (let hour = 9; hour <= 18; hour++) {
    times.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) times.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return times;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function validateInput(input, pattern, errorMessage) {
  let errorElement = input.parentElement.querySelector('.error-message');
  if (!errorElement) {
    errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.style.color = 'red';
    errorElement.style.fontSize = '11px';
    errorElement.style.marginTop = '5px';
    errorElement.style.display = 'block';
    errorElement.style.position = 'absolute';
    errorElement.style.whiteSpace = 'nowrap';
    errorElement.style.top = '-20px';
  }

  if (!pattern.test(input.value)) {
    input.style.border = '1px solid red';
    errorElement.textContent = errorMessage;
    if (!input.parentElement.contains(errorElement)) {
      input.parentElement.appendChild(errorElement);
    }
    return false;
  } else {
    input.style.border = '';
    if (errorElement.parentElement) errorElement.remove();
    return true;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const openPopupBtn = document.querySelector('.form__button');
  const popup = document.querySelector('#popup');
  const closePopupBtn = document.querySelector('.popup__close');
  const dateSelect = document.querySelector('#popup-date');
  const timeSelect = document.querySelector('#popup-time');
  const ticketTypeSelect = document.querySelector('#popup-ticket-type');
  const nameInput = document.querySelector('#popup-name');
  const emailInput = document.querySelector('#popup-email');
  const phoneInput = document.querySelector('#popup-phone');
  const entryItems = document.querySelectorAll('.popup__entry-item');
  const overviewDate = document.querySelector('.popup__overview-item--date span, .popup__overview-item:nth-child(1) span');
  const overviewTime = document.querySelector('.popup__overview-item--time span, .popup__overview-item:nth-child(2) span');
  const overviewTicketType = document.querySelector('.popup__overview-item--type span, .popup__overview-item:nth-child(3) span');
  const overviewBasicTickets = document.querySelector('.popup__ticket-item--basic p, .popup__ticket-item:nth-child(1) p');
  const overviewSeniorTickets = document.querySelector('.popup__ticket-item--senior p, .popup__ticket-item:nth-child(2) p');
  const overviewBasicPrice = document.querySelector('.popup__ticket-item--basic span, .popup__ticket-item:nth-child(1) span');
  const overviewSeniorPrice = document.querySelector('.popup__ticket-item--senior span, .popup__ticket-item:nth-child(2) span');
  const totalPrice = document.querySelector('.popup__total strong');
  const bookButton = document.querySelector('.popup__card-btn');

  let overlay = document.querySelector('.popup__overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'popup__overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.4)';
    overlay.style.zIndex = '998';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.4s';
    overlay.style.pointerEvents = 'none';
    document.body.appendChild(overlay);
  }

  const prices = {
    permanent: 20,
    temporary: 25,
    combined: 40,
  };

  let scrollY = 0;

  function toggleScrollLock(lock) {
  if (lock) {
    scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
  } else {
    const scrollYCurrent = scrollY;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.documentElement.style.scrollBehavior = 'auto';
    
    window.scrollTo({
      top: scrollYCurrent,
      left: 0,
      behavior: 'auto'
    });
    
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = '';
    }, 0);
  }
}

  function openPopup() {
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';
    popup.classList.add('active');
    popup.style.transform = 'translateX(-100%)';
    popup.style.opacity = '0';
    popup.style.transition = 'transform 0.5s cubic-bezier(.19,1,.22,1), opacity 0.5s cubic-bezier(.19,1,.22,1)';
    setTimeout(() => {
      popup.style.transform = 'translateX(0)';
      popup.style.opacity = '1';
    }, 10);
    toggleScrollLock(true);
  }

  function closePopup() {
    popup.style.transform = 'translateX(-100%)';
    popup.style.opacity = '0';
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    
    setTimeout(() => {
      popup.classList.remove('active');
      popup.style.transform = '';
      popup.style.opacity = '';
      popup.style.transition = '';
      toggleScrollLock(false);
    }, 400);
  }

  function loadTicketData() {
    try {
      const saved = JSON.parse(localStorage.getItem('ticketsData'));
      if (!saved) return { basic: 0, senior: 0, type: 'permanent', total: 0 };
      return {
        basic: Number(saved.basic) || 0,
        senior: Number(saved.senior) || 0,
        type: saved.type || 'permanent',
        total: Number(saved.total) || 0,
      };
    } catch (e) {
      console.warn('Failed to parse ticketsData from localStorage', e);
      return { basic: 0, senior: 0, type: 'permanent', total: 0 };
    }
  }

  if (openPopupBtn) {
    openPopupBtn.addEventListener('click', () => {
      const ticketData = loadTicketData();
      entryItems.forEach(item => {
        const type = item.dataset.type;
        const valueElem = item.querySelector('.popup__counter-value');
        if (type === 'basic') valueElem.textContent = ticketData.basic;
        if (type === 'senior') valueElem.textContent = ticketData.senior;
      });
      if (ticketTypeSelect) ticketTypeSelect.value = ticketData.type;
      updateOverview();
      openPopup();
    });
  }

  if (closePopupBtn) closePopupBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePopup();
  });

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  if (dateSelect) {
    dateSelect.min = `${yyyy}-${mm}-${dd}`;
    dateSelect.addEventListener('focus', function() {
      if (this.showPicker) this.showPicker();
    });
    const dateLabel = document.querySelector('label[for="popup-date"]');
    if (dateLabel) {
      dateLabel.addEventListener('click', function(e) {
        e.preventDefault();
        dateSelect.focus();
        if (dateSelect.showPicker) dateSelect.showPicker();
      });
    }
  }

  if (timeSelect) {
    timeSelect.innerHTML = '<option value="" disabled selected>Time</option>';
    generateTimeOptions().forEach(time => {
      const option = document.createElement('option');
      option.value = time;
      option.textContent = time;
      timeSelect.appendChild(option);
    });
  }

  function updateOverview() {
    const ticketType = ticketTypeSelect?.value || 'permanent';
    const ticketTypeText = ticketTypeSelect?.options[ticketTypeSelect.selectedIndex]?.text || 'Permanent exhibition';
    let displayDate = dateSelect?.value;
    if (displayDate) {
      const [year, month, day] = displayDate.split('-');
      displayDate = `${day}/${month}/${year}`;
      const dateObj = new Date(`${year}-${month}-${day}`);
      const options = { weekday: 'long', month: 'long', day: 'numeric' };
      displayDate = dateObj.toLocaleDateString('en-US', options);
    }

    if (overviewDate) overviewDate.textContent = displayDate || 'Choose date';
    if (overviewTime) overviewTime.textContent = timeSelect?.value || 'Choose time';
    if (overviewTicketType) overviewTicketType.textContent = ticketTypeText;

    let basicCount = 0, seniorCount = 0;
    entryItems.forEach(item => {
      const type = item.dataset.type;
      const value = parseInt(item.querySelector('.popup__counter-value').textContent) || 0;
      if (type === 'basic') basicCount = value;
      if (type === 'senior') seniorCount = value;
    });

    const basicPrice = prices[ticketType];
    const seniorPrice = basicPrice / 2;
    const total = basicCount * basicPrice + seniorCount * seniorPrice;

    if (overviewBasicTickets) overviewBasicTickets.innerHTML = `<strong>${basicCount}</strong> Basic (${basicPrice} €)`;
    if (overviewSeniorTickets) overviewSeniorTickets.innerHTML = `<strong>${seniorCount}</strong> Senior (${seniorPrice} €)`;
    if (overviewBasicPrice) overviewBasicPrice.textContent = `${basicCount * basicPrice} €`;
    if (overviewSeniorPrice) overviewSeniorPrice.textContent = `${seniorCount * seniorPrice} €`;
    if (totalPrice) totalPrice.textContent = `${total} €`;
  }

  if (dateSelect) dateSelect.addEventListener('change', updateOverview);
  if (timeSelect) timeSelect.addEventListener('change', updateOverview);
  if (ticketTypeSelect) ticketTypeSelect.addEventListener('change', updateOverview);
  entryItems.forEach(item => {
    const valueElem = item.querySelector('.popup__counter-value');
    const btns = item.querySelectorAll('.popup__counter-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        let count = parseInt(valueElem.textContent) || 0;
        if (btn.textContent === '+' && count < 10) {
          valueElem.textContent = count + 1;
        } else if (btn.textContent === '-' && count > 0) {
          valueElem.textContent = count - 1;
        }
        updateOverview();
      });
    });
  });

  const patterns = {
    name: /^[A-Za-zА-Яа-я\s]{3,15}$/,
    email: /^[A-Za-z0-9_-]{3,15}@[A-Za-z]{4,}\.[A-Za-z]{2,}$/,
    phone: /^(\d{2,3}[- ]?\d{2,3}[- ]?\d{2,4})$/,
  };

  if (bookButton) {
    bookButton.addEventListener('click', (e) => {
      e.preventDefault();
      const isNameValid = validateInput(nameInput, patterns.name, 'The name must contain 3-15 letters (Russian or English) or spaces');
      const isEmailValid = validateInput(emailInput, patterns.email, 'The email must be in the format: username (3-15 characters) @ domain (4+ letters) .com (2+ letters)');
      const isPhoneValid = validateInput(phoneInput, patterns.phone, 'The phone number must contain only digits, up to 10 maximum; spaces or hyphens are allowed');

      if (isNameValid && isEmailValid && isPhoneValid && dateSelect.value && timeSelect.value && ticketTypeSelect.value) {
        alert('Booking successful!');
        closePopup();
      } else {
        alert('Please fill in all fields correctly.');
      }
    });
  }
});