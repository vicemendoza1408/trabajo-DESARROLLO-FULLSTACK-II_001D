// Datos semilla de la tienda Fuma. Se copian a localStorage la primera vez que se usa la tienda.

export const CATEGORIAS_INICIALES = [
  { id: "polerones", nombre: "Polerones", descripcion: "Abrigo cómodo para el día a día." },
  { id: "poleras", nombre: "Poleras", descripcion: "Básicos y estampados de algodón." },
  { id: "pantalones", nombre: "Pantalones", descripcion: "Jeans, cargo y jogger." },
  { id: "accesorios", nombre: "Accesorios", descripcion: "Gorros, cinturones y más." },
];

// precio: en CLP, sin decimales.
// descuentoPorcentaje: 0 significa que el producto no está en oferta.
export const PRODUCTOS_INICIALES = [
  { id: 1, nombre: "Polerón negro oversize", descripcion: "Polerón de algodón con capucha.", precio: 29990, descuentoPorcentaje: 0, idCategoria: "polerones", imagen: "/img/placeholder.svg" },
  { id: 2, nombre: "Polerón gris básico", descripcion: "Polerón liso de corte regular.", precio: 24990, descuentoPorcentaje: 20, idCategoria: "polerones", imagen: "/img/placeholder.svg" },
  { id: 3, nombre: "Polera blanca básica", descripcion: "Algodón 100%, cuello redondo.", precio: 9990, descuentoPorcentaje: 0, idCategoria: "poleras", imagen: "/img/placeholder.svg" },
  { id: 4, nombre: "Polera estampada Fuma", descripcion: "Estampado frontal en serigrafía.", precio: 12990, descuentoPorcentaje: 15, idCategoria: "poleras", imagen: "/img/placeholder.svg" },
  { id: 5, nombre: "Jeans azul recto", descripcion: "Corte recto de mezclilla.", precio: 32990, descuentoPorcentaje: 0, idCategoria: "pantalones", imagen: "/img/placeholder.svg" },
  { id: 6, nombre: "Pantalón cargo beige", descripcion: "Bolsillos laterales y ajuste en tobillo.", precio: 27990, descuentoPorcentaje: 30, idCategoria: "pantalones", imagen: "/img/placeholder.svg" },
  { id: 7, nombre: "Gorro de lana", descripcion: "Gorro tejido, talla única.", precio: 6990, descuentoPorcentaje: 0, idCategoria: "accesorios", imagen: "/img/placeholder.svg" },
  { id: 8, nombre: "Cinturón de cuero", descripcion: "Hebilla metálica, 100 cm.", precio: 14990, descuentoPorcentaje: 10, idCategoria: "accesorios", imagen: "/img/placeholder.svg" },
];
