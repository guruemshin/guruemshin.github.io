// 브랜드별 위치 저장 객체 (초기값 예시)
const brandLocations = {

};

// 한글 초성 추출 함수
const initials = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
function getInitialConsonant(char) {
  const code = char.charCodeAt(0) - 0xAC00;
  return code < 0 || code > 11171 ? '' : initials[Math.floor(code / 588)];
}

// 브랜드 추가
function addBrandToCategory(name, location) {
  const firstChar = getInitialConsonant(name[0]);
  const targetCategory = [...document.querySelectorAll('.category')].find(cat => 
    cat.querySelector('h2').textContent === firstChar
  );

  if (!targetCategory) {
    alert('해당 초성의 대분류가 없습니다.');
    return false;
  }

  const ul = targetCategory.querySelector('ul');
  ul.querySelector('.empty-msg')?.remove();

  const li = document.createElement('li');
  li.dataset.brand = name;
  li.innerHTML = `
    ${name} <span>(${location})</span>
    <button onclick="editLocation('${name}')">수정</button>
    <button onclick="deleteBrand('${name}')" style="color: red;">삭제</button>
  `;
  ul.appendChild(li);
  return true;
}

// 검색
function searchStock() {
  const keyword = document.querySelector('.search_box').value.trim();
  const categories = document.querySelectorAll('.category');
  let found = false;

  categories.forEach(category => {
    const ul = category.querySelector('ul');
    const items = category.querySelectorAll('li[data-brand]');
    let matchInCategory = false;

    items.forEach(item => {
      if (item.dataset.brand.includes(keyword)) {
        item.style.display = '';
        matchInCategory = true;
        found = true;
      } else {
        item.style.display = 'none';
      }
    });

    ul.querySelector('.empty-msg')?.remove();

    if (!matchInCategory && keyword !== '') {
      const liEmpty = document.createElement('li');
      liEmpty.textContent = '검색된 브랜드가 없습니다.';
      liEmpty.className = 'empty-msg';
      ul.appendChild(liEmpty);
    }
  });

  if (!found && keyword !== '') alert('해당 브랜드를 찾을 수 없습니다.');
}

// 위치 수정
function editLocation(brand) {
  const newLocation = prompt(`${brand}의 새 위치를 입력하세요 (예: 2.B.03):`, brandLocations[brand] || '');
  if (newLocation) {
    brandLocations[brand] = newLocation.trim();
    document.querySelectorAll(`li[data-brand="${brand}"] span`).forEach(span => {
      span.textContent = `(${brandLocations[brand]})`;
    });
  }
}

// 브랜드 삭제
function deleteBrand(brand) {
  if (!confirm(`${brand} 브랜드를 삭제하시겠습니까?`)) return;
  delete brandLocations[brand];

  document.querySelectorAll(`li[data-brand="${brand}"]`).forEach(item => {
    const ul = item.closest('ul');
    item.remove();
    if (!ul.querySelector('li[data-brand]')) {
      const liEmpty = document.createElement('li');
      liEmpty.textContent = '등록된 브랜드가 없습니다.';
      liEmpty.className = 'empty-msg';
      ul.appendChild(liEmpty);
    }
  });
}

// 브랜드 추가 버튼 동작
function addBrand() {
  const name = document.getElementById('newBrand').value.trim();
  const location = document.getElementById('newLocation').value.trim();

  if (!name || !location) return alert('브랜드명과 위치를 모두 입력해주세요.');
  if (brandLocations[name]) return alert('이미 존재하는 브랜드입니다.');

  brandLocations[name] = location;
  if (addBrandToCategory(name, location)) {
    document.getElementById('newBrand').value = '';
    document.getElementById('newLocation').value = '';
  }
}

// 초기 브랜드 리스트 그리기
function initBrandList() {
  document.querySelectorAll('.category ul').forEach(ul => ul.innerHTML = '');
  for (const [brand, loc] of Object.entries(brandLocations)) addBrandToCategory(brand, loc);

  document.querySelectorAll('.category ul').forEach(ul => {
    if (!ul.querySelector('li[data-brand]')) {
      const liEmpty = document.createElement('li');
      liEmpty.textContent = '등록된 브랜드가 없습니다.';
      liEmpty.className = 'empty-msg';
      ul.appendChild(liEmpty);
    }
  });
}

// 카테고리 열기/닫기
function setupCategoryToggle() {
  document.querySelectorAll('.category h2').forEach(header => {
    header.style.userSelect = 'none';
    header.addEventListener('click', () => header.parentElement.classList.toggle('open'));
  });
}

// 무신사 홍대 클릭 → 초기화
function resetPage() {
  document.querySelector('.search_box').value = '';
  document.querySelectorAll('.category').forEach(cat => cat.classList.remove('open'));
  initBrandList();
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.search_but').addEventListener('click', searchStock);
  document.querySelector('.search_box').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchStock();
    }
  });
  setupCategoryToggle();
  initBrandList();
  document.getElementById('musinsaTitle').addEventListener('click', resetPage);
});
