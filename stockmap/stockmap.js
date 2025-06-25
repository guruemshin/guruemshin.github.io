// 초기 브랜드 저장 객체 (localStorage와 연동)
const brandLocations = {};

const initials = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function getInitialConsonant(char) {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return '';
  return initials[Math.floor(code / 588)];
}

function renderCategories() {
  const container = document.getElementById('categoryContainer');
  container.innerHTML = '';
  initials.forEach(initial => {
    const div = document.createElement('div');
    div.className = 'category';
    div.innerHTML = `<h2>${initial}</h2><ul></ul>`;
    div.querySelector('h2').addEventListener('click', () => {
      div.classList.toggle('open');
    });
    container.appendChild(div);
  });
}

function addBrandToCategory(name, location) {
  const firstChar = getInitialConsonant(name[0]);
  const categories = document.querySelectorAll('.category');
  let targetCategory = Array.from(categories).find(cat => cat.querySelector('h2').textContent === firstChar);
  if (!targetCategory) return false;
  const ul = targetCategory.querySelector('ul');
  const emptyMsg = ul.querySelector('.empty-msg');
  if (emptyMsg) emptyMsg.remove();

  const li = document.createElement('li');
  li.dataset.brand = name;
  li.innerHTML = `
    ${name} <span>(${location})</span>
    <button class="edit-btn" data-brand="${name}">수정</button>
    <button class="delete-btn" data-brand="${name}" style="color:red;">삭제</button>
  `;
  ul.appendChild(li);
  return true;
}

function updateEventListeners() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => editLocation(btn.dataset.brand);
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => deleteBrand(btn.dataset.brand);
  });
}

function editLocation(brand) {
  const newLocation = prompt(`${brand}의 새 위치:`, brandLocations[brand] || '');
  if (newLocation) {
    brandLocations[brand] = newLocation.trim();
    saveBrands();

    const li = document.querySelector(`li[data-brand='${brand}']`);
    if (li) {
      const span = li.querySelector('span');
      if (span) span.textContent = `(${brandLocations[brand]})`;
    }
  }
}

function deleteBrand(brand) {
  if (!confirm(`${brand} 삭제할까요?`)) return;
  delete brandLocations[brand];
  saveBrands();
  const li = document.querySelector(`li[data-brand='${brand}']`);
  if (li) li.remove();
}

function searchStock() {
  const keyword = document.querySelector('.search_box').value.trim();
  const resultDiv = document.getElementById('searchResult');
  let found = false;
  resultDiv.textContent = '';

  document.querySelectorAll('.category').forEach(category => {
    const ul = category.querySelector('ul');
    const items = ul.querySelectorAll('li');
    let match = false;

    items.forEach(item => {
      const brand = item.dataset.brand || '';
      if (brand.includes(keyword)) {
        item.style.display = '';
        found = true;
        match = true;
        resultDiv.textContent = `${brand} 위치: ${brandLocations[brand]}`;
      } else {
        item.style.display = 'none';
      }
    });

    if (!match) {
      if (!ul.querySelector('.empty-msg')) {
        const li = document.createElement('li');
        li.textContent = '검색된 브랜드가 없습니다.';
        li.className = 'empty-msg';
        ul.appendChild(li);
      }
    } else {
      const msg = ul.querySelector('.empty-msg');
      if (msg) msg.remove();
    }
  });

  if (!found && keyword) {
    resultDiv.textContent = `'${keyword}' 브랜드를 찾을 수 없습니다.`;
  }
}

function addBrand() {
  const name = document.getElementById('newBrand').value.trim();
  const loc = document.getElementById('newLocation').value.trim();
  if (!name || !loc) return alert('브랜드명과 위치를 입력하세요.');
  if (brandLocations[name]) return alert('이미 존재하는 브랜드입니다.');

  brandLocations[name] = loc;
  saveBrands();
  addBrandToCategory(name, loc);
  updateEventListeners();

  document.getElementById('newBrand').value = '';
  document.getElementById('newLocation').value = '';
}

function initBrandList() {
  renderCategories();
  for (const [name, loc] of Object.entries(brandLocations)) {
    addBrandToCategory(name, loc);
  }
  updateEventListeners();
}

function saveBrands() {
  localStorage.setItem('brandLocations', JSON.stringify(brandLocations));
}

function loadBrands() {
  const saved = localStorage.getItem('brandLocations');
  if (saved) Object.assign(brandLocations, JSON.parse(saved));
}

document.addEventListener('DOMContentLoaded', () => {
  loadBrands();
  initBrandList();
  document.querySelector('.search_but').addEventListener('click', searchStock);
  document.getElementById('addBrandButton').addEventListener('click', addBrand);
  document.getElementById('musinsaTitle').addEventListener('click', () => {
    document.querySelector('.search_box').value = '';
    document.getElementById('searchResult').textContent = '';
    initBrandList();
  });
  document.querySelector('.search_box').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchStock();
    }
  });
});
