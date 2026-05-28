/**
 * FitHub Manager - Módulo de Seguridad y Protección de Código/Contenido
 * 
 * Implementa un sistema de defensa multicapa en el navegador para evitar 
 * la copia de información y dificultar/congelar la inspección técnica.
 */

export function initSecurity() {
  if (typeof window === 'undefined') return;

  // 1. Bloquear Menú Contextual (Clic Derecho)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // 2. Bloquear Arrastre de Imágenes/Elementos (Dragstart)
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
  });

  // Auxiliar para saber si un elemento es editable
  const isEditable = (el: HTMLElement | null): boolean => {
    if (!el) return false;
    const tagName = el.tagName;
    return (
      tagName === 'INPUT' ||
      tagName === 'TEXTAREA' ||
      el.isContentEditable ||
      el.getAttribute('contenteditable') === 'true'
    );
  };

  // 3. Bloquear Selección e Inicio de Selección por Clic Arrastrado
  document.addEventListener('selectstart', (e) => {
    const target = e.target as HTMLElement;
    if (!isEditable(target)) {
      e.preventDefault();
    }
  });

  // 4. Bloquear Eventos de Portapapeles (Copiar y Cortar)
  document.addEventListener('copy', (e) => {
    const target = e.target as HTMLElement;
    if (!isEditable(target)) {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', 'Acción no permitida - Protegido por FitHub');
      }
    }
  });

  document.addEventListener('cut', (e) => {
    const target = e.target as HTMLElement;
    if (!isEditable(target)) {
      e.preventDefault();
    }
  });

  // 5. Bloquear Atajos de Teclado del Desarrollador (DevTools, View Source, Save)
  document.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    const isInput = isEditable(target);

    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+I o Cmd+Option+I (Inspect)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+J o Cmd+Option+J (Console)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+C o Cmd+Option+C (Inspect Element)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      return false;
    }

    // Ctrl+U o Cmd+Option+U (View Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      return false;
    }

    // Ctrl+S o Cmd+S (Save)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      return false;
    }

    // Ctrl+C o Ctrl+X fuera de campos de texto
    if (!isInput && (e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'x' || e.key === 'X')) {
      e.preventDefault();
      return false;
    }

    // Ctrl+A fuera de campos de texto (bloquear seleccionar todo el documento)
    if (!isInput && (e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      return false;
    }
  });

  // 6. Trampa Activa de Depuración (Bucle debugger)
  // Cuando las DevTools están cerradas, esto no pausa nada y no tiene coste de CPU apreciable.
  // Si las DevTools se abren, se hitting el debugger y congela el inspector y la app.
  const startDebuggerTrap = () => {
    const trap = () => {
      try {
        (function() {
          (function() {
            return true;
          }).constructor("debugger")();
        })();
      } catch (err) {}
      setTimeout(trap, 100);
    };
    trap();
  };

  // Retardamos un segundo el inicio de la trampa para una carga fluida de la app
  setTimeout(startDebuggerTrap, 1000);
}
