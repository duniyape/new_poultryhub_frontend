import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  CheckCircle, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Fish, 
  Wallet, 
  History, 
  Store, 
  ChevronRight,
  Zap
} from 'lucide-react';

// Custom SVG Components for Background Elements with enhanced gradients
const ChickenIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M22,13C22,15.5 20,17.5 17.5,17.5H16.5C16.5,19 15,20.5 13.5,20.5H10.5C9,20.5 7.5,19 7.5,17.5H6.5C4,17.5 2,15.5 2,13C2,11.5 2.5,10 3.5,9C3,7.5 3.5,5.5 5,4.5C6.5,3.5 8.5,4 9.5,5.5C10.5,5 11.5,4.5 13,4.5C15.5,4.5 17.5,6.5 17.5,9C18.5,10 19,11.5 19,13H22M15,9C15,7.9 14.1,7 13,7C11.9,7 11,7.9 11,9C11,10.1 11.9,11 13,11C14.1,11 15,10.1 15,9Z" />
  </svg>
);

const EggIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12,2C8.69,2 6,5.58 6,10C6,14.42 8.69,22 12,22C15.31,22 18,14.42 18,10C18,5.58 15.31,2 12,2Z" />
  </svg>
);

const WhatsappReceiptUi = () => {
  const [shopName, setShopName] = useState('Main Hub');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('idle');
  const [balance, setBalance] = useState(1240.50);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || numAmount > balance) return;
    
    // setStatus('processing');

    
    
    setTimeout(() => {
      setBalance(prev => prev - numAmount);
      setStatus('success');
      triggerParticles();
    }, 2400);
  };

  const triggerParticles = () => {
    const colors = ['#10b981', '#fbbf24', '#ffffff', '#34d399', '#6ee7b7'];
    for (let i = 0; i < 100; i++) {
      const p = document.createElement('div');
      p.className = "fixed pointer-events-none z-[100] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)]";
      const size = Math.random() * 5 + 2;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = '50vw';
      p.style.top = '50vh';
      document.body.appendChild(p);
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 400;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      p.animate([
        { transform: 'translate(-50%, -50%) scale(1.5)', opacity: 1 },
        { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
      ], {
        duration: 1000 + Math.random() * 1000,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }).onfinish = () => p.remove();
    }
  };

  const isInvalid = parseFloat(amount) > balance;

  return (
    <div className="min-h-screen w-full bg-[#022c22] flex items-center justify-center p-6 overflow-hidden font-['Outfit',sans-serif] relative text-slate-200">
      
      {/* Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* Floating Background Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <ChickenIcon className="absolute top-[10%] left-[5%] w-32 h-32 text-emerald-400/5 animate-float opacity-40 blur-[2px]" />
        <ChickenIcon className="absolute bottom-[15%] right-[8%] w-40 h-40 text-emerald-500/5 animate-float-delayed opacity-30 blur-[3px]" />
        <EggIcon className="absolute top-[35%] right-[12%] w-16 h-20 text-amber-300/10 animate-float opacity-50 blur-[1px]" />
        <EggIcon className="absolute bottom-[35%] left-[10%] w-14 h-18 text-white/5 animate-float-delayed opacity-20 blur-[2px]" />
        <Fish className="absolute top-[8%] right-[20%] w-24 h-24 text-teal-400/5 animate-float-slow opacity-30" />
        <Fish className="absolute bottom-[5%] left-[20%] w-28 h-28 text-emerald-300/5 animate-float opacity-10 blur-[4px]" />

        {/* Cinematic Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-emerald-500/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-amber-500/5 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Payment Interface */}
      <div 
        className={`relative z-10 w-full max-w-[420px] transition-all duration-1000 cubic-bezier(0.2, 0.8, 0.2, 1) ${
          status === 'success' ? 'scale-95 opacity-0 translate-y-20' : 'scale-100 opacity-100 translate-y-0'
        }`}
      >
        <div className="relative overflow-hidden bg-white/10 backdrop-blur-[40px] border border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] rounded-[3rem] p-8 md:p-10">
          
          {/* Glass Sweep Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[3rem]">
            <div className="absolute -inset-[150%] bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-[25deg] animate-glossy-sweep" />
          </div>

          {/* Header & Logo */}
          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="relative group">
               <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
               <div className="relative w-16 h-16 bg-gradient-to-b from-emerald-400 to-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-[0_15px_30px_-10px_rgba(16,185,129,0.5)] transition-all duration-500 border border-white/30">
                <ShoppingCart size={30} strokeWidth={2} className="drop-shadow-lg" />
              </div>
            </div>
            
            <h1 className="mt-5 text-2xl font-semibold text-white tracking-tight text-center drop-shadow-md">
              New Poultry Hub
            </h1>
            <div className="flex items-center gap-1.5 mt-2 px-3 py-1 bg-emerald-400/10 rounded-full border border-emerald-400/20 backdrop-blur-md">
              <Zap size={10} className="text-emerald-400 fill-emerald-400" />
              <span className="text-emerald-50/70 font-medium uppercase text-[8px] tracking-[0.2em]">
                Live Terminal
              </span>
            </div>
          </div>

          {/* Premium Balance Card */}
          <div className="mb-8 p-5 rounded-3xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 backdrop-blur-xl relative group/balance transition-all hover:border-white/20 overflow-hidden shadow-inner">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover/balance:animate-shine duration-1000" />
             <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-400/20 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-400/20 transition-transform">
                        <Wallet size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                        <p className="text-[9px] font-medium text-emerald-100/40 uppercase tracking-[0.2em]">Personal Wallet</p>
                        <p className="text-2xl font-medium text-white tracking-tighter transition-all group-hover/balance:text-emerald-300">
                          ${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </p>
                    </div>
                </div>
                <button className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/20 rounded-full transition-all text-white/40 hover:text-white">
                    <History size={16} strokeWidth={1.5} />
                </button>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Merchant Select */}
            <div className="space-y-2 group/input">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-medium text-emerald-100/50 uppercase tracking-[0.2em]">Merchant Unit</label>
                <Store size={10} strokeWidth={1.5} className="text-emerald-500/50" />
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                  className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/10 focus:border-emerald-400/60 focus:bg-black/30 outline-none transition-all text-white text-sm font-normal placeholder:text-white/10 shadow-inner"
                />
              </div>
            </div>

            {/* Amount Field */}
            <div className="space-y-2 group/input">
              <label className="text-[10px] font-medium text-emerald-100/50 uppercase tracking-[0.2em] ml-1">Payment Amount</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400/60 font-medium text-xl">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={balance}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className={`w-full pl-10 pr-5 py-3 rounded-2xl bg-black/20 border transition-all text-white font-normal text-xl placeholder:text-white/5 shadow-inner outline-none ${
                    isInvalid 
                    ? 'border-red-500/40 bg-red-500/5' 
                    : 'border-white/10 focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/5'
                  }`}
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-20 text-[10px] font-medium">
                  USD
                </div>
              </div>
              {isInvalid && (
                <div className="flex items-center gap-1.5 mt-2 px-1">
                  <div className="w-1 h-1 bg-red-500 rounded-full" />
                  <p className="text-[9px] text-red-400 font-medium uppercase tracking-widest">Balance Exceeded</p>
                </div>
              )}
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={status !== 'idle' || isInvalid || !amount}
              className="group relative w-full py-4 mt-4 bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 disabled:from-slate-800 disabled:to-slate-900 disabled:opacity-50 text-white font-medium text-sm rounded-2xl shadow-[0_20px_40px_-10px_rgba(16,185,129,0.2)] transition-all active:scale-[0.98] flex items-center justify-center overflow-hidden border-t border-white/20"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine transition-all duration-700" />
               <div className="flex items-center gap-2 relative z-10">
                {status === 'processing' ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span className="uppercase tracking-widest text-[11px]">Validating...</span>
                  </>
                ) : (
                  <>
                    <span className="uppercase tracking-[0.2em]">Confirm & Pay</span>
                    <ChevronRight size={16} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Meta Footer */}
          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between opacity-30">
            <span className="text-[8px] font-medium tracking-[0.2em] uppercase">AES-256 Auth</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse [animation-delay:0.4s]" />
            </div>
          </div>
        </div>
      </div>

      {/* Success Experience */}
      {status === 'success' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#021d17]/95 backdrop-blur-[60px] transition-opacity animate-in fade-in duration-1000" />
          <div className="relative bg-white/5 border border-white/20 rounded-[4rem] p-12 max-w-[380px] w-full text-center shadow-3xl animate-in zoom-in-95 duration-700 fill-mode-forwards bounce-in overflow-hidden">
            
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -inset-[100%] bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-45 animate-glossy-sweep" />
            </div>

            <div className="flex justify-center mb-8 relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-20 scale-150" />
              <div className="relative bg-gradient-to-b from-emerald-400 to-emerald-600 text-white p-7 rounded-full shadow-[0_20px_50px_rgba(16,185,129,0.5)] border-4 border-emerald-300/30">
                <CheckCircle size={56} strokeWidth={2} />
              </div>
            </div>
            
            <h2 className="text-3xl font-medium text-white mb-2 tracking-tighter uppercase">Authorized</h2>
            <p className="text-emerald-400/60 font-medium text-[10px] tracking-[0.2em] uppercase mb-8">Ref: PH-{Math.floor(Math.random()*1000000)}</p>
            
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] mb-10 shadow-inner group">
              <p className="text-white/40 font-medium text-[9px] uppercase tracking-widest mb-2">Transferred to {shopName}</p>
              <p className="text-white font-medium text-5xl tracking-tighter transition-all group-hover:scale-105 duration-500">
                <span className="text-2xl text-emerald-400 mr-1">$</span>
                {parseFloat(amount).toFixed(2)}
              </p>
              <div className="mt-6 pt-4 border-t border-white/10 text-[10px] text-emerald-400/80 font-medium uppercase tracking-widest">
                Account Bal: ${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </div>
            </div>

            <button
              onClick={() => { setStatus('idle'); setAmount(''); }}
              className="w-full py-5 bg-white text-emerald-950 font-semibold rounded-2xl transition-all shadow-2xl hover:bg-emerald-50 active:scale-95 text-xs uppercase tracking-[0.2em]"
            >
              Finish Session
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-25px) rotate(4deg); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(25px) rotate(-4deg); } }
        @keyframes float-slow { 0%, 100% { transform: translate(0, 0) rotate(0); } 50% { transform: translate(40px, -20px) rotate(12deg); } }
        
        .animate-float { animation: float 10s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 12s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 18s ease-in-out infinite; }

        @keyframes glossy-sweep { 
          0% { transform: translateX(-150%) translateY(-150%) rotate(25deg); } 
          20% { transform: translateX(150%) translateY(150%) rotate(25deg); } 
          100% { transform: translateX(150%) translateY(150%) rotate(25deg); } 
        }
        @keyframes shine { 100% { transform: translateX(100%); } }
        @keyframes bounce-in { 0% { transform: scale(0.6) translateY(20px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }

        .animate-glossy-sweep { animation: glossy-sweep 8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .animate-shine { animation: shine 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        .bounce-in { animation: bounce-in 0.7s cubic-bezier(0.2, 0.8, 0.2, 1.1) forwards; }

        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        ::placeholder { color: rgba(255, 255, 255, 0.1); }
      `}} />
    </div>
  );
};

export default WhatsappReceiptUi;