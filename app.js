const field=document.querySelector('#type-field')
const stage=document.querySelector('#type-lines')
const orb=document.querySelector('#type-orb')
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches

if(field&&stage&&orb&&!reduced){
  try{
    const {prepareWithSegments,layoutNextLine}=await import('https://esm.sh/@chenglou/pretext@0.0.8?bundle')
    const copy='SOFTWARE  EXPERIMENTS  PROMPTS  TRACES  AGENTS  DATA  OPEN SOURCE  TOOLS  TESTS  SQL  STRANGE IDEAS  USEFUL THINGS  CONTRIB SIGNALS  GITGAME  BUILD  BREAK  LEARN  REPEAT  '
    const font='650 18px "IBM Plex Mono", Consolas, monospace'
    const prepared=prepareWithSegments(copy.repeat(5),font)
    const lines=[]
    let target={x:.64,y:.5}
    let point={...target}
    let raf=0

    field.classList.add('is-live')
    field.addEventListener('pointermove',event=>{
      const rect=stage.getBoundingClientRect()
      target.x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width))
      target.y=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))
      if(!raf)raf=requestAnimationFrame(frame)
    })
    field.addEventListener('pointerleave',()=>{
      target={x:.64,y:.5}
      if(!raf)raf=requestAnimationFrame(frame)
    })

    function sync(length){
      while(lines.length<length){const element=document.createElement('span');element.className='type-line';stage.append(element);lines.push(element)}
      while(lines.length>length)lines.pop().remove()
    }

    function draw(){
      const width=stage.clientWidth
      const height=stage.clientHeight
      const lineHeight=28
      const radius=Math.min(70,width*.17)
      const centerX=point.x*width
      const centerY=point.y*height
      orb.style.left=`${stage.offsetLeft+centerX}px`
      orb.style.top=`${stage.offsetTop+centerY}px`
      let cursor={segmentIndex:0,graphemeIndex:0}
      const placed=[]
      for(let y=0;y+lineHeight<=height;y+=lineHeight){
        const deltaY=(y+lineHeight/2)-centerY
        let slots=[[0,width]]
        if(Math.abs(deltaY)<radius){
          const deltaX=Math.sqrt(radius*radius-deltaY*deltaY)+16
          slots=[[0,Math.max(0,centerX-deltaX)],[Math.min(width,centerX+deltaX),width]].filter(slot=>slot[1]-slot[0]>48)
        }
        if(!slots.length)continue
        const slot=slots.reduce((best,candidate)=>candidate[1]-candidate[0]>best[1]-best[0]?candidate:best)
        const line=layoutNextLine(prepared,cursor,slot[1]-slot[0])
        if(!line)break
        placed.push({x:slot[0],y,text:line.text})
        cursor=line.end
      }
      sync(placed.length)
      placed.forEach((item,index)=>{const element=lines[index];element.textContent=item.text;element.style.transform=`translate(${item.x}px,${item.y}px)`})
    }

    function frame(){
      raf=0
      point.x+=(target.x-point.x)*.13
      point.y+=(target.y-point.y)*.13
      draw()
      if(Math.abs(target.x-point.x)+Math.abs(target.y-point.y)>.002)raf=requestAnimationFrame(frame)
    }

    new ResizeObserver(draw).observe(stage)
    draw()
  }catch(error){
    console.info('Pretext field unavailable; keeping static fallback.',error)
  }
}


const revealTargets=[...document.querySelectorAll('.section-head,.project,.note,.archive-list,.about-grid')]
if(revealTargets.length&&!reduced&&'IntersectionObserver' in window){
  document.documentElement.classList.add('has-reveal')
  revealTargets.forEach(target=>target.dataset.reveal='')
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return
      entry.target.classList.add('is-visible')
      observer.unobserve(entry.target)
    })
  },{rootMargin:'0px 0px -8% 0px',threshold:.12})
  revealTargets.forEach(target=>observer.observe(target))
}

const tiltEnabled=window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches
if(tiltEnabled){
  document.querySelectorAll('.project').forEach(card=>{
    let frameId=0
    let nextX=0
    let nextY=0
    const renderTilt=()=>{
      frameId=0
      card.style.setProperty('--rx',nextY+'deg')
      card.style.setProperty('--ry',nextX+'deg')
    }
    card.addEventListener('pointermove',event=>{
      const bounds=card.getBoundingClientRect()
      nextX=((event.clientX-bounds.left)/bounds.width-.5)*1.8
      nextY=-((event.clientY-bounds.top)/bounds.height-.5)*1.4
      if(!frameId)frameId=requestAnimationFrame(renderTilt)
    })
    card.addEventListener('pointerleave',()=>{
      nextX=0
      nextY=0
      if(!frameId)frameId=requestAnimationFrame(renderTilt)
    })
  })
}
