# About Me · Andres Herrera

Sitio web personal de tipo **"About me"** con aspecto de currículum, hecho con HTML5 semántico, CSS y JavaScript puro (sin librerías ni dependencias).

## Páginas

| Archivo | Contenido |
| --- | --- |
| `index.html` | Foto, nombre, breve descripción, datos generales y carnet |
| `academico.html` | Carnet, año de estudio, carrera, correo y GitHub |
| `perfil.html` | Habilidades y conocimientos, nivel académico, experiencia laboral, intereses y hobbies |

Las tres páginas comparten la misma navegación (menú superior y botón de página siguiente/anterior) y cada una tiene un cuadro para añadir una imagen.

## Cómo usarlo

1. Abre `index.html` en el navegador (no necesita servidor).
2. **Editar texto:** haz clic sobre cualquier texto y escribe. `Enter` termina la edición; `Ctrl+B` y `Ctrl+I` aplican negrita y cursiva. En las listas, `Enter` crea un elemento nuevo y `Retroceso` sobre un elemento vacío lo elimina.
3. **Añadir imagen:** haz clic en el cuadro de imagen (o arrastra un archivo encima). El botón *Quitar imagen* la elimina.
4. Todo se guarda automáticamente en el navegador (`localStorage`). El botón *Restablecer contenido* del pie vuelve al contenido original.

## Estructura

```
about-me/
├── index.html
├── academico.html
├── perfil.html
├── css/
│   └── styles.css
├── js/
│   └── script.js
├── .gitignore
└── README.md
```

## HTML5 semántico utilizado

`header`, `nav`, `main`, `section`, `article`, `aside`, `figure` / `figcaption`, `footer`, `address`, `dl` / `dt` / `dd`, `ul` / `li`, `strong`, `em`, `small`, `kbd`.

## Flujo de trabajo con Git

- Rama `main`: versión estable.
- Ramas `feature/*`: una por cada bloque de trabajo (estilos y script, páginas), integradas en `main` con `git merge --no-ff`.
- Mensajes de commit en español con prefijo: `chore:`, `feat:`, `docs:`.

Para subir el proyecto a GitHub:

```bash
git remote add origin https://github.com/Andres-Ale/<nombre-del-repositorio>.git
git push -u origin main --tags
```

## Autor

Andres Alessadro Herrera Orellana · carnet 00159926 · [@Andres-Ale](https://github.com/Andres-Ale)
