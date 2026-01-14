import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Users, Briefcase, Receipt, Wrench, Target, DollarSign, Plus, X, Trash2, Menu, ChevronRight } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// LDS KERNEL CONFIG (embedded)
// ═══════════════════════════════════════════════════════════════════════════
const CONFIG = {"v":1,"id":"tradeos.config.001","m":{"title":"TradeOS Config"},"p":{"t":"config","d":{"theme":{"bg":"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)","glass":"rgba(255,255,255,0.06)","border":"rgba(255,255,255,0.1)","text":"#fff","muted":"rgba(255,255,255,0.6)","accent":"#60a5fa","success":"#34d399","warning":"#fbbf24","error":"#f87171"},"nav":[{"id":"dashboard","label":"Dashboard","icon":"LayoutDashboard"},{"id":"customers","label":"Customers","icon":"Users"},{"id":"jobs","label":"Jobs","icon":"Briefcase"},{"id":"invoices","label":"Invoices","icon":"Receipt"},{"id":"technicians","label":"Techs","icon":"Wrench"},{"id":"leads","label":"Leads","icon":"Target"}],"schemas":{"cust":{"label":"Customer","icon":"Users","fields":[{"k":"type","t":"select","label":"Type","opts":["residential","commercial"],"req":true},{"k":"name","t":"text","label":"Name","req":true},{"k":"phone","t":"tel","label":"Phone","req":true},{"k":"email","t":"email","label":"Email"},{"k":"address","t":"text","label":"Address"},{"k":"tags","t":"text","label":"Tags"},{"k":"notes","t":"textarea","label":"Notes"}],"cols":["name","phone","type"]},"job":{"label":"Job","icon":"Briefcase","fields":[{"k":"number","t":"text","label":"Job #","auto":true},{"k":"status","t":"select","label":"Status","opts":["scheduled","dispatched","in_progress","complete"],"req":true},{"k":"customer","t":"text","label":"Customer","req":true},{"k":"date","t":"date","label":"Date","req":true},{"k":"time","t":"text","label":"Time Window"},{"k":"tech","t":"text","label":"Technician"},{"k":"trade","t":"select","label":"Trade","opts":["hvac","plumbing","electrical","roofing"]},{"k":"description","t":"textarea","label":"Description"},{"k":"priority","t":"select","label":"Priority","opts":["normal","urgent","emergency"]}],"cols":["number","customer","date","status","tech"]},"inv":{"label":"Invoice","icon":"Receipt","fields":[{"k":"number","t":"text","label":"Invoice #","auto":true},{"k":"status","t":"select","label":"Status","opts":["draft","sent","paid","overdue"],"req":true},{"k":"customer","t":"text","label":"Customer","req":true},{"k":"amount","t":"number","label":"Amount","req":true},{"k":"due","t":"date","label":"Due Date"},{"k":"items","t":"textarea","label":"Line Items"}],"cols":["number","customer","amount","status","due"]},"tech":{"label":"Technician","icon":"Wrench","fields":[{"k":"name","t":"text","label":"Name","req":true},{"k":"phone","t":"tel","label":"Phone"},{"k":"email","t":"email","label":"Email"},{"k":"status","t":"select","label":"Status","opts":["available","busy","off"]},{"k":"skills","t":"text","label":"Skills"},{"k":"color","t":"text","label":"Color","default":"#60a5fa"}],"cols":["name","phone","status","skills"],"card":true},"lead":{"label":"Lead","icon":"Target","fields":[{"k":"name","t":"text","label":"Name","req":true},{"k":"phone","t":"tel","label":"Phone"},{"k":"email","t":"email","label":"Email"},{"k":"status","t":"select","label":"Stage","opts":["new","contacted","qualified","proposal","won","lost"],"req":true},{"k":"source","t":"select","label":"Source","opts":["google","referral","website","other"]},{"k":"notes","t":"textarea","label":"Notes"}],"cols":["name","phone","status","source"],"pipeline":true,"pipelineField":"status"}},"kpis":[{"id":"jobs","label":"Today's Jobs","icon":"Briefcase","type":"job","filter":"date=today","agg":"count"},{"id":"inv","label":"Open Invoices","icon":"Receipt","type":"inv","filter":"status!=paid","agg":"count","color":"warning"},{"id":"rev","label":"Revenue","icon":"DollarSign","type":"inv","filter":"status=paid","agg":"sum","field":"amount","color":"success"},{"id":"leads","label":"Active Leads","icon":"Target","type":"lead","filter":"status!=won&status!=lost","agg":"count"}],"seed":{"cust":[{"name":"John Smith","phone":"215-555-0101","email":"john@test.com","type":"residential","address":"123 Main St, Philly PA"},{"name":"ABC Corp","phone":"215-555-0102","email":"info@abc.com","type":"commercial","address":"500 Market St"}],"tech":[{"name":"Mike Rodriguez","phone":"215-555-0201","status":"available","skills":"hvac,electrical","color":"#60a5fa"},{"name":"Tom Wilson","phone":"215-555-0202","status":"available","skills":"plumbing","color":"#34d399"}],"job":[{"number":"JOB-001","status":"scheduled","customer":"John Smith","date":"2026-01-13","time":"9am-12pm","tech":"Mike Rodriguez","trade":"hvac","description":"AC repair"},{"number":"JOB-002","status":"in_progress","customer":"ABC Corp","date":"2026-01-13","time":"1pm-3pm","tech":"Tom Wilson","trade":"plumbing","description":"Bathroom leak"}],"inv":[{"number":"INV-001","status":"sent","customer":"John Smith","amount":450,"due":"2026-01-20"},{"number":"INV-002","status":"paid","customer":"ABC Corp","amount":1200,"due":"2026-01-10"}],"lead":[{"name":"Sarah Davis","phone":"215-555-0301","email":"sarah@email.com","status":"new","source":"google"},{"name":"Bob Miller","phone":"215-555-0302","status":"qualified","source":"referral"}]}}}};
const cfg = CONFIG.p.d;

// ═══════════════════════════════════════════════════════════════════════════
// LDS STORE (IndexedDB CRUD)
// ═══════════════════════════════════════════════════════════════════════════
const LDS = {
  db: null,
  async init() {
    return new Promise((res, rej) => {
      const req = indexedDB.open('TradeOS', 1);
      req.onerror = () => rej(req.error);
      req.onsuccess = () => { this.db = req.result; res(); };
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        ['cust','job','inv','tech','lead'].forEach(s => {
          if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, {keyPath:'id'});
        });
      };
    });
  },
  async getAll(type) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction(type, 'readonly');
      const req = tx.objectStore(type).getAll();
      req.onsuccess = () => res(req.result.map(k => ({id: k.id, ...k.p?.d})));
      req.onerror = () => rej(req.error);
    });
  },
  async save(type, data) {
    const id = data.id || `${type}-${Date.now()}`;
    const kernel = { id, v: 1, t: Date.now(), m: { modified: Date.now() }, p: { t: type, d: {...data, id} } };
    return new Promise((res, rej) => {
      const tx = this.db.transaction(type, 'readwrite');
      const req = tx.objectStore(type).put(kernel);
      req.onsuccess = () => res({id, ...data});
      req.onerror = () => rej(req.error);
    });
  },
  async delete(type, id) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction(type, 'readwrite');
      const req = tx.objectStore(type).delete(id);
      req.onsuccess = () => res();
      req.onerror = () => rej(req.error);
    });
  },
  async seed(seedData) {
    for (const [type, items] of Object.entries(seedData)) {
      const existing = await this.getAll(type);
      if (existing.length === 0) for (const item of items) await this.save(type, item);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES & ICONS
// ═══════════════════════════════════════════════════════════════════════════
const glass = { background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' };
const glassCard = { ...glass, padding: '20px' };
const glassInput = { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '10px 14px', width: '100%', outline: 'none' };
const glassBtn = { background: 'rgba(96,165,250,0.2)', border: '1px solid rgba(96,165,250,0.5)', borderRadius: '8px', color: '#fff', padding: '10px 20px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' };
const Icons = { LayoutDashboard, Users, Briefcase, Receipt, Wrench, Target, DollarSign, Plus, X, Trash2, Menu, ChevronRight };
const Icon = ({ name, size = 20 }) => { const I = Icons[name]; return I ? <I size={size} /> : null; };

// ═══════════════════════════════════════════════════════════════════════════
// BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════
const Background = () => (
  <div style={{ position: 'fixed', inset: 0, background: cfg.theme.bg, zIndex: -1, overflow: 'hidden' }}>
    {[...Array(5)].map((_, i) => (
      <div key={i} style={{ position: 'absolute', width: 300 + i * 100, height: 300 + i * 100, borderRadius: '50%', background: `radial-gradient(circle, ${i % 2 ? 'rgba(96,165,250,0.1)' : 'rgba(52,211,153,0.08)'} 0%, transparent 70%)`, left: `${(i * 25) % 100}%`, top: `${(i * 20) % 100}%`, animation: `float${i} ${20 + i * 5}s ease-in-out infinite` }} />
    ))}
    <style>{`@keyframes float0 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-40px); } }
      @keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-40px,30px); } }
      @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(50px,20px); } }
      @keyframes float3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-30px,-50px); } }
      @keyframes float4 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(40px,40px); } }`}</style>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════
const Sidebar = ({ active, setActive, mobile, setMobile }) => (
  <div style={{ ...glass, width: mobile ? '100%' : 240, height: mobile ? 'auto' : '100vh', padding: '20px', position: mobile ? 'absolute' : 'fixed', top: mobile ? 60 : 0, left: 0, zIndex: 100, display: mobile ? (mobile === 'open' ? 'block' : 'none') : 'block' }}>
    <div style={{ fontSize: 24, fontWeight: 700, color: cfg.theme.accent, marginBottom: 30, display: 'flex', alignItems: 'center', gap: 10 }}>
      <Briefcase /> TradeOS
    </div>
    {cfg.nav.map(n => (
      <div key={n.id} onClick={() => { setActive(n.id); setMobile && setMobile(false); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, marginBottom: 8, cursor: 'pointer', background: active === n.id ? 'rgba(96,165,250,0.2)' : 'transparent', color: active === n.id ? cfg.theme.accent : cfg.theme.muted, transition: 'all 0.2s' }}>
        <Icon name={n.icon} /> {n.label}
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// TOPBAR
// ═══════════════════════════════════════════════════════════════════════════
const TopBar = ({ title, onMenu }) => (
  <div style={{ ...glass, padding: '16px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <button onClick={onMenu} style={{ ...glassBtn, padding: 10, display: window.innerWidth < 768 ? 'flex' : 'none' }}><Menu size={20} /></button>
      <h1 style={{ margin: 0, fontSize: 24, color: cfg.theme.text }}>{title}</h1>
    </div>
    <div style={{ color: cfg.theme.muted, fontSize: 14 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// ENTITY FORM
// ═══════════════════════════════════════════════════════════════════════════
const EntityForm = ({ type, schema, entity, onSave, onClose }) => {
  const [data, setData] = useState(entity || {});
  const handleSubmit = async () => {
    for (const f of schema.fields) if (f.req && !data[f.k]) return alert(`${f.label} is required`);
    if (schema.fields.find(f => f.auto) && !entity) {
      const autoField = schema.fields.find(f => f.auto);
      data[autoField.k] = `${type.toUpperCase()}-${Date.now().toString().slice(-4)}`;
    }
    await LDS.save(type, data);
    onSave();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ ...glassCard, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: cfg.theme.text }}>{entity ? 'Edit' : 'New'} {schema.label}</h2>
          <button onClick={onClose} style={{ ...glassBtn, padding: 8 }}><X size={20} /></button>
        </div>
        {schema.fields.filter(f => !f.auto).map(f => (
          <div key={f.k} style={{ marginBottom: 16 }}>
            <label style={{ color: cfg.theme.muted, fontSize: 12, marginBottom: 6, display: 'block' }}>{f.label}{f.req && ' *'}</label>
            {f.t === 'select' ? (
              <select value={data[f.k] || ''} onChange={e => setData({...data, [f.k]: e.target.value})} style={glassInput}>
                <option value="">Select...</option>
                {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : f.t === 'textarea' ? (
              <textarea value={data[f.k] || ''} onChange={e => setData({...data, [f.k]: e.target.value})} style={{ ...glassInput, minHeight: 80, resize: 'vertical' }} />
            ) : (
              <input type={f.t} value={data[f.k] || ''} onChange={e => setData({...data, [f.k]: f.t === 'number' ? +e.target.value : e.target.value})} style={glassInput} />
            )}
          </div>
        ))}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button onClick={handleSubmit} style={{ ...glassBtn, flex: 1, justifyContent: 'center' }}>Save</button>
          <button onClick={onClose} style={{ ...glassBtn, flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ENTITY LIST
// ═══════════════════════════════════════════════════════════════════════════
const EntityList = ({ type, schema, refresh }) => {
  const [data, setData] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const load = useCallback(async () => setData(await LDS.getAll(type)), [type]);
  useEffect(() => { load(); }, [load, refresh]);
  const handleDelete = async (id) => { if (confirm('Delete this record?')) { await LDS.delete(type, id); load(); } };
  return (
    <div style={glassCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, color: cfg.theme.text, display: 'flex', alignItems: 'center', gap: 10 }}><Icon name={schema.icon} /> {schema.label}s</h3>
        <button onClick={() => { setEditing(null); setShowForm(true); }} style={glassBtn}><Plus size={18} /> Add</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{schema.cols.map(c => <th key={c} style={{ textAlign: 'left', padding: '12px', color: cfg.theme.muted, borderBottom: `1px solid ${cfg.theme.border}`, fontSize: 12, textTransform: 'uppercase' }}>{schema.fields.find(f => f.k === c)?.label || c}</th>)}<th style={{ width: 50 }}></th></tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id} style={{ cursor: 'pointer' }} onClick={() => { setEditing(row); setShowForm(true); }}>
                {schema.cols.map(c => <td key={c} style={{ padding: '12px', color: cfg.theme.text, borderBottom: `1px solid ${cfg.theme.border}` }}>{c === 'amount' ? `$${row[c]?.toLocaleString() || 0}` : row[c] || '-'}</td>)}
                <td style={{ padding: '12px' }}><button onClick={e => { e.stopPropagation(); handleDelete(row.id); }} style={{ background: 'none', border: 'none', color: cfg.theme.error, cursor: 'pointer' }}><Trash2 size={16} /></button></td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={schema.cols.length + 1} style={{ padding: 40, textAlign: 'center', color: cfg.theme.muted }}>No records yet</td></tr>}
          </tbody>
        </table>
      </div>
      {showForm && <EntityForm type={type} schema={schema} entity={editing} onSave={() => { setShowForm(false); load(); }} onClose={() => setShowForm(false)} />}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PIPELINE
// ═══════════════════════════════════════════════════════════════════════════
const Pipeline = ({ type, schema, refresh }) => {
  const [data, setData] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [dragging, setDragging] = useState(null);
  const stages = schema.fields.find(f => f.k === schema.pipelineField)?.opts || [];
  const load = useCallback(async () => setData(await LDS.getAll(type)), [type]);
  useEffect(() => { load(); }, [load, refresh]);
  const handleDrop = async (stage) => {
    if (dragging && dragging[schema.pipelineField] !== stage) {
      await LDS.save(type, { ...dragging, [schema.pipelineField]: stage });
      load();
    }
    setDragging(null);
  };
  const stageColors = { new: cfg.theme.accent, contacted: cfg.theme.warning, qualified: '#a78bfa', proposal: '#f472b6', won: cfg.theme.success, lost: cfg.theme.error };
  return (
    <div style={glassCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, color: cfg.theme.text, display: 'flex', alignItems: 'center', gap: 10 }}><Icon name={schema.icon} /> {schema.label} Pipeline</h3>
        <button onClick={() => { setEditing(null); setShowForm(true); }} style={glassBtn}><Plus size={18} /> Add</button>
      </div>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 10 }}>
        {stages.map(stage => (
          <div key={stage} onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(stage)} style={{ flex: '0 0 200px', minHeight: 300 }}>
            <div style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 12, background: stageColors[stage] || cfg.theme.glass, color: '#fff', fontWeight: 600, textTransform: 'capitalize', fontSize: 13 }}>{stage} ({data.filter(d => d[schema.pipelineField] === stage).length})</div>
            {data.filter(d => d[schema.pipelineField] === stage).map(item => (
              <div key={item.id} draggable onDragStart={() => setDragging(item)} onClick={() => { setEditing(item); setShowForm(true); }} style={{ ...glass, padding: 12, marginBottom: 10, cursor: 'grab', borderLeft: `3px solid ${stageColors[stage] || cfg.theme.accent}` }}>
                <div style={{ fontWeight: 600, color: cfg.theme.text, marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: cfg.theme.muted }}>{item.phone || item.email || '-'}</div>
                {item.source && <div style={{ fontSize: 11, color: cfg.theme.accent, marginTop: 6 }}>{item.source}</div>}
              </div>
            ))}
          </div>
        ))}
      </div>
      {showForm && <EntityForm type={type} schema={schema} entity={editing} onSave={() => { setShowForm(false); load(); }} onClose={() => setShowForm(false)} />}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
const Dashboard = ({ refresh }) => {
  const [kpis, setKpis] = useState({});
  useEffect(() => {
    const loadKpis = async () => {
      const results = {};
      for (const kpi of cfg.kpis) {
        const data = await LDS.getAll(kpi.type);
        let filtered = data;
        if (kpi.filter) {
          kpi.filter.split('&').forEach(f => {
            const [key, val] = f.includes('!=') ? f.split('!=') : f.split('=');
            const isNot = f.includes('!=');
            if (val === 'today') filtered = filtered.filter(d => d[key] === new Date().toISOString().split('T')[0]);
            else filtered = filtered.filter(d => isNot ? d[key] !== val : d[key] === val);
          });
        }
        results[kpi.id] = kpi.agg === 'sum' ? filtered.reduce((s, d) => s + (d[kpi.field] || 0), 0) : filtered.length;
      }
      setKpis(results);
    };
    loadKpis();
  }, [refresh]);
  const kpiColors = { warning: cfg.theme.warning, success: cfg.theme.success, error: cfg.theme.error };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
      {cfg.kpis.map(kpi => (
        <div key={kpi.id} style={glassCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ padding: 10, borderRadius: 10, background: kpiColors[kpi.color] ? `${kpiColors[kpi.color]}20` : 'rgba(96,165,250,0.2)' }}>
              <Icon name={kpi.icon} />
            </div>
            <span style={{ color: cfg.theme.muted, fontSize: 13 }}>{kpi.label}</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: kpiColors[kpi.color] || cfg.theme.text }}>{kpi.agg === 'sum' ? `$${(kpis[kpi.id] || 0).toLocaleString()}` : kpis[kpi.id] || 0}</div>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState('dashboard');
  const [mobile, setMobile] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => { LDS.init().then(() => LDS.seed(cfg.seed)).then(() => setReady(true)); }, []);
  useEffect(() => { const check = () => setMobile(window.innerWidth < 768 ? false : false); check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check); }, []);
  if (!ready) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: cfg.theme.bg, color: cfg.theme.text }}><div style={{ ...glassCard, textAlign: 'center' }}><Briefcase size={40} style={{ marginBottom: 16 }} /><div>Loading TradeOS...</div></div></div>;
  const typeMap = { customers: 'cust', jobs: 'job', invoices: 'inv', technicians: 'tech', leads: 'lead' };
  const type = typeMap[active];
  const schema = cfg.schemas[type];
  const titles = { dashboard: 'Dashboard', customers: 'Customers', jobs: 'Jobs', invoices: 'Invoices', technicians: 'Technicians', leads: 'Lead Pipeline' };
  return (
    <div style={{ minHeight: '100vh', color: cfg.theme.text }}>
      <Background />
      <Sidebar active={active} setActive={setActive} mobile={mobile} setMobile={setMobile} />
      <div style={{ marginLeft: window.innerWidth >= 768 ? 280 : 0, padding: 24 }}>
        <TopBar title={titles[active]} onMenu={() => setMobile(mobile === 'open' ? false : 'open')} />
        {active === 'dashboard' && <><Dashboard refresh={refresh} /><EntityList type="job" schema={cfg.schemas.job} refresh={refresh} /></>}
        {active === 'leads' && schema?.pipeline ? <Pipeline type={type} schema={schema} refresh={refresh} /> : null}
        {type && !schema?.pipeline && active !== 'dashboard' && <EntityList type={type} schema={schema} refresh={refresh} />}
      </div>
    </div>
  );
}
