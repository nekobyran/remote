import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Physical transmission follows three.js' MIT example. Botanical surfaces,
// deformation, choreography and SVG artwork are authored for NKBR.
// https://threejs.org/examples/webgl_materials_physical_transmission.html
const canvas=document.querySelector('.forest-canvas');
if(canvas)initializeForest(canvas);

async function initializeForest(canvas){
  const context=canvas.getContext('webgl2',{alpha:false,antialias:true,powerPreference:'low-power'});
  if(!context)return;
  const renderer=new THREE.WebGLRenderer({canvas,context,antialias:true});
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.04;
  renderer.transmissionResolutionScale=.65;
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#e5efdc');
  const camera=new THREE.PerspectiveCamera(42,1,.1,100);
  const timeUniform={value:0};
  scene.add(new THREE.HemisphereLight('#fffbe5','#547963',1.6));
  const sun=new THREE.DirectionalLight('#fff4ce',2.7);
  sun.position.set(-5,10,8);scene.add(sun);
  const edgeLight=new THREE.DirectionalLight('#c4edcf',2);
  edgeLight.position.set(8,0,4);scene.add(edgeLight);
  const room=new RoomEnvironment();
  const pmrem=new THREE.PMREMGenerator(renderer);
  const environment=pmrem.fromScene(room,.03);
  scene.environment=environment.texture;
  scene.environmentIntensity=.7;
  room.dispose();pmrem.dispose();

  const loader=new THREE.TextureLoader();
  const [forestTexture,branchTexture]=await Promise.all([
    loader.loadAsync('/_nkbr/forest-still.svg'),
    loader.loadAsync('/_nkbr/forest-branch.svg'),
  ]);
  forestTexture.colorSpace=THREE.SRGBColorSpace;
  branchTexture.colorSpace=THREE.SRGBColorSpace;
  const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(66,42),new THREE.MeshBasicMaterial({map:forestTexture,toneMapped:false}));
  backdrop.position.set(0,0,-21);scene.add(backdrop);
  const botanical=[];
  for(const [x,y,z,scale,rotation] of [[-13,-1,-5,1,0],[13,8,-10,1.1,Math.PI],[-18,10,-15,.8,.45]]){
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(14,20),new THREE.MeshBasicMaterial({map:branchTexture,transparent:true,depthWrite:false,opacity:[.42,.24,.12][botanical.length],side:THREE.DoubleSide,toneMapped:false}));
    mesh.position.set(x,y,z);mesh.scale.setScalar(scale);mesh.rotation.z=rotation;
    scene.add(mesh);botanical.push({mesh,x,y,rotation});
  }

  // Smooth closed leaf surfaces, with curvature instead of polygonal clusters.
  const leafGeometry=new THREE.SphereGeometry(1,48,96);
  const positions=leafGeometry.attributes.position;
  for(let index=0;index<positions.count;index+=1){
    const x=positions.getX(index),y=positions.getY(index),z=positions.getZ(index);
    positions.setXYZ(index,x*(.88-.2*y)+.18*Math.sin(y*2),y*2.5,z*.3+.36*y*y);
  }
  leafGeometry.computeVertexNormals();

  const deformation=`
    uniform float uForestTime;
    uniform float uLeafOffset;
    vec3 nkbrDeform(vec3 p){
      float phase=uForestTime*.392699-uLeafOffset;
      float q=clamp((p.y+1.75)/4.25,0.,1.);
      float curl=.65+.28*cos(phase);
      float radius=4.25/curl;
      float angle=q*curl;
      vec3 result=p;
      if(p.y>-1.75){
        result.y=-1.75+(radius+p.z)*sin(angle);
        result.z=(radius+p.z)*cos(angle)-radius;
      }
      float twist=.15*sin(phase+.7)*q*q;
      result.x=p.x*(1.+.04*sin(phase)*q)*cos(twist)-result.z*sin(twist);
      result.z=p.x*sin(twist)+result.z*cos(twist);
      return result;
    }
  `;
  function waveMaterial(material,offset,lit){
    material.onBeforeCompile=shader=>{
      shader.uniforms.uForestTime=timeUniform;
      shader.uniforms.uLeafOffset={value:offset};
      shader.vertexShader=deformation+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed=nkbrDeform(position);');
      if(lit)shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
        vec3 base=nkbrDeform(position);
        mat3 jacobian=mat3(
          (nkbrDeform(position+vec3(.002,0.,0.))-base)/.002,
          (nkbrDeform(position+vec3(0.,.002,0.))-base)/.002,
          (nkbrDeform(position+vec3(0.,0.,.002))-base)/.002);
        objectNormal=normalize(transpose(inverse(jacobian))*objectNormal);
      `);
    };
    return material;
  }
  const sculpture=new THREE.Group();
  scene.add(sculpture);
  const actors=[];
  for(let index=0;index<3;index+=1){
    const actor=new THREE.Group();
    const glass=waveMaterial(new THREE.MeshPhysicalMaterial({
      color:'#d6e9bf',metalness:0,roughness:.07,transmission:.94,thickness:.48,ior:1.38,
      clearcoat:1,clearcoatRoughness:.035,envMapIntensity:2.1,
      attenuationColor:new THREE.Color('#63916d'),attenuationDistance:3.5,
      iridescence:.11,iridescenceIOR:1.25,dispersion:.45,
    }),index*.2356,true);
    const leaf=new THREE.Mesh(leafGeometry,glass);
    leaf.position.y=2.5;
    actor.add(leaf);
    // Fine veins are part of the same deforming botanical surface.
    const veins=[];
    const pointAt=(y,x=0)=>new THREE.Vector3(x+.18*Math.sin(y/2.5*2),y,.32+.36*(y/2.5)**2);
    function addVein(points){
      const curve=new THREE.CatmullRomCurve3(points);
      const samples=curve.getPoints(20);
      for(let point=1;point<samples.length;point+=1)veins.push(...samples[point-1].toArray(),...samples[point].toArray());
    }
    addVein([pointAt(-2.35),pointAt(-.9),pointAt(.8),pointAt(2.35)]);
    for(let row=0;row<6;row+=1){
      const y=-1.7+row*.56;
      const width=.71*Math.sqrt(1-(y/2.5)**2);
      for(const side of [-1,1])addVein([pointAt(y),pointAt(y+.22,side*width*.48),pointAt(y+.36,side*width*.87)]);
    }
    const veinGeometry=new THREE.BufferGeometry();
    veinGeometry.setAttribute('position',new THREE.Float32BufferAttribute(veins,3));
    const veinMaterial=waveMaterial(new THREE.LineBasicMaterial({color:'#f4ffe9',transparent:true,opacity:.42}),index*.2356,false);
    const lines=new THREE.LineSegments(veinGeometry,veinMaterial);
    lines.position.y=2.5;actor.add(lines);
    sculpture.add(actor);actors.push(actor);
  }
  const stemCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.3,-1,.45),new THREE.Vector3(-.18,-.45,.38),new THREE.Vector3(-.16,.1,.36)]);
  sculpture.add(new THREE.Mesh(new THREE.TubeGeometry(stemCurve,48,.045,10,false),new THREE.MeshPhysicalMaterial({color:'#b7cea0',roughness:.13,transmission:.8,thickness:.1,ior:1.38})));

  const caustics=new THREE.Mesh(new THREE.PlaneGeometry(48,27),new THREE.ShaderMaterial({
    uniforms:{uTime:timeUniform},transparent:true,depthWrite:false,
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec2 vUv;uniform float uTime;
      void main(){vec2 p=vUv*vec2(6.,3.);float t=uTime*.12;
      p+=vec2(sin(p.y*1.5+t),cos(p.x*1.2-t))*.3;
      float field=sin(p.x*2.4+sin(p.y*1.7+t))*.5+cos(p.y*2.7-t)*.5;
      float light=pow(max(0.,sin(field*8.+t)),24.);
      float edge=exp(-pow((vUv.x-.73)*5.,2.))*smoothstep(0.,.22,vUv.y)*(1.-smoothstep(.52,.95,vUv.y));
      gl_FragColor=vec4(.98,1.,.79,light*edge*.17);}`,
  }));
  caustics.position.set(0,-1,-14);scene.add(caustics);
  const lightCurtain=new THREE.Mesh(new THREE.PlaneGeometry(50,35),new THREE.ShaderMaterial({
    uniforms:{uTime:timeUniform},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec2 vUv;uniform float uTime;
      void main(){float angle=vUv.x+vUv.y*.38;float t=uTime*.06;
      float a=exp(-pow((angle-.48-sin(t)*.018)*16.,2.));
      float b=exp(-pow((angle-.76-cos(t)*.016)*21.,2.));
      gl_FragColor=vec4(1.,.97,.74,(a+b*.6)*sin(vUv.y*3.14159)*.08);}`,
  }));
  lightCurtain.position.set(-3,2,-13);scene.add(lightCurtain);

  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const toggle=document.querySelector('[data-forest-toggle]');
  const pointer=new THREE.Vector2();
  const smoothed=new THREE.Vector2();
  let paused=false,suspended=false,lastFrame=0,lastTick=0,time=0,frameCount=0,lastScroll=0,resizeFrame=0;
  try{paused=localStorage.getItem('nkbr:forest-motion')==='paused';}catch{}
  function renderScene(){
    const moving=!paused&&!motion.matches&&!suspended&&!document.hidden;
    if(moving){
      smoothed.lerp(pointer,.045);
      const target=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);
      lastScroll+=(Math.min(1,target)-lastScroll)*.045;
    }
    const portrait=camera.aspect<1;
    camera.position.set(smoothed.x*.38,smoothed.y*.24,portrait?22:18);
    camera.lookAt(0,0,-5);
    timeUniform.value=time;
    // A 16-second score: gather, unfurl, turn through light, gather again.
    const phase=time*Math.PI*2/16;
    const unfurl=(1-Math.cos(phase))*.5;
    sculpture.position.set(portrait?2.8:5.2,portrait?2.1:.3,0);
    sculpture.scale.setScalar(portrait?.78:1.02);
    sculpture.rotation.set(.12*Math.sin(phase),-.28+.34*Math.sin(phase),.08*Math.sin(phase));
    sculpture.position.y+=Math.sin(phase)*.16-lastScroll*.8;
    actors.forEach((actor,index)=>{
      actor.rotation.z=[-.65,.12,.86][index]+(unfurl-.5)*[.22,-.12,-.24][index];
      actor.rotation.y=[-.32,.22,.58][index]+Math.sin(phase+index*.55)*.27;
      actor.rotation.x=.14*Math.sin(phase+index*.7);
    });
    botanical.forEach(({mesh,x,y,rotation},index)=>{
      mesh.position.x=(portrait?[-7,6.3,-10][index]:x)+smoothed.x*(.18+index*.06);
      mesh.position.y=y-lastScroll*.3;
      mesh.rotation.z=rotation+Math.sin(phase+index*.9)*.012;
    });
    renderer.render(scene,camera);
    frameCount+=1;
    canvas.dataset.frames=String(frameCount);
    canvas.dataset.phase=(time%16).toFixed(2);
  }
  function resize(){
    resizeFrame=0;
    const width=innerWidth,height=innerHeight,pixels=width<700?500000:1300000;
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5,Math.sqrt(pixels/(width*height))));
    renderer.setSize(width,height,false);
    camera.aspect=width/height;camera.updateProjectionMatrix();renderScene();
  }
  function animate(timestamp){
    if(timestamp-lastFrame<1000/30)return;
    time+=lastTick?Math.min(.1,(timestamp-lastTick)/1000):0;
    lastTick=timestamp;lastFrame=timestamp;renderScene();
  }
  function syncMotion(){
    renderer.setAnimationLoop(null);lastTick=0;
    const running=!paused&&!motion.matches&&!document.hidden&&!suspended;
    canvas.dataset.motion=running?'running':'still';
    if(toggle){
      toggle.hidden=false;toggle.disabled=motion.matches;
      toggle.setAttribute('aria-pressed',String(paused||motion.matches));
      toggle.setAttribute('aria-label',motion.matches?'森林动态已随系统偏好关闭':paused?'播放森林动态':'暂停森林动态');
      toggle.querySelector('span').textContent=motion.matches?'静态背景':paused?'播放背景':'暂停背景';
    }
    if(running)renderer.setAnimationLoop(animate);else renderScene();
  }
  toggle?.addEventListener('click',()=>{
    paused=!paused;
    try{localStorage.setItem('nkbr:forest-motion',paused?'paused':'playing');}catch{}
    syncMotion();
  });
  addEventListener('pointermove',event=>{
    if(fine.matches&&!paused&&!motion.matches)pointer.set(event.clientX/innerWidth*2-1,-(event.clientY/innerHeight*2-1));
  },{passive:true});
  addEventListener('pointerout',event=>{if(!event.relatedTarget)pointer.set(0,0);},{passive:true});
  addEventListener('resize',()=>{if(!resizeFrame)resizeFrame=requestAnimationFrame(resize);},{passive:true});
  document.addEventListener('visibilitychange',syncMotion);
  addEventListener('pageswap',()=>{suspended=true;syncMotion();});
  addEventListener('pagehide',()=>{suspended=true;renderer.setAnimationLoop(null);});
  addEventListener('pageshow',()=>{suspended=false;syncMotion();});
  motion.addEventListener('change',syncMotion);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();renderer.setAnimationLoop(null);canvas.dataset.state='lost';});
  canvas.addEventListener('webglcontextrestored',()=>{canvas.dataset.state='ready';syncMotion();});
  resize();
  canvas.dataset.state='ready';canvas.dataset.engine='three-r'+THREE.REVISION;
  canvas.dataset.animation='kinetic-botanical-glass';canvas.dataset.surfaces='3';
  syncMotion();
}
