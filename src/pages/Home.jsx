import React, { useMemo, useState, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, Send, CheckCircle, Info, Sparkles, Layers, Box, Phone } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { LeepLogo } from '../components/LeepLogo';

export default function Home() {
  const a = useApp();
  const [cat, setCat] = useState('');
  const [sub, setSub] = useState('');
  const [q, setQ] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Mouse reactive cursor-glow tracking
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const categorias = a.categorias.filter(c => c.activo !== false);
  const subcategorias = a.subcategorias.filter(s => s.activo !== false && (!cat || s.id_categoria == cat));
  const productos = useMemo(
    () => a.productos.filter(
      p => p.activo !== false && (!cat || p.id_categoria == cat) && (!sub || p.id_subcategoria == sub) && p.nombre.toLowerCase().includes(q.toLowerCase())
    ),
    [a.productos, cat, sub, q]
  );

  return (
    <div 
      className="public cinematic-theme" 
      style={{ '--mouse-x': `${coords.x}px`, '--mouse-y': `${coords.y}px` }}
    >
      {/* Light spotlight following cursor */}
      <div className="cursor-glow" />

      <header className="hero">
        <nav>
          <a href="/" className="brandLogo">
            <div className="logoWrapper">
              <LeepLogo width={34} height={34} />
            </div>
            <div>
              <strong>Leep Import</strong>
              <small>Presupuestos</small>
            </div>
          </a>
          
          <button 
            type="button" 
            className="secondary" 
            onClick={() => setCartOpen(true)}
            style={{ position: 'relative' }}
          >
            <ShoppingCart size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span>Ver pedido</span>
            {a.cart.length > 0 && (
              <span style={{
                background: 'var(--accent-purple)',
                color: '#fff',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: '900',
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                boxShadow: '0 0 8px var(--accent-purple)'
              }}>
                {a.cart.length}
              </span>
            )}
          </button>
        </nav>

        <div className="heroGrid">
          <div className="heroInfo">
            <span className="pill">
              <Sparkles size={12} /> TECNOLOGÍA EN PRESUPUESTOS V4.1
            </span>
            <h1>
              Solicitá tu presupuesto <br />
              <span className="highlight-gradient">en segundos</span>
            </h1>
            <p>
              Explorá nuestro catálogo premium de artículos escolares, librería mayorista y manualidades. 
              Personalizá colores, seleccioná cantidades y enviá tu cotización directo por WhatsApp al instante.
            </p>

            {/* Bento Grid panel instructions */}
            <div className="heroPanel">
              <div className="heroPanelItem">
                <strong>1</strong>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800' }}>Explorá el Catálogo</h4>
                <p>Navegá entre categorías dinámicas con filtros inteligentes de alta velocidad.</p>
              </div>
              <div className="heroPanelItem">
                <strong>2</strong>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800' }}>Configurá Colores</h4>
                <p>Seleccioná variantes específicas de color y cantidades en tiempo real.</p>
              </div>
              <div className="heroPanelItem">
                <strong>3</strong>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800' }}>WhatsApp Instant</h4>
                <p>Tu orden se procesa y se envía formateada con todos los datos con 1 clic.</p>
              </div>
            </div>

            <div className="heroButtonGroup">
              <button 
                type="button" 
                className="primary" 
                onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explorar Catálogo <Layers size={16} />
              </button>
              <button type="button" className="secondary" onClick={() => setCartOpen(true)}>
                Revisar Pedido ({a.cart.length})
              </button>
            </div>
          </div>

          <div className="heroSide">
            {/* Immersive Cyberpunk Mascot Hologram */}
            <div className="mascot-hologram">
              <div className="hologram-circle" />
              
              <div className="hologram-core">
                <div className="hologram-eyes" />
                <div className="hologram-wave">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              
              <div className="hologram-status">
                <span className="status-dot" />
                <span className="status-text">LEEP BOT-01 · ONLINE</span>
              </div>

              <div style={{
                marginTop: '18px',
                textAlign: 'center',
                zIndex: 2,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '12px',
                borderRadius: '16px',
                border: '1px solid rgba(15, 23, 42, 0.05)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
              }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.25rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {a.productos.filter(p => p.activo !== false).length}
                  </strong>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Artículos</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.25rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>
                    {categorias.length}
                  </strong>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Rubros</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.25rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-pink)' }}>
                    {a.cart.length}
                  </strong>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Pedido</span>
                </div>
              </div>
              <div className="hologram-glow" />
            </div>
          </div>
        </div>
      </header>

      <main className="container" id="productos" style={{ position: 'relative', zIndex: 2 }}>
        
        {/* Bento Search and Category filter panel */}
        <section className="shopHeader">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Filtros de Catálogo</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Búsqueda reactiva de productos e insumos mayoristas</p>
            </div>
            
            <div className="searchBar" style={{ width: '100%', maxWidth: '350px' }}>
              <Search size={18} />
              <input 
                placeholder="Buscar producto por nombre..." 
                value={q} 
                onChange={e => setQ(e.target.value)}
              />
            </div>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 800 }}>
              Categoría Principal
            </span>
            <div className="categoryBar">
              <button type="button" className={!cat ? 'active' : ''} onClick={() => { setCat(''); setSub(''); }}>
                Todas las categorías
              </button>
              {categorias.map(c => (
                <button 
                  key={c.id_categoria} 
                  type="button" 
                  className={cat == c.id_categoria ? 'active' : ''} 
                  onClick={() => { setCat(c.id_categoria); setSub(''); }}
                >
                  {c.nombre}
                </button>
              ))}
            </div>
          </div>

          {cat && subcategorias.length > 0 && (
            <div>
              <span style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 800 }}>
                Subcategoría / Subrubro
              </span>
              <div className="subCategoryBar">
                <button type="button" className={!sub ? 'active' : ''} onClick={() => setSub('')}>
                  Todas las subcategorías
                </button>
                {subcategorias.map(s => (
                  <button 
                    key={s.id_subcategoria} 
                    type="button" 
                    className={sub == s.id_subcategoria ? 'active' : ''} 
                    onClick={() => setSub(s.id_subcategoria)}
                  >
                    {s.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Product Cards Listing */}
        <section className="gridProducts">
          {productos.map(p => <ProductCard key={p.id_producto} p={p} />)}
        </section>

        {productos.length === 0 && (
          <div className="emptyState">
            <Info size={36} style={{ color: 'var(--accent-purple)', marginBottom: '14px', animation: 'floatMascot 2s infinite' }} />
            <h3>No se encontraron productos</h3>
            <p style={{ marginTop: '6px', fontSize: '0.9rem', color: '#64748b' }}>
              No hay coincidencias con los filtros activos. Intentá buscar otro término o cambiar de rubro.
            </p>
          </div>
        )}
      </main>

      {/* Floating cart button */}
      {a.cart.length > 0 && (
        <button className="floatingCart" type="button" onClick={() => setCartOpen(true)}>
          <ShoppingCart size={18} /> 
          <span>Ver pedido ({a.cart.length})</span>
        </button>
      )}

      {/* Modals */}
      {cartOpen && (
        <CartModal 
          onClose={() => setCartOpen(false)} 
          onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} 
        />
      )}
      
      {checkoutOpen && (
        <Checkout onClose={() => setCheckoutOpen(false)} />
      )}    
    </div>
  );
}

function ProductCard({ p }) {
  const a = useApp();
  const colors = a.coloresProducto(p.id_producto);
  const [selectedColorId, setSelectedColorId] = useState(colors[0]?.id_color || null);
  const [qty, setQty] = useState(1);

  useEffect(() => { 
    setSelectedColorId(colors[0]?.id_color || null); 
  }, [p.id_producto]);

  const selectedColor = colors.find(c => c.id_color === selectedColorId) || colors[0] || null;
  const productoColor = selectedColor ? a.getProductoColor(p.id_producto, selectedColor.id_color) : null;
  const precio = productoColor?.precio_base_color ?? p.precio_base;
  const caracteristicas = a.getProductoCaracteristicas(p.id_producto);

  return (
    <article className="product">
      <div className="image-container">
        <span className="product-badge">
          {p.producto_destacado ? 'Destacado' : 'Original'}
        </span>
        <img src={p.foto_url || 'https://via.placeholder.com/300x240'} alt={p.nombre} />
      </div>

      <div className="productBody">
        <small>{a.getCat(p.id_categoria)} / {a.getSub(p.id_subcategoria)}</small>
        <h3>{p.nombre}</h3>
        <p>{p.descripcion}</p>

        {caracteristicas.length > 0 && (
          <ul className="productFeatures">
            {caracteristicas.slice(0, 4).map(c => (
              <li key={c.id_caracteristica}>
                <span>{c.nombre}</span>
                <strong>{c.valor}</strong>
              </li>
            ))}
          </ul>
        )}

        {p.usa_colores && colors.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <span style={{ display: 'block', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 800 }}>
              Variante de Color
            </span>
            <div className="colorList">
              {colors.map(c => (
                <button 
                  key={c.id_color} 
                  type="button" 
                  className={selectedColorId === c.id_color ? 'sel' : ''} 
                  onClick={() => setSelectedColorId(c.id_color)}
                >
                  <i style={{ background: c.codigo_hex }} /> {c.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>
              Precio Base
            </span>
            <p className="price">
              {precio.toLocaleString('es-AR')}
            </p>
          </div>

          <div className="qty">
            <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}>
              <Minus size={14} />
            </button>
            <b>{qty}</b>
            <button type="button" onClick={() => setQty(qty + 1)}>
              <Plus size={14} />
            </button>
          </div>
        </div>

        <button 
          type="button" 
          className="primary" 
          onClick={() => {
            a.addCart(p, p.usa_colores ? selectedColor : null, qty, precio);
          }}
          style={{ marginTop: '16px' }}
        >
          Agregar al pedido <ShoppingCart size={16} />
        </button>
      </div>
    </article>
  );
}

function CartModal({ onClose, onCheckout }) {
  const a = useApp();
  const total = a.cart.reduce((sum, i) => sum + (i.precio_base || 0) * i.cantidad, 0);

  return (
    <div className="modal">
      <div className="cartModal">
        <div className="cartModalHeader">
          <div>
            <h2>Tu Solicitud</h2>
            <p>Revisá los artículos del presupuesto antes de enviar.</p>
          </div>
          <button type="button" className="secondary" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '10px' }}>
            Cerrar
          </button>
        </div>

        {a.cart.length === 0 ? (
          <div className="emptyState" style={{ margin: '24px 28px' }}>
            <ShoppingCart size={32} style={{ color: 'var(--accent-purple)', marginBottom: '10px' }} />
            <h3>No tenés productos cargados</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '4px', color: '#64748b' }}>
              Agregá productos desde el catálogo para generar tu cotización.
            </p>
          </div>
        ) : (
          <>
            <div className="cartModalContent">
              {a.cart.map(item => (
                <div className="cartModalItem" key={item.key}>
                  <div style={{ flex: 1, paddingRight: '14px' }}>
                    <strong>{item.producto}</strong>
                    <small>{item.color ? `Color: ${item.color}` : 'Sin variantes'} · Cantidad: {item.cantidad} u.</small>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <span>$ {((item.precio_base || 0) * item.cantidad).toLocaleString('es-AR')}</span>
                    <button 
                      type="button" 
                      onClick={() => a.removeCart(item.key)}
                      style={{ 
                        width: 'auto', 
                        padding: '4px 10px', 
                        fontSize: '11px', 
                        color: 'var(--accent-pink)',
                        border: '1px solid rgba(219, 39, 119, 0.2)',
                        background: 'rgba(219, 39, 119, 0.05)',
                        borderRadius: '6px'
                      }}
                    >
                      <Trash2 size={12} /> Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cartModalTotal">
              <span>Monto Total Estimado</span>
              <strong>$ {total.toLocaleString('es-AR')}</strong>
            </div>

            <div className="actions">
              <button type="button" className="secondary" onClick={onClose}>
                Seguir sumando
              </button>
              <button type="button" className="primary" onClick={onCheckout}>
                Finalizar pedido <CheckCircle size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Checkout({ onClose }) {
  const a = useApp();
  const [f, setF] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    provincia: '',
    localidad: '',
    observaciones: ''
  });
  const total = a.cart.reduce((sum, i) => sum + (i.precio_base || 0) * i.cantidad, 0);

  function submit(e) {
    e.preventDefault();
    const r = a.crearPedido(f);
    const phone = import.meta.env.VITE_WHATSAPP_NUMBER || '5493815542592';
    window.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(r.msg)}`;
    onClose();
  }

  return (
    <div className="modal">
      <form className="panel" onSubmit={submit}>
        <div>
          <h2>Finalizar Solicitud</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
            Completá tus datos de contacto para guardar el pedido y abrir WhatsApp.
          </p>
        </div>

        <div className="formGrid">
          <label>
            Nombre / Empresa
            <input 
              required 
              placeholder="Ej: Librería Arcoiris" 
              value={f.nombre} 
              onChange={e => setF({ ...f, nombre: e.target.value })}
            />
          </label>
          <label>
            WhatsApp de contacto
            <input 
              required 
              type="tel" 
              placeholder="Ej: +5493815556677" 
              value={f.telefono} 
              onChange={e => setF({ ...f, telefono: e.target.value })}
            />
          </label>
          <label>
            Correo electrónico
            <input 
              required 
              type="email" 
              placeholder="Ej: contacto@tienda.com" 
              value={f.email} 
              onChange={e => setF({ ...f, email: e.target.value })}
            />
          </label>
          <label>
            Dirección fiscal / entrega
            <input 
              required 
              placeholder="Ej: Av. Belgrano 1234" 
              value={f.direccion} 
              onChange={e => setF({ ...f, direccion: e.target.value })}
            />
          </label>
          <label>
            Provincia
            <input 
              required 
              placeholder="Ej: Tucumán" 
              value={f.provincia} 
              onChange={e => setF({ ...f, provincia: e.target.value })}
            />
          </label>
          <label>
            Localidad
            <input 
              required 
              placeholder="Ej: San Miguel de Tucumán" 
              value={f.localidad} 
              onChange={e => setF({ ...f, localidad: e.target.value })}
            />
          </label>
        </div>

        <label>
          Observaciones adicionales (Opcional)
          <textarea 
            placeholder="Detalles de facturación, horarios de entrega o solicitudes especiales de color..." 
            value={f.observaciones} 
            onChange={e => setF({ ...f, observaciones: e.target.value })}
          />
        </label>

        <div className="cartTotal">
          <span>Resumen total del pedido</span>
          <strong>$ {total.toLocaleString('es-AR')}</strong>
        </div>

        <div className="actions">
          <button type="button" className="secondary" onClick={onClose}>
            Atrás
          </button>
          <button type="submit" className="primary">
            Enviar por WhatsApp <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
