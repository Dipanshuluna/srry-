import { useEffect, useRef } from 'react';
import { phrases } from './phrases';

const palettes={
  twilight:['#9a89d7','#ab88d2','#c18ac4','#d48fa9','#d9a17d','#d7b16f','#c891a9','#ad8bd4','#9a89d7'],
  rose:['#cf83c4','#db89ad','#dfa07c','#dcb66f','#d98b9f','#c884c9','#cf83c4'],
  ocean:['#7ba7dc','#8197e1','#a18bde','#c08bc8','#9b9fda','#7ba7dc']
};

function tintAt(position,theme,opacity=.82){
  const stops=palettes[theme]||palettes.twilight,scaled=position*(stops.length-1);
  const index=Math.min(stops.length-2,Math.floor(scaled)),amount=scaled-index;
  const parse=hex=>[1,3,5].map(start=>parseInt(hex.slice(start,start+2),16));
  const a=parse(stops[index]),b=parse(stops[index+1]);
  const [r,g,bl]=a.map((v,i)=>Math.round(v+(b[i]-v)*amount));
  return `rgba(${r},${g},${bl},${opacity})`;
}

const apologyClusters=Array.from({length:10},(_,cluster)=>
  phrases.slice(cluster*10,(cluster+1)*10).slice().sort((a,b)=>a.length-b.length)
);

export default function CircularVisualizer({audio,sensitivity,motion,theme}){
  const canvasRef=useRef(null),sensitivityRef=useRef(sensitivity);
  useEffect(()=>{sensitivityRef.current=sensitivity},[sensitivity]);

  useEffect(()=>{
    const canvas=canvasRef.current,ctx=canvas.getContext('2d');
    let width=0,height=0,dpr=1,frame=0,start=performance.now();
    const resize=()=>{
      const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
      dpr=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    const render=now=>{
      frame=requestAnimationFrame(render);
      if(!width||!height)return;
      const time=(now-start)/1000,size=Math.min(width,height),cx=width/2,cy=height/2,outer=size*.46;
      ctx.clearRect(0,0,width,height);
      const glow=ctx.createRadialGradient(cx,cy,size*.15,cx,cy,outer*1.5);
      glow.addColorStop(0,'rgba(65,37,91,.12)');glow.addColorStop(.7,'rgba(81,32,101,.09)');glow.addColorStop(1,'rgba(5,4,13,0)');
      ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);

      const data=audio.current?.getData(),gain=sensitivityRef.current;
      let energy=0;
      if(data){const count=Math.min(data.length,48);for(let i=0;i<count;i++)energy+=data[i]/255;energy/=count||1}
      else energy=.045+.015*Math.sin(time*1.1);

      // Quiet tick marks respond to the music without turning into a spectrum display.
      const tickCount=180;
      for(let i=0;i<tickCount;i++){
        const angle=i/tickCount*Math.PI*2-Math.PI/2,bin=data?Math.floor(i/tickCount*data.length):0;
        const value=data?data[bin]/255:energy,len=3+value*gain*2.6;
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(angle)*(outer+1),cy+Math.sin(angle)*(outer+1));
        ctx.lineTo(cx+Math.cos(angle)*(outer+1+len),cy+Math.sin(angle)*(outer+1+len));
        ctx.strokeStyle=`rgba(190,132,185,${.12+value*.25})`;ctx.lineWidth=.7;ctx.stroke();
      }

      // The reference boundary stays still; the soft halo carries the audio response.
      ctx.beginPath();ctx.arc(cx,cy,outer,0,Math.PI*2);
      ctx.strokeStyle='rgba(221,177,104,.82)';ctx.lineWidth=1.35;
      ctx.shadowColor=`rgba(222,175,103,${.23+energy*.18})`;ctx.shadowBlur=8+energy*5;ctx.stroke();ctx.shadowBlur=0;

      for(let i=0;i<34;i++){
        const angle=i*2.399+1.2,r=outer+size*(.012+(i%4)*.008);
        const x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r,alpha=.2+.6*(.5+.5*Math.sin(time*.48+i));
        ctx.fillStyle=`rgba(221,197,220,${alpha*.3})`;ctx.beginPath();ctx.arc(x,y,i%5===0?1:.55,0,Math.PI*2);ctx.fill();
      }
    };
    resize();const observer=new ResizeObserver(resize);observer.observe(canvas);frame=requestAnimationFrame(render);
    return()=>{cancelAnimationFrame(frame);observer.disconnect()};
  },[audio]);

  return <>
    <canvas className="wheel-canvas" ref={canvasRef} aria-label="Audio reactive radial apology visualizer"/>
    <svg className={`radial-typography${motion?' is-moving':''}`} viewBox="0 0 1000 1000" aria-label="One hundred apologies in ten radial clusters">
      {apologyClusters.map((clusterPhrases,clusterIndex)=>{
        const angle=-90+clusterIndex*36;
        return <g key={clusterIndex} transform={`rotate(${angle} 500 500)`}>
          <g className={`cluster-drift${motion?'':' still'}`} style={{'--drift-duration':`${48+clusterIndex*2.4}s`}}>
            {clusterPhrases.map((phrase,row)=>{
              const radius=244+row*18.2;
              const maximumWidth=2*radius*Math.sin((Math.PI/10)*.82);
              const estimatedWidth=phrase.length*5;
              const condensed=estimatedWidth>maximumWidth;
              return <text key={phrase} x="500" y={500-radius} textAnchor="middle" dominantBaseline="middle"
                className="radial-phrase" fill={tintAt((clusterIndex+.18+row*.018)/9,theme,.83)}
                fontSize="12" textLength={condensed?maximumWidth:undefined}
                lengthAdjust={condensed?'spacingAndGlyphs':undefined}>{phrase}</text>;
            })}
          </g>
        </g>;
      })}
    </svg>
    <svg className="central-disc" viewBox="0 0 1000 1000" aria-hidden="true">
      <defs><radialGradient id="center-disc-fill" cx="46%" cy="36%" r="75%"><stop offset="0%" stopColor="#21172e"/><stop offset="70%" stopColor="#100d1c"/><stop offset="100%" stopColor="#0b0913"/></radialGradient></defs>
      <circle cx="500" cy="500" r="493" fill="url(#center-disc-fill)" stroke="rgba(201,155,113,.3)" strokeWidth="3"/>
      <circle cx="500" cy="500" r="462" fill="none" stroke="rgba(201,155,113,.16)" strokeWidth="3"/>
    </svg>
  </>;
}
