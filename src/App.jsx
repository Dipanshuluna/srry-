import { useEffect, useRef, useState } from 'react';
import { AudioLines, CirclePause, CirclePlay, Expand, FileAudio2, Heart, Volume2, VolumeX } from 'lucide-react';
import CircularVisualizer from './CircularVisualizer.jsx';
import { AudioPlayer } from './AudioPlayer.js';
import { phrases } from './phrases.js';

const fmt=n=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
export default function App(){
  const playerRef=useRef(null),inputRef=useRef(null);const [audio,setAudio]=useState({playing:false,current:0,duration:0,title:'A Quiet Apology',demo:false,autoplayBlocked:false,error:''});const [messageIndex,setMessageIndex]=useState(0),[sensitivity,setSensitivity]=useState(1.35),[volume,setVolume]=useState(.72),[motion,setMotion]=useState(true),[showNote,setShowNote]=useState(false),[edit,setEdit]=useState(false),[title,setTitle]=useState('A Quiet Apology'),[friend,setFriend]=useState('A gentle melody, just for you'),[theme,setTheme]=useState('twilight');
  useEffect(()=>{const p=new AudioPlayer(next=>setAudio(prev=>({...prev,...next})));playerRef.current=p;p.loadDefault(`${import.meta.env.BASE_URL}quiet-apology.wav`,'A Quiet Apology');return()=>p.destroy()},[]);
  useEffect(()=>{const timer=window.setInterval(()=>setMessageIndex(index=>(index+1)%phrases.length),1000);return()=>window.clearInterval(timer)},[]);
  const toggle=()=>playerRef.current?.toggle();
  useEffect(()=>{const fn=e=>{if(e.code==='Space'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();toggle()}if(e.key==='f'||e.key==='F')document.fullscreenElement?document.exitFullscreen?.():document.documentElement.requestFullscreen?.()};window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn)},[]);
  const full=()=>document.fullscreenElement?document.exitFullscreen?.():document.documentElement.requestFullscreen?.();
  const selectFile=e=>{const file=e.target.files?.[0];if(file){playerRef.current?.load(file);setTitle(file.name.replace(/\.[^.]+$/,''))}e.target.value=''};
  const changeVol=e=>{const v=Number(e.target.value);setVolume(v);playerRef.current?.setVolume(v)};
  const changeTitle=(key,val)=>key==='title'?setTitle(val):setFriend(val);
  return <main className="app-shell">
    <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
    <header className="topbar"><div className="brand"><span className="brand-mark"><Heart size={14}/></span><span>little things left unsaid</span></div><div className="top-note">A little apology, made by Dipanshu <span className="top-dot"/></div><button className="icon-button" aria-label="Toggle fullscreen" onClick={full}><Expand size={16}/></button></header>
    <section className="stage" aria-label="Apology visualizer">
      <CircularVisualizer audio={playerRef} sensitivity={sensitivity} motion={motion} theme={theme}/>
      <div className="center-copy">
        <p className="center-kicker">100 WAYS TO SAY<br/>SORRY</p>
        <div className="center-heart"><span/><Heart size={14}/><span/></div>
        <p className="main-apology" key={messageIndex}>{phrases[messageIndex]}</p>
        <span className="center-rule"/>
        {showNote&&<p className="note-overlay">I’m not asking you to forget. I just hope you’ll let me make this right.</p>}
      </div>
    </section>
    <section className="player-card">
      <div className="track-info"><span className="track-icon"><AudioLines size={17}/></span><div><strong>{title}</strong><small>{audio.autoplayBlocked?'Tap play to hear the melody':friend}</small></div><button className="text-edit" title="Edit title and note" onClick={()=>setEdit(!edit)}>EDIT</button></div>
      <div className="player-controls"><button className="play-button" onClick={toggle} aria-label={audio.playing?'Pause':'Play'}>{audio.playing?<CirclePause size={35} strokeWidth={1.3}/>:<CirclePlay size={35} strokeWidth={1.3}/>}</button><div className="timeline-wrap"><div className="timeline-labels"><span>{audio.demo?'LIVE':fmt(audio.current)}</span><span>{audio.demo?'DEMO MODE':fmt(audio.duration)}</span></div><input aria-label="Audio progress" className="progress" type="range" min="0" max={audio.duration||1} value={Math.min(audio.current,audio.duration||1)} onChange={e=>{playerRef.current.audio.currentTime=Number(e.target.value)}} style={{'--progress':`${audio.duration?audio.current/audio.duration*100:0}%`}}/></div></div>
      <div className="volume"><button className="plain-icon" onClick={()=>changeVol({target:{value:volume>0?0:.72}})} aria-label="Mute volume">{volume===0?<VolumeX size={15}/>:<Volume2 size={15}/>}</button><input aria-label="Volume" type="range" min="0" max="1" step=".01" value={volume} onChange={changeVol}/></div>
      <button className="upload-button" onClick={()=>inputRef.current?.click()}><FileAudio2 size={15}/><span>Choose a song</span></button><input ref={inputRef} type="file" accept="audio/*" hidden onChange={selectFile}/>
    </section>
    {audio.error&&<p className="error-message">{audio.error}</p>}
    {edit&&<section className="edit-panel"><label>Little note<input value={title} onChange={e=>changeTitle('title',e.target.value)} maxLength={50}/></label><label>To<input value={friend} onChange={e=>changeTitle('friend',e.target.value)} maxLength={40}/></label><button onClick={()=>setEdit(false)}>Done</button></section>}
    <footer className="bottom-bar"><div className="settings"><label className="setting"><span>GLOW</span><input aria-label="Visualizer sensitivity" type="range" min=".2" max="2.6" step=".1" value={sensitivity} onChange={e=>setSensitivity(Number(e.target.value))}/></label><button className={`setting-toggle ${motion?'active':''}`} onClick={()=>setMotion(!motion)}><span className="toggle-dot"/> AMBIENCE</button><button className={`setting-toggle ${showNote?'active':''}`} onClick={()=>setShowNote(!showNote)}><span className="toggle-dot"/> LITTLE NOTE</button><button className="setting-toggle theme-button" title="Change colour theme" onClick={()=>setTheme(theme==='twilight'?'rose':theme==='rose'?'ocean':'twilight')}><span className={`theme-dot ${theme}`}/> {theme.toUpperCase()}</button></div><div className="footer-right"><span><i/> {audio.demo?'DEMO VISUALIZER':'AUDIO REACTIVE'}</span><span className="keyboard-hint">SPACE TO PLAY · F FOR FULLSCREEN</span></div></footer>
  </main>
}
