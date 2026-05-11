/* =============================================
   ScholarChain — script.js
   ============================================= */

let provider, signer, sealCount = 0;

// Referensi elemen DOM
const connectBtn  = document.getElementById('connectBtn');
const mintBtn     = document.getElementById('mintBtn');
const statusLabel = document.getElementById('statusLabel');
const walletLabel = document.getElementById('walletLabel');
const historyEl   = document.getElementById('history');
const dotEl       = document.getElementById('dotEl');
const connectLabel = document.getElementById('connectLabel');
const totalSeal   = document.getElementById('totalSeal');
const toast       = document.getElementById('toast');

/* ---- Utility: Tampilkan Toast ---- */
function showToast(msg) {
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ---- Utility: Update Progress Steps ---- */
function setStep(n) {
  for (let i = 1; i <= 4; i++) {
    const s = document.getElementById('s' + i);
    s.className = 'step' + (i < n ? ' done' : i === n ? ' active' : '');
  }
}

/* ---- Hubungkan MetaMask ---- */
connectBtn.onclick = async () => {
  if (!window.ethereum) {
    showToast('Pasang MetaMask terlebih dahulu!');
    return;
  }
  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer   = await provider.getSigner();
    const addr = await signer.getAddress();

    statusLabel.textContent       = 'Terhubung';
    statusLabel.style.color       = 'var(--success)';
    walletLabel.textContent       = addr.slice(0, 6) + '...' + addr.slice(-4);
    dotEl.classList.add('on');
    connectLabel.textContent      = 'Wallet Aktif';
    connectBtn.style.borderColor  = 'rgba(52,211,153,0.4)';
    connectBtn.style.color        = 'var(--success)';
  } catch (e) {
    showToast('Gagal terhubung ke wallet.');
  }
};

/* ---- Teks langkah simulasi proses ---- */
const steps = [
  '⌛ Mengenkripsi data...',
  '🔐 Menandatangani transaksi...',
  '📡 Broadcasting ke node...',
  '⛓ Finalisasi blok...',
];

/* ---- Registrasi & Mint ---- */
mintBtn.onclick = async () => {
  if (!signer) {
    showToast('Hubungkan wallet terlebih dahulu!');
    return;
  }

  const title    = document.getElementById('title').value.trim();
  const abstract = document.getElementById('abstract').value.trim();

  if (!title || !abstract) {
    showToast('Lengkapi judul dan abstrak riset.');
    return;
  }

  // Mulai animasi
  mintBtn.disabled = true;
  mintBtn.classList.add('pulse-anim');
  let si = 0;
  setStep(2);

  const iv = setInterval(() => {
    mintBtn.textContent = steps[si];
    if (si === 1) setStep(3);
    si++;
    if (si >= steps.length) {
      clearInterval(iv);
      finalize(title, abstract);
    }
  }, 850);
};

/* ---- Finalisasi: Hash + Tampilkan Sertifikat ---- */
function finalize(title, abstract) {
  // Buat hash kriptografis menggunakan keccak-256 via ethers.js
  const hash = ethers.id(title + abstract + Date.now());

  sealCount++;
  totalSeal.textContent = sealCount;
  setStep(4);
  setTimeout(() => setStep(1), 1200);

  // Hapus empty state jika ada
  const empty = historyEl.querySelector('.empty-state');
  if (empty) empty.remove();

  // Buat elemen sertifikat baru
  const item = document.createElement('div');
  item.className = 'history-item';

  const now = new Date().toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  item.innerHTML = `
    <div class="h-title">${title}</div>
    <div class="h-hash">${hash}</div>
    <div class="h-meta">
      <span class="h-time">${now}</span>
      <span class="h-badge">Terverifikasi</span>
    </div>
  `;

  historyEl.prepend(item);

  // Reset form & tombol
  document.getElementById('title').value    = '';
  document.getElementById('abstract').value = '';
  mintBtn.disabled = false;
  mintBtn.classList.remove('pulse-anim');
  mintBtn.innerHTML = '⬡ &nbsp;Segel Ide di Blockchain';

  showToast('Sidik jari riset Anda berhasil diamankan!');
}