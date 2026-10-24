import {art} from './story-art.mjs';
import {defs,botanical} from './story-shapes.mjs';

export const stories = {
 codexmax:{title:'三端，同一张桌',intro:'让 Codex、ChatGPT 与本地工具，坐到同一张工作台前。',chapters:[['三端入席','Codex 与 ChatGPT 沿轨道靠近，中央为本地工具留出位置。'],['连接成形','本地工具嵌入接榫，三端的连接关系逐渐清晰。'],['同一张桌','接合的轨道展开为工作台，让不同能力在一处相遇。']],captions:['先让两端，各就各位。','本地工具入席，连接开始成形。','三端，同一张工作台。'],mobile:[180,80,600,450]},
 androiddesktop:{title:'把桌面展开',intro:'桌面、文件与多窗口，在 Android 上展开新的空间。',chapters:[['展开桌面','竖向玻璃板沿中缝展开，为桌面建立空间。'],['翻出文件','文件像书页一样翻立，把内容带到眼前。'],['窗口就位','宽、窄、方形窗口错落展开，让多窗口有自己的秩序。']],captions:['从一块屏幕，展开一张桌面。','文件翻开，内容来到眼前。','桌面、文件、多窗口，来到 Android。'],mobile:[210,95,570,440]},
 flutterdesign:{title:'界面的裁缝',intro:'从组件纸样到交互细节，再把界面裁成合适的尺寸。',chapters:[['裁出组件','沿制图线勾勒轮廓，让组件逐一显形。'],['触感回响','轮廓环与组件的一次轻压回弹，演绎交互。'],['适应尺寸','视口收窄，组件重新排列，呈现自适应界面的设计思路。']],captions:['轮廓先行，组件随之成形。','一次轻压，让交互有回应。','宽窄之间，重新安排每一处。'],mobile:[210,90,540,470]},
 gamelauncher:{title:'开场之前',intro:'从游戏收藏出发，经过引擎选择，走向下一次游玩。',chapters:[['游戏归位','错落的书脊沿底线排齐，从整理开始。'],['选择引擎','刻度环转动，对准被选中的那一本。'],['走向开场','刻度环变为透光拱门，让开始游玩成为终幕。']],captions:['把想玩的，整理在一起。','选好游戏，再选择引擎。','开场之前，都已就位。'],mobile:[235,55,490,460]},
 flacgn:{title:'留住这一格',intro:'浏览动漫、收藏喜欢的内容，也让下载有一个去处。',chapters:[['翻阅画格','原创线描封面横向换位，让浏览有翻页般的节奏。'],['夹入书签','书签扣住中央画格，把喜欢留在视线里。'],['收好资源','资源纸片沿折线落向纸袋，演绎下载。']],captions:['翻过画格，遇见喜欢。','夹一枚书签，留住这一格。','浏览、收藏，也把资源收好。'],mobile:[310,110,430,390]},
 flclashplus:{title:'让线路转向',intro:'用一只精细的换接器，讲述配置切换与跨平台连接。',chapters:[['选入配置','配置薄片围绕轴心展开，一张插入槽口。'],['重新换接','换接器转动，旧线收回，新线重新描出。'],['跨端呈现','宽窄轮廓依次框住同一条连接关系。']],captions:['选一张配置，插入槽口。','转动换接器，让线路转向。','宽窄屏幕，共同呈现连接。'],mobile:[265,95,430,420]},
 ainavol:{title:'折成一个空间',intro:'AI、网页、文件，以不同的材料汇入个人工作空间。',chapters:[['展开 AI','字带如书脊展开，留下贯穿画面的折痕。'],['叠入内容','网页绕折痕翻开，文件页签从另一方向插入。'],['汇成空间','边缘逐段对齐，形成一张连续的工作地图。']],captions:['从 AI 的一条折痕开始。','网页翻开，文件叠入。','三种内容，折成一个空间。'],mobile:[210,120,560,400]},
 lanzouplus:{title:'沿着索引找到它',intro:'从规则库出发，让资源搜索与下载沿着清晰的线索前进。',chapters:[['打开索引','规则片逐张展开，把细密边缘排成秩序。'],['框出资源','资源条带经过检索尺，透明开口聚焦其中一条。'],['折入下载','被选中的资源折成纸片，顺势落向下载槽。']],captions:['规则展开，索引先行。','沿着线索，框住需要的资源。','搜索之后，让下载有去处。'],mobile:[245,65,470,460]},
 androidsimulator:{title:'越过边框，各自成窗',intro:'Android 应用越过竖板边界，在 Windows 中独立成窗。',chapters:[['建立边界','四个直角勾出 Windows，竖板承载 Android 应用。'],['离开竖板','分隔线向外闭合为窗框，应用从原轮廓中脱离。'],['各自成窗','两扇窗口向不同方向展开，在 Windows 中各占一处。']],captions:['Android 应用，来到 Windows。','延伸边界，脱离同一块竖板。','各自成窗，也各有位置。'],mobile:[195,100,580,435]},
 nekocommunity:{title:'让交流有去处',intro:'从对话的共同开口，走向文件分享与云盘整理。',chapters:[['展开交流','两条对话括弧相向伸入，为交流留出开口。'],['分享文件','折角文件穿过共同空间，在两侧留下关系。'],['归入云盘','纸页在云形格架内归位，让分享之后的管理继续。']],captions:['为交流，留一个共同的开口。','一页文件，连起两侧。','交流、分享，再把文件归好。'],mobile:[210,115,540,360]},
 skillcreator:{title:'把能力写成篇章',intro:'一页技能稿纸，经历创建、编辑，最后归入有序的索引。',chapters:[['创建稿纸','从基线展开稿纸，让 Agent 技能的结构逐渐出现。'],['编辑篇章','校订括号夹住段落，文字换位，行距重新安排。'],['整理成册','多页稿纸沿装订环归位，索引耳留在书页边缘。']],captions:['从一条基线，创建一页技能。','移动段落，编辑它的结构。','把能力，整理成篇章。'],mobile:[255,100,430,410]},
 flpiliplus:{title:'让画面占满此刻',intro:'浏览、播放与收藏，以一块开合银幕讲述跨端视频体验。',chapters:[['聚焦一幕','横向画带依次让位，中央画面上下展开。'],['画面流动','原创弧线掠过圆面，让连续运动发生在银幕之内。'],['留住喜欢','收藏书签插入银幕边缘，宽窄视口在两侧显现。']],captions:['浏览之后，把注意交给这一幕。','让画面，在此刻流动。','收藏喜欢，继续观看。'],mobile:[210,105,560,410]},
 kacha:{title:'框住，再说清楚',intro:'从取景到文字，再到一笔批注，把画面里的重点说明白。',chapters:[['框住画面','四个取景直角收拢，聚焦一张植物样张。'],['识别文字','扫描带越过样张，旁侧排出同样的“森林”二字。'],['画出重点','圆圈与箭头沿笔顺描出，把注意带到叶脉。']],captions:['先框住，需要留下的画面。','越过扫描带，把文字读出来。','再添一笔，让重点更清楚。'],mobile:[245,120,545,360]},
};

export function projectStory(project) {
 const story=stories[project.id];
 return `<section id="story" class="project-story shell" aria-labelledby="story-title">
  <div class="story-heading"><div><p class="story-eyebrow">A LITTLE FILM ABOUT ${project.name.toUpperCase()}</p><h2 id="story-title">${story.title}</h2></div><p class="story-intro">${story.intro}</p></div>
  <div class="story-film" data-film="${project.id}" data-mobile-frame="${story.mobile.join(' ')}">
   <div class="film-topline"><span>NKBR MOTION STUDIES</span><span>功能概念演绎 · 15 秒</span></div>
   <svg class="story-art" viewBox="0 0 960 580" width="960" height="580" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${story.title}：${project.description}">${defs}<ellipse cx="480" cy="290" rx="370" ry="240" fill="url(#film-halo)"/>${botanical}${art[project.id]}</svg>
   <div class="film-caption">${story.captions.map((caption,i)=>`<p data-film-caption${i<2?' hidden':''}><span>0${i+1} / ${story.chapters[i][0]}</span>${caption}</p>`).join('')}</div>
   <div class="story-controls" data-story-controls hidden>
    <div class="story-transport"><button type="button" data-story-toggle aria-pressed="false">暂停短片</button><input data-story-seek type="range" min="0" max="15000" step="50" value="0" aria-label="短片播放进度"><output data-story-time aria-label="已播放秒数，共15秒">00 / 15</output><button type="button" data-story-replay>重播</button></div>
    <div class="story-chapters" aria-label="选择分镜">${story.chapters.map((chapter,i)=>`<button type="button" data-story-chapter aria-pressed="false">0${i+1} ${chapter[0]}</button>`).join('')}</div>
   </div>
  </div>
  <ol class="story-notes">${story.chapters.map(([title,description])=>`<li><h3>${title}</h3><p>${description}</p></li>`).join('')}</ol>
 </section>`;
}
