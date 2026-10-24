// The films borrow Motion Canvas' explicit sequence offsets, using native WAAPI.
const motion = (name, ...poses) => [`[data-actor="${name}"]`, poses.map(([second,transform,opacity=1])=>({offset:second/15,transform,opacity,easing:'cubic-bezier(.22,.7,.15,1)'}))];
const enter = (name,start,from='translateY(28px)',to='none') => motion(name,[0,from,0],[start,from,0],[start+1.25,to,1],[15,to,1]);
const draw = (name,start,end) => [`[data-actor="${name}"]`,[
 {offset:0,opacity:0,strokeDasharray:'1500',strokeDashoffset:1500},
 {offset:start/15,opacity:1,strokeDasharray:'1500',strokeDashoffset:1500},
 {offset:end/15,opacity:1,strokeDasharray:'1500',strokeDashoffset:0},
 {offset:1,opacity:1,strokeDasharray:'1500',strokeDashoffset:0},
]];

export const scores = {
 codexmax:[
  enter('codex',.4,'translateX(-170px)'),enter('chatgpt',1,'translateX(170px)'),
  enter('tools',5,'translateY(110px)'),draw('rails',5.7,8),enter('joint',7,'scale(.5)'),
  motion('desk',[0,'scaleY(.08)',0],[7,'scaleY(.08)',0],[10,'scaleY(.8)',1],[13,'scaleY(1)',1],[15,'scaleY(1)',1]),
  enter('title',10.5,'translateY(22px)'),
 ],
 androiddesktop:[
  enter('table',2,'scaleX(.15)'),
  motion('fold-left',[0,'translateX(96px) scaleX(.08)',1],[.8,'translateX(96px) scaleX(.08)',1],[4,'none',1],[6,'none',1],[8,'scaleX(.1)',0],[15,'scaleX(.1)',0]),
  motion('fold-right',[0,'translateX(-96px) scaleX(.08)',1],[.8,'translateX(-96px) scaleX(.08)',1],[4,'none',1],[6,'none',1],[8,'scaleX(.1)',0],[15,'scaleX(.1)',0]),
  enter('files',4.4,'translateY(50px) scaleY(.1)'),
  enter('wide',7,'translateX(-80px) scaleX(.1)'),enter('narrow',9.2,'translateX(-80px) scaleX(.1)'),enter('square',10.5,'translateY(40px) scaleY(.1)'),enter('title',11),
 ],
 flutterdesign:[
  enter('pattern',0,'scaleY(.9)'),draw('ruler',.2,2.8),
  motion('interaction',[0,'scale(1.2)',0],[4.8,'scale(1.2)',0],[6,'scale(1)',1],[6.7,'scale(.82)',1],[7.5,'scale(1.08)',1],[9,'scale(1.5)',0],[15,'scale(1.5)',0]),
  motion('button',[0,'translateX(65px) scaleX(.7)',0],[2,'none',1],[6,'none',1],[6.6,'scale(.93)',1],[7.5,'none',1],[10,'none',1],[12,'translateX(110px) translateY(-18px)',1],[15,'translateX(110px) translateY(-18px)',1]),
  motion('tile',[0,'scale(.6)',0],[3,'none',1],[10,'none',1],[12,'translateX(-100px) translateY(55px)',1],[15,'translateX(-100px) translateY(55px)',1]),
  motion('layout',[0,'scaleY(.1)',0],[4,'none',1],[10,'none',1],[12,'translateY(42px) scaleX(.48) scaleY(.74)',1],[15,'translateY(42px) scaleX(.48) scaleY(.74)',1]),
  motion('viewport',[0,'scaleX(1.1)',0],[8,'scaleX(1.1)',0],[9,'scaleX(1)',1],[12,'scaleX(.54)',1],[15,'scaleX(.54)',1]),enter('title',11.3),
 ],
 gamelauncher:[
  motion('shelf',[0,'translateY(80px) skewX(7deg)',0],[2.8,'none',1],[5,'none',1],[8,'translateY(25px) scale(.92)',.25],[15,'translateY(25px) scale(.92)',.25]),
  motion('chosen',[0,'translateY(50px)',0],[3,'none',1],[5,'translateY(-25px)',1],[9,'translateY(-25px)',1],[11.8,'translateY(35px) scaleX(.4)',0],[15,'translateY(35px) scaleX(.4)',0]),
  motion('engine',[0,'rotate(-100deg) scale(.6)',0],[4.6,'rotate(-100deg) scale(.6)',0],[7,'rotate(-15deg) scale(1)',1],[9,'rotate(0) scale(1)',1],[11.2,'rotate(0) scale(1.2)',0],[15,'rotate(0) scale(1.2)',0]),
  enter('gate',9.5,'scale(.78)'),enter('title',11.5),
 ],
 flacgn:[
  motion('left-cover',[0,'translateX(170px) rotate(-3deg)',0],[1.8,'rotate(-5deg)',1],[4,'rotate(-5deg)',1],[7,'translateX(113px) scaleX(.22)',.4],[15,'translateX(113px) scaleX(.22)',.4]),
  motion('right-cover',[0,'translateX(-170px) rotate(3deg)',0],[2.4,'rotate(5deg)',1],[4,'rotate(5deg)',1],[7,'translateX(-113px) scaleX(.22)',.4],[15,'translateX(-113px) scaleX(.22)',.4]),
  motion('selected-cover',[0,'translateX(150px) scale(.8)',0],[3,'none',1],[5,'scale(1.13)',1],[9,'scale(1.13)',1],[12,'translateX(-30px) scale(1.08)',1],[15,'translateX(-30px) scale(1.08)',1]),
  enter('bookmark',5,'translateY(-95px)'),
  motion('resource',[0,'translateX(-80px) translateY(-110px) rotate(-8deg)',0],[10,'translateX(-80px) translateY(-110px) rotate(-8deg)',0],[11,'translateX(-30px) translateY(-60px) rotate(8deg)',1],[12.5,'translateX(60px) translateY(20px) rotate(0)',1],[14,'translateX(102px) translateY(54px) scale(.6)',0],[15,'translateX(102px) translateY(54px) scale(.6)',0]),
  enter('bag',9.5,'translateY(45px)'),enter('title',.3),
 ],
 flclashplus:[
  enter('dial',0,'scale(.85)'),
  motion('config-a',[0,'translateX(-65px) rotate(-20deg)',0],[2,'none',1],[4,'translateX(120px) translateY(40px) rotate(28deg)',1],[5.7,'translateX(180px) translateY(65px) scale(.3)',0],[15,'translateX(180px) translateY(65px) scale(.3)',0]),
  motion('config-b',[0,'translateY(-60px) rotate(13deg)',0],[3,'none',1],[7,'none',1],[9,'translateX(-88px) translateY(44px) rotate(-25deg)',.4],[15,'translateX(-88px) translateY(44px) rotate(-25deg)',.4]),
  motion('switch',[0,'rotate(0)',1],[5,'rotate(0)',1],[7,'rotate(90deg)',1],[15,'rotate(90deg)',1]),
  motion('old-route',[0,'none',0],[3.8,'none',0],[5,'none',1],[6,'none',1],[7,'scaleX(.1)',0],[15,'scaleX(.1)',0]),draw('new-route',6.4,9),
  motion('wide',[0,'scale(.9)',0],[9.5,'scale(.9)',0],[10.5,'none',1],[11.3,'none',1],[12.3,'scale(.95)',.3],[15,'scale(.95)',.3]),enter('narrow',11.2,'scaleX(1.8)'),enter('title',12),
 ],
 ainavol:[
  motion('ai',[0,'translateX(-120px) scaleX(.08)',0],[1.2,'translateX(-120px) scaleX(.08)',1],[4,'none',1],[15,'none',1]),
  enter('web',5,'translateX(-100px) scaleX(.08)'),enter('files',7,'translateY(-110px)'),draw('spine',8,10),
  motion('map',[0,'translateY(40px) scaleY(.1)',0],[9,'translateY(40px) scaleY(.1)',0],[12,'none',1],[15,'none',1]),enter('title',10.6),
 ],
 lanzouplus:[
  motion('index',[0,'scaleX(.07)',0],[1,'scaleX(.07)',1],[4,'none',1],[15,'none',1]),
  motion('resources',[0,'translateY(-50px)',0],[4.5,'translateY(-50px)',0],[6,'translateY(-30px)',1],[9,'translateY(0)',.4],[15,'translateY(0)',.4]),
  motion('search',[0,'scaleX(.7)',0],[5,'scaleX(.7)',0],[7.8,'none',1],[10,'none',1],[12,'translateY(50px) scaleY(.1)',.7],[15,'translateY(50px) scaleY(.1)',.7]),
  motion('found',[0,'none',0],[7.8,'none',0],[9,'none',1],[10.4,'none',1],[12,'translateY(72px) scaleX(.5) rotateX(60deg)',1],[13.3,'translateY(100px) scaleX(.45)',0],[15,'translateY(100px) scaleX(.45)',0]),
  enter('fold',10,'translateY(35px)'),enter('title',.3),
 ],
 androidsimulator:[
  draw('windows',.2,3),
  motion('android',[0,'scaleY(.2)',0],[3,'none',1],[5.2,'none',1],[8.8,'scaleX(1.6)',0],[15,'scaleX(1.6)',0]),
  draw('seams',5,7.5),
  motion('app-a',[0,'translateX(126px) translateY(10px) scale(.35)',0],[5,'translateX(126px) translateY(10px) scale(.35)',0],[8,'translateX(42px) scale(.8)',1],[12,'none',1],[15,'none',1]),
  motion('app-b',[0,'translateX(-130px) translateY(-80px) scale(.35)',0],[6,'translateX(-130px) translateY(-80px) scale(.35)',0],[9,'translateY(-30px) scale(.8)',1],[12,'none',1],[15,'none',1]),enter('title',11.3),
 ],
 nekocommunity:[
  motion('left-bracket',[0,'translateX(-130px)',0],[2,'none',1],[8,'none',1],[12,'translateX(-35px)',1],[15,'translateX(-35px)',1]),
  motion('right-bracket',[0,'translateX(130px)',0],[3,'none',1],[8,'none',1],[12,'translateX(35px)',1],[15,'translateX(35px)',1]),
  motion('shared-file',[0,'translateX(-170px) scale(.65)',0],[4.8,'translateX(-170px) scale(.65)',0],[7,'none',1],[10,'none',1],[12,'translateX(-18px) translateY(35px) scale(.55)',1],[15,'translateX(-18px) translateY(35px) scale(.55)',1]),
  enter('echo-file',7.2,'translateX(-130px)'),enter('cloud',10,'scaleY(.15)'),enter('title',.4),
 ],
 skillcreator:[
  motion('manuscript',[0,'scaleY(.02)',0],[1,'scaleY(.02)',1],[3.8,'none',1],[15,'none',1]),
  motion('paragraph',[0,'translateY(15px) scaleX(.7)',0],[4.6,'translateY(15px) scaleX(.7)',0],[6,'none',1],[7,'translateY(45px)',1],[8.7,'translateY(10px) scaleY(.85)',1],[15,'translateY(10px) scaleY(.85)',1]),
  draw('edit',5.2,7.8),enter('pages',9,'translateX(70px) rotate(4deg)'),enter('tabs',10,'translateX(-25px)'),draw('binding',10.3,12.5),enter('title',.3),
 ],
 flpiliplus:[
  motion('strips',[0,'scaleX(.7)',0],[1.5,'none',1],[4,'none',1],[6,'scaleY(.2)',0],[15,'scaleY(.2)',0]),
  motion('screen',[0,'scaleY(.18)',0],[3,'scaleY(.18)',0],[5.5,'none',1],[15,'none',1]),
  motion('mask',[0,'scaleY(.1)',0],[5,'scaleY(.1)',0],[6.5,'none',1],[15,'none',1]),
  motion('picture-disc',[0,'translateX(-100px)',1],[5,'translateX(-100px)',1],[9,'translateX(90px) scale(.8)',1],[13,'translateX(0) scale(1)',1],[15,'translateX(0) scale(1)',1]),
  motion('picture-arc',[0,'rotate(-25deg) translateX(-120px)',1],[5,'rotate(-25deg) translateX(-120px)',1],[10,'rotate(16deg) translateX(65px)',1],[13,'rotate(0)',1],[15,'rotate(0)',1]),
  enter('bookmark',10.2,'translateY(-80px)'),enter('ports',11.4,'scaleX(.9)'),enter('title',12),
 ],
 kacha:[
  enter('sample',0,'scale(1.06)'),
  motion('crop',[0,'scale(1.25)',0],[1.3,'scale(1.25)',1],[4,'none',1],[10,'none',1],[13,'scale(.97)',.5],[15,'scale(.97)',.5]),
  motion('scan',[0,'translateY(-65px)',0],[5,'translateY(-65px)',0],[5.4,'translateY(-65px)',1],[8.8,'translateY(185px)',1],[9,'translateY(185px)',0],[15,'translateY(185px)',0]),
  enter('ocr',7.5,'translateX(-35px)'),draw('annotation',10.2,12.7),enter('title',.4),
 ],
};
