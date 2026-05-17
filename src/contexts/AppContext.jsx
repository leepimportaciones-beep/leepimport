import React,{createContext,useContext,useEffect,useState}from'react';
import{supabase,supabaseConfigured}from'../lib/supabase';
import{demoCategorias,demoSubcategorias,demoProductos,demoColores,demoProductoColores,demoProductoCaracteristicas,demoDetallePedidos,demoPedidos}from'../data/demoData';

const C=createContext();
export const useApp=()=>useContext(C);

const toBool=value=>value===true||value==='true'||value===1||value==='1';
const toNumber=value=>Number(value||0);
const newId=()=>Date.now();

async function upsertEntity(table,idField,item){
  const payload={...item};
  if(!payload[idField])delete payload[idField];
  if(supabaseConfigured){
    if(item[idField]){
      const{data,error}=await supabase.from(table).update(payload).eq(idField,item[idField]).select().single();
      if(error)throw error;
      return data;
    }
    const{data,error}=await supabase.from(table).insert(payload).select().single();
    if(error)throw error;
    return data;
  }
  return item[idField]?item:{...item,[idField]:newId()};
}

async function toggleEntityActive(table,idField,id,active){
  if(supabaseConfigured){
    const{data,error}=await supabase.from(table).update({activo:active}).eq(idField,id).select().single();
    if(error)throw error;
    return data;
  }
  return {[idField]:id,activo:active};
}

export function AppProvider({children}){
  const[loading,setLoading]=useState(true);
  const[categorias,setCategorias]=useState([]);
  const[subcategorias,setSubcategorias]=useState([]);
  const[productos,setProductos]=useState([]);
  const[colores,setColores]=useState([]);
  const[productoColores,setProductoColores]=useState([]);
  const[productoCaracteristicas,setProductoCaracteristicas]=useState([]);
  const[detallePedidos,setDetallePedidos]=useState([]);
  const[pedidos,setPedidos]=useState([]);
  const[cart,setCart]=useState(()=>JSON.parse(localStorage.getItem('cart')||'[]'));
  const[toast,setToast]=useState(null);

  useEffect(()=>{localStorage.setItem('cart',JSON.stringify(cart))},[cart]);

  const notify=(m,t='ok')=>{setToast({m,t});setTimeout(()=>setToast(null),3000)};

  async function load(){
    setLoading(true);
    try{
      if(supabaseConfigured){
        const[t1,t2,t3,t4,t5,t6,t7,t8]=await Promise.all([
          supabase.from('categorias').select('*').order('orden_visual',{ascending:true}),
          supabase.from('subcategorias').select('*').order('orden_visual',{ascending:true}),
          supabase.from('productos').select('*').order('id_producto',{ascending:true}),
          supabase.from('colores').select('*').order('nombre',{ascending:true}),
          supabase.from('producto_colores').select('*'),
          supabase.from('producto_caracteristicas').select('*'),
          supabase.from('detalle_pedido').select('*'),
          supabase.from('pedidos').select('*').order('fecha_alta',{ascending:false})
        ]);
        setCategorias(t1.data||[]);
        setSubcategorias(t2.data||[]);
        setProductos(t3.data||[]);
        setColores(t4.data||[]);
        setProductoColores(t5.data||[]);
        setProductoCaracteristicas(t6.data||[]);
        setDetallePedidos(t7.data||[]);
        setPedidos(t8.data||[]);
      }else{
        setCategorias(demoCategorias);
        setSubcategorias(demoSubcategorias);
        setProductos(demoProductos);
        setColores(demoColores);
        setProductoColores(demoProductoColores);
        setProductoCaracteristicas(demoProductoCaracteristicas);
        setDetallePedidos(demoDetallePedidos);
        setPedidos(demoPedidos);
      }
    }catch(e){
      console.error(e);
      notify('Error cargando datos. Usando datos demo.','err');
      setCategorias(demoCategorias);
      setSubcategorias(demoSubcategorias);
      setProductos(demoProductos);
      setColores(demoColores);
      setProductoColores(demoProductoColores);
      setProductoCaracteristicas(demoProductoCaracteristicas);
      setDetallePedidos(demoDetallePedidos);
      setPedidos(demoPedidos);
    }
    setLoading(false);
  }

  useEffect(()=>{load()},[]);

  const getCat=id=>categorias.find(x=>x.id_categoria==id)?.nombre||'';
  const getSub=id=>subcategorias.find(x=>x.id_subcategoria==id)?.nombre||'';
  const getProduct=id=>productos.find(x=>x.id_producto==id)?.nombre||'';
  const getColor=id=>colores.find(x=>x.id_color==id);
  const getProductoColor=(idProducto,idColor)=>productoColores.find(pc=>pc.id_producto==idProducto&&pc.id_color==idColor);
  const getProductoCaracteristicas=id=>productoCaracteristicas.filter(pc=>pc.id_producto==id&&pc.activo!==false).sort((a,b)=>a.orden_visual-b.orden_visual);
  const coloresProducto=id=>productoColores.filter(pc=>pc.id_producto==id&&pc.activo!==false).map(pc=>getColor(pc.id_color)).filter(Boolean);

  function addCart(producto,color,cantidad=1,precio=producto.precio_base){
    const key=`${producto.id_producto}-${color?.id_color||'sincolor'}`;
    const itemPrecio=precio||producto.precio_base||0;
    setCart(prev=>{const ex=prev.find(i=>i.key===key);if(ex)return prev.map(i=>i.key===key?{...i,cantidad:i.cantidad+cantidad}:i);return[...prev,{key,id_producto:producto.id_producto,producto:producto.nombre,categoria:getCat(producto.id_categoria),subcategoria:getSub(producto.id_subcategoria),id_color:color?.id_color||null,color:color?.nombre||null,color_hex:color?.codigo_hex||null,cantidad,detalle:producto.detalle_manual,precio_base:itemPrecio}]});
    notify('Producto agregado al carrito');
  }

  function updateQty(key,cantidad){setCart(p=>p.map(i=>i.key===key?{...i,cantidad:Math.max(1,cantidad)}:i));}
  function removeCart(key){setCart(p=>p.filter(i=>i.key!==key));}
  function clearCart(){setCart([]);}

  async function saveCategoria(categoria){
    try{
      const prepared={...categoria,orden_visual:toNumber(categoria.orden_visual),activo:toBool(categoria.activo)};
      const data=await upsertEntity('categorias','id_categoria',prepared);
      setCategorias(prev=>prev.some(x=>x.id_categoria===data.id_categoria)?prev.map(x=>x.id_categoria===data.id_categoria?data:x):[...prev,data]);
      notify('Categoría guardada');
    }catch(e){console.error(e);notify('No se pudo guardar categoría.','err');throw e;}
  }

  async function toggleCategoria(id,active){
    try{await toggleEntityActive('categorias','id_categoria',id,active);setCategorias(prev=>prev.map(x=>x.id_categoria===id?{...x,activo:active}:x));notify(`Categoría ${active?'activada':'desactivada'}`)}catch(e){console.error(e);notify('Error actualizando categoría.','err');throw e;}}

  async function saveSubcategoria(subcategoria){
    try{
      const prepared={...subcategoria,orden_visual:toNumber(subcategoria.orden_visual),id_categoria:toNumber(subcategoria.id_categoria),activo:toBool(subcategoria.activo)};
      const data=await upsertEntity('subcategorias','id_subcategoria',prepared);
      setSubcategorias(prev=>prev.some(x=>x.id_subcategoria===data.id_subcategoria)?prev.map(x=>x.id_subcategoria===data.id_subcategoria?data:x):[...prev,data]);
      notify('Subcategoría guardada');
    }catch(e){console.error(e);notify('No se pudo guardar subcategoría.','err');throw e;}
  }

  async function toggleSubcategoria(id,active){
    try{await toggleEntityActive('subcategorias','id_subcategoria',id,active);setSubcategorias(prev=>prev.map(x=>x.id_subcategoria===id?{...x,activo:active}:x));notify(`Subcategoría ${active?'activada':'desactivada'}`)}catch(e){console.error(e);notify('Error actualizando subcategoría.','err');throw e;}}

  async function saveProducto(producto){
    try{
      const prepared={...producto,precio_base:toNumber(producto.precio_base),id_categoria:toNumber(producto.id_categoria),id_subcategoria:toNumber(producto.id_subcategoria),usa_colores:toBool(producto.usa_colores),producto_destacado:toBool(producto.producto_destacado),activo:toBool(producto.activo)};
      const data=await upsertEntity('productos','id_producto',prepared);
      setProductos(prev=>prev.some(x=>x.id_producto===data.id_producto)?prev.map(x=>x.id_producto===data.id_producto?data:x):[...prev,data]);
      notify('Producto guardado');
    }catch(e){console.error(e);notify('No se pudo guardar producto.','err');throw e;}
  }

  async function toggleProducto(id,active){
    try{await toggleEntityActive('productos','id_producto',id,active);setProductos(prev=>prev.map(x=>x.id_producto===id?{...x,activo:active}:x));notify(`Producto ${active?'activado':'desactivado'}`)}catch(e){console.error(e);notify('Error actualizando producto.','err');throw e;}}

  async function saveColor(color){
    try{
      const prepared={...color,valor_rgb:color.valor_rgb||hexToRgb(color.codigo_hex),activo:toBool(color.activo)};
      const data=await upsertEntity('colores','id_color',prepared);
      setColores(prev=>prev.some(x=>x.id_color===data.id_color)?prev.map(x=>x.id_color===data.id_color?data:x):[...prev,data]);
      notify('Color guardado');
    }catch(e){console.error(e);notify('No se pudo guardar color.','err');throw e;}
  }

  async function toggleColor(id,active){
    try{await toggleEntityActive('colores','id_color',id,active);setColores(prev=>prev.map(x=>x.id_color===id?{...x,activo:active}:x));notify(`Color ${active?'activado':'desactivado'}`)}catch(e){console.error(e);notify('Error actualizando color.','err');throw e;}}

  async function saveProductoColor(productoColor){
    try{
      const prepared={...productoColor,id_producto:toNumber(productoColor.id_producto),id_color:toNumber(productoColor.id_color),precio_base_color:toNumber(productoColor.precio_base_color),stock_referencial:toNumber(productoColor.stock_referencial),activo:toBool(productoColor.activo)};
      const data=await upsertEntity('producto_colores','id_producto_color',prepared);
      setProductoColores(prev=>prev.some(x=>x.id_producto_color===data.id_producto_color)?prev.map(x=>x.id_producto_color===data.id_producto_color?data:x):[...prev,data]);
      notify('Color de producto guardado');
    }catch(e){console.error(e);notify('No se pudo guardar color de producto.','err');throw e;}
  }

  async function toggleProductoColor(id,active){
    try{await toggleEntityActive('producto_colores','id_producto_color',id,active);setProductoColores(prev=>prev.map(x=>x.id_producto_color===id?{...x,activo:active}:x));notify(`Color de producto ${active?'activado':'desactivado'}`)}catch(e){console.error(e);notify('Error actualizando color de producto.','err');throw e;}}

  async function saveProductoCaracteristica(caracteristica){
    try{
      const prepared={...caracteristica,id_producto:toNumber(caracteristica.id_producto),orden_visual:toNumber(caracteristica.orden_visual),activo:toBool(caracteristica.activo)};
      const data=await upsertEntity('producto_caracteristicas','id_caracteristica',prepared);
      setProductoCaracteristicas(prev=>prev.some(x=>x.id_caracteristica===data.id_caracteristica)?prev.map(x=>x.id_caracteristica===data.id_caracteristica?data:x):[...prev,data]);
      notify('Característica guardada');
    }catch(e){console.error(e);notify('No se pudo guardar característica.','err');throw e;}
  }

  async function toggleProductoCaracteristica(id,active){
    try{await toggleEntityActive('producto_caracteristicas','id_caracteristica',id,active);setProductoCaracteristicas(prev=>prev.map(x=>x.id_caracteristica===id?{...x,activo:active}:x));notify(`Característica ${active?'activada':'desactivada'}`)}catch(e){console.error(e);notify('Error actualizando característica.','err');throw e;}}

  async function deleteWhere(table, clause){
    if(supabaseConfigured){
      let query=supabase.from(table).delete();
      Object.entries(clause).forEach(([key,value])=>{query=query.eq(key,value);});
      const{data,error}=await query.select();
      if(error)throw error;
      return data;
    }
    return true;
  }

  async function deleteEntity(table,idField,id){
    return deleteWhere(table,{[idField]:id});
  }

  async function deleteCategoria(id){
    try{
      const productosEliminados=productos.filter(x=>x.id_categoria===id).map(x=>x.id_producto);
      if(supabaseConfigured){
        await deleteWhere('productos',{id_categoria:id});
        await deleteWhere('subcategorias',{id_categoria:id});
      }
      await deleteEntity('categorias','id_categoria',id);
      setCategorias(prev=>prev.filter(x=>x.id_categoria!==id));
      setSubcategorias(prev=>prev.filter(x=>x.id_categoria!==id));
      setProductos(prev=>prev.filter(x=>x.id_categoria!==id));
      setProductoColores(prev=>prev.filter(x=>!productosEliminados.includes(x.id_producto)));
      setProductoCaracteristicas(prev=>prev.filter(x=>!productosEliminados.includes(x.id_producto)));
      notify('Categoría eliminada');
    }catch(e){console.error(e);notify('No se pudo eliminar categoría.','err');throw e;}}

  async function deleteSubcategoria(id){
    try{
      const productosEliminados=productos.filter(x=>x.id_subcategoria===id).map(x=>x.id_producto);
      if(supabaseConfigured){
        await deleteWhere('productos',{id_subcategoria:id});
      }
      await deleteEntity('subcategorias','id_subcategoria',id);
      setSubcategorias(prev=>prev.filter(x=>x.id_subcategoria!==id));
      setProductos(prev=>prev.filter(x=>x.id_subcategoria!==id));
      setProductoColores(prev=>prev.filter(x=>!productosEliminados.includes(x.id_producto)));
      setProductoCaracteristicas(prev=>prev.filter(x=>!productosEliminados.includes(x.id_producto)));
      notify('Subcategoría eliminada');
    }catch(e){console.error(e);notify('No se pudo eliminar subcategoría.','err');throw e;}}

  async function deleteProducto(id){
    try{
      await deleteEntity('productos','id_producto',id);
      setProductos(prev=>prev.filter(x=>x.id_producto!==id));
      setProductoColores(prev=>prev.filter(x=>x.id_producto!==id));
      setProductoCaracteristicas(prev=>prev.filter(x=>x.id_producto!==id));
      notify('Producto eliminado');
    }catch(e){console.error(e);notify('No se pudo eliminar producto.','err');throw e;}}

  async function deleteColor(id){
    try{
      if(supabaseConfigured){
        await deleteWhere('producto_colores',{id_color:id});
      }
      await deleteEntity('colores','id_color',id);
      setColores(prev=>prev.filter(x=>x.id_color!==id));
      setProductoColores(prev=>prev.filter(x=>x.id_color!==id));
      notify('Color eliminado');
    }catch(e){console.error(e);notify('No se pudo eliminar color.','err');throw e;}}

  async function deleteProductoColor(id){
    try{
      await deleteEntity('producto_colores','id_producto_color',id);
      setProductoColores(prev=>prev.filter(x=>x.id_producto_color!==id));
      notify('Color de producto eliminado');
    }catch(e){console.error(e);notify('No se pudo eliminar color de producto.','err');throw e;}}

  async function deleteProductoCaracteristica(id){
    try{
      await deleteEntity('producto_caracteristicas','id_caracteristica',id);
      setProductoCaracteristicas(prev=>prev.filter(x=>x.id_caracteristica!==id));
      notify('Característica eliminada');
    }catch(e){console.error(e);notify('No se pudo eliminar característica.','err');throw e;}}

  async function deletePedido(id){
    try{
      await deleteEntity('pedidos','id_pedido',id);
      setPedidos(prev=>prev.filter(p=>p.id_pedido!==id));
      setDetallePedidos(prev=>prev.filter(d=>d.id_pedido!==id));
      notify('Pedido eliminado');
    }catch(e){console.error(e);notify('No se pudo eliminar pedido.','err');throw e;}}

  async function updatePedidoEstado(id,estado){
    try{
      if(supabaseConfigured){
        const{error}=await supabase.from('pedidos').update({estado}).eq('id_pedido',id);
        if(error)throw error;
      }
      setPedidos(prev=>prev.map(p=>p.id_pedido===id?{...p,estado}:p));
      notify('Estado de pedido actualizado');
    }catch(e){console.error(e);notify('Error actualizando estado de pedido.','err');throw e;}}

  function hexToRgb(hex){
    if(!hex)return'';
    const v=hex.replace('#','');
    if(v.length===3){return v.split('').map(x=>parseInt(x+x,16)).join(',');}
    if(v.length===6){return [v.slice(0,2),v.slice(2,4),v.slice(4,6)].map(x=>parseInt(x,16)).join(',');}
    return '';
  }

  async function crearPedido(cliente){
    const totalBruto=cart.reduce((s,i)=>s+(i.precio_base||0)*i.cantidad,0);
    const codigo=`PED-${String(Date.now()).slice(-6)}`;
    const msg=buildClienteMsg(codigo,cliente,cart);
    const pedido={codigo_pedido:codigo,nombre_cliente:cliente.nombre,telefono_cliente:cliente.telefono,email_cliente:cliente.email,direccion_cliente:cliente.direccion,provincia_cliente:cliente.provincia,localidad_cliente:cliente.localidad,observaciones_cliente:cliente.observaciones,estado:'PENDIENTE_PRESUPUESTAR',total_bruto:totalBruto,total_final:totalBruto,mensaje_whatsapp_cliente:msg};
    let nuevoPedido;
    let nuevoDetalle=[];
    if(supabaseConfigured){
      const{data,error}=await supabase.from('pedidos').insert(pedido).select().single();
      if(error)throw error;
      nuevoPedido=data;
      const detalles=cart.map(i=>({
        id_pedido:data.id_pedido,
        id_producto:i.id_producto,
        id_color:i.id_color,
        nombre_categoria:i.categoria,
        nombre_subcategoria:i.subcategoria,
        nombre_producto:i.producto,
        nombre_color:i.color,
        cantidad:i.cantidad,
        detalle_producto:i.detalle,
        precio_base_original:i.precio_base,
        precio_unitario_presupuestado:i.precio_base,
        subtotal_bruto:(i.precio_base||0)*i.cantidad,
        subtotal_final:(i.precio_base||0)*i.cantidad
      }));
      const{data:detailData,error:detailError}=await supabase.from('detalle_pedido').insert(detalles).select();
      if(detailError)throw detailError;
      nuevoDetalle=detailData||[];
    }else{
      const idPedido=newId();
      nuevoPedido={...pedido,id_pedido:idPedido,fecha_alta:new Date().toISOString()};
      nuevoDetalle=cart.map(i=>({
        id_detalle_pedido:newId(),
        id_pedido:idPedido,
        id_producto:i.id_producto,
        id_color:i.id_color,
        nombre_categoria:i.categoria,
        nombre_subcategoria:i.subcategoria,
        nombre_producto:i.producto,
        nombre_color:i.color,
        cantidad:i.cantidad,
        detalle_producto:i.detalle,
        precio_base_original:i.precio_base,
        precio_unitario_presupuestado:i.precio_base,
        subtotal_bruto:(i.precio_base||0)*i.cantidad,
        subtotal_final:(i.precio_base||0)*i.cantidad,
        activo:true,
        fecha_alta:new Date().toISOString()
      }));
    }
    setPedidos(p=>[nuevoPedido,...p]);
    setDetallePedidos(d=>[...nuevoDetalle,...d]);
    clearCart();
    return{codigo,msg};
  }

  function buildClienteMsg(codigo,c,items){
    return `Solicitud de presupuesto\nCódigo: ${codigo}\n\nCliente:\nNombre: ${c.nombre}\nCelular: ${c.telefono}\nEmail: ${c.email || '-'}\nDirección: ${c.direccion || '-'}\nProvincia: ${c.provincia || '-'}\nLocalidad: ${c.localidad || '-'}\n\nDetalle:\n${items.map(i=>`\nCategoría: ${i.categoria}\nSubcategoría: ${i.subcategoria}\nProducto: ${i.producto}\n${i.color?`Color: ${i.color}\n`:''}Cantidad: ${i.cantidad}\nDetalle: ${i.detalle||'-'}`).join('\n')}\n\nObservaciones:\n${c.observaciones||'-'}\n\nQuedo atento al presupuesto. Muchas gracias.`;
  }

  const value={loading,categorias,setCategorias,subcategorias,setSubcategorias,productos,setProductos,colores,setColores,productoColores,setProductoColores,productoCaracteristicas,setProductoCaracteristicas,detallePedidos,setDetallePedidos,pedidos,setPedidos,cart,addCart,updateQty,removeCart,clearCart,crearPedido,updatePedidoEstado,deletePedido,coloresProducto,getCat,getSub,getProduct,getColor,getProductoColor,getProductoCaracteristicas,notify,supabaseConfigured,saveCategoria,toggleCategoria,deleteCategoria,saveSubcategoria,toggleSubcategoria,deleteSubcategoria,saveProducto,toggleProducto,deleteProducto,saveColor,toggleColor,deleteColor,saveProductoColor,toggleProductoColor,deleteProductoColor,saveProductoCaracteristica,toggleProductoCaracteristica,deleteProductoCaracteristica};

  return <C.Provider value={value}>{children}{toast&&<div className={'toast '+toast.t}>{toast.m}</div>}</C.Provider>;
}
