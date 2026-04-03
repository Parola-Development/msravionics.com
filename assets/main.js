(function(){
  const toggle = document.querySelector('[data-mobile-toggle]');
  const menu = document.querySelector('[data-menu]');
  if(toggle && menu){
    toggle.addEventListener('click', ()=> menu.classList.toggle('open'));
  }

  // Minimal cookie banner logic:
  // - Does NOT load non-essential scripts until user opts in.
  const banner = document.getElementById('cookie-banner');
  const key = 'msr_cookie_consent_v1';

  function getConsent(){
    try { return localStorage.getItem(key); } catch(e){ return null; }
  }
  function setConsent(v){
    try { localStorage.setItem(key, v); } catch(e){}
  }

  function showBanner(){
    if(!banner) return;
    banner.classList.add('show');
  }

  function hideBanner(){
    if(!banner) return;
    banner.classList.remove('show');
  }

  function loadAnalyticsIfConsented(){
    // Placeholder hook: add your analytics loader here
    // Only run if consent === 'accepted'
    // Example: dynamically inject your analytics script tag
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

})();
