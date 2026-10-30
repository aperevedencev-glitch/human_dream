/* ---------- 3D: особняк под Сосновкой (Three.js r128, загружается по требованию) ----------
   Один дом, три уровня в одной сцене: подвал (y = −H), первый этаж (0), второй этаж (H).
   Между ними — широкая дубовая лестница (прямой марш) и узкая винтовая лестница в подвал.
   Тексты находок сверены с рукописью «Сны человеческие» (пролог, главы 1–5). */
const MANSION=(()=>{
const THREE_URL='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const C=2.6, H=3.2, PR=.33, EYE=1.62, STEP=.5;
const ORDER=['b','f1','f2'], LEV={b:-H,f1:0,f2:H};
/* '#' стена · буквы — комнаты · '.' дверной проём · 'e' входная дверь
   'T' марш дубовой лестницы (1 этаж) · 'O' проём над ним (2 этаж) · 'S' винтовая лестница */
const FL={
 f1:{name:'Первый этаж',base:.45,amb:.3,floor:'wood',wall:'paper',
  grid:['#############',
        '#bbbbb#ggggg#',
        '#bbbbb#ggggg#',
        '#bbbbb.ggggg#',
        '#bbbbb#ggggg#',
        '###.#######.#',
        '#hhhhhTTTT#h#',
        'ehhhhhhhhhhS#',
        '###.#####.###',
        '#kkkkk#ddddd#',
        '#kkkkk.ddddd#',
        '#kkkkk#ddddd#',
        '#############'],
  rooms:{b:'Библиотека · лаборатория Алексея',g:'Гостиная с камином',h:'Холл',k:'Кухня',d:'Столовая',T:'Дубовая лестница',S:'Винтовая лестница в подвал'},
  tint:{b:0x8a6a4a,g:0x9a6a48,h:0x8c7458,k:0x8f8270,d:0x92684c}},
 f2:{name:'Второй этаж',base:.7,amb:.24,floor:'wood',wall:'paper',
  grid:['#############',
        '#rrrrr#ooooo#',
        '#rrrrr#ooooo#',
        '#rrrrr#ooooo#',
        '#rrrrr#ooooo#',
        '#rrrrr####.##',
        '###.##OOOOhh#',
        '#hhhhhhhhhhh#',
        '###.#########',
        '#ggggg#######',
        '#ggggg#######',
        '#ggggg#######',
        '#############'],
  rooms:{r:'Круглая спальня',o:'Кабинет профессора',h:'Коридор второго этажа',g:'Гостевая комната'},
  tint:{r:0x6f7a90,o:0x8a6a4a,h:0x7a6a5a,g:0x857262}},
 b:{name:'Подвал',base:1.15,amb:.2,floor:'stone',wall:'brick',
  grid:['#############',
        '#sssss#wwwww#',
        '#sssss#wwwww#',
        '#sssss#wwwww#',
        '#sssss#wwwww#',
        '###.#####.###',
        '#hhhhhhhhhhh#',
        '#hhhhhhhhhhS#',
        '#############'],
  rooms:{s:'Серверная «Гипноса»',w:'Бывший винный погреб',h:'Коридор подвала',S:'Винтовая лестница'},
  tint:{s:0x6a7380,w:0x7a6a5a,h:0x707070}}
};
const STAIR={x0:6*C,x1:10*C,z0:6*C,z1:7*C};            /* прямой марш: высота растёт с x от 0 до H */
const SPI={i:11,j:7,cx:11.5*C,cz:7.5*C,R:C/2,r:.14+PR}; /* винтовая: один оборот от 0 (1 этаж) до −H (подвал) */
const BED={cx:3.5*C,cz:3.5*C,R:2.5*C};
const ITEMS=[
 {id:'laptop',f:'f1',p:[8.8,2.3],y:.52,kind:'art',shape:'laptop',art:'malyshev',t:'Папка «Сны»',
  d:'Скрытая папка в серверных файлах, пароль — в текстовом файле с пометкой «на случай смерти». Аудиодневник Алексея, по дням:<br>«День первый. Снилась какая-то ерунда. Я был в лабиринте, за мной кто-то гнался».<br>«День тридцать первый. Сегодня я увидел профессора. Он стоял в спальне, у зеркал, и смотрел на меня».<br>«День сто тридцать третий. Я понял. Понял, как это работает». Последняя запись: «И знаете, что самое страшное? Я до сих пор её люблю».'},
 {id:'journal',f:'f1',p:[4.4,4.3],y:.86,kind:'art',shape:'book',art:'anchors',t:'Лабораторный журнал',
  d:'«Якоря страха» — микроскопические дозы психоактивных веществ, которые подавались через систему климат-контроля в определённые фазы сна. Алексей синтезировал их здесь, в дальней комнате особняка. Каждую неделю он добавлял по несколько микрограммов и записывал результаты. График выработки энергии рос. График его собственного состояния — падал.'},
 {id:'vera',f:'f1',p:[9.0,10.5],y:.8,kind:'art',shape:'laptop',art:'vera',t:'Ноутбук Веры',
  d:'«День сто двадцать третий. Я нашёл в её ноутбуке переписку. Она ведёт проект параллельно со мной. Собирает данные, анализирует результаты. Имена в почте мне незнакомы — какие-то корпоративные адреса. Я не стал поднимать тему. Боюсь услышать ответ. Я всё ещё люблю её».'},
 {id:'amulet',f:'f2',p:[2.25,3.05],y:.64,kind:'art',shape:'glasses',art:'amulet',t:'Очки «Амулет»',
  d:'На тумбочке у кровати. Линзы мутные, будто выгоревшие изнутри — не разбитые, не поцарапанные, а именно выгоревшие. На дужке — стилизованная буква «А» в круге. Камеры на оправе сканировали пространство и подменяли пугающее безобидным: тень — пальмой в горшке, силуэт в окне — котёнком. В журнале ошибок: «Объект не идентифицирован».'},
 {id:'pillow',f:'f2',p:[3.5,2.75],y:.7,kind:'art',shape:'pillow',art:'gipnos',t:'Подушка «Гипноса»',
  d:'Система «Гипнос» считывала паттерны мозговых волн спящего через вшитые в подушку датчики, усиливала их, пропускала через каскад квантовых процессоров и преобразовывала в электричество. Чем страшнее был кошмар, тем больше энергии вырабатывалось. Дом, по сути, питался ужасом своего хозяина.'},
 {id:'notebooks',f:'f2',p:[9.5,1.75],y:.86,kind:'art',shape:'books',art:'svetlov',t:'Тетради профессора',
  d:'Толстые тетради в кожаных переплётах, исписанные убористым, почти неразборчивым почерком. Формулы, графики, схемы, ссылки на «темпоральные потоки» и «психоэнергетические поля». Профессор верил, что пять вогнутых панелей способны улавливать «энергию времени». Алексей пролистал несколько страниц, усмехнулся и отложил их в сторону.'},
 {id:'deed',f:'f2',p:[2.5,10.5],y:.8,kind:'art',shape:'paper',art:'mansion',t:'Бумаги на дом',
  d:'Дом построил в начале прошлого века купец, разбогатевший на поставках леса: три этажа, два крыла, башенка со шпилем, камин в каждой комнате. После революции — санаторий для партийных работников, потом детский дом, потом закрытый НИИ. В девяностые его купил профессор на гранты для изучения «хрональных аномалий». Алексею дом достался за треть цены. «— Суицид? — переспросил он риелтора. — Отлично. Значит, соседи будут обходить стороной».'},
 {id:'server',f:'b',p:[2.5,2.6],y:1.0,kind:'act',shape:'console',art:'gipnos',t:'Серверная «Гипноса»',act:'Обесточить оборудование',
  d:'Ряды серверных стоек мягко гудят в полутьме: кастомные шасси, самодельные платы, жгуты проводов в кабель-каналах. На мониторе: «Проект Гипнос. Статус: завершён. Итоговая выработка энергии: 847 МВт·ч». Каждую ночь, примерно с двух до трёх, — пиковые значения. В последнюю ночь график взлетел и оборвался. Вы опускаете рубильник. Гул стихает.'},
 {id:'climate',f:'b',p:[9.5,2.2],y:1.0,kind:'act',shape:'tank',art:'anchors',t:'Блок климат-контроля',act:'Перекрыть подачу',
  d:'Отсюда «якоря страха» уходили в вентиляцию спальни. В воздухе — сладковатый запах, похожий на жасмин, но с химическим, искусственным оттенком: так пахло в гостиной в ту ночь, когда дом пытался усыпить следователя. Вы закручиваете вентиль.'}
];
const LIGHTS={f1:[{p:[11.25,2.5],y:.6,c:0xff8a3a,i:1.6,d:7,calm:1,flick:1},{p:[3.5,7],y:2.85,c:0xffd9a0,i:.8,d:8,calm:1},{p:[9.5,10.5],y:1.1,c:0xffb060,i:.8,d:5,calm:1,flick:1}],
 f2:[{p:[9.8,1.5],y:1.3,c:0xffd090,i:.8,d:6,calm:1},{p:[3.5,7.5],y:2.85,c:0xffd9a0,i:.55,d:7,calm:1},{p:[3.5,3.5],y:2.9,c:0x7fa6ff,i:.8,d:9}],
 b:[{p:[6.5,6.8],y:2.75,c:0xfff0c0,i:.7,d:8,flick:2},{p:[2.5,1.6],y:1.6,c:0x4aa8ff,i:.9,d:6}]};
const WHISPERS=['— Не лги себе.','— Галлюцинация. Всего лишь…','— Ты знаешь.','— Мы — дети зеркал.','— Ты дал нам пищу.','— Теперь ты один из нас.','Объект не идентифицирован','— Ваши сновидения очень важны для нас.'];
const GHOST_AT={f1:[[9.5,1.3],[7,6.8]],f2:[[3.5,4.9],[10.6,6.5],[2,2]],b:[[3.2,3.6],[9,6.5]]};
const ARTN=ITEMS.filter(i=>i.kind==='art').length, ACTN=ITEMS.filter(i=>i.kind==='act').length;

let T=null,ren,scene,cam,flash,root,ui=null,st=null,raf=0,last=0,running=false,loading=false,TEX=null,cubeRT=null,ghost=null,mm=null;
const keys={},solids={b:[],f1:[],f2:[]},anim={fire:[],lights:[],items:[],mirrors:[]};let joy=null,look=null;
function save(){try{localStorage.setItem('sny-17-v1',JSON.stringify(prog));}catch(e){}}
function M(){if(!prog.mansion)prog.mansion={found:[],done:false};return prog.mansion;}
function cell(f,i,j){const g=FL[f].grid;if(j<0||j>=g.length||i<0||i>=g[0].length)return '#';return g[j][i];}
const isWall=ch=>ch==='#'||ch==='e';
const isFloor=ch=>!isWall(ch)&&ch!=='T'&&ch!=='O'&&ch!=='S';
function lvlOf(y){return y<-H/2?'b':y<H/2?'f1':'f2';}
function roomAt(f,x,z){const i=Math.floor(x/C),j=Math.floor(z/C);let ch=cell(f,i,j);
  if(ch==='.'||ch==='O'){for(const [a,b] of [[0,-1],[0,1],[-1,0],[1,0]]){const n=cell(f,i+a,j+b);if(FL[f].rooms[n]&&n!=='T'){ch=n;break;}}}
  return FL[f].rooms[ch]||'';}

/* ---------- textures ---------- */
function tex(kind){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const rnd=(a,b)=>a+Math.random()*(b-a);
  if(kind==='wood'){for(let y=0;y<256;y+=32){g.fillStyle=`hsl(25,${rnd(30,40)}%,${rnd(22,30)}%)`;g.fillRect(0,y,256,32);for(let k=0;k<30;k++){g.strokeStyle=`rgba(0,0,0,${rnd(.05,.15)})`;g.beginPath();const yy=y+rnd(2,30);g.moveTo(0,yy);g.bezierCurveTo(80,yy+rnd(-3,3),170,yy+rnd(-3,3),256,yy);g.stroke();}g.fillStyle='rgba(0,0,0,.45)';g.fillRect(0,y,256,2);g.fillRect(rnd(40,220),y,2,32);}}
  else if(kind==='oak'){g.fillStyle='#4a2e18';g.fillRect(0,0,256,256);for(let k=0;k<60;k++){g.strokeStyle=`rgba(${rnd(10,40)},${rnd(5,20)},0,${rnd(.15,.35)})`;g.lineWidth=rnd(1,3);g.beginPath();const y=rnd(0,256);g.moveTo(0,y);g.bezierCurveTo(90,y+rnd(-6,6),170,y+rnd(-6,6),256,y+rnd(-3,3));g.stroke();}}
  else if(kind==='paper'){g.fillStyle='#3a4a3c';g.fillRect(0,0,256,256);for(let x=0;x<256;x+=32){g.fillStyle='rgba(255,240,200,.06)';g.fillRect(x,0,10,256);}
    g.strokeStyle='rgba(230,200,140,.18)';g.lineWidth=2;for(let y=16;y<256;y+=64)for(let x=16;x<256;x+=64){g.beginPath();g.ellipse(x,y,10,18,0,0,Math.PI*2);g.stroke();g.beginPath();g.moveTo(x,y-26);g.lineTo(x,y+26);g.stroke();}
    g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,226,256,30);g.fillStyle='rgba(120,80,50,.8)';g.fillRect(0,222,256,6);}
  else if(kind==='stone'){g.fillStyle='#3d3d3f';g.fillRect(0,0,256,256);for(let k=0;k<1800;k++){const v=rnd(40,90);g.fillStyle=`rgba(${v},${v},${v+4},.25)`;g.fillRect(rnd(0,256),rnd(0,256),rnd(1,4),rnd(1,4));}g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=3;for(let y=0;y<=256;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();}for(let x=0;x<=256;x+=64){g.beginPath();g.moveTo(x,0);g.lineTo(x,256);g.stroke();}}
  else if(kind==='brick'){g.fillStyle='#2a2422';g.fillRect(0,0,256,256);for(let r=0;r<8;r++)for(let k=-1;k<5;k++){const x=k*64+(r%2?32:0);g.fillStyle=`hsl(10,${rnd(25,40)}%,${rnd(20,30)}%)`;g.fillRect(x+2,r*32+2,60,28);}}
  else if(kind==='ceil'){g.fillStyle='#bdb4a4';g.fillRect(0,0,256,256);for(let k=0;k<900;k++){g.fillStyle=`rgba(0,0,0,${rnd(.02,.06)})`;g.fillRect(rnd(0,256),rnd(0,256),rnd(2,8),rnd(2,8));}}
  else if(kind==='mosaic'){g.fillStyle='#05070c';g.fillRect(0,0,256,256);for(let y=0;y<256;y+=16)for(let x=0;x<256;x+=16){const h=rnd(205,235),l=rnd(6,20);g.fillStyle=`hsl(${h},${rnd(20,50)}%,${l}%)`;g.fillRect(x+1,y+1,14,14);if(Math.random()<.08){g.fillStyle='rgba(160,190,255,.35)';g.fillRect(x+3,y+3,5,5);}}}
  else if(kind==='glow'){const gr=g.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'rgba(255,230,160,1)');gr.addColorStop(.25,'rgba(255,200,110,.55)');gr.addColorStop(1,'rgba(255,180,80,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);}
  else if(kind==='screen'){g.fillStyle='#04101c';g.fillRect(0,0,256,256);g.fillStyle='#5ab0ff';g.font='bold 15px sans-serif';g.fillText('Проект Гипнос',14,40);g.font='13px sans-serif';g.fillText('Статус: завершён',14,64);g.fillText('Итоговая выработка',14,88);g.fillText('энергии: 847 МВт·ч',14,108);
    g.strokeStyle='#ff5a5a';g.lineWidth=2;g.beginPath();g.moveTo(14,220);for(let x=0;x<200;x+=8)g.lineTo(14+x,220-Math.pow(x/200,3)*90-Math.random()*6);g.lineTo(220,236);g.stroke();}
  else if(kind==='lapscreen'){g.fillStyle='#0a1220';g.fillRect(0,0,256,256);g.fillStyle='#a8c4ff';g.font='16px sans-serif';g.fillText('📁 Сны',20,40);g.font='12px sans-serif';for(let k=0;k<9;k++){g.fillStyle='rgba(168,196,255,.6)';g.fillText(`день_${[1,7,23,31,35,117,123,131,133][k]}.wav`,30,70+k*18);}}
  else if(kind==='ghost'){g.clearRect(0,0,256,256);const gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'rgba(200,220,255,.75)');gr.addColorStop(1,'rgba(200,220,255,0)');g.fillStyle=gr;
    g.beginPath();g.ellipse(128,46,22,28,0,0,Math.PI*2);g.fill();g.beginPath();g.moveTo(92,90);g.quadraticCurveTo(128,70,164,90);g.lineTo(180,256);g.lineTo(76,256);g.closePath();g.fill();
    g.strokeStyle='rgba(120,30,40,.7)';g.lineWidth=3;g.beginPath();g.moveTo(112,72);g.quadraticCurveTo(128,82,144,72);g.stroke();g.fillStyle='rgba(10,15,30,.85)';g.fillRect(114,40,8,5);g.fillRect(134,40,8,5);}
  const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.encoding=T.sRGBEncoding;t.anisotropy=4;return t;}

/* ---------- shell geometry for one level ---------- */
function shell(f){const F=FL[f],g=F.grid,base=LEV[f],up=f==='b'?'f1':f==='f1'?'f2':null;
  const P={floor:[],wall:[],ceil:[]};const col=new T.Color();
  const push=(arr,pts,n,uvs,cc)=>{let [a,b,c,d]=pts;const e1=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],e2=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];
    const cr=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];let U=uvs;
    if(cr[0]*n[0]+cr[1]*n[1]+cr[2]*n[2]<0){[b,d]=[d,b];U=[uvs[0],uvs[3],uvs[2],uvs[1]];}
    for(const k of [0,1,2,0,2,3])arr.push([a,b,c,d][k],n,U[k],cc);};
  for(let j=0;j<g.length;j++)for(let i=0;i<g[0].length;i++){const ch=g[j][i];if(isWall(ch))continue;
    let rc=ch;if(!F.tint[rc]){for(const [a,b] of [[0,-1],[0,1],[-1,0],[1,0]]){const n=cell(f,i+a,j+b);if(F.tint[n]){rc=n;break;}}}
    col.setHex(F.tint[rc]||0x888888);const cc=[col.r,col.g,col.b];
    const x0=i*C,x1=x0+C,z0=j*C,z1=z0+C,y0=base,y1=base+H;
    if(isFloor(ch)||(ch==='S'&&f==='b'))push(P.floor,[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],[0,1,0],[[x0/2,z0/2],[x1/2,z0/2],[x1/2,z1/2],[x0/2,z1/2]],cc);
    const above=up?cell(up,i,j):'#';const inBed=f==='f2'&&ch==='r';
    if(!inBed&&above!=='O'&&above!=='S')push(P.ceil,[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],[0,-1,0],[[x0/3,z0/3],[x1/3,z0/3],[x1/3,z1/3],[x0/3,z1/3]],[1,1,1]);
    const w=[1,1,1],q=v=>v/2.6;
    if(isWall(cell(f,i-1,j)))push(P.wall,[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]],[1,0,0],[[q(z0),q(y0)],[q(z1),q(y0)],[q(z1),q(y1)],[q(z0),q(y1)]],w);
    if(isWall(cell(f,i+1,j)))push(P.wall,[[x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0]],[-1,0,0],[[q(z0),q(y0)],[q(z1),q(y0)],[q(z1),q(y1)],[q(z0),q(y1)]],w);
    if(isWall(cell(f,i,j-1)))push(P.wall,[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]],[0,0,1],[[q(x0),q(y0)],[q(x1),q(y0)],[q(x1),q(y1)],[q(x0),q(y1)]],w);
    if(isWall(cell(f,i,j+1)))push(P.wall,[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],[0,0,-1],[[q(x0),q(y0)],[q(x1),q(y0)],[q(x1),q(y1)],[q(x0),q(y1)]],w);
  }
  const mk=arr=>{const pos=[],nor=[],uv=[],cl=[];for(let k=0;k<arr.length;k+=4){pos.push(...arr[k]);nor.push(...arr[k+1]);uv.push(...arr[k+2]);cl.push(...arr[k+3]);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new T.Float32BufferAttribute(nor,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setAttribute('color',new T.Float32BufferAttribute(cl,3));return geo;};
  return {floor:mk(P.floor),wall:mk(P.wall),ceil:mk(P.ceil)};}

const matCache={};
function mat(hex,o){const k=hex+JSON.stringify(o||{});if(!matCache[k])matCache[k]=new T.MeshStandardMaterial(Object.assign({color:hex,roughness:.8,metalness:.05},o||{}));return matCache[k];}
/* box in cell units at level f; y0 relative to that level's floor */
function box(grp,f,cx,cz,w,d,h,hex,o,y0){const m=new T.Mesh(new T.BoxGeometry(w*C,h,d*C),hex&&hex.isMaterial?hex:mat(hex,o));m.position.set(cx*C,LEV[f]+(y0||0)+h/2,cz*C);grp.add(m);return m;}
function solid(f,cx,cz,w,d){solids[f].push([(cx-w/2)*C,(cz-d/2)*C,(cx+w/2)*C,(cz+d/2)*C]);}
function sbox(grp,f,cx,cz,w,d,h,hex,o,y0){solid(f,cx,cz,w,d);return box(grp,f,cx,cz,w,d,h,hex,o,y0);}

/* ---------- the house ---------- */
function buildHouse(){root=new T.Group();scene.add(root);
  for(const f of ORDER){const F=FL[f],sh=shell(f);
    root.add(new T.Mesh(sh.floor,new T.MeshStandardMaterial({map:TEX[F.floor],vertexColors:true,roughness:.85})));
    root.add(new T.Mesh(sh.wall,new T.MeshStandardMaterial({map:TEX[F.wall],roughness:.9,color:f==='b'?0xb0a8a0:0xffffff})));
    root.add(new T.Mesh(sh.ceil,new T.MeshStandardMaterial({map:TEX.ceil,roughness:1,color:f==='b'?0x6a6660:0x9a9284})));
    F.lights=[];for(const L of LIGHTS[f]){const l=new T.PointLight(L.c,L.i,L.d,1.6);l.position.set(L.p[0]*C,LEV[f]+L.y,L.p[1]*C);root.add(l);F.lights.push({l,L});anim.lights.push({l,L,f});
      if(L.calm||L.flick){const b=new T.Mesh(new T.SphereGeometry(.09,10,8),new T.MeshBasicMaterial({color:L.c}));b.position.copy(l.position);root.add(b);}}}
  root.add(new T.AmbientLight(0x5a6478,.26));root.add(new T.HemisphereLight(0x6070a0,0x201810,.16));
  buildStairs();furnish();buildItems();}

function buildStairs(){const oak=new T.MeshStandardMaterial({map:TEX.oak,roughness:.7}),dark=mat(0x2a1a10);
  /* широкая дубовая лестница: 16 ступеней от холла к площадке второго этажа */
  const n=16,run=(STAIR.x1-STAIR.x0)/n;
  for(let k=0;k<n;k++){const top=(k+1)*H/n;const m=new T.Mesh(new T.BoxGeometry(run+.02,top,C*.98),oak);m.position.set(STAIR.x0+(k+.5)*run,top/2,(STAIR.z0+STAIR.z1)/2);root.add(m);}
  const rail=(x0,y0,x1,y1,z)=>{const len=Math.hypot(x1-x0,y1-y0);const r=new T.Mesh(new T.BoxGeometry(len,.07,.07),dark);r.position.set((x0+x1)/2,(y0+y1)/2,z);r.rotation.z=Math.atan2(y1-y0,x1-x0);root.add(r);};
  const zr=STAIR.z1-.06;rail(STAIR.x0,1,STAIR.x1,H+1,zr);
  for(let k=0;k<=n;k+=2){const x=STAIR.x0+k*run,yb=k*H/n;const p=new T.Mesh(new T.BoxGeometry(.05,1,.05),dark);p.position.set(x,yb+.5,zr);root.add(p);}
  /* балюстрада второго этажа вокруг проёма */
  rail(STAIR.x0,H+1,STAIR.x1-.4,H+1,STAIR.z1+.04);for(let x=STAIR.x0;x<STAIR.x1-.3;x+=.5){const p=new T.Mesh(new T.BoxGeometry(.05,1,.05),dark);p.position.set(x,H+.5,STAIR.z1+.04);root.add(p);}
  solid('f2',(STAIR.x0+STAIR.x1-.4)/2/C,STAIR.z1/C+.015,(STAIR.x1-.4-STAIR.x0)/C,.03);
  /* узкая винтовая лестница в подвал: один оборот вниз от запада */
  const steps=18,dA=Math.PI*2/steps,len=SPI.R-.14;const pole=new T.Mesh(new T.CylinderGeometry(.12,.12,2*H,10),mat(0x3a3a3e,{metalness:.6,roughness:.4}));pole.position.set(SPI.cx,0,SPI.cz);root.add(pole);
  const stMat=mat(0x5a5048,{metalness:.5,roughness:.5});
  for(let k=0;k<steps;k++){const a=Math.PI+(k+.5)*dA,top=-(k+.5)/steps*H;const s=new T.Mesh(new T.BoxGeometry(len,.06,.42),stMat);
    s.position.set(SPI.cx+Math.cos(a)*(.14+len/2),top-.03,SPI.cz+Math.sin(a)*(.14+len/2));s.rotation.y=-a;root.add(s);}
  const hr=new T.Mesh(new T.TorusGeometry(SPI.R-.05,.025,6,40),dark);hr.rotation.x=Math.PI/2;hr.position.set(SPI.cx,1,SPI.cz);root.add(hr);
  for(const f of ['f1','b']){solid(f,11.5,7.015,1,.03);rail(11*C,LEV[f]+1,12*C,LEV[f]+1,7*C+.03);}
  /* светящиеся стрелки у входа на лестницы */
  const arrow=()=>{const sh=new T.Shape();sh.moveTo(0,.32);sh.lineTo(.26,0);sh.lineTo(.1,0);sh.lineTo(.1,-.3);sh.lineTo(-.1,-.3);sh.lineTo(-.1,0);sh.lineTo(-.26,0);sh.closePath();
    const m=new T.Mesh(new T.ShapeGeometry(sh),new T.MeshBasicMaterial({color:0xe8c27a,transparent:true,opacity:.55,depthWrite:false}));m.rotation.x=-Math.PI/2;return m;};
  for(const [x,z,y,rot] of [[10.6*C,SPI.cz,.012,-Math.PI/2],[10.6*C,SPI.cz,-H+.012,-Math.PI/2],[5.4*C,6.5*C,.012,-Math.PI/2]]){const a=arrow();a.position.set(x,y,z);a.rotation.z=rot;root.add(a);anim.arrows=(anim.arrows||[]).concat(a);}
  /* аварийные лампы шахты */
  const em=new T.Mesh(new T.BoxGeometry(.18,.08,.08),new T.MeshBasicMaterial({color:0xff6040}));em.position.set(12*C-.06,-H/2+.6,SPI.cz);root.add(em);}

function furnish(){const R=root;
  /* 1 этаж — библиотека и лаборатория */
  sbox(R,'f1',1.18,3,.32,3.9,2.5,0x4a2e1a);for(let k=0;k<5;k++)box(R,'f1',1.2,3,.28,3.7,.05,0x2a1a10,{},.45+k*.45);
  for(let k=0;k<26;k++){const z=1.2+Math.random()*3.6,y=.5+Math.floor(Math.random()*5)*.45;box(R,'f1',1.3,z,.12,.05+Math.random()*.06,.32,[0x7a2a20,0x2a4a6a,0x5a5a2a,0x6a4a7a][k%4],{},y);}
  sbox(R,'f1',3,2.5,1.5,.8,.82,0x3b2616);for(let k=0;k<4;k++)box(R,'f1',2.6+k*.25,2.4,.05,.05,.18,0x8ad0c0,{emissive:0x1a5a50,emissiveIntensity:.6,transparent:true,opacity:.8},.82);
  sbox(R,'f1',4.4,4.3,1,.6,.82,0x3b2616);
  /* гостиная: камин, диван, журнальный столик, старинное зеркало, абстрактные картины */
  sbox(R,'f1',11.8,2.5,.4,1.7,1.3,0x2b2724,{roughness:1});box(R,'f1',11.52,2.5,.2,1.9,.12,0x3a3430,{},1.3);box(R,'f1',11.52,1.85,.2,.25,1.3,0x2b2724);box(R,'f1',11.52,3.15,.2,.25,1.3,0x2b2724);solid('f1',11.55,2.5,.3,1.9);
  anim.fire.push(box(R,'f1',11.5,2.5,.14,.9,.5,0xff7a2a,{emissive:0xff5a10,emissiveIntensity:1.6},.05));
  sbox(R,'f1',9,3.6,2,.8,.75,0x5a1f22);box(R,'f1',9,4,2,.2,1.1,0x4a1a1c);sbox(R,'f1',8.8,2.3,1,.6,.45,0x3b2616);
  const om=new T.Mesh(new T.PlaneGeometry(.9,1.4),new T.MeshStandardMaterial({color:0x9fb0c0,metalness:.9,roughness:.15}));om.position.set(9.5*C,1.6,1*C+.03);R.add(om);box(R,'f1',9.5,1.02,.4,.02,1.55,0x6a5226,{metalness:.5},.85);
  for(const [x,c] of [[7.6,0x6a2a3a],[10.6,0x2a3a6a]]){const p=new T.Mesh(new T.PlaneGeometry(1.1,.8),new T.MeshBasicMaterial({color:c}));p.position.set(x*C,1.8,5*C-.03);p.rotation.y=Math.PI;R.add(p);}
  /* холл: вешалка, люстра */
  box(R,'f1',1.1,7.5,.12,.9,2.4,0x3a2414);
  const ch=new T.Mesh(new T.TorusGeometry(.5,.04,6,20),mat(0xb08a3a,{metalness:.7,roughness:.3}));ch.rotation.x=Math.PI/2;ch.position.set(3.5*C,2.75,7*C);R.add(ch);
  /* кухня, столовая */
  sbox(R,'f1',3,9.3,4.6,.55,.92,0x6a5a48);box(R,'f1',3,9.3,4.6,.56,.04,0xd8d0c0,{},.92);sbox(R,'f1',2.5,10.5,1.2,.8,.78,0x5a3b25);
  sbox(R,'f1',9.5,10.5,3,1,.78,0x4a2a18);for(let k=0;k<4;k++){box(R,'f1',8.4+k*.75,9.85,.25,.25,.95,0x3a2010);box(R,'f1',8.4+k*.75,11.15,.25,.25,.95,0x3a2010);}
  box(R,'f1',9.9,10.5,.04,.04,.25,0xf0e8d0,{emissive:0xffb060,emissiveIntensity:1},.78);
  /* дубовая входная дверь */
  const door=box(R,'f1',1,7.5,.08,.85,2.4,0x3a2212);door.position.x=C+.05;FL.f1.door={x:1.3*C,z:7.5*C};
  /* 2 этаж — круглая спальня под куполом с мозаикой из тёмного стекла */
  const cx=BED.cx,cz=BED.cz,Rb=BED.R,y2=LEV.f2;
  const cyl=new T.Mesh(new T.CylinderGeometry(Rb,Rb,H,56,1,true,.24,Math.PI*2-.48),new T.MeshStandardMaterial({map:TEX.paper2,side:T.DoubleSide,roughness:.9,color:0xc8d0e0}));cyl.position.set(cx,y2+H/2,cz);R.add(cyl);
  const dome=new T.Mesh(new T.SphereGeometry(Rb,40,14,0,Math.PI*2,0,Math.PI/2),new T.MeshStandardMaterial({map:TEX.mosaic,side:T.BackSide,roughness:.25,metalness:.4,color:0x8090b0}));dome.position.set(cx,y2+H,cz);R.add(dome);
  sbox(R,'f2',3.5,3.5,.7,.85,.55,0x4a3048);box(R,'f2',3.5,3.5-.42,.74,.06,1.15,0x2a1a18);box(R,'f2',3.5,3.6,.66,.6,.08,0x8a7a9a,{},.55);
  sbox(R,'f2',2.25,3.05,.18,.18,.6,0x3b2616);
  /* пять вогнутых алюминиевых панелей — незамкнутая спираль вокруг кровати */
  const mm=new T.MeshStandardMaterial({color:0xd8e2ec,metalness:.85,roughness:.18,emissive:0x1a2636,emissiveIntensity:.9,side:T.DoubleSide});anim.mirrorMat=mm;
  for(let k=0;k<5;k++){const a=-2.2+k*1.18,r=1.55+k*.24;const px=cx+Math.cos(a)*r,pz=cz+Math.sin(a)*r;const g2=new T.Group();g2.position.set(px,y2,pz);
    const seg=new T.Mesh(new T.CylinderGeometry(1.4,1.4,1.85,14,1,true,-.36,.72),mm);seg.position.set(0,.98,-1.4);g2.add(seg);
    const leg=new T.Mesh(new T.BoxGeometry(.05,.06,.5),mat(0x6a6a70,{metalness:.7}));leg.position.set(0,.03,0);g2.add(leg);
    const face=new T.Mesh(new T.PlaneGeometry(.75,1.5),new T.MeshBasicMaterial({map:TEX.ghost,transparent:true,opacity:0,depthWrite:false}));face.position.set(0,1.05,-.06);g2.add(face);anim.mirrors.push(face);
    g2.lookAt(cx,y2,cz);g2.rotateY(Math.PI);R.add(g2);solids.f2.push([px-.32,pz-.32,px+.32,pz+.32]);}
  /* кабинет профессора */
  sbox(R,'f2',9.5,1.75,1.6,.75,.82,0x3b2616);sbox(R,'f2',11.8,2.5,.3,3,2.5,0x4a2e1a);box(R,'f2',10.2,1.6,.2,.2,.4,0xffd090,{emissive:0xffb060,emissiveIntensity:1},.82);
  sbox(R,'f2',8.2,3.8,1.2,.9,.5,0x5a1f22);
  /* гостевая */
  sbox(R,'f2',2.5,10.5,1.2,.8,.78,0x5a3b25);sbox(R,'f2',4.4,10.6,1.2,1.8,.5,0x6a5a6a);
  /* подвал — серверная */
  for(let k=0;k<4;k++){sbox(R,'b',1.6+k*1.05,1.35,.8,.55,2.2,0x1c2026,{metalness:.5,roughness:.5});
    for(let q=0;q<6;q++)box(R,'b',1.6+k*1.05,1.08,.6,.02,.04,q%2?0x40ff90:0x3aa0ff,{emissive:q%2?0x20ff70:0x2a90ff,emissiveIntensity:1.2},.4+q*.3);}
  sbox(R,'b',2.5,2.6,1,.5,1,0x2a2e36,{metalness:.4});box(R,'b',2.5,2.82,.4,.04,.75,0x1a1e24,{},1.05);
  const scr=new T.Mesh(new T.PlaneGeometry(.95,.7),new T.MeshBasicMaterial({map:TEX.screen}));scr.position.set(2.5*C,LEV.b+1.45,2.85*C+.02);R.add(scr);FL.b.screen=scr;
  /* бывший винный погреб: бочки, блок климат-контроля */
  for(let k=0;k<7;k++){const cy=new T.Mesh(new T.CylinderGeometry(.42,.42,1,14),mat(0x4a2e1a));cy.rotation.x=Math.PI/2;cy.position.set((7.6+(k%4)*.9)*C,LEV.b+.45+(k>3?.85:0),4.5*C);R.add(cy);}
  solid('b',9.1,4.5,3.8,.5);
  sbox(R,'b',9.5,1.8,.9,.5,1.9,0x6a7a6a,{metalness:.6,roughness:.4});
  const pipe=new T.Mesh(new T.CylinderGeometry(.06,.06,C*1.6,8),mat(0x8a8070,{metalness:.7}));pipe.rotation.z=Math.PI/2;pipe.position.set(10.3*C,LEV.b+2.7,1.8*C);R.add(pipe);
  const vv=new T.Mesh(new T.TorusGeometry(.16,.03,6,14),mat(0xc0302a,{emissive:0x801010,emissiveIntensity:.8}));vv.position.set(9.5*C,LEV.b+1.25,2.08*C);R.add(vv);FL.b.valve=vv;
  if(M().found.includes('server'))offServer();if(M().found.includes('climate'))offValve();}

function buildItems(){for(const it of ITEMS){const g2=new T.Group();g2.position.set(it.p[0]*C,LEV[it.f]+it.y,it.p[1]*C);
    let m;const gm=mat(0xe8c27a,{emissive:0xb88a3d,emissiveIntensity:.7,roughness:.4,metalness:.3});
    if(it.shape==='book'){m=new T.Mesh(new T.BoxGeometry(.34,.07,.26),mat(0x5a1a14,{emissive:0x3a0a08,emissiveIntensity:.6}));}
    else if(it.shape==='books'){m=new T.Group();for(let k=0;k<3;k++){const b=new T.Mesh(new T.BoxGeometry(.32,.06,.24),mat([0x4a2a14,0x3a1a10,0x5a3a1a][k],{emissive:0x2a1408,emissiveIntensity:.5}));b.position.y=k*.065;b.rotation.y=k*.2;m.add(b);}}
    else if(it.shape==='glasses'){m=new T.Group();for(const x of [-.07,.07]){const t=new T.Mesh(new T.TorusGeometry(.055,.012,6,16),gm);t.position.x=x;m.add(t);}m.rotation.x=-Math.PI/2.4;}
    else if(it.shape==='laptop'){m=new T.Group();const b=new T.Mesh(new T.BoxGeometry(.4,.02,.28),mat(0x2a2c30,{metalness:.6}));m.add(b);const sc=new T.Mesh(new T.PlaneGeometry(.38,.25),new T.MeshBasicMaterial({map:TEX.lapscreen}));sc.position.set(0,.13,-.14);sc.rotation.x=-.25;m.add(sc);}
    else if(it.shape==='paper'){m=new T.Mesh(new T.BoxGeometry(.3,.02,.4),mat(0xf0e8d6,{emissive:0x605840,emissiveIntensity:.5}));}
    else if(it.shape==='pillow'){m=new T.Mesh(new T.BoxGeometry(.6,.14,.36),mat(0xd8d0e8,{emissive:0x2a4aff,emissiveIntensity:.35}));}
    else m=new T.Mesh(new T.SphereGeometry(.07,10,8),gm);
    g2.add(m);const sp=new T.Sprite(new T.SpriteMaterial({map:TEX.glow,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.7,color:it.kind==='act'?0xff7060:0xffd890}));sp.scale.set(.9,.9,1);g2.add(sp);
    root.add(g2);const o={it,g:g2,sp,m};anim.items.push(o);if(M().found.includes(it.id)){if(it.kind==='art')g2.visible=false;else sp.visible=false;}}}
function offServer(){if(FL.b.screen)FL.b.screen.material=new T.MeshBasicMaterial({color:0x05070a});const l=FL.b.lights&&FL.b.lights[1];if(l)l.l.intensity=.05;}
function offValve(){if(FL.b.valve)FL.b.valve.material=mat(0x2a8a4a,{emissive:0x0a4a1a,emissiveIntensity:.6});}

/* ---------- walking: one continuous surface ---------- */
const wrapA=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
function stairH(x){return Math.max(0,Math.min(1,(x-STAIR.x0)/(STAIR.x1-STAIR.x0)))*H;}
function surfaceAt(x,z){const i=Math.floor(x/C),j=Math.floor(z/C),cand=[];
  for(const f of ORDER){if(isFloor(cell(f,i,j)))cand.push({y:LEV[f]});}
  if(x>=STAIR.x0&&x<=STAIR.x1&&z>=STAIR.z0&&z<=STAIR.z1)cand.push({y:stairH(x)});
  if(i===SPI.i&&j===SPI.j){const dx=x-SPI.cx,dz=z-SPI.cz,d=Math.hypot(dx,dz);
    if(d>=SPI.r&&d<=SPI.R){const ang=Math.atan2(dz,dx);let ph=st.phase==null?(st.y>-H/2?0:Math.PI*2):st.phase+wrapA(ang-st.ang);
      if(ph>-.06&&ph<Math.PI*2+.06){ph=Math.max(0,Math.min(Math.PI*2,ph));cand.push({y:-ph/(Math.PI*2)*H,ph,ang});}}}
  let best=null;for(const c of cand){const dy=Math.abs(c.y-st.y);if(dy<=STEP&&(!best||dy<Math.abs(best.y-st.y)))best=c;}
  return best;}
function blocked(x,z,y){const f=lvlOf(y+.05);
  for(const [a,b] of [[-PR,-PR],[PR,-PR],[-PR,PR],[PR,PR]])if(isWall(cell(f,Math.floor((x+a)/C),Math.floor((z+b)/C))))return true;
  for(const s of solids[f])if(x+PR>s[0]&&x-PR<s[2]&&z+PR>s[1]&&z-PR<s[3])return true;
  if(f==='f2'&&x>C&&x<6*C&&z>C&&z<6*C){const dx=x-BED.cx,dz=z-BED.cz,d=Math.hypot(dx,dz);if(d>BED.R-PR-.05&&Math.abs(Math.atan2(dx,dz))>.2)return true;}
  return false;}
function tryMove(nx,nz){const s=surfaceAt(nx,nz);if(!s||blocked(nx,nz,s.y))return false;
  st.x=nx;st.z=nz;st.y=s.y;if(s.ph!=null){if(st.phase==null)st.spDir=st.y>-H/2?1:-1;st.phase=s.ph;st.ang=s.ang;}else{st.phase=null;st.spDir=null;}return true;}
/* ---------- автоматический проход по лестницам ---------- */
function pathSpiralDown(){const P=[[10.55*C,SPI.cz,0]];const r=.78,n=72;
  for(let k=0;k<=n;k++){const ph=k/n*Math.PI*2,a=Math.PI+ph;P.push([SPI.cx+Math.cos(a)*r,SPI.cz+Math.sin(a)*r,-ph/(Math.PI*2)*H]);}
  P.push([10.45*C,SPI.cz,-H]);return P;}
function pathMainUp(){return [[5.55*C,6.5*C,0],[STAIR.x0,6.5*C,0],[STAIR.x1,6.5*C,H],[10.6*C,6.55*C,H],[10.6*C,7.45*C,H]];}
function startAuto(P,msg){const L=[0];for(let k=1;k<P.length;k++)L.push(L[k-1]+Math.hypot(P[k][0]-P[k-1][0],P[k][1]-P[k-1][1],P[k][2]-P[k-1][2]));
  st.auto={P,L,d:0,total:L[L.length-1],speed:1.9};st.phase=null;$('#m3act').hidden=true;$('#m3hint').classList.remove('on');if(msg)toast(msg);}
function autoTick(dt){const A=st.auto;A.d=Math.min(A.total,A.d+A.speed*dt);let k=1;while(k<A.L.length-1&&A.L[k]<A.d)k++;
  const t=(A.d-A.L[k-1])/Math.max(1e-6,A.L[k]-A.L[k-1]),a=A.P[k-1],b=A.P[k];
  st.x=a[0]+(b[0]-a[0])*t;st.z=a[1]+(b[1]-a[1])*t;st.y=a[2]+(b[2]-a[2])*t;
  const dx=b[0]-a[0],dz=b[1]-a[1];if(Math.hypot(dx,dz)>.01){const ty=Math.atan2(-dx,-dz);st.yaw+=wrapA(ty-st.yaw)*Math.min(1,dt*5);}
  st.pitch+=((b[2]<a[2]?-.32:b[2]>a[2]?.18:0)-st.pitch)*Math.min(1,dt*3);
  if(A.d>=A.total){st.auto=null;st.phase=null;st.y=LEV[lvlOf(st.y+.05)];}}
function place(f,cx,cz,yaw){st.auto=null;st.x=cx*C;st.z=cz*C;st.y=LEV[f];st.phase=null;if(yaw!=null)st.yaw=yaw;st.pitch=0;}

/* ---------- HUD ---------- */
function makeUI(){const d=document.createElement('div');d.id='m3d';d.innerHTML=`<canvas id="m3dc" aria-label="Особняк под Сосновкой, вид от первого лица"></canvas>
  <div class="m3vig" id="m3vig"></div><div class="m3fade" id="m3fade"></div>
  <div class="m3top"><button class="icon" id="m3exit" aria-label="Выйти из особняка">‹</button><div class="m3loc"><small id="m3floor">Первый этаж</small><b id="m3room">Холл</b></div><button class="icon" id="m3log" aria-label="Найденное">❦</button></div>
  <div class="m3stat"><span id="m3cnt">Находки 0/${ARTN} · Действия 0/${ACTN}</span><div class="m3fear" title="Страх"><i id="m3fearv"></i></div><small>страх</small></div>
  <canvas class="m3map" id="m3map" width="132" height="132" aria-label="План этажа"></canvas>
  <div class="m3whisper" id="m3wh"></div><div class="m3hint" id="m3hint"></div>
  <div class="m3joy" id="m3joy"><i></i></div><button class="m3act" id="m3act" hidden>Осмотреть</button>
  <div class="m3help" id="m3help">${matchMedia('(pointer:coarse)').matches?'Левый палец — идти · правый — осмотреться':'WASD или стрелки — идти · тяните мышью — осмотреться · E — действие'}</div>`;
  document.body.appendChild(d);mm=$('#m3map').getContext('2d');return d;}
function counts(){const m=M();return [m.found.filter(id=>ITEMS.find(i=>i.id===id&&i.kind==='art')).length,m.found.filter(id=>ITEMS.find(i=>i.id===id&&i.kind==='act')).length];}
function onMain(){return st.x>=STAIR.x0-.05&&st.x<=STAIR.x1+.05&&st.z>=STAIR.z0&&st.z<=STAIR.z1&&st.y>.05&&st.y<H-.05;}
function hud(){const [a,c]=counts(),f=lvlOf(st.y+.05);$('#m3cnt').textContent=`Находки ${a}/${ARTN} · Действия ${c}/${ACTN}`;
  const onSt=st.phase!=null?'Винтовая лестница':(st.x>=STAIR.x0&&st.x<=STAIR.x1&&st.z>=STAIR.z0&&st.z<=STAIR.z1&&st.y>.05&&st.y<H-.05)?'Дубовая лестница':'';
  $('#m3floor').textContent=onSt?(st.phase!=null?'Между подвалом и первым этажом':'Между первым и вторым этажом'):FL[f].name;$('#m3room').textContent=onSt||roomAt(f,st.x,st.z)||FL[f].name;}
function drawMap(){const f=lvlOf(st.y+.05),g=FL[f].grid,s=132/13,ctx=mm;ctx.clearRect(0,0,132,132);ctx.fillStyle='#060914cc';ctx.fillRect(0,0,132,132);
  for(let j=0;j<g.length;j++)for(let i=0;i<g[0].length;i++){const ch=g[j][i];if(isWall(ch))continue;
    ctx.fillStyle=ch==='T'||ch==='O'?'#8a6a3a':ch==='S'?'#6a7a90':ch==='.'?'#3a3226':'#2a2a30';ctx.fillRect(i*s+.5,j*s+.5,s-1,s-1);}
  const px=st.x/C*s,pz=st.z/C*s;ctx.save();ctx.translate(px,pz);ctx.rotate(-st.yaw);ctx.fillStyle='#e8c27a';ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(4,4);ctx.lineTo(-4,4);ctx.closePath();ctx.fill();ctx.restore();}

function nearest(){let best=null;const fx=-Math.sin(st.yaw),fz=-Math.cos(st.yaw);const cand=[];
  for(const o of anim.items){if(M().found.includes(o.it.id)&&o.it.kind==='art')continue;cand.push({x:o.it.p[0]*C,z:o.it.p[1]*C,y:LEV[o.it.f],o,label:o.it.kind==='act'?(M().found.includes(o.it.id)?'Осмотреть: '+o.it.t:o.it.act):'Взять: '+o.it.t});}
  cand.push({x:FL.f1.door.x,z:FL.f1.door.z,y:0,door:1,label:'Выйти из особняка'});
  if(st.phase==null&&!onMain()){cand.push({x:10.4*C,z:SPI.cz,y:0,go:'spiralDown',label:'Спуститься в подвал',r:1.7,any:1});
    cand.push({x:10.4*C,z:SPI.cz,y:-H,go:'spiralUp',label:'Подняться на первый этаж',r:1.7,any:1});
    cand.push({x:5.2*C,z:6.5*C,y:0,go:'mainUp',label:'Подняться на второй этаж',r:1.6,any:1});
    cand.push({x:10.6*C,z:6.9*C,y:H,go:'mainDown',label:'Спуститься на первый этаж',r:1.6,any:1});}
  cand.push({x:BED.cx,z:BED.cz,y:H,mirror:1,label:'Подойти к зеркалам',r:2.7});
  for(const c of cand){if(Math.abs(c.y-st.y)>.6)continue;const dx=c.x-st.x,dz=c.z-st.z,d=Math.hypot(dx,dz);if(d>(c.r||2.1))continue;const dot=d<.6?1:(dx*fx+dz*fz)/d;if(dot<.35&&!c.r&&!c.any)continue;if(!best||d<best.d)best=Object.assign(c,{d});}
  return best;}

function interact(){const n=st.near;if(!n||!running||!$('#ov').hidden)return;
  if(n.door){exit();return;}if(n.mirror){mirrors();return;}
  if(n.go){const P=n.go==='spiralDown'?pathSpiralDown():n.go==='spiralUp'?pathSpiralDown().reverse():n.go==='mainUp'?pathMainUp():pathMainUp().reverse();
    startAuto(P,n.go==='spiralDown'?'Узкая винтовая лестница уходит вниз, в полутьму аварийных ламп':n.go==='mainUp'?'Ступени скрипят под ногами':'');return;}
  const it=n.o.it,m=M(),had=m.found.includes(it.id);
  if(!had){m.found.push(it.id);save();st.fear=Math.max(0,st.fear-30);if(it.kind==='art')n.o.g.visible=false;else{n.o.sp.visible=false;if(it.id==='server')offServer();if(it.id==='climate')offValve();}}
  const [a]=counts();
  modal(`<img class="art" alt="" src="${ART[it.art]}" style="aspect-ratio:16/9;object-position:center 30%"><div class="bd"><div class="eyebrow">${it.kind==='art'?'Находка':'Действие'} · ${FL[it.f].name}</div><h3>${it.t}</h3><p>${it.d}</p>
    ${had?'':`<div class="unlock"><b>${it.kind==='art'?`Найдено ${a} из ${ARTN}.`:'Сделано.'}</b> Страх Круглова отступает.</div>`}<button class="btn gold" id="mOk">Дальше</button></div>`,()=>{$('#mOk').onclick=closeModal;});
  hud();}

function mirrors(){const m=M(),all=ITEMS.every(i=>m.found.includes(i.id));
  if(!all){const left=ITEMS.filter(i=>!m.found.includes(i.id)).length;
    modal(`<img class="art" alt="" src="${ART.bedroom}" style="aspect-ratio:16/9"><div class="bd"><div class="eyebrow">Круглая спальня</div><h3>Зеркала молчат</h3><p>Пять вогнутых панелей холодны на ощупь — неестественно холодны, будто высасывают тепло из воздуха. В них ваше отражение: растянутое, деформированное, чужое. На мгновение кажется, что оно улыбается.</p><p>Чтобы понять, что здесь произошло, осмотрите весь дом. Осталось: ${left}.</p><button class="btn gold" id="mOk">Продолжить поиски</button></div>`,()=>{$('#mOk').onclick=closeModal;});return;}
  modal(`<img class="art" alt="" src="${ART.mirrorscene}" style="aspect-ratio:16/9"><div class="bd"><div class="eyebrow">Спальня с зеркалами Козырева</div><h3>Дети зеркал</h3>
    <p>Над головой оживает динамик умного дома: «Система „Гипнос“ приветствует нового гостя… Ваши сновидения очень важны для нас». У кровати — четыре фигуры. Профессор в старомодном пиджаке с верёвкой на шее. Женщина в мокром платье. Мальчик с вывернутой головой. И Алексей, протягивающий руку.</p>
    <p>«Добро пожаловать, — беззвучно говорят его губы. — Теперь ты один из нас».</p>
    <div class="row"><button class="btn gold" id="mFree" style="flex:1">Напомнить им, кто они</button><button class="btn" id="mSeal">Опечатать особняк</button></div></div>`,()=>{
    const fin=ch=>{m.done=true;m.choice=ch;save();closeModal();setTimeout(()=>modal(`<img class="art" alt="" src="${ch==='free'?ART.law4:ART.mansion}" style="aspect-ratio:16/9"><div class="bd"><div class="eyebrow">Особняк под Сосновкой пройден</div>
      <h3>${ch==='free'?'Память сильнее страха':'Никого сюда не пускать. Никогда'}</h3>
      <p>${ch==='free'?'Вы называете их по именам: профессор Виктор Светлов, Алексей Малышев. Вы говорите о том, кого они любили. Фигуры бледнеют, и зеркала одно за другим становятся просто металлом. Ненадолго.':'«Мы опечатаем особняк. Оборудование в подвале обесточить. Зеркала не трогать. Просто заколотите окна и двери. И никого сюда не пускайте. Никогда». Но ещё долго — очень долго — Круглову будут сниться зеркала.'}</p>
      <div class="unlock"><b>Награда в 17-м цикле:</b> ${bonusText()}</div>
      <div class="row"><button class="btn" id="mStay">Остаться в доме</button><button class="btn gold" id="mHomeM" style="flex:1">Выйти</button></div></div>`,()=>{$('#mStay').onclick=closeModal;$('#mHomeM').onclick=()=>{closeModal();exit();};}),60);};
    $('#mFree').onclick=()=>fin('free');$('#mSeal').onclick=()=>fin('seal');});}

function bonus(){const m=prog.mansion;if(!m)return null;const n=m.found.filter(id=>ITEMS.some(i=>i.id===id)).length;if(!n)return null;
  return {memory:Math.floor(n/2)+(m.done?3:0),souls:m.done&&m.choice==='free'?15:0,mansionFear:m.done&&m.choice!=='free'?20:0,n};}
function bonusText(){const b=bonus();if(!b)return 'ничего — дом ещё не осмотрен.';
  return `Память +${b.memory}${b.souls?`, спасено душ +${b.souls}`:''}${b.mansionFear?', страх в особняке −'+b.mansionFear:''}.`;}

/* ---------- frame ---------- */
function step(dt,t){if(st.auto){autoTick(dt);cam.position.set(st.x,st.y+EYE,st.z);st.eyeY=st.y+EYE;cam.rotation.set(st.pitch,st.yaw,0,'YXZ');ambient(dt,t);return;}
  let f=0,s=0;
  if(keys.KeyW||keys.ArrowUp)f+=1;if(keys.KeyS||keys.ArrowDown)f-=1;if(keys.KeyD)s+=1;if(keys.KeyA)s-=1;
  if(keys.ArrowLeft)st.yaw+=dt*1.8;if(keys.ArrowRight)st.yaw-=dt*1.8;if(joy){f+=-joy.dy;s+=joy.dx;}
  const len=Math.hypot(f,s);if(len>1){f/=len;s/=len;}
  const sy=Math.sin(st.yaw),cy=Math.cos(st.yaw),sp=st.phase!=null?1.6:2.5;
  const mx=(-sy*f+cy*s)*sp*dt,mz=(-cy*f-sy*s)*sp*dt;
  /* small sub-steps keep stairs smooth */
  if(st.phase!=null&&Math.abs(f)>.05){/* на винтовой лестнице «вперёд» продолжает путь по ступеням, «назад» возвращает */
    if(st.spDir==null)st.spDir=st.phase<Math.PI?1:-1;const dir=(f>0?1:-1)*st.spDir,amt=Math.abs(f)*sp*dt;
    const atEnd=(dir<0&&st.phase<.12)||(dir>0&&st.phase>Math.PI*2-.12);
    if(atEnd){tryMove(st.x-amt,st.z);}
    else{const a=Math.atan2(st.z-SPI.cz,st.x-SPI.cx),nr=.78,na=a+dir*amt/nr;tryMove(SPI.cx+Math.cos(na)*nr,SPI.cz+Math.sin(na)*nr);
      const tx=-Math.sin(na)*dir,tz=Math.cos(na)*dir;st.yaw+=wrapA(Math.atan2(-tx,-tz)-st.yaw)*Math.min(1,dt*4);}}
  else if(st.phase!=null){}
  else{const n=Math.max(1,Math.ceil(Math.hypot(mx,mz)/.08));for(let k=0;k<n;k++){if(!tryMove(st.x+mx/n,st.z+mz/n)){if(!tryMove(st.x+mx/n,st.z))tryMove(st.x,st.z+mz/n);}}}
  const moving=len>.05;st.bob+=moving?dt*8.5:0;st.eyeY+= (st.y+EYE-st.eyeY)*Math.min(1,dt*14);
  cam.position.set(st.x,st.eyeY+(moving?Math.sin(st.bob)*.03:0),st.z);cam.rotation.set(st.pitch,st.yaw,0,'YXZ');
  ambient(dt,t);
}
function ambient(dt,t){
  const lv=lvlOf(st.y+.05);let rate=FL[lv].base;const room=roomAt(lv,st.x,st.z);if(room==='Круглая спальня')rate+=1;if(st.phase!=null)rate+=.6;
  for(const {l,L,f:lf} of anim.lights){if(L.calm&&lf===lv&&Math.hypot(L.p[0]*C-st.x,L.p[1]*C-st.z)<3.6){rate=-5;break;}}
  st.fear=Math.max(0,Math.min(100,st.fear+rate*dt));if(st.fear>=100)faint();
  for(const {l,L} of anim.lights){if(L.flick===1)l.intensity=L.i*(.85+.15*Math.sin(t*.011)+.1*Math.sin(t*.037));else if(L.flick===2)l.intensity=(Math.sin(t*.003)>.93&&Math.random()<.5)?.05:L.i;}
  for(const fz of anim.fire)fz.material.emissiveIntensity=1.3+.4*Math.sin(t*.013)+.2*Math.sin(t*.041);
  flash.intensity=st.fear>70&&Math.random()<.05?.25:1.25;
  const mo=Math.max(0,(st.fear-35)/65)*.5*(.7+.3*Math.sin(t*.002));for(const m of anim.mirrors)m.material.opacity=mo;
  for(const a of anim.arrows||[])a.material.opacity=.35+.25*Math.sin(t*.005);
  for(const o of anim.items){o.sp.material.opacity=.45+.3*Math.sin(t*.004+o.it.p[0]);if(o.it.kind==='art')o.m.rotation.y+=dt*.6;}
  ghostTick(dt,t,lv);
  $('#m3fearv').style.width=st.fear+'%';$('#m3vig').style.opacity=Math.max(0,(st.fear-40)/60);
  if(st.fear>55&&t-st.lastWh>6500){st.lastWh=t;whisper(WHISPERS[Math.floor(Math.random()*WHISPERS.length)]);}
  if(st.auto){if(Math.floor(t/250)!==st.hudT){st.hudT=Math.floor(t/250);hud();drawMap();}return;}
  const nb=nearest();st.near=nb;const ab=$('#m3act'),h=$('#m3hint');
  if(nb){h.textContent=(matchMedia('(pointer:coarse)').matches?'':'E · ')+nb.label;h.classList.add('on');ab.hidden=false;$('#m3help').classList.add('off');
    ab.textContent=nb.label.length>24?(nb.door?'Выйти':nb.mirror?'Зеркала':nb.label.split(':')[0]):nb.label;}
  else if(st.phase!=null){h.textContent='Держите «вперёд» — ступени ведут по кругу';h.classList.add('on');ab.hidden=true;}
  else{h.classList.remove('on');ab.hidden=true;}
  if(Math.floor(t/250)!==st.hudT){st.hudT=Math.floor(t/250);hud();drawMap();}}
function whisper(t){const w=$('#m3wh');w.textContent=t;w.classList.remove('on');void w.offsetWidth;w.classList.add('on');}
/* призраки появляются там, где их видел Алексей: у зеркал, на лестнице, в подвале у серверной */
function ghostTick(dt,t,lv){if(!ghost)return;if(ghost.visible){ghost.life-=dt;ghost.material.opacity=Math.max(0,Math.min(.55,ghost.life*.6,(2.4-ghost.life)*.8));if(ghost.life<=0)ghost.visible=false;return;}
  if(st.fear<45||t-st.lastGhost<9000)return;const spots=(GHOST_AT[lv]||[]).filter(p=>{const d=Math.hypot(p[0]*C-st.x,p[1]*C-st.z);return d>2.5&&d<11;});if(!spots.length)return;
  const p=spots[Math.floor(Math.random()*spots.length)];st.lastGhost=t;ghost.position.set(p[0]*C,LEV[lv]+1.05,p[1]*C);ghost.life=2.4;ghost.visible=true;if(Math.random()<.5)whisper('Объект не идентифицирован');}
function faint(){running=false;const fd=$('#m3fade');fd.style.background='#2a0008';fd.style.opacity=1;
  setTimeout(()=>{place('f1',1.6,7.5,-Math.PI/2);st.eyeY=EYE;st.fear=35;hud();fd.style.opacity=0;setTimeout(()=>fd.style.background='#000',500);running=true;toast('Страх победил: Круглов выбежал на крыльцо и отдышался. Найденное не потеряно.');},700);}
function loop(t){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(t-(last||t))/1000);last=t;if(running&&$('#ov').hidden)step(dt,t);ren.render(scene,cam);}
function resize(){if(!ren)return;const w=innerWidth,h=innerHeight;ren.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}

function bindInput(){const cv=$('#m3dc'),jz=$('#m3joy'),knob=jz.querySelector('i');
  addEventListener('keydown',e=>{if(!ui||ui.hidden||!$('#ov').hidden)return;keys[e.code]=true;if(e.code==='KeyE'||e.code==='Space'||e.code==='Enter'){e.preventDefault();interact();}if(e.code==='Escape')exit();if(e.code.startsWith('Arrow'))e.preventDefault();});
  addEventListener('keyup',e=>{keys[e.code]=false;});addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
  cv.addEventListener('pointerdown',e=>{const left=e.pointerType!=='mouse'&&e.clientX<innerWidth*.45;
    if(left){joy={id:e.pointerId,ox:e.clientX,oy:e.clientY,dx:0,dy:0};jz.style.left=(e.clientX-50)+'px';jz.style.top=(e.clientY-50)+'px';jz.classList.add('on');}
    else look={id:e.pointerId,x:e.clientX,y:e.clientY};try{cv.setPointerCapture(e.pointerId);}catch(_){}$('#m3help').classList.add('off');});
  cv.addEventListener('pointermove',e=>{if(joy&&e.pointerId===joy.id){let dx=e.clientX-joy.ox,dy=e.clientY-joy.oy;const d=Math.hypot(dx,dy),mx=46;if(d>mx){dx=dx/d*mx;dy=dy/d*mx;}joy.dx=dx/mx;joy.dy=dy/mx;knob.style.transform=`translate(${dx}px,${dy}px)`;}
    else if(look&&e.pointerId===look.id){const k=e.pointerType==='mouse'?.0042:.0058;st.yaw-=(e.clientX-look.x)*k;st.pitch=Math.max(-1.1,Math.min(1.1,st.pitch-(e.clientY-look.y)*k));look.x=e.clientX;look.y=e.clientY;}});
  const up=e=>{if(joy&&e.pointerId===joy.id){joy=null;jz.classList.remove('on');knob.style.transform='';}if(look&&e.pointerId===look.id)look=null;};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  $('#m3act').onclick=interact;$('#m3exit').onclick=exit;
  $('#m3log').onclick=()=>{const m=M();modal(`<div class="bd"><div class="eyebrow">Особняк под Сосновкой</div><h3>Найденное</h3><div class="codex">${ITEMS.map(it=>{const on=m.found.includes(it.id);
      return `<div class="lw${on?'':' off'}"><img alt="" src="${ART[it.art]}"><div><b>${on?it.t:'Ещё не найдено'}</b><small>${FL[it.f].name}${it.kind==='act'?' · действие':''}</small></div></div>`;}).join('')}</div>
      <p style="font-size:13px">${m.done?'Тайна зеркал раскрыта. ':''}Награда в 17-м цикле: ${bonusText()}</p><button class="btn gold" id="mOk">Закрыть</button></div>`,()=>{$('#mOk').onclick=closeModal;});};
  addEventListener('resize',resize);}

function load(cb){if(window.THREE){T=window.THREE;cb();return;}if(loading)return;loading=true;toast('Загружаю 3D-особняк…');
  const s=document.createElement('script');s.src=THREE_URL;s.onload=()=>{loading=false;T=window.THREE;cb();};s.onerror=()=>{loading=false;toast('Не удалось загрузить 3D-движок. Проверьте интернет и попробуйте снова.');};document.head.appendChild(s);}
function init(){ui=makeUI();
  ren=new T.WebGLRenderer({canvas:$('#m3dc'),antialias:true});ren.setPixelRatio(Math.min(devicePixelRatio||1,1.5));ren.outputEncoding=T.sRGBEncoding;
  scene=new T.Scene();scene.background=new T.Color(0x05060a);scene.fog=new T.Fog(0x05060a,3,19);
  cam=new T.PerspectiveCamera(70,1,.05,60);scene.add(cam);
  flash=new T.SpotLight(0xfff1d6,1.25,14,.52,.6,2);cam.add(flash);const tg=new T.Object3D();tg.position.set(0,-.05,-1);cam.add(tg);flash.target=tg;
  TEX={wood:tex('wood'),oak:tex('oak'),paper:tex('paper'),paper2:tex('paper'),stone:tex('stone'),brick:tex('brick'),ceil:tex('ceil'),mosaic:tex('mosaic'),glow:tex('glow'),screen:tex('screen'),lapscreen:tex('lapscreen'),ghost:tex('ghost')};
  TEX.paper2.repeat.set(6,1.2);TEX.mosaic.repeat.set(6,3);
  st={x:0,z:0,y:0,yaw:-Math.PI/2,pitch:0,fear:10,bob:0,lastWh:0,lastGhost:0,near:null,phase:null,ang:0,eyeY:EYE};place('f1',1.6,7.5,-Math.PI/2);
  buildHouse();
  ghost=new T.Sprite(new T.SpriteMaterial({map:TEX.ghost,transparent:true,opacity:0,depthWrite:false}));ghost.scale.set(1,2,1);ghost.visible=false;scene.add(ghost);
  /* алюминиевые панели отражают комнату: одна статичная кубическая карта из центра спальни */
  cubeRT=new T.WebGLCubeRenderTarget(256,{generateMipmaps:true,minFilter:T.LinearMipmapLinearFilter});const cc=new T.CubeCamera(.1,30,cubeRT);cc.position.set(BED.cx,LEV.f2+1.4,BED.cz);scene.add(cc);
  cc.update(ren,scene);anim.mirrorMat.envMap=cubeRT.texture;anim.mirrorMat.needsUpdate=true;
  bindInput();resize();}

function open(){load(()=>{const first=!ui;if(first)init();ui.hidden=false;document.body.classList.add('m3on');resize();running=true;last=0;if(!raf)raf=requestAnimationFrame(loop);hud();
  if(first&&!prog.seen.mansion3d2){prog.seen.mansion3d2=1;save();
    modal(`<img class="art" alt="" src="${ART.mansion}" style="aspect-ratio:16/9"><div class="bd"><div class="eyebrow">Сосновка, Московская область · зима</div><h3>Особняк под Сосновкой</h3>
      <p>Шесть утра. Звонок дежурного: «Труп в особняке под Сосновкой. Странные обстоятельства. Нужен опытный следователь». — «Почему я?» — «Потому что вы всё равно не спите, товарищ майор».</p>
      <p>Три часа по зимней дороге, ближайший посёлок — в семи километрах. Мрачный дом среди вековых сосен: башенка со шпилем, дубовые двери, закопчённые каминные трубы. Вчера ночью здесь умер Алексей Малышев.</p>
      <p><b>Что нужно сделать.</b> Найдите ${ARTN} вещей на трёх этажах и выполните ${ACTN} действия в подвале, затем подойдите к кровати в круглой спальне. На второй этаж ведёт дубовая лестница из холла, в подвал — узкая винтовая в дальнем (восточном) конце холла, за светящейся стрелкой на полу. Подойдите к лестнице и нажмите кнопку «Спуститься в подвал» или «Подняться на второй этаж» — Круглов пройдёт её сам. Можно идти и вручную: на винтовой лестнице просто держите «вперёд».</p>
      <p><b>Страх</b> растёт в темноте, в подвале, на лестнице и у зеркал. Постойте у камина, свечи или лампы, чтобы успокоиться. Каждая находка тоже снижает страх.</p>
      <p><b>Управление.</b> На компьютере: WASD или стрелки — идти, тянуть мышью — осмотреться, E — действие. На телефоне: левый палец — идти, правый — осмотреться, кнопка внизу справа — действие.</p>
      <button class="btn gold" id="mOk">Войти в дом</button></div>`,()=>{$('#mOk').onclick=closeModal;});}});}
function exit(){if(!ui)return;running=false;ui.hidden=true;document.body.classList.remove('m3on');cancelAnimationFrame(raf);raf=0;for(const k in keys)keys[k]=false;joy=look=null;save();if(typeof renderTimeline==='function')renderTimeline();}
return {open,exit,bonus,bonusText,_st:()=>st,_cur:()=>lvlOf(st.y+.05),_items:ITEMS,_interact:()=>interact(),_go:(f,a)=>{place(f,a[0],a[1]);st.eyeY=st.y+EYE;},_move:(x,z)=>tryMove(x,z)};
})();
