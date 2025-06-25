// 브랜드별 위치 저장 객체 (초기값 예시)
// 브랜드별 위치 저장 객체 (초기값 없음)
const brandLocations = {};

// 한글 초성 추출 함수
function getInitialConsonant(char) {
  const code = char.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return '';
  const initial = Math.floor(code / 588);
  const initials = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  return initials[initial];
}

// 브랜드 목록에 li 추가
function addBrandToCategory(name, location) {
  const firstChar = getInitialConsonant(name[0]);
  let targetCategory = null;
  const categories = document.querySelectorAll('.category');

  categories.forEach(cat => {
    if (cat.querySelector('h2').textContent === firstChar) {
      targetCategory = cat;
    }
  });

  // ✅ 대분류(초성 h2)가 없으면 생성
  if (!targetCategory) {
    const brandList = document.querySelector('.brand_list > div');

    const newCategory = document.createElement('div');
    newCategory.className = 'category';
    newCategory.innerHTML = `
      <h2>${firstChar}</h2>
      <ul></ul>
    `;
    brandList.appendChild(newCategory);

    newCategory.querySelector('h2').addEventListener('click', () => {
      newCategory.classList.toggle('open');
    });

    targetCategory = newCategory;
  }

  const ul = targetCategory.querySelector('ul');
  const emptyMsg = ul.querySelector('.empty-msg');
  if (emptyMsg) emptyMsg.remove();

  const li = document.createElement('li');
  li.dataset.brand = name;
  li.innerHTML = `
    ${name}
    <span>(${location})</span>
    <button onclick="editLocation('${name}')">수정</button>
    <button onclick="deleteBrand('${name}')" style="color: red;">삭제</button>
  `;
  ul.appendChild(li);
  return true;
}

// 검색 함수
function searchStock() {
  const keyword = document.querySelector('.search_box').value.trim();
  const categories = document.querySelectorAll('.category');
  let found = false;
  const resultDiv = document.getElementById('searchResult');
  resultDiv.textContent = '';

  categories.forEach(category => {
    const items = category.querySelectorAll('li');
    items.forEach(item => {
      const brand = item.dataset.brand || item.textContent.trim().split(' ')[0];
      if (brand.includes(keyword)) {
        item.style.display = '';
        found = true;
        if (brandLocations[brand]) {
          resultDiv.textContent = `${brand} 위치: ${brandLocations[brand]}`;
        }
      } else {
        item.style.display = 'none';
      }
    });

    const ul = category.querySelector('ul');
    const visibleItems = Array.from(ul.querySelectorAll('li')).filter(i => i.style.display !== 'none');

    if (visibleItems.length === 0) {
      if (!ul.querySelector('.empty-msg')) {
        const liEmpty = document.createElement('li');
        liEmpty.textContent = '검색된 브랜드가 없습니다.';
        liEmpty.className = 'empty-msg';
        ul.appendChild(liEmpty);
      }
    } else {
      const emptyMsg = ul.querySelector('.empty-msg');
      if (emptyMsg) emptyMsg.remove();
    }
  });

  if (!found && keyword !== '') {
    resultDiv.textContent = `'${keyword}' 브랜드를 찾을 수 없습니다.`;
  }
}

// 위치 수정
function editLocation(brand) {
  const newLocation = prompt(`${brand}의 새 위치를 입력하세요 (예: 2.B.03):`, brandLocations[brand] || '');
  if (newLocation !== null && newLocation.trim() !== '') {
    brandLocations[brand] = newLocation.trim();

    const items = document.querySelectorAll('li');
    items.forEach(item => {
      if ((item.dataset.brand || '') === brand) {
        const span = item.querySelector('span');
        if (span) span.textContent = `(${brandLocations[brand]})`;
      }
    });

    saveBrandLocations(); // ✅ 저장
  }
}

// 브랜드 삭제
function deleteBrand(brand) {
  if (!confirm(`${brand} 브랜드를 삭제하시겠습니까?`)) return;
  delete brandLocations[brand];

  const items = document.querySelectorAll('li');
  items.forEach(item => {
    if ((item.dataset.brand || '') === brand) {
      const ul = item.closest('ul');
      item.remove();

      const remaining = ul.querySelectorAll('li[data-brand]');
      if (remaining.length === 0 && !ul.querySelector('.empty-msg')) {
        const liEmpty = document.createElement('li');
        liEmpty.textContent = '등록된 브랜드가 없습니다.';
        liEmpty.className = 'empty-msg';
        ul.appendChild(liEmpty);
      }
    }
  });

  saveBrandLocations(); // ✅ 저장
}

// 브랜드 추가
function addBrand() {
  const nameInput = document.getElementById('newBrand');
  const locationInput = document.getElementById('newLocation');
  const name = nameInput.value.trim();
  const location = locationInput.value.trim();

  if (!name || !location) {
    alert('브랜드명과 위치를 모두 입력해주세요.');
    return;
  }

  if (brandLocations[name]) {
    alert('이미 존재하는 브랜드입니다.');
    return;
  }

  brandLocations[name] = location;
  const success = addBrandToCategory(name, location);
  if (!success) return;

  nameInput.value = '';
  locationInput.value = '';

  saveBrandLocations(); // ✅ 저장
}

// 초기화 함수
function initBrandList() {
  const categories = document.querySelectorAll('.category');
  categories.forEach(cat => {
    const ul = cat.querySelector('ul');
    if (ul) ul.innerHTML = '';
  });

  for (const [brand, loc] of Object.entries(brandLocations)) {
    addBrandToCategory(brand, loc);
  }

  categories.forEach(cat => {
    const ul = cat.querySelector('ul');
    if (ul && ul.children.length === 0) {
      const liEmpty = document.createElement('li');
      liEmpty.textContent = '등록된 브랜드가 없습니다.';
      liEmpty.className = 'empty-msg';
      ul.appendChild(liEmpty);
    }
  });
}

// 대분류 열고 닫기
function setupCategoryToggle() {
  const categories = document.querySelectorAll('.category');
  categories.forEach(category => {
    const header = category.querySelector('h2');
    header.style.userSelect = 'none';
    header.addEventListener('click', () => {
      category.classList.toggle('open');
    });
  });
}

// 페이지 리셋
function resetPage() {
  document.querySelector('.search_box').value = '';
  document.getElementById('searchResult').textContent = '';
  const categories = document.querySelectorAll('.category');
  categories.forEach(cat => cat.classList.remove('open'));
  initBrandList();
}

// ✅ localStorage 불러오기
function loadBrandLocations() {
  const saved = localStorage.getItem('brandLocations');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(brandLocations, parsed);
    } catch (e) {
      console.error('브랜드 정보 로딩 실패:', e);
    }
  }
}

// ✅ localStorage 저장하기
function saveBrandLocations() {
  localStorage.setItem('brandLocations', JSON.stringify(brandLocations));
}

// 시작 시 실행
document.addEventListener('DOMContentLoaded', () => {
  loadBrandLocations(); // ✅ 불러오기

  document.querySelector('.search_but').addEventListener('click', searchStock);
  setupCategoryToggle();
  initBrandList();
  document.getElementById('musinsaTitle').addEventListener('click', resetPage);

  // ✅ 검색창에서 엔터키로도 검색 가능
  const searchInput = document.querySelector('.search_box');
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchStock();
    }
  });
});
