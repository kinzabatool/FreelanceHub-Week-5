
document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const STORE_PROFILE = "freelancehubProfile";
  const STORE_SERVICES = "freelancehubServices";

  const defaultProfile = {
    fullName: "Ayesha Khan",
    professionalTitle: "UI/UX Designer",
    location: "Karachi, Pakistan",
    experience: "3 years",
    bio: "I am a creative UI/UX designer who creates clean, accessible and user-friendly digital experiences. I enjoy turning complex problems into simple interfaces.",
    skills: "Figma, UI Design, Wireframing, Prototyping"
  };
  const defaultServices = [{
    id: "sample-1",
    title: "I will design a modern mobile app UI in Figma",
    category: "UI/UX Design",
    price: 8000,
    delivery: "5 days",
    description: "I will design a clean, modern and user-friendly mobile app interface in Figma. The service includes key screens, reusable components and a clickable prototype.",
    tags: ["Figma", "UI Design", "Mobile App", "Prototyping"],
    image: "🎨"
  }];

  function read(key, fallback) {
    try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
    catch { return fallback; }
  }
  function profile() { return read(STORE_PROFILE, defaultProfile); }
  function services() { return read(STORE_SERVICES, defaultServices); }
  function saveServices(items) { localStorage.setItem(STORE_SERVICES, JSON.stringify(items)); }
  function initials(name) {
    return (name || "Freelancer").trim().split(/\s+/).slice(0,2).map(x => x[0]).join("").toUpperCase();
  }
  function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function toast(message) {
    const el = $("toast");
    if (!el) return;
    el.textContent = message; el.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }
  const menuToggle = $("menuToggle"), navLinks = $("navLinks");
  if (menuToggle && navLinks) menuToggle.addEventListener("click", () => navLinks.classList.toggle("active"));

  // Retain Week 2 homepage search behaviour.
  const searchForm = $("searchForm");
  if (searchForm) searchForm.addEventListener("submit", e => {
    e.preventDefault(); const q = $("searchInput")?.value.trim();
    if (q) location.href = `freelancers.html?search=${encodeURIComponent(q)}`;
  });
  document.querySelectorAll(".popular-searches [data-search]").forEach(btn => btn.addEventListener("click", () => {
    location.href = `freelancers.html?search=${encodeURIComponent(btn.dataset.search)}`;
  }));

  // Profile page.
  const p = profile();
  if ($("profileName")) {
    $("profileName").textContent = p.fullName; $("profileTitle").textContent = p.professionalTitle;
    $("profileLocation").textContent = p.location || "Location not added";
    $("profileInitials").textContent = initials(p.fullName);
    $("profileBio").textContent = p.bio; $("profileExperience").textContent = p.experience || "Experience not added";
    $("profileSkills").innerHTML = (p.skills || "").split(",").map(s=>s.trim()).filter(Boolean).map(s=>`<span class="pill">${safe(s)}</span>`).join("");
    $("serviceCount").textContent = services().length;
    renderPreview();
  }
  if ($("publicName")) {
    $("publicName").textContent = p.fullName; $("publicNameSide").textContent = p.fullName;
    $("publicTitle").textContent = `${p.professionalTitle} · ${p.location}`;
    $("publicTitleSide").textContent = p.professionalTitle; $("publicInitials").textContent = initials(p.fullName);
    $("publicBio").textContent = p.bio;
    $("publicSkills").innerHTML = (p.skills || "").split(",").map(s=>s.trim()).filter(Boolean).map(s=>`<span class="pill">${safe(s)}</span>`).join("");
    renderCards($("publicServices"), services().slice(0,3), false);
  }

  // Edit profile: browser-side required-field validation + localStorage.
  const profileForm = $("profileForm");
  if (profileForm) {
    const current = profile();
    $("fullName").value = current.fullName; $("professionalTitle").value = current.professionalTitle;
    $("location").value = current.location; $("experience").value = current.experience;
    $("bio").value = current.bio; $("skills").value = current.skills;
    profileForm.addEventListener("submit", e => {
      e.preventDefault();
      if (!profileForm.reportValidity()) return;
      const updated = {
        fullName: $("fullName").value.trim(), professionalTitle: $("professionalTitle").value.trim(),
        location: $("location").value.trim(), experience: $("experience").value.trim(),
        bio: $("bio").value.trim(), skills: $("skills").value.trim()
      };
      if (updated.bio.length < 20) { $("profileFormMessage").innerHTML = '<div class="notice error">Please write at least 20 characters in your bio.</div>'; return; }
      localStorage.setItem(STORE_PROFILE, JSON.stringify(updated));
      toast("Profile updated successfully!");
      setTimeout(() => location.href = "profile.html", 500);
    });
  }

  // Service form supports both create and edit.
  const serviceForm = $("serviceForm");
  if (serviceForm) {
    const editId = new URLSearchParams(location.search).get("edit");
    if (editId) {
      const found = services().find(s => s.id === editId);
      if (found) {
        $("serviceId").value = found.id; $("serviceTitle").value = found.title;
        $("serviceCategory").value = found.category; $("servicePrice").value = found.price;
        $("deliveryTime").value = found.delivery; $("serviceDescription").value = found.description;
        $("serviceTags").value = found.tags.join(", "); $("serviceImage").value = found.image || "";
        $("serviceSubmit").textContent = "Save Service Changes";
        document.querySelector(".page-heading h1").textContent = "Edit Service";
      }
    }
    serviceForm.addEventListener("submit", e => {
      e.preventDefault();
      if (!serviceForm.reportValidity()) return;
      const title = $("serviceTitle").value.trim(), description = $("serviceDescription").value.trim();
      const price = Number($("servicePrice").value), tags = $("serviceTags").value.split(",").map(x=>x.trim()).filter(Boolean);
      if (title.length < 10 || description.length < 30 || !Number.isFinite(price) || price < 500 || tags.length === 0) {
        $("serviceFormMessage").innerHTML = '<div class="notice error">Check your title, description, price (minimum PKR 500) and add at least one skill tag.</div>'; return;
      }
      const all = services(), id = $("serviceId").value || `service-${Date.now()}`;
      const item = { id, title, category: $("serviceCategory").value, price,
        delivery: $("deliveryTime").value, description, tags, image: $("serviceImage").value.trim() || "💼" };
      const index = all.findIndex(s => s.id === id);
      if (index >= 0) all[index] = item; else all.unshift(item);
      saveServices(all); toast(index >= 0 ? "Service updated!" : "Service published!");
      setTimeout(() => location.href = "my-services.html", 500);
    });
  }

  function renderCards(container, items, actions) {
    if (!container) return;
    if (!items.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">🧩</div><h3>No services yet</h3><p class="muted">Create your first service to show clients what you offer.</p><a class="btn btn-primary" href="create-service.html">Create a Service</a></div>'; return;
    }
    container.innerHTML = items.map(s => `<article class="service-card">
      <div class="service-art">${safe(s.image || "💼")}</div><div class="service-card-body">
      <span class="eyebrow">${safe(s.category)}</span><h3>${safe(s.title)}</h3>
      <p class="muted">${safe((s.description || "").slice(0,105))}${s.description?.length>105?"…":""}</p>
      <div class="service-meta"><span>${safe(s.delivery)} delivery</span><strong class="service-price">PKR ${Number(s.price).toLocaleString("en-PK")}</strong></div>
      <div class="action-row"><a class="btn btn-outline btn-small" href="service-details.html?id=${encodeURIComponent(s.id)}">View</a>
      ${actions ? `<a class="btn btn-outline btn-small" href="create-service.html?edit=${encodeURIComponent(s.id)}">Edit</a><button class="btn btn-danger btn-small" data-delete="${safe(s.id)}" type="button">Delete</button>` : ""}</div>
      </div></article>`).join("");
  }
  function renderPreview() { renderCards($("profileServicePreview"), services().slice(0,1), false); }
  const list = $("myServicesList");
  if (list) {
    renderCards(list, services(), true);
    list.addEventListener("click", e => {
      const btn = e.target.closest("[data-delete]");
      if (!btn) return;
      const id = btn.dataset.delete;
      if (confirm("Delete this service? This action cannot be undone.")) {
        saveServices(services().filter(s => s.id !== id));
        renderCards(list, services(), true); toast("Service deleted.");
      }
    });
  }

  // Service details page.
  const details = $("serviceDetails");
  if (details) {
    const id = new URLSearchParams(location.search).get("id");
    const item = services().find(s => s.id === id) || services()[0];
    if (!item) details.innerHTML = '<div class="empty-state"><h2>Service not found</h2><a class="inline-link" href="my-services.html">Return to My Services</a></div>';
    else details.innerHTML = `<div class="detail-layout"><section class="panel"><div class="detail-visual">${safe(item.image || "💼")}</div><p class="eyebrow">${safe(item.category)}</p><h1 style="font-family:Manrope,sans-serif;margin-bottom:14px">${safe(item.title)}</h1><p>${safe(item.description)}</p><div class="tag-list">${item.tags.map(t=>`<span class="tag">${safe(t)}</span>`).join("")}</div></section><aside class="panel"><p class="muted">Starting price</p><p class="service-price" style="font-size:30px">PKR ${Number(item.price).toLocaleString("en-PK")}</p><p style="margin:14px 0">⏱ ${safe(item.delivery)} delivery</p><p class="muted">Offered by ${safe(profile().fullName)}</p><div class="form-actions"><a class="btn btn-primary" href="freelancer-profile.html">View Freelancer</a><a class="btn btn-outline" href="my-services.html">Back to Services</a></div></aside></div>`;
  }


  // =========================================
  // WEEK 4: JOB LISTINGS & PROPOSALS
  // =========================================
  const JOBS_KEY = "freelancehubJobs";
  const PROPOSALS_KEY = "freelancehubProposals";
  const sampleJobs = [
    {id:"job-sample-1",title:"Build a responsive business website",category:"Web Development",budget:45000,skills:["HTML","CSS","JavaScript","Responsive Design"],description:"We need a modern, responsive website for a small business. The website should include a home page, about page, services page and contact form. Please share examples of similar work and explain your development approach.",duration:"2–4 weeks",client:"BrightPath Studio",postedAt:new Date(Date.now()-86400000).toISOString(),proposals:3},
    {id:"job-sample-2",title:"Design a mobile app UI in Figma",category:"UI/UX Design",budget:30000,skills:["Figma","Wireframing","Prototyping","Mobile UI"],description:"Create a clean and easy-to-use mobile app interface. Deliverables include user flow, wireframes, high-fidelity screens and a clickable Figma prototype. Experience with mobile-first design is preferred.",duration:"1–2 weeks",client:"Horizon Apps",postedAt:new Date(Date.now()-2*86400000).toISOString(),proposals:5},
    {id:"job-sample-3",title:"Create social media brand graphics",category:"Graphic Design",budget:15000,skills:["Adobe Illustrator","Photoshop","Social Media"],description:"We are looking for a graphic designer to create a consistent set of social media post templates and promotional graphics for our growing brand.",duration:"Less than 1 week",client:"Urban Roots",postedAt:new Date(Date.now()-3*86400000).toISOString(),proposals:2},
    {id:"job-sample-4",title:"Write SEO-friendly website content",category:"Writing & Translation",budget:12000,skills:["SEO Writing","Research","Copywriting"],description:"Write engaging and well-researched website content for five main pages. The content should be original, easy to understand and optimized for relevant search terms.",duration:"1–2 weeks",client:"ContentCraft",postedAt:new Date(Date.now()-4*86400000).toISOString(),proposals:7}
  ];
  function readStore(key, fallback) {
    try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
    catch { return fallback; }
  }
  function getJobs() { return readStore(JOBS_KEY, sampleJobs); }
  function setJobs(items) { localStorage.setItem(JOBS_KEY, JSON.stringify(items)); }
  function getProposals() { return readStore(PROPOSALS_KEY, []); }
  function setProposals(items) { localStorage.setItem(PROPOSALS_KEY, JSON.stringify(items)); }
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }
  function formatPKR(value) { return "PKR " + Number(value || 0).toLocaleString("en-PK"); }
  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"});
  }
  function jobCard(job) {
    const tags = (job.skills || []).map(skill=>`<span class="job-skill">${escapeHTML(skill)}</span>`).join("");
    const description = (job.description || "").slice(0,170);
    return `<article class="job-card">
      <div class="job-card-top"><div><span class="job-category">${escapeHTML(job.category)}</span><h2><a href="job-details.html?id=${encodeURIComponent(job.id)}">${escapeHTML(job.title)}</a></h2><p class="muted">Posted by ${escapeHTML(job.client || "Client")}</p></div><div class="job-budget">${formatPKR(job.budget)}</div></div>
      <p class="job-description">${escapeHTML(description)}${job.description?.length>170?"…":""}</p>
      <div class="job-skills">${tags}</div>
      <div class="job-meta"><span>📅 ${formatDate(job.postedAt)}</span><span>⏱ ${escapeHTML(job.duration)}</span><span>✉ ${Number(job.proposals || 0)} proposals</span></div>
      <div class="job-card-actions"><a class="btn btn-primary" href="submit-proposal.html?job=${encodeURIComponent(job.id)}">Apply Now</a><a class="btn btn-outline" href="job-details.html?id=${encodeURIComponent(job.id)}">View Details</a></div>
    </article>`;
  }

  // Seed demo jobs only when no job data exists in this browser.
  if (localStorage.getItem(JOBS_KEY) === null) setJobs(sampleJobs);

  // Find Jobs: keyword search, category filter and sorting.
  const jobListings = $("jobListings");
  if (jobListings) {
    const search = $("jobSearch"), category = $("jobCategory"), sort = $("jobSort");
    const params = new URLSearchParams(location.search);
    if (params.get("search") && search) search.value = params.get("search");
    if (params.get("category") && category) category.value = params.get("category");
    function renderJobs() {
      const term = (search?.value || "").trim().toLowerCase();
      const cat = category?.value || "";
      let matches = getJobs().filter(job => {
        const searchable = [job.title,job.category,job.description,job.client,...(job.skills||[])].join(" ").toLowerCase();
        return (!term || searchable.includes(term)) && (!cat || job.category === cat);
      });
      if (sort?.value === "budget-high") matches.sort((a,b)=>b.budget-a.budget);
      else if (sort?.value === "budget-low") matches.sort((a,b)=>a.budget-b.budget);
      else matches.sort((a,b)=>new Date(b.postedAt)-new Date(a.postedAt));
      $("jobResultsCount").textContent = `Showing ${matches.length} ${matches.length===1?"job":"jobs"}`;
      jobListings.innerHTML = matches.length ? matches.map(jobCard).join("") :
        '<div class="empty-state"><div class="empty-icon">🔎</div><h3>No jobs found</h3><p class="muted">Try another keyword or category filter.</p><button class="btn btn-outline" id="clearJobFilters" type="button">Clear filters</button></div>';
    }
    [search,category,sort].forEach(control => control?.addEventListener("input",renderJobs));
    jobListings.addEventListener("click", e => {
      if (e.target.id === "clearJobFilters") { search.value=""; category.value=""; sort.value="newest"; renderJobs(); }
    });
    renderJobs();
  }

  // Job details page.
  const jobDetails = $("jobDetails");
  if (jobDetails) {
    const id = new URLSearchParams(location.search).get("id");
    const job = getJobs().find(item=>item.id===id);
    if (!job) jobDetails.innerHTML = '<div class="empty-state"><div class="empty-icon">📄</div><h2>Job not found</h2><a class="inline-link" href="jobs.html">Back to jobs</a></div>';
    else jobDetails.innerHTML = `<div class="job-detail-grid"><section class="panel job-detail-main"><span class="job-category">${escapeHTML(job.category)}</span><h1>${escapeHTML(job.title)}</h1><p class="muted">Posted by ${escapeHTML(job.client || "Client")} · ${formatDate(job.postedAt)}</p><h2 class="section-title" style="margin-top:25px">Project description</h2><p>${escapeHTML(job.description)}</p><h2 class="section-title" style="margin-top:25px">Required skills</h2><div class="job-skills">${(job.skills||[]).map(s=>`<span class="job-skill">${escapeHTML(s)}</span>`).join("")}</div></section><aside class="panel job-side-card"><p class="muted">Project budget</p><div class="budget-large">${formatPKR(job.budget)}</div><div class="detail-line"><span>Category</span><strong>${escapeHTML(job.category)}</strong></div><div class="detail-line"><span>Duration</span><strong>${escapeHTML(job.duration)}</strong></div><div class="detail-line"><span>Proposals</span><strong>${Number(job.proposals||0)}</strong></div><div class="detail-line"><span>Posted</span><strong>${formatDate(job.postedAt)}</strong></div><a class="btn btn-primary" style="width:100%;margin-top:20px" href="submit-proposal.html?job=${encodeURIComponent(job.id)}">Submit a Proposal</a></aside></div>`;
  }

  // Post a Job form.
  const jobForm = $("jobForm");
  if (jobForm) jobForm.addEventListener("submit", e => {
    e.preventDefault();
    if (!jobForm.reportValidity()) return;
    const title=$("jobTitle").value.trim(), description=$("jobDescription").value.trim();
    const budget=Number($("jobBudget").value), skills=$("jobSkills").value.split(",").map(s=>s.trim()).filter(Boolean);
    if (title.length<10 || description.length<30 || !Number.isFinite(budget) || budget<500 || !skills.length) {
      $("jobFormMessage").innerHTML='<div class="notice error">Please check the title, description, budget (minimum PKR 500) and required skills.</div>'; return;
    }
    const job = {id:`job-${Date.now()}`,title,category:$("jobCategoryInput").value,budget,skills,description,duration:$("jobDuration").value,client:$("clientName").value.trim()||"Independent Client",postedAt:new Date().toISOString(),proposals:0};
    const all=getJobs(); all.unshift(job); setJobs(all);
    toast("Your job has been published!");
    setTimeout(()=>location.href=`job-details.html?id=${encodeURIComponent(job.id)}`,450);
  });

  // Proposal form and submission.
  const proposalForm = $("proposalForm");
  if (proposalForm) {
    const jobId = new URLSearchParams(location.search).get("job");
    const job = getJobs().find(item=>item.id===jobId);
    if (job) {
      $("proposalJobId").value=job.id;
      $("proposalJobSummary").style.display="block";
      $("proposalJobSummary").innerHTML=`<strong>Applying for:</strong> ${escapeHTML(job.title)} · Budget ${formatPKR(job.budget)}`;
    } else {
      $("proposalJobSummary").style.display="block";
      $("proposalJobSummary").innerHTML='No specific job selected. <a class="inline-link" href="jobs.html">Choose a job first</a>.';
    }
    proposalForm.addEventListener("submit", e => {
      e.preventDefault();
      if (!proposalForm.reportValidity()) return;
      if (!job) { $("proposalFormMessage").innerHTML='<div class="notice error">Please select a valid job from Find Jobs before applying.</div>'; return; }
      const cover=$("coverLetter").value.trim(), price=Number($("proposalPrice").value), skills=$("proposalSkills").value.trim();
      if (cover.length<40 || price<500 || !skills) {
        $("proposalFormMessage").innerHTML='<div class="notice error">Write a cover letter of at least 40 characters and enter a valid price and relevant skills.</div>'; return;
      }
      const proposals=getProposals();
      if (proposals.some(p=>p.jobId===job.id)) {
        $("proposalFormMessage").innerHTML='<div class="notice error">You have already submitted a proposal for this job in this browser.</div>'; return;
      }
      proposals.unshift({id:`proposal-${Date.now()}`,jobId:job.id,jobTitle:job.title,client:job.client,coverLetter:cover,price,delivery:$("proposalDelivery").value,skills,status:"Pending",submittedAt:new Date().toISOString()});
      setProposals(proposals);
      const allJobs=getJobs(), jobIndex=allJobs.findIndex(j=>j.id===job.id);
      if(jobIndex>=0) allJobs[jobIndex].proposals=Number(allJobs[jobIndex].proposals||0)+1;
      setJobs(allJobs);
      toast("Proposal submitted successfully!");
      setTimeout(()=>location.href="my-proposals.html",450);
    });
  }

  // My Proposals: filter by status and show proposal information.
  const proposalsList = $("myProposalsList");
  if (proposalsList) {
    let activeStatus="All";
    function renderProposals() {
      const all=getProposals();
      const filtered=activeStatus==="All" ? all : all.filter(p=>p.status===activeStatus);
      proposalsList.innerHTML = filtered.length ? filtered.map(p=>`<article class="proposal-card">
        <div class="proposal-card-head"><div><span class="eyebrow">Proposal for</span><h3>${escapeHTML(p.jobTitle)}</h3><p class="muted">Client: ${escapeHTML(p.client || "Client")}</p></div><span class="status status-${String(p.status).toLowerCase()}">${escapeHTML(p.status)}</span></div>
        <p>${escapeHTML(p.coverLetter.slice(0,190))}${p.coverLetter.length>190?"…":""}</p>
        <div class="proposal-card-foot"><span><strong>${formatPKR(p.price)}</strong> · ${escapeHTML(p.delivery)}</span><span>Sent ${formatDate(p.submittedAt)}</span></div>
        <div class="job-card-actions" style="margin-top:14px"><a class="btn btn-outline btn-small" href="job-details.html?id=${encodeURIComponent(p.jobId)}">View Job</a></div>
      </article>`).join("") : '<div class="empty-state"><div class="empty-icon">📨</div><h3>No proposals here yet</h3><p class="muted">Browse open jobs and send your first proposal.</p><a class="btn btn-primary" href="jobs.html">Find Jobs</a></div>';
    }
    document.querySelectorAll(".proposal-tab").forEach(tab=>tab.addEventListener("click",()=>{
      document.querySelectorAll(".proposal-tab").forEach(t=>t.classList.remove("active"));
      tab.classList.add("active"); activeStatus=tab.dataset.status; renderProposals();
    }));
    renderProposals();
  }

});
