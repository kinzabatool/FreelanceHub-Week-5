
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const KEY = "freelancehubProjects";
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const escapeHTML = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const money = n => "PKR " + Number(n || 0).toLocaleString("en-PK");
  const date = v => v ? new Date(v+"T00:00:00").toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"}) : "Not set";
  const seed = [
    {id:"project-1001",title:"FreelanceHub Website UI Design",client:"Bright Future Studio",freelancer:"Ayesha Khan",budget:45000,deadline:"2026-11-25",status:"In Progress",progress:65,description:"Design a clean, responsive marketplace experience with clear navigation, reusable components and polished mobile layouts.",tasks:[{title:"Research and references",done:true},{title:"Homepage and dashboard wireframes",done:true},{title:"High-fidelity UI screens",done:true},{title:"Responsive revisions",done:false},{title:"Final handoff and source files",done:false}],deliveries:[]},
    {id:"project-1002",title:"Brand Social Media Kit",client:"Urban Roots",freelancer:"Ayesha Khan",budget:18000,deadline:"2026-11-18",status:"Submitted",progress:100,description:"Create a cohesive social media kit with post templates, story designs and editable source files.",tasks:[{title:"Brand moodboard",done:true},{title:"Post templates",done:true},{title:"Story templates",done:true},{title:"Export and submit files",done:true}],deliveries:[{name:"Social media kit — first delivery",note:"Editable design files and exported previews.",at:"2026-11-10"}]},
    {id:"project-1003",title:"Portfolio Landing Page",client:"Horizon Apps",freelancer:"Ayesha Khan",budget:30000,deadline:"2026-12-02",status:"Pending",progress:0,description:"Build a modern portfolio landing page with project highlights and contact details.",tasks:[{title:"Confirm project requirements",done:false},{title:"Build landing page",done:false},{title:"Testing and delivery",done:false}],deliveries:[]},
    {id:"project-1004",title:"Product Dashboard Prototype",client:"Nova Labs",freelancer:"Ayesha Khan",budget:52000,deadline:"2026-10-30",status:"Completed",progress:100,description:"Create an interactive product dashboard prototype with analytics cards and navigation.",tasks:[{title:"Dashboard layout",done:true},{title:"Charts and components",done:true},{title:"Prototype handoff",done:true}],deliveries:[{name:"Final dashboard prototype",note:"Approved final Figma prototype.",at:"2026-10-28"}]}
  ];
  if (!localStorage.getItem(KEY)) localStorage.setItem(KEY,JSON.stringify(seed));
  let projects = read(KEY,seed), role = "freelancer";
  const save = () => localStorage.setItem(KEY,JSON.stringify(projects));
  const statusClass = s => s.toLowerCase().replace(/\s+/g,"-");
  function card(p){
    return `<article class="project-card"><div class="project-top"><span class="eyebrow">${role==="client"?"Client project":"Freelance order"}</span><span class="status ${statusClass(p.status)}">${escapeHTML(p.status)}</span></div><h2>${escapeHTML(p.title)}</h2><p class="muted">${role==="client"?"Freelancer":"Client"}: ${escapeHTML(role==="client"?p.freelancer:p.client)}</p><div class="project-meta"><span>💰 ${money(p.budget)}</span><span>📅 Due ${date(p.deadline)}</span></div><div class="project-top"><strong>Project progress</strong><strong>${p.progress}%</strong></div><div class="progress-track"><div class="progress-fill" style="width:${p.progress}%"></div></div><div class="project-actions"><a class="btn btn-primary" href="project-details.html?id=${encodeURIComponent(p.id)}">View details</a></div></article>`;
  }
  function renderList(){
    if (!$("projectList")) return;
    const q=($("projectSearch").value||"").toLowerCase(), filter=$("statusFilter").value;
    $("statAll").textContent=projects.length;
    $("statActive").textContent=projects.filter(p=>p.status==="In Progress").length;
    $("statSubmitted").textContent=projects.filter(p=>p.status==="Submitted").length;
    $("statCompleted").textContent=projects.filter(p=>p.status==="Completed").length;
    const shown=projects.filter(p=>(filter==="all"||p.status===filter)&&`${p.title} ${p.client} ${p.freelancer}`.toLowerCase().includes(q));
    $("projectList").innerHTML=shown.length?shown.map(card).join(""):`<div class="empty-state" style="grid-column:1/-1"><h3>No projects found</h3><p>Try changing your search or status filter.</p></div>`;
  }
  if ($("projectList")){
    $("projectSearch").addEventListener("input",renderList);$("statusFilter").addEventListener("change",renderList);
    document.querySelectorAll("[data-role]").forEach(btn=>btn.addEventListener("click",()=>{role=btn.dataset.role;document.querySelectorAll("[data-role]").forEach(b=>b.classList.toggle("active",b===btn));renderList();}));
    renderList();
  }
  function renderDetails(){
    const host=$("projectDetails");if(!host)return;
    const id=new URLSearchParams(location.search).get("id"), p=projects.find(x=>x.id===id);
    if(!p){host.innerHTML='<div class="empty-state"><h2>Project not found</h2><p>Return to your orders and choose a project.</p><a class="btn btn-primary" href="orders.html">My Orders</a></div>';return;}
    const done=p.tasks.filter(t=>t.done).length;
    host.innerHTML=`<div class="page-heading"><div><p class="eyebrow">Project workspace · ${escapeHTML(p.id)}</p><h1>${escapeHTML(p.title)}</h1><p class="muted">${escapeHTML(p.description)}</p></div><span class="status ${statusClass(p.status)}">${escapeHTML(p.status)}</span></div>
    <div class="detail-layout"><div><section class="panel detail-section"><h2>Project overview</h2><div class="project-top"><strong>Overall progress</strong><strong id="progressText">${p.progress}%</strong></div><div class="progress-track"><div class="progress-fill" id="progressBar" style="width:${p.progress}%"></div></div><p class="help-text">${done} of ${p.tasks.length} milestones completed</p></section>
    <section class="panel detail-section"><h2>Milestones & tasks</h2><div id="taskList">${p.tasks.map((t,i)=>`<label class="milestone ${t.done?"done":""}"><input type="checkbox" data-task="${i}" ${t.done?"checked":""}><span><strong>${escapeHTML(t.title)}</strong><small>${t.done?"Completed":"Pending"}</small></span></label>`).join("")}</div><form id="taskForm" class="project-toolbar"><input id="newTask" required maxlength="90" placeholder="Add a milestone or task"><button class="btn btn-primary">Add task</button></form></section>
    <section class="panel detail-section"><h2>Delivery & submission</h2><div id="deliveryList">${p.deliveries.length?p.deliveries.map(d=>`<div class="delivery-box" style="margin-bottom:10px"><strong>${escapeHTML(d.name)}</strong><p class="muted">${escapeHTML(d.note)}</p><small>${date(d.at)}</small></div>`).join(""):'<p class="muted">No delivery submitted yet.</p>'}</div><form id="deliveryForm" class="delivery-box"><div class="field"><label for="deliveryName">Delivery title</label><input id="deliveryName" required placeholder="e.g. Final website files"></div><div class="field"><label for="deliveryNote">Submission note</label><textarea id="deliveryNote" rows="3" placeholder="Describe the files or work submitted"></textarea></div><button class="btn btn-primary">Submit delivery</button></form></section></div>
    <aside class="panel detail-side"><div class="detail-section"><h2>Project information</h2><div class="info-row"><span>Client</span><strong>${escapeHTML(p.client)}</strong></div><div class="info-row"><span>Freelancer</span><strong>${escapeHTML(p.freelancer)}</strong></div><div class="info-row"><span>Budget</span><strong>${money(p.budget)}</strong></div><div class="info-row"><span>Deadline</span><strong>${date(p.deadline)}</strong></div><div class="info-row"><span>Tasks</span><strong>${done}/${p.tasks.length}</strong></div></div><div class="detail-section"><h2>Update order status</h2><div class="field"><select id="projectStatus">${["Pending","In Progress","Submitted","Completed","Cancelled"].map(s=>`<option ${p.status===s?"selected":""}>${s}</option>`).join("")}</select></div><button id="saveStatus" class="btn btn-primary" style="width:100%">Save status</button><p class="help-text" style="margin-top:10px">Demo changes are saved in this browser.</p></div></aside></div>`;
    host.querySelectorAll("[data-task]").forEach(input=>input.addEventListener("change",()=>{p.tasks[Number(input.dataset.task)].done=input.checked;p.progress=Math.round(p.tasks.filter(t=>t.done).length/p.tasks.length*100);if(p.progress===100&&p.status==="In Progress")p.status="Submitted";save();renderDetails();}));
    $("taskForm").addEventListener("submit",e=>{e.preventDefault();const title=$("newTask").value.trim();if(title){p.tasks.push({title,done:false});save();renderDetails();}});
    $("deliveryForm").addEventListener("submit",e=>{e.preventDefault();p.deliveries.unshift({name:$("deliveryName").value.trim(),note:$("deliveryNote").value.trim(),at:new Date().toISOString().slice(0,10)});if(p.status==="In Progress")p.status="Submitted";save();renderDetails();});
    $("saveStatus").addEventListener("click",()=>{p.status=$("projectStatus").value;if(p.status==="Completed")p.progress=100;save();renderDetails();});
  }
  renderDetails();
});
