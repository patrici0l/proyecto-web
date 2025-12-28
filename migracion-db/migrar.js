require('dotenv').config();
const admin = require('firebase-admin');
const { Pool } = require('pg');
const serviceAccount = require('./firebase-key.json');

// --- CONFIGURACIÓN ---
// 1. Inicializar Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// 2. Conectar a PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'plataforma_programadores', // El nombre que le pusiste en pgAdmin
  password: '2004', // <--- CAMBIA ESTO por tu contraseña del paso anterior
  port: 5433,
});

async function migrar() {
  const client = await pool.connect();
  console.log('🚀 Iniciando migración...');

  try {
    await client.query('BEGIN'); // Iniciar transacción (si falla algo, no guarda nada)

    // ==========================================
    // 1. MIGRAR USUARIOS
    // ==========================================
    console.log('--- Migrando Usuarios ---');
    const usersSnap = await db.collection('usuarios').get();
    
    // Mapa para recordar: ID de Firebase -> ID de Postgres
    const mapFirebaseIdToPostgresId = new Map();

    for (const doc of usersSnap.docs) {
      const data = doc.data();
      const firebaseUid = data.uid || doc.id; // Asumimos que el UID está en el doc o es el ID del doc

      // Insertar en Postgres
      const res = await client.query(
        `INSERT INTO usuarios (firebase_uid, nombre, email, foto_url, rol, password_hash)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          firebaseUid,
          data.nombre || 'Sin Nombre',
          data.email,
          data.foto || null,
          data.rol || 'usuario', // Valor por defecto si falta
          'PENDIENTE_DE_HASH' // Placeholder hasta que implementes auth nueva
        ]
      );

      // Guardamos la relación: "El user X de firebase ahora es el ID Y en Postgres"
      const newPostgresId = res.rows[0].id;
      mapFirebaseIdToPostgresId.set(firebaseUid, newPostgresId);
    }
    console.log(`✅ ${usersSnap.size} usuarios migrados.`);

    // ==========================================
    // 2. MIGRAR PROGRAMADORES
    // ==========================================
    console.log('--- Migrando Programadores ---');
    const progSnap = await db.collection('programadores').get();
    
    // Mapa para proyectos: ID Programador Firebase -> ID Programador Postgres
    const mapProgFirebaseToPostgres = new Map();

    for (const doc of progSnap.docs) {
      const data = doc.data();
      // En tu Firestore, el programador debe tener un campo que lo vincule al usuario (ej: uid, o idUsuario)
      // Asumiremos que el ID del documento en 'programadores' es el mismo UID del usuario, o tiene un campo 'uid'.
      const usuarioFirebaseUid = data.uid || doc.id; 

      // Buscamos cuál es su ID real en Postgres usando el mapa del paso 1
      const postgresUserId = mapFirebaseIdToPostgresId.get(usuarioFirebaseUid);

      if (!postgresUserId) {
        console.warn(`⚠️ Programador con UID ${usuarioFirebaseUid} no encontrado en colección usuarios. Saltando.`);
        continue;
      }

      const res = await client.query(
        `INSERT INTO programadores (usuario_id, especialidad, descripcion, telefono)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          postgresUserId,
          data.especialidad || 'General',
          data.descripcion || '',
          data.telefono || ''
        ]
      );

      mapProgFirebaseToPostgres.set(doc.id, res.rows[0].id);
    }
    console.log(`✅ Programadores migrados.`);

    // ==========================================
    // 3. MIGRAR PROYECTOS
    // ==========================================
    console.log('--- Migrando Proyectos ---');
    const proySnap = await db.collection('proyectos').get();

    for (const doc of proySnap.docs) {
      const data = doc.data();
      // Buscamos el ID del programador en Postgres
      // (Asumiendo que en proyectos tienes un campo 'idProgramador' que coincide con el ID del doc en programadores)
      const pgProgId = mapProgFirebaseToPostgres.get(data.idProgramador);

      if (!pgProgId) {
        console.warn(`⚠️ Proyecto ${doc.id} sin programador válido (idProgramador: ${data.idProgramador}). Saltando.`);
        continue;
      }

      await client.query(
        `INSERT INTO proyectos (programador_id, titulo, descripcion, tecnologias, url_demo, url_repo, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          pgProgId,
          data.titulo,
          data.descripcion,
          data.tecnologias, // Si es array en firebase, conviértelo: data.tecnologias.join(', ')
          data.urlDemo || null,
          data.urlRepo || null,
          'activo' // Estado por defecto
        ]
      );
    }
    console.log(`✅ Proyectos migrados.`);

    await client.query('COMMIT'); // Confirmar cambios
    console.log('🎉 MIGRACIÓN COMPLETADA CON ÉXITO');

  } catch (e) {
    await client.query('ROLLBACK'); // Si falla, deshacer todo
    console.error('❌ Error en la migración:', e);
  } finally {
    client.release();
    pool.end();
  }
}

migrar();