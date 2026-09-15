# Integrar el área de Formación en tecnosoluciones.info

Destino: **https://tecnosoluciones.info/formacion/**

El proyecto es HTML, CSS y JavaScript estáticos. No necesita PHP, base de datos, Node ni
compilación: basta con copiar los archivos en el servidor.

---

## 1. Dos vías, según cómo publiques la web

**A) Si la web vive en el repositorio `tecnosoluciones-bcn/TecnoSoluciones`** (recomendado):
copia el contenido de este paquete en una carpeta `formacion/` dentro de ese repositorio,
añade el enlace en el menú y publica como publiques habitualmente. Así el área de Formación
queda versionada junto al resto de la web.

**B) Si subes los archivos por FTP o cPanel:** copia la carpeta directamente en el servidor,
como se describe abajo.

En ambos casos los archivos son los mismos y no hay nada que compilar.

---

## 2. Qué subir

Sube el contenido del paquete a una carpeta llamada `formacion` en la raíz de tu web
(la misma carpeta donde está el `index.html` de tecnosoluciones.info, normalmente
`public_html/`, `www/` o `httpdocs/`).

La estructura queda así:

```
public_html/
├── index.html              ← tu web actual, no se toca
├── …                       ← el resto de tu web, no se toca
└── formacion/              ← carpeta nueva
    ├── index.html          Portada del área de Formación
    ├── quiz.html           Módulo de Entrenamiento Técnico
    ├── assets/
    │   ├── css/style.css
    │   ├── js/  (brand.js, audio.js, data.js, app.js, formacion.js)
    │   └── og.jpg          Imagen al compartir el enlace
    └── data/cursos/        Banco de preguntas (5 archivos)
```

No hace falta subir `README.md` ni este archivo.

---

## 3. Enlazarlo desde tu menú

Añade el enlace en la navegación de tu web:

```html
<a href="/formacion/">Formación</a>
```

Con eso el apartado ya es accesible. La portada de Formación incluye a su vez un enlace de
vuelta a `tecnosoluciones.info`, en la cabecera y en el pie, para que el visitante no quede
atrapado en la sección.

---

## 4. Comprobaciones al terminar

1. Abre `https://tecnosoluciones.info/formacion/` → debe verse la portada azul con las cifras
   del temario (194 preguntas, 5 áreas, 25 categorías).
2. Pulsa **Empezar entrenamiento** → debe abrirse `quiz.html`.
3. Pulsa un área (por ejemplo *Redes y Cisco*) → debe abrir el entrenamiento con esa área ya
   marcada.
4. Responde una pregunta → debe sonar el efecto y aparecer la explicación.
5. Compruébalo en el móvil: el diseño se adapta a partir de 390 px.

Si la portada aparece sin estilos, es que la carpeta `assets/` no se subió completa.

---

## 5. Sobre el sonido

La música se genera en el navegador con la Web Audio API, así que no hay archivos de audio que
subir. Los navegadores no permiten reproducir sonido hasta que el visitante interactúa con la
página: la música arranca con el primer clic. Cada usuario puede ajustarla o silenciarla desde
el botón 🔊 de la cabecera.

---

## 6. Datos de los alumnos

No hay servidor ni base de datos. El progreso, los cursos propios y las preferencias de sonido
se guardan en el navegador de cada visitante (`localStorage`):

- No se envía ningún dato a ningún sitio.
- No se usan cookies de seguimiento, así que esto no cambia tu política de cookies.
- Si un alumno borra los datos del navegador, pierde su historial.

Para guardar resultados de forma centralizada (por ejemplo, ver las notas de una clase) haría
falta un backend; está previsto en el apartado *Siguientes pasos* del README.

---

## 7. Si cambia el dominio o la ruta

Todas las rutas internas son relativas, así que la carpeta funciona en cualquier ubicación sin
tocar nada. Solo hay dos sitios donde el dominio aparece escrito, y únicamente afectan al
enlace de vuelta y a la vista previa al compartir en redes:

| Qué | Dónde |
|---|---|
| Enlace de vuelta a tu web | `assets/js/brand.js`, campo `sitio` |
| Enlace canónico y vista previa | etiquetas `<link rel="canonical">` y `<meta property="og:…">` de `index.html` y `quiz.html` |

---

## 8. Actualizar en el futuro

Para publicar cambios, sustituye los archivos modificados. Si solo añades preguntas, basta con
subir de nuevo la carpeta `data/cursos/` y el `index.html` del área (las cifras de la portada se
calculan solas a partir del temario).

Conviene forzar la recarga de la caché del navegador con Ctrl+F5 al comprobarlo.
