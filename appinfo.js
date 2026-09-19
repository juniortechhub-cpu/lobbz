import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDcX15UtgqteHH0MhCCZjZBbJkKNaoB61U",
  authDomain: "lobbz-a2e5b.firebaseapp.com",
  projectId: "lobbz-a2e5b",
  storageBucket: "lobbz-a2e5b.firebasestorage.app",
  messagingSenderId: "54068991558",
  appId: "1:54068991558:web:c4ccbe7ac3d53de0d80e07"
};

const app = getApps().length? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

function iniciarEscutaAppInfo() {
  const ref = doc(db, "app", "info");
  onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    if (data.favicon) {
      let link = document.getElementById('app-favicon');
      if (!link) {
        link = document.createElement('link');
        link.id = 'app-favicon';
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      let caminho = data.favicon;
      if (!caminho.startsWith('http') &&!caminho.startsWith('img/')) {
        caminho = 'img/' + caminho;
      }
      link.type = caminho.endsWith('.svg')? 'image/svg+xml' : 'image/png';
      link.href = caminho + '?v=' + Date.now();
    }
    if (data.manutencao === true) {
      if (!location.pathname.includes('manutencao.html')) {
        location.href = 'manutencao.html';
      }
    }
  });
}

iniciarEscutaAppInfo();