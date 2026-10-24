import {actor as a,text as t,rect as r,path as p,circle as c,lines,windowPane as w,document as doc} from './story-shapes.mjs';

const label=(x,y,title,sub)=>t(x,y,title,'headline')+t(x,y+25,sub,'micro');
const plaque=(x,y,title)=>r(x,y,190,82)+t(x+95,y+48,title,'plaque-label');
const cover=(x,y,kind)=>r(x,y,150,215,'paper',5)+`<g transform="translate(${x} ${y})">${kind===0?c(75,75,42)+p('M24 176Q77 56 127 176M43 151Q76 105 111 156')+c(75,87,20,'white'):kind===1?p('M24 169Q48 41 88 37Q70 120 127 173M37 138Q88 88 119 121')+c(105,52,22):p('M25 163L74 57L129 164Z')+c(74,63,30)+p('M31 165Q75 133 124 165')}${lines(22,191,106,1)}</g>`;
const leaf=p('M435 357C349 277 410 170 543 142C579 264 533 357 435 357Z','tint')+p('M435 357Q468 259 543 142M468 274l-45-41m58 19 53-17m-76 68-43-17m70-30 48-11','line');

export const art = {
 codexmax: a('desk',p('M211 345L480 246L749 345L480 465Z','tint')+p('M211 345L480 246L749 345L480 465ZM211 345v28l269 119 269-119v-28M480 465v27','hair'))+
  a('rails',p('M283 260H424V330H536V260H677M480 348V330','bold-line')+c(424,330,5,'accent')+c(536,330,5,'accent'))+
  a('codex',plaque(173,190,'Codex'))+a('chatgpt',plaque(597,190,'ChatGPT'))+a('tools',plaque(385,348,'本地工具'))+
  a('joint',r(450,294,60,60,'glass',5)+p('M469 307v11h-9v14h9v11h21v-11h9v-14h-9v-11','line'))+
  a('title',t(480,125,'三端，同一张桌','display center')+t(480,523,'CODEX · CHATGPT · LOCAL TOOLS','micro center')),

 androiddesktop: a('table',p('M176 374L480 245L784 374L480 498Z','tint')+p('M176 374L480 245L784 374L480 498ZM480 245V498','hair'))+
  a('fold-left',p('M480 184L290 243V405L480 347Z','glass')+p('M317 265L451 222M317 291L451 248','hair'))+
  a('fold-right',p('M480 184L670 243V405L480 347Z','glass')+p('M511 223L639 264M511 249L639 290','hair'))+
  a('files',doc(260,315,85,107,'FILES')+doc(279,301,85,107,'FILES')+doc(298,287,85,107,'FILES'))+
  a('wide',w(324,171,307,170,'DESKTOP',r(345,221,75,92,'tint',4)+lines(442,234,155,5)))+
  a('narrow',w(624,242,132,184,'WINDOW',lines(643,298,91,7)))+
  a('square',w(401,318,182,131,'FILES',c(438,388,17)+lines(470,377,86,2)))+
  a('title',label(195,116,'把桌面展开','ANDROID / DESKTOP / WINDOWS')),

 flutterdesign: a('pattern',r(222,117,516,359,'paper',5)+Array.from({length:12},(_,i)=>p(`M${240+i*42} 135V458`,'hair')).join('')+Array.from({length:8},(_,i)=>p(`M240 ${146+i*42}H718`,'hair')).join(''))+
  a('ruler',p('M208 101H752M208 95v12m544-12v12M770 117V476m-6-359h12m-12 359h12','line')+t(480,90,'RESPONSIVE PATTERN','micro center'))+
  a('button',r(279,198,184,54,'glass',27)+t(371,233,'组件','center'))+
  a('tile',r(489,198,184,54,'tint',12)+c(516,225,9,'accent')+lines(539,225,107,1))+
  a('layout',r(279,275,394,141,'glass',12)+r(294,291,108,109,'tint',6)+lines(423,308,222,5))+
  a('interaction',`<ellipse cx="371" cy="225" rx="115" ry="48" class="line" stroke-dasharray="3 7"/>`+t(371,175,'交互示意','small center'))+
  a('viewport',r(267,126,426,329,'line',18)+p('M253 127h-13v329h13m454-329h13v329h-13','line'))+
  a('title',t(480,533,'界面的裁缝','headline center')),

 gamelauncher: a('shelf',p('M265 416H695','hair')+Array.from({length:7},(_,i)=>r(280+i*58,250+(i%3)*12,42,158-(i%3)*12,i===3?'glass':'tint',5)+p(`M${294+i*58} 281v66`,'hair')).join(''))+
  a('chosen',r(446,232,67,186,'glass',7)+p('M466 257h27M466 268h27M466 279h14','line')+t(480,392,'PLAY','micro center'))+
  a('engine',c(480,274,155,'line')+c(480,274,132,'hair')+Array.from({length:28},(_,i)=>`<path transform="rotate(${i*12.857} 480 274)" d="M480 119v${i%4===0?14:6}" class="line"/>`).join('')+t(480,159,'引擎','small center'))+
  a('gate',p('M334 423V271C334 69 626 69 626 271V423','bold-line')+p('M361 423V271C361 106 599 106 599 271V423','hair')+p('M426 478L467 327H493L534 478Z','tint')+t(480,281,'开始游玩','headline center'))+
  a('title',t(480,82,'开场之前','display center')),

 flacgn: a('left-cover',cover(207,195,0))+a('right-cover',cover(603,195,2))+
  a('selected-cover',cover(405,170,1)+t(480,420,'这一格，留给喜欢','small center'))+
  a('bookmark',p('M514 155H551V256L533 241L514 256Z','accent')+p('M525 171v35m14-35v35','hair'))+
  a('resource',doc(540,330,92,100,'RESOURCE'))+
  a('bag',p('M629 368H743L753 472H619Z','glass')+p('M656 369v-20a30 30 0 0 1 60 0v20','line')+t(686,438,'下载','small center'))+
  a('title',t(252,117,'留住这一格','display')+t(252,145,'BROWSE · COLLECT · DOWNLOAD','micro')),

 flclashplus: a('dial',c(480,289,171,'glass')+c(480,289,147,'hair')+c(480,289,111,'hair')+Array.from({length:36},(_,i)=>`<path transform="rotate(${i*10} 480 289)" d="M480 125v${i%3===0?13:5}" class="hair"/>`).join(''))+
  a('config-a',r(245,168,116,66,'paper',5)+textConfig(261,193,'配置 A'))+
  a('config-b',r(539,150,116,66,'paper',5)+textConfig(555,175,'配置 B'))+
  a('old-route',p('M279 291H402Q425 291 425 267V242H480','bold-line'))+
  a('new-route',p('M480 289H541Q565 289 565 313V353H704','bold-line'))+
  a('switch',c(480,289,58,'glass')+p('M447 289H514M480 256V322','line')+c(480,289,12,'accent'))+
  a('wide',r(218,141,524,292,'line',14)+t(240,462,'跨平台','small'))+
  a('narrow',r(372,111,216,365,'line',25))+
  a('title',t(480,80,'让线路转向','headline center')),

 ainavol: a('map',p('M175 344L402 223L603 295L785 198V389L603 486L402 414L175 535Z','tint')+p('M402 223V414M603 295V486','hair'))+
  a('ai',p('M198 178L394 237V422L198 362Z','glass')+t(231,280,'AI','display')+lines(229,309,126,3))+
  a('web',p('M394 237L607 164V351L394 422Z','glass')+t(445,247,'网页','headline')+p('M422 279L579 225M422 299L579 245M422 319L531 281','hair'))+
  a('files',doc(607,284,124,142,'FILES')+r(619,274,55,21,'accent',5))+
  a('spine',p('M394 237V422M607 164V351','bold-line'))+
  a('title',t(195,105,'折成一个空间','display')+t(195,134,'AI / WEB / FILES','micro')),

 lanzouplus: a('index',r(269,143,422,117,'glass',9)+Array.from({length:9},(_,i)=>r(285+i*43,132-i%2*12,31,112,'paper',4)+p(`M${292+i*43} 160h15m-15 10h15`,'hair')).join('')+t(480,112,'规则库','small center'))+
  a('resources',Array.from({length:5},(_,i)=>r(294,286+i*26,372,19,'paper',3)+p(`M311 ${295+i*26}h${230-i*21}`,'hair')).join(''))+
  a('search',r(267,321,426,52,'glass',4)+r(283,330,394,34,'line',3)+c(309,347,8,'line')+p('M315 353l7 7','line')+t(348,353,'资源搜索','small'))+
  a('found',r(294,333,372,26,'tint',3)+t(480,352,'资源','micro center'))+
  a('fold',p('M366 418H594L571 465H389Z','glass')+p('M366 418l24 68h180l24-68M389 465v21m182-21v21','line')+t(480,453,'下载','small center'))+
  a('title',t(480,61,'沿着索引找到它','headline center')),

 androidsimulator: a('windows',p('M188 169V129H251M709 129H772V169M772 425V465H709M251 465H188V425','line')+t(209,110,'WINDOWS','micro'))+
  a('android',r(396,148,168,285,'glass',22)+p('M423 238H537M423 327H537','hair')+t(480,185,'ANDROID','micro center'))+
  a('app-a',w(231,176,246,177,'ANDROID APP',c(354,270,37)+p('M338 269l13 13 24-27','line')))+
  a('app-b',w(501,306,229,146,'ANDROID APP',r(529,361,62,62,'tint',14)+lines(609,370,90,3)))+
  a('seams',p('M423 238H304V176M537 327H663V306','bold-line'))+
  a('title',t(480,520,'越过边框，各自成窗','headline center')),

 nekocommunity: a('left-bracket',p('M323 169H271Q244 169 244 196V342Q244 369 271 369H323M244 324l-35 25v-51','bold-line')+t(291,266,'交流','headline'))+
  a('right-bracket',p('M637 169H689Q716 169 716 196V342Q716 369 689 369H637M716 324l35 25v-51','bold-line')+t(604,266,'分享','headline'))+
  a('shared-file',doc(424,208,112,145,'FILE'))+
  a('echo-file',doc(559,289,83,107,'FILE'))+
  a('cloud',p('M337 393C281 393 269 314 322 294C319 235 398 205 440 251C481 185 571 212 579 276C650 270 674 367 609 391Z','glass')+p('M353 301H596M353 346H596M413 277V374M497 277V374M568 301V374','hair')+t(480,426,'云盘管理','small center'))+
  a('title',t(480,108,'让交流有去处','display center')),

 skillcreator: a('pages',doc(307,157,341,324,'AGENT SKILLS')+doc(296,146,341,324,'AGENT SKILLS'))+
  a('manuscript',r(285,135,341,324,'paper',4)+t(316,195,'Agent 技能','headline')+lines(316,230,272,4)+lines(316,319,272,5))+
  a('paragraph',r(312,248,280,42,'tint',4)+t(326,275,'创建 · 编辑 · 整理','small'))+
  a('edit',p('M307 244h-12v49h12M594 244h12v49h-12','bold-line')+p('M548 322l-26 12 9-28 43-43 17 17Z','line'))+
  a('tabs',r(625,166,33,47,'accent',5)+r(636,225,33,47,'tint',5)+r(647,284,33,47,'accent',5))+
  a('binding',Array.from({length:5},(_,i)=>`<ellipse cx="288" cy="${193+i*48}" rx="20" ry="11" class="line"/>`).join(''))+
  a('title',label(270,83,'把能力写成篇章','CREATE / EDIT / ORGANIZE')),

 flpiliplus: a('strips',r(198,149,564,65,'tint',3)+r(198,229,564,86,'glass',3)+r(198,330,564,65,'tint',3)+p('M198 180Q480 102 762 180M198 367Q480 416 762 367','hair'))+
  a('screen',r(225,130,510,310,'paper',12)+`<g clip-path="url(#film-screen)">${r(225,130,510,310,'tint',12)}${a('picture-disc',c(481,273,106,'accent'))}${a('picture-arc',p('M184 387Q357 56 783 251','bold-line')+p('M199 414Q384 82 798 279','line'))}</g>`)+
  a('mask',p('M225 130H735V177H225ZM225 393H735V440H225Z','glass'))+
  a('bookmark',p('M669 118H707V228L688 214L669 228Z','accent'))+
  a('ports',r(188,99,584,372,'line',14)+r(796,202,83,171,'line',12)+p('M815 354h44','hair'))+
  a('title',t(480,526,'让画面占满此刻','headline center')),

 kacha: a('sample',r(253,145,362,301,'paper',4)+leaf+t(293,202,'森林','headline')+t(293,226,'BOTANICAL STUDY','micro'))+
  a('crop',p('M275 188V164H299M569 164H593V188M593 405V429H569M299 429H275V405','bold-line'))+
  a('scan',r(274,229,320,5,'accent',2))+
  a('ocr',r(637,229,140,150,'glass',8)+t(658,267,'森林','headline')+t(658,306,'文字识别','small')+t(658,338,'示意','small')+p('M658 358h96','hair'))+
  a('annotation',p('M448 285C402 242 391 343 449 345C504 347 498 277 448 285M494 316Q560 296 596 322M581 308l15 14-19 5','bold-line'))+
  a('title',label(253,99,'框住，再说清楚','CAPTURE / RECOGNIZE / ANNOTATE')),
};

function textConfig(x,y,title){return t(x,y,title,'small')+lines(x,y+17,82,1);}
