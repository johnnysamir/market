SELECT p.titulo,
    p.precio,
    i.url_imagen
FROM propiedades p
    JOIN imagenes_propiedad i ON p.id = i.propiedad_id
WHERE i.es_principal = true;