/* Viewport fitting without changing classroom data or the browser zoom. */
'use strict';
SM.layout = (() => {
  const MIN_SCALE = .7;
  function fitScale(width,height,contentWidth,contentHeight,enabled=true) {
    if (!enabled || ![width,height,contentWidth,contentHeight].every(n=>Number.isFinite(n)&&n>0)) return 1;
    const ratio=Math.min(1,width/contentWidth,height/contentHeight);
    // Long forms/reports stay readable and scroll inside the fixed shell.
    return ratio<MIN_SCALE ? 1 : Math.floor(ratio*1000)/1000;
  }
  function create(stage,enabled) {
    let observed=null,queued=false;
    function fit() {
      const frame=stage.querySelector('.slide-frame'),slide=stage.querySelector('.slide');
      if (!frame || !slide || typeof window.getComputedStyle!=='function') return;
      const css=window.getComputedStyle(stage);
      const availableWidth=stage.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight);
      const availableHeight=stage.clientHeight-parseFloat(css.paddingTop)-parseFloat(css.paddingBottom)-8;
      const contentWidth=slide.offsetWidth,contentHeight=slide.scrollHeight;
      const scale=fitScale(availableWidth,availableHeight,contentWidth,contentHeight,enabled()&&window.innerWidth>680);
      slide.style.transform=scale<1?'scale('+scale+')':'';
      frame.style.height=scale<1?Math.ceil(contentHeight*scale)+8+'px':'';
      frame.classList.toggle('is-fitted',scale<1);
      const scroll=contentHeight*scale>availableHeight+1;
      stage.dataset.view=scroll?'scroll':'fit';
      const hint=document.getElementById('view-hint');
      if(hint)hint.textContent=scroll?'Scroll content ↓':'';
    }
    function schedule() {
      if(queued)return;
      queued=true;
      (window.requestAnimationFrame||window.setTimeout)(()=>{queued=false;fit()});
    }
    const observer=typeof window.ResizeObserver==='function'?new window.ResizeObserver(schedule):null;
    if(observer)observer.observe(stage);
    function refresh() {
      const slide=stage.querySelector('.slide');
      if(observer&&slide!==observed){if(observed)observer.unobserve(observed);if(slide)observer.observe(slide);observed=slide}
      fit();
    }
    window.addEventListener('resize',schedule);
    document.addEventListener('fullscreenchange',schedule);
    // Capturing toggle also covers browsers without ResizeObserver.
    stage.addEventListener('toggle',schedule,true);
    if(document.fonts?.ready)document.fonts.ready.then(schedule);
    return {refresh};
  }
  return {fitScale,create,MIN_SCALE};
})();
