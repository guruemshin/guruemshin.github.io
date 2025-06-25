// Firebase 연동 (v9 모듈형 SDK)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// 🔐 Firebase 구성 정보 입력 (실제 프로젝트 값으로 교체하세요)
const firebaseConfig = {
  apiKey: "AIzaSyAszuroZ6_o2LQgTvAOzjuusjTnz7tshC4",
  authDomain: "musinsahd-stock.firebaseapp.com",
  projectId: "musinsahd-stock",
  storageBucket: "musinsahd-stock.firebasestorage.app",
  messagingSenderId: "394177254626",
  appId: "1:394177254626:web:b7a8c2ac2596291af37abb",
  measurementId: "G-5Z66M2E0CR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== UI & 로직 코드 =====
const initials = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function getInitialConsonant(char) {
  const code = char.charCodeAt(0) - 0xAC00;
  return (code >= 0 && code <= 11171) ? initials[Math.floor(code / 588)] : '';
}

function renderCategories() {
  const container = document.getElementById('categoryContainer');
  container.innerHTML = '';
  initials.forEach(initial => {
    const div = document.createElement('div');
    div.className = 'category';
    div.innerHTML = `<h2>${initial}</h2><ul></ul>`;
    div.querySelector('h2').addEventListener('click', () => div.classList.toggle('open'));
    container.appendChild(div);
  });
}

function addBrandToCategory(name, location) {
  const initial = getInitialConsonant(name[0]);
  const category = [...document.querySelectorAll('.category')].find(cat => cat.querySelector('h2').textContent === initial);
  if (!category) return false;

  const ul = category.querySelector('ul');
  ul.querySelector('.empty-msg')?.remove();

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

async function editLocation(brand) {
  const docRef = doc(db, 'brands', brand);
  const snapshot = await getDoc(docRef);
  const currentLocation = snapshot.exists() ? snapshot.data().location : '';

  const newLoc = prompt(`${brand}의 새 위치:`, currentLocation);
  if (!newLoc?.trim()) return;

  await setDoc(docRef, { location: newLoc.trim() });
  loadBrands();
}

async function deleteBrand(brand) {
  if (!confirm(`${brand} 삭제할까요?`)) return;
  await deleteDoc(doc(db, 'brands', brand));
  loadBrands();
}

async function searchStock() {
  const keyword = document.querySelector('.search_box').value.trim();
  const resultDiv = document.getElementById('searchResult');
  resultDiv.textContent = '';
  let found = false;

  const categories = document.querySelectorAll('.category');
  categories.forEach(cat => {
    const ul = cat.querySelector('ul');
    const items = ul.querySelectorAll('li');
    let match = false;

    items.forEach(item => {
      const brand = item.dataset.brand;
      if (brand.includes(keyword)) {
        item.style.display = '';
        resultDiv.textContent = `${brand} 위치: ${item.querySelector('span')?.textContent}`;
        found = true;
        match = true;
      } else {
        item.style.display = 'none';
      }
    });

    ul.querySelector('.empty-msg')?.remove();
    if (!match) {
      const msg = document.createElement('li');
      msg.textContent = '검색된 브랜드가 없습니다.';
      msg.className = 'empty-msg';
      ul.appendChild(msg);
    }
  });

  if (!found && keyword) {
    resultDiv.textContent = `'${keyword}' 브랜드를 찾을 수 없습니다.`;
  }
}

async function addBrand() {
  const name = document.getElementById('newBrand').value.trim();
  const location = document.getElementById('newLocation').value.trim();
  if (!name || !location) return alert('브랜드명과 위치를 입력하세요.');

  const docRef = doc(db, 'brands', name);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) return alert('이미 존재하는 브랜드입니다.');

  await setDoc(docRef, { location });
  document.getElementById('newBrand').value = '';
  document.getElementById('newLocation').value = '';
  loadBrands();
}

async function loadBrands() {
  renderCategories();
  const snapshot = await getDocs(collection(db, "brands"));
  snapshot.forEach(docSnap => {
    const name = docSnap.id;
    const loc = docSnap.data().location;
    addBrandToCategory(name, loc);
  });
  updateEventListeners();
}

// === 초기화 ===
document.addEventListener('DOMContentLoaded', () => {
  loadBrands();
  document.querySelector('.search_but').addEventListener('click', searchStock);
  document.getElementById('addBrandButton').addEventListener('click', addBrand);
  document.getElementById('musinsaTitle').addEventListener('click', () => {
    document.querySelector('.search_box').value = '';
    document.getElementById('searchResult').textContent = '';
    loadBrands();
  });
  document.querySelector('.search_box').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchStock();
    }
  });
});
