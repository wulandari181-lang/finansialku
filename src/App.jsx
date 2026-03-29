import React, { useState, useMemo, useEffect } from 'react';
import { Wallet, Calculator, Calendar, Plus, Trash2, Edit2, TrendingDown, TrendingUp, Target, CheckCircle2, Download, CalendarDays, Lock, Unlock, Sparkles, Coins, Landmark, Crown, Banknote, X, MessageCircle, Copy, Car } from 'lucide-react';
import * as XLSX from 'xlsx';

const formatRp = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
const getTodayDate = () => new Date().toISOString().split('T')[0];
const getCurrentMonthKey = () => `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
const formatMonthDisplay = (monthKey) => {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-');
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1));
};

const CurrencyInput = ({ value, onChange, label, placeholder, icon: Icon, disabled, noMargin }) => {
  const handleChange = (e) => onChange(Number(e.target.value.replace(/\D/g, '')));
  return (
    <div className={`flex flex-col w-full ${noMargin ? '' : 'mb-4'}`}>
      {label && <label className="text-[13px] font-bold text-night mb-1.5">{label}</label>}
      <div className="relative flex items-center">
        <span className={`absolute left-3.5 font-medium text-sm ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>Rp</span>
        <input type="text" disabled={disabled} className={`w-full pl-11 pr-4 py-2.5 border rounded-xl outline-none transition-all text-sm ${disabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-200 focus:bg-lavender/30 focus:ring-2 focus:ring-twilight text-gray-800'}`} value={value === 0 ? '' : value.toLocaleString('id-ID')} onChange={handleChange} placeholder={placeholder} />
        {Icon && <Icon className="absolute right-3.5 text-gray-400" size={18} />}
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const savedData = useMemo(() => {
    try { const saved = localStorage.getItem('finansialku_app_data'); return saved ? JSON.parse(saved) : null; } 
    catch (e) { return null; }
  }, []);

  const [firstOpenDate, setFirstOpenDate] = useState(savedData?.firstOpenDate || new Date().toISOString());
  const [userTier, setUserTier] = useState(savedData?.userTier || 'free'); 
  const [daysUsed, setDaysUsed] = useState(0);

  useEffect(() => {
    setDaysUsed(Math.floor(Math.abs(new Date() - new Date(firstOpenDate)) / (1000 * 60 * 60 * 24)));
  }, [firstOpenDate]);

  const isExpired = daysUsed > 80 && userTier === 'free';
  const isPro = userTier === 'pro';

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [monthlyData, setMonthlyData] = useState(savedData?.monthlyData || { [getCurrentMonthKey()]: { incomes: [], expenses: [] } });
  const currentMonthData = monthlyData[selectedMonth] || { incomes: [], expenses: [] };

  const [newIncName, setNewIncName] = useState(''); const [newIncAmount, setNewIncAmount] = useState(0);
  const [newExpName, setNewExpName] = useState(''); const [newExpAmount, setNewExpAmount] = useState(0); const [newExpDate, setNewExpDate] = useState(getTodayDate());
  
  const [simItemPrice, setSimItemPrice] = useState(0); const [simDP, setSimDP] = useState(0); const [simTenor, setSimTenor] = useState(12);
  const [simInputType, setSimInputType] = useState('interest'); 
  const [simInterestInput, setSimInterestInput] = useState(0); 
  const [simCicilanInput, setSimCicilanInput] = useState(0); 

  const [projOrangTua, setProjOrangTua] = useState(savedData?.projOrangTua || 0); const [projCicilan, setProjCicilan] = useState(savedData?.projCicilan || 0);
  const [projExpenses, setProjExpenses] = useState(savedData?.projExpenses || []); const [newProjExpName, setNewProjExpName] = useState(''); const [newProjExpAmount, setNewProjExpAmount] = useState(0);
  
  const [isEditingProj, setIsEditingProj] = useState(false);
  const [manualProjBalance, setManualProjBalance] = useState(savedData?.manualProjBalance || null);

  const [assets, setAssets] = useState(savedData?.assets || []);
  const [newAssetName, setNewAssetName] = useState(''); const [newAssetAmount, setNewAssetAmount] = useState(0);
  const [newAssetType, setNewAssetType] = useState('apresiasi'); 
  
  const [editAssetId, setEditAssetId] = useState(null); const [editAssetVal, setEditAssetVal] = useState(0);
  const [withdrawAssetId, setWithdrawAssetId] = useState(null); const [withdrawAssetVal, setWithdrawAssetVal] = useState(0);

  const appreciationAssets = useMemo(() => assets.filter(a => a.type === 'apresiasi' || !a.type), [assets]);
  const depreciationAssets = useMemo(() => assets.filter(a => a.type === 'depresiasi'), [assets]);
  
  const totalAppreciation = useMemo(() => appreciationAssets.reduce((a, b) => a + b.amount, 0), [appreciationAssets]);
  const totalDepreciation = useMemo(() => depreciationAssets.reduce((a, b) => a + b.amount, 0), [depreciationAssets]);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [copiedText, setCopiedText] = useState(null);

  const bankAccounts = [
    { bank: "BCA", norek: "0182364981", nama: "Setiya Wulandari" },
    { bank: "SEABANK", norek: "901548485318", nama: "Setiya Wulandari" }
  ];
  const eWallets = [
    { nama: "ShopeePay", no: "085259399968" },
    { nama: "GoPay", no: "085259399968" }
  ];
  const noWhatsApp = "6285259399968"; 

  useEffect(() => {
    localStorage.setItem('finansialku_app_data', JSON.stringify({ monthlyData, projOrangTua, projCicilan, projExpenses, assets, firstOpenDate, userTier, manualProjBalance }));
  }, [monthlyData, projOrangTua, projCicilan, projExpenses, assets, firstOpenDate, userTier, manualProjBalance]);

  const totalIncomes = useMemo(() => currentMonthData.incomes?.reduce((a, b) => a + b.amount, 0) || 0, [currentMonthData.incomes]);
  const totalExpenses = useMemo(() => currentMonthData.expenses?.reduce((a, b) => a + b.amount, 0) || 0, [currentMonthData.expenses]);
  const currentBalance = totalIncomes - totalExpenses;
  
  const totalAssets = totalAppreciation + totalDepreciation;
  
  const projBalance = totalIncomes - projOrangTua - projCicilan - projExpenses.reduce((a, b) => a + b.amount, 0);
  const displayedProjBalance = manualProjBalance !== null ? manualProjBalance : projBalance;

  const simResult = useMemo(() => {
    const pokok = Math.max(0, simItemPrice - simDP);
    let cicilanFinal = 0; let bungaTahunanFinal = 0; let totalBungaNominal = 0;
    if (simTenor > 0 && pokok > 0) {
      if (simInputType === 'interest') {
        bungaTahunanFinal = simInterestInput;
        totalBungaNominal = pokok * (bungaTahunanFinal / 100) * (simTenor / 12);
        cicilanFinal = (pokok + totalBungaNominal) / simTenor;
      } else {
        cicilanFinal = simCicilanInput;
        const cicilanMinimal = pokok / simTenor; 
        if (cicilanFinal > cicilanMinimal) {
          totalBungaNominal = (cicilanFinal * simTenor) - pokok;
          bungaTahunanFinal = (totalBungaNominal / pokok) / (simTenor / 12) * 100;
        } else { totalBungaNominal = 0; bungaTahunanFinal = 0; }
      }
    }
    const totalDibayar = simDP + pokok + totalBungaNominal;
    const sisaUangGaji = currentBalance - cicilanFinal;
    const lamaNabung = cicilanFinal > 0 ? Math.ceil(simItemPrice / cicilanFinal) : 0;
    return { pokok, cicilanFinal, bungaTahunanFinal, totalBungaNominal, totalDibayar, sisaUangGaji, lamaNabung, uangSelamat: totalDibayar - simItemPrice };
  }, [simItemPrice, simDP, simTenor, simInputType, simInterestInput, simCicilanInput, currentBalance]);

  const confirmDelete = (action) => { if(window.confirm("Yakin ingin menghapus data ini?")) action(); };
  const updateMonth = (data) => setMonthlyData(prev => ({ ...prev, [selectedMonth]: { ...(prev[selectedMonth] || { incomes: [], expenses: [] }), ...data } }));
  const addIncome = () => { if (!isExpired && newIncName && newIncAmount > 0) { updateMonth({ incomes: [...(currentMonthData.incomes||[]), { id: Date.now(), name: newIncName, amount: newIncAmount }] }); setNewIncName(''); setNewIncAmount(0); } };
  const removeIncome = (id) => confirmDelete(() => updateMonth({ incomes: currentMonthData.incomes.filter(e => e.id !== id) }));
  const addExpense = () => { if (!isExpired && newExpName && newExpAmount > 0) { updateMonth({ expenses: [...(currentMonthData.expenses||[]), { id: Date.now(), name: newExpName, amount: newExpAmount, date: newExpDate }] }); setNewExpName(''); setNewExpAmount(0); } };
  const removeExpense = (id) => confirmDelete(() => updateMonth({ expenses: currentMonthData.expenses.filter(e => e.id !== id) }));
  const addProjExp = () => { if (!isExpired && newProjExpName && newProjExpAmount > 0) { setProjExpenses([...projExpenses, { id: Date.now(), name: newProjExpName, amount: newProjExpAmount }]); setNewProjExpName(''); setNewProjExpAmount(0); } };
  const removeProjExp = (id) => confirmDelete(() => setProjExpenses(projExpenses.filter(e => e.id !== id)));
  
  const addAsset = () => { if (isPro && newAssetName && newAssetAmount > 0) { setAssets([...assets, { id: Date.now(), name: newAssetName, amount: newAssetAmount, type: newAssetType }]); setNewAssetName(''); setNewAssetAmount(0); } };
  const removeAsset = (id) => confirmDelete(() => setAssets(assets.filter(e => e.id !== id)));
  const handleWithdrawAsset = (asset) => {
    if (withdrawAssetVal <= 0 || withdrawAssetVal > asset.amount) return alert("Nominal melebihi saldo aset!");
    setAssets(assets.map(a => a.id === asset.id ? {...a, amount: a.amount - withdrawAssetVal} : a));
    updateMonth({ incomes: [...(currentMonthData.incomes||[]), { id: Date.now(), name: `Pencairan: ${asset.name}`, amount: withdrawAssetVal }] });
    setWithdrawAssetId(null); setWithdrawAssetVal(0); setActiveTab('dashboard');
    alert(`Sukses! Dana ${formatRp(withdrawAssetVal)} masuk ke Pemasukan Bulan Ini.`);
  };

  const handleActivateCode = () => {
    const code = activationCode.trim().toUpperCase();
    if (code === 'SWBASIC26') { setUserTier('basic'); setShowUpgradeModal(false); setActivationCode(''); alert('Selamat! Aplikasi berhasil di-Upgrade ke Paket BASIC.'); } 
    else if (code === 'SWPRO26') { setUserTier('pro'); setShowUpgradeModal(false); setActivationCode(''); alert('Luar Biasa! Selamat datang di Paket PRO. Fitur Aset telah terbuka!'); } 
    else { alert('Kode Aktivasi tidak valid. Silakan hubungi Admin via WA.'); }
  };

  const exportData = () => {
    const dataStr = localStorage.getItem('finansialku_app_data');
    if (!dataStr) return alert("Belum ada data untuk dibackup!");
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a'); linkElement.setAttribute('href', dataUri); linkElement.setAttribute('download', `backup_finansialku_${getTodayDate()}.json`); linkElement.click();
    alert("Berhasil! File backup telah didownload. Simpan file ini baik-baik.");
  };

  const importData = (event) => {
    const fileReader = new FileReader(); fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = e => {
      try { const json = JSON.parse(e.target.result); if (window.confirm("Import data akan menimpa data saat ini. Lanjutkan?")) { localStorage.setItem('finansialku_app_data', JSON.stringify(json)); window.location.reload(); } } 
      catch (err) { alert("File tidak valid!"); }
    };
  };

  const downloadExcel = () => {
    let runningBalance = 0; let no = 1; const transactions = [];
    (currentMonthData.incomes || []).forEach(inc => { runningBalance += inc.amount; transactions.push([no++, "-", inc.name, "Pemasukan", inc.amount, 0, runningBalance]); });
    const sortedExpenses = [...(currentMonthData.expenses || [])].sort((a,b) => new Date(a.date) - new Date(b.date));
    sortedExpenses.forEach(exp => { runningBalance -= exp.amount; transactions.push([no++, exp.date, exp.name, "Pengeluaran", 0, exp.amount, runningBalance]); });
    
    const ws1 = XLSX.utils.aoa_to_sheet([[`Catatan Keuangan Periode ${formatMonthDisplay(selectedMonth)}`], [], ["No", "Tanggal", "Keterangan", "Kategori", "Pemasukan (Rp)", "Pengeluaran (Rp)", "Saldo"], ...transactions]);

    const ws2 = XLSX.utils.aoa_to_sheet([
        ["Catatan Aset dan Investasi"], [],
        ["--- TABEL A: ASET APRESIASI (NILAI NAIK) ---"], ["No", "Nama Aset", "Nilai (Rp)"],
        ...appreciationAssets.map((a, i) => [i + 1, a.name, a.amount]),
        [],
        ["--- TABEL B: ASET DEPRESIASI (NILAI TURUN) ---"], ["No", "Nama Aset", "Nilai (Rp)"],
        ...depreciationAssets.map((a, i) => [i + 1, a.name, a.amount])
    ]);

    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws1, "Bulan Ini"); XLSX.utils.book_append_sheet(wb, ws2, "Aset & Investasi");
    XLSX.writeFile(wb, `Laporan_Finansialku_${selectedMonth}.xlsx`);
  };

  const handleCopy = (text) => { navigator.clipboard.writeText(text); setCopiedText(text); setTimeout(() => setCopiedText(null), 2000); };

  const headerBaseClass = "text-white p-5 shadow-lg rounded-b-3xl transition-colors duration-300";
  const headerClass = activeTab === 'aset' && isPro ? `${headerBaseClass} bg-night border-b border-lavender/10` : `${headerBaseClass} bg-twilight`;

  return (
    <div className="flex justify-center bg-slate-100 min-h-[100dvh]">
      <div className="w-full max-w-md bg-white flex flex-col h-[100dvh] relative shadow-2xl overflow-hidden">
        
        {/* MODAL PEMBAYARAN / UPGRADE */}
        {showUpgradeModal && (
          <div className="absolute inset-0 z-[100] bg-night/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[90dvh]">
              <div className="bg-twilight p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2"><Crown size={20} className="text-yellow-400"/><h2 className="font-bold text-lg">Upgrade Akun</h2></div>
                <button onClick={() => setShowUpgradeModal(false)} className="text-lavender hover:text-white bg-night/50 p-1 rounded-full"><X size={20}/></button>
              </div>
              
              <div className="p-5 overflow-y-auto">
                <div className="bg-slate-50 border border-lavender/40 rounded-xl p-4 mb-4">
                  <h3 className="font-bold text-night mb-2 text-sm">Pilih Paket:</h3>
                  <ul className="text-xs text-gray-600 space-y-2 mb-3">
                    <li className="flex items-center"><CheckCircle2 size={14} className="mr-2 text-green-500"/> <span className="font-bold text-night mr-1">Paket Basic (28k):</span> Buka kunci input permanen.</li>
                    <li className="flex items-center"><CheckCircle2 size={14} className="mr-2 text-green-500"/> <span className="font-bold text-night mr-1">Paket PRO (50k):</span> Basic + Fitur Manajemen Aset.</li>
                  </ul>
                </div>

                <h3 className="font-bold text-night mb-3 text-sm border-b border-gray-100 pb-2">Cara Aktivasi:</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="bg-twilight text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
                    <div className="w-full">
                      <p className="text-sm font-bold text-night mb-1">Transfer Pembayaran</p>
                      <p className="text-[11px] text-gray-600 mb-2">Silakan transfer sesuai paket ke salah satu rekening/e-wallet ini:</p>
                      
                      <div className="bg-lavender/30 p-3 rounded-xl border border-lavender/50 space-y-3 text-sm">
                        <div>
                          <p className="text-[10px] uppercase font-extrabold text-twilight/70 mb-1.5 tracking-wider">Transfer Bank:</p>
                          {bankAccounts.map((b, i) => (
                            <div key={i} className="mb-2 last:mb-0 bg-white/50 p-2 rounded-lg border border-white flex justify-between items-center group">
                              <div><p><span className="font-bold text-night">{b.bank}</span> - <span className="font-mono text-twilight font-bold text-base">{b.norek}</span></p><p className="text-[10px] text-gray-600">a.n {b.nama}</p></div>
                              <button onClick={() => handleCopy(b.norek)} className="p-2 bg-lavender/50 text-twilight rounded-lg hover:bg-twilight hover:text-white transition-colors">
                                {copiedText === b.norek ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="pt-3 border-t border-lavender/40">
                          <p className="text-[10px] uppercase font-extrabold text-twilight/70 mb-1.5 tracking-wider">E-Wallet:</p>
                          <div className="space-y-1.5">
                            {eWallets.map((e, i) => (
                              <div key={i} className="flex justify-between items-center bg-white/50 p-2 rounded-lg border border-white group">
                                <div className="flex flex-col"><span className="font-bold text-night text-xs">{e.nama}</span><span className="font-mono text-twilight font-bold">{e.no}</span></div>
                                <button onClick={() => handleCopy(e.no)} className="p-2 bg-lavender/50 text-twilight rounded-lg hover:bg-twilight hover:text-white transition-colors">
                                  {copiedText === e.no ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="bg-twilight text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
                    <div>
                      <p className="text-sm font-bold text-night mb-1">Konfirmasi ke Admin</p>
                      <p className="text-xs text-gray-600 mb-2">Kirim bukti transfer ke WhatsApp untuk mendapatkan Kode Aktivasi.</p>
                      <a href={`https://wa.me/${noWhatsApp}?text=Halo%20Admin%20Finansialku,%20saya%20sudah%20transfer%20untuk%20Upgrade%20Aplikasi.%20Ini%20bukti%20transfernya.`} target="_blank" rel="noreferrer" className="inline-flex items-center bg-[#25D366] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-[#1ebc59] transition-colors">
                        <MessageCircle size={16} className="mr-2" /> Konfirmasi via WA
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="bg-twilight text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
                    <div className="w-full">
                      <p className="text-sm font-bold text-night mb-1">Masukkan Kode</p>
                      <div className="flex gap-2 mt-2">
                        <input type="text" placeholder="Ketik Kode" className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none text-sm uppercase bg-slate-50 focus:ring-2 focus:ring-twilight" value={activationCode} onChange={e => setActivationCode(e.target.value)} />
                        <button onClick={handleActivateCode} className="bg-twilight text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-night transition-colors shadow-sm">Aktifkan</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HEADER AREA */}
        <div className="flex-shrink-0 z-40 transition-colors duration-300">
          {userTier === 'free' && (
            <div className={`text-xs font-medium px-4 py-2 flex justify-between items-center ${isExpired ? 'bg-red-500 text-white' : 'bg-lavender text-night'}`}>
              <span>{isExpired ? 'Masa Trial Habis!' : `Sisa Trial: ${Math.max(0, 80 - daysUsed)} Hari`}</span>
              <span className="font-bold border border-current px-2 py-0.5 rounded cursor-pointer" onClick={() => setShowUpgradeModal(true)}>Upgrade</span>
            </div>
          )}
          
          <header className={headerClass}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2.5">
                <img src="/logo.jpeg" alt="Finansialku Logo" className="w-8 h-8 rounded-lg shadow-sm object-cover bg-white" />
                <div><h1 className="text-2xl font-bold tracking-tight">Finansialku</h1><p className="text-lavender text-xs mt-[-2px] opacity-90 transition-opacity">Asisten Keuangan Pintar</p></div>
              </div>
              {userTier === 'pro' ? (
                 <div className={`flex items-center text-[10px] font-bold px-2 py-1 rounded-full shadow-md transition-colors ${activeTab === 'aset' ? 'bg-lavender text-night' : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'}`}><Crown size={12} className="mr-1"/> PRO</div>
              ) : userTier === 'basic' ? (
                <div className="flex items-center text-[10px] font-bold bg-dusky text-white px-2 py-1 rounded-full shadow-md"><Unlock size={12} className="mr-1"/> BASIC</div>
              ) : (
                <div className="flex items-center text-[10px] bg-night/50 px-2 py-1 rounded-full"><CheckCircle2 size={12} className="mr-1 text-green-300"/> Tersimpan</div>
              )}
            </div>
            <div className={`rounded-xl p-2.5 backdrop-blur-sm border flex justify-between items-center transition-colors ${activeTab === 'aset' && isPro ? 'bg-lavender/5 border-lavender/10' : 'bg-night/30 border-lavender/20'}`}>
              <span className="text-xs font-medium text-lavender flex items-center"><CalendarDays size={14} className="mr-1.5" /> Pilih Bulan:</span>
              <input type="month" value={selectedMonth} onChange={(e) => { const v = e.target.value; setSelectedMonth(v); if (!monthlyData[v]) setMonthlyData(p => ({ ...p, [v]: { incomes: [], expenses: [] } })); }} className="bg-transparent text-white font-bold outline-none cursor-pointer uppercase text-sm" style={{ colorScheme: 'dark' }} />
            </div>
          </header>
        </div>

        {/* SCROLLABLE MAIN CONTENT */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden pb-28 pt-2 transition-colors duration-300 ${activeTab === 'aset' && isPro ? 'bg-night/95' : 'bg-slate-50'}`}>
          
          {isExpired && activeTab !== 'simulation' && activeTab !== 'aset' && (
            <div className="m-4 bg-red-50 p-4 border border-red-200 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center text-red-600 font-bold"><Lock size={18} className="mr-2"/> Input Dikunci (Trial Habis)</div>
              <p className="text-xs text-red-700 mb-2">Bantu kreator mengembangkan aplikasi ini dan buka akses selamanya!</p>
              <button onClick={() => setShowUpgradeModal(true)} className="w-full bg-twilight text-white text-xs py-3 rounded-xl font-bold hover:bg-night transition shadow-md flex items-center justify-center">Lihat Opsi Upgrade / Pembayaran</button>
            </div>
          )}

          <div className="p-4 pt-1">
            {/* TAB 1: BULAN INI */}
            {activeTab === 'dashboard' && (
              <div className="animate-in fade-in space-y-5">
                <div className="bg-gradient-to-br from-twilight to-night rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 opacity-10"><Wallet size={140} /></div>
                  <p className="text-lavender text-sm font-medium mb-1 relative z-10">Sisa Saldo Saat Ini</p>
                  <h3 className="text-3xl font-bold mb-5 relative z-10">{formatRp(currentBalance)}</h3>
                  <div className="grid grid-cols-2 gap-4 border-t border-lavender/20 pt-4 relative z-10">
                    <div><p className="text-lavender text-xs flex items-center"><TrendingUp size={14} className="mr-1"/> Pemasukan</p><p className="font-semibold text-sm">{formatRp(totalIncomes)}</p></div>
                    <div><p className="text-lavender text-xs flex items-center"><TrendingDown size={14} className="mr-1"/> Pengeluaran</p><p className="font-semibold text-sm">{formatRp(totalExpenses)}</p></div>
                  </div>
                </div>
                
                <button onClick={downloadExcel} disabled={isExpired} className="w-full bg-white border border-lavender/50 text-twilight py-3 rounded-2xl font-bold text-xs shadow-sm hover:bg-slate-50 transition mb-4 flex items-center justify-center disabled:opacity-50">
                  <Download size={16} className="mr-2" /> Download Laporan Excel (Multi-Sheet)
                </button>
                
                <div>
                  <h3 className="text-md font-bold mb-3 text-night">Sumber Pemasukan</h3>
                  <div className={`bg-white rounded-2xl p-4 border ${isExpired ? 'border-red-200 opacity-60' : 'border-lavender/40'} shadow-sm mb-3 relative`}>
                    {isExpired && <Lock className="absolute top-4 right-4 text-red-400" size={18}/>}
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      <input type="text" placeholder="Cth: Gaji, Olshop" className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm bg-slate-50 focus:ring-2 focus:ring-twilight disabled:bg-slate-100 disabled:cursor-not-allowed" value={newIncName} onChange={e => setNewIncName(e.target.value)} disabled={isExpired}/>
                      <CurrencyInput placeholder="Nominal" value={newIncAmount} onChange={setNewIncAmount} disabled={isExpired} noMargin={true}/>
                    </div>
                    <button onClick={addIncome} disabled={isExpired} className="w-full bg-lavender text-night py-2.5 rounded-xl font-bold text-xs hover:bg-twilight hover:text-white transition disabled:bg-slate-200 disabled:text-gray-400 disabled:cursor-not-allowed">+ Tambah Pemasukan</button>
                  </div>
                  <div className="space-y-2">
                    {(currentMonthData.incomes||[]).map(inc => (
                      <div key={inc.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-sm transition-all hover:border-lavender/30">
                        <span className="font-medium text-night">{inc.name}</span>
                        <div className="flex items-center gap-3"><span className="text-green-600 font-bold">+{formatRp(inc.amount)}</span>
                        {!isExpired && <Trash2 size={16} onClick={() => removeIncome(inc.id)} className="text-gray-300 hover:text-red-500 cursor-pointer transition-colors"/>}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-md font-bold mb-3 text-night">Catat Pengeluaran</h3>
                  <div className={`bg-white rounded-2xl p-4 border ${isExpired ? 'border-red-200 opacity-60' : 'border-lavender/40'} shadow-sm mb-3 relative`}>
                    {isExpired && <Lock className="absolute top-4 right-4 text-red-400" size={18}/>}
                    <input type="date" className="w-full px-3 py-2 mb-3 border rounded-xl outline-none text-sm bg-slate-50 disabled:bg-slate-100 disabled:text-gray-400" value={newExpDate} onChange={e => setNewExpDate(e.target.value)} disabled={isExpired}/>
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      <input type="text" placeholder="Nama Pengeluaran" className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm bg-slate-50 focus:ring-2 focus:ring-twilight disabled:bg-slate-100 disabled:cursor-not-allowed" value={newExpName} onChange={e => setNewExpName(e.target.value)} disabled={isExpired}/>
                      <CurrencyInput placeholder="Nominal" value={newExpAmount} onChange={setNewExpAmount} disabled={isExpired} noMargin={true}/>
                    </div>
                    <button onClick={addExpense} disabled={isExpired} className="w-full bg-night text-white py-3 rounded-xl font-bold text-xs shadow-sm hover:bg-black transition disabled:bg-slate-200 disabled:text-gray-400 disabled:cursor-not-allowed">+ Catat Pengeluaran</button>
                  </div>
                  <div className="space-y-2">
                    {(currentMonthData.expenses||[]).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(exp => (
                      <div key={exp.id} className="p-3.5 bg-white border border-gray-100 rounded-xl shadow-sm transition-all hover:border-lavender/30 relative">
                        <div className="flex justify-between mb-1.5"><span className="font-bold text-sm text-night pr-2">{exp.name}</span><span className="text-red-500 font-bold text-sm flex-shrink-0">-{formatRp(exp.amount)}</span></div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-50 mt-1"><span className="text-xs text-gray-400">{exp.date}</span>
                        {!isExpired && <Trash2 size={14} onClick={() => removeExpense(exp.id)} className="text-gray-300 hover:text-red-500 cursor-pointer transition-colors"/>}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* BACKUP DATA */}
                  <div className="mt-8 p-4 bg-slate-100 rounded-2xl border border-dashed border-gray-300 text-center">
                    <Download size={14} className="mx-auto mb-1 text-gray-400"/>
                    <p className="text-[10px] text-gray-500 mb-2">Data tersimpan aman di HP-mu. Backup berkala!</p>
                    <div className="flex gap-2">
                      <button onClick={exportData} className="flex-1 bg-white border border-gray-300 text-night py-2 rounded-xl text-[10px] font-bold">Ekspor (Download)</button>
                      <label className="flex-1 bg-white border border-gray-300 text-night py-2 rounded-xl text-[10px] font-bold cursor-pointer text-center">Impor<input type="file" accept=".json" onChange={importData} className="hidden" /></label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SIMULASI */}
            {activeTab === 'simulation' && (
               <div className="animate-in fade-in space-y-5">
                <h2 className="text-lg font-bold text-night flex items-center"><Calculator className="mr-2 text-dusky" size={20} /> Kalkulator Cerdas</h2>
                <div className="bg-white p-5 rounded-2xl border border-lavender/40 shadow-sm">
                  <CurrencyInput label="Harga Barang / Pinjaman" placeholder="Cth: 15000000" value={simItemPrice} onChange={setSimItemPrice} />
                  <CurrencyInput label="Uang Muka (DP) - Jika Ada" placeholder="Cth: 0" value={simDP} onChange={setSimDP} />
                  <div className="border-t border-gray-100 pt-4 mt-2">
                    <label className="text-[13px] font-bold text-night mb-2 block">Opsi Hitung (Isi Salah Satu):</label>
                    <div className="flex flex-col gap-2 relative">
                      <div className="relative flex items-center bg-slate-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-twilight transition-all">
                        <span className="bg-gray-100 text-gray-500 text-xs px-3 py-3.5 border-r border-gray-200 w-28 flex-shrink-0 font-medium">Bunga/Thn</span>
                        <input type="number" className="w-full px-3 py-2.5 outline-none text-sm bg-transparent" value={simInputType === 'interest' ? (simInterestInput || '') : (simResult.bungaTahunanFinal.toFixed(2) || '')} onChange={(e) => { setSimInputType('interest'); setSimInterestInput(Number(e.target.value)); }} placeholder="0" />
                        <span className="pr-3 text-sm text-gray-400 flex-shrink-0">%</span>
                      </div>
                      <div className="flex items-center justify-center my-1"><span className="text-[10px] font-bold text-gray-400 bg-white px-2 uppercase tracking-wider">ATAU</span></div>
                      <div className="relative flex items-center bg-slate-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-twilight transition-all">
                        <span className="bg-gray-100 text-gray-500 text-xs px-3 py-3.5 border-r border-gray-200 w-28 flex-shrink-0 font-medium">Mampu Nyicil</span>
                        <span className="pl-3 text-sm text-gray-500 font-medium flex-shrink-0">Rp</span>
                        <input type="text" className="w-full px-2 py-2.5 outline-none text-sm bg-transparent" value={simInputType === 'cicilan' ? (simCicilanInput ? simCicilanInput.toLocaleString('id-ID') : '') : (simResult.cicilanFinal ? Math.round(simResult.cicilanFinal).toLocaleString('id-ID') : '')} onChange={(e) => { setSimInputType('cicilan'); setSimCicilanInput(Number(e.target.value.replace(/\D/g, ''))); }} placeholder="0" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <CurrencyInput label="Selama Berapa Bulan? (Tenor)" placeholder="12" value={simTenor} onChange={setSimTenor} icon={()=><span className="absolute right-4 text-sm text-gray-400">Bln</span>} noMargin={true}/>
                  </div>
                </div>
                {simItemPrice > 0 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-gradient-to-br from-midnight to-night p-5 rounded-2xl shadow-lg text-white relative border border-white/5">
                      <div className="absolute top-0 right-0 bg-dusky text-[10px] font-bold px-3 py-1.5 rounded-bl-xl tracking-wide">Jika Kredit</div>
                      <h3 className="font-bold text-lavender mb-3 border-b border-white/10 pb-2 flex items-center gap-1.5"><TrendingDown size={16}/>Rincian Biaya Kredit</h3>
                      <div className="space-y-1.5 text-sm mb-4">
                        <div className="flex justify-between text-gray-300"><span>Pokok Hutang:</span><span>{formatRp(simResult.pokok)}</span></div>
                        <div className="flex justify-between text-gray-300"><span>Bunga Bank ({simResult.bungaTahunanFinal.toFixed(1)}%/thn):</span><span className="text-red-300">+{formatRp(simResult.totalBungaNominal)}</span></div>
                        <div className="flex justify-between text-gray-300"><span>DP Awal:</span><span>{formatRp(simDP)}</span></div>
                        <div className="flex justify-between font-bold text-white pt-2.5 border-t border-white/10 mt-1.5"><span>Grand Total Keluar Uang:</span><span className="text-base text-yellow-300">{formatRp(simResult.totalDibayar)}</span></div>
                      </div>
                      <div className="bg-lavender/5 p-3.5 rounded-xl border border-lavender/10">
                        <div className="flex justify-between mb-1.5"><span className="text-sm font-medium text-lavender opacity-90 flex items-center gap-1.5"><Coins size={14}/>Cicilan Wajib/Bln:</span><span className="font-bold text-lg text-yellow-200">{formatRp(simResult.cicilanFinal)}</span></div>
                        <div className="flex justify-between items-center"><span className="text-xs text-gray-300">Proyeksi Sisa Gajimu:</span><span className={`text-xs font-bold px-2 py-0.5 rounded ${simResult.sisaUangGaji < 0 ? 'bg-red-500/30 text-red-200' : 'bg-green-500/30 text-green-200'}`}>{formatRp(simResult.sisaUangGaji)}</span></div>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border-2 border-dusky shadow-sm relative transition-all hover:border-twilight">
                       <div className="absolute top-0 right-0 bg-twilight text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl tracking-wide">Jika Nabung</div>
                       <h3 className="font-bold text-night mb-3 border-b border-gray-100 pb-2 flex items-center gap-1.5"><TrendingUp size={16}/>Rincian Jika Menabung</h3>
                       <p className="text-xs text-gray-600 mb-4 leading-relaxed">Jika kamu bersabar dan rutin menabung sebesar nilai cicilan di atas (<span className="font-bold text-twilight">{formatRp(simResult.cicilanFinal)}/bln</span>), ini keuntungannya:</p>
                       <div className="space-y-2.5 text-sm mb-4">
                         <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg"><span className="text-gray-600">Uang Terkumpul Dlm:</span><span className="font-bold text-twilight bg-lavender/50 px-3 py-1 rounded text-base">{simResult.lamaNabung} Bulan</span></div>
                         <div className="flex justify-between items-center pr-2"><span className="text-gray-600">Total Keluar Uang:</span><span className="font-bold text-night text-base">{formatRp(simItemPrice)}</span></div>
                       </div>
                       <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center transition-all hover:bg-green-100/60">
                         <Sparkles size={24} className="text-green-500 mr-3.5 flex-shrink-0 animate-pulse"/>
                         <div>
                           <p className="text-[10px] text-green-700 font-extrabold uppercase tracking-wider mb-0.5">Keuntunganmu:</p>
                           <p className="text-xs text-green-900 leading-tight">Kamu menghemat <span className="font-bold text-sm bg-green-200/50 px-1.5 rounded">{formatRp(simResult.uangSelamat)}</span> yang tadinya terbuang sia-sia untuk bayar bunga bank!</p>
                         </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PROYEKSI */}
            {activeTab === 'projection' && (
              <div className="animate-in fade-in space-y-5">
                <h2 className="text-lg font-bold text-night flex items-center"><Target className="mr-2 text-dusky" size={20} /> Proyeksi Bulan Depan</h2>
                
                <div className="bg-gradient-to-br from-dusky to-midnight rounded-2xl p-5 text-white shadow-lg text-center relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 opacity-10"><CalendarDays size={120} /></div>
                  <div className="flex justify-center items-center gap-2 relative z-10 mb-1">
                    <p className="text-lavender text-sm mb-0">Estimasi Sisa Gaji Bulan Depan</p>
                    {!isExpired && (
                      <button onClick={() => { setIsEditingProj(!isEditingProj); if (!isEditingProj && manualProjBalance === null) setManualProjBalance(projBalance); }} 
                        className="text-lavender hover:text-white bg-white/10 p-1.5 rounded-md transition" title="Edit Manual">
                        <Edit2 size={12}/>
                      </button>
                    )}
                  </div>
                  
                  {isEditingProj ? (
                    <div className="flex items-center justify-center gap-2 mt-2 relative z-10">
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-white/70 text-sm font-bold">Rp</span>
                        <input type="text" className="w-40 pl-9 pr-3 py-1.5 rounded bg-white/20 text-white font-bold text-left border border-lavender/50 outline-none focus:ring-2 focus:ring-lavender"
                               value={manualProjBalance === 0 ? '' : (manualProjBalance || 0).toLocaleString('id-ID')} 
                               onChange={e => setManualProjBalance(Number(e.target.value.replace(/\D/g, '')))} placeholder="0" autoFocus />
                      </div>
                      <button onClick={() => {setManualProjBalance(null); setIsEditingProj(false);}} className="text-[10px] bg-red-500/80 px-2 py-2 rounded font-bold hover:bg-red-500 transition shadow-sm">Reset Auto</button>
                    </div>
                  ) : (
                    <h3 className={`text-3xl font-bold relative z-10 transition-colors ${displayedProjBalance < 0 ? 'text-red-300' : 'text-white'}`}>
                      {formatRp(displayedProjBalance)}
                      {manualProjBalance !== null && <span className="text-[9px] ml-2 align-middle bg-yellow-500/90 text-white px-1.5 py-0.5 rounded shadow-sm tracking-wide">EDITED</span>}
                    </h3>
                  )}
                </div>

                <div className={`bg-white p-4 rounded-2xl border transition-all ${isExpired ? 'border-red-200 opacity-70' : 'border-lavender/40'} shadow-sm relative`}>
                  {isExpired && <Lock className="absolute top-4 right-4 text-red-400" size={18}/>}
                  <h3 className="text-sm font-bold text-night mb-3">Potongan Wajib</h3>
                  <CurrencyInput label="Jatah Orang Tua" placeholder="0" value={projOrangTua} onChange={setProjOrangTua} disabled={isExpired}/>
                  <CurrencyInput label="Total Cicilan / Paylater" placeholder="0" value={projCicilan} onChange={setProjCicilan} disabled={isExpired} noMargin={true}/>
                </div>
                 <div className={`bg-white p-4 rounded-2xl border transition-all ${isExpired ? 'border-red-200 opacity-70' : 'border-lavender/40'} shadow-sm relative`}>
                  {isExpired && <Lock className="absolute top-4 right-4 text-red-400" size={18}/>}
                  <h3 className="text-sm font-bold text-night mb-3">Target Pengeluaran</h3>
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <input type="text" placeholder="Nama (Cth: Kos, Bensin)" className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm bg-slate-50 focus:ring-2 focus:ring-dusky disabled:cursor-not-allowed disabled:bg-slate-100" value={newProjExpName} onChange={e=>setNewProjExpName(e.target.value)} disabled={isExpired}/>
                    <CurrencyInput placeholder="Nominal" value={newProjExpAmount} onChange={setNewProjExpAmount} disabled={isExpired} noMargin={true}/>
                  </div>
                  <button onClick={addProjExp} disabled={isExpired} className="w-full bg-dusky text-white py-2.5 rounded-xl text-xs font-bold mb-4 shadow-sm hover:bg-midnight transition-colors disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-gray-400">+ Tambah Target</button>
                  <div className="space-y-2">
                    {(projExpenses||[]).map(exp => (
                      <div key={exp.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm transition-all hover:bg-slate-100 hover:border hover:border-dusky/20"><span className="font-medium text-night">{exp.name}</span>
                      <div className="flex items-center gap-3"><span className="font-bold">{formatRp(exp.amount)}</span>{!isExpired && <Trash2 size={16} onClick={()=>removeProjExp(exp.id)} className="text-red-400 cursor-pointer transition-colors"/>}</div></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ASET */}
            {activeTab === 'aset' && (
              <div className="animate-in fade-in space-y-5">
                <h2 className={`text-lg font-bold flex items-center transition-colors ${isPro ? 'text-lavender' : 'text-night'}`}><Landmark className={`mr-2 transition-colors ${isPro ? 'text-lavender' : 'text-yellow-500'}`} size={20} /> Aset & Investasi</h2>
                
                {!isPro ? (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200 text-center shadow-sm">
                    <Crown size={40} className="mx-auto text-yellow-500 mb-3" />
                    <h3 className="font-bold text-night mb-2">Fitur Khusus Pengguna PRO</h3>
                    <p className="text-xs text-gray-600 mb-4 leading-relaxed">Pantau pertumbuhan hartamu! Catat aset yang Apresiasi dan Depresiasi.</p>
                    <button onClick={() => setShowUpgradeModal(true)} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 rounded-xl font-bold shadow-md hover:scale-105 transition">Upgrade ke PRO Sekarang</button>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-br from-midnight to-black rounded-3xl p-6 text-white shadow-2xl border border-white/10 overflow-hidden relative">
                      <div className="absolute top-0 right-0 opacity-10"><Sparkles size={160} className="text-lavender"/></div>
                      <p className="text-lavender text-sm font-medium opacity-80 flex items-center gap-1.5"><Coins size={14} className="animate-pulse"/>Net Worth (Harta Brankas)</p>
                      <h3 className="text-3xl font-extrabold relative z-10 transition-all">{formatRp(totalAssets)}</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 pt-4 border-t border-lavender/10 text-lavender/80 relative z-10 text-xs">
                        <p className="flex justify-between items-center"><span className="flex items-center"><TrendingUp size={12} className="mr-1 text-green-300"/>Apresiasi:</span> <span className="text-green-200 font-semibold">{formatRp(totalAppreciation)}</span></p>
                        <p className="flex justify-between items-center"><span className="flex items-center"><TrendingDown size={12} className="mr-1 text-red-300"/>Depresiasi:</span> <span className="text-red-200 font-semibold">{formatRp(totalDepreciation)}</span></p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-lavender shadow-sm transition-all hover:border-lavender/60">
                      <h3 className="text-sm font-bold text-night mb-3">Tambah Portofolio Aset</h3>
                      <input type="text" placeholder="Nama (Cth: Emas, Mobil)" className="w-full px-3.5 py-2.5 mb-3 border rounded-xl outline-none text-sm bg-slate-50 focus:ring-2 focus:ring-twilight border-slate-100 transition-all" value={newAssetName} onChange={e => setNewAssetName(e.target.value)} />
                      <CurrencyInput placeholder="Nilai Saat Ini" value={newAssetAmount} onChange={setNewAssetAmount} noMargin={true} />
                      
                      <div className="grid grid-cols-2 gap-2 mt-4 mb-3.5">
                        <button onClick={() => setNewAssetType('apresiasi')} className={`py-3 rounded-xl flex items-center justify-center gap-1.5 border-2 text-xs font-bold transition ${newAssetType === 'apresiasi' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-slate-50 border-slate-100 text-gray-500 hover:border-green-100'}`}>
                          <TrendingUp size={16} /> Apresiasi (Naik)
                        </button>
                        <button onClick={() => setNewAssetType('depresiasi')} className={`py-3 rounded-xl flex items-center justify-center gap-1.5 border-2 text-xs font-bold transition ${newAssetType === 'depresiasi' ? 'bg-red-50 text-red-700 border-red-300' : 'bg-slate-50 border-slate-100 text-gray-500 hover:border-red-100'}`}>
                          <Car size={16} /> Depresiasi (Turun)
                        </button>
                      </div>

                      <button onClick={addAsset} className="w-full bg-lavender text-twilight py-3 rounded-xl font-bold text-xs hover:bg-twilight hover:text-white transition-colors shadow-sm">+ Simpan Aset ke Brankas</button>
                    </div>

                    <div className="p-4 bg-white rounded-3xl border border-green-100 shadow-sm hover:border-green-200 transition">
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-green-50">
                        <h3 className="font-extrabold text-night flex items-center gap-2"><TrendingUp size={20} className="text-green-500"/>APRESIASI (Nilai Naik)</h3>
                        <span className="font-bold text-lg text-green-700">{formatRp(totalAppreciation)}</span>
                      </div>
                      {appreciationAssets.length === 0 ? <p className="text-center text-xs text-gray-400 py-4 italic">Belum ada aset apresiasi.</p> :
                        appreciationAssets.map(as => (
                          <div key={as.id} className="p-3 mb-2 bg-green-50/50 border border-green-100 rounded-xl shadow-sm text-sm group flex justify-between items-center relative">
                             <div className="flex flex-col">
                               <span className="font-bold text-night">{as.name}</span>
                               <span className="font-extrabold text-green-800 text-sm mt-0.5">{formatRp(as.amount)}</span>
                             </div>
                             <div className="flex flex-col gap-2">
                               <button onClick={() => removeAsset(as.id)} className="text-red-400 hover:text-red-600 transition p-1"><Trash2 size={16}/></button>
                             </div>
                          </div>
                        ))}
                    </div>

                    <div className="p-4 bg-white rounded-3xl border border-lavender shadow-sm hover:border-lavender/60 transition">
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                        <h3 className="font-extrabold text-night flex items-center gap-2"><Car size={20} className="text-lavender"/>DEPRESIASI (Nilai Turun)</h3>
                        <span className="font-bold text-lg text-lavender">{formatRp(totalDepreciation)}</span>
                      </div>
                      {depreciationAssets.length === 0 ? <p className="text-center text-xs text-gray-400 py-4 italic">Belum ada aset depresiasi.</p> :
                        depreciationAssets.map(as => (
                          <div key={as.id} className="p-3 mb-2 bg-slate-50 border border-slate-100 rounded-xl shadow-sm text-sm group flex justify-between items-center relative">
                             <div className="flex flex-col">
                               <span className="font-bold text-night">{as.name}</span>
                               <span className="font-extrabold text-lavender text-sm mt-0.5">{formatRp(as.amount)}</span>
                             </div>
                             <div className="flex flex-col gap-2">
                               <button onClick={() => removeAsset(as.id)} className="text-red-400 hover:text-red-600 transition p-1"><Trash2 size={16}/></button>
                             </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* FOOTER COPYRIGHT */}
            <footer className="mt-12 mb-4 text-center transition-opacity duration-300">
              <p className={`text-[11px] font-medium tracking-wide transition-colors ${activeTab === 'aset' && isPro ? 'text-lavender/50' : 'text-night/50'}`}>© 2026 Finansialku.</p>
              <div className="flex flex-col items-center justify-center font-medium mt-1.5 relative">
                <p className={`text-[10px] mb-0 transition-colors ${activeTab === 'aset' && isPro ? 'text-lavender/60' : 'text-twilight/60'}`}>Crafted with pride by</p>
                <div className="flex flex-col items-center mt-[-2px] transition-transform duration-300">
                  <Crown size={18} className="text-yellow-500 z-10" />
                  <span style={{ fontFamily: "'Allerta Stencil', sans-serif" }} className={`text-2xl tracking-[0.25em] uppercase mt-[-6px] transition-colors ${activeTab === 'aset' && isPro ? 'text-lavender' : 'text-twilight'}`}>Sw</span>
                </div>
              </div>
            </footer>

          </div>
        </main>

        {/* BOTTOM NAVIGATION */}
        <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-2 pb-safe z-50 shadow-[0_-5px_20px_rgba(27,0,63,0.08)]">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center justify-center w-full py-2.5 rounded-xl transition-all ${activeTab === 'dashboard' ? 'text-twilight bg-lavender/50' : 'text-gray-400 hover:text-night hover:bg-slate-50'}`}><Wallet size={22} /><span className="text-[9px] font-bold mt-1.5 tracking-wide">Bulan Ini</span></button>
          <button onClick={() => setActiveTab('simulation')} className={`flex flex-col items-center justify-center w-full py-2.5 rounded-xl transition-all ${activeTab === 'simulation' ? 'text-midnight bg-lavender/50' : 'text-gray-400 hover:text-night hover:bg-slate-50'}`}><Calculator size={22} /><span className="text-[9px] font-bold mt-1.5 tracking-wide">Simulasi</span></button>
          <button onClick={() => setActiveTab('projection')} className={`flex flex-col items-center justify-center w-full py-2.5 rounded-xl transition-all ${activeTab === 'projection' ? 'text-dusky bg-lavender/50' : 'text-gray-400 hover:text-night hover:bg-slate-50'}`}><Target size={22} /><span className="text-[9px] font-bold mt-1.5 tracking-wide">Proyeksi</span></button>
          <button onClick={() => setActiveTab('aset')} className={`flex flex-col items-center justify-center w-full py-2.5 rounded-xl transition-all ${activeTab === 'aset' ? (isPro ? 'text-lavender bg-midnight' : 'text-yellow-600 bg-yellow-50') : 'text-gray-400 hover:text-lavender hover:bg-midnight'}`}><Landmark size={22} /><span className="text-[9px] font-bold mt-1.5 tracking-wide">Asetku</span></button>
        </nav>
      </div>
    </div>
  );
}