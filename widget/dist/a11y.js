(function(){"use strict";const p={fontSize:0,highContrast:!1,grayscale:!1,highlightLinks:!1,bigCursor:!1},u="bugbox_a11y",f=["100%","120%","145%"];class S{constructor(){this.listeners=new Set,this.state=this.load()}load(){try{const t=localStorage.getItem(u);return t?{...p,...JSON.parse(t)}:{...p}}catch(t){return{...p}}}persist(){try{localStorage.setItem(u,JSON.stringify(this.state))}catch(t){}}get(){return this.state}update(t){this.state={...this.state,...t},this.persist(),this.emit()}reset(){this.state={...p};try{localStorage.removeItem(u)}catch(t){}this.emit()}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}emit(){for(const t of this.listeners)t(this.state)}}const L="https://nblbeaawytyuxgfoixlj.supabase.co",y="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ibGJlYWF3eXR5dXhnZm9peGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NDQ1NTcsImV4cCI6MjA5OTAyMDU1N30.ZHVeYpEBf2tUpS1iz30YXjVierROAgqrHJG5zHSmyJo";function E(e){var a;const t=(a=e==null?void 0:e.dataset)!=null?a:{};return{protectMedia:t.protectMedia!=="0",disableTextSelection:t.noTextSelect==="1",removeTapHighlight:t.tapHighlight!=="0",disableLinkLongPress:t.noLinkPreview!=="0",preventCopy:t.noCopy==="1",preventPrint:t.noPrint==="1"}}function A(e){var t;return(t=e==null?void 0:e.dataset.siteKey)!=null?t:""}async function T(e,t){var a,o,i,r,c;if(!e)return null;try{const s=await fetch(`${L}/rest/v1/rpc/get_widget_config`,{method:"POST",headers:{apikey:y,authorization:`Bearer ${y}`,"content-type":"application/json"},body:JSON.stringify({p_site_key:e})});if(!s.ok)return null;const l=await s.json();return l?{protection:{...t,...(a=l.protection)!=null?a:{}},statement:{url:(o=l.statement_url)!=null?o:null,coordinatorName:(i=l.coordinator_name)!=null?i:null,coordinatorPhone:(r=l.coordinator_phone)!=null?r:null,coordinatorEmail:(c=l.coordinator_email)!=null?c:null}}:null}catch(s){return null}}function b(e){var a;const t=document.documentElement;t.style.setProperty("--a11y-font-scale",(a=f[e.fontSize])!=null?a:f[0]),t.classList.toggle("a11y-high-contrast",e.highContrast),t.classList.toggle("a11y-grayscale",e.grayscale),t.classList.toggle("a11y-highlight-links",e.highlightLinks),t.classList.toggle("a11y-big-cursor",e.bigCursor)}let d=null,m=!1;function x(e){d=e;const t=document.documentElement;if(t.classList.toggle("a11y-protect-media",e.protectMedia),t.classList.toggle("a11y-no-select",e.disableTextSelection),t.classList.toggle("a11y-no-tap-highlight",e.removeTapHighlight),t.classList.toggle("a11y-no-link-preview",e.disableLinkLongPress),t.classList.toggle("a11y-no-print",e.preventPrint),!m){m=!0;const a=o=>o instanceof Element&&/^(IMG|VIDEO|PICTURE|SOURCE)$/.test(o.tagName)&&!o.closest("#a11y-widget-root");document.addEventListener("dragstart",o=>{d!=null&&d.protectMedia&&a(o.target)&&o.preventDefault()}),document.addEventListener("contextmenu",o=>{d!=null&&d.protectMedia&&a(o.target)&&o.preventDefault()},{capture:!0}),document.addEventListener("copy",o=>{if(!(d!=null&&d.preventCopy))return;const i=document.activeElement;i&&(i.tagName==="INPUT"||i.tagName==="TEXTAREA"||i.isContentEditable||i.closest("#a11y-widget-root"))||o.preventDefault()})}}function I(){return`
#a11y-widget-root, #a11y-widget-root * { box-sizing: border-box; }
#a11y-widget-root {
  font-family: system-ui, "Segoe UI", Arial, "Alef", "Heebo", sans-serif;
  direction: rtl;
}

/* ---- Trigger button — black circle, ISA wheelchair icon, bottom-left ---- */
.a11y-trigger {
  position: fixed; left: 32px; bottom: 24px; z-index: 2147483646;
  width: 36px; height: 36px; border-radius: 9999px;
  background: #000; color: #fff; border: 0; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,.3);
  transition: transform .2s ease, background .2s ease;
}
.a11y-trigger:hover { background: #1f2937; transform: scale(1.1); }
.a11y-trigger:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
.a11y-trigger svg { width: 18px; height: 18px; fill: currentColor; }
@media (max-width: 768px) { .a11y-trigger { left: 16px; bottom: 16px; } }

/* ---- Panel ---- */
.a11y-panel {
  position: fixed; left: 16px; bottom: 80px; z-index: 2147483647;
  width: 288px; max-width: calc(100vw - 32px);
  background: #111; border: 1px solid #333; border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,.6); overflow: hidden;
  color: #fff; opacity: 0; visibility: hidden; transform: translateY(8px);
  transition: opacity .15s ease, transform .15s ease, visibility .15s;
}
.a11y-panel[data-open="true"] { opacity: 1; visibility: visible; transform: translateY(0); }
@media (max-width: 768px) { .a11y-panel { left: 16px; bottom: 64px; } }

.a11y-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #000; border-bottom: 1px solid #333;
}
.a11y-header-title { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; }
.a11y-header-title svg { width: 20px; height: 20px; fill: #fff; }
.a11y-close { background: transparent; border: 0; color: #9ca3af; cursor: pointer; padding: 4px; border-radius: 9999px; line-height: 0; }
.a11y-close:hover { color: #fff; }
.a11y-close:focus-visible { outline: 2px solid #fff; }
.a11y-close svg { width: 16px; height: 16px; }

.a11y-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.a11y-section-label { font-size: 12px; font-weight: 600; color: #9ca3af; margin: 0 0 8px; }

/* Font-size buttons */
.a11y-font-row { display: flex; gap: 8px; }
.a11y-font-btn {
  flex: 1; height: 44px; border-radius: 12px; font-weight: 700; cursor: pointer;
  border: 2px solid #4b5563; background: transparent; color: #d1d5db; transition: all .15s ease;
}
.a11y-font-btn:hover { border-color: #9ca3af; }
.a11y-font-btn[aria-pressed="true"] { border-color: #fff; background: #fff; color: #000; }
.a11y-font-btn:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }

/* Toggle rows */
.a11y-toggle {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px; border-radius: 12px; border: 1px solid #374151;
  background: transparent; color: #9ca3af; cursor: pointer; transition: all .15s ease;
}
.a11y-toggle:hover { border-color: #6b7280; color: #e5e7eb; }
.a11y-toggle[aria-pressed="true"] { border-color: #fff; background: rgba(255,255,255,.1); color: #fff; }
.a11y-toggle:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
.a11y-toggle-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; }
.a11y-switch { position: relative; width: 36px; height: 20px; border-radius: 9999px; background: #4b5563; transition: background .15s ease; flex: 0 0 auto; }
.a11y-toggle[aria-pressed="true"] .a11y-switch { background: #fff; }
.a11y-switch::after {
  content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;
  border-radius: 9999px; background: #d1d5db; box-shadow: 0 1px 2px rgba(0,0,0,.4); transition: left .15s ease, background .15s ease;
}
.a11y-toggle[aria-pressed="true"] .a11y-switch::after { left: 18px; background: #000; }

/* Reset */
.a11y-reset {
  width: 100%; height: 36px; display: flex; align-items: center; justify-content: center; gap: 8px;
  border-radius: 12px; border: 1px solid #374151; background: transparent;
  color: #9ca3af; font-size: 12px; font-weight: 500; cursor: pointer; transition: all .15s ease;
}
.a11y-reset:hover { border-color: #6b7280; color: #e5e7eb; }
.a11y-reset:focus-visible { outline: 2px solid #fff; }
.a11y-reset svg { width: 14px; height: 14px; }

.a11y-sr-only { position: absolute !important; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

/* Accessibility statement + coordinator (legally required) */
.a11y-statement { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; padding-top: 12px; border-top: 1px solid #333; }
.a11y-statement .a11y-section-label { margin: 0; }
.a11y-statement a { color: #93c5fd; font-size: 13px; text-decoration: none; }
.a11y-statement a:hover { text-decoration: underline; }
.a11y-statement a:focus-visible { outline: 2px solid #93c5fd; outline-offset: 2px; }
.a11y-coordinator { display: flex; flex-direction: column; gap: 4px; margin-top: 2px; }
.a11y-coord-name { font-size: 12px; color: #9ca3af; }

/* =========================================================================
   FEATURE CSS — identical to the bugbox index.css a11y-* effects.
   ========================================================================= */
:root { --a11y-font-scale: 100%; }
html { font-size: var(--a11y-font-scale) !important; }

html.a11y-high-contrast * {
  background: #000 !important;
  color: #fff !important;
  border-color: #fff !important;
  box-shadow: none !important;
}
html.a11y-high-contrast img,
html.a11y-high-contrast video { filter: brightness(.85) contrast(1.2) !important; }
html.a11y-high-contrast a,
html.a11y-high-contrast button { color: #ffff00 !important; }

html.a11y-grayscale * { filter: grayscale(100%) !important; }

html.a11y-highlight-links a {
  outline: 3px solid #2563eb !important;
  background: #dbeafe !important;
  color: #1e3a8a !important;
  border-radius: 3px; padding: 0 2px;
}

html.a11y-big-cursor,
html.a11y-big-cursor * {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M6 2l26 15-11 2.5-6 11z' fill='black' stroke='white' stroke-width='2'/%3E%3C/svg%3E") 0 0, auto !important;
}

/* Prevent iOS Safari zoom on input focus */
@media (max-width: 768px) { input, select, textarea { font-size: 16px !important; } }

/* =========================================================================
   SITE PROTECTION — owner behaviors from the snippet config (config.ts).
   All scoped to skip the widget's own UI.
   ========================================================================= */
html.a11y-protect-media :is(img, video, picture, source):not(#a11y-widget-root *) {
  -webkit-user-drag: none; user-select: none; -webkit-touch-callout: none;
}
html.a11y-no-select *:not(input):not(textarea):not([contenteditable]):not(#a11y-widget-root):not(#a11y-widget-root *) {
  -webkit-user-select: none !important; user-select: none !important;
}
html.a11y-no-tap-highlight, html.a11y-no-tap-highlight * { -webkit-tap-highlight-color: transparent; }
html.a11y-no-link-preview a:not(#a11y-widget-root *) { -webkit-touch-callout: none !important; }
@media print { html.a11y-no-print body { display: none !important; } }
`}const n={triggerLabel:"פתח תפריט נגישות",panelTitle:"נגישות",close:"סגירה",reset:"איפוס הגדרות",fontSizeGroup:"גודל גופן",highContrast:"ניגודיות גבוהה",grayscale:"גווני אפור",highlightLinks:"הדגשת קישורים",bigCursor:"סמן גדול",statementTitle:"הצהרת נגישות",statementLink:"צפייה בהצהרת הנגישות",coordinator:"רכז/ת נגישות",on:"מופעל",off:"כבוי",resetDone:"כל ההגדרות אופסו"},w='<svg viewBox="0 0 71 82" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M34.8455 53.52L25.8955 78.25C25.6755 78.8697 25.3339 79.4392 24.8909 79.9252C24.4479 80.4111 23.9123 80.8038 23.3155 81.08C22.4191 81.5003 21.4181 81.645 20.4393 81.4958C19.4606 81.3466 18.5482 80.9101 17.8178 80.2418C17.0873 79.5735 16.5717 78.7033 16.3363 77.7417C16.1009 76.78 16.1563 75.7701 16.4955 74.84L22.7355 57.56C23.2307 56.2597 23.6219 54.9222 23.9055 53.56C24.1577 52.1769 24.3379 50.7817 24.4455 49.38C24.6855 46.85 24.8555 44.11 24.9855 41.48C25.1155 38.85 25.2055 36.3 25.2755 34.19C25.3655 31.56 24.6555 31.39 22.5455 30.89L22.1055 30.79L4.10551 27.4C3.45813 27.2858 2.83963 27.0451 2.28539 26.6916C1.73114 26.3381 1.25205 25.8788 0.875506 25.34C0.316124 24.5237 0.0115401 23.5598 0.000321458 22.5703C-0.0108972 21.5808 0.271754 20.6102 0.812486 19.7814C1.35322 18.9527 2.12771 18.303 3.0379 17.9147C3.94809 17.5263 4.95304 17.4168 5.92551 17.6L25.2655 21.23C26.0355 21.3 26.7855 21.39 27.5755 21.48C29.9555 21.8061 32.3535 21.9831 34.7555 22.01C37.7456 21.9516 40.7301 21.7279 43.6955 21.34C44.5955 21.24 45.4455 21.13 46.2955 21.05L64.5455 17.63C65.8402 17.3615 67.1886 17.6168 68.2955 18.34C68.8441 18.7112 69.3135 19.1878 69.6764 19.7419C70.0393 20.2961 70.2885 20.9169 70.4094 21.5681C70.5304 22.2194 70.5207 22.8882 70.381 23.5357C70.2413 24.1833 69.9743 24.7966 69.5955 25.34C69.2241 25.8823 68.7494 26.346 68.1986 26.7046C67.6478 27.0632 67.0317 27.3097 66.3855 27.43L48.9455 30.71C48.3655 30.84 47.8455 30.93 47.3855 31C45.5655 31.31 44.6655 31.47 44.7755 34.06C44.8555 35.95 45.0855 38.21 45.3855 40.57C45.7355 43.34 46.1955 46.28 46.6755 48.97C46.9855 50.74 47.2755 52.16 47.6755 53.52C48.0755 54.88 48.4655 56.27 49.0655 57.94L55.1755 74.84C55.5147 75.7701 55.5701 76.78 55.3347 77.7417C55.0993 78.7033 54.5837 79.5735 53.8532 80.2418C53.1228 80.9101 52.2104 81.3466 51.2317 81.4958C50.2529 81.645 49.2519 81.5003 48.3555 81.08C47.7587 80.8038 47.2231 80.4111 46.7801 79.9252C46.3371 79.4392 45.9955 78.8697 45.7755 78.25L36.7955 53.57L35.7955 51.74L34.7955 53.52H34.8455ZM35.2355 4.70729e-06C37.2785 -0.00173208 39.2588 0.704987 40.8391 1.99973C42.4194 3.29448 43.5018 5.09714 43.902 7.10053C44.3021 9.10392 43.9952 11.1841 43.0335 12.9865C42.0718 14.789 40.5149 16.2022 38.628 16.9854C36.7411 17.7686 34.6411 17.8732 32.6857 17.2816C30.7303 16.6899 29.0405 15.4385 27.9044 13.7406C26.7683 12.0427 26.256 10.0033 26.455 7.97007C26.6539 5.93682 27.5518 4.03547 28.9955 2.59C29.8134 1.76806 30.7858 1.11605 31.8567 0.671542C32.9277 0.227033 34.076 -0.00119525 35.2355 4.70729e-06Z"/></svg>';function z(e){const t=document.createElement("button");return t.type="button",t.className="a11y-trigger",t.setAttribute("aria-haspopup","true"),t.setAttribute("aria-expanded","false"),t.setAttribute("aria-label",n.triggerLabel),t.innerHTML=w,t.addEventListener("click",e),t}const N='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',$='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',O=[{lvl:0,label:"A",size:"13px"},{lvl:1,label:"A+",size:"16px"},{lvl:2,label:"A++",size:"20px"}],P=[{key:"highContrast",label:n.highContrast,icon:"◑"},{key:"grayscale",label:n.grayscale,icon:"◐"},{key:"highlightLinks",label:n.highlightLinks,icon:"🔗"},{key:"bigCursor",label:n.bigCursor,icon:"↖"}];class M{constructor(t,a){this.store=t,this.trigger=a,this.open=!1,this.lastFocus=null,this.onClick=o=>{const i=o.target.closest("[data-act]");if(!i)return;const r=this.store.get();switch(i.dataset.act){case"close":this.close();break;case"font":this.store.update({fontSize:Number(i.dataset.lvl)});break;case"toggle":{const c=i.dataset.key,s=!r[c];this.store.update({[c]:s}),this.announce(s?n.on:n.off);break}case"reset":this.store.reset(),this.announce(n.resetDone);break}},this.onKeydown=o=>{if(o.key==="Escape"){this.close();return}if(o.key!=="Tab")return;const i=this.focusable();if(!i.length)return;const r=i[0],c=i[i.length-1];o.shiftKey&&document.activeElement===r?(o.preventDefault(),c.focus()):!o.shiftKey&&document.activeElement===c&&(o.preventDefault(),r.focus())},this.el=document.createElement("div"),this.el.className="a11y-panel",this.el.setAttribute("role","dialog"),this.el.setAttribute("aria-modal","true"),this.el.setAttribute("aria-label",n.panelTitle),this.el.setAttribute("data-open","false"),this.el.innerHTML=this.render(),this.live=this.el.querySelector(".a11y-live"),this.el.addEventListener("click",this.onClick),this.el.addEventListener("keydown",this.onKeydown),this.store.subscribe(o=>this.sync(o)),this.sync(this.store.get())}render(){const t=O.map(o=>`<button type="button" class="a11y-font-btn" data-act="font" data-lvl="${o.lvl}" style="font-size:${o.size}" aria-pressed="false">${o.label}</button>`).join(""),a=P.map(o=>`
      <button type="button" class="a11y-toggle" data-act="toggle" data-key="${String(o.key)}" aria-pressed="false">
        <span class="a11y-toggle-label"><span aria-hidden="true">${o.icon}</span><span>${o.label}</span></span>
        <span class="a11y-switch" aria-hidden="true"></span>
      </button>`).join("");return`
      <div class="a11y-header">
        <span class="a11y-header-title">${w}<span>${n.panelTitle}</span></span>
        <button type="button" class="a11y-close" data-act="close" aria-label="${n.close}">${N}</button>
      </div>
      <div class="a11y-body">
        <div>
          <p class="a11y-section-label">${n.fontSizeGroup}</p>
          <div class="a11y-font-row">${t}</div>
        </div>
        ${a}
        <button type="button" class="a11y-reset" data-act="reset">${$}<span>${n.reset}</span></button>
        <div class="a11y-statement" hidden></div>
        <div class="a11y-sr-only a11y-live" role="status" aria-live="polite"></div>
      </div>
    `}setStatement(t){const a=this.el.querySelector(".a11y-statement");if(!a)return;const o=t&&(t.url||t.coordinatorName||t.coordinatorPhone||t.coordinatorEmail);if(!t||!o){a.hidden=!0,a.innerHTML="";return}const i=[`<p class="a11y-section-label">${n.statementTitle}</p>`],r=_(t.url);r&&i.push(`<a href="${g(r)}" target="_blank" rel="noopener noreferrer">${n.statementLink}</a>`),(t.coordinatorName||t.coordinatorPhone||t.coordinatorEmail)&&(i.push('<div class="a11y-coordinator">'),t.coordinatorName&&i.push(`<div class="a11y-coord-name">${n.coordinator}: ${h(t.coordinatorName)}</div>`),t.coordinatorPhone&&i.push(`<a href="tel:${g(t.coordinatorPhone.replace(/[^\d+]/g,""))}">☎ ${h(t.coordinatorPhone)}</a>`),t.coordinatorEmail&&i.push(`<a href="mailto:${g(t.coordinatorEmail)}">✉ ${h(t.coordinatorEmail)}</a>`),i.push("</div>")),a.innerHTML=i.join(""),a.hidden=!1}focusable(){return Array.from(this.el.querySelectorAll("button")).filter(t=>t.offsetParent!==null)}sync(t){this.el.querySelectorAll("[data-act='font']").forEach(a=>{a.setAttribute("aria-pressed",String(Number(a.dataset.lvl)===t.fontSize))}),this.el.querySelectorAll("[data-act='toggle']").forEach(a=>{a.setAttribute("aria-pressed",String(!!t[a.dataset.key]))})}announce(t){this.live.textContent="",window.requestAnimationFrame(()=>this.live.textContent=t)}toggle(){this.open?this.close():this.show()}show(){var t;this.open=!0,this.lastFocus=document.activeElement,this.el.setAttribute("data-open","true"),this.trigger.setAttribute("aria-expanded","true"),(t=this.focusable()[0])==null||t.focus()}close(){var t,a;this.open=!1,this.el.setAttribute("data-open","false"),this.trigger.setAttribute("aria-expanded","false"),(a=(t=this.lastFocus)==null?void 0:t.focus)==null||a.call(t)}}function h(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function g(e){return h(e).replace(/"/g,"&quot;")}function _(e){return e&&/^https?:\/\//i.test(e.trim())?e.trim():null}const v="__a11yWidgetLoaded",C=document.currentScript;function k(){const e=window;if(e[v])return;e[v]=!0;const t=new S,a=document.createElement("style");a.id="a11y-widget-styles",a.textContent=I(),document.head.appendChild(a),b(t.get()),t.subscribe(b);const o=E(C);x(o);const i=A(C);T(i,o).then(l=>{l&&(x(l.protection),s.setStatement(l.statement))});const r=document.createElement("div");r.id="a11y-widget-root";const c=z(()=>s.toggle()),s=new M(t,c);r.append(c,s.el),document.body.appendChild(r),e.A11yWidget={open:()=>s.show(),close:()=>s.close(),reset:()=>t.reset(),setStatement:l=>s.setStatement(l)}}document.body?k():document.addEventListener("DOMContentLoaded",k,{once:!0})})();
