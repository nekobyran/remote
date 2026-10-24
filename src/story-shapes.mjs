export const actor = (name, content) => `<g data-actor="${name}">${content}</g>`;
export const text = (x,y,label,kind='') => `<text x="${x}" y="${y}" class="${kind}">${label}</text>`;
export const rect = (x,y,w,h,kind='glass',r=16) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" class="${kind}"/>`;
export const path = (d,kind='line') => `<path d="${d}" class="${kind}"/>`;
export const circle = (x,y,r,kind='tint') => `<circle cx="${x}" cy="${y}" r="${r}" class="${kind}"/>`;
export const lines = (x,y,w,count=3) => Array.from({length:count},(_,i)=>path(`M${x} ${y+i*15}h${w*(i===count-1?.68:1)}`,'hair')).join('');
export const windowPane = (x,y,w,h,label,body='') => rect(x,y,w,h)+path(`M${x} ${y+35}h${w}`,'hair')+circle(x+17,y+17,3,'accent')+circle(x+28,y+17,3)+text(x+44,y+22,label,'micro')+body;
export const document = (x,y,w=100,h=130,label='FILE') => rect(x,y,w,h,'paper',7)+path(`M${x+w-26} ${y}v26h26`,'hair')+lines(x+16,y+48,w-32,4)+text(x+15,y+h-16,label,'micro');
export const botanical = `<g opacity=".35">${path('M76 462C118 403 113 330 168 272M123 358C90 347 88 321 89 303C115 315 125 330 123 358M134 328C167 319 174 294 174 278C150 288 137 306 134 328M108 403C81 391 70 370 72 349C101 361 112 380 108 403','hair')}${path('M842 123C820 160 843 203 801 241M833 168C858 155 862 137 857 120C837 131 829 149 833 168','hair')}</g>`;
export const defs = `<defs>
 <linearGradient id="film-glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff" stop-opacity=".92"/><stop offset=".5" stop-color="#f4fff4" stop-opacity=".55"/><stop offset="1" stop-color="#d6e9d4" stop-opacity=".7"/></linearGradient>
 <radialGradient id="film-halo"><stop stop-color="var(--wash)" stop-opacity=".9"/><stop offset="1" stop-color="var(--wash)" stop-opacity="0"/></radialGradient>
 <linearGradient id="film-ribbon"><stop stop-color="var(--accent)"/><stop offset=".5" stop-color="#eff7dd"/><stop offset="1" stop-color="var(--accent)"/></linearGradient>
 <filter id="film-shadow" x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="0" dy="12" stdDeviation="13" flood-color="#264f3e" flood-opacity=".12"/></filter>
 <clipPath id="film-screen"><rect x="225" y="130" width="510" height="310" rx="12"/></clipPath>
</defs>`;
