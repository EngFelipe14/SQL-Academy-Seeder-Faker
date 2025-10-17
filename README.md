# SQL Academy Seeder Faker

Herramienta CLI en Node.js + TypeScript con Faker.js para generar datos realistas de comercio electrónico sobre un esquema SQL de 24 tablas. Puede exportar archivos CSV o poblar una base de datos MySQL, manteniendo la integridad referencial entre entidades (clientes, productos, inventario, pedidos, pagos, envíos, reseñas, etc.).

Esto la hace ideal para:

- Realizar pruebas
- Aprender SQL
- Simular entornos similares a los de producción.
- Practicar comandos Bash manipulando los archivos CSV generados

---

## Prerrequisitos

- Node.js ≥ 18 y npm
- MySQL (recomendado 8.x) con un usuario con permisos de creación e inserción
- Acceso a consola `mysql` (o cliente equivalente)

---

## Instalación

1. Clonar el repositorio e instalar dependencias:

   ```bash path=null start=null
   git clone https://github.com/EngFelipe14/SQL-Academy-Seeder-Faker.git
   cd SQL-Academy-Seeder-Faker
   npm install
   ```

2. Variables de entorno: crea un archivo `.env` en la raíz del proyecto tomando el ejemplo de `.env.example`:

   ```bash path=null start=null
   # .env
   DB_HOST="localhost"
   DB_PORT="3306"
   DB_USER="root"
   DB_PASSWORD="tu_clave"
   DB_NAME="ecommerce"
   ```

3. Crear la base de datos ejecutando el script SQL incluido: `doc/creationDB.sql`

---

## Uso

1. Elegir configuración en `src/index.ts` (por defecto usa `minimalSeedConfig`).
2. Ejecutar el script principal:

   ```bash
   npm run dev

   # O ejecutar directamente el archivo TypeScript (ambas opciones hacen lo mismo)
   npx ts-node src/index.ts
   ```

   Esto generará CSV en `src/CSV/` y poblará la base de datos con la configuración elegida.

### Ejecutar solo CSV o solo DB

Actualmente `src/index.ts` ejecuta ambos. Si quieres uno solo, comenta la llamada e importación correspondiente:

```ts path=/home/felipe/projects/SQL-Academy-Seeder-Faker/src/index.ts start=1
import { minimalSeedConfig } from './config/seedConfig/seedConfig.ts';
import { populateDatabase } from './scripts/populateDatabase.ts'; // ← comenta esta línea para solo CSV
import { generateCSV } from './scripts/generateCSVs.ts'; // ← comenta esta línea para solo DB

populateDatabase(minimalSeedConfig); // ← comenta esta línea para solo CSV
generateCSV(minimalSeedConfig);      // ← comenta esta línea para solo DB
```

> Carpeta de salida: si `src/CSV/` no existe, créala manualmente.

---

## Configuraciones disponibles

Las configuraciones están en `src/config/seedConfig/seedConfig.ts`:

| Configuración          | Descripción                                   | Uso recomendado                 |
|------------------------|-----------------------------------------------|---------------------------------|
| `minimalSeedConfig`    | Pocos registros, pruebas rápidas              | CSV o base de datos             |
| `standardSeedConfig`   | Volumen medio para desarrollo                  | CSV o base de datos             |
| `ultraSeedConfig`      | Volumen muy grande                             | Solo CSV (no recomendado en DB) |

> Nota: la inserción en DB aún no implementa inserciones por lotes (batch). Usar `ultraSeedConfig` para la insercción en DB fallaría. Este proceso lo estoy refactorizando.

---

## Crear nuevas configuraciones

1. Edita `src/config/seedConfig/seedConfig.ts` y agrega tu objeto de configuración.
2. Mantén la integridad referencial (IDs válidos entre entidades). Usa las configuraciones existentes como guía para proporciones entre tablas.

---

## Estructura del proyecto

```text path=null start=null
src/
├── config/
│   ├── envConfig/
│   │   └── envConfig.ts
│   ├── connectionDB/
│   │   └── connectionDB.ts
│   └── seedConfig/
│       └── seedConfig.ts
├── entities/               ← class generadora por entidad (CSV/DB)
├── scripts/
│   ├── generateCSVs.ts
│   └── populateDatabase.ts
├── index.ts                ← punto de entrada
└── CSV/                    ← salida de los CSV generados

doc/
└── creationDB.sql          ← script SQL para crear la base de datos
```

---

## Salida CSV

- Ubicación: `src/CSV/`
- Se genera un archivo por entidad (ej.: `Customers.csv`, `Products.csv`, `Addresses.csv`, ...)
- Ejemplo de cabeceras (`Customers.csv`):

```text path=null start=null
id,email,password_hash,first_name,last_name,phone,is_active,created_at,updated_at
```

---

## Limitaciones y rendimiento

- `ultraSeedConfig`: solo CSV. Requiere tiempo y espacio en disco considerables. (Si lo ejecutas y pasado un par de minutos no ha terminado, cancela)
- Inserción en DB sin colas (batch): grandes volúmenes fallarían por límites del motor.

---

## Solución de problemas

- ER_ACCESS_DENIED_ERROR: verifica `DB_USER`/`DB_PASSWORD` y permisos.
- Base de datos no existe: asegúrate de ejecutar `doc/creationDB.sql` con el usuario correcto.
- Tiempo de espera o lentitud: reduce el volumen (usa `minimal`/`standard`) o ejecuta solo CSV.
- Falta la carpeta `src/CSV/`: crea la carpeta antes de ejecutar.

---

## Contribución

¡Contribuciones bienvenidas! Abre un issue o PR. 

Estilo recomendado: TypeScript estricto (ver `tsconfig.json`).
