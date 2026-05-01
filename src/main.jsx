
'react'에서 React, { useMemo, useRef, useState }를 가져옵니다.
import { createRoot } from 'react-dom/client';
import { Download, FileText, Image as ImageIcon, Plus, Search, Server, Shield, Network, Database, Trash2, Upload, Sparkles, Wand2, Camera, AlertTriangle, CheckCircle2 } from 'lucide-react';
'html2canvas'에서 html2canvas를 가져옵니다.
'jspdf'에서 jsPDF를 가져옵니다.
'papaparse'에서 Papa를 가져옵니다.
'./style.css' 파일을 임포트합니다.

const U_COUNT = 42;
const ROW_H = 24;

const BASE_DB = [
  ['시스템','Dell','PowerEdge R640',1,120,280,550,'서버',''],
  ['시스템','Dell','PowerEdge R740',2,180,400,750,'서버',''],
  ['시스템','Dell','PowerEdge R750',2,220,450,850,'서버',''],
  ['시스템','Dell','PowerEdge R760',2,240,500,950,'서버',''],
  ['시스템','HPE','DL360 Gen10',1,120,250,500,'서버',''],
  ['시스템','HPE','DL380 Gen9',2,160,320,650,'서버',''],
  ['시스템','HPE','DL380 Gen10',2,180,350,700,'서버',''],
  ['시스템','HPE','DL380 Gen11',2,220,450,850,'서버',''],
  ['시스템','Lenovo','SR650 V3',2,200,450,850,'서버',''],
  ['시스템','Lenovo','HX650 V3',2,300,700,1100,'서버',''],
  ['시스템','Cisco','UCS C240 ​​M5',2,200,420,850,'서버',''],
  ['시스템','Supermicro','일반 2U 서버',2,160,320,650,'서버',''],
  ['스토리지','HPE','3PAR 8000',2,350,700,1200,'스토리지',''],
  ['스토리지','HPE','3PAR 8200',2,400,800,1300,'스토리지',''],
  ['스토리지','HPE','3PAR 8440',2,450,900,1500,'스토리지',''],
  ['스토리지','Dell EMC','Unity XT 480',2,300,600,1100,'스토리지',''],
  ['스토리지','Dell EMC','PowerStore 500T',2,350,750,1300,'스토리지',''],
  ['스토리지','Dell EMC','PowerVault ME5024',2,200,500,900,'스토리지',''],
  ['스토리지','NetApp','AFF A250',2,250,500,900,'스토리지',''],
  ['스토리지','NetApp','AFF A400',2,350,650,1200,'스토리지',''],
  ['스토리지','퓨어스토리지','FlashArray X50',3,300,700,1300,'스토리지',''],
  ['스토리지','브로케이드','SN3000B SAN 스위치',1,50,100,180,'스위치',''],
  ['네트워크','Cisco','Catalyst C9200L-24T-4X',1,50,100,180,'스위치',''],
  ['네트워크','Cisco','Catalyst C9300-48T',1,80,180,350,'스위치',''],
  ['네트워크','Cisco','Nexus 93180YC-FX',1,180,350,650,'스위치',''],
  ['네트워크','Cisco','Nexus 9336C-FX2',1,250,500,900,'스위치',''],
  ['네트워크','Arista','7050X3',1,120,250,400,'스위치',''],
  ['네트워크','Arista','720DT',1,40,70,120,'스위치',''],
  ['네트워크','Arista','7280R3',1,240,450,800,'스위치',''],
  ['네트워크','주니퍼','QFX5120-48Y',1,150,300,500,'스위치',''],
  ['네트워크','주니퍼','EX4650',1,120,250,450,'스위치',''],
  ['네트워크','주니퍼','5110',1,90,180,300,'스위치',''],
  ['네트워크','HPE','5710',1,60,120,240,'스위치',''],
  ['네트워크','Alcatel','OS6900-X24C2',1,90,180,300,'스위치',''],
  ['네트워크','PIOLINK','K3200 L4',1,80,160,300,'스위치',''],
  ['네트워크','Alteon','5208 L4',1,80,150,280,'스위치',''],
  ['보안','Fortinet','FortiGate 100F',1,40,80,150,'방화벽',''],
  ['보안','Fortinet','FortiGate 200F',1,60,120,250,'방화벽',''],
  ['보안','Palo Alto','PA-3220',1,90,180,350,'방화벽',''],
  ['보안','Palo Alto','PA-5250',3,300,650,1000,'방화벽',''],
  ['보안','체크 포인트','Quantum 6600',1,120,250,450,'방화벽',''],
  ['보안','AXGATE','4000',2,90,180,320,'방화벽',''],
  ['보안','AXGATE','7000',2,90,180,350,'방화벽',''],
  ['보안','AXGATE','TMS 2000',1,40,80,160,'보안',''],
  ['보안','WAPPLES','2600',2,90,180,300,'보안',''],
  ['보안','저격수','one 5000',2,100,180,320,'보안',''],
  ['보안','안랩','EMS 2000A',1,60,120,200,'보안',''],
  ['보안','SECUI','BLUEMAX NGF 100',1,60,120,240,'방화벽',''],
  ['보안','F5','BIG-IP i4600',1,180,350,650,'보안',''],
].map((x, i) => ({ id:`base-${i}`, type:x[0], brand:x[1], model:x[2], u:x[3], min:x[4], avg:x[5], max:x[6], image:x[7], imageUrl:x[8] }));

function kw(w){ return (w/1000).toFixed(2); }
function amp(w, v){ return (w / Math.max(Number(v)||220, 1)).toFixed(1); }
function cls(type){ return {시스템:'system', 네트워크:'network', 보안:'security',스토리지:'storage',기타:'etc'}[type] || '등'; }
함수위험(비율){ 수익률>1 ? ['초과','danger',AlertTriangle] : 비율>=0.85 ? ['주의','경고',AlertTriangle] : ['안전','안전',CheckCircle2]; }
function esc(v){ const s=String(v??''); return /[",\n]/.test(s) ? `"${s.replaceAll('"','""')}"` : s; }

function recommendPower({type,u,psu,cpu,gpu,disks,workload}){
  const U=Math.max(+u||1,1), P=Math.max(+psu||1,1), C=Math.max(+cpu||0,0), G=Math.max(+gpu||0,0), D=Math.max(+disks||0,0), W=Math.min(Math.max(+workload||50,1),100)/100;
  base=80, perU=60, perCpu=65, perGpu=250, perDisk=9, factor=1로 설정합니다.
  if(type==='네트워크'){base=45; perU=70; CPU당=0; 당 GPU=0; 디스크당=0; 인자=1.25;}
  if(type==='보안'){base=70; perU=80; CPU당=20; 당 GPU=0; 디스크당=0; 인자=1.3;}
  if(type==='스토리지'){base=180; perU=120; CPU당=25; 당 GPU=0; 디스크당=13; 인자=1.15;}
  const max=Math.round((base+U*perU+C*perCpu+G*perGpu+D*perDisk)*factor*(1+Math.min(P,4)*0.03));
  {최소값: Math.round(max*0.18), 평균값: Math.round(max*(0.28+W*0.45)), 최대값}을 반환합니다.
}

function DeviceArt({kind,imageUrl}){
  if(imageUrl) return <div className="photo"><img src={imageUrl} onError={(e)=>{e.currentTarget.style.display='none'}} /></div>;
  if(kind==='switch') return <div className="art switch"><div className="ports">{Array.from({length:20}).map((_,i)=><i key={i}/>)}</div></div>;
  if(kind==='firewall') return <div className="art firewall"><Shield size={20}/></div>;
  if(kind==='security') return <div className="art securityArt"><Shield size={20}/></div>;
  if(kind==='storage') return <div className="art storage"><div className="bays">{Array.from({length:8}).map((_,i)=><i key={i}/>)}</div></div>;
  <div className="art server"><서버 크기={20}/></div>를 반환합니다.
}

function Metric({label,value,sub}){ return <div className="metric"><span>{label}</span><b>{value}</b><small>{sub}</small></div>; }
function Bar({label,rate}){ const [,,Icon]=risk(rate); const [txt,c]=risk(rate); return <div className="barBlock"><div><span>{label}</span><b><Icon size={13}/>{txt} {(rate*100).toFixed(1)}%</b></div><div className="bar"><i className={c} style={{width:`${Math.min(rate*100,100)}%`}}/></div></div>; }

함수 App(){
  const rackRef=useRef(null), fileRef=useRef(null);
  const [catalog,setCatalog]=useState(BASE_DB), [items,setItems]=useState([]);
  const [query,setQuery]=useState(''), [filter,setFilter]=useState('전체'), [selectedId,setSelectedId]=useState(BASE_DB[0].id);
  const [startU,setStartU]=useState(41), [rackName,setRackName]=useState('RACK-01'), [volt,setVoltage]=useState(220), [contractKw,setContractKw]=useState(3.3);
  const [gap,setGap]=useState(true), [dual,setDual]=useState(true);
  const [ai,setAi]=useState({type:'system',u:2,psu:2,cpu:2,gpu:0,disks:8,workload:55});
  const [custom,setCustom]=useState({min:180,avg:350,max:700});

  const filtered=useMemo(()=>catalog.filter(d=>(filter==='전체'||d.type===filter)&&(!query||`${d.brand} ${d.model} ${d.type}`.toLowerCase().includes(query.toLowerCase()))),[catalog,query,filter]);
  const selected=useMemo(()=>catalog.find(d=>d.id===selectedId)||filtered[0]||catalog[0],[catalog,selectedId,filtered]);
  const occupied=useMemo(()=>{const s=new Set(); items.forEach(x=>{for(let i=0;i<xu;i++)s.add(x.startU-i); if(x.gap)s.add(x.startU-xu)}); return s;},[items]);
  const totals=useMemo(()=>items.reduce((a,x)=>({min:a.min+x.min,avg:a.avg+x.avg,max:a.max+x.max}),{min:0,avg:0,max:0}),[items]);
  const contractW=Math.max(+contractKw||3.3,0.1)*1000;
  const [avgTxt,avgCls,AvgIcon]=risk(totals.avg/contractW);

  함수 addDevice(){
    s=+startU||41로 설정하세요;
    while(s>0){
      ok=true로 설정;
      for(let i=0;i<selected.u;i++) if(occupied.has(si)||si<1) ok=false;
      if(gap&&occupied.has(s-selected.u)) ok=false;
      if(ok) break; s--;
    }
    if(s-selected.u+1<1){alert('남은 U 공간이 없습니다.');return;}
    setItems(p=>[...p,{...selected,uid:crypto.randomUUID(),startU:s,gap}]);
    setStartU(Math.max(1,s-selected.u-(gap?1:0)));
  }
  함수 importCsv(파일){
    파일이 없으면 반환됩니다.
    Papa.parse(file,{header:true,skipEmptyLines:true,complete:r=>{
      const arr=r.data.map((row,i)=>({id:`csv-${Date.now()}-${i}`,brand:row.brand||row.Brand||'Custom',model:row.model||row.Model||'Device',type:row.type||row.Type||'system',u:+(row.u||row.U)||1,min:+(row.min||row.min_w)||0,avg:+(row.avg||row.avg_w)||0,max:+(row.max||row.max_w)||0,image:row.image||'server',imageUrl:row.image_url||row.imageUrl||row.photo||''}));
      setCatalog(p=>[...arr,...p]);
    }});
  }
  함수 addCustom(e){
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    const d={id:`custom-${Date.now()}`,brand:f.get('brand')||'Custom',model:f.get('model')||'Device',type:f.get('type')||'system',u:+f.get('u')||1,min:+f.get('min')||0,avg:+f.get('avg')||0,max:+f.get('max')||0,image:f.get('image')||'server',imageUrl:f.get('imageUrl')||''};
    setCatalog(p=>[d,...p]); setSelectedId(d.id);
  }
  function runAi(){ setCustom(recommendPower(ai)); }
  function download(content,name,type){const b=content instanceof Blob?content:new Blob([content],{type}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download=name; a.click(); URL.revokeObjectURL(u);}
  함수 exportCsv(){
    const rows=[...items].sort((a,b)=>b.startU-a.startU).map(x=>[x.startU,xu,x.type,x.brand,x.model,x.min,x.avg,x.max,x.imageUrl||''].map(esc).join(',')).join('\n');
    download(`\ufeffU,크기,유형,브랜드,모델,최소 W,평균 W,최대 W,이미지 URL\n${rows}`,`${rackName}_report.csv`,'text/csv;charset=utf-8');
  }
  비동기 함수 exportPng(){
    const canvas=await html2canvas(rackRef.current,{scale:2,backgroundColor:'#fff',useCORS:true});
    canvas.toBlob(b=>download(b,`${rackName}_rack.png`,'image/png'));
  }
  비동기 함수 exportPdf(){
    const canvas=await html2canvas(rackRef.current,{scale:2,backgroundColor:'#fff',useCORS:true});
    const pdf=new jsPDF('p','mm','a4'); const img=canvas.toDataURL('image/png'); const w=190,h=canvas.height*w/canvas.width;
    pdf.text(rackName,10,12); pdf.addImage(img,'PNG',10,18,w,Math.min(h,270)); pdf.save(`${rackName}_rack.pdf`);
  }

  const normalA=dual?totals.avg/2:totals.avg, normalB=dual?totals.avg/2:0;
  const groups=Object.entries(items.reduce((a,x)=>{const k=`${x.brand} ${x.model}`.replace(/#\s*[12]|_[12]|-A|-B|-M/gi,'').trim(); a[k]=(a[k]||0)+1; return a;},{})).filter(([,v])=>v>1);

  <div className="page">를 반환합니다.
    <header><div><h1>IDC Rack Power Platform v2</h1><p>실제 사진 URL · 전력 자체 추천 AI · A/B 전원 · 출력</p></div><div className="actions"><button onClick={exportPng}><ImageIcon size={16}/>PNG</button><button onClick={exportPdf}><Download size={16}/>PDF</button><button className="outline" onClick={exportCsv}><FileText size={16}/>CSV</button></div></header>
    <메인>
      <section className="panel">
        <div className="controls"><input value={rackName} onChange={e=>setRackName(e.target.value)}/><label>전압<input type="number" value={voltage} onChange={e=>setVoltage(+e.target.value)}/>V</label><label>계약<input type="number" step="0.1" value={contractKw} onChange={e=>setContractKw(+e.target.value)}/>kW</label><label><input type="checkbox" checked={gap} onChange={e=>setGap(e.target.checked)}/>1U 공기층</label><label><input type="checkbox" checked={dual} onChange={e=>setDual(e.target.checked)}/>듀얼파워</label></div>
        <div className="legend"><span className="systemBg"/>시스템 <span className="networkBg"/>네트워크 <span className="securityBg"/> 보안 <span className="storageBg"/>스토리지 <span className="etcBg"/>기타</div>
        <div className="rackWrap" ref={rackRef}><div className="rackHead"><b>{rackName}</b><em className={avgCls}><AvgIcon size={14}/> {avgTxt}</em></div><div className="rack">
          {Array.from({length:U_COUNT},(_,i)=>{const u=U_COUNT-i, it=items.find(x=>x.startU===u); return <div className="uRow" key={u}><div className="uNum">{u}U</div><div className="uSlot">{it&&<div className={`device ${cls(it.type)}`} style={{height:`${it.u*ROW_H-2}px`}}><DeviceArt kind={it.image} imageUrl={it.imageUrl}/><div className="devText"><b>{it.brand} {it.model}</b><small>{it.type} · {it.u}U</small></div><div className="devPower">avg {it.avg}W<br/>max {it.max}W</div></div>}</div></div>})}
        </div></div>
      </section>
      <곁가지>
        <section className="panel"><h2>장비 검색 / 추가</h2><div className="search"><Search size={16}/><input placeholder="DL380, R740, FortiGate..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="chips">{['전체','시스템','네트워크','보안','스토리지','기타'].map(t=><button key={t} className={filter===t?'active':''} onClick={()=>setFilter(t)}>{t}</button>)}</div><select value={selected?.id} onChange={e=>setSelectedId(e.target.value)}>{filtered.map(d=><옵션 키={d.id} 값={d.id}>{d.type} · {d.brand} {d.model} · {du}U · 평균 {d.avg}W</option>)}</select><div className="info"><b>{selected.brand} {selected.model}</b><br/>{selected.type} · {selected.u}U · 최소 {selected.min}W / 평균 {selected.avg}W / 최대 {selected.max}W</div><label>시작 U <input type="number" value={startU} onChange={e=>setStartU(+e.target.value)}/></label><button className="full" onClick={addDevice}><Plus size={16}/>랙에 추가</button><button className="full outline" onClick={()=>fileRef.current.click()}><Upload size={16}/>CSV 장비 DB 업로드</button><input ref={fileRef} hidden type="file" accept=".csv" onChange={e=>importCsv(e.target.files?.[0])}/></section>
        <section className="panel ai"><h2><Sparkles size={17}/>전력 자동 추천 AI</h2><div className="formGrid"><select value={ai.type} onChange={e=>setAi({...ai,type:e.target.value})}><option>시스템</option><option>네트워크</option><option>보안</option><option>스토리지</option><option>기타</option></select><input type="number" value={ai.u} onChange={e=>setAi({...ai,u:e.target.value})} placeholder="U"/><input type="number" value={ai.psu} onChange={e=>setAi({...ai,psu:e.target.value})} placeholder="PSU"/><input type="number" value={ai.cpu} onChange={e=>setAi({...ai,cpu:e.target.value})} placeholder="CPU"/><input type="number" value={ai.gpu} onChange={e=>setAi({...ai,gpu:e.target.value})} placeholder="GPU"/><input type="number" value={ai.disks} onChange={e=>setAi({...ai,disks:e.target.value})} placeholder="Disk"/><label className="wide">부하율 {ai.workload}%<input type="range" min="1" max="100" value={ai.workload} onChange={e=>setAi({...ai,workload:e.target.value})}/></label></div><button className="full magic" onClick={runAi}><Wand2 size={16}/>추천 전력 계산</button><p className="aiResult">추천값: 최소 {custom.min}W / 평균 {custom.avg}W / 최대 {custom.max}W</p></section>
        <section className="panel"><h2><Camera size={17}/>직접 장비 DB 추가</h2><form className="formGrid" onSubmit={addCustom}><input name="brand" placeholder="브랜드"/><input name="model" placeholder="모델명"/><select name="type"><option>시스템</option><option>네트워크</option><option>보안</option><option>스토리지</option><option>기타</option></select><input name="u" type="number" defaultValue={ai.u}/><input name="min" type="number" value={custom.min} onChange={e=>setCustom({...custom,min:+e.target.value})}/><input name="avg" type="number" value={custom.avg} onChange={e=>setCustom({...custom,avg:+e.target.value})}/><input name="max" type="number" value={custom.max} onChange={e=>setCustom({...custom,max:+e.target.value})}/><select name="image"><option value="server">서버</option><option value="switch">스위치</option><option value="firewall">방화벽</option><option value="security">보안</option><option value="storage">스토리지</option></select><input className="wide" name="imageUrl" placeholder="실제 장비 사진 URL (선택)"/><button className="full">DB에 추가</button></form></section>
        <section className="panel"><h2>전력 / A·B 전원</h2><div className="metrics"><Metric label="최소" value={`${kw(totals.min)}kW`} sub={`${amp(totals.min,volt)}A`}/><Metric label="평균" value={`${kw(totals.avg)}kW`} sub={`${amp(totals.avg,volt)}A`}/><Metric label="최대" value={`${kw(totals.max)}kW`} sub={`${amp(totals.max,volt)}A`}/></div><Bar label="평균 사용률" rate={totals.avg/contractW}/><Bar label="최대 사용률" rate={totals.max/contractW}/><div className="ab"><div><b>A전원</b><br/>평상시 {kw(normalA)}kW / {amp(normalA,volt)}A<br/> 장애시 {kw(totals.avg)}kW / {amp(totals.avg,volt)}A</div><div><b>B 전원</b><br/>평상시 {kw(normalB)}kW / {amp(normalB,volt)}A<br/> 장애시 {kw(totals.avg)}kW / {amp(totals.avg,volt)}A</div></div></section>
        <section className="panel"><h2>장비 목록</h2><button className="outline small" onClick={()=>setItems([])}>선택기화</button><div className="list">{[...items].sort((a,b)=>b.startU-a.startU).map(x=><div className="listItem" key={x.uid}><div><b>{x.startU}U · {x.brand} {x.model}</b><br/><span>{x.type} · {xu}U · avg {x.avg}W · max {x.max}W</span></div><button className="delete" onClick={()=>setItems(p=>p.filter(y=>y.uid!==x.uid))}><Trash2 size={15}/></button></div>)}</div>{groups.length>0&&<div className="info"><b>자동 이중화하는 것</b><br/>{groups.map(([k,v])=>`${k} (${v})`).join(' / ')}</div>}</section>
      </aside>
    </main>
  </div>
}

createRoot(document.getElementById('root')).render(<App/>);
