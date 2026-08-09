const tabs=[...document.querySelectorAll('[role="tab"]')]
const panels=[...document.querySelectorAll('[role="tabpanel"]')]

function activate(name,{focus=false,updateHash=true}={}){
  tabs.forEach(tab=>{
    const active=tab.dataset.tab===name
    tab.setAttribute('aria-selected',String(active))
    tab.tabIndex=active?0:-1
    if(active&&focus)tab.focus()
  })
  panels.forEach(panel=>{
    const active=panel.dataset.panel===name
    panel.hidden=!active
    panel.classList.toggle('is-active',active)
  })
  if(updateHash)history.replaceState(null,'',`#${name}`)
}

tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>activate(tab.dataset.tab))
  tab.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return
    event.preventDefault()
    let next=index
    if(event.key==='ArrowRight')next=(index+1)%tabs.length
    if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length
    if(event.key==='Home')next=0
    if(event.key==='End')next=tabs.length-1
    activate(tabs[next].dataset.tab,{focus:true})
  })
})

const requested=location.hash.slice(1)
if(tabs.some(tab=>tab.dataset.tab===requested)){
  activate(requested,{updateHash:false})
  requestAnimationFrame(()=>document.querySelector('#index')?.scrollIntoView())
}
