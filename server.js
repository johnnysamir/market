require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const fs = require('fs');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'mi_secreto_super_seguro';

// Middleware
app.use(cors()); // Permite acceso desde cualquier origen (útil para desarrollo)
app.use(express.json({ limit: '50mb' })); // Aumentado para soportar base64 de imágenes si es necesario
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple in-memory session store for Rate Limiting (Reset on server restart)
const chatSessions = {};
const MAX_MESSAGES_PER_SESSION = 10;

// Configuración de Multer para almacenamiento de imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, webp)"));
    }
});


// Ruta principal - Sirve el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint para subir imágenes individualmente
app.post('/api/upload', upload.single('imagen'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

// AUTH: Registrar Usuario
app.post('/api/auth/register', async (req, res) => {
    const { nombre_completo, email, password } = req.body;
    try {
        // Verificar si el usuario ya existe
        const existingUser = await prisma.usuarios.findUnique({
            where: { email: email }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está asociado a una cuenta existente.' });
        }

        // Hashear password
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            // Crear usuario
            const newUser = await prisma.usuarios.create({
                data: {
                    nombre_completo,
                    email,
                    password_hash: hashedPassword,
                    activo: true // changed acttive to activo per schema
                }
            });
            res.status(201).json({ message: 'Usuario registrado exitosamente', user: { id: newUser.id, nombre: newUser.nombre_completo, email: newUser.email } });
        } catch (dbError) {
            console.error('Error DB:', dbError);
            return res.status(500).json({ error: 'Error al guardar en la base de datos: ' + dbError.message });
        }

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error inesperado durante el registro: ' + error.message });
    }
});

// AUTH: Login Usuario
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Buscar usuario
        const user = await prisma.usuarios.findUnique({
            where: { email: email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar Token (JWT) - Para mantener la sesión en el frontend
        const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                nombre: user.nombre_completo,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// Obtener todas las propiedades
// Endpoint para Chatbot con Inteligencia Artificial
app.post('/api/chat', async (req, res) => {
    const { mensaje, historial, sessionId } = req.body;
    const sessionKey = sessionId || req.ip; // Fallback to IP if no sessionId provided

    // 1. Rate Limiting Control
    if (!chatSessions[sessionKey]) chatSessions[sessionKey] = 0;
    if (chatSessions[sessionKey] >= MAX_MESSAGES_PER_SESSION) {
        return res.json({ respuesta: "Has alcanzado el límite de consultas por esta sesión. ¡Gracias por tu interés en jvargas! Si necesitás más ayuda, por favor contactanos directamente." });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'TU_API_KEY_AQUI') {
        return res.json({ respuesta: "Hola! Soy el asistente de jvargas. Para poder ayudarte mejor, mi equipo debe configurar mi 'cerebro' (API Key). ¡Pero pronto estaré listo para buscarte la casa de tus sueños!" });
    }

    try {
        console.log("Chat request received:", mensaje);
        // 2. Obtener los datos y Filtrar por Relevancia (Ahorro de Tokens)
        const catalogoCompleto = await prisma.$queryRaw`SELECT * FROM v_chatbot_publicaciones`;
        console.log("Catalogo size:", catalogoCompleto.length);

        // Simulación de búsqueda semántica simple: Filtramos las 3 más relevantes basadas en palabras clave del mensaje
        const palabrasClave = mensaje.toLowerCase().split(' ').filter(p => p.length > 3);
        const catalogoFiltrado = catalogoCompleto
            .map(p => {
                let score = 0;
                palabrasClave.forEach(word => {
                    if (p.resumen_busqueda && p.resumen_busqueda.toLowerCase().includes(word)) score++;
                });
                // Prioridad a destacadas
                if (p.destacada) score += 0.5;
                return { ...p, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 3); // Límite: Solo las 3 mejores coincidencias

        console.log("Filtered catalog size:", catalogoFiltrado.length);

        // 3. Límite de Contexto: Truncar información a 300 caracteres por propiedad
        const catalogoReducido = catalogoFiltrado.map(p => ({
            id: p.id,
            titulo: p.titulo,
            precio: `${p.moneda} ${p.precio}`,
            barrio: p.barrio,
            info_esencial: (p.resumen_busqueda || '').substring(0, 300) + '...'
        }));

        const catalogoStr = JSON.stringify(catalogoReducido);

        // 4. Inicializar Gemini (Flash es preferido por velocidad y costo)
        // Using gemini-2.5-flash as verified by find_working_model.js
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Usamos systemInstruction que es la forma recomendada para Gemini 1.5+
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `Sos un agente inmobiliario experto de 'jvargas'. 
            CATÁLOGO FILTRADO (Top 3): ${catalogoStr}
            
            REGLAS:
            1. SOLO usá el catálogo enviado. No inventes propiedades.
            2. Si no encontrás lo que busca entre estas 3, decí que por ahora no tenés algo exacto pero ofrecé tomar sus datos.
            3. Respuestas cortas y vendedoras (máximo 2 párrafos).
            4. Sé amable y profesional.`
        });

        // 5. Iniciar chat con historial
        const chat = model.startChat({
            history: historial || [],
        });

        const input = mensaje;

        console.log("Sending to Gemini 2.5...");
        const result = await chat.sendMessage(input);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini response received.");

        // Incrementar contador de rate limit
        chatSessions[sessionKey]++;

        res.json({ respuesta: text });
    } catch (error) {
        console.error('Error en el chatbot:', error);
        res.status(500).json({ error: 'Error al procesar mensaje.' });
    }
});

// Endpoint para el chatbot (consume la vista de la base de datos)
app.get('/api/chatbot/publicaciones', async (req, res) => {
    try {
        const publicaciones = await prisma.$queryRaw`SELECT * FROM v_chatbot_publicaciones`;
        res.json(publicaciones);
    } catch (error) {
        console.error('Error al obtener vista de chatbot:', error);
        res.status(500).json({ error: 'Error al obtener los datos para el chatbot. Asegúrate de que la vista v_chatbot_publicaciones exista en la base de datos.' });
    }
});

app.get('/api/propiedades', async (req, res) => {
    try {
        const propiedades = await prisma.propiedades.findMany({
            include: {
                imagenes_propiedad: true, // Incluir imágenes relacionadas
            },
            orderBy: {
                fecha_publicacion: 'desc', // Las más nuevas primero
            }
        });
        res.json(propiedades);
    } catch (error) {
        console.error('Error al obtener propiedades:', error);
        res.status(500).json({ error: 'Error al obtener las propiedades' });
    }
});

// Obtener una propiedad por ID
app.get('/api/propiedades/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const propiedad = await prisma.propiedades.findUnique({
            where: { id: parseInt(id) },
            include: {
                imagenes_propiedad: true,
            },
        });

        if (propiedad) {
            res.json(propiedad);
        } else {
            res.status(404).json({ error: 'Propiedad no encontrada' });
        }
    } catch (error) {
        console.error('Error al obtener la propiedad:', error);
        res.status(500).json({ error: 'Error al obtener la propiedad' });
    }
});

// Obtener propiedades de un usuario específico
app.get('/api/propiedades/usuario/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const propiedades = await prisma.propiedades.findMany({
            where: { usuario_id: parseInt(userId) },
            include: {
                imagenes_propiedad: true,
            },
            orderBy: {
                fecha_publicacion: 'desc',
            }
        });
        res.json(propiedades);
    } catch (error) {
        console.error('Error al obtener propiedades del usuario:', error);
        res.status(500).json({ error: 'Error al obtener sus propiedades' });
    }
});

// CREAR Propiedad
app.post('/api/propiedades', async (req, res) => {
    const {
        usuario_id, titulo, descripcion, tipo_operacion, tipo_inmueble,
        moneda, precio, calle, altura, piso, departamento, ciudad, barrio,
        superficie_total, superficie_cubierta, dormitorios, banos, ambientes, cocheras,
        imagenes // array de urls
    } = req.body;

    try {
        if (precio && parseFloat(precio) < 0) {
            return res.status(400).json({ error: 'El precio no puede ser negativo.' });
        }

        const nuevaPropiedad = await prisma.propiedades.create({
            data: {
                usuario_id: parseInt(usuario_id),
                titulo,
                descripcion,
                tipo_operacion: tipo_operacion.toLowerCase(),
                tipo_inmueble: tipo_inmueble.toLowerCase(),
                moneda: moneda.toUpperCase(),
                precio: parseFloat(precio),
                calle,
                altura,
                piso,
                departamento,
                ciudad,
                barrio,
                superficie_total: superficie_total ? parseFloat(superficie_total) : null,
                superficie_cubierta: superficie_cubierta ? parseFloat(superficie_cubierta) : null,
                dormitorios: dormitorios ? parseInt(dormitorios) : 0,
                banos: banos ? parseInt(banos) : 0,
                ambientes: ambientes ? parseInt(ambientes) : 0,
                cocheras: cocheras ? parseInt(cocheras) : 0,
                estado: 'disponible',
                imagenes_propiedad: {
                    create: (imagenes || []).map((url, index) => ({
                        url_imagen: url,
                        orden: index,
                        es_principal: index === 0
                    }))
                }
            }
        });
        res.status(201).json(nuevaPropiedad);
    } catch (error) {
        console.error('Error al crear propiedad:', error);

        if (error.message.includes('check constraint')) {
            return res.status(400).json({ error: 'Los datos no cumplen con las reglas de validación de la base de datos.' });
        }

        res.status(500).json({ error: 'Error al publicar la propiedad: ' + error.message });
    }
});

// ACTUALIZAR Propiedad
app.put('/api/propiedades/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    try {
        // Validaciones básicas de negocio
        if (data.precio && parseFloat(data.precio) < 0) {
            return res.status(400).json({ error: 'El precio no puede ser negativo.' });
        }

        // Primero borrar imágenes viejas si se mandan nuevas (simplificación para demo)
        if (data.imagenes) {
            await prisma.imagenes_propiedad.deleteMany({ where: { propiedad_id: parseInt(id) } });
        }

        const propiedadActualizada = await prisma.propiedades.update({
            where: { id: parseInt(id) },
            data: {
                titulo: data.titulo,
                descripcion: data.descripcion,
                tipo_operacion: data.tipo_operacion?.toLowerCase(),
                tipo_inmueble: data.tipo_inmueble?.toLowerCase(),
                moneda: data.moneda?.toUpperCase(),
                precio: data.precio ? parseFloat(data.precio) : undefined,
                calle: data.calle,
                altura: data.altura,
                piso: data.piso,
                departamento: data.departamento,
                ciudad: data.ciudad,
                barrio: data.barrio,
                superficie_total: data.superficie_total ? parseFloat(data.superficie_total) : undefined,
                superficie_cubierta: data.superficie_cubierta ? parseFloat(data.superficie_cubierta) : undefined,
                dormitorios: data.dormitorios ? parseInt(data.dormitorios) : undefined,
                banos: data.banos ? parseInt(data.banos) : undefined,
                ambientes: data.ambientes ? parseInt(data.ambientes) : undefined,
                cocheras: data.cocheras ? parseInt(data.cocheras) : undefined,
                estado: data.estado,
                imagenes_propiedad: data.imagenes ? {
                    create: data.imagenes.map((url, index) => ({
                        url_imagen: url,
                        orden: index,
                        es_principal: index === 0
                    }))
                } : undefined
            }
        });
        res.json(propiedadActualizada);
    } catch (error) {
        console.error('Error al actualizar:', error);

        // Manejo específico de errores de Prisma/Postgres
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Ya existe un registro con esos datos únicos.' });
        }
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'Error de integridad: Referencia no encontrada.' });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'La propiedad que intentas editar ya no existe o el ID es inválido.' });
        }
        if (error.message?.includes('check constraint')) {
            return res.status(400).json({ error: 'Los datos no cumplen con las reglas de validación (ej: precio negativo).' });
        }

        res.status(500).json({ error: 'Error inesperado al actualizar la propiedad: ' + error.message });
    }
});

// ELIMINAR Propiedad
app.delete('/api/propiedades/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Borrar imágenes primero (Relación manual si no hay cascade en Prisma o DB)
        await prisma.imagenes_propiedad.deleteMany({ where: { propiedad_id: parseInt(id) } });
        await prisma.propiedades.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Propiedad eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar:', error);
        res.status(500).json({ error: 'Error al eliminar la propiedad' });
    }
});

// Servir archivos estáticos al final (Fallback para SPA si fuera necesario)
app.use(express.static(__dirname));

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
