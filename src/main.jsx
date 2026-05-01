import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Download, FileText, Image as ImageIcon, Plus, Search, Server, Shield,
  Network, Database, Trash2, Upload, Zap, AlertTriangle, CheckCircle2,
  RotateCcw, Smartphone
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import './style.css';

const U_COUNT = 42;
const ROW_HEIGHT = 24;

const DEFAULT_CATALOG = [
  // Servers
  ['시스템','Dell','PowerEdge R640',1,120,280,550,'server'],
  ['시스템','Dell','PowerEdge R740',2,180,400,750,'server'],
  ['시스템','Dell','PowerEdge R750',2,220,450,850,'server'],
  ['시스템','Dell','PowerEdge R760',2,240,500,950,'server'],
  ['시스템','Dell','PowerEdge R660xs',1,80,120,250,'server'],
  ['시스템','HPE','DL360 Gen10',1,120,250,500,'server'],
  ['시스템','HPE','DL380 Gen9',2,160,320,650,'server'],
  ['시스템','HPE','DL380 Gen10',2,180,350,700,'server'],
  ['시스템','HPE','DL380 Gen11',2,220,450,850,'server'],
  ['시스템','HPE','DL120 Gen9',1,90,180,300,'server'],
  ['시스템','Lenovo','SR650',2,200,420,780,'server'],
  ['시스템','Lenovo','SR650 V3',2,200,450,850,'server'],
  ['시스템','Lenovo','HX650 V3',2,300,700,1100,'server'],
  ['시스템','Supermicro','Generic 1U Server',1,90,180,350,'server'],
  ['시스템','Supermicro','Generic 2U Server',2,160,320,650,'server'],
  ['시스템','Cisco','UCS C220 M5',1,140,280,550,'server'],
  ['시스템','Cisco','UCS C240 M5',2,200,420,850,'server'],
  ['시스템','Fujitsu','PRIMERGY RX2540',2,180,360,700,'server'],
  ['시스템','IBM','Power S924',4,500,1200,2000,'server'],
  ['시스템','Oracle','X8-2 Server',1,150,350,650,'server'],

  // Storage
  ['스토리지','HPE','3PAR 8000',2,350,700,1200,'storage'],
  ['스토리지','HPE','3PAR 8200',2,400,800,1300,'storage'],
  ['스토리지','HPE','3PAR 8440',2,450,900,1500,'storage'],
  ['스토리지','HPE','Alletra 6000',2,350,700,1200,'storage'],
  ['스토리지','Dell EMC','Unity XT 480',2,300,600,1100,'storage'],
  ['스토리지','Dell EMC','PowerStore 500T',2,350,750,1300,'storage'],
  ['스토리지','Dell EMC','PowerVault ME5024',2,200,500,900,'storage'],
  ['스토리지','NetApp','AFF A250',2,250,500,900,'storage'],
  ['스토리지','NetApp','AFF A400',2,350,650,1200,'storage'],
  ['스토리지','NetApp','AFF A700',8,900,1800,3000,'storage'],
  ['스토리지','Pure Storage','FlashArray X50',3,300,700,1300,'storage'],
  ['스토리지','Pure Storage','FlashArray X70',3,400,850,1500,'storage'],
  ['스토리지','IBM','FlashSystem 5200',1,200,450,800,'storage'],
  ['스토리지','Brocade','SN3000B SAN Switch',1,50,100,180,'switch'],
  ['스토리지','Brocade','G620 SAN Switch',1,120,250,450,'switch'],

  // Network
  ['네트워크','Cisco','Catalyst C9200L-24T-4X',1,50,100,180,'switch'],
  ['네트워크','Cisco','Catalyst C9300-48T',1,80,180,350,'switch'],
  ['네트워크','Cisco','Nexus 93180YC-FX',1,180,350,650,'switch'],
  ['네트워크','Cisco','Nexus 9336C-FX2',1,250,500,900,'switch'],
  ['네트워크','Cisco','ASR 1001-X',1,150,300,550,'switch'],
  ['네트워크','Arista','7050X3',1,120,250,400,'switch'],
  ['네트워크','Arista','720DT',1,40,70,120,'switch'],
  ['네트워크','Arista','7280R3',1,240,450,800,'switch'],
  ['네트워크','Juniper','QFX5120-48Y',1,150,300,500,'switch'],
  ['네트워크','Juniper','EX4650',1,120,250,450,'switch'],
  ['네트워크','Juniper','5110',1,90,180,300,'switch'],
  ['네트워크','HPE','5710',1,60,120,240,'switch'],
  ['네트워크','HPE','5520 24G',1,60,120,220,'switch'],
  ['네트워크','Alcatel','OS6900-X24C2',1,90,180,300,'switch'],
  ['네트워크','Alcatel','OS6900-X48C6',1,60,100,220,'switch'],
  ['네트워크','Ubiquoss','P3624FG',1,30,60,120,'switch'],
  ['네트워크','PIOLINK','K3200 L4',1,80,160,300,'switch'],
  ['네트워크','Alteon','5208 L4',1,80,150,280,'switch'],
  ['네트워크','Cisco','C8200L Router',1,60,120,240,'switch'],
  ['네트워크','Cisco','1921 Router',1,30,55,90,'switch'],
  ['네트워크','Cisco','2621 Router',1,30,55,90,'switch'],

  // Security
  ['보안','Fortinet','FortiGate 100F',1,40,80,150,'firewall'],
  ['보안','Fortinet','FortiGate 200F',1,60,120,250,'firewall'],
  ['보안','Fortinet','FortiGate 600F',1,130,260,500,'firewall'],
  ['보안','Palo Alto','PA-3220',1,90,180,350,'firewall'],
  ['보안','Palo Alto','PA-5250',3,300,650,1000,'firewall'],
  ['보안','Palo Alto','PA-3410',1,120,250,450,'firewall'],
  ['보안','Check Point','Quantum 6600',1,120,250,450,'firewall'],
  ['보안','AXGATE','4000',2,90,180,320,'firewall'],
  ['보안','AXGATE','7000',2,90,180,350,'firewall'],
  ['보안','AXGATE','1300S',1,40,80,160,'firewall'],
  ['보안','AXGATE','TMS 2000',1,40,80,160,'security'],
  ['보안','WAPPLES','2600',2,90,180,300,'security'],
  ['보안','Sniper','one 5000',2,100,180,320,'security'],
  ['보안','AhnLab','EMS 2000A',1,60,120,200,'security'],
  ['보안','SECUI','BLUEMAX NGF 100',1,60,120,240,'firewall'],
  ['보안','F5','BIG-IP i4600',1,180,350,650,'security'],
  ['보안','A10','Thunder 3040S',1,160,320,600,'security'],
].map((x, i) => ({
  id: `default-${i}`,
  type: x[0], brand: x[1], model: x[2], u: x[3],
  min: x[4], avg: x[5], max: x[6], image: x[7],
}));

const typeClass = {
  시스템: 'system',
  네트워크: 'network',
  보안: 'security',
  스토리지: 'storage',
  기타: 'etc',
};

function kw(w) { return (w / 1000).toFixed(2); }
function amp(w, v) { return (w / Math.max(Number(v) || 220, 1)).toFixed(1); }
function risk(rate) {
  if (rate > 1) return { label: '초과', className: 'danger', icon: AlertTriangle };
  if (rate >= 0.85) return { label: '주의', className: 'warning', icon: AlertTriangle };
  return { label: '안전', className: 'safe', icon: CheckCircle2 };
}
function escapeCsv(value) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function DeviceArt({ kind }) {
  if (kind === 'switch') {
    return <div className="device-art switch-art"><div className="ports">{Array.from({ length: 20 }).map((_, i) => <i key={i}/>)}</div></div>;
  }
  if (kind === 'firewall') return <div className="device-art firewall-art"><Shield size={22}/></div>;
  if (kind === 'security') return <div className="device-art security-art"><Shield size={22}/></div>;
  if (kind === 'storage') {
    return <div className="device-art storage-art"><div className="bays">{Array.from({ length: 8 }).map((_, i) => <i key={i}/>)}</div></div>;
  }
  return <div className="device-art server-art"><Server size={22}/></div>;
}

function Metric({ label, value, sub }) {
  return <div className="metric"><span>{label}</span><b>{value}</b><small>{sub}</small></div>;
}
function PowerBar({ label, rate }) {
  const r = risk(rate);
  return (
    <div className="bar-block">
      <div className="bar-label"><span>{label}</span><b>{(rate * 100).toFixed(1)}%</b></div>
      <div className="bar"><div className={r.className} style={{ width: `${Math.min(rate * 100, 100)}%` }}/></div>
    </div>
  );
}

function App() {
  const rackRef = useRef(null);
  const fileRef = useRef(null);
  const [catalog, setCatalog] = useState(DEFAULT_CATALOG);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('전체');
  const [selectedId, setSelectedId] = useState(DEFAULT_CATALOG[0].id);
  const [startU, setStartU] = useState(41);
  const [rackName, setRackName] = useState('RACK-01');
  const [voltage, setVoltage] = useState(220);
  const [contractKw, setContractKw] = useState(3.3);
  const [gapAfter, setGapAfter] = useState(true);
  const [dualPower, setDualPower] = useState(true);

  const filteredCatalog = useMemo(() => {
    const q = query.toLowerCase().trim();
    return catalog.filter(d => {
      const typeOk = typeFilter === '전체' || d.type === typeFilter;
      const qOk = !q || `${d.brand} ${d.model} ${d.type}`.toLowerCase().includes(q);
      return typeOk && qOk;
    });
  }, [catalog, query, typeFilter]);

  const selected = useMemo(
    () => catalog.find(d => d.id === selectedId) || filteredCatalog[0] || catalog[0],
    [catalog, selectedId, filteredCatalog]
  );

  const occupied = useMemo(() => {
    const set = new Set();
    items.forEach(item => {
      for (let i = 0; i < item.u; i++) set.add(item.startU - i);
      if (item.gapAfter) set.add(item.startU - item.u);
    });
    return set;
  }, [items]);

  const totals = useMemo(() => items.reduce((a, x) => ({
    min: a.min + x.min, avg: a.avg + x.avg, max: a.max + x.max
  }), { min: 0, avg: 0, max: 0 }), [items]);

  const contractW = Math.max(Number(contractKw) || 3.3, 0.1) * 1000;
  const avgRisk = risk(totals.avg / contractW);
  const maxRisk = risk(totals.max / contractW);
  const AvgIcon = avgRisk.icon;

  const redundancy = useMemo(() => {
    const groups = new Map();
    items.forEach(item => {
      const key = `${item.brand} ${item.model}`.replace(/#\s*[12]|_[12]|-A|-B|-M/gi, '').trim();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    return [...groups.entries()].filter(([, arr]) => arr.length > 1);
  }, [items]);

  function addDevice() {
    if (!selected) return;
    let start = Number(startU) || 41;
    while (start > 0) {
      let ok = true;
      for (let i = 0; i < selected.u; i++) {
        if (occupied.has(start - i) || start - i < 1) ok = false;
      }
      if (gapAfter && occupied.has(start - selected.u)) ok = false;
      if (ok) break;
      start -= 1;
    }
    if (start - selected.u + 1 < 1) {
      alert('남은 U 공간이 부족합니다.');
      return;
    }
    setItems(prev => [...prev, { ...selected, uid: crypto.randomUUID(), startU: start, gapAfter }]);
    setStartU(Math.max(1, start - selected.u - (gapAfter ? 1 : 0)));
  }

  function removeDevice(uid) {
    setItems(prev => prev.filter(x => x.uid !== uid));
  }

  function addCustomDevice(form) {
    const data = new FormData(form);
    const device = {
      id: `custom-${Date.now()}`,
      type: data.get('type') || '시스템',
      brand: data.get('brand') || 'Custom',
      model: data.get('model') || 'Device',
      u: Number(data.get('u')) || 1,
      min: Number(data.get('min')) || 0,
      avg: Number(data.get('avg')) || 0,
      max: Number(data.get('max')) || 0,
      image: data.get('image') || 'server',
    };
    setCatalog(prev => [device, ...prev]);
    setSelectedId(device.id);
    form.reset();
  }

  function importCsv(file) {
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: result => {
        const parsed = result.data.map((row, i) => ({
          id: `csv-${Date.now()}-${i}`,
          brand: row.brand || row.Brand || 'Custom',
          model: row.model || row.Model || 'Device',
          type: row.type || row.Type || '시스템',
          u: Number(row.u || row.U) || 1,
          min: Number(row.min || row.min_w || row.Min) || 0,
          avg: Number(row.avg || row.avg_w || row.Avg) || 0,
          max: Number(row.max || row.max_w || row.Max) || 0,
          image: row.image || row.Image || 'server',
        }));
        setCatalog(prev => [...parsed, ...prev]);
      }
    });
  }

  function exportCsv() {
    const header = ['U','Size','Type','Brand','Model','Min W','Avg W','Max W'];
    const rows = [...items].sort((a,b) => b.startU - a.startU).map(x => [
      x.startU, x.u, x.type, x.brand, x.model, x.min, x.avg, x.max
    ].map(escapeCsv).join(','));
    const csv = `\ufeffRack,${escapeCsv(rackName)}\nVoltage,${voltage}\nContract kW,${contractKw}\n\n${header.join(',')}\n${rows.join('\n')}\n\nTotal Min,${totals.min}\nTotal Avg,${totals.avg}\nTotal Max,${totals.max}`;
    downloadBlob(csv, `${rackName}_power_report.csv`, 'text/csv;charset=utf-8');
  }

  async function exportPng() {
    if (!rackRef.current) return;
    const canvas = await html2canvas(rackRef.current, { scale: 2, backgroundColor: '#ffffff' });
    canvas.toBlob(blob => downloadBlob(blob, `${rackName}_rack.png`, 'image/png'));
  }

  async function exportPdf() {
    if (!rackRef.current) return;
    const canvas = await html2canvas(rackRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = 190;
    const height = (canvas.height * width) / canvas.width;
    pdf.setFontSize(16);
    pdf.text(rackName, 10, 12);
    pdf.addImage(img, 'PNG', 10, 18, width, Math.min(height, 270));
    pdf.save(`${rackName}_rack_report.pdf`);
  }

  function downloadBlob(content, filename, type) {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  const normalA = dualPower ? totals.avg / 2 : totals.avg;
  const normalB = dualPower ? totals.avg / 2 : 0;
  const failoverA = totals.avg;
  const failoverB = totals.avg;

  return (
    <div className="page">
      <header className="hero">
        <div>
          <h1>IDC Rack Power Platform</h1>
          <p>전세계 장비 DB 확장 · 42U 랙 시각화 · 전력 계산 · A/B 전원 · 보고서 출력</p>
        </div>
        <div className="hero-actions">
          <button onClick={exportPng}><ImageIcon size={16}/>PNG</button>
          <button onClick={exportPdf}><Download size={16}/>PDF</button>
          <button className="outline" onClick={exportCsv}><FileText size={16}/>CSV</button>
        </div>
      </header>

      <main className="layout">
        <section className="panel rack-panel">
          <div className="controls">
            <input value={rackName} onChange={e => setRackName(e.target.value)} />
            <label>전압 <input type="number" value={voltage} onChange={e => setVoltage(Number(e.target.value))}/>V</label>
            <label>계약 <input type="number" step="0.1" value={contractKw} onChange={e => setContractKw(Number(e.target.value))}/>kW</label>
            <label><input type="checkbox" checked={gapAfter} onChange={e => setGapAfter(e.target.checked)}/>1U 공기층</label>
            <label><input type="checkbox" checked={dualPower} onChange={e => setDualPower(e.target.checked)}/>듀얼파워</label>
          </div>

          <div className="legend">
            <span><i className="system-bg"/>시스템</span>
            <span><i className="network-bg"/>네트워크</span>
            <span><i className="security-bg"/>보안</span>
            <span><i className="storage-bg"/>스토리지</span>
            <span><i className="etc-bg"/>기타</span>
          </div>

          <div className="rack-wrap" ref={rackRef}>
            <div className="rack-head">
              <strong>{rackName}</strong>
              <span className={`status ${avgRisk.className}`}><AvgIcon size={14}/>평균 {avgRisk.label}</span>
            </div>
            <div className="rack">
              {Array.from({ length: U_COUNT }, (_, i) => {
                const u = U_COUNT - i;
                const startItem = items.find(x => x.startU === u);
                return (
                  <div key={u} className="u-row">
                    <div className="u-num">{u}U</div>
                    <div className="u-slot">
                      {startItem && (
                        <div className={`device ${typeClass[startItem.type] || 'etc'}`} style={{ height: `${startItem.u * ROW_HEIGHT - 2}px` }}>
                          <DeviceArt kind={startItem.image}/>
                          <div className="device-text">
                            <b>{startItem.brand} {startItem.model}</b>
                            <small>{startItem.type} · {startItem.u}U</small>
                          </div>
                          <div className="device-power">avg {startItem.avg}W<br/>max {startItem.max}W</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="side">
          <section className="panel">
            <div className="section-title">장비 검색 / 추가</div>
            <div className="search"><Search size={16}/><input placeholder="DL380, R740, FortiGate..." value={query} onChange={e => setQuery(e.target.value)}/></div>
            <div className="chips">
              {['전체','시스템','네트워크','보안','스토리지','기타'].map(t => (
                <button key={t} className={typeFilter === t ? 'active' : ''} onClick={() => setTypeFilter(t)}>{t}</button>
              ))}
            </div>
            <select value={selected?.id} onChange={e => setSelectedId(e.target.value)}>
              {filteredCatalog.map(d => <option key={d.id} value={d.id}>{d.type} · {d.brand} {d.model} · {d.u}U · avg {d.avg}W</option>)}
            </select>
            {selected && <div className="info"><b>{selected.brand} {selected.model}</b><br/>{selected.type} · {selected.u}U · 최소 {selected.min}W / 평균 {selected.avg}W / 최대 {selected.max}W</div>}
            <label className="inline">시작 U <input type="number" min="1" max="41" value={startU} onChange={e => setStartU(Number(e.target.value))}/></label>
            <button className="full" onClick={addDevice}><Plus size={16}/>랙에 추가</button>
            <button className="full outline" onClick={() => fileRef.current?.click()}><Upload size={16}/>CSV 장비 DB 업로드</button>
            <input ref={fileRef} type="file" accept=".csv" hidden onChange={e => importCsv(e.target.files?.[0])}/>
          </section>

          <section className="panel">
            <div className="section-title">전력 / A·B 전원</div>
            <div className="metrics">
              <Metric label="최소" value={`${kw(totals.min)}kW`} sub={`${amp(totals.min, voltage)}A`}/>
              <Metric label="평균" value={`${kw(totals.avg)}kW`} sub={`${amp(totals.avg, voltage)}A`}/>
              <Metric label="최대" value={`${kw(totals.max)}kW`} sub={`${amp(totals.max, voltage)}A`}/>
            </div>
            <PowerBar label="평균 사용률" rate={totals.avg / contractW}/>
            <PowerBar label="최대 사용률" rate={totals.max / contractW}/>
            <div className="ab-grid">
              <div><b>A 전원</b><br/>평상시 {kw(normalA)}kW / {amp(normalA, voltage)}A<br/>장애시 {kw(failoverA)}kW / {amp(failoverA, voltage)}A</div>
              <div><b>B 전원</b><br/>평상시 {kw(normalB)}kW / {amp(normalB, voltage)}A<br/>장애시 {kw(failoverB)}kW / {amp(failoverB, voltage)}A</div>
            </div>
          </section>

          <section className="panel">
            <div className="section-title">직접 장비 DB 추가</div>
            <form className="custom-form" onSubmit={e => { e.preventDefault(); addCustomDevice(e.currentTarget); }}>
              <input name="brand" placeholder="브랜드"/>
              <input name="model" placeholder="모델명"/>
              <select name="type"><option>시스템</option><option>네트워크</option><option>보안</option><option>스토리지</option><option>기타</option></select>
              <input name="u" type="number" placeholder="U"/>
              <input name="min" type="number" placeholder="최소 W"/>
              <input name="avg" type="number" placeholder="평균 W"/>
              <input name="max" type="number" placeholder="최대 W"/>
              <select name="image"><option value="server">서버</option><option value="switch">스위치</option><option value="firewall">방화벽</option><option value="security">보안</option><option value="storage">스토리지</option></select>
              <button className="full" type="submit">DB에 추가</button>
            </form>
          </section>

          <section className="panel">
            <div className="list-head">
              <div className="section-title">장비 목록</div>
              <button className="outline small" onClick={() => setItems([])}><RotateCcw size={14}/>초기화</button>
            </div>
            <div className="device-list">
              {[...items].sort((a,b) => b.startU - a.startU).map(x => (
                <div key={x.uid} className="list-item">
                  <div><b>{x.startU}U · {x.brand} {x.model}</b><br/><span>{x.type} · {x.u}U · avg {x.avg}W · max {x.max}W</span></div>
                  <button className="delete" onClick={() => removeDevice(x.uid)}><Trash2 size={15}/></button>
                </div>
              ))}
              {items.length === 0 && <p className="empty">아직 추가된 장비가 없습니다.</p>}
            </div>
            {redundancy.length > 0 && <div className="info"><b>자동 이중화 후보</b><br/>{redundancy.map(([k, arr]) => `${k} (${arr.length})`).join(' / ')}</div>}
          </section>
        </aside>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App/>);
