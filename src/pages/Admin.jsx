import React,{useState,useEffect}from'react';
import{BarChart3,Box,FolderTree,Layers,Palette,Receipt,Settings,ShoppingBag,LogOut,MessageCircle}from'lucide-react';
import{BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer}from'recharts';
import{useApp}from'../contexts/AppContext';
import { LeepLogo } from '../components/LeepLogo';

const menu=[
  ['dashboard','Dashboard',BarChart3],
  ['pedidos','Pedidos',ShoppingBag],
  ['categorias','Categorías',FolderTree],
  ['subcategorias','Subcategorías',Layers],
  ['productos','Productos',Box],
  ['colores','Colores',Palette],
  ['producto_colores','Colores x producto',Layers],
  ['producto_caracteristicas','Características',Layers],
  ['ventas','Facturación',Receipt],
  ['config','Configuración',Settings]
];

export default function Admin(){
  const[auth,setAuth]=useState(localStorage.getItem('adminAuth')==='1');
  const[tab,setTab]=useState('dashboard');

  if(!auth)return <Login onOk={()=>{localStorage.setItem('adminAuth','1');setAuth(true)}}/>;

  return <div className="admin"><aside className="sidebar"><h2>Backoffice</h2><div className="brandBlock"><div className="logoWrapper"><LeepLogo width={28} height={28} /></div><div><strong>Leep Import</strong><small>S.R.L.</small></div></div>{menu.map(([id,t,Icon])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><Icon size={18}/>{t}</button>)}<button onClick={()=>{localStorage.removeItem('adminAuth');setAuth(false)}}><LogOut size={18}/>Salir</button></aside><main className="adminMain">{tab==='dashboard'&&<Dashboard/>}{tab==='pedidos'&&<Pedidos/>}{tab==='categorias'&&<Crud tipo="categorias"/>}{tab==='subcategorias'&&<Crud tipo="subcategorias"/>}{tab==='productos'&&<Productos/>}{tab==='colores'&&<Colores/>}{tab==='producto_colores'&&<ProductoColores/>}{tab==='producto_caracteristicas'&&<ProductoCaracteristicas/>}{tab==='ventas'&&<Ventas/>}{tab==='config'&&<Config/>}</main></div>;
}

function Login({onOk}){
  const[u,setU]=useState('admin');
  const[p,setP]=useState('123456');
  const[e,setE]=useState('');

  function go(ev){
    ev.preventDefault();
    if(u==='admin'&&p==='123456')onOk();
    else setE('Usuario o clave incorrectos');
  }

  return <div className="login"><form onSubmit={go} className="panel loginBox"><div className="logoPulse" style={{ width: '64px', height: '64px', margin: '0 auto 20px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px', boxShadow: '0 8px 25px rgba(0,0,0,0.05)' }}><LeepLogo width={40} height={40} /></div><h1>Leep Import Admin</h1><input value={u} onChange={e=>setU(e.target.value)} placeholder="Usuario"/><input type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="Clave"/>{e&&<p className="error">{e}</p>}<button className="primary">Entrar</button></form></div>;
}

function Dashboard(){
  const a=useApp();
  const total=a.pedidos.length;
  const pend=a.pedidos.filter(p=>p.estado==='PENDIENTE_PRESUPUESTAR').length;
  const ven=a.pedidos.filter(p=>p.estado==='VENTA_CONCRETADA');
  const monto=ven.reduce((s,p)=>s+(Number(p.total_final)||0),0);
  const chart=['PENDIENTE_PRESUPUESTAR','PRESUPUESTADO','FINALIZADO','VENTA_CONCRETADA','CANCELADO'].map(e=>({estado:e.replaceAll('_',' '),cantidad:a.pedidos.filter(p=>p.estado===e).length}));

  return <><h1>Dashboard</h1><section className="kpis"><K t="Pedidos" v={total}/><K t="Pendientes" v={pend}/><K t="Ventas concretadas" v={ven.length}/><K t="Total vendido" v={'$ '+monto.toLocaleString('es-AR')}/></section><section className="charts"><div className="card"><h3>Pedidos por estado</h3><ResponsiveContainer width="100%" height={260}><BarChart data={chart}><XAxis dataKey="estado" hide/><YAxis/><Tooltip/><Bar dataKey="cantidad" radius={[10,10,0,0]}/></BarChart></ResponsiveContainer></div><div className="card"><h3>Últimos pedidos</h3>{a.pedidos.slice(0,6).map(p=><div className="row" key={p.id_pedido}><b>{p.codigo_pedido}</b><span className={'status '+p.estado}>{p.estado}</span></div>)}</div></section></>;
}

function K({t,v}){return <div className="kpi"><small>{t}</small><strong>{v}</strong></div>;
}

function Pedidos(){
  const a=useApp();
  const[sel,setSel]=useState(null);
  const detalles=sel?a.detallePedidos.filter(d=>d.id_pedido===sel.id_pedido):[];

  async function removePedido(p){
    if(!window.confirm(`¿Eliminar pedido ${p.codigo_pedido}? Esta acción no se puede revertir.`))return;
    await a.deletePedido(p.id_pedido);
    if(sel?.id_pedido===p.id_pedido) setSel(null);
  }

  return <><h1>Pedidos / Presupuestos</h1><div className="table">{a.pedidos.map(p=><div className="tr" key={p.id_pedido}><b>{p.codigo_pedido}</b><span>{p.nombre_cliente}</span><span>{p.telefono_cliente}</span><span className={'status '+p.estado}>{p.estado}</span><span>$ {Number(p.total_final||0).toLocaleString('es-AR')}</span><div><button onClick={()=>setSel(p)}>Presupuestar</button><button onClick={()=>removePedido(p)}>Eliminar</button></div></div>)}</div>{sel&&<Presupuestador p={sel} detalles={detalles} onClose={()=>setSel(null)}/>}</>;
}

function Presupuestador({p,detalles,onClose}){
  const a=useApp();
  const[estado,setEstado]=useState(p.estado);
  const[items,setItems]=useState([]);

  useEffect(()=>{
    if(detalles&&detalles.length){
      setItems(detalles.map(d=>({
        id_detalle_pedido:d.id_detalle_pedido,
        producto:d.nombre_producto,
        color:d.nombre_color,
        cantidad:d.cantidad,
        precio:d.precio_unitario_presupuestado||d.precio_base_original||0,
        subtotal:(d.precio_unitario_presupuestado||d.precio_base_original||0)*d.cantidad
      })));
    }
  },[detalles]);

  const handlePrecioChange=(idx,val)=>{
    setItems(prev=>prev.map((l,i)=>{
      if(i!==idx)return l;
      const p=Math.max(0,val);
      return{...l,precio:p,subtotal:p*l.cantidad};
    }));
  };

  const total=items.reduce((s,i)=>s+i.subtotal,0);

  const formattedTotal=Math.round(total).toLocaleString('es-AR');
  const sep="━━━━━━━━━━━━━━━━━━━━━";
  const itemsText=items.map((i,idx)=>{
    const formattedSub=Math.round(i.subtotal).toLocaleString('es-AR');
    const formattedUnit=Math.round(i.precio).toLocaleString('es-AR');
    return `📦 *${idx+1}. ${i.producto}*\n` +
           (i.color?`   • *Color:* ${i.color}\n`:'') +
           `   • *Cantidad:* ${i.cantidad} u.  x  $ ${formattedUnit}\n` +
           `   • *Subtotal:* $ ${formattedSub}`;
  }).join('\n\n');

  const msg=`💼 *LEEP IMPORTACIONES - PRESUPUESTO VALIDADO*\n${sep}\n` +
            `📑 *Presupuesto:* \`${p.codigo_pedido}\`\n` +
            `👤 *Cliente:* ${p.nombre_cliente}\n${sep}\n\n` +
            `Hola ${p.nombre_cliente}, a continuación te enviamos el presupuesto formal detallado:\n\n` +
            `${itemsText}\n\n` +
            `${sep}\n` +
            `💰 *TOTAL FINAL:* $ ${formattedTotal}\n` +
            `${sep}\n\n` +
            `✨ _Los precios están sujetos a cambios. Por favor, confírmanos la aceptación de este presupuesto para proceder. ¡Muchas gracias!_`;

  async function saveEstado(){
    await a.guardarPresupuestoCompleto(p.id_pedido,estado,items,total,msg);
    onClose();
  }

  async function removePedido(){
    if(!window.confirm(`¿Eliminar pedido ${p.codigo_pedido}? Se borrarán sus detalles y no se podrá recuperar.`))return;
    await a.deletePedido(p.id_pedido);
    onClose();
  }

  const getFieldFromObs = (obs, fieldName) => {
    if (!obs) return '';
    const regex = new RegExp(`${fieldName}:\\s*(.*)`, 'i');
    const match = obs.match(regex);
    return match ? match[1].trim() : '';
  };
  
  const email = p.email_cliente || getFieldFromObs(p.observaciones_cliente, 'Email');
  const direccion = p.direccion_cliente || getFieldFromObs(p.observaciones_cliente, 'Dirección');
  const localidad = p.localidad_cliente || getFieldFromObs(p.observaciones_cliente, 'Localidad');
  const provincia = p.provincia_cliente || getFieldFromObs(p.observaciones_cliente, 'Provincia');

  return (
    <div className="modal">
      <div className="panel wide">
        <h2>Presupuestador {p.codigo_pedido}</h2>
        <div className="customerInfo">
          <div><strong>Cliente</strong><p>{p.nombre_cliente}</p></div>
          <div><strong>Celular</strong><p>{p.telefono_cliente}</p></div>
          <div><strong>Email</strong><p>{email||'-'}</p></div>
          <div><strong>Dirección</strong><p>{direccion||'-'}</p></div>
          <div><strong>Localidad</strong><p>{localidad||'-'}</p></div>
          <div><strong>Provincia</strong><p>{provincia||'-'}</p></div>
          {p.observaciones_cliente&&<div className="fullWidth"><strong>Observaciones</strong><p>{p.observaciones_cliente}</p></div>}
        </div>
        
        <label style={{ display: 'block', margin: '20px 0 12px 0', fontWeight: '600' }}>
          Estado del Presupuesto
          <select value={estado} onChange={e=>setEstado(e.target.value)} style={{ marginTop: '6px' }}>
            <option value="PENDIENTE_PRESUPUESTAR">PENDIENTE_PRESUPUESTAR</option>
            <option value="PRESUPUESTADO">PRESUPUESTADO</option>
            <option value="FINALIZADO">FINALIZADO</option>
            <option value="VENTA_CONCRETADA">VENTA_CONCRETADA</option>
            <option value="CANCELADO">CANCELADO</option>
          </select>
        </label>
        
        <div style={{ margin: '20px 0 10px 0', fontSize: '0.95rem', fontWeight: 'bold' }}>Productos a Presupuestar (Ajusta los precios unitarios libremente):</div>
        {items.length > 0 ? (
          items.map((it, idx) => (
            <div className="budgetLine" key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr 1fr', gap: '10px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(15,23,42,0.05)' }}>
              <span style={{ fontWeight: '500' }}>{it.producto}</span>
              <span style={{ opacity: 0.7 }}>{it.color||'-'}</span>
              <span>{it.cantidad} u.</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                $ 
                <input 
                  type="number" 
                  value={it.precio} 
                  onChange={e => handlePrecioChange(idx, +e.target.value)} 
                  style={{ width: '85px', padding: '4px 6px', border: '1px solid rgba(15,23,42,0.12)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', background: 'var(--card-bg)' }}
                />
              </span>
              <span style={{ fontWeight: 'bold', textAlign: 'right' }}>$ {Math.round(it.subtotal).toLocaleString('es-AR')}</span>
            </div>
          ))
        ) : (
          <p className="muted">No hay detalles disponibles para este pedido.</p>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', margin: '24px 0 16px 0', borderTop: '1px solid rgba(15,23,42,0.1)', paddingTop: '16px' }}>
          <h2 style={{ margin: '0' }}>Total Presupuestado: $ {Math.round(total).toLocaleString('es-AR')}</h2>
        </div>
        
        <label style={{ display: 'block', margin: '16px 0 10px 0', fontWeight: '600' }}>Vista previa del mensaje a enviar por WhatsApp:</label>
        <textarea readOnly value={msg} style={{ width: '100%', height: '140px', fontSize: '0.88rem', fontFamily: 'monospace', padding: '10px', borderRadius: '8px', border: '1px solid rgba(15,23,42,0.12)', background: 'rgba(15,23,42,0.02)', resize: 'vertical' }}/>
        
        <div className="actions" style={{ marginTop: '20px' }}>
          <button onClick={onClose}>Cerrar</button>
          <button className="danger" onClick={removePedido}>Eliminar pedido</button>
          <button className="primary" onClick={saveEstado}>Guardar presupuesto</button>
          <button className="primary" onClick={()=>window.open(`https://wa.me/${p.telefono_cliente}?text=${encodeURIComponent(msg)}`,'_blank')}><MessageCircle size={16}/> WhatsApp</button>
        </div>
      </div>
    </div>
  );
}

function Crud({tipo}){
  const a=useApp();
  const isCategorias=tipo==='categorias';
  const items=isCategorias?a.categorias:a.subcategorias;
  const [activeItem,setActiveItem]=useState(null);
  const [form,setForm]=useState(isCategorias?{nombre:'',descripcion:'',orden_visual:0,activo:true}:{nombre:'',id_categoria:0,orden_visual:0,activo:true});

  const reset=()=>setForm(isCategorias?{nombre:'',descripcion:'',orden_visual:0,activo:true}:{nombre:'',id_categoria:a.categorias[0]?.id_categoria||0,orden_visual:0,activo:true});

  useEffect(()=>{if(!isCategorias&&a.categorias.length&&form.id_categoria===0){setForm(prev=>({...prev,id_categoria:a.categorias[0].id_categoria}))}},[isCategorias,a.categorias,form.id_categoria]);

  function edit(item){setActiveItem(item);setForm({...item});}

  async function remove(item){
    if(!window.confirm(`¿Eliminar ${isCategorias?'categoría':'subcategoría'} ${item.nombre}? Se eliminarán productos y datos relacionados.`))return;
    if(isCategorias){
      await a.deleteCategoria(item.id_categoria);
    }else{
      await a.deleteSubcategoria(item.id_subcategoria);
    }
    if(activeItem?.[isCategorias?'id_categoria':'id_subcategoria']===item[isCategorias?'id_categoria':'id_subcategoria']){
      setActiveItem(null);
      reset();
    }
  }

  async function save(ev){
    ev.preventDefault();
    try{
      if(isCategorias){await a.saveCategoria(form)}
      else{await a.saveSubcategoria(form)}
      reset();
      setActiveItem(null);
    }catch{}
  }

  return <><h1>{isCategorias?'Categorías':'Subcategorías'}</h1><p className="muted">Administra {isCategorias?'categorías':'subcategorías'} con alta, edición y cambio de estado activo/inactivo.</p><div className="adminGrid"><div className="card"><h3>{activeItem?'Editar':'Nueva'} {isCategorias?'categoría':'subcategoría'}</h3><form onSubmit={save} className="formStack"><label>Nombre<input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} required/></label>{isCategorias&&<label>Descripción<textarea value={form.descripcion||''} onChange={e=>setForm({...form,descripcion:e.target.value})}/></label>}{!isCategorias&&<label>Categoría<select value={form.id_categoria} onChange={e=>setForm({...form,id_categoria:+e.target.value})}>{a.categorias.map(c=><option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}</select></label>}<label>Orden visual<input type="number" value={form.orden_visual||0} onChange={e=>setForm({...form,orden_visual:+e.target.value})}/></label><label>Activo<select value={form.activo?1:0} onChange={e=>setForm({...form,activo:e.target.value==='1'})}><option value={1}>Sí</option><option value={0}>No</option></select></label><div className="actions"><button type="submit" className="primary">Guardar</button><button type="button" onClick={()=>{reset();setActiveItem(null)}}>Limpiar</button></div></form></div><div className="card"><h3>Lista</h3><div className="table"><div className="tr header"><span>Nombre</span><span>{isCategorias?'Descripción':'Categoría'}</span><span>Estado</span><span>Acciones</span></div>{items.map(item=><div className="tr" key={item.id_categoria||item.id_subcategoria}><b>{item.nombre}</b><span>{isCategorias?item.descripcion:a.getCat(item.id_categoria)}</span><span>{item.activo!==false?'Activo':'Inactivo'}</span><span><button onClick={()=>edit(item)}>Editar</button><button onClick={()=>isCategorias?a.toggleCategoria(item.id_categoria,item.activo===false):a.toggleSubcategoria(item.id_subcategoria,item.activo===false)}>{item.activo!==false?'Desactivar':'Activar'}</button><button onClick={()=>remove(item)}>Eliminar</button></span></div>)}</div></div></div></>;
}

function Productos(){
  const a=useApp();
  const defaultForm={id_producto:null,nombre:'',descripcion:'',detalle_manual:'',foto_url:'',precio_base:0,id_categoria:a.categorias[0]?.id_categoria||0,id_subcategoria:a.subcategorias[0]?.id_subcategoria||0,usa_colores:true,producto_destacado:false,activo:true};
  const [active,setActive]=useState(null);
  const [form,setForm]=useState(defaultForm);

  useEffect(()=>{
    if(!active){
      setForm(prev=>({
        ...prev,
        id_categoria:a.categorias[0]?.id_categoria||prev.id_categoria,
        id_subcategoria:a.subcategorias[0]?.id_subcategoria||prev.id_subcategoria
      }));
    }
  },[a.categorias,a.subcategorias,active]);

  function edit(p){
    setActive(p);
    setForm({...p});
  }

  async function remove(p){
    if(!window.confirm(`¿Eliminar producto ${p.nombre}? Se eliminarán sus colores y características asociados.`))return;
    await a.deleteProducto(p.id_producto);
    if(active?.id_producto===p.id_producto){
      setActive(null);
      setForm(defaultForm);
    }
  }

  async function save(ev){
    ev.preventDefault();
    try{
      await a.saveProducto(form);
      setActive(null);
      setForm(defaultForm);
    }catch{}
  }

  return <><h1>Productos</h1><div className="adminGrid"><div className="card"><h3>{active?'Editar producto':'Nuevo producto'}</h3><form onSubmit={save} className="formStack"><label>Nombre<input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} required/></label><label>Descripción<textarea value={form.descripcion||''} onChange={e=>setForm({...form,descripcion:e.target.value})}/></label><label>Detalle<input value={form.detalle_manual||''} onChange={e=>setForm({...form,detalle_manual:e.target.value})}/></label><label>Foto URL<input value={form.foto_url||''} onChange={e=>setForm({...form,foto_url:e.target.value})}/></label><label>Categoría<select value={form.id_categoria} onChange={e=>setForm({...form,id_categoria:+e.target.value})}>{a.categorias.map(c=><option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}</select></label><label>Subcategoría<select value={form.id_subcategoria} onChange={e=>setForm({...form,id_subcategoria:+e.target.value})}>{a.subcategorias.map(s=><option key={s.id_subcategoria} value={s.id_subcategoria}>{s.nombre}</option>)}</select></label><label>Precio<input type="number" value={form.precio_base||0} onChange={e=>setForm({...form,precio_base:+e.target.value})}/></label><label>Usa colores<select value={form.usa_colores?1:0} onChange={e=>setForm({...form,usa_colores:e.target.value==='1'})}><option value={1}>Sí</option><option value={0}>No</option></select></label><label>Destacado<select value={form.producto_destacado?1:0} onChange={e=>setForm({...form,producto_destacado:e.target.value==='1'})}><option value={1}>Sí</option><option value={0}>No</option></select></label><label>Activo<select value={form.activo?1:0} onChange={e=>setForm({...form,activo:e.target.value==='1'})}><option value={1}>Sí</option><option value={0}>No</option></select></label><div className="actions"><button type="submit" className="primary">Guardar</button><button type="button" onClick={()=>{setActive(null);setForm(defaultForm)}}>Limpiar</button></div></form></div><div className="card"><h3>Productos registrados</h3><div className="table"><div className="tr header"><span>Nombre</span><span>Categoría</span><span>Subcategoría</span><span>Precio</span><span>Activo</span><span>Acciones</span></div>{a.productos.map(p=><div className="tr" key={p.id_producto}><b>{p.nombre}</b><span>{a.getCat(p.id_categoria)}</span><span>{a.getSub(p.id_subcategoria)}</span><span>$ {p.precio_base}</span><span>{p.activo!==false?'Sí':'No'}</span><span><button onClick={()=>edit(p)}>Editar</button><button onClick={()=>a.toggleProducto(p.id_producto,p.activo===false)}>{p.activo!==false?'Desactivar':'Activar'}</button><button onClick={()=>remove(p)}>Eliminar</button></span></div>)}</div></div></div></>;
}

function Colores(){
  const a=useApp();
  const [active,setActive]=useState(null);
  const [form,setForm]=useState({id_color:null,nombre:'',codigo_hex:'#ffffff',activo:true});

  function edit(c){
    setActive(c);
    setForm({...c});
  }

  async function remove(c){
    if(!window.confirm(`¿Eliminar color ${c.nombre}? Se eliminarán sus asignaciones de color por producto.`))return;
    await a.deleteColor(c.id_color);
    if(active?.id_color===c.id_color){
      setActive(null);
      setForm({id_color:null,nombre:'',codigo_hex:'#ffffff',activo:true});
    }
  }

  async function save(ev){
    ev.preventDefault();
    try{
      await a.saveColor(form);
      setActive(null);
      setForm({id_color:null,nombre:'',codigo_hex:'#ffffff',activo:true});
    }catch{}
  }

  return <><h1>Colores</h1><p className="muted">Administra los colores globales del catálogo escolar y librería, asignando códigos hexadecimales y nombres descriptivos.</p><div className="adminGrid"><div className="card"><h3>{active?'Editar color':'Nuevo color'}</h3><form onSubmit={save} className="formStack"><label>Nombre del Color<input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Ej. Azul LEEP" required/></label><label>Selección de Color & HEX<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><input type="color" value={form.codigo_hex || '#ffffff'} onChange={e=>setForm({...form,codigo_hex:e.target.value})} style={{ width: '45px', height: '42px', padding: '0', border: '1px solid rgba(15,23,42,0.1)', borderRadius: '8px', cursor: 'pointer', background: 'none' }} /><input value={form.codigo_hex} onChange={e=>setForm({...form,codigo_hex:e.target.value})} placeholder="#ffffff" required style={{ flex: 1 }} /></div></label><label>Activo<select value={form.activo?1:0} onChange={e=>setForm({...form,activo:e.target.value==='1'})}><option value={1}>Sí</option><option value={0}>No</option></select></label><div className="actions"><button type="submit" className="primary">Guardar</button><button type="button" onClick={()=>{setActive(null);setForm({id_color:null,nombre:'',codigo_hex:'#ffffff',activo:true})}}>Limpiar</button></div></form></div><div className="card"><h3>Paleta de colores</h3><div className="colorAdmin">{a.colores.map(c=><div className="colorBox" key={c.id_color}><i style={{background:c.codigo_hex}}/><div><b>{c.nombre}</b><small>{c.codigo_hex}</small></div><div className="colorActions"><button onClick={()=>edit(c)}>Editar</button><button onClick={()=>a.toggleColor(c.id_color,c.activo===false)}>{c.activo!==false?'Desactivar':'Activar'}</button><button onClick={()=>remove(c)}>Eliminar</button></div></div>)}</div></div></div></>;
}

function ProductoColores(){
  const a=useApp();
  const defaultForm={id_producto_color:null,id_producto:a.productos[0]?.id_producto||0,id_color:a.colores[0]?.id_color||0,precio_base_color:0,stock_referencial:0,activo:true};
  const [active,setActive]=useState(null);
  const [form,setForm]=useState(defaultForm);

  useEffect(()=>{
    if(!active){
      setForm(prev=>({
        ...prev,
        id_producto:a.productos[0]?.id_producto||prev.id_producto,
        id_color:a.colores[0]?.id_color||prev.id_color
      }));
    }
  },[a.productos,a.colores,active]);

  function edit(item){
    setActive(item);
    setForm({...item});
  }

  async function remove(item){
    if(!window.confirm(`¿Eliminar color por producto ${a.getProduct(item.id_producto)} - ${a.getColor(item.id_color)?.nombre || ''}?`))return;
    await a.deleteProductoColor(item.id_producto_color);
    if(active?.id_producto_color===item.id_producto_color){
      setActive(null);
      setForm(defaultForm);
    }
  }

  async function save(ev){
    ev.preventDefault();
    try{
      await a.saveProductoColor(form);
      setActive(null);
      setForm(defaultForm);
    }catch{}
  }

  return <><h1>Colores por producto</h1><p className="muted">Asigna colores a productos, controla precio por color, stock referencial y estado.</p><div className="adminGrid"><div className="card"><h3>{active?'Editar asignación':'Nueva asignación'}</h3><form onSubmit={save} className="formStack"><label>Producto<select value={form.id_producto} onChange={e=>setForm({...form,id_producto:+e.target.value})}>{a.productos.map(p=><option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>)}</select></label><label>Color<select value={form.id_color} onChange={e=>setForm({...form,id_color:+e.target.value})}>{a.colores.map(c=><option key={c.id_color} value={c.id_color}>{c.nombre}</option>)}</select></label><label>Precio por color<input type="number" value={form.precio_base_color||0} onChange={e=>setForm({...form,precio_base_color:+e.target.value})}/></label><label>Stock referencial<input type="number" value={form.stock_referencial||0} onChange={e=>setForm({...form,stock_referencial:+e.target.value})}/></label><label>Activo<select value={form.activo?1:0} onChange={e=>setForm({...form,activo:e.target.value==='1'})}><option value={1}>Sí</option><option value={0}>No</option></select></label><div className="actions"><button type="submit" className="primary">Guardar</button><button type="button" onClick={()=>{setActive(null);setForm(defaultForm)}}>Limpiar</button></div></form></div><div className="card"><h3>Asignaciones</h3><div className="table"><div className="tr header"><span>Producto</span><span>Color</span><span>Precio</span><span>Stock</span><span>Estado</span><span>Acciones</span></div>{a.productoColores.map(item=><div className="tr" key={item.id_producto_color}><b>{a.getProduct(item.id_producto)}</b><span>{a.getColor(item.id_color)?.nombre||''}</span><span>$ {item.precio_base_color||0}</span><span>{item.stock_referencial||0}</span><span>{item.activo!==false?'Activo':'Inactivo'}</span><span><button onClick={()=>edit(item)}>Editar</button><button onClick={()=>a.toggleProductoColor(item.id_producto_color,item.activo===false)}>{item.activo!==false?'Desactivar':'Activar'}</button><button onClick={()=>remove(item)}>Eliminar</button></span></div>)}</div></div></div></>;
}

function ProductoCaracteristicas(){
  const a=useApp();
  const defaultForm={id_caracteristica:null,id_producto:a.productos[0]?.id_producto||0,nombre:'',valor:'',orden_visual:0,activo:true};
  const [active,setActive]=useState(null);
  const [form,setForm]=useState(defaultForm);

  useEffect(()=>{
    if(!active){
      setForm(prev=>({
        ...prev,
        id_producto:a.productos[0]?.id_producto||prev.id_producto
      }));
    }
  },[a.productos,active]);

  function edit(item){
    setActive(item);
    setForm({...item});
  }

  async function remove(item){
    if(!window.confirm(`¿Eliminar característica ${item.nombre}?`))return;
    await a.deleteProductoCaracteristica(item.id_caracteristica);
    if(active?.id_caracteristica===item.id_caracteristica){
      setActive(null);
      setForm(defaultForm);
    }
  }

  async function save(ev){
    ev.preventDefault();
    try{
      await a.saveProductoCaracteristica(form);
      setActive(null);
      setForm(defaultForm);
    }catch{}
  }

  return <><h1>Características de producto</h1><p className="muted">Administra atributos por producto con orden visual y estado activo.</p><div className="adminGrid"><div className="card"><h3>{active?'Editar característica':'Nueva característica'}</h3><form onSubmit={save} className="formStack"><label>Producto<select value={form.id_producto} onChange={e=>setForm({...form,id_producto:+e.target.value})}>{a.productos.map(p=><option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>)}</select></label><label>Nombre<input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} required/></label><label>Valor<input value={form.valor} onChange={e=>setForm({...form,valor:e.target.value})} required/></label><label>Orden visual<input type="number" value={form.orden_visual||0} onChange={e=>setForm({...form,orden_visual:+e.target.value})}/></label><label>Activo<select value={form.activo?1:0} onChange={e=>setForm({...form,activo:e.target.value==='1'})}><option value={1}>Sí</option><option value={0}>No</option></select></label><div className="actions"><button type="submit" className="primary">Guardar</button><button type="button" onClick={()=>{setActive(null);setForm(defaultForm)}}>Limpiar</button></div></form></div><div className="card"><h3>Características registradas</h3><div className="table"><div className="tr header"><span>Producto</span><span>Nombre</span><span>Valor</span><span>Orden</span><span>Estado</span><span>Acciones</span></div>{a.productoCaracteristicas.map(item=><div className="tr" key={item.id_caracteristica}><b>{a.getProduct(item.id_producto)}</b><span>{item.nombre}</span><span>{item.valor}</span><span>{item.orden_visual}</span><span>{item.activo!==false?'Activo':'Inactivo'}</span><span><button onClick={()=>edit(item)}>Editar</button><button onClick={()=>a.toggleProductoCaracteristica(item.id_caracteristica,item.activo===false)}>{item.activo!==false?'Desactivar':'Activar'}</button><button onClick={()=>remove(item)}>Eliminar</button></span></div>)}</div></div></div></>;
}

function Ventas(){
  const a=useApp();
  const ventas=a.pedidos.filter(p=>p.estado==='VENTA_CONCRETADA');

  async function removeVenta(p){
    if(!window.confirm(`¿Eliminar venta ${p.codigo_pedido}?`))return;
    await a.deletePedido(p.id_pedido);
  }

  return <><h1>Facturación / Ventas</h1><section className="kpis"><K t="Ventas" v={ventas.length}/><K t="Total" v={'$ '+ventas.reduce((s,p)=>s+(+p.total_final||0),0).toLocaleString('es-AR')}/><K t="Ticket promedio" v={'$ '+Math.round(ventas.reduce((s,p)=>s+(+p.total_final||0),0)/(ventas.length||1)).toLocaleString('es-AR')}/></section><div className="card"><h3>Ventas recientes</h3>{ventas.length===0?<p className="muted">No hay ventas concretadas.</p>:<div className="table"><div className="tr header"><span>Código</span><span>Cliente</span><span>Total</span><span>Fecha</span><span>Acciones</span></div>{ventas.map(p=><div className="tr" key={p.id_pedido}><b>{p.codigo_pedido}</b><span>{p.nombre_cliente}</span><span>$ {(+p.total_final||0).toLocaleString('es-AR')}</span><span>{new Date(p.fecha_alta).toLocaleDateString('es-AR')}</span><span><button onClick={()=>removeVenta(p)}>Eliminar</button></span></div>)}</div>}</div></>;
}

function Config(){
  return <><h1>Configuración</h1><div className="card"><p>Login demo: admin / 123456. Preparado para migrar a Supabase Auth, roles y permisos.</p></div></>;
}
