const E=require('./engine.js');
function heroTurn(s,skill){
  let guard=0;
  while(!s.over&&guard++<300){
    if(s.event){const o=s.event.e.o;let i=0;
      // prefer option that lowers fear/raises memory if affordable
      const sc=o.map(x=>(/страх[^+]*−|Память \+|любовь/.test(x.d)?2:0)-(/голод Тьмы \+|Страх.*\+/.test(x.d)?1:0));
      i=sc[1]>sc[0]?1:0; if(!E.choose(s,i).ok)E.choose(s,1-i); continue;}
    if(s.ap<=0){return;}
    const R=s.regions;const byFear=[...R].sort((a,b)=>b.fear-a.fear);const top=byFear[0];
    const tryA=(id,r)=>E.act(s,id,r==null?null:r.id).ok;
    if(Math.random()>skill){ // random action
      const r=R[Math.floor(Math.random()*R.length)];const as=E.actionsFor(s,r).filter(a=>!a.why);
      if(as.length){const a=as[Math.floor(Math.random()*as.length)];E.act(s,a.id,a.global?null:r.id);continue;}
      return;}
    if(s.civ.k==='human'){
      if(s.sats>0&&tryA('strike',R[4]))continue;
      if(s.one<3&&R[1].love>=R[1].fear&&tryA('talk',R[1]))continue;
      if(s.one<3&&R[1].love<R[1].fear&&tryA('comfort',R[1]))continue;
    }
    if(s.freeMove>0){const at=s.regions[s.heroAt];const want=s.civ.k==='human'&&s.hero==='gromov'&&!s.heroUsed?4:byFear[0].id;
      const step=want===s.heroAt?null:(at.nb.includes(want)?want:at.nb.slice().sort((a,b)=>s.regions[b].fear-s.regions[a].fear)[0]);
      if(step!=null&&s.regions[step].fear>at.fear-5||step===4&&want===4){if(E.moveHero(s,step).ok)continue;}}
    if(tryA('hero',s.regions[s.heroAt]))continue;
    if(top.fear>70&&s.corrections>0&&tryA('correct',top))continue;
    if(s.souls>=20&&tryA('free'))continue;
    if(top.fear>55&&tryA('comfort',top))continue;
    if(s.civ.k==='pride'&&tryA('defy'))continue;
    const noT=R.filter(r=>!r.b.temple).sort((a,b)=>b.nb.length-a.nb.length)[0];
    if(noT&&s.epoch<s.maxEpoch-3&&tryA('temple',noT))continue;
    if(s.laws.includes(2)){const m=byFear.find(r=>!r.b.mirror&&r.fear>50);if(m&&tryA('mirror',m))continue;}
    if(s.laws.includes(1)&&s.light<3&&top.fear>40&&s.hunger<60&&tryA('gipnos',top))continue;
    if(R.filter(r=>r.b.lab).length<1&&tryA('lab',R.find(r=>!r.b.lab&&Object.keys(r.b).length<2)||R[0]))continue;
    if(s.laws.includes(3)&&E.avgLove(s)>E.avgFear(s)){const c=R.find(r=>!r.b.core&&Object.keys(r.b).length<2);if(c&&tryA('core',c))continue;}
    const low=[...R].sort((a,b)=>a.love-b.love)[0];
    if(tryA('dream',low))continue;
    if(tryA('comfort',top))continue;
    return;
  }
}

function bot(s,skill){let g=0;while(!s.over&&g++<80){for(const id of Object.keys(s.team)){if(s.over)break;E.teamIn(s,id);heroTurn(s,skill);E.teamOut(s,id);}
  while(s.event&&!s.over){const o=s.event.e.o;if(!E.choose(s,0).ok)E.choose(s,1);}
  if(!s.over)E.endEpoch(s);}return s;}
const N=+process.argv[2]||200;const GM=+process.env.GM||1.35;
for(const skill of [0.95,0.6]){let line=`skill ${skill}: `;
  for(let L=1;L<=17;L++){let w=0;for(let i=0;i<N;i++){const s=E.newTeamGame(L,L-1,i*7919+L,E.TEAMS[process.env.TEAM||'a'].ids);s.goal=Math.round(s.goal/(process.env.TEAM==="b"?1.35:1.2)*GM);if(bot(s,skill).over.win)w++;}line+=`${L}:${Math.round(w/N*100)}% `;}
  console.log(line);}
