const MENU = [
  {id:'huevos-rancheros', cat:'breakfast', name:'Huevos Rancheros', desc:'Rancheros platter: panfried potatoes, slow-cooked pintos, two eggs, red or green chile, cheddar & jack, flour tortilla.', price:5.99, badge:'CLASSIC'},
  {id:'carne-rancheros', cat:'breakfast', name:'Carne Adovada Rancheros', desc:'Huevos Rancheros with carne adovada. Potatoes, pintos, two eggs, chile & cheese, tortilla.', price:6.75},
  {id:'taco-rancheros', cat:'breakfast', name:'Taco Rancheros', desc:'Huevos Rancheros with seasoned ground beef on corn tortillas. Potatoes, pintos, eggs, chile & cheese.', price:6.75},
  {id:'ench-rancheros', cat:'breakfast', name:'Enchilada Rancheros', desc:'Huevos Rancheros with two enchiladas. Potatoes, pintos, eggs, chile & cheese, tortilla.', price:6.75},
  {id:'two-egg', cat:'breakfast', name:'Two Egg Special (w/ Meat)', desc:'Two eggs, panfried potatoes, HAM / SAUSAGE / BACON, white or wheat toast.', price:5.99},
  {id:'omelette', cat:'breakfast', name:'Omelette — 4 Eggs', desc:'Ham & Cheddar • Bacon & Cheddar • Sausage & Cheddar • Cheese • Denver (ham, pepper, onion). Potatoes + toast.', price:6.75},
  {id:'two-four', cat:'breakfast', name:'2 + 4 + 4', desc:'Two eggs, four silver-dollar pancakes, four bacon slices & panfried potatoes.', price:6.99, badge:'BIG'},
  {id:'bb-basic', cat:'breakfast', name:'Basic Breakfast Burrito', desc:'Egg & potato. Hand-held 2.69 • Smothered chile & cheese 3.69.', price:2.69},
  {id:'bb-westside', cat:'breakfast', name:'Westside Burrito', desc:'Egg, potato & green chile. Hand-held 2.99 • Smothered 3.99.', price:2.99},
  {id:'bb-nm', cat:'breakfast', name:'New Mexico Burrito', aka:'Egg, potato, green chile & cheese', desc:'Hand-held 3.39 • Smothered chile & cheese 4.39.', price:3.39},
  {id:'bb-abq', cat:'breakfast', name:'Albuquerque Burrito', desc:'Sausage, egg, potato, red chile & cheese. Hand-held 3.99 • Smothered 4.99.', price:3.99, badge:'POPULAR'},
  {id:'bb-south', cat:'breakfast', name:'South Valley Burrito', desc:'Chorizo, egg, potato, red chile & cheese. 3.99 • Smothered 4.99.', price:3.99},
  {id:'bb-taos', cat:'breakfast', name:'Taos Burrito', desc:'Ham, egg, potato, green chile & cheese. 3.99 • Smothered 4.99.', price:3.99},
  {id:'bb-rio', cat:'breakfast', name:'Rio Grande Burrito', desc:'Carne adovada, egg, potato, red chile & cheese. 3.99 • Smothered 4.99.', price:3.99},
  {id:'bb-supreme', cat:'breakfast', name:'Supreme Burrito', aka:'Bacon, egg, potato, red chile & cheese', desc:'Hand-held 3.99 • Smothered 4.99.', price:3.99},
  {id:'bb-sf', cat:'breakfast', name:'Santa Fe Burrito', desc:'Ground beef, egg, potato, onion, red chile & cheese. 3.99 • Smothered 4.99.', price:3.99},
  {id:'bb-veg', cat:'breakfast', name:'Vegetarian Burrito', desc:'Egg, bell pepper, onion, tomato, green chile & cheese. 3.99 • Smothered 4.99.', price:3.99},
  {id:'bb-denver', cat:'breakfast', name:'Denver Burrito', desc:'Egg, ham, bell peppers, onion & cheese. 3.99 • Smothered 4.99.', price:3.99},
  {id:'bb-biggie', cat:'breakfast', name:'Three Meat Biggie', desc:'Sausage, bacon, ham, egg, potato, green chile & cheese. 4.89 • Smothered 5.99.', price:4.89, badge:'BIG'},
  {id:'bb-byo', cat:'breakfast', name:'Build-Your-Own Burrito', desc:'Start Basic egg & potato 2.69 + .29 salsa • .49 chile/cheese/beans/sour cream/jalapeno • .99 meats.', price:2.69},
  {id:'kid-breakfast', cat:'breakfast', name:'Kiddie Breakfast + OJ', desc:'French Toast Stix (5) • Egg & Cheese Burrito • 3 Silver-Dollar Pancakes. Small OJ included.', price:3.75},
  {id:'kid-lunch', cat:'breakfast', name:'Kiddie Lunch + Soda', desc:'Corn Dog • Taco • Nuggets (5) • Beef or Bean & Cheese Burrito. Fries + 16oz soda.', price:3.99},
  {id:'pb-beef', cat:'burritos', name:'Pollos Burrito — Beef', desc:'Seasoned ground beef + beans, Pollos fries, red/green chile, cheese, lettuce & tomato. 1/8 4.99 • 1/4 5.99 • 1/2 6.99 • Whole 7.99.', price:5.99, badge:'HOUSE'},
  {id:'pb-chicken', cat:'burritos', name:'Pollos Burrito — Chicken', aka:'"Pollos Burrito"', desc:'Chicken + beans, Pollos fries, red/green chile, cheese, lettuce & tomato. Sizes 1/8–Whole.', price:5.99, badge:'HOUSE'},
  {id:'pb-adovada', cat:'burritos', name:'Pollos Burrito — Carne Adovada', desc:'Carne adovada + beans, Pollos fries, red/green chile, cheese, lettuce & tomato.', price:5.99},
  {id:'pb-veg', cat:'burritos', name:'Pollos Burrito — Vegetarian', desc:'Beans & rice, Pollos fries, red/green chile, cheese, lettuce & tomato.', price:4.99},
  {id:'b-adovada', cat:'burritos', name:'Carne Adovada Burrito', desc:'Potato, red chile & cheese. Hand-held 4.39 • Smothered 5.39 • Deluxe 5.99.', price:4.39},
  {id:'b-chicken', cat:'burritos', name:'Chicken Burrito', desc:'Bean, potato, green chile & cheese. Hand-held 4.39 • Smothered 5.39 • Deluxe 5.99.', price:4.39},
  {id:'b-beef', cat:'burritos', name:'Beef Burrito', desc:'Potato, green chile & cheese. Hand-held 4.39 • Smothered 5.39 • Deluxe 5.99.', price:4.39},
  {id:'b-bean', cat:'burritos', name:'Bean & Cheese Burrito', desc:'Hand-held 2.69 • Smothered 3.69 • Deluxe 4.29.', price:2.69},
  {id:'b-shredded', cat:'burritos', name:'Shredded Beef Burrito', desc:'Potato, green chile & cheese. Hand-held 4.69 • Smothered 5.69 • Deluxe 6.29.', price:4.69},
  {id:'pl-ench', cat:'platters', name:'Enchilada Platter', desc:'3 rolled enchiladas, choice of red/green chile. Beans, rice, lettuce, tomato & cheese.', price:6.49},
  {id:'pl-burrito', cat:'platters', name:'Burrito Platter', desc:'Choice of chile. Beans, rice, lettuce, tomato & cheese.', price:6.49},
  {id:'pl-combo', cat:'platters', name:'Combination Platter', desc:'Two chicken enchiladas + two crispy beef tacos, choice of chile + salsa.', price:6.99, badge:'POPULAR'},
  {id:'pl-chimi', cat:'platters', name:'Chimichanga Platter', desc:'Crispy fried burrito, cheese, sour cream & choice of chile.', price:6.59},
  {id:'pl-taco2', cat:'platters', name:'Taco Platter — Beef/Chicken/Adovada', desc:'Soft flour or crispy corn, salsa. 2pc 4.99 • 3pc 5.99. Shredded beef +.50.', price:4.99},
  {id:'indian-taco', cat:'platters', name:'Indian Taco', desc:'Fry bread + beef/chicken/carne adovada, beans, red/green chile, lettuce, tomato & cheese.', price:6.25},
  {id:'taco-salad', cat:'platters', name:'Taco Salad (Beef/Chicken)', desc:'Crisp flour tortilla, meat, lettuce, beans, cheese, guac, sour cream & tomato.', price:6.25},
  {id:'gc-stew', cat:'platters', name:'Green Chile Stew', desc:'Beef or chicken, green chile, beans & potato, cheese & garnish + side tortilla.', price:4.99},
  {id:'nacho', cat:'platters', name:'Nacho Supreme', desc:'Tostados, beans, cheese, jalapenos, guac, sour cream & tomato. +Beef/Chicken 1.00.', price:6.25},
  {id:'wrap', cat:'platters', name:'Chicken Wrap', aka:'"Pollos Burrito" style wrap', desc:'Crispy strips, cheddar, lettuce, tomato, guac, bacon & ranch. Tostada chips + salsa.', price:5.50},
  {id:'macho', cat:'platters', name:'Macho Burrito Grande', desc:'Beef, bean, potato & rice, green chile, cheese, sour cream, lettuce & tomato.', price:5.99},
  {id:'burger-all', cat:'burgers', name:'All American Burger', desc:'Lettuce, tomato, onion, mustard & ketchup. Ala carte 3.79 • Combo 5.99.', price:3.79},
  {id:'burger-cheese', cat:'burgers', name:'Cheese Burger', desc:'Ala carte 4.04 • Combo w/ fries + 32oz drink 6.24.', price:4.04},
  {id:'burger-gc', cat:'burgers', name:'Green Chile Cheese Burger', desc:'Ala carte 4.29 • Combo 6.49.', price:4.29, badge:'NM FAVE'},
  {id:'burger-bacon', cat:'burgers', name:'Bacon Cheese Burger', desc:'Ala carte 4.54 • Combo 6.74.', price:4.54},
  {id:'burger-cal', cat:'burgers', name:'California Burger', desc:'Cheese, guacamole & bacon. Ala carte 5.03 • Combo 7.23.', price:5.03},
  {id:'burger-double', cat:'burgers', name:'Double Meat Double Cheese', desc:'Ala carte 5.29 • Combo 7.49.', price:5.29, badge:'BIG'},
  {id:'burger-hermanos', cat:'burgers', name:'Hermanos Burger', aka:'"El Heisenberg"', desc:'Open face, red chile, cheese, lettuce, tomato & onion. Ala carte 4.79 • Combo 6.99.', price:4.79},
  {id:'grilled', cat:'burgers', name:'Grilled Chicken Sandwich', desc:'Boneless grilled chicken, mayo, lettuce & tomato. 4.49 • Combo 6.69.', price:4.49},
  {id:'nm-chicken', cat:'burgers', name:'New Mexico Chicken Sandwich', desc:'Cheddar & jack + green chile. 4.99 • Combo 7.19.', price:4.99},
  {id:'chx-supreme', cat:'burgers', name:'Chicken Supreme', desc:'Cheddar & jack + bacon. 5.25 • Combo 7.45.', price:5.25},
  {id:'chx-cal', cat:'burgers', name:'California Chicken', desc:'Cheddar & jack + guacamole. 5.49 • Combo 7.69.', price:5.49},
  {id:'tenders3', cat:'burgers', name:'Pollos Tenders + Curly Fries', aka:'"Pollos Tenders"', desc:'Hand-breaded tenders, curly fries, Texas toast + 1 sauce.', price:11.49, badge:'POPULAR'},
  {id:'spicy6', cat:'burgers', name:'Spicy Pollos Wings (6)', aka:'"Wingicita"', desc:'Hot Hermanos glaze, ranch dust, pickles.', price:12.99},
  {id:'bucket', cat:'burgers', name:'8pc Hermanos Bucket', aka:'"The Full Measure"', desc:'Pressure-fried chicken + secret spices. Feeds 3–4.', price:29.99, badge:'BEST VALUE'},
  {id:'fries', cat:'sides', name:'French Fries', desc:'Golden & salted.', price:1.79},
  {id:'curly', cat:'sides', name:'Green Chile Cheese Fries', aka:'"Spice Curls"', desc:'Fries + green chile & cheese.', price:3.25, badge:'ICONIC'},
  {id:'taco-side', cat:'sides', name:'Taco (Side)', desc:'With homemade salsa.', price:1.59},
  {id:'ench-side', cat:'sides', name:'Enchilada (Side)', desc:'Red or green.', price:1.99},
  {id:'nachos-mini', cat:'sides', name:'Mini Nachos', desc:'Tostadas, beans, cheese & jalapeno.', price:3.25},
  {id:'chips-salsa', cat:'sides', name:'Chips & Homemade Salsa', desc:'Fresh tostada chips.', price:1.50},
  {id:'nuggets', cat:'sides', name:'Chicken Nuggets (5)', desc:'With barbecue sauce.', price:1.75},
  {id:'corndog', cat:'sides', name:'Corn Dog', desc:'Classic.', price:1.75},
  {id:'slaw', cat:'sides', name:'ABQ Street Slaw', aka:'"Slaw Goodman"', desc:'Charred corn, cabbage, cotija, lime crema.', price:4.99},
  {id:'soda', cat:'sweet', name:'Soda & Iced Tea', desc:'Small 1.49 • Medium 1.89 • Large 2.09.', price:1.49},
  {id:'coffee', cat:'sweet', name:'Coffee', desc:'Small 1.19.', price:1.19},
  {id:'oj', cat:'sweet', name:'Orange Juice', desc:'Small .99 • Large 1.99.', price:0.99},
  {id:'water', cat:'sweet', name:'Bottled Water', desc:'Medium 1.19.', price:1.19},
  {id:'tea', cat:'sweet', name:'Sweet Hermanos Tea', desc:'Peach + hibiscus iced tea.', price:2.99},
  {id:'horchata', cat:'sweet', name:'Cinnamon Horchata', desc:'House-made, extra cinnamon.', price:3.49},
  {id:'apple', cat:'sweet', name:'Apple Bites', desc:'Warm & cinnamon.', price:1.19},
  {id:'churros', cat:'sweet', name:'Churros', desc:'Cinnamon sugar.', price:1.49, badge:'FRESH'},
  {id:'flan', cat:'sweet', name:'Cajeta Flan', aka:'"Bombshell"', desc:'Silky caramel flan, family recipe.', price:5.99},
];

// Real photos: franchise concept shots (images/*.webp|png) + stock food photography (images/menu/*.jpg)
const IMGS = {
  wrap:'polloloco.webp', bucket:'menu/bucket.jpg', rotis:'menu/rotisserie.jpg', curly:'spicecurls.webp',
  torta:'pollotorta.webp', tenders3:'tenders.webp',
  slaw:'sides.webp', spicy6:'wings.webp', sandwich:'fam.webp', flan:'menu/flan.jpg',
  'pb-chicken':'polloloco.webp', 'burger-hermanos':'menu/bacon-cheeseburger-2.jpg',
  'huevos-rancheros':'menu/huevos-rancheros.jpg', 'carne-rancheros':'menu/carne-rancheros.jpg',
  'taco-rancheros':'menu/taco-rancheros.jpg', 'ench-rancheros':'menu/enchiladas.jpg',
  'two-egg':'menu/eggs-bacon.jpg', omelette:'menu/omelette.jpg', 'two-four':'menu/pancakes.jpg',
  'bb-basic':'menu/bburrito-1.jpg', 'bb-westside':'menu/bb-westside-green.jpg', 'bb-nm':'menu/bb-nm-green.jpg',
  'bb-abq':'menu/bburrito-4.jpg', 'bb-south':'menu/bburrito-7.jpg', 'bb-taos':'menu/bburrito-8.jpg',
  'bb-rio':'menu/bb-rio-red.jpg', 'bb-supreme':'menu/bb-supreme-bacon.jpg', 'bb-sf':'menu/burrito-beef-2.jpg',
  'bb-veg':'menu/bb-veggie.jpg', 'bb-denver':'menu/bburrito-9.jpg', 'bb-biggie':'menu/bburrito-10.jpg',
  'bb-byo':'menu/bb-byo-ingredients.jpg', 'kid-breakfast':'menu/french-toast.jpg', 'kid-lunch':'menu/nuggets.jpg',
  'pb-beef':'menu/burrito-beef.jpg', 'pb-adovada':'menu/burrito-smothered.jpg', 'pb-veg':'menu/burrito-1.jpg',
  'b-adovada':'menu/burrito-adovada-red.jpg', 'b-chicken':'menu/burrito-2.jpg', 'b-beef':'menu/burrito-beef-shred.jpg',
  'b-bean':'menu/bean-burrito.jpg', 'b-shredded':'menu/burrito-shredded.jpg',
  'pl-ench':'menu/enchiladas-2.jpg', 'pl-burrito':'menu/platter-burrito.jpg', 'pl-combo':'polloloco1.webp',
  'pl-chimi':'menu/chimichanga.jpg', 'pl-taco2':'menu/tacos.jpg', 'indian-taco':'menu/indian-taco.jpg',
  'taco-salad':'menu/taco-salad.jpg', 'gc-stew':'menu/stew.jpg', nacho:'menu/nachos.jpg',
  macho:'menu/macho-grande.jpg',
  'burger-all':'menu/burger.jpg', 'burger-cheese':'menu/cheeseburger-2.jpg', 'burger-gc':'menu/cheeseburger-3.jpg',
  'burger-bacon':'menu/bacon-cheeseburger.jpg', 'burger-cal':'menu/guac-burger.jpg', 'burger-double':'menu/burger-double-2.jpg',
  grilled:'menu/chicken-sand.jpg', 'nm-chicken':'menu/chicken-sand-2.jpg',
  'chx-supreme':'menu/chicken-sandwich-3.jpg', 'chx-cal':'menu/chicken-sandwich-4.jpg',
  fries:'menu/fries-basket.jpg', 'taco-side':'menu/tacos-crispy-2.jpg', 'ench-side':'menu/enchilada-single.jpg',
  'nachos-mini':'menu/nachos-2.jpg', 'chips-salsa':'menu/chips-salsa.jpg', nuggets:'menu/nuggets-2.jpg',
  corndog:'menu/corn-dog.jpg',
  soda:'bev.webp', coffee:'menu/coffee-cup.jpg', oj:'menu/oj-glass.jpg', water:'menu/water.jpg',
  tea:'menu/iced-tea.jpg', horchata:'menu/horchata.jpg', apple:'menu/apple-bites.jpg', churros:'menu/churros.jpg'
};
MENU.forEach(m=>{ if(IMGS[m.id]) m.img = 'images/' + IMGS[m.id]; });

const cart = new Map();
const grid = document.getElementById('menuGrid');
const tabs = document.getElementById('tabs');
const search = document.getElementById('search');
let filter = 'all';

function money(n){ return '$' + n.toFixed(2); }

function renderMenu(){
  const q = search.value.trim().toLowerCase();
  grid.innerHTML = '';
  MENU.filter(m => (filter==='all' || m.cat===filter) && (!q || (m.name+' '+(m.desc||'')).toLowerCase().includes(q))).forEach(m=>{
    const el = document.createElement('article');
    el.className='card';
    el.innerHTML = `<div class="card-art"><img src="${m.img||'images/lph.png'}" alt="${m.name}" loading="lazy" />${m.badge?`<span class="card-badge">${m.badge}</span>`:''}</div>
      <div class="card-body"><h3>${m.name}</h3>${m.aka?`<p class="aka">${m.aka}</p>`:''}<p>${m.desc}</p>
      <div class="card-foot"><span class="card-price">${money(m.price)}</span><button class="add" data-add="${m.id}">Add +</button></div></div>`;
    grid.appendChild(el);
  });
  if(!grid.children.length) grid.innerHTML = '<div class="empty">No matches — try another search.</div>';
}
tabs.addEventListener('click', e=>{
  const b = e.target.closest('.tab'); if(!b) return;
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  b.classList.add('active'); filter = b.dataset.cat; renderMenu();
});
search.addEventListener('input', renderMenu);

function addToCart(id){
  const item = MENU.find(m=>m.id===id); if(!item) return;
  cart.set(id, (cart.get(id)||0)+1);
  updateCart();
  toast(`${item.name} added to order.`);
  openDrawer();
}
document.addEventListener('click', e=>{
  const b = e.target.closest('[data-add]'); if(b) addToCart(b.dataset.add);
});

const drawer = document.getElementById('drawer');
const overlay = document.getElementById('overlay');
function openDrawer(){ drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); overlay.hidden=false; }
function closeDrawer(){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); overlay.hidden=true; }
document.getElementById('cartOpen').onclick = openDrawer;
document.getElementById('cartClose').onclick = closeDrawer;
overlay.onclick = closeDrawer;

function updateCart(){
  const box = document.getElementById('cartItems');
  const count = [...cart.values()].reduce((a,b)=>a+b,0);
  document.getElementById('cartCount').textContent = count;
  if(count===0){ box.innerHTML = '<div class="empty">Your basket is empty.<br/>The fryer is waiting…</div>'; }
  else{
    box.innerHTML='';
    for(const [id,qty] of cart){
      const m = MENU.find(x=>x.id===id);
      const row = document.createElement('div'); row.className='cart-row';
      row.innerHTML = `<img class="cart-thumb" src="${m.img||'images/lph.png'}" alt="" /><div><strong>${m.name}</strong><span>${money(m.price)} each</span></div>
        <div class="qty"><button data-dec="${id}">−</button><b>${qty}</b><button data-inc="${id}">+</button></div>`;
      box.appendChild(row);
    }
  }
  const total = [...cart].reduce((s,[id,q])=>s + MENU.find(m=>m.id===id).price*q, 0);
  document.getElementById('cartTotal').textContent = money(total);
}
document.getElementById('cartItems').addEventListener('click', e=>{
  const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
  if(inc){ cart.set(inc.dataset.inc, cart.get(inc.dataset.inc)+1); updateCart(); }
  if(dec){ const id=dec.dataset.dec; const q=cart.get(id)-1; q<=0?cart.delete(id):cart.set(id,q); updateCart(); }
});
document.getElementById('clearBtn').onclick = ()=>{ cart.clear(); updateCart(); };

let toastT;
function toast(msg){
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove('show'), 2200);
}

document.getElementById('checkoutBtn').onclick = ()=>{
  if(cart.size===0){ toast('Add something tasty first.'); return; }
  const total = document.getElementById('cartTotal').textContent;
  const n = [...cart.values()].reduce((a,b)=>a+b,0);
  document.getElementById('checkoutText').textContent = `${n} items • ${total} — your pollos are hitting the fryer right now.`;
  document.getElementById('orderNum').textContent = 'LPH-' + Math.floor(1000+Math.random()*9000);
  document.getElementById('checkoutModal').hidden = false;
  cart.clear(); updateCart(); closeDrawer();
};
document.getElementById('modalClose').onclick = ()=>{ document.getElementById('checkoutModal').hidden = true; };
document.getElementById('checkoutModal').addEventListener('click', e=>{ if(e.target.id==='checkoutModal') e.target.hidden=true; });

document.getElementById('cateringForm').addEventListener('submit', e=>{ e.preventDefault(); document.getElementById('cateringNote').hidden=false; toast('Catering request sent.'); e.target.reset(); });
document.getElementById('newsForm').addEventListener('submit', e=>{ e.preventDefault(); document.getElementById('newsNote').hidden=false; toast('Welcome to the familia.'); e.target.reset(); });

// Training course: full 10-video playlist in proper training order
// (playlist lists them 10->1; we play basics first, emergencies last)
const TRAINING = [
  {title:'Communication', id:'B9RgougnhiE'},
  {title:'Cleanliness', id:'OJ10cVu2R5I'},
  {title:'Shipping And Receiving', id:'fH_vg7mSS2M'},
  {title:'Customer Service', id:'547FLQEjdF8'},
  {title:'Code Of Conduct', id:'OTDlbmBoFIs'},
  {title:'Loss Prevention', id:'ELC0ZzD5qeE'},
  {title:'Brand Management', id:'juWdP2nGRqc'},
  {title:'Sustainability', id:'XgYIRpnu8lo'},
  {title:'Conflict Resolution', id:'Vpdoy8KBFdo'},
  {title:'Emergency Situations', id:'lSHaBnRd9MU'},
];
let trainIdx = 0;
const trainNow = document.getElementById('trainNow');
const chaptersBox = document.getElementById('chapters');
const trainProgress = document.getElementById('trainProgress');
const enterLabBtn = document.getElementById('enterLabBtn');

// Training gate: lessons count only when watched to the end (YT ENDED state).
// Progress persists in localStorage; unlock is permanent unless site data is cleared.
const LS_KEY = 'lph_training_done';
let ytTrain = null, ytTrainReady = false;
function loadDone(){
  try {
    const d = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    return Array.isArray(d) ? d.filter(id => TRAINING.some(t => t.id === id)) : [];
  } catch (e) { return []; }
}
let doneIds = loadDone();
function saveDone(){ try { localStorage.setItem(LS_KEY, JSON.stringify(doneIds)); } catch (e) {} }
function isUnlocked(){ return doneIds.length >= TRAINING.length; }
function refreshTrainingUI(){
  [...chaptersBox.children].forEach((li, j)=>li.classList.toggle('done', doneIds.includes(TRAINING[j].id)));
  if (isUnlocked()){
    trainProgress.textContent = 'Training complete: 10/10 — the lab is open. Play it any time.';
    enterLabBtn.hidden = false;
  } else {
    trainProgress.textContent = `Training progress: ${doneIds.length}/10 — watch every lesson to the end to unlock the lab.`;
    enterLabBtn.hidden = true;
  }
}
function markLessonDone(id){
  if (!TRAINING.some(t => t.id === id) || doneIds.includes(id)) return;
  doneIds.push(id);
  saveDone();
  refreshTrainingUI();
  if (isUnlocked()) toast('Training complete. The lab is open.');
  else toast(`Lesson complete: ${doneIds.length}/10.`);
}
TRAINING.forEach((t, i)=>{
  const li = document.createElement('li');
  const b = document.createElement('button');
  b.type = 'button';
  b.innerHTML = `<strong>${i+1}.</strong> ${t.title}<span class="chk">✓</span>`;
  b.onclick = ()=>playLesson(i, true);
  li.appendChild(b);
  chaptersBox.appendChild(li);
});
function playLesson(i, autoplay){
  trainIdx = (i + TRAINING.length) % TRAINING.length;
  const t = TRAINING[trainIdx];
  if (ytTrainReady) {
    if (autoplay) ytTrain.loadVideoById(t.id);
    else ytTrain.cueVideoById(t.id);
  } else {
    document.getElementById('trainingPlayer').src = `https://www.youtube.com/embed/${t.id}?rel=0${autoplay?'&autoplay=1':''}&enablejsapi=1`;
  }
  trainNow.textContent = `Lesson ${trainIdx+1} of ${TRAINING.length} — ${t.title}`;
  [...chaptersBox.children].forEach((li, j)=>li.classList.toggle('active', j===trainIdx));
}
(function loadTrainingAPI(){
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
})();
const _prevYTReady = window.onYouTubeIframeAPIReady;
window.onYouTubeIframeAPIReady = function(){
  if (typeof _prevYTReady === 'function') _prevYTReady();
  try {
    ytTrain = new YT.Player('trainingPlayer', {
      events: {
        onReady: ()=>{ ytTrainReady = true; ytTrain.cueVideoById(TRAINING[trainIdx].id); },
        onStateChange: (e)=>{
          if (e.data === YT.PlayerState.ENDED) {
            let vid = '';
            try { vid = e.target.getVideoData().video_id; } catch (_) {}
            markLessonDone(vid || TRAINING[trainIdx].id);
          }
        }
      }
    });
  } catch (e) { /* API unavailable: videos still play via plain embed, but lessons can't complete */ }
};
document.getElementById('trainPrev').onclick = ()=>playLesson(trainIdx-1, true);
document.getElementById('trainNext').onclick = ()=>playLesson(trainIdx+1, true);
playLesson(0, false);
refreshTrainingUI();

// Secret lab entries (all gated on training completion)
function tryEnterLab(){
  if (isUnlocked()) { location.href = 'lab.html'; return; }
  toast(`Training incomplete: ${doneIds.length}/10 lessons watched.`);
  document.getElementById('training').scrollIntoView({behavior:'smooth'});
}
enterLabBtn.onclick = ()=>{ location.href = 'lab.html'; };
(function brandTripleClick(){
  const brand = document.getElementById('brandHome');
  let clicks = 0, timer = null;
  brand.addEventListener('click', ()=>{
    clicks++;
    clearTimeout(timer);
    timer = setTimeout(()=>{ clicks = 0; }, 800);
    if (clicks >= 3) { clicks = 0; tryEnterLab(); }
  });
})();
(function blueTypist(){
  let buf = '';
  document.addEventListener('keydown', (e)=>{
    const tag = (e.target && e.target.tagName) || '';
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
    if (e.key.length === 1) buf = (buf + e.key.toLowerCase()).slice(-4);
    else return;
    if (buf === 'blue') { buf = ''; tryEnterLab(); }
  });
})();

// Jobs apply modal
const applyModal = document.getElementById('applyModal');
const applyRole = document.getElementById('applyRole');
document.addEventListener('click', e=>{
  const b = e.target.closest('[data-apply]');
  if(b){ applyRole.textContent = b.dataset.apply; applyModal.hidden = false; }
});
document.getElementById('applyCancel').onclick = ()=>{ applyModal.hidden = true; };
applyModal.addEventListener('click', e=>{ if(e.target===applyModal) applyModal.hidden = true; });
document.getElementById('applyForm').addEventListener('submit', e=>{
  e.preventDefault(); applyModal.hidden = true; e.target.reset();
  toast('Application sent. Gus respects discipline.');
});

// Contact form with confirm step
const contactForm = document.getElementById('contactForm');
const confirmModal = document.getElementById('confirmModal');
let pendingContact = null;
contactForm.addEventListener('submit', e=>{
  e.preventDefault();
  pendingContact = {
    name: document.getElementById('contactName').value,
    email: document.getElementById('contactEmail').value,
    msg: document.getElementById('contactMsg').value
  };
  document.getElementById('confirmText').textContent = `Send inquiry as ${pendingContact.name}? We'll reply to ${pendingContact.email}.`;
  confirmModal.hidden = false;
});
document.getElementById('confirmCancel').onclick = ()=>{ confirmModal.hidden = true; pendingContact = null; };
confirmModal.addEventListener('click', e=>{ if(e.target===confirmModal){ confirmModal.hidden = true; pendingContact = null; } });
document.getElementById('confirmGo').onclick = ()=>{
  confirmModal.hidden = true;
  if(pendingContact){ toast(`Inquiry sent. Gracias, ${pendingContact.name}!`); contactForm.reset(); pendingContact = null; }
};

document.getElementById('hamburger').onclick = ()=> document.getElementById('navLinks').classList.toggle('open');
document.querySelectorAll('#navLinks a').forEach(a=>a.onclick=()=>document.getElementById('navLinks').classList.remove('open'));

// duplicate ticker for seamless loop
const track = document.getElementById('tickerTrack');
track.innerHTML += track.innerHTML;

renderMenu(); updateCart();
