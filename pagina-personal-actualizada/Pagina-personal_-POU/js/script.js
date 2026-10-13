/* =========================================================
   About Me · Andres Herrera
   - Texto editable con guardado automático (localStorage)
   - Cuadro de imagen por página (clic o arrastrar y soltar)
   - Enlaces (correo, GitHub) que siguen al texto editado
   ========================================================= */

(() => {
  'use strict';

  const PREFIJO = 'aboutme:';
  const MAX_LADO_IMAGEN = 900; // px: se reduce la imagen para que quepa en localStorage

  // Etiquetas de formato que se conservan al guardar y restaurar el texto
  const FORMATO = { STRONG: 'strong', B: 'strong', EM: 'em', I: 'em', BR: 'br' };

  /* ---------- Almacenamiento (con tolerancia a errores) ---------- */

  const guardar = (clave, valor) => {
    try {
      localStorage.setItem(PREFIJO + clave, valor);
      return true;
    } catch {
      return false;
    }
  };

  const leer = (clave) => {
    try {
      return localStorage.getItem(PREFIJO + clave);
    } catch {
      return null;
    }
  };

  const borrarTodo = () => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIJO))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* sin almacenamiento: no hay nada que borrar */
    }
  };

  /* ---------- Mensajes de estado ---------- */

  let temporizadorEstado;
  const avisar = (mensaje) => {
    const estado = document.querySelector('.estado');
    if (!estado) return;
    estado.textContent = mensaje;
    clearTimeout(temporizadorEstado);
    temporizadorEstado = setTimeout(() => (estado.textContent = ''), 3500);
  };

  /* ---------- HTML seguro: solo strong, em y br ---------- */

  const limpiar = (origen) => {
    const fragmento = document.createDocumentFragment();
    origen.childNodes.forEach((nodo) => {
      if (nodo.nodeType === Node.TEXT_NODE) {
        fragmento.append(document.createTextNode(nodo.textContent));
      } else if (nodo.nodeType === Node.ELEMENT_NODE) {
        const etiqueta = FORMATO[nodo.tagName];
        if (etiqueta === 'br') {
          fragmento.append(document.createElement('br'));
        } else if (etiqueta) {
          const el = document.createElement(etiqueta);
          el.append(limpiar(nodo));
          fragmento.append(el);
        } else {
          fragmento.append(limpiar(nodo)); // cualquier otra etiqueta se descarta
        }
      }
    });
    return fragmento;
  };

  const htmlSeguro = (html) => {
    const plantilla = document.createElement('template');
    plantilla.innerHTML = html;
    return limpiar(plantilla.content);
  };

  /* ---------- Texto editable ---------- */

  const hacerEditable = (el) => {
    el.contentEditable = 'true';
    el.spellcheck = false;
  };

  const nuevoItem = (html = '') => {
    const li = document.createElement('li');
    li.append(htmlSeguro(html));
    hacerEditable(li);
    return li;
  };

  const enfocar = (el, alFinal = true) => {
    el.focus();
    const rango = document.createRange();
    rango.selectNodeContents(el);
    rango.collapse(!alFinal);
    const seleccion = window.getSelection();
    seleccion.removeAllRanges();
    seleccion.addRange(rango);
  };

  const guardarCampo = (el) => {
    guardar(el.dataset.edit, el.innerHTML);
  };

  const guardarLista = (ul) => {
    const items = [...ul.children]
      .filter((li) => li.textContent.trim() !== '')
      .map((li) => li.innerHTML);
    guardar(ul.dataset.lista, JSON.stringify(items));
  };

  const restaurarCampo = (el) => {
    const guardado = leer(el.dataset.edit);
    if (guardado !== null) el.replaceChildren(htmlSeguro(guardado));
  };

  const restaurarLista = (ul) => {
    const guardado = leer(ul.dataset.lista);
    if (guardado === null) return;
    try {
      const items = JSON.parse(guardado);
      if (Array.isArray(items) && items.length) {
        ul.replaceChildren(...items.map((html) => nuevoItem(String(html))));
      }
    } catch {
      /* dato dañado: se conserva el contenido original */
    }
  };

  const iniciarTextos = () => {
    document.querySelectorAll('[data-edit]').forEach((el) => {
      restaurarCampo(el);
      hacerEditable(el);
    });

    document.querySelectorAll('[data-lista]').forEach((ul) => {
      restaurarLista(ul);
      [...ul.children].forEach(hacerEditable);
    });

    // Guardado automático
    document.addEventListener('input', (e) => {
      const campo = e.target.closest('[data-edit]');
      if (campo) guardarCampo(campo);

      const lista = e.target.closest('[data-lista]');
      if (lista) guardarLista(lista);

      actualizarEnlaces();
    });

    // Enter y Retroceso
    document.addEventListener('keydown', (e) => {
      const item = e.target.closest?.('[data-lista] > li');
      if (item) {
        const ul = item.parentElement;
        if (e.key === 'Enter') {
          e.preventDefault();
          const siguiente = nuevoItem();
          item.after(siguiente);
          enfocar(siguiente);
          guardarLista(ul);
        } else if (e.key === 'Backspace' && item.textContent === '' && ul.children.length > 1) {
          e.preventDefault();
          const destino = item.previousElementSibling || item.nextElementSibling;
          const eraAnterior = Boolean(item.previousElementSibling);
          item.remove();
          enfocar(destino, eraAnterior);
          guardarLista(ul);
        }
        return;
      }

      const campo = e.target.closest?.('[data-edit]');
      if (campo && e.key === 'Enter') {
        e.preventDefault(); // un solo renglón: Enter confirma la edición
        campo.blur();
      }
    });

    // Al pegar, siempre texto plano en una sola línea
    document.addEventListener('paste', (e) => {
      const editable = e.target.closest?.('[contenteditable="true"]');
      if (!editable) return;
      e.preventDefault();
      const texto = (e.clipboardData || window.clipboardData)
        .getData('text/plain')
        .replace(/\s*[\r\n]+\s*/g, ' ');
      document.execCommand('insertText', false, texto);
    });
  };

  /* ---------- Enlaces que siguen al texto ---------- */

  const actualizarEnlaces = () => {
    document.querySelectorAll('a[data-fuente]').forEach((a) => {
      const fuente = document.querySelector(`[data-edit="${a.dataset.fuente}"]`);
      if (!fuente) return;
      const valor = fuente.textContent.trim();
      const plantilla = a.dataset.plantilla;
      a.href = plantilla.replace('{}', plantilla.startsWith('mailto:') ? valor : encodeURIComponent(valor));
    });
  };

  /* ---------- Cuadro de imagen ---------- */

  const redimensionar = (archivo) =>
    new Promise((resolve, reject) => {
      if (!archivo || !archivo.type.startsWith('image/')) {
        reject(new Error('No es una imagen'));
        return;
      }
      const url = URL.createObjectURL(archivo);
      const img = new Image();
      img.onload = () => {
        const ancho = img.naturalWidth || MAX_LADO_IMAGEN;
        const alto = img.naturalHeight || MAX_LADO_IMAGEN;
        const escala = Math.min(1, MAX_LADO_IMAGEN / Math.max(ancho, alto));
        const lienzo = document.createElement('canvas');
        lienzo.width = Math.round(ancho * escala);
        lienzo.height = Math.round(alto * escala);
        const ctx = lienzo.getContext('2d');
        ctx.fillStyle = '#ffffff'; // fondo para PNG con transparencia
        ctx.fillRect(0, 0, lienzo.width, lienzo.height);
        ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height);
        URL.revokeObjectURL(url);
        resolve(lienzo.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('No se pudo leer la imagen'));
      };
      img.src = url;
    });

  const iniciarFoto = (figura) => {
    const id = 'foto:' + figura.dataset.foto;
    const boton = figura.querySelector('.foto__caja');
    const entrada = figura.querySelector('.foto__input');
    const img = figura.querySelector('.foto__img');
    const quitar = figura.querySelector('.foto__quitar');

    const mostrar = (src) => {
      if (src) {
        img.src = src;
        img.alt = figura.querySelector('figcaption [data-edit]')?.textContent.trim() || 'Imagen añadida';
        img.hidden = false;
        quitar.hidden = false;
        figura.classList.add('foto--tiene-imagen');
      } else {
        img.removeAttribute('src');
        img.hidden = true;
        quitar.hidden = true;
        figura.classList.remove('foto--tiene-imagen');
      }
    };

    const cargar = async (archivo) => {
      try {
        const datos = await redimensionar(archivo);
        mostrar(datos);
        if (!guardar(id, datos)) {
          avisar('La imagen se ve, pero el navegador no pudo guardarla para la próxima visita.');
        }
      } catch {
        avisar('No se pudo leer ese archivo. Prueba con una imagen JPG o PNG.');
      }
    };

    const guardada = leer(id);
    if (guardada) mostrar(guardada);

    boton.addEventListener('click', () => entrada.click());

    entrada.addEventListener('change', () => {
      if (entrada.files[0]) cargar(entrada.files[0]);
      entrada.value = '';
    });

    quitar.addEventListener('click', () => {
      try {
        localStorage.removeItem(PREFIJO + id);
      } catch {
        /* nada que borrar */
      }
      mostrar(null);
    });

    ['dragenter', 'dragover'].forEach((tipo) =>
      figura.addEventListener(tipo, (e) => {
        e.preventDefault();
        figura.classList.add('foto--arrastrando');
      })
    );

    ['dragleave', 'drop'].forEach((tipo) =>
      figura.addEventListener(tipo, (e) => {
        e.preventDefault();
        figura.classList.remove('foto--arrastrando');
      })
    );

    figura.addEventListener('drop', (e) => {
      const archivo = e.dataTransfer?.files[0];
      if (archivo) cargar(archivo);
    });
  };

  /* ---------- Restablecer ---------- */

  const iniciarRestablecer = () => {
    const boton = document.getElementById('restablecer');
    if (!boton) return;
    boton.addEventListener('click', () => {
      if (confirm('¿Restablecer todo el texto y las imágenes de las 3 páginas a su contenido original?')) {
        borrarTodo();
        location.reload();
      }
    });
  };

  /* ---------- Arranque ---------- */

  document.addEventListener('DOMContentLoaded', () => {
    iniciarTextos();
    document.querySelectorAll('[data-foto]').forEach(iniciarFoto);
    actualizarEnlaces();
    iniciarRestablecer();
  });
})();
