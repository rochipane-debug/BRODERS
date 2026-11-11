/* ============================================================
   BRODERS — JavaScript
   1. Año del footer
   2. Menú lateral (drawer) en mobile
   3. Generación de horarios
   4. Validación del formulario de reservas
   5. Cierre del drawer al navegar
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 1. Año dinámico en el footer ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 2. Drawer (menú lateral mobile) ---------- */
  var burger    = document.getElementById('burgerBtn');
  var drawer    = document.getElementById('drawer');
  var overlay   = document.getElementById('drawerOverlay');
  var closeBtn  = document.getElementById('drawerClose');

  function openDrawer() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (overlay) {
      overlay.hidden = false;
      // pequeño delay para que la transición de opacidad se aprecie
      requestAnimationFrame(function () { overlay.classList.add('is-visible'); });
    }
    if (burger) burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (overlay) {
      overlay.classList.remove('is-visible');
      setTimeout(function () { overlay.hidden = true; }, 300);
    }
    if (burger) { burger.setAttribute('aria-expanded', 'false'); burger.focus(); }
    document.body.style.overflow = '';
  }

  if (burger)   burger.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay)  overlay.addEventListener('click', closeDrawer);

  // Cerrar con tecla Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) closeDrawer();
  });

  /* ---------- 3. Cierre del drawer al hacer clic en un enlace ---------- */
  if (drawer) {
    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });
  }

  /* ---------- 4. Horarios del selector HORA ---------- */
  // Se generan horarios de 12:00 a 23:30 en intervalos de 30 minutos.
  var horaSelect = document.getElementById('hora');
  if (horaSelect) {
    for (var h = 12; h <= 23; h++) {
      for (var m = 0; m < 60; m += 30) {
        if (h === 23 && m > 30) continue;
        var value = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
        var opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        horaSelect.appendChild(opt);
      }
    }
  }

  /* ---------- 5. Validación del formulario de reservas ---------- */
  var form     = document.getElementById('reservaForm');
  var formMsg  = document.getElementById('formMsg');
  var fechaIn  = document.getElementById('fecha');

  // Fecha mínima = hoy (evita fechas pasadas)
  if (fechaIn) {
    var today = new Date();
    var yyyy  = today.getFullYear();
    var mm    = String(today.getMonth() + 1).padStart(2, '0');
    var dd    = String(today.getDate()).padStart(2, '0');
    fechaIn.min = yyyy + '-' + mm + '-' + dd;
  }

  function setError(fieldId, message) {
    var field = document.getElementById(fieldId);
    if (!field) return;
    var box = field.closest('.field');
    var err = box ? box.querySelector('.field__error') : null;
    if (box) box.classList.add('has-error');
    if (err) err.textContent = message || '';
  }

  function clearError(fieldId) {
    var field = document.getElementById(fieldId);
    if (!field) return;
    var box = field.closest('.field');
    var err = box ? box.querySelector('.field__error') : null;
    if (box) box.classList.remove('has-error');
    if (err) err.textContent = '';
  }

  // Limpiar el error al corregir el campo
  ['fecha', 'ubicacion', 'personas', 'hora'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', function () { clearError(id); });
    if (el) el.addEventListener('change', function () { clearError(id); });
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var ok = true;
      var fecha     = document.getElementById('fecha');
      var ubicacion = document.getElementById('ubicacion');
      var personas  = document.getElementById('personas');
      var hora      = document.getElementById('hora');

      // Fecha
      if (!fecha.value) {
        setError('fecha', 'Seleccioná una fecha.'); ok = false;
      } else {
        var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
        var sel = new Date(fecha.value + 'T00:00:00');
        if (sel < hoy) { setError('fecha', 'La fecha no puede ser anterior a hoy.'); ok = false; }
        else clearError('fecha');
      }

      // Ubicación
      if (!ubicacion.value) { setError('ubicacion', 'Elegí ADENTRO o AFUERA.'); ok = false; }
      else clearError('ubicacion');

      // Personas
      if (!personas.value) { setError('personas', 'Indicá la cantidad de personas.'); ok = false; }
      else clearError('personas');

      // Hora
      if (!hora.value) { setError('hora', 'Elegí un horario.'); ok = false; }
      else clearError('hora');

      if (!ok) {
        formMsg.className = 'form-msg is-err';
        formMsg.textContent = 'Revisá los campos marcados antes de continuar.';
        return;
      }

      // Formatear fecha legible (dd/mm/aaaa)
      var f = fecha.value.split('-');
      var fechaTxt = f[2] + '/' + f[1] + '/' + f[0];

      var resumen =
        'Fecha: ' + fechaTxt + '\n' +
        'Ubicación: ' + ubicacion.value + '\n' +
        'Personas: ' + personas.options[personas.selectedIndex].text + '\n' +
        'Hora: ' + hora.value;

      // Confirmación: SE ACLARA que es una SOLICITUD, no una reserva aceptada
      formMsg.className = 'form-msg is-ok';
      formMsg.innerHTML =
        '<div class="msg-card">' +
          '<strong>¡Solicitud de reserva enviada!</strong><br>' +
          'Tu pedido fue registrado como <em>solicitud</em>, no como una reserva confirmada. ' +
          'Te contactaremos para confirmar disponibilidad.<br><br>' +
          resumen.replace(/\n/g, '<br>') +
        '</div>';

      form.reset();
    });
  }

})();