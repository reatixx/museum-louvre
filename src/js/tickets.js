document.addEventListener("DOMContentLoaded", () => {
  const basicInput = document.querySelector('input[name="basic"]');
  const seniorInput = document.querySelector('input[name="senior"]');
  const typeInputs = document.querySelectorAll('input[name="exhibition"]');
  const totalElem = document.querySelector('.form__total');

  if (!basicInput || !seniorInput || !totalElem || typeInputs.length === 0) {
    console.error('tickets.js — required elements not found in DOM');
    return;
  }

  const basicPanel = basicInput.closest('.amount__panel');
  const seniorPanel = seniorInput.closest('.amount__panel');

  const basicBtns = basicPanel ? basicPanel.querySelectorAll('.amount__btn') : [];
  const basicLessBtn = basicPanel ? (basicPanel.querySelector('.amount__btn--less') || basicBtns[0]) : null;
  const basicMoreBtn = basicPanel ? (basicPanel.querySelector('.amount__btn--more') || basicBtns[1]) : null;

  const seniorBtns = seniorPanel ? seniorPanel.querySelectorAll('.amount__btn') : [];
  const seniorLessBtn = seniorBtns[0] || null;
  const seniorMoreBtn = seniorBtns[1] || null;

  const PRICES = { permanent: 20, temporary: 25, combined: 40 };

  function formatEuro(n) {
    return (Math.round(n * 100) % 100 === 0) ? `€${Math.round(n)}` : `€${n.toFixed(2)}`;
  }

  function saveData(total) {
    const payload = {
      basic: Number(basicInput.value),
      senior: Number(seniorInput.value),
      type: document.querySelector('input[name="exhibition"]:checked').value,
      total: total
    };
    try {
      localStorage.setItem('ticketsData', JSON.stringify(payload));
    } catch (e) {
      console.warn('tickets: cannot save to localStorage', e);
    }
  }

  function loadData() {
    try {
      const saved = JSON.parse(localStorage.getItem('ticketsData'));
      if (!saved) return;
      if (typeof saved.basic !== 'undefined') basicInput.value = saved.basic;
      if (typeof saved.senior !== 'undefined') seniorInput.value = saved.senior;
      if (saved.type) {
        const el = document.querySelector(`input[name="exhibition"][value="${saved.type}"]`);
        if (el) el.checked = true;
      }
    } catch (e) {
      console.warn('tickets: failed to parse saved data', e);
    }
  }

  function updateTotal() {
    const type = document.querySelector('input[name="exhibition"]:checked')?.value || 'permanent';
    const basicCount = Math.max(0, Number(basicInput.value) || 0);
    const seniorCount = Math.max(0, Number(seniorInput.value) || 0);

    const basicPrice = PRICES[type];
    const seniorPrice = basicPrice / 2;

    const total = basicCount * basicPrice + seniorCount * seniorPrice;
    totalElem.textContent = `Total ${formatEuro(total)}`;

    if (basicLessBtn) basicLessBtn.disabled = basicCount <= 0;
    if (seniorLessBtn) seniorLessBtn.disabled = seniorCount <= 0;

    saveData(total);
  }

  function changeCount(input, delta) {
    let val = Number(input.value) + delta;
    if (val < 0) val = 0;
    input.value = val;
    updateTotal();
  }

  if (basicLessBtn) basicLessBtn.addEventListener('click', () => changeCount(basicInput, -1));
  if (basicMoreBtn) basicMoreBtn.addEventListener('click', () => changeCount(basicInput, +1));
  if (seniorLessBtn) seniorLessBtn.addEventListener('click', () => changeCount(seniorInput, -1));
  if (seniorMoreBtn) seniorMoreBtn.addEventListener('click', () => changeCount(seniorInput, +1));

  basicInput.addEventListener('input', updateTotal);
  seniorInput.addEventListener('input', updateTotal);

  typeInputs.forEach(r => r.addEventListener('change', updateTotal));

  loadData();
  updateTotal();
});
