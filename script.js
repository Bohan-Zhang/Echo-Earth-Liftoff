function rand(a){return a[Math.floor(Math.random()*a.length)];}
function pick(a,n){const c=[...a],o=[];for(let i=0;i<n&&c.length;i++){const x=Math.floor(Math.random()*c.length);o.push(c.splice(x,1)[0]);}return o;}

function generatePrep(job,activeMeals){
  return activeMeals.map(meal=>{
    const proteins=pick(ING.protein,job.pro>=8?3:2);
    const carbs=pick(ING.carbs,job.carb>=8?2:1);
    const fats=pick(ING.fats,job.fat>=7?2:1);
    const vitamins=pick(ING.vitamins,job.vit>=9?3:2);
    const flavour=pick(ING.flavour,2);
    const hydration=job.hyd>=8?pick(ING.hydration,1):[];
    return{meal,proteins,carbs,fats,vitamins,flavour,hydration,method:rand(METHODS)};
  });
}

let state={step:1,job:null,meals:{breakfast:true,lunch:true,dinner:true},mode:null,selections:{breakfast:null,lunch:null,dinner:null},prepPlan:null};

function renderJobs(filter=''){
  const f=filter.toLowerCase();
  document.getElementById('jobGrid').innerHTML=JOBS.filter(j=>j.name.toLowerCase().includes(f)).map(j=>`
    <div class="job-card ${state.job===j.name?'selected':''}" onclick="selectJob('${j.name.replace(/'/g,"\\'")}')">
      <div class="job-name">${j.name}</div>
      <div class="job-stats">
        <span class="stat-pill">CALORIES ${j.cal}</span>
        <span class="stat-pill">PROTEIN ${j.pro}</span>
        <span class="stat-pill">VITAMINS ${j.vit}</span>
      </div>
    </div>`).join('');
}
renderJobs();

function filterJobs(v){renderJobs(v);}
function selectJob(name){state.job=name;renderJobs(document.getElementById('jobSearch').value);document.getElementById('nextBtn1').disabled=false;}

function toggleMeal(meal){
  const on=state.meals[meal];
  if(on&&Object.values(state.meals).filter(Boolean).length<=1){document.getElementById('mealWarn').classList.add('visible');return;}
  document.getElementById('mealWarn').classList.remove('visible');
  state.meals[meal]=!on;
  const t=document.getElementById('tog-'+meal);
  t.classList.toggle('on',!on);
  t.querySelector('.toggle-check').textContent=!on?'✓':'';
}

function selectMode(mode){
  state.mode=mode;
  document.getElementById('mode-recipe').classList.toggle('selected',mode==='recipe');
  document.getElementById('mode-prep').classList.toggle('selected',mode==='prep');
  document.getElementById('nextBtn3').disabled=false;
}

function handleModeNext(){
  if(state.mode==='recipe'){goTo(4);}
  else{
    const job=JOBS.find(j=>j.name===state.job);
    const active=Object.entries(state.meals).filter(([,v])=>v).map(([k])=>k);
    state.prepPlan=generatePrep(job,active);
    renderResults(job,active,'prep');
    goTo(5,true);
  }
}

function goBack(){goTo(state.mode==='recipe'?4:3);}

function renderSec4(){
  const active=Object.entries(state.meals).filter(([,v])=>v).map(([k])=>k);
  state.selections={breakfast:null,lunch:null,dinner:null};
  const countries=[...new Set(RECIPES.map(r=>r.origin))].sort();
  let h=`<div class="country-filters"><button class="country-btn active" onclick="filterCountry(this,'all')">All</button>${countries.map(c=>`<button class="country-btn" onclick="filterCountry(this,'${c.replace(/'/g,"\\'")}' )">${c}</button>`).join('')}</div>`;
  active.forEach(meal=>{
    h+=`<div class="meal-slot-label">${meal.charAt(0).toUpperCase()+meal.slice(1)}</div><div class="recipe-grid" id="grid-${meal}">`;
    RECIPES.filter(r=>r.mealTypes.includes(meal)).forEach(r=>{
      h+=`<div class="recipe-card" id="rc-${meal}-${san(r.name)}" onclick="selRec('${meal}','${r.name.replace(/'/g,"\\'")}')">
        <span class="recipe-flag">${r.flag}</span>
        <div class="recipe-info"><div class="recipe-name">${r.name}</div><div class="recipe-origin">${r.origin}</div>
        <div class="recipe-adapt">${r.tags.slice(0,3).map(t=>`<span class="adapt-tag">${t}</span>`).join('')}</div></div>
      </div>`;
    });
    h+=`</div>`;
  });
  document.getElementById('sec4Content').innerHTML=h;
  checkDone();
}

function san(s){return s.replace(/[^a-zA-Z0-9]/g,'_');}

function selRec(meal,name){
  state.selections[meal]=name;
  const active=Object.entries(state.meals).filter(([,v])=>v).map(([k])=>k);
  active.forEach(m=>{RECIPES.filter(r=>r.mealTypes.includes(m)).forEach(r=>{const el=document.getElementById(`rc-${m}-${san(r.name)}`);if(el)el.classList.toggle('selected',state.selections[m]===r.name);});});
  checkDone();
}

function checkDone(){
  const active=Object.entries(state.meals).filter(([,v])=>v).map(([k])=>k);
  document.getElementById('nextBtn4').disabled=!active.every(m=>state.selections[m]!==null);
}

function filterCountry(btn,country){
  document.querySelectorAll('.country-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const active=Object.entries(state.meals).filter(([,v])=>v).map(([k])=>k);
  active.forEach(meal=>{
    const g=document.getElementById('grid-'+meal);if(!g)return;
    g.querySelectorAll('.recipe-card').forEach(card=>{
      const o=card.querySelector('.recipe-origin').textContent;
      card.style.display=(country==='all'||o===country||o.includes(country))?'':'none';
    });
  });
}

function buildRecipePlan(){
  const job=JOBS.find(j=>j.name===state.job);
  const active=Object.entries(state.meals).filter(([,v])=>v).map(([k])=>k);
  renderResults(job,active,'recipe');
  goTo(5,true);
}

function rerollPrep(){
  const job=JOBS.find(j=>j.name===state.job);
  const active=Object.entries(state.meals).filter(([,v])=>v).map(([k])=>k);
  state.prepPlan=generatePrep(job,active);
  renderResults(job,active,'prep');
}

function renderResults(job,activeMeals,mode){
  const macroRows=[['Protein','pro','fill-protein'],['Carbohydrates','carb','fill-carbs'],['Healthy Fats','fat','fill-fats'],['Vitamins & Minerals','vit','fill-vitamins'],['Hydration','hyd','fill-protein'],['Calories','cal','fill-carbs']];
  let meals='';

  if(mode==='recipe'){
    meals='<div class="meals-output">';
    activeMeals.forEach(meal=>{
      const r=RECIPES.find(x=>x.name===state.selections[meal]);if(!r)return;
      meals+=`<div class="meal-result">
        <div class="meal-result-header">
          <span class="meal-time-badge ${meal}">${meal}</span>
          <span class="meal-result-name">${r.flag} ${r.name}</span>
          <span style="margin-left:auto;font-size:11px;color:var(--text3)">${r.origin}</span>
        </div>
        <div class="meal-result-body">
          <div class="ingredient-list">${r.tags.map(t=>`<span class="ing-chip">${t}</span>`).join('')}</div>
          <div class="meal-why"><span>★ Why this works</span>${r.why}</div>
        </div>
      </div>`;
    });
    meals+='</div>';
  } else {
    meals='<div class="meals-output">';
    state.prepPlan.forEach(p=>{
      const allIng=[
        ...p.cal.map(i=>({name:i,role:'Calories'})),
        ...p.proteins.map(i=>({name:i,role:'Protein'})),
        ...p.vitamins.map(i=>({name:i,role:'Vitamins'})),
      ];
      meals+=`<div class="prep-result-card">
        <div class="prep-result-header">
          <span class="meal-time-badge ${p.meal}">${p.meal}</span>
          <span class="prep-auto-label">Auto-Generated</span>
          <span class="meal-result-name" style="margin-left:8px">Optimised Nutrition Prep</span>
        </div>
        <div class="prep-body">
          <div class="prep-section">
            <div class="prep-section-title">Ingredients</div>
            ${allIng.map(i=>`<div class="prep-ing-row"><div class="prep-ing-name">${i.name}</div><div class="prep-ing-role">${i.role}</div></div>`).join('')}
          </div>
          <div class="prep-instructions"><b>How to prepare:</b> ${p.method}</div>
          <div class="macro-strip">
            ${macroRows.slice(0,4).map(([label,key,cls])=>`
              <div class="macro-item">
                <div class="macro-item-label">${label}</div>
                <div class="macro-item-bar"><div class="macro-item-fill ${cls}" style="width:${job[key]*10}%"></div></div>
                <div class="macro-item-val">${job[key]}/10</div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
    });
    meals+='</div><button class="reroll-btn" onclick="rerollPrep()">↻ Regenerate ingredients</button>';
  }

  document.getElementById('resultContent').innerHTML=`
    <div class="result-hero">
      <div class="result-job">Shipboard Role</div>
      <div class="result-headline">${job.name}</div>
      <div class="result-sub">Nutrition demand: ${job.rating} · ${activeMeals.length} meal${activeMeals.length>1?'s':''} · ${mode==='recipe'?'Legacy Earth Recipes':'Auto-generated Meal Prep'}</div>
      <div class="nutrition-radar">
        ${macroRows.map(([label,key,cls])=>`
          <div class="radar-item">
            <div class="radar-label">${label}</div>
            <div class="radar-bar"><div class="radar-fill ${cls}" style="width:${job[key]*10}%"></div></div>
            <div class="radar-val">${job[key]}/10 demand</div>
          </div>`).join('')}
      </div>
    </div>
    ${meals}`;
}

function goTo(step,skipRender){
  if(step===4&&!skipRender)renderSec4();
  for(let i=1;i<=5;i++){
    document.getElementById('sec'+i).classList.toggle('visible',i===step);
    const s=document.getElementById('step'+i);
    s.classList.toggle('active',i===step);
    s.classList.toggle('done',i<step);
  }
  state.step=step;
  window.scrollTo({top:0,behavior:'smooth'});
}