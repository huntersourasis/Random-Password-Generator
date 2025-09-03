(function(){
  const el = id=>document.getElementById(id);
  const lengthInput = el('length');
  const lower = el('lower');
  const upper = el('upper');
  const numbers = el('numbers');
  const symbols = el('symbols');
  const ambiguous = el('ambiguous');
  const readable = el('readable');
  const output = el('output');
  const generateBtn = el('generate');
  const copyBtn = el('copy');
  const downloadBtn = el('download');
  const regenerateBtn = el('regenerate');
  const historyEl = el('history');
  const entropyEl = el('entropy');
  const meterBar = el('meterbar');
  const sets = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
  };
  const ambiguousChars = /[O0oIl1]/g;
  function buildCharset(){
    let cs = '';
    if(lower.checked) cs += sets.lower;
    if(upper.checked) cs += sets.upper;
    if(numbers.checked) cs += sets.numbers;
    if(symbols.checked) cs += sets.symbols;
    if(ambiguous.checked) cs = cs.replace(ambiguousChars,'');
    return cs;
  }
  function secureRandomInt(max){
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  function generate(){
    const len = Math.max(1, Math.min(256, Number(lengthInput.value)||16));
    const cs = buildCharset();
    if(!cs.length) return alert('Choose at least one character set');
    let pass = '';
    const charsetArr = Array.from(cs);
    for(let i=0;i<len;i++){
      let ch = charsetArr[secureRandomInt(charsetArr.length)];
      pass += ch;
    }
    if(readable.checked){
      // simple readable filter: avoid more than 2 consecutive symbols
      pass = pass.replace(/([!@#$%^&*()_+\-=[\]{}|;:,.<>?/~`']){3,}/g, m=>m.slice(0,2));
    }
    updateOutput(pass);
  }
  function passwordEntropy(password){
    // estimate: log2(charsetSize^length) = length * log2(charsetSize)
    const cs = new Set(password).size; // fallback
    const chosen = buildCharset().length || cs || 1;
    const ent = (password.length * Math.log2(chosen));
    return Math.round(ent*10)/10;
  }
  function updateOutput(pass){
    output.textContent = pass;
    entropyEl.textContent = passwordEntropy(pass) + ' bits';
    // fill meter (cap 128 bits)
    const val = Math.min(128, passwordEntropy(pass));
    meterBar.style.width = (val/128*100) + '%';
    // color gradient by width
    if(val<40) meterBar.style.background = 'linear-gradient(90deg,#ef4444,#f97316)';
    else if(val<80) meterBar.style.background = 'linear-gradient(90deg,#f59e0b,#facc15)';
    else meterBar.style.background = 'linear-gradient(90deg,#22c55e,#84cc16)';
    // push to history
    const item = document.createElement('div');
    item.textContent = pass;
    historyEl.prepend(item);
  }
  generateBtn.addEventListener('click', generate);
  regenerateBtn.addEventListener('click', ()=>{
    if(output.textContent && buildCharset().length) generate();
  });
  copyBtn.addEventListener('click', async ()=>{
    try{
      await navigator.clipboard.writeText(output.textContent);
      copyBtn.textContent = 'Copied!';
      setTimeout(()=>copyBtn.textContent='Copy',1400);
    }catch(e){
      alert('Clipboard write failed — please copy manually.');
    }
  });
  downloadBtn.addEventListener('click', ()=>{
    const blob = new Blob([output.textContent], {type:'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'password.txt';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });
  // Generate a first password on load
  generate();
})();