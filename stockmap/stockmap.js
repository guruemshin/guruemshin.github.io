function searchStock() {
  const keyword = document.querySelector('.search_box').value.trim();
  const categories = document.querySelectorAll('.category');
  let found = false;

  // ✅ 추가: 결과 표시 div 초기화
  const resultDiv = document.getElementById('searchResult');
  resultDiv.textContent = '';

  categories.forEach(category => {
    const items = category.querySelectorAll('li');
    let matchInCategory = false;

    items.forEach(item => {
      const brand = item.dataset.brand || item.textContent.trim().split(' ')[0];

      if (brand.includes(keyword)) {
        item.style.display = '';
        matchInCategory = true;
        found = true;

        // ✅ 추가: 첫 번째 매칭 결과 위치 표시
        if (brandLocations[brand]) {
          resultDiv.textContent = `${brand} 위치: ${brandLocations[brand]}`;
        }
      } else {
        item.style.display = 'none';
      }
    });

    // 안내 문구 처리
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
    resultDiv.textContent = `'${keyword}' 브랜드를 찾을 수 없습니다.`;
  }
}
