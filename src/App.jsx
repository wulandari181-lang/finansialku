import React, { useState, useMemo, useEffect } from 'react';
import { Wallet, Calculator, Calendar, Plus, Trash2, Edit2, TrendingDown, TrendingUp, Target, CheckCircle2, Download, CalendarDays, Lock, Unlock, Sparkles, Coins, Landmark, Crown, Banknote, X, MessageCircle, Copy, Car, ArrowUpRight } from 'lucide-react';
import * as XLSX from 'xlsx';

const formatRp = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
const formatExcelNum = (number) => new Intl.NumberFormat('id-ID').format(number || 0);
const formatProfit = (number) => number > 0 ? `+ ${formatExcelNum(number)}` : (number < 0 ? `- ${formatExcelNum(Math.abs(number))}` : "0");

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

  useEffect(() => { setDaysUsed(Math.floor(Math.abs(new Date() - new Date(firstOpenDate)) / (1000 * 60 * 60 * 24))); }, [firstOpenDate]);

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
  const [isEditingProj, setIsEditingProj] = useState(false); const [manualProjBalance, setManualProjBalance] = useState(savedData?.manualProjBalance || null);

  // --- STATE ASET BARU & LENGKAP ---
  const [assets, setAssets] = useState(savedData?.assets || []);
  const [newAssetType, setNewAssetType] = useState('apresiasi'); 
  const [newAssetName, setNewAssetName] = useState(''); 
  const [newAssetCategory, setNewAssetCategory] = useState('Emas');
  const [newAssetUnit, setNewAssetUnit] = useState(1);
  const [newAssetBuyPrice, setNewAssetBuyPrice] = useState(0);
  
  const [editAssetId, setEditAssetId] = useState(null); 
  const [editAssetVal, setEditAssetVal] = useState(0);
  const [withdrawAssetId, setWithdrawAssetId] = useState(null); 
  const [withdrawAssetVal, setWithdrawAssetVal] = useState(0);

  // --- LOGIKA HITUNG ASET ---
  const appreciationAssets = useMemo(() => assets.filter(a => a.type === 'apresiasi' || !a.type), [assets]);
  const depreciationAssets = useMemo(() => assets.filter(a => a.type === 'depresiasi'), [assets]);
  
  // Total Nilai Saat Ini
  const totalAppreciation = useMemo(() => appreciationAssets.reduce((sum, a) => {
      const currentPrice = a.currentPrice !== undefined ? a.currentPrice : (a.buyPrice || a.amount);
      const unit = a.unit || 1;
      return sum + (currentPrice * unit);
  }, 0), [appreciationAssets]);

  const totalDepreciation = useMemo(() => depreciationAssets.reduce((sum, a) => {
      const currentPrice = a.currentPrice !== undefined ? a.currentPrice : (a.buyPrice || a.amount);
      return sum + currentPrice;
  }, 0), [depreciationAssets]);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [copiedText, setCopiedText] = useState(null);

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
        bungaTahunanFinal = simInterestInput; totalBungaNominal = pokok * (bungaTahunanFinal / 100) * (simTenor / 12); cicilanFinal = (pokok + totalBungaNominal) / simTenor;
      } else {
        cicilanFinal = simCicilanInput; const cicilanMinimal = pokok / simTenor; 
        if (cicilanFinal > cicilanMinimal) { totalBungaNominal = (cicilanFinal * simTenor) - pokok; bungaTahunanFinal = (totalBungaNominal / pokok) / (simTenor / 12) * 100; } 
        else { totalBungaNominal = 0; bungaTahunanFinal = 0; }
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
  
  // --- FUNGSI ASET BARU ---
  const addAsset = () => { 
    if (isPro && newAssetName && newAssetBuyPrice > 0) { 
      const newAsset = {
        id: Date.now(),
        type: newAssetType,
        name: newAssetName,
        category: newAssetType === 'apresiasi' ? newAssetCategory : '-',
        unit: newAssetType === 'apresiasi' ? newAssetUnit : 1,
        buyPrice: newAssetBuyPrice,
        currentPrice: newAssetBuyPrice, // Saat awal input, nilai pasar = harga beli
        amount: newAssetType === 'apresiasi' ? (newAssetUnit * newAssetBuyPrice) : newAssetBuyPrice // Backward compatibility
      };
      setAssets([...assets, newAsset]); 
      setNewAssetName(''); setNewAssetBuyPrice(0); setNewAssetUnit(1);
    } 
  };

  const removeAsset = (id) => confirmDelete(() => setAssets(assets.filter(e => e.id !== id)));
  const handleWithdrawAsset = (asset) => {
    if (withdrawAssetVal <= 0) return alert("Nominal tidak valid!");
    
    // Potong nilai dari currentPrice atau amount
    setAssets(assets.map(a => {
        if(a.id === asset.id) {
            let updatedCurrent = a.currentPrice !== undefined ? a.currentPrice : a.amount;
            if(a.type === 'apresiasi') {
                updatedCurrent = updatedCurrent - (withdrawAssetVal / (a.unit||1));
            } else {
                updatedCurrent = updatedCurrent - withdrawAssetVal;
            }
            return {...a, currentPrice: updatedCurrent, amount: a.amount - withdrawAssetVal};
        }
        return a;
    }));

    updateMonth({ incomes: [...(currentMonthData.incomes||[]), { id: Date.now(), name: `Pencairan: ${asset.name}`, amount: withdrawAssetVal }] });
    setWithdrawAssetId(null); setWithdrawAssetVal(0); setActiveTab('dashboard');
    alert(`Sukses! Dana ${formatRp(withdrawAssetVal)} masuk ke Pemasukan Bulan Ini.`);
  };

  const updateAssetCurrentPrice = (id) => {
     setAssets(assets.map(a => a.id === id ? {...a, currentPrice: editAssetVal} : a));
     setEditAssetId(null); setEditAssetVal(0);
  };

  // --- KODE PEMBAYARAN & EXPORT/IMPORT ---
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

  // --- DOWNLOAD EXCEL SUPER PREMIUM ---
  const downloadExcel = () => {
    let runningBalance = 0; let noDebit = 1; let noKredit = 1; 
    let sumDebit = 0; let sumKredit = 0;
    const transactions = [];

    (currentMonthData.incomes || []).forEach(inc => { 
        runningBalance += inc.amount; sumDebit += inc.amount;
        transactions.push([noDebit++, "-", inc.name, "Pemasukan", inc.amount, 0, runningBalance]); 
    });
    
    const sortedExpenses = [...(currentMonthData.expenses || [])].sort((a,b) => new Date(a.date) - new Date(b.date));
    sortedExpenses.forEach(exp => { 
        runningBalance -= exp.amount; sumKredit += exp.amount;
        transactions.push([noKredit++, exp.date, exp.name, "Pengeluaran", 0, exp.amount, runningBalance]); 
    });
    
    // Baris Total Sheet 1
    transactions.push(["", "", "", "TOTAL KESELURUHAN", sumDebit, sumKredit, runningBalance]);

    // Format Sheet 1 (Tengah)
    const ws1Data = [
        ["", "", "CATATAN KEUANGAN PERIODE " + formatMonthDisplay(selectedMonth).toUpperCase(), "", "", "", ""],
        [],
        ["No", "Tanggal", "Keterangan", "Kategori", "Debit (Rp)", "Kredit (Rp)", "Saldo (Rp)"], 
        ...transactions
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
    ws1['!cols'] = [{wch: 5}, {wch: 12}, {wch: 25}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}];

    // Meracik Data Sheet 2 (Aset)
    const ws2Data = [
        ["", "", "", "CATATAN ASET DAN INVESTASI", "", "", "", "", ""], [],
        ["--- TABEL A: ASET APRESIASI (NILAI NAIK) ---"], 
        ["No", "Nama Aset", "Kategori", "Unit/Gram", "Harga Beli (per unit)", "Total Modal (Rp)", "Harga Pasar Saat Ini", "Nilai Saat Ini (Rp)", "Selisih/Profit (Rp)", "Keterangan"]
    ];

    let sumModalApresiasi = 0; let sumNilaiApresiasi = 0; let sumSelisihApresiasi = 0;
    appreciationAssets.forEach((a, i) => {
        const buy = a.buyPrice || a.amount;
        const cur = a.currentPrice !== undefined ? a.currentPrice : buy;
        const unit = a.unit || 1;
        const totalModal = buy * unit;
        const totalNilai = cur * unit;
        const profit = totalNilai - totalModal;
        
        sumModalApresiasi += totalModal; sumNilaiApresiasi += totalNilai; sumSelisihApresiasi += profit;
        ws2Data.push([i + 1, a.name, a.category, unit, buy, totalModal, cur, totalNilai, formatProfit(profit), profit >= 0 ? "Profit" : "Loss"]);
    });
    ws2Data.push(["", "", "", "", "TOTAL APRESIASI", sumModalApresiasi, "", sumNilaiApresiasi, formatProfit(sumSelisihApresiasi), ""]);
    ws2Data.push([], [], ["--- TABEL B: ASET DEPRESIASI (NILAI TURUN) ---"], 
        ["No", "Nama Aset", "Harga Beli / Awal (Rp)", "Nilai Saat Ini (Rp)", "Penurunan/Penyusutan (Rp)", "Keterangan"]
    );

    let sumModalDepresiasi = 0; let sumNilaiDepresiasi = 0; let sumSelisihDepresiasi = 0;
    depreciationAssets.forEach((a, i) => {
        const buy = a.buyPrice || a.amount;
        const cur = a.currentPrice !== undefined ? a.currentPrice : buy;
        const loss = cur - buy; // usually negative
        
        sumModalDepresiasi += buy; sumNilaiDepresiasi += cur; sumSelisihDepresiasi += loss;
        ws2Data.push([i + 1, a.name, buy, cur, formatProfit(loss), "Depresiasi"]);
    });
    ws2Data.push(["", "TOTAL DEPRESIASI", sumModalDepresiasi, sumNilaiDepresiasi, formatProfit(sumSelisihDepresiasi), ""]);
    
    // Grand Total Bawah
    ws2Data.push([], [], ["========================================"]);
    ws2Data.push(["GRAND TOTAL HARTA (NET WORTH)", "", "", "", "", "", "", sumNilaiApresiasi + sumNilaiDepresiasi]);

    const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
    ws2['!cols'] = [{wch: 5}, {wch: 25}, {wch: 15}, {wch: 10}, {wch: 15}, {wch: 18}, {wch: 18}, {wch: 18}, {wch: 18}, {wch: 15}];

    const wb = XLSX.utils.book_new(); 
    XLSX.utils.book_append_sheet(wb, ws1, "Catatan Keuangan"); 
    XLSX.utils.book_append_sheet(wb, ws2, "Aset & Investasi");
    XLSX.writeFile(wb, `Laporan_Finansialku_${selectedMonth}.xlsx`);
  };

  const handleCopy = (text) => { navigator.clipboard.writeText(text); setCopiedText(text); setTimeout(() => setCopiedText(null), 2000); };
  const headerClass = "text-white p-5 shadow-lg rounded-b-3xl transition-colors duration-300 " + (activeTab === 'aset' && isPro ? 'bg-night border-b border-lavender/10' : 'bg-twilight');

  return (
    <div className="flex justify-center bg-slate-100 min-h-[100dvh]">
      <div className="w-full max-w-md bg-white flex flex-col h-[100dvh] relative shadow-2xl overflow-hidden">
        
        {/* MODAL UPGRADE (Singkat) */}
        {showUpgradeModal && (
          <div className="absolute inset-0 z-[100] bg-night/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[90dvh]">
              <div className="bg-twilight p-4 flex justify-between items-center text-white"><h2 className="font-bold">Upgrade Akun</h2><button onClick={() => setShowUpgradeModal(false)}><X size={20}/></button></div>
              <div className="p-5 overflow-y-auto">
                 <p className="text-xs text-gray-600 mb-4">Hubungi Admin di WA untuk aktivasi.</p>
                 <a href={`https://wa.me/${noWhatsApp}?text=Halo%20Admin%20Finansialku`} target="_blank" rel="noreferrer" className="flex items-center justify-center bg-[#25D366] text-white py-3 rounded-xl font-bold mb-4 shadow-sm"><MessageCircle size={18} className="mr-2"/> WhatsApp Admin</a>
                 <input type="text" placeholder="Masukkan Kode Aktivasi" className="w-full px-3 py-2.5 border rounded-xl bg-slate-50 text-sm uppercase mb-2" value={activationCode} onChange={e => setActivationCode(e.target.value)} />
                 <button onClick={handleActivateCode} className="w-full bg-twilight text-white py-2.5 rounded-xl text-sm font-bold shadow-sm">Aktifkan</button>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="flex-shrink-0 z-40">
          {userTier === 'free' && <div className="text-xs font-medium px-4 py-2 flex justify-between bg-lavender text-night"><span>Trial: {Math.max(0, 80 - daysUsed)} Hari</span><span className="font-bold border px-2 py-0.5 rounded cursor-pointer" onClick={() => setShowUpgradeModal(true)}>Upgrade</span></div>}
          <header className={headerClass}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2.5"><img src="/logo.jpeg" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm object-cover bg-white" /><div><h1 className="text-2xl font-bold tracking-tight">Finansialku</h1><p className="text-lavender text-xs opacity-90">Asisten Keuangan Pintar</p></div></div>
              {isPro && <div className="text-[10px] font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded-full"><Crown size={12} className="inline mr-1"/> PRO</div>}
            </div>
            <div className={`rounded-xl p-2.5 backdrop-blur-sm border flex justify-between items-center ${activeTab === 'aset' && isPro ? 'bg-lavender/5 border-lavender/10' : 'bg-night/30 border-lavender/20'}`}>
              <span className="text-xs font-medium text-lavender flex items-center"><CalendarDays size={14} className="mr-1.5" /> Pilih Bulan:</span>
              <input type="month" value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); if (!monthlyData[e.target.value]) setMonthlyData(p => ({ ...p, [e.target.value]: { incomes: [], expenses: [] } })); }} className="bg-transparent text-white font-bold outline-none cursor-pointer uppercase text-sm" style={{ colorScheme: 'dark' }} />
            </div>
          </header>
        </div>

        {/* MAIN CONTENT */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden pb-28 pt-2 ${activeTab === 'aset' && isPro ? 'bg-night/95' : 'bg-slate-50'}`}>
          <div className="p-4 pt-1">
            
            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="animate-in fade-in space-y-5">
                <div className="bg-gradient-to-br from-twilight to-night rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 opacity-10"><Wallet size={140} /></div>
                  <p className="text-lavender text-sm mb-1 relative z-10">Sisa Saldo Saat Ini</p>
                  <h3 className="text-3xl font-bold mb-5 relative z-10">{formatRp(currentBalance)}</h3>
                  <div className="grid grid-cols-2 gap-4 border-t border-lavender/20 pt-4 relative z-10">
                    <div><p className="text-lavender text-xs flex items-center"><TrendingUp size={14} className="mr-1"/> Pemasukan</p><p className="font-semibold text-sm">{formatRp(totalIncomes)}</p></div>
                    <div><p className="text-lavender text-xs flex items-center"><TrendingDown size={14} className="mr-1"/> Pengeluaran</p><p className="font-semibold text-sm">{formatRp(totalExpenses)}</p></div>
                  </div>
                </div>
                
                <button onClick={downloadExcel} disabled={isExpired} className="w-full bg-white border border-lavender/50 text-twilight py-3 rounded-2xl font-bold text-xs shadow-sm flex items-center justify-center hover:bg-slate-50 transition"><Download size={16} className="mr-2" /> Download Laporan Excel</button>
                
                <div>
                  <h3 className="text-md font-bold mb-3 text-night">Sumber Pemasukan</h3>
                  <div className="bg-white rounded-2xl p-4 border border-lavender/40 shadow-sm mb-3">
                    <div className="flex gap-2 mb-3"><input type="text" placeholder="Cth: Gaji" className="w-full px-3 py-2 border rounded-xl text-sm bg-slate-50" value={newIncName} onChange={e => setNewIncName(e.target.value)} /><CurrencyInput placeholder="Nominal" value={newIncAmount} onChange={setNewIncAmount} noMargin={true}/></div>
                    <button onClick={addIncome} className="w-full bg-lavender text-night py-2.5 rounded-xl font-bold text-xs hover:bg-twilight hover:text-white transition">+ Tambah Pemasukan</button>
                  </div>
                  <div className="space-y-2">
                    {(currentMonthData.incomes||[]).map(inc => (
                      <div key={inc.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-sm"><span className="font-medium text-night">{inc.name}</span>
                      <div className="flex items-center gap-3"><span className="text-green-600 font-bold">+{formatRp(inc.amount)}</span><Trash2 size={16} onClick={() => removeIncome(inc.id)} className="text-gray-300 hover:text-red-500 cursor-pointer"/></div></div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-bold mb-3 text-night">Catat Pengeluaran</h3>
                  <div className="bg-white rounded-2xl p-4 border border-lavender/40 shadow-sm mb-3">
                    <input type="date" className="w-full px-3 py-2 mb-3 border rounded-xl text-sm bg-slate-50" value={newExpDate} onChange={e => setNewExpDate(e.target.value)} />
                    <div className="flex gap-2 mb-3"><input type="text" placeholder="Nama" className="w-full px-3 py-2 border rounded-xl text-sm bg-slate-50" value={newExpName} onChange={e => setNewExpName(e.target.value)} /><CurrencyInput placeholder="Nominal" value={newExpAmount} onChange={setNewExpAmount} noMargin={true}/></div>
                    <button onClick={addExpense} className="w-full bg-night text-white py-3 rounded-xl font-bold text-xs hover:bg-black transition">+ Catat Pengeluaran</button>
                  </div>
                  <div className="space-y-2">
                    {(currentMonthData.expenses||[]).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(exp => (
                      <div key={exp.id} className="p-3.5 bg-white border border-gray-100 rounded-xl shadow-sm"><div className="flex justify-between mb-1.5"><span className="font-bold text-sm text-night">{exp.name}</span><span className="text-red-500 font-bold text-sm">-{formatRp(exp.amount)}</span></div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-50"><span className="text-xs text-gray-400">{exp.date}</span><Trash2 size={14} onClick={() => removeExpense(exp.id)} className="text-gray-300 hover:text-red-500 cursor-pointer"/></div></div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-4 bg-slate-100 rounded-2xl border border-dashed border-gray-300 text-center"><p className="text-[10px] text-gray-500 mb-2">Data tersimpan aman di HP-mu. Backup berkala!</p><div className="flex gap-2"><button onClick={exportData} className="flex-1 bg-white border border-gray-300 text-night py-2 rounded-xl text-[10px] font-bold">Ekspor (Download)</button><label className="flex-1 bg-white border border-gray-300 text-night py-2 rounded-xl text-[10px] font-bold cursor-pointer text-center">Impor<input type="file" accept=".json" onChange={importData} className="hidden" /></label></div></div>
              </div>
            )}

            {/* TAB 2 & 3: SIMULASI & PROYEKSI (DIRINGKAS VISUALNYA AGAR MUAT, FUNGSI TETAP UTUH) */}
            {activeTab === 'simulation' && (
               <div className="animate-in fade-in space-y-5">
                <h2 className="text-lg font-bold text-night flex items-center"><Calculator className="mr-2 text-dusky" size={20} /> Kalkulator Cerdas</h2>
                <div className="bg-white p-5 rounded-2xl border border-lavender/40 shadow-sm">
                  <CurrencyInput label="Harga Barang / Pinjaman" placeholder="15000000" value={simItemPrice} onChange={setSimItemPrice} />
                  <CurrencyInput label="Uang Muka (DP)" placeholder="0" value={simDP} onChange={setSimDP} />
                  <div className="border-t border-gray-100 pt-4 mt-2">
                    <label className="text-[13px] font-bold text-night mb-2 block">Opsi Hitung (Isi Salah Satu):</label>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center bg-slate-50 border rounded-xl"><span className="bg-gray-100 text-xs px-3 py-3 w-28 font-medium">Bunga/Thn</span><input type="number" className="w-full px-3 py-2 bg-transparent text-sm outline-none" value={simInputType === 'interest' ? (simInterestInput || '') : (simResult.bungaTahunanFinal.toFixed(2) || '')} onChange={(e) => { setSimInputType('interest'); setSimInterestInput(Number(e.target.value)); }} placeholder="0" /><span className="pr-3 text-sm text-gray-400">%</span></div>
                      <div className="flex items-center bg-slate-50 border rounded-xl"><span className="bg-gray-100 text-xs px-3 py-3 w-28 font-medium">Mampu Nyicil</span><span className="pl-3 text-sm text-gray-500 font-medium">Rp</span><input type="text" className="w-full px-2 py-2 bg-transparent text-sm outline-none" value={simInputType === 'cicilan' ? (simCicilanInput ? simCicilanInput.toLocaleString('id-ID') : '') : (simResult.cicilanFinal ? Math.round(simResult.cicilanFinal).toLocaleString('id-ID') : '')} onChange={(e) => { setSimInputType('cicilan'); setSimCicilanInput(Number(e.target.value.replace(/\D/g, ''))); }} placeholder="0" /></div>
                    </div>
                  </div>
                  <div className="mt-4"><CurrencyInput label="Tenor (Bulan)" placeholder="12" value={simTenor} onChange={setSimTenor} noMargin={true}/></div>
                </div>
                {simItemPrice > 0 && (
                  <div className="space-y-4">
                    <div className="bg-midnight p-5 rounded-2xl text-white relative"><div className="absolute top-0 right-0 bg-dusky text-[10px] px-3 py-1 rounded-bl-xl font-bold">Kredit</div><h3 className="font-bold text-lavender mb-3 border-b border-white/10 pb-2">Rincian Kredit</h3><div className="text-sm space-y-1 mb-4"><div className="flex justify-between"><span>Pokok:</span><span>{formatRp(simResult.pokok)}</span></div><div className="flex justify-between"><span>Bunga:</span><span className="text-red-300">+{formatRp(simResult.totalBungaNominal)}</span></div><div className="flex justify-between font-bold text-yellow-300 border-t border-white/10 mt-2 pt-2"><span>Total Bayar:</span><span>{formatRp(simResult.totalDibayar)}</span></div></div><div className="bg-white/10 p-3 rounded-xl"><div className="flex justify-between mb-1"><span className="text-sm text-lavender">Cicilan/Bln:</span><span className="font-bold text-lg text-yellow-200">{formatRp(simResult.cicilanFinal)}</span></div></div></div>
                    <div className="bg-white p-5 rounded-2xl border-2 border-dusky relative"><div className="absolute top-0 right-0 bg-twilight text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold">Nabung</div><h3 className="font-bold text-night mb-3 border-b pb-2">Rincian Menabung</h3><div className="text-sm space-y-2 mb-4"><div className="flex justify-between bg-slate-50 p-2 rounded"><span>Terkumpul Dlm:</span><span className="font-bold text-twilight">{simResult.lamaNabung} Bulan</span></div></div><div className="bg-green-50 p-3 rounded-xl flex items-center"><Sparkles className="text-green-500 mr-2"/><p className="text-xs text-green-900">Hemat <span className="font-bold">{formatRp(simResult.uangSelamat)}</span> dari bayar bunga!</p></div></div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'projection' && (
              <div className="animate-in fade-in space-y-5">
                <h2 className="text-lg font-bold text-night flex items-center"><Target className="mr-2 text-dusky" size={20} /> Proyeksi Bulan Depan</h2>
                <div className="bg-gradient-to-br from-dusky to-midnight rounded-2xl p-5 text-white text-center relative">
                  <div className="flex justify-center items-center gap-2 relative z-10 mb-1"><p className="text-lavender text-sm mb-0">Estimasi Sisa Gaji</p><button onClick={() => { setIsEditingProj(!isEditingProj); if (!isEditingProj && manualProjBalance === null) setManualProjBalance(projBalance); }} className="text-lavender hover:text-white p-1 bg-white/10 rounded"><Edit2 size={12}/></button></div>
                  {isEditingProj ? (<div className="flex items-center justify-center gap-2 mt-2"><div className="relative flex items-center"><span className="absolute left-3 text-white/70 text-sm">Rp</span><input type="text" className="w-40 pl-9 pr-3 py-1.5 rounded bg-white/20 text-white font-bold text-left outline-none" value={manualProjBalance === 0 ? '' : (manualProjBalance || 0).toLocaleString('id-ID')} onChange={e => setManualProjBalance(Number(e.target.value.replace(/\D/g, '')))} autoFocus /></div><button onClick={() => {setManualProjBalance(null); setIsEditingProj(false);}} className="text-[10px] bg-red-500 px-2 py-2 rounded font-bold">Reset</button></div>) : (<h3 className={`text-3xl font-bold transition-colors ${displayedProjBalance < 0 ? 'text-red-300' : 'text-white'}`}>{formatRp(displayedProjBalance)}{manualProjBalance !== null && <span className="text-[9px] ml-2 align-middle bg-yellow-500/90 px-1.5 py-0.5 rounded">EDITED</span>}</h3>)}
                </div>
                <div className="bg-white p-4 rounded-2xl border shadow-sm"><h3 className="text-sm font-bold text-night mb-3">Potongan Wajib</h3><CurrencyInput label="Jatah Orang Tua" value={projOrangTua} onChange={setProjOrangTua}/><CurrencyInput label="Cicilan/Paylater" value={projCicilan} onChange={setProjCicilan} noMargin={true}/></div>
                <div className="bg-white p-4 rounded-2xl border shadow-sm"><h3 className="text-sm font-bold text-night mb-3">Target Pengeluaran</h3><div className="flex gap-2 mb-3"><input type="text" placeholder="Nama" className="w-full px-3 py-2 border rounded-xl text-sm" value={newProjExpName} onChange={e=>setNewProjExpName(e.target.value)} /><CurrencyInput placeholder="Nominal" value={newProjExpAmount} onChange={setNewProjExpAmount} noMargin={true}/></div><button onClick={addProjExp} className="w-full bg-dusky text-white py-2.5 rounded-xl text-xs font-bold mb-4">+ Tambah Target</button>
                  <div className="space-y-2">{(projExpenses||[]).map(exp => (<div key={exp.id} className="flex justify-between p-3 bg-slate-50 rounded-xl text-sm"><span className="font-medium text-night">{exp.name}</span><div className="flex gap-3"><span className="font-bold">{formatRp(exp.amount)}</span><Trash2 size={16} onClick={()=>removeProjExp(exp.id)} className="text-red-400 cursor-pointer"/></div></div>))}</div>
                </div>
              </div>
            )}

            {/* TAB 4: ASET (FULL UPDATE SESUAI PERMINTAAN KAKAK) */}
            {activeTab === 'aset' && (
              <div className="animate-in fade-in space-y-5">
                <h2 className={`text-lg font-bold flex items-center ${isPro ? 'text-lavender' : 'text-night'}`}><Landmark className={`mr-2 ${isPro ? 'text-lavender' : 'text-yellow-500'}`} size={20} /> Aset & Investasi</h2>
                
                {!isPro ? (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl text-center shadow-sm border border-yellow-200"><Crown size={40} className="mx-auto text-yellow-500 mb-3" /><h3 className="font-bold text-night mb-2">Fitur PRO</h3><button onClick={() => setShowUpgradeModal(true)} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 rounded-xl font-bold">Upgrade ke PRO Sekarang</button></div>
                ) : (
                  <>
                    {/* Harta Brankas */}
                    <div className="bg-gradient-to-br from-midnight to-black rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
                      <p className="text-lavender text-sm font-medium mb-1 flex items-center gap-1.5"><Coins size={14}/>Net Worth (Harta Brankas)</p>
                      <h3 className="text-3xl font-extrabold mb-4">{formatRp(totalAssets)}</h3>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-lavender/10 text-xs text-lavender/80">
                        <p className="flex flex-col"><span className="flex items-center text-green-300"><TrendingUp size={12} className="mr-1"/>Apresiasi:</span> <span className="font-semibold text-white mt-1">{formatRp(totalAppreciation)}</span></p>
                        <p className="flex flex-col"><span className="flex items-center text-red-300"><TrendingDown size={12} className="mr-1"/>Depresiasi:</span> <span className="font-semibold text-white mt-1">{formatRp(totalDepreciation)}</span></p>
                      </div>
                    </div>

                    {/* FORM INPUT ASET CERDAS */}
                    <div className="bg-white rounded-2xl p-4 border border-lavender/50 shadow-sm">
                      <h3 className="text-sm font-bold text-night mb-3">Pencatatan Aset Baru</h3>
                      
                      {/* Pilihan Tipe Aset */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <button onClick={() => setNewAssetType('apresiasi')} className={`py-2 rounded-xl border-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${newAssetType === 'apresiasi' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-slate-50 border-slate-100 text-gray-500'}`}><TrendingUp size={14}/> Apresiasi (Naik)</button>
                        <button onClick={() => setNewAssetType('depresiasi')} className={`py-2 rounded-xl border-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${newAssetType === 'depresiasi' ? 'bg-red-50 text-red-700 border-red-300' : 'bg-slate-50 border-slate-100 text-gray-500'}`}><Car size={14}/> Depresiasi (Turun)</button>
                      </div>

                      {/* Input Sesuai Tipe */}
                      <input type="text" placeholder={`Nama Aset (Cth: ${newAssetType === 'apresiasi' ? 'Emas Antam' : 'Motor Beat'})`} className="w-full px-3.5 py-2.5 mb-3 border rounded-xl outline-none text-sm bg-slate-50 focus:ring-2 focus:ring-twilight" value={newAssetName} onChange={e => setNewAssetName(e.target.value)} />
                      
                      {newAssetType === 'apresiasi' && (
                        <div className="flex gap-2 mb-3">
                          <select className="flex-1 px-3.5 py-2.5 border rounded-xl outline-none text-sm bg-slate-50 text-night" value={newAssetCategory} onChange={e => setNewAssetCategory(e.target.value)}>
                            <option value="Emas">Emas</option><option value="Deposito">Deposito</option><option value="Reksa Dana">Reksa Dana</option><option value="Properti">Properti</option><option value="Lainnya">Lainnya</option>
                          </select>
                          <input type="number" placeholder="Berapa Unit/Gram?" className="w-24 px-3.5 py-2.5 border rounded-xl outline-none text-sm bg-slate-50 text-center" value={newAssetUnit} onChange={e => setNewAssetUnit(Number(e.target.value))} min="1" />
                        </div>
                      )}

                      <CurrencyInput label={newAssetType === 'apresiasi' ? `Harga Beli per ${newAssetCategory === 'Emas' ? 'Gram' : 'Unit'} (Modal)` : "Harga Beli / Total Modal Awal"} placeholder="Rp" value={newAssetBuyPrice} onChange={setNewAssetBuyPrice} noMargin={true} />
                      
                      {newAssetType === 'apresiasi' && newAssetBuyPrice > 0 && (
                        <div className="mt-2 mb-3 px-3 py-2 bg-lavender/10 rounded-lg flex justify-between items-center border border-lavender/30">
                          <span className="text-xs text-twilight font-medium">Total Modal Otomatis:</span>
                          <span className="text-sm font-bold text-night">{formatRp(newAssetUnit * newAssetBuyPrice)}</span>
                        </div>
                      )}

                      <button onClick={addAsset} className="w-full mt-3 bg-lavender text-twilight py-3 rounded-xl font-bold text-xs hover:bg-twilight hover:text-white transition shadow-sm">+ Simpan Ke Brankas</button>
                    </div>

                    {/* TABEL ASET APRESIASI */}
                    <div className="p-4 bg-white rounded-3xl border border-green-100 shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-green-50"><h3 className="font-extrabold text-night text-sm"><TrendingUp size={16} className="inline mr-1 text-green-500"/>APRESIASI</h3><span className="font-bold text-green-700">{formatRp(totalAppreciation)}</span></div>
                      {appreciationAssets.length === 0 ? <p className="text-center text-xs text-gray-400 py-4 italic">Belum ada aset apresiasi.</p> :
                        appreciationAssets.map(as => {
                          const buyTotal = (as.buyPrice || as.amount) * (as.unit || 1);
                          const currentTotal = (as.currentPrice !== undefined ? as.currentPrice : (as.buyPrice || as.amount)) * (as.unit || 1);
                          const diff = currentTotal - buyTotal;
                          return (
                          <div key={as.id} className="p-3 mb-2 bg-green-50/30 border border-green-100 rounded-xl text-sm relative">
                             <div className="flex justify-between items-start mb-1"><span className="font-bold text-night text-[13px]">{as.name} <span className="font-normal text-xs text-gray-500">({as.unit || 1} {as.category === 'Emas' ? 'gr' : 'unit'})</span></span><span className="font-extrabold text-green-800 text-[13px]">{formatRp(currentTotal)}</span></div>
                             <div className="flex justify-between items-center text-xs text-gray-500 mb-2"><span>Modal: {formatRp(buyTotal)}</span><span className={`font-bold ${diff > 0 ? 'text-green-600' : (diff < 0 ? 'text-red-500' : 'text-gray-400')}`}>{diff > 0 ? '+' : ''}{formatRp(diff)}</span></div>
                             <div className="flex justify-end gap-1.5 pt-2 border-t border-green-50">
                               <button onClick={() => {setWithdrawAssetId(as.id); setWithdrawAssetVal(0); setEditAssetId(null);}} className="text-[10px] font-bold text-twilight bg-lavender/20 px-2 py-1 rounded hover:bg-lavender/40"><Banknote size={12} className="inline mr-1"/>Tarik Tunai</button>
                               <button onClick={() => {setEditAssetId(as.id); setEditAssetVal(as.currentPrice !== undefined ? as.currentPrice : (as.buyPrice || as.amount)); setWithdrawAssetId(null);}} className="text-[10px] font-bold text-twilight bg-lavender/20 px-2 py-1 rounded hover:bg-lavender/40"><Edit2 size={12} className="inline mr-1"/>Update Harga Pasar</button>
                               <button onClick={() => removeAsset(as.id)} className="text-[10px] text-red-500 bg-red-50 px-2 py-1 rounded hover:bg-red-100"><Trash2 size={12}/></button>
                             </div>
                             
                             {/* Form Update Harga / Tarik Tunai */}
                             {editAssetId === as.id && (<div className="flex items-center gap-2 mt-2 pt-2 border-t border-green-100 animate-in fade-in"><div className="flex-1"><CurrencyInput noMargin={true} placeholder={`Harga per ${as.category === 'Emas' ? 'Gram' : 'Unit'} Saat Ini`} value={editAssetVal} onChange={setEditAssetVal} /></div><button onClick={() => updateAssetCurrentPrice(as.id)} className="bg-twilight text-white px-3 py-2.5 rounded-xl text-[10px] font-bold">Simpan</button></div>)}
                             {withdrawAssetId === as.id && (<div className="flex items-center gap-2 mt-2 pt-2 border-t border-green-100 animate-in fade-in"><div className="flex-1"><CurrencyInput noMargin={true} placeholder="Berapa Rupiah yg ditarik?" value={withdrawAssetVal} onChange={setWithdrawAssetVal} /></div><button onClick={() => handleWithdrawAsset(as)} className="bg-twilight text-white px-3 py-2.5 rounded-xl text-[10px] font-bold">Tarik</button></div>)}
                          </div>
                        )})}
                    </div>

                    {/* TABEL ASET DEPRESIASI */}
                    <div className="p-4 bg-white rounded-3xl border border-lavender shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100"><h3 className="font-extrabold text-night text-sm"><Car size={16} className="inline mr-1 text-lavender"/>DEPRESIASI</h3><span className="font-bold text-lavender">{formatRp(totalDepreciation)}</span></div>
                      {depreciationAssets.length === 0 ? <p className="text-center text-xs text-gray-400 py-4 italic">Belum ada aset depresiasi.</p> :
                        depreciationAssets.map(as => {
                          const buy = as.buyPrice || as.amount;
                          const cur = as.currentPrice !== undefined ? as.currentPrice : buy;
                          const diff = cur - buy;
                          return (
                          <div key={as.id} className="p-3 mb-2 bg-slate-50 border border-slate-100 rounded-xl text-sm relative">
                             <div className="flex justify-between items-start mb-1"><span className="font-bold text-night text-[13px]">{as.name}</span><span className="font-extrabold text-lavender text-[13px]">{formatRp(cur)}</span></div>
                             <div className="flex justify-between items-center text-xs text-gray-500 mb-2"><span>Modal: {formatRp(buy)}</span><span className="font-bold text-red-400">{formatRp(diff)}</span></div>
                             <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-100">
                               <button onClick={() => {setWithdrawAssetId(as.id); setWithdrawAssetVal(0); setEditAssetId(null);}} className="text-[10px] font-bold text-twilight bg-lavender/20 px-2 py-1 rounded hover:bg-lavender/40"><ArrowUpRight size={12} className="inline mr-1"/>Jual / Cairkan</button>
                               <button onClick={() => {setEditAssetId(as.id); setEditAssetVal(cur); setWithdrawAssetId(null);}} className="text-[10px] font-bold text-twilight bg-lavender/20 px-2 py-1 rounded hover:bg-lavender/40"><Edit2 size={12} className="inline mr-1"/>Update Nilai Susut</button>
                               <button onClick={() => removeAsset(as.id)} className="text-[10px] text-red-500 bg-red-50 px-2 py-1 rounded hover:bg-red-100"><Trash2 size={12}/></button>
                             </div>
                             
                             {editAssetId === as.id && (<div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 animate-in fade-in"><div className="flex-1"><CurrencyInput noMargin={true} placeholder="Taksiran Harga Jual Skrg" value={editAssetVal} onChange={setEditAssetVal} /></div><button onClick={() => updateAssetCurrentPrice(as.id)} className="bg-twilight text-white px-3 py-2.5 rounded-xl text-[10px] font-bold">Simpan</button></div>)}
                             {withdrawAssetId === as.id && (<div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 animate-in fade-in"><div className="flex-1"><CurrencyInput noMargin={true} placeholder="Laku Terjual Berapa?" value={withdrawAssetVal} onChange={setWithdrawAssetVal} /></div><button onClick={() => handleWithdrawAsset(as)} className="bg-twilight text-white px-3 py-2.5 rounded-xl text-[10px] font-bold">Tarik</button></div>)}
                          </div>
                        )})}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>

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