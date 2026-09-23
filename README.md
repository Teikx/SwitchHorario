# 🎮 SwitchHorario - Sistema de Gestión de Horarios para Nintendo Switch

Una aplicación web moderna, interactiva y temática inspirada en la **Nintendo Switch** (diseño Joy-Con Rojo Neón / Azul Neón y modo oscuro OLED) para coordinar y reservar turnos de juego entre primos y familiares.

---

## 🚀 Características Principales

1. **🔴 Estado en Vivo (Live Status):**
   - Muestra en tiempo real si la Switch está ocupada o libre.
   - Si está en uso: muestra quién está jugando, el juego, barra de tiempo transcurrido y cuenta regresiva de minutos restantes.
   - **Botón "Liberar Consola":** Si un primo termina de jugar antes de su hora, puede presionar este botón para liberar el tiempo restante y permitir que otro primo juegue.
2. **📅 Calendario Interactivo:**
   - **Vista Semanal:** Grilla de lunes a domingo de 8:00 AM a 11:00 PM.
   - **Vista Diaria:** Lista cronológica detallada hora por hora.
   - Haz clic en cualquier espacio vacío para abrir la reserva prellenada en esa hora.
3. **⚡️ Prevención de Colisiones de Horario:**
   - Valida en tiempo real que dos primos no puedan reservar la misma hora (cero solapamientos).
   - Aviso visual instantáneo antes de guardar.
4. **🍄 Perfiles de Primos con Personajes de Nintendo:**
   - Cada primo elige su avatar (Mario, Luigi, Peach, Bowser, Yoshi, Link, Zelda, Pikachu, etc.) y su color temático de Joy-Con.
   - PIN opcional de 4 dígitos para proteger turnos.
   - Contador de horas jugadas por primo (para asegurar un reparto justo).
5. **📜 Reglas de Convivencia Integradas:**
   - Máximo 2 horas continuas por turno.
   - Cuidado de los controles Joy-Cons y batería.
   - Respeto a los horarios agendados.
6. **☁️ Persistencia Gratuita e Híbrida:**
   - **Modo Local Automático:** Funciona de inmediato en tu navegador (`localStorage`) para probarlo sin configurar nada.
   - **Modo Nube con Supabase:** Base de datos PostgreSQL gratuita en la nube con visualizador tipo hoja de cálculo (Table Editor).

---

## 🛠️ Tecnologías

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/) + TypeScript + React 19
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) con paleta Nintendo Switch Joy-Con Neón
- **Iconos & Efectos:** [Lucide Icons](https://lucide.dev/) + Canvas Confetti
- **Fechas:** Date-fns (localizado en español)
- **Base de Datos Gratuita:** [Supabase](https://supabase.com) (PostgreSQL) con fallback a LocalStorage
- **Despliegue:** [Vercel](https://vercel.com)

---

## 💻 Ejecución en Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abre tu navegador en:
   ```
   http://localhost:3000
   ```
   *(La app ya viene con datos de prueba de Carlos, Mateo, Lucía y Santi listos para interactuar).*

---

## 🗄️ Configuración de Base de Datos Gratuita (Supabase)

Para que todos los primos puedan ver y reservar horarios desde sus celulares o computadoras en tiempo real:

1. Ve a [Supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. Crea un nuevo proyecto (ejemplo: `switch-horario`).
3. Ve a la pestaña **SQL Editor** en el menú lateral izquierdo.
4. Abre el archivo [`schema.sql`](schema.sql) de este proyecto, copia todo su contenido y pégalo en el editor SQL de Supabase.
5. Haz clic en **Run** (¡Listo! Creará las tablas `players` y `bookings` con los permisos públicos para tu familia).
6. Ve a **Project Settings** -> **API** y copia:
   - **Project URL**
   - **anon / public key**
7. Crea un archivo `.env.local` en este proyecto con esos valores:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
   ```

---

## 🚀 Despliegue Gratis en Vercel

1. Sube este proyecto a tu repositorio de GitHub:
   ```bash
   git add .
   git commit -m "feat: SwitchHorario sistema completo"
   git branch -M main
   # Vincula tu repositorio remoto y haz push
   ```
2. Entra a [Vercel.com](https://vercel.com) e inicia sesión con tu GitHub.
3. Haz clic en **"Add New..."** -> **"Project"**.
4. Selecciona tu repositorio `SwitchHorario`.
5. En la sección **Environment Variables**, agrega las dos variables de Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Haz clic en **"Deploy"**.
7. En menos de 1 minuto tendrás un enlace público (ej. `https://switch-horario.vercel.app`) para compartir en el grupo de WhatsApp de tus primos.
