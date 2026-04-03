(function(){
  const toggle = document.querySelector('[data-mobile-toggle]');
  const menu = document.querySelector('[data-menu]');
  if(toggle && menu){
    if(!menu.id) menu.id = 'site-menu';
    toggle.setAttribute('aria-controls', menu.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', ()=>{
      const isOpen = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const banner = document.getElementById('cookie-banner');
  const key = 'msr_cookie_consent_v1';

  function getConsent(){
    try { return localStorage.getItem(key); } catch(e){ return null; }
  }

  function setConsent(v){
    try { localStorage.setItem(key, v); } catch(e){}
  }

  function showBanner(){
    if(banner) banner.classList.add('show');
  }

  function hideBanner(){
    if(banner) banner.classList.remove('show');
  }

  function loadAnalyticsIfConsented(){
    // Hook for optional analytics loading after explicit consent.
  }

  const consent = getConsent();
  if(!consent){
    showBanner();
  } else if(consent === 'accepted'){
    loadAnalyticsIfConsented();
  }

  const acceptBtn = document.querySelector('[data-cookie-accept]');
  const rejectBtn = document.querySelector('[data-cookie-reject]');
  if(acceptBtn) acceptBtn.addEventListener('click', ()=>{ setConsent('accepted'); hideBanner(); loadAnalyticsIfConsented(); });
  if(rejectBtn) rejectBtn.addEventListener('click', ()=>{ setConsent('rejected'); hideBanner(); });

  function setFormStatus(form, message, type){
    const status = form.querySelector('[data-form-status]');
    if(!status) return;
    status.textContent = message;
    status.className = 'formStatus';
    if(type === 'ok') status.classList.add('ok');
    if(type === 'err') status.classList.add('err');
  }

  function setFormPending(form, pending){
    const submit = form.querySelector('button[type="submit"]');
    if(submit) submit.disabled = pending;
    form.classList.toggle('isSubmitting', pending);
  }

  function wireRemoteForm(selector){
    const form = document.querySelector(selector);
    if(!form) return;

    form.addEventListener('submit', async function(e){
      e.preventDefault();
      if(typeof form.reportValidity === 'function' && !form.reportValidity()){
        return;
      }

      setFormPending(form, true);
      setFormStatus(form, 'Sending your enquiry...', null);

      try {
        const body = new URLSearchParams(new FormData(form));
        const response = await fetch(form.action, {
          method: 'POST',
          body
        });

        const payload = await response.json().catch(function(){ return null; });
        if(!response.ok || !payload || !payload.ok){
          throw new Error(payload && payload.message ? payload.message : 'We could not send your enquiry right now. Please try again or call us.');
        }

        setFormStatus(form, payload.message, 'ok');
        form.reset();
      } catch(error){
        setFormStatus(form, error.message || 'We could not send your enquiry right now. Please try again or call us.', 'err');
      } finally {
        setFormPending(form, false);
      }
    });
  }

  wireRemoteForm('[data-contact-form]');
  wireRemoteForm('[data-rfq-form]');
})();
