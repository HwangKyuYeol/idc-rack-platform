
import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Download, FileText, Image as ImageIcon, Plus, Search, Server, Shield, Trash2,
  Upload, Sparkles, Wand2, Camera, AlertTriangle, CheckCircle2, X, Info,
  MoveDown, RotateCcw, Layers, Copy, Save, FolderOpen, GitBranch, Zap, ThermometerSun
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import './style.css';

const U_COUNT = 42;
const ROW_H = 22;
const DEFAULT_RACKS = ['R1','R2','R3','R4'];

const BASE_DB = [
  ['시스템','Dell','PowerEdge R640',1,120,280,550,'server',''],
  ['시스템','Dell','PowerEdge R740',2,180,400,750,'server',''],
  ['시스템','Dell','PowerEdge R750',2,220,450,850,'server',''],
  ['시스템','Dell','PowerEdge R760',2,240,500,950,'server',''],
  ['시스템','HPE','DL360 Gen10',1,120,250,500,'server',''],
  ['시스템','HPE','DL380 Gen9',2,160,320,650,'server',''],
  ['시스템','HPE','DL380 Gen10',2,180,350,700,'server',''],
  ['시스템','HPE','DL380 Gen11',2,220,450,850,'server',''],
  ['시스템','Lenovo','SR650 V3',2,200,450,850,'server',''],
  ['시스템','Lenovo','HX650 V3',2,300,700,1100,'server',''],
  ['스토리지','HPE','3PAR 8000',2,350,700,1200,'storage',''],
  ['스토리지','HPE','3PAR 8200',2,400,800,1300,'storage',''],
  ['스토리지','HPE','3PAR 8440',2,450,900,1500,'storage',''],
  ['스토리지','Dell EMC','PowerStore 500T',2,350,750,1300,'storage',''],
  ['스토리지','NetApp','AFF A400',2,350,650,1200,'storage',''],
  ['스토리지','Pure Storage','FlashArray X50',3,300,700,1300,'storage',''],
  ['네트워크','Cisco','Catalyst C9200L-24T-4X',1,50,100,180,'switch',''],
  ['네트워크','Cisco','Nexus 93180YC-FX',1,180,350,650,'switch',''],
  ['네트워크','Arista','7050X3',1,120,250,400,'switch',''],
  ['네트워크','Arista','720DT',1,40,70,120,'switch',''],
  ['네트워크','Juniper','QFX5120-48Y',1,150,300,500,'switch',''],
  ['네트워크','HPE','5710',1,60,120,240,'switch',''],
  ['네트워크','Alcatel','OS6900-X24C2',1,90,180,300,'switch',''],
  ['네트워크','PIOLINK','K3200 L4',1,80,160,300,'switch',''],
  ['보안','Fortinet','FortiGate 100F',1,40,80,150,'firewall',''],
  ['보안','Fortinet','FortiGate 200F',1,60,120,250,'firewall',''],
  ['보안','Palo Alto','PA-3220',1,90,180,350,'firewall',''],
  ['보안','AXGATE','4000',2,90,180,320,'firewall',''],
  ['보안','AXGATE','7000',2,90,180,350,'firewall',''],
  ['보안','WAPPLES','2600',2,90,180,300,'security',''],
  ['보안','Sniper','one 5000',2,100,180,320,'security',''],
  ['보안','AhnLab','EMS 2000A',1,60,120,200,'security',''],
  ['보안','F5','BIG-IP i4600',1,180,350,650,'security',''],
].map((x, i) => ({ id:`base-${i}`, type:x[0], brand:x[1], model:x[2], u:x[3], min:x[4], avg:x[5], max:x[6], image:x[7], imageUrl:x[8] }));

function kw(w){ return (w/1000).toFixed(2); }
function amp(w, v){ return (w / Math.max(Number(v)||220, 1)).toFixed(1); }
function typeClass(type){ return {시스템:'system',네트워크:'network',보안:'security',스토리지:'storage',기타:'etc'}[type] || 'etc'; }
function risk(rate){ return rate>1 ? ['초과','danger',AlertTriangle] : rate>=0.85 ? ['주의','warning',AlertTriangle] : ['안전','safe',CheckCircle2]; }
function esc(v){ const s=String(v??''); return /[",\n]/.test(s) ? `"${s.replaceAll('"','""')}"` : s; }

function redundancyKey(item){
  return `${item.brand} ${item.model} ${item.label||item.model}`
    .replace(/#\s*[12]/gi,'')
    .replace(/_[12]\b/gi,'')
    .replace(/\b(A|B|M)\b/gi,'')
    .replace(/-A|-B|-M/gi,'')
    .replace(/\s+/g,' ')
    .trim();
}

function recommendPower({type,u,psu,cpu,gpu,disks,workload}){
  const U=Math.max(+u||1,1), P=Math.max(+psu||1,1), C=Math.max(+cpu||0,0), G=Math.max(+gpu||0,0), D=Math.max(+disks||0,0), W=Math.min(Math.max(+workload||50,1),100)/100;
  let base=80, perU=60, perCpu=65, perGpu=250, perDisk=9, factor=1;
  if(type==='네트워크'){base=45; perU=70; perCpu=0; perGpu=0; perDisk=0; factor=1.25;}
  if(type==='보안'){base=70; perU=80; perCpu=20; perGpu=0; perDisk=0; factor=1.3;}
  if(type==='스토리지'){base=180; perU=120; perCpu=25; perGpu=0; perDisk=13; factor=1.15;}
  const max=Math.round((base+U*perU+C*perCpu+G*perGpu+D*perDisk)*factor*(1+Math.min(P,4)*0.03));
  return {min:Math.round(max*0.18), avg:Math.round(max*(0.28+W*0.45)), max};
}

function DeviceArt({kind,imageUrl,compact=false}){
  if(imageUrl) return <div className="photo"><img src={imageUrl} onError={(e)=>{e.currentTarget.style.display='none'}} /></div>;
  if(kind==='switch') return <div className={`art switch ${compact?'compact':''}`}><div className="ports">{Array.from({length:compact?12:20}).map((_,i)=><i key={i}/>)}</div></div>;
  if(kind==='firewall') return <div className="art firewall"><Shield size={compact?15:20}/></div>;
  if(kind==='security') return <div className="art securityArt"><Shield size={compact?15:20}/></div>;
  if(kind==='storage') return <div className="art storageArt"><div className="bays">{Array.from({length:compact?6:8}).map((_,i)=><i key={i}/>)}</div></div>;
  return <div className="art server"><Server size={compact?15:20}/></div>;
}

function Metric({label,value,sub}){ return <div className="metric"><span>{label}</span><b>{value}</b><small>{sub}</small></div>; }
function Bar({label,rate}){ const [txt,c,Icon]=risk(rate); return <div className="barBlock"><div><span>{label}</span><b className={c}><Icon size={13}/>{txt} {(rate*100).toFixed(1)}%</b></div><div className="bar"><i className={c} style={{width:`${Math.min(rate*100,100)}%`}}/></div></div>; }

function RackMini({rack,items,onSelect,contractW,active,onClick}){
  const total = items.reduce((a,x)=>a+x.avg,0);
  const [txt,c,Icon]=risk(total/contractW);
  return <button className={`rackMini ${active?'active':''}`} onClick={onClick}>
    <b>{rack}</b><span>{items.length}대 · {kw(total)}kW</span><em className={c}><Icon size={12}/>{txt}</em>
  </button>
}

function DeviceModal({device,onClose,onMove,racks}){
  if(!device) return null;
  return <div className="modalBackdrop" onClick={onClose}>
    <div className="modal" onClick={(e)=>e.stopPropagation()}>
      <button className="modalClose" onClick={onClose}><X size={18}/></button>
      <div className={`modalHero ${typeClass(device.type)}`}>
        <DeviceArt kind={device.image} imageUrl={device.imageUrl}/>
        <div><h2>{device.brand} {device.model}</h2><p>{device.type} · {device.u}U · {device.rack} / {device.startU}U</p></div>
      </div>
      <div className="modalGrid">
        <div><b>최소 전력</b><span>{device.min}W / {kw(device.min)}kW</span></div>
        <div><b>평균 전력</b><span>{device.avg}W / {kw(device.avg)}kW</span></div>
        <div><b>최대 전력</b><span>{device.max}W / {kw(device.max)}kW</span></div>
        <div><b>A/B 연결</b><span>{device.powerMode || 'Dual'}</span></div>
      </div>
      <div className="moveBox">
        <b>다른 Rack으로 이동</b>
        <div>{racks.map(r=><button key={r} className="outline small" onClick={()=>onMove(device.uid,r)}>{r}</button>)}</div>
      </div>
      <div className="modalNote"><Info size={16}/>전력값은 추정치입니다. 제조사 스펙과 PDU 실측값으로 최종 보정하세요.</div>
    </div>
  </div>
}

function ReportPanel({rackStats, redundancy, thermal, pduWarnings}){
  return <section className="panel report">
    <h2><FileText size={17}/>자동 보고서 요약</h2>
    <div className="reportGrid">
      <div><b>전력 초과 Rack</b><span>{rackStats.filter(x=>x.status==='초과').map(x=>x.rack).join(', ') || '없음'}</span></div>
      <div><b>주의 Rack</b><span>{rackStats.filter(x=>x.status==='주의').map(x=>x.rack).join(', ') || '없음'}</span></div>
      <div><b>이중화 위험</b><span>{redundancy.filter(x=>x.status!=='OK').length}건</span></div>
      <div><b>공기순환/발열</b><span>{thermal.length}건</span></div>
      <div><b>PDU 경고</b><span>{pduWarnings.length}건</span></div>
      <div><b>총 장비</b><span>{rackStats.reduce((a,x)=>a+x.count,0)}대</span></div>
    </div>
  </section>
}

function App(){
  const rackRef=useRef(null), fileRef=useRef(null);
  const [catalog,setCatalog]=useState(BASE_DB);
  const [racks,setRacks]=useState(DEFAULT_RACKS);
  const [activeRack,setActiveRack]=useState('R1');
  const [items,setItems]=useState([]);
  const [query,setQuery]=useState(''), [filter,setFilter]=useState('전체'), [selectedId,setSelectedId]=useState(BASE_DB[0].id);
  const [startU,setStartU]=useState(41), [voltage,setVoltage]=useState(220), [contractKw,setContractKw]=useState(3.3), [pduAmp,setPduAmp]=useState(20);
  const [gap,setGap]=useState(true), [dual,setDual]=useState(true), [modal,setModal]=useState(null), [showRoom,setShowRoom]=useState(true);
  const [ai,setAi]=useState({type:'시스템',u:2,psu:2,cpu:2,gpu:0,disks:8,workload:55});
  const [custom,setCustom]=useState({min:180,avg:350,max:700});

  const filtered=useMemo(()=>catalog.filter(d=>(filter==='전체'||d.type===filter)&&(!query||`${d.brand} ${d.model} ${d.type}`.toLowerCase().includes(query.toLowerCase()))),[catalog,query,filter]);
  const selected=useMemo(()=>catalog.find(d=>d.id===selectedId)||filtered[0]||catalog[0],[catalog,selectedId,filtered]);
  const currentItems=items.filter(x=>x.rack===activeRack);
  const occupied=useMemo(()=>{const s=new Set(); currentItems.forEach(x=>{for(let i=0;i<x.u;i++)s.add(x.startU-i); if(x.gap)s.add(x.startU-x.u)}); return s;},[currentItems]);
  const contractW=Math.max(+contractKw||3.3,0.1)*1000;
  const totals=useMemo(()=>currentItems.reduce((a,x)=>({min:a.min+x.min,avg:a.avg+x.avg,max:a.max+x.max}),{min:0,avg:0,max:0}),[currentItems]);
  const [avgTxt,avgCls,AvgIcon]=risk(totals.avg/contractW);

  const rackStats=useMemo(()=>racks.map(r=>{
    const arr=items.filter(x=>x.rack===r);
    const avg=arr.reduce((a,x)=>a+x.avg,0), max=arr.reduce((a,x)=>a+x.max,0);
    const [status]=risk(avg/contractW);
    const aLoad=arr.reduce((a,x)=>a+(x.powerMode==='B'?0:x.powerMode==='A'?x.avg:(x.avg/2)),0);
    const bLoad=arr.reduce((a,x)=>a+(x.powerMode==='A'?0:x.powerMode==='B'?x.avg:(x.avg/2)),0);
    return {rack:r,count:arr.length,avg,max,status,aLoad,bLoad};
  }),[items,racks,contractW]);

  const redundancy=useMemo(()=>{
    const map=new Map();
    items.forEach(x=>{const k=redundancyKey(x); if(!map.has(k)) map.set(k,[]); map.get(k).push(x);});
    return [...map.entries()].filter(([,arr])=>arr.length>1).map(([key,arr])=>{
      const rackSet=new Set(arr.map(x=>x.rack));
      return {key,count:arr.length,racks:[...rackSet].join(', '),status:rackSet.size>1?'OK':'동일 Rack 위험'};
    });
  },[items]);

  const thermal=useMemo(()=>{
    const warns=[];
    racks.forEach(r=>{
      const arr=items.filter(x=>x.rack===r).sort((a,b)=>b.startU-a.startU);
      for(let i=0;i<arr.length-1;i++){
        const a=arr[i], b=arr[i+1];
        if((a.type==='시스템'||a.type==='스토리지')&&(b.type==='시스템'||b.type==='스토리지') && Math.abs((a.startU-a.u)-b.startU)<=1){
          warns.push(`${r}: 고발열 장비 연속 배치 (${a.model} / ${b.model})`);
        }
      }
      arr.forEach(x=>{
        if((x.type==='시스템'||x.type==='스토리지') && x.startU>30) warns.push(`${r}: ${x.model} 상단 배치 확인`);
        if((x.type==='네트워크'||x.type==='보안') && x.startU<10) warns.push(`${r}: ${x.model} 하단 배치 확인`);
      });
    });
    return [...new Set(warns)];
  },[items,racks]);

  const pduWarnings=useMemo(()=>{
    const limit=(+pduAmp||20)*(+voltage||220);
    return rackStats.flatMap(s=>{
      const w=[];
      if(s.aLoad>limit) w.push(`${s.rack}: A PDU ${amp(s.aLoad,voltage)}A 초과`);
      if(s.bLoad>limit) w.push(`${s.rack}: B PDU ${amp(s.bLoad,voltage)}A 초과`);
      if(s.avg>limit) w.push(`${s.rack}: 장애 시 단일 PDU ${amp(s.avg,voltage)}A 예상`);
      return w;
    });
  },[rackStats,pduAmp,voltage]);

  function canPlace(dev,start,occ){
    for(let i=0;i<dev.u;i++) if(occ.has(start-i)||start-i<1) return false;
    if(gap && occ.has(start-dev.u)) return false;
    return true;
  }

  function findSlot(dev,rack){
    const arr=items.filter(x=>x.rack===rack);
    const occ=new Set();
    arr.forEach(x=>{for(let i=0;i<x.u;i++)occ.add(x.startU-i); if(x.gap) occ.add(x.startU-x.u);});
    let start = (dev.type==='시스템'||dev.type==='스토리지') ? 24 : 41;
    while(start>0 && !canPlace(dev,start,occ)) start--;
    return start-dev.u+1>=1 ? start : null;
  }

  function addDevice(){
    const s=findSlot({...selected,gap},activeRack);
    if(!s){alert('남은 U 공간이 부족합니다.');return;}
    setItems(p=>[...p,{...selected,uid:crypto.randomUUID(),rack:activeRack,startU:s,gap,powerMode:dual?'Dual':'A'}]);
    setStartU(Math.max(1,s-selected.u-(gap?1:0)));
  }

  function autoPlaceAll(){
    const sorted=[...items].sort((a,b)=>{
      const order={'네트워크':1,'보안':2,'스토리지':3,'시스템':4,'기타':5};
      return (order[a.type]||9)-(order[b.type]||9) || b.max-a.max || b.u-a.u;
    });
    const next=[];
    sorted.forEach((dev,idx)=>{
      const targetRack = racks[idx % racks.length];
      const tempItems = [...next];
      let start=null, bestRack=targetRack;
      for(const r of racks){
        const arr=tempItems.filter(x=>x.rack===r);
        const occ=new Set();
        arr.forEach(x=>{for(let i=0;i<x.u;i++)occ.add(x.startU-i); if(x.gap)occ.add(x.startU-x.u);});
        let candidate=(dev.type==='시스템'||dev.type==='스토리지')?24:41;
        while(candidate>0 && !canPlace(dev,candidate,occ)) candidate--;
        if(candidate-dev.u+1>=1){start=candidate; bestRack=r; break;}
      }
      next.push({...dev,rack:bestRack,startU:start||dev.startU});
    });
    setItems(next);
  }

  function moveDevice(uid,rack){
    const dev=items.find(x=>x.uid===uid);
    if(!dev) return;
    const others=items.filter(x=>x.uid!==uid);
    const old=items;
    setItems(others);
    setTimeout(()=>{
      const arr=others.filter(x=>x.rack===rack);
      const occ=new Set();
      arr.forEach(x=>{for(let i=0;i<x.u;i++)occ.add(x.startU-i); if(x.gap) occ.add(x.startU-x.u);});
      let s=(dev.type==='시스템'||dev.type==='스토리지')?24:41;
      while(s>0 && !canPlace(dev,s,occ)) s--;
      if(s-dev.u+1<1){setItems(old); alert('이동할 Rack에 공간이 부족합니다.'); return;}
      setItems([...others,{...dev,rack,startU:s}]); setModal(null);
    },0);
  }

  function addRack(){
    const n = `R${racks.length+1}`;
    setRacks(p=>[...p,n]); setActiveRack(n);
  }

  function importCsv(file){
    if(!file)return;
    Papa.parse(file,{header:true,skipEmptyLines:true,complete:r=>{
      const arr=r.data.map((row,i)=>({id:`csv-${Date.now()}-${i}`,brand:row.brand||row.Brand||'Custom',model:row.model||row.Model||'Device',type:row.type||row.Type||'시스템',u:+(row.u||row.U)||1,min:+(row.min||row.min_w)||0,avg:+(row.avg||row.avg_w)||0,max:+(row.max||row.max_w)||0,image:row.image||'server',imageUrl:row.image_url||row.imageUrl||row.photo||''}));
      setCatalog(p=>[...arr,...p]);
    }});
  }

  function addCustom(e){
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    const d={id:`custom-${Date.now()}`,brand:f.get('brand')||'Custom',model:f.get('model')||'Device',type:f.get('type')||'시스템',u:+f.get('u')||1,min:+f.get('min')||0,avg:+f.get('avg')||0,max:+f.get('max')||0,image:f.get('image')||'server',imageUrl:f.get('imageUrl')||''};
    setCatalog(p=>[d,...p]); setSelectedId(d.id);
  }

  function runAi(){ setCustom(recommendPower(ai)); }

  function saveProject(){
    const data={racks,items,catalog,contractKw,voltage,pduAmp};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    download(blob,'idc-rack-project.json','application/json');
  }
  function loadProject(file){
    if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{try{const d=JSON.parse(reader.result); setRacks(d.racks||DEFAULT_RACKS); setItems(d.items||[]); setCatalog(d.catalog||BASE_DB); setContractKw(d.contractKw||3.3); setVoltage(d.voltage||220); setPduAmp(d.pduAmp||20);}catch{alert('프로젝트 파일을 읽을 수 없습니다.');}};
    reader.readAsText(file);
  }

  function download(content,name,type){const b=content instanceof Blob?content:new Blob([content],{type}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download=name; a.click(); URL.revokeObjectURL(u);}
  function exportCsv(){
    const rows=[...items].sort((a,b)=>a.rack.localeCompare(b.rack)||b.startU-a.startU).map(x=>[x.rack,x.startU,x.u,x.type,x.brand,x.model,x.min,x.avg,x.max,x.powerMode,x.imageUrl||''].map(esc).join(',')).join('\n');
    download(`\ufeffRack,U,Size,Type,Brand,Model,Min W,Avg W,Max W,Power,Image URL\n${rows}`,`idc_room_report.csv`,'text/csv;charset=utf-8');
  }
  async function exportPng(){
    const canvas=await html2canvas(rackRef.current,{scale:2,backgroundColor:'#fff',useCORS:true});
    canvas.toBlob(b=>download(b,`idc_room.png`,'image/png'));
  }
  async function exportPdf(){
    const canvas=await html2canvas(rackRef.current,{scale:2,backgroundColor:'#fff',useCORS:true});
    const pdf=new jsPDF('l','mm','a4'); const img=canvas.toDataURL('image/png'); const w=277,h=canvas.height*w/canvas.width;
    pdf.text('IDC Rack Room Report',10,12); pdf.addImage(img,'PNG',10,18,w,Math.min(h,180));
    pdf.addPage(); pdf.setFontSize(14); pdf.text('Auto Analysis Summary',10,15); pdf.setFontSize(10);
    const lines=[...rackStats.map(s=>`${s.rack}: ${s.count} devices / AVG ${kw(s.avg)}kW / A ${amp(s.aLoad,voltage)}A / B ${amp(s.bLoad,voltage)}A / ${s.status}`),'',...redundancy.map(x=>`Redundancy: ${x.key} / ${x.racks} / ${x.status}`),'',...thermal.map(x=>`Thermal: ${x}`),'',...pduWarnings.map(x=>`PDU: ${x}`)];
    lines.slice(0,38).forEach((l,i)=>pdf.text(l,10,25+i*6));
    pdf.save(`idc_room_report.pdf`);
  }

  const allTotals=items.reduce((a,x)=>({avg:a.avg+x.avg,max:a.max+x.max,min:a.min+x.min}),{avg:0,max:0,min:0});

  return <div className="page">
    <header>
      <div><h1>IDC Rack Power Platform v4</h1><p>멀티랙 · 이중화 분석 · PDU A/B · 공기순환 점검 · 자동 보고서</p></div>
      <div className="actions"><button onClick={exportPng}><ImageIcon size={16}/>PNG</button><button onClick={exportPdf}><Download size={16}/>PDF</button><button className="outline" onClick={exportCsv}><FileText size={16}/>CSV</button><button className="outline" onClick={saveProject}><Save size={16}/>저장</button><label className="uploadBtn"><FolderOpen size={16}/>불러오기<input hidden type="file" accept=".json" onChange={e=>loadProject(e.target.files?.[0])}/></label></div>
    </header>

    <section className="dashboard">
      <Metric label="전체 평균" value={`${kw(allTotals.avg)}kW`} sub={`${amp(allTotals.avg,voltage)}A`}/>
      <Metric label="전체 최대" value={`${kw(allTotals.max)}kW`} sub={`${amp(allTotals.max,voltage)}A`}/>
      <Metric label="장비 수" value={`${items.length}대`} sub={`${racks.length} racks`}/>
      <Metric label="이중화 위험" value={`${redundancy.filter(x=>x.status!=='OK').length}건`} sub="동일 Rack/단일 확인"/>
      <Metric label="열/공기 경고" value={`${thermal.length}건`} sub="배치 점검"/>
      <Metric label="PDU 경고" value={`${pduWarnings.length}건`} sub={`${pduAmp}A 기준`}/>
    </section>

    <main>
      <section className="panel rackPanel">
        <div className="controls"><input value={activeRack} onChange={e=>setActiveRack(e.target.value)}/><label>전압<input type="number" value={voltage} onChange={e=>setVoltage(+e.target.value)}/>V</label><label>계약<input type="number" step="0.1" value={contractKw} onChange={e=>setContractKw(+e.target.value)}/>kW</label><label>PDU<input type="number" value={pduAmp} onChange={e=>setPduAmp(+e.target.value)}/>A</label><label><input type="checkbox" checked={gap} onChange={e=>setGap(e.target.checked)}/>1U 공기층</label></div>

        <div className="rackSwitcher">{racks.map(r=><RackMini key={r} rack={r} active={activeRack===r} items={items.filter(x=>x.rack===r)} contractW={contractW} onClick={()=>setActiveRack(r)}/>)}<button className="addRack" onClick={addRack}><Plus size={16}/>Rack 추가</button></div>
        <div className="rackToolbar"><button className="outline" onClick={autoPlaceAll}><MoveDown size={16}/>전체 Rack 자동 최적 배치 AI</button><button className="outline" onClick={()=>setShowRoom(!showRoom)}><Layers size={16}/>{showRoom?'단일 Rack 보기':'룸 전체 보기'}</button><button className="outline" onClick={()=>setItems([])}><RotateCcw size={16}/>초기화</button></div>

        <div ref={rackRef}>
          {showRoom ? <div className="roomGrid">{racks.map(r=><RackView key={r} rack={r} items={items.filter(x=>x.rack===r)} active={activeRack===r} onClickRack={()=>setActiveRack(r)} onDevice={setModal} rackStats={rackStats.find(s=>s.rack===r)} contractW={contractW}/>)}</div>
          : <RackView rack={activeRack} items={currentItems} active onDevice={setModal} rackStats={rackStats.find(s=>s.rack===activeRack)} contractW={contractW} large/>}
        </div>
      </section>

      <aside>
        <section className="panel"><h2>장비 검색 / 추가</h2><div className="search"><Search size={16}/><input placeholder="DL380, R740, FortiGate..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="chips">{['전체','시스템','네트워크','보안','스토리지','기타'].map(t=><button key={t} className={filter===t?'active':''} onClick={()=>setFilter(t)}>{t}</button>)}</div><select value={selected?.id} onChange={e=>setSelectedId(e.target.value)}>{filtered.map(d=><option key={d.id} value={d.id}>{d.type} · {d.brand} {d.model} · {d.u}U · avg {d.avg}W</option>)}</select><div className="info"><b>{selected.brand} {selected.model}</b><br/>{selected.type} · {selected.u}U · 최소 {selected.min}W / 평균 {selected.avg}W / 최대 {selected.max}W</div><button className="full" onClick={addDevice}><Plus size={16}/>{activeRack}에 추가</button><button className="full outline" onClick={()=>fileRef.current.click()}><Upload size={16}/>CSV 장비 DB 업로드</button><input ref={fileRef} hidden type="file" accept=".csv" onChange={e=>importCsv(e.target.files?.[0])}/></section>

        <section className="panel ai"><h2><Sparkles size={17}/>전력 자동 추천 AI</h2><p className="hint">장비 조건을 넣으면 최소/평균/최대 전력을 추천합니다.</p><div className="formGrid"><label>장비구분<select value={ai.type} onChange={e=>setAi({...ai,type:e.target.value})}><option>시스템</option><option>네트워크</option><option>보안</option><option>스토리지</option><option>기타</option></select></label><label>U<input type="number" value={ai.u} onChange={e=>setAi({...ai,u:e.target.value})}/></label><label>PSU<input type="number" value={ai.psu} onChange={e=>setAi({...ai,psu:e.target.value})}/></label><label>CPU<input type="number" value={ai.cpu} onChange={e=>setAi({...ai,cpu:e.target.value})}/></label><label>GPU<input type="number" value={ai.gpu} onChange={e=>setAi({...ai,gpu:e.target.value})}/></label><label>Disk<input type="number" value={ai.disks} onChange={e=>setAi({...ai,disks:e.target.value})}/></label><label className="wide">부하율 {ai.workload}%<input type="range" min="1" max="100" value={ai.workload} onChange={e=>setAi({...ai,workload:e.target.value})}/></label></div><button className="full magic" onClick={runAi}><Wand2 size={16}/>추천 전력 계산</button><p className="aiResult">추천값: 최소 {custom.min}W / 평균 {custom.avg}W / 최대 {custom.max}W</p></section>

        <section className="panel"><h2><Camera size={17}/>직접 장비 DB 추가</h2><form className="formGrid" onSubmit={addCustom}><input name="brand" placeholder="브랜드"/><input name="model" placeholder="모델명"/><select name="type"><option>시스템</option><option>네트워크</option><option>보안</option><option>스토리지</option><option>기타</option></select><input name="u" type="number" defaultValue={ai.u}/><input name="min" type="number" value={custom.min} onChange={e=>setCustom({...custom,min:+e.target.value})}/><input name="avg" type="number" value={custom.avg} onChange={e=>setCustom({...custom,avg:+e.target.value})}/><input name="max" type="number" value={custom.max} onChange={e=>setCustom({...custom,max:+e.target.value})}/><select name="image"><option value="server">서버</option><option value="switch">스위치</option><option value="firewall">방화벽</option><option value="security">보안</option><option value="storage">스토리지</option></select><input className="wide" name="imageUrl" placeholder="실제 장비 사진 URL (선택)"/><button className="full">DB에 추가</button></form></section>

        <ReportPanel rackStats={rackStats} redundancy={redundancy} thermal={thermal} pduWarnings={pduWarnings}/>

        <section className="panel"><h2><GitBranch size={17}/>이중화 / 위험 분석</h2><div className="analysisList">{redundancy.length?redundancy.map(x=><div className={`analysis ${x.status==='OK'?'ok':'bad'}`} key={x.key}><b>{x.key}</b><span>{x.count}대 · {x.racks} · {x.status}</span></div>):<p className="empty">이중화 후보 없음</p>}{thermal.map(x=><div className="analysis warn" key={x}><b>공기순환</b><span>{x}</span></div>)}{pduWarnings.map(x=><div className="analysis bad" key={x}><b>PDU</b><span>{x}</span></div>)}</div></section>

        <section className="panel"><h2>장비 목록</h2><div className="list">{[...items].sort((a,b)=>a.rack.localeCompare(b.rack)||b.startU-a.startU).map(x=><div className="listItem" key={x.uid} onClick={()=>setModal(x)}><div><b>{x.rack} · {x.startU}U · {x.brand} {x.model}</b><br/><span>{x.type} · {x.u}U · avg {x.avg}W · {x.powerMode}</span></div><button className="delete" onClick={(e)=>{e.stopPropagation();setItems(p=>p.filter(y=>y.uid!==x.uid))}}><Trash2 size={15}/></button></div>)}</div></section>
      </aside>
    </main>

    <DeviceModal device={modal} onClose={()=>setModal(null)} onMove={moveDevice} racks={racks}/>
  </div>
}

function RackView({rack,items,onDevice,onClickRack,active,rackStats,large=false}){
  const [txt,c,Icon]=risk((rackStats?.avg||0)/Math.max((rackStats?.contractW||1),1));
  return <div className={`rackView ${active?'active':''} ${large?'large':''}`} onClick={onClickRack}>
    <div className="rackHead"><b>{rack}</b><em className={c}><Icon size={13}/>{rackStats?.status||txt} · {kw(rackStats?.avg||0)}kW</em></div>
    <div className="rack">
      {Array.from({length:U_COUNT},(_,i)=>{const u=U_COUNT-i, it=items.find(x=>x.startU===u); return <div className="uRow" key={u}><div className="uNum">{u}U</div><div className="uSlot">{it&&<button className={`device ${typeClass(it.type)}${it.u===1?' oneU':''}`} style={{height:`${it.u*ROW_H-2}px`}} onClick={(e)=>{e.stopPropagation();onDevice(it)}}><DeviceArt kind={it.image} imageUrl={it.imageUrl} compact={it.u===1}/><div className="devText"><b>{it.brand} {it.model}</b><small>{it.type} · {it.u}U</small></div><div className="devPower">avg {it.avg}W<br/>max {it.max}W</div></button>}</div></div>})}
    </div>
  </div>
}

createRoot(document.getElementById('root')).render(<App/>);
