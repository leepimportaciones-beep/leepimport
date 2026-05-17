create extension if not exists "uuid-ossp";

drop table if exists historial_estados_pedido cascade;
drop table if exists detalle_pedido cascade;
drop table if exists pedidos cascade;
drop table if exists producto_colores cascade;
drop table if exists producto_caracteristicas cascade;
drop table if exists productos cascade;
drop table if exists colores cascade;
drop table if exists subcategorias cascade;
drop table if exists categorias cascade;
drop table if exists usuarios_admin cascade;

create or replace function actualizar_fecha_modificacion() returns trigger as $$ begin new.fecha_modificacion=now(); return new; end; $$ language plpgsql;

create table usuarios_admin(id_usuario uuid primary key default uuid_generate_v4(),usuario varchar(100) unique not null,clave varchar(200) not null,nombre varchar(150) not null,email varchar(150),activo boolean default true,fecha_alta timestamptz default now(),fecha_modificacion timestamptz default now());
create table categorias(id_categoria bigint generated always as identity primary key,nombre varchar(150) not null,descripcion text,orden_visual int default 0,activo boolean default true,fecha_alta timestamptz default now(),fecha_modificacion timestamptz default now());
create table subcategorias(id_subcategoria bigint generated always as identity primary key,id_categoria bigint references categorias(id_categoria),nombre varchar(150) not null,descripcion text,orden_visual int default 0,activo boolean default true,fecha_alta timestamptz default now(),fecha_modificacion timestamptz default now());
create table colores(id_color bigint generated always as identity primary key,nombre varchar(100) not null,codigo_hex varchar(20) not null,valor_rgb varchar(50),activo boolean default true,fecha_alta timestamptz default now(),fecha_modificacion timestamptz default now());
create table productos(id_producto bigint generated always as identity primary key,id_categoria bigint references categorias(id_categoria),id_subcategoria bigint references subcategorias(id_subcategoria),nombre varchar(200) not null,descripcion text,detalle_manual text,foto_url text,usa_colores boolean default false,precio_base numeric(14,2) default 0,producto_destacado boolean default false,activo boolean default true,fecha_alta timestamptz default now(),fecha_modificacion timestamptz default now());
create table producto_colores(id_producto_color bigint generated always as identity primary key,id_producto bigint references productos(id_producto) on delete cascade,id_color bigint references colores(id_color),precio_base_color numeric(14,2),stock_referencial int,activo boolean default true,fecha_alta timestamptz default now(),fecha_modificacion timestamptz default now(),unique(id_producto,id_color));
create table producto_caracteristicas(id_caracteristica bigint generated always as identity primary key,id_producto bigint references productos(id_producto) on delete cascade,nombre varchar(150),valor text,orden_visual int default 0,activo boolean default true,fecha_alta timestamptz default now(),fecha_modificacion timestamptz default now());
create table pedidos(id_pedido bigint generated always as identity primary key,codigo_pedido varchar(30) unique,nombre_cliente varchar(150) not null,telefono_cliente varchar(80) not null,email_cliente varchar(150),direccion_cliente text,provincia_cliente varchar(120),localidad_cliente varchar(120),observaciones_cliente text,estado varchar(50) default 'PENDIENTE_PRESUPUESTAR',total_bruto numeric(14,2) default 0,descuento_porcentaje numeric(8,2) default 0,descuento_fijo numeric(14,2) default 0,total_descuento numeric(14,2) default 0,total_final numeric(14,2) default 0,observaciones_presupuesto text,mensaje_whatsapp_cliente text,mensaje_whatsapp_presupuesto text,fecha_presupuestado timestamptz,fecha_finalizado timestamptz,fecha_venta_concretada timestamptz,activo boolean default true,fecha_alta timestamptz default now(),fecha_modificacion timestamptz default now(),check(estado in('PENDIENTE_PRESUPUESTAR','PRESUPUESTADO','FINALIZADO','VENTA_CONCRETADA','CANCELADO')));
create table detalle_pedido(id_detalle_pedido bigint generated always as identity primary key,id_pedido bigint references pedidos(id_pedido) on delete cascade,id_producto bigint references productos(id_producto),id_color bigint references colores(id_color),nombre_categoria varchar(150),nombre_subcategoria varchar(150),nombre_producto varchar(200),nombre_color varchar(100),cantidad int default 1,detalle_producto text,precio_base_original numeric(14,2) default 0,precio_unitario_presupuestado numeric(14,2) default 0,descuento_porcentaje_linea numeric(8,2) default 0,descuento_fijo_linea numeric(14,2) default 0,subtotal_bruto numeric(14,2) default 0,subtotal_final numeric(14,2) default 0,observaciones_linea text,activo boolean default true,fecha_alta timestamptz default now(),fecha_modificacion timestamptz default now(),check(cantidad>0));
create table historial_estados_pedido(id_historial bigint generated always as identity primary key,id_pedido bigint references pedidos(id_pedido) on delete cascade,estado_anterior varchar(50),estado_nuevo varchar(50),observacion text,usuario_accion varchar(100),fecha_alta timestamptz default now());

create index idx_productos_categoria on productos(id_categoria); create index idx_productos_subcategoria on productos(id_subcategoria); create index idx_pedidos_estado on pedidos(estado); create index idx_detalle_pedido_pedido on detalle_pedido(id_pedido);

create or replace function generar_codigo_pedido() returns text as $$ declare n int; begin select coalesce(max(id_pedido),0)+1 into n from pedidos; return 'PED-'||lpad(n::text,6,'0'); end; $$ language plpgsql;
create or replace function asignar_codigo_pedido() returns trigger as $$ begin if new.codigo_pedido is null or new.codigo_pedido='' then new.codigo_pedido:=generar_codigo_pedido(); end if; return new; end; $$ language plpgsql;
create trigger trg_asignar_codigo_pedido before insert on pedidos for each row execute function asignar_codigo_pedido();

create or replace view vw_catalogo_publico as select p.*,c.nombre categoria,s.nombre subcategoria from productos p join categorias c on c.id_categoria=p.id_categoria join subcategorias s on s.id_subcategoria=p.id_subcategoria where p.activo=true and c.activo=true and s.activo=true;
create or replace view vw_producto_colores as select pc.*,p.nombre producto,co.nombre color,co.codigo_hex,co.valor_rgb from producto_colores pc join productos p on p.id_producto=pc.id_producto join colores co on co.id_color=pc.id_color where pc.activo=true and co.activo=true;
create or replace view vw_pedidos_resumen as select p.*,count(dp.id_detalle_pedido)cantidad_items,sum(dp.cantidad)cantidad_unidades from pedidos p left join detalle_pedido dp on dp.id_pedido=p.id_pedido group by p.id_pedido;

insert into usuarios_admin(usuario,clave,nombre,email) values('admin','123456','Administrador General','admin@negocio.com');
insert into categorias(nombre,descripcion,orden_visual) values('Goma Eva','Planchas de goma eva',1),('Papelería','Papeles y cartulinas',2),('Librería Escolar','Útiles escolares',3),('Manualidades','Materiales creativos',4);
insert into subcategorias(id_categoria,nombre,orden_visual) values(1,'Lisa',1),(1,'Glitter',2),(1,'Toalla',3),(2,'Cartulinas',1),(2,'Afiches',2),(3,'Escritura',1),(3,'Pegamentos',2),(4,'Pintura',1);
insert into colores(nombre,codigo_hex,valor_rgb) values('Blanco','#FFFFFF','255,255,255'),('Negro','#000000','0,0,0'),('Rojo','#EF4444','239,68,68'),('Azul','#2563EB','37,99,235'),('Verde','#22C55E','34,197,94'),('Dorado','#D4AF37','212,175,55'),('Plateado','#C0C0C0','192,192,192'),('Rosa','#FB7185','251,113,133'),('Violeta','#8B5CF6','139,92,246');
insert into productos(id_categoria,id_subcategoria,nombre,descripcion,detalle_manual,foto_url,usa_colores,precio_base,producto_destacado) values
(1,1,'Goma Eva Lisa A4','Plancha lisa tamaño A4','Se vende por unidad o caja x10','https://placehold.co/700x500?text=Goma+Eva+Lisa',true,450,true),
(1,2,'Goma Eva Glitter 40x60','Plancha con brillo premium','Ideal para carteles y souvenirs','https://placehold.co/700x500?text=Goma+Eva+Glitter',true,1700,true),
(1,3,'Goma Eva Toalla','Textura toalla','Venta por unidad','https://placehold.co/700x500?text=Goma+Eva+Toalla',true,1850,false),
(2,4,'Cartulina Escolar','Cartulina tradicional','Venta por unidad','https://placehold.co/700x500?text=Cartulina',true,350,true),
(2,5,'Afiche Color','Afiche grande','Venta por unidad','https://placehold.co/700x500?text=Afiche',true,400,false),
(3,6,'Lapicera Azul Pack x10','Pack de lapiceras','Producto sin color','https://placehold.co/700x500?text=Lapiceras',false,2500,true),
(3,7,'Plasticola Escolar 250g','Adhesivo escolar','Venta por unidad','https://placehold.co/700x500?text=Plasticola',false,1800,false),
(4,8,'Témpera Escolar 250ml','Témpera para arte','Disponible por color','https://placehold.co/700x500?text=Tempera',true,1900,true);
insert into producto_colores(id_producto,id_color) values(1,1),(1,2),(1,3),(1,4),(1,5),(1,8),(1,9),(2,3),(2,4),(2,5),(2,6),(2,7),(2,8),(2,9),(3,1),(3,2),(3,3),(3,4),(3,5),(4,1),(4,2),(4,3),(4,4),(4,5),(4,8),(4,9),(5,3),(5,4),(5,5),(5,8),(5,9),(8,3),(8,4),(8,5),(8,8),(8,9);
insert into pedidos(codigo_pedido,nombre_cliente,telefono_cliente,observaciones_cliente,estado,total_final) values('PED-000001','María González','3815551111','Necesito presupuesto para colegio','PENDIENTE_PRESUPUESTAR',0),('PED-000002','Carlos Medina','3815552222','Retiro hoy','PRESUPUESTADO',23000),('PED-000003','Laura Fernández','3815553333','Cumpleaños infantil','VENTA_CONCRETADA',16000);

alter table usuarios_admin disable row level security; alter table categorias disable row level security; alter table subcategorias disable row level security; alter table colores disable row level security; alter table productos disable row level security; alter table producto_colores disable row level security; alter table producto_caracteristicas disable row level security; alter table pedidos disable row level security; alter table detalle_pedido disable row level security; alter table historial_estados_pedido disable row level security;
