// 브랜드별 위치 저장 객체 (초기값 예시)
const brandLocations = {

  };
  
  // 한글 초성 추출 함수
  function getInitialConsonant(char) {
    const code = char.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return '';
    const initial = Math.floor(code / 588);
    const initials = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
    return initials[initial];
  }

  // 브랜드 목록에 li 추가 (중복체크는 호출 전 하세요)
function addBrandToCategory(name, location) {
    const firstChar = getInitialConsonant(name[0]);
    const categories = document.querySelectorAll('.category');
    let targetCategory = null;
  
    categories.forEach(cat => {
      if (cat.querySelector('h2').textContent === firstChar) {
        targetCategory = cat;
      }
    });
  
    if (!targetCategory) {
      alert('해당 초성의 대분류가 없습니다.');
      return false;
    }
  
    const ul = targetCategory.querySelector('ul');
  
    // 기존 안내 문구 제거
    const emptyMsg = ul.querySelector('.empty-msg');
    if (emptyMsg) emptyMsg.remove();
  
    // li 생성
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
  
    categories.forEach(category => {
      const items = category.querySelectorAll('li');
      let matchInCategory = false;
  
      items.forEach(item => {
        const brand = item.dataset.brand || item.textContent.trim().split(' ')[0];
  
        if (brand.includes(keyword)) {
          item.style.display = '';
          matchInCategory = true;
          found = true;
        } else {
          item.style.display = 'none';
        }
      });
  
      // 대분류는 항상 보여주되 소분류가 검색에 없으면 안내 문구 표시
      const ul = category.querySelector('ul');
      const visibleItems = Array.from(items).filter(i => i.style.display !== 'none');
  
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
      alert('해당 브랜드를 찾을 수 없습니다.');
    }
  }
  
  // 위치 수정 함수
  function editLocation(brand) {
    const newLocation = prompt(`${brand}의 새 위치를 입력하세요 (예: 2.B.03):`, brandLocations[brand] || '');
    if (newLocation !== null && newLocation.trim() !== '') {
      brandLocations[brand] = newLocation.trim();
  
      // 위치 업데이트 (화면도 바로 반영)
      const items = document.querySelectorAll('li');
      items.forEach(item => {
        if ((item.dataset.brand || '') === brand) {
          const span = item.querySelector('span');
          if (span) {
            span.textContent = `(${brandLocations[brand]})`;
          }
        }
      });
    }
  }
  
  // 브랜드 삭제 함수 (대분류는 삭제하지 않음)
  function deleteBrand(brand) {
  if (!confirm(`${brand} 브랜드를 삭제하시겠습니까?`)) return;

  // 위치 정보 삭제
  delete brandLocations[brand];

  // li 삭제 및 소속 ul 확인
  const items = document.querySelectorAll('li');
  items.forEach(item => {
    if ((item.dataset.brand || '') === brand) {
      const ul = item.closest('ul');
      item.remove();

      // 삭제 후 빈 ul이면 안내 문구 추가
      const remainingBrandItems = ul.querySelectorAll('li[data-brand]');
      if (remainingBrandItems.length === 0 && !ul.querySelector('.empty-msg')) {
        const liEmpty = document.createElement('li');
        liEmpty.textContent = '등록된 브랜드가 없습니다.';
        liEmpty.className = 'empty-msg';
        ul.appendChild(liEmpty);
      }
    }
  });
}
  
  // 브랜드 추가 함수
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
  }
  
  // 초기 브랜드 리스트를 화면에 그리기 (초기값 기반)
  function initBrandList() {
    const categories = document.querySelectorAll('.category');
    categories.forEach(cat => {
      const ul = cat.querySelector('ul');
      ul.innerHTML = '';
    });
  
    for (const [brand, loc] of Object.entries(brandLocations)) {
      addBrandToCategory(brand, loc);
    }
  
    // 빈 카테고리 안내 문구
    categories.forEach(cat => {
      const ul = cat.querySelector('ul');
      if (ul.children.length === 0) {
        const liEmpty = document.createElement('li');
        liEmpty.textContent = '등록된 브랜드가 없습니다.';
        liEmpty.className = 'empty-msg';
        ul.appendChild(liEmpty);
      }
    });
  }
  
  // 대분류 클릭 열기/닫기 기능
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
  
  // "무신사 홍대" 클릭 시 초기화 함수
  function resetPage() {
    document.querySelector('.search_box').value = '';
    const categories = document.querySelectorAll('.category');
    categories.forEach(cat => cat.classList.remove('open'));
    initBrandList();
  }
  
  // DOM 로드 후 초기화
  document.addEventListener('DOMContentLoaded', () => {
    // 검색 버튼 클릭 이벤트
    document.querySelector('.search_but').addEventListener('click', searchStock);
  
    // 대분류 접기/펼치기
    setupCategoryToggle();
  
    // 초기 브랜드 리스트 표시
    initBrandList();
  
    // 무신사 홍대 타이틀 클릭 이벤트 (초기화)
    document.getElementById('musinsaTitle').addEventListener('click', resetPage);
  });
  