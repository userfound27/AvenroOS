import { useEffect, useRef, useState } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";
import { supabase } from "./lib/supabase";
const AVENROOS_ICON = "/avenroos-logo.webp?v=6";
import { ArrowUpRight, BookOpen, CalendarDays, Check, ChevronRight, Clock3, Command, Flame, Gauge, GraduationCap, LayoutDashboard, Menu, Pencil, Plus, LogOut, Settings, Sparkles, Target, Trash2, Trophy, TrendingUp, Upload, UserRound, X, Zap } from "lucide-react";

type Page = "dashboard" | "spaces" | "space-detail" | "study" | "exams" | "scores" | "focus" | "journey" | "settings";
type Space = {id:string;name:string;icon:string;description:string;purpose?:string;kind:string;items:string[];enabled:boolean;template?:string;widgets?:string[];widgetData?:Record<string,string[]>};
type Task = { id:number; title:string; subject:string; date:string; done:boolean; minutes:number };
type ExamLesson = { id:number; title:string; done:boolean };
type Exam = { id:number; name:string; subject:string; date:string; portion:string; progress:number; lessons:ExamLesson[]; revisionRounds:number; practiceTests:number; confidence:number; weakAreas:string };
type Score = { id:number; subject:string; test:string; obtained:number; max:number; date:string };
const today = (()=>{const d=new Date();const local=new Date(d.getTime()-d.getTimezoneOffset()*60000);return local.toISOString().slice(0,10)})();
const seedTasks:Task[]=[
 {id:1,title:"Quadratic equations practice",subject:"Maths",date:today,done:false,minutes:45},
 {id:2,title:"Revise electricity notes",subject:"Science",date:today,done:true,minutes:30},
 {id:3,title:"Read English chapter",subject:"English",date:today,done:false,minutes:25},
 {id:4,title:"SST map practice",subject:"SST",date:today,done:false,minutes:35}
];
const seedExams:Exam[]=[
 {id:1,name:"Maths Unit Test",subject:"Maths",date:"2026-10-02",portion:"Quadratic Equations, Arithmetic Progressions",progress:0,lessons:[{id:101,title:"Quadratic Equations",done:false},{id:102,title:"Arithmetic Progressions",done:false}],revisionRounds:0,practiceTests:0,confidence:0,weakAreas:""},
 {id:2,name:"Science Term Assessment",subject:"Science",date:"2026-10-09",portion:"Electricity, Magnetic Effects",progress:0,lessons:[{id:201,title:"Electricity",done:false},{id:202,title:"Magnetic Effects",done:false}],revisionRounds:0,practiceTests:0,confidence:0,weakAreas:""}
];
const seedScores:Score[]=[
 {id:1,subject:"Science",test:"Periodic Test",obtained:34,max:40,date:"2026-09-10"},
 {id:2,subject:"SST",test:"Periodic Test",obtained:37,max:40,date:"2026-09-10"},
 {id:3,subject:"English",test:"Periodic Test",obtained:37,max:40,date:"2026-09-10"}
];

type SavedData = { tasks:Task[]; exams:Exam[]; scores:Score[]; spaces:Space[]; spacesVersion?:number; journey:string; classLevel:string; displayName:string; avatarUrl:string };
declare global { interface Window { __studentosData?: SavedData; __studentosEmail?: string; __studentosUserId?: string; __studentosUpdate?:()=>Promise<void> } }


function normalizeExam(exam:Partial<Exam>):Exam{
 const rawLessons=Array.isArray(exam.lessons)?exam.lessons:[];
 const lessons=rawLessons.length?rawLessons.map((l,i)=>({id:Number(l.id)||Date.now()+i,title:String(l.title||"Untitled lesson"),done:Boolean(l.done)})):String(exam.portion||"").split(",").map((title,i)=>({id:Date.now()+i,title:title.trim(),done:false})).filter(l=>l.title);
 const progress=lessons.length?Math.round(lessons.filter(l=>l.done).length/lessons.length*100):0;
 return {id:Number(exam.id)||Date.now(),name:String(exam.name||"New exam"),subject:String(exam.subject||"Other"),date:String(exam.date||today),portion:String(exam.portion||lessons.map(l=>l.title).join(", ")),progress,lessons,revisionRounds:Math.max(0,Number(exam.revisionRounds)||0),practiceTests:Math.max(0,Number(exam.practiceTests)||0),confidence:Math.min(5,Math.max(0,Number(exam.confidence)||0)),weakAreas:String(exam.weakAreas||"")};
}
function blankData():SavedData{
 return {tasks:seedTasks.map(x=>({...x})),exams:seedExams.map(x=>normalizeExam(x)),scores:seedScores.map(x=>({...x})),spaces:[],spacesVersion:1,journey:"Make meaningful progress",classLevel:"",displayName:"",avatarUrl:""};
}

async function loadCloudData(userId:string):Promise<SavedData>{
 if(!supabase) return blankData();
 const {data,error}=await supabase.from("studentos_profiles").select("data").eq("id",userId).maybeSingle();
 if(error){console.error(error);return blankData();}
 if(!data?.data)return blankData();
 const stored=data.data as Partial<SavedData>;
 const merged={...blankData(),...stored};
 const legacyStudy:Space={id:"legacy-study",name:"Study",icon:"book",description:"Your learning workspace, with study sessions, exams, scores and focus tools.",purpose:"Organise learning, assignments and exam preparation.",kind:"template",template:"study",items:[],widgets:["progress","checklist","tasks","notes","calendar","timer"],widgetData:{},enabled:true};
 const migratedSpaces=Array.isArray(stored.spaces)&&stored.spaces.length?stored.spaces:(stored.spacesVersion===1?[]:[legacyStudy]);
 return {...merged,exams:(merged.exams||[]).map(e=>normalizeExam(e)),spaces:migratedSpaces,spacesVersion:1};
}

async function saveCloudData(userId:string,data:SavedData){
 if(!supabase) return;
 const {error}=await supabase.from("studentos_profiles").upsert({id:userId,data,updated_at:new Date().toISOString()});
 if(error) console.error(error);
}

function AvenroOSApp({mode,onExit,onSignIn,onDeleteAccount}:{mode:"anonymous"|"account";onExit:()=>Promise<void>|void;onSignIn:()=>void;onDeleteAccount:()=>Promise<string>}){
 const [page,setPage]=useState<Page>(()=>{const saved=sessionStorage.getItem("studentos-page");if(!(window.__studentosData?.spaces?.length))return "spaces";return saved&&["dashboard","spaces","space-detail","study","exams","scores","focus","journey","settings"].includes(saved)?saved as Page:"dashboard"}),[sidebarCollapsed,setSidebarCollapsed]=useState(true),[selectedExamId,setSelectedExamId]=useState<number|null>(null),[selectedSpaceId,setSelectedSpaceId]=useState(()=>sessionStorage.getItem("avenroos-space-id")||""),[spaceModal,setSpaceModal]=useState(false);
 const initial=window.__studentosData||blankData();
 const [tasks,setTasks]=useState(initial.tasks),[exams,setExams]=useState(initial.exams),[scores,setScores]=useState(initial.scores),[spaces,setSpaces]=useState<Space[]>(initial.spaces||[]);
 const [journey,setJourney]=useState(initial.journey),[classLevel,setClassLevel]=useState(initial.classLevel||""),[displayName,setDisplayName]=useState(initial.displayName||"Student"),[avatarUrl,setAvatarUrl]=useState(initial.avatarUrl||""),[showTask,setShowTask]=useState(false),[editingTask,setEditingTask]=useState<Task|null>(null),[showScore,setShowScore]=useState(false),[showExam,setShowExam]=useState(false);
 const [focusSeconds,setFocusSeconds]=useState(1500),[focusMinutes,setFocusMinutes]=useState(25),[focusRunning,setFocusRunning]=useState(false),[focusTaskTitle,setFocusTaskTitle]=useState(""),[accountError,setAccountError]=useState("");
 useEffect(()=>{
  if(mode!=="account"||!window.__studentosUserId)return;
  const payload={tasks,exams,scores,spaces,spacesVersion:1,journey,classLevel,displayName,avatarUrl};
  const timer=window.setTimeout(()=>{void saveCloudData(window.__studentosUserId!,payload)},250);
  return()=>window.clearTimeout(timer);
 },[mode,tasks,exams,scores,spaces,journey,classLevel,displayName,avatarUrl]);
 useEffect(()=>{if(!focusRunning)return;const timer=window.setInterval(()=>setFocusSeconds(s=>{if(s<=1){setFocusRunning(false);return focusMinutes*60}return s-1}),1000);return()=>window.clearInterval(timer)},[focusRunning,focusMinutes]);
 useEffect(()=>{window.__studentosUpdate=async()=>{if(!("serviceWorker" in navigator))return false;const registration=await navigator.serviceWorker.getRegistration();if(!registration)return false;const previousWaiting=registration.waiting;await registration.update();const installing=registration.installing;if(installing){await new Promise<void>(resolve=>{const done=()=>{if(installing.state==="installed"||installing.state==="redundant"){installing.removeEventListener("statechange",done);resolve()}};installing.addEventListener("statechange",done);});}const waiting=registration.waiting;if(!waiting||waiting===previousWaiting)return false;sessionStorage.setItem("studentos-page",page);waiting.postMessage({type:"SKIP_WAITING"});await new Promise<void>(resolve=>{const timer=window.setTimeout(resolve,5000);navigator.serviceWorker.addEventListener("controllerchange",()=>{window.clearTimeout(timer);resolve()},{once:true})});window.location.reload();return true};return()=>{delete window.__studentosUpdate}},[page]);
 useEffect(()=>{sessionStorage.setItem("studentos-page",page)},[page]);
 useEffect(()=>{if(selectedSpaceId)sessionStorage.setItem("avenroos-space-id",selectedSpaceId);else sessionStorage.removeItem("avenroos-space-id")},[selectedSpaceId]);
 const completed=tasks.filter(t=>t.done).length;
 const scoreAverage=scores.length?Math.round(scores.reduce((a,s)=>a+s.obtained/s.max,0)/scores.length*100):0;
 const navigate=(p:Page)=>{setPage(p);setSidebarCollapsed(true)}; const openSpace=(id:string)=>{setSelectedSpaceId(id);navigate("space-detail")}; const profileAction=()=>{navigate("settings")};
 const saveProfile=async(name:string,file?:File)=>{if(mode!=="account"||!supabase||!window.__studentosUserId)return "Sign in to update your profile.";const nextName=name.trim().slice(0,60);if(!nextName)return "Enter a display name.";let nextAvatar=avatarUrl;if(file){const allowed=["image/jpeg","image/png","image/webp","image/gif"];if(!allowed.includes(file.type))return "Choose a JPG, PNG, WebP, or GIF image.";if(file.size>5*1024*1024)return "Choose an image smaller than 5 MB.";const path=window.__studentosUserId+"/avatar";const bucket=supabase.storage.from("studentos-avatars");const {error:uploadError}=await bucket.upload(path,file,{upsert:true,contentType:file.type,cacheControl:"3600"});if(uploadError)return "Image upload failed: "+uploadError.message;const {data:urlData}=bucket.getPublicUrl(path);nextAvatar=urlData.publicUrl+"?v="+Date.now();}const {error:authError}=await supabase.auth.updateUser({data:{display_name:nextName,avatar_url:nextAvatar}});if(authError)return "Profile save failed: "+authError.message;setDisplayName(nextName);setAvatarUrl(nextAvatar);return "";};
 return <div className="app-shell">
  <button className={"sidebar-toggle "+(sidebarCollapsed?"is-closed":"is-open")} aria-label={sidebarCollapsed?"Open navigation":"Close navigation"} aria-expanded={!sidebarCollapsed} onClick={()=>setSidebarCollapsed(v=>!v)}>
   <span className="toggle-icon toggle-menu"><Menu size={21}/></span><span className="toggle-icon toggle-close"><X size={21}/></span>
  </button>
  <aside className={"sidebar "+(sidebarCollapsed?"collapsed":"")}>
   <div className="brand"><div className="brand-mark"><img src={AVENROOS_ICON} alt="" aria-hidden="true" /></div><div><strong>AvenroOS</strong><span>Spaces. Your way.</span></div></div>
   <nav>
    <NavItem icon={<LayoutDashboard size={18}/>} label="Home" active={page==="dashboard"} onClick={()=>navigate("dashboard")}/>
    <NavItem icon={<Command size={18}/>} label="Explore Spaces" active={page==="spaces"} onClick={()=>navigate("spaces")}/>
    <div className="sidebar-section-label">YOUR SPACES</div>
    {spaces.filter(x=>x.enabled).map(space=><NavItem key={space.id} icon={space.template==="study"?<BookOpen size={18}/>:space.template==="workout"?<Gauge size={18}/>:space.template==="projects"?<Target size={18}/>:space.template==="knowledge"?<BookOpen size={18}/>:<Sparkles size={18}/>} label={space.name} active={(page==="space-detail"&&selectedSpaceId===space.id)||(space.template==="study"&&["study","exams","scores","focus","journey"].includes(page))} onClick={()=>openSpace(space.id)}/>)}
    <button className="nav-item nav-add-space" onClick={()=>setSpaceModal(true)}><Plus size={18}/><span>Create a Space</span></button>
   </nav>
   <div className="sidebar-bottom"><div className="free-pill"><Zap size={15}/> Pricing</div><NavItem icon={<Settings size={18}/>} label="Settings" active={page==="settings"} onClick={()=>navigate("settings")}/></div>
  </aside>
  {!sidebarCollapsed&&<button className="mobile-sidebar-backdrop" aria-label="Close navigation" onClick={()=>setSidebarCollapsed(true)}/>}
  <main className="main">
   <header className="topbar"><div><div className="eyebrow">AVENROOS</div><h1>{pageTitle(page)}</h1></div><div className="top-actions"><div className="mode-badge"><span className="dot"/>{mode==="account"?"Saved account":"Anonymous session"}</div>{mode==="account"&&<button className="ghost-btn top-logout" onClick={()=>void onExit()} title="Log out"><LogOut size={15}/> Log out</button>}<button className="avatar" onClick={profileAction} title="Open profile settings">{avatarUrl?<img src={avatarUrl} alt="Profile"/>:displayName.slice(0,1).toUpperCase()||"S"}</button></div></header>
   <div className="content">
    {page==="spaces"&&<SpacesPage spaces={spaces} setSpaces={setSpaces} openSpace={openSpace} onCreate={()=>setSpaceModal(true)}/>}
    {page==="space-detail"&&<SpaceDetail space={spaces.find(x=>x.id===selectedSpaceId)} setSpaces={setSpaces} back={()=>navigate("spaces")} openStudyTool={navigate}/>}
    {page==="dashboard"&&<Dashboard journey={journey} classLevel={classLevel} completed={completed} tasks={tasks} exams={exams} scoreAverage={scoreAverage} navigate={navigate} setTasks={setTasks} onAddTask={()=>setShowTask(true)} onEditTask={setEditingTask} onDeleteTask={id=>setTasks(all=>all.filter(x=>x.id!==id))}/>} 
    {page==="study"&&<Study tasks={tasks} setTasks={setTasks} onAdd={()=>setShowTask(true)} onEditTask={setEditingTask} onDeleteTask={id=>setTasks(all=>all.filter(x=>x.id!==id))} onFocus={task=>{setFocusTaskTitle(task.title);setFocusMinutes(task.minutes);setFocusSeconds(task.minutes*60);setFocusRunning(false);setPage("focus")}}/>}
    {page==="exams"&&<Exams exams={exams} setExams={setExams} onAdd={()=>setShowExam(true)} selectedExamId={selectedExamId} setSelectedExamId={setSelectedExamId}/>}
    {page==="scores"&&<Scores scores={scores} setScores={setScores} onAdd={()=>setShowScore(true)}/>}
    {page==="focus"&&<Focus seconds={focusSeconds} minutes={focusMinutes} setMinutes={setFocusMinutes} running={focusRunning} setRunning={setFocusRunning} taskTitle={focusTaskTitle} reset={(minutes)=>{setFocusRunning(false);setFocusSeconds((minutes??focusMinutes)*60)}}/>}
    {page==="journey"&&<Journey journey={journey} setJourney={setJourney} completed={completed} exams={exams} scoreAverage={scoreAverage}/>}
    {page==="settings"&&<SettingsPage journey={journey} setJourney={setJourney} classLevel={classLevel} setClassLevel={setClassLevel} mode={mode} displayName={displayName} avatarUrl={avatarUrl} onProfileSave={saveProfile} onLogout={onExit} onDeleteAccount={onDeleteAccount} onSignIn={()=>{if(!supabase){setAccountError("Supabase is not connected yet. Sign up & sync will be available after the AvenroOS Supabase environment is configured.");return;}setAccountError("");onSignIn()}} accountError={accountError}/>}
   </div>
  </main>
  {showTask&&<TaskModal close={()=>{setShowTask(false);setEditingTask(null)}} add={t=>{setTasks(x=>[...x,t]);setShowTask(false)}}/>}
  {editingTask&&<TaskModal task={editingTask} close={()=>setEditingTask(null)} save={updated=>{setTasks(all=>all.map(x=>x.id===updated.id?updated:x));setEditingTask(null)}}/>}
  {showScore&&<ScoreModal close={()=>setShowScore(false)} add={s=>{setScores(x=>[...x,s]);setShowScore(false)}}/>}
  {showExam&&<ExamModal close={()=>setShowExam(false)} add={e=>{setExams(x=>[...x,e]);setShowExam(false)}}/>}
  {spaceModal&&<CreateSpaceWizard close={()=>setSpaceModal(false)} create={space=>{setSpaces(all=>[...all,space]);setSpaceModal(false);openSpace(space.id)}}/>}
 </div>
}

function FeatureCard(p:{number:string;icon:ReactNode;title:string;text:string}){return <article className="feature-card"><div className="feature-top"><span>{p.number}</span><div className="feature-icon">{p.icon}</div></div><h4>{p.title}</h4><p>{p.text}</p><div className="feature-line"/></article>}
function NavItem(p:{icon:ReactNode;label:string;active:boolean;onClick:()=>void}){return <button className={p.active?"nav-item active":"nav-item"} onClick={p.onClick}>{p.icon}<span>{p.label}</span>{p.active&&<ChevronRight size={15}/>}</button>}
function Dashboard(p:{journey:string;classLevel:string;completed:number;tasks:Task[];exams:Exam[];scoreAverage:number;navigate:(x:Page)=>void;setTasks:Dispatch<SetStateAction<Task[]>>;onAddTask:()=>void;onEditTask:(task:Task)=>void;onDeleteTask:(id:number)=>void}){
 const todayTasks=p.tasks.filter(t=>t.date===today);
 const nextTask=todayTasks.find(t=>!t.done)||p.tasks.find(t=>!t.done);
 const nextExam=[...p.exams].filter(e=>e.date>=today).sort((a,b)=>a.date.localeCompare(b.date))[0];
 return <div className="stack dashboard-stack">
  <section className="hero-card"><div><div className="hero-kicker"><Sparkles size={15}/> YOUR PERSONAL OPERATING SYSTEM FOR SCHOOL</div><h2>Here’s what matters today.</h2><p>One clear next move first. Your exams, scores, and bigger goal come after.</p>{nextTask?<button className="primary-btn" onClick={()=>p.navigate("study")}>Work on “{nextTask.title}” <ChevronRight size={17}/></button>:<button className="primary-btn" onClick={p.onAddTask}><Plus size={17}/> Add your next task</button>}</div><div className="hero-orbit"><div><GraduationCap size={34}/><strong>{p.classLevel||"—"}</strong><span>{p.classLevel?"Class / Grade":"Set your class"}</span></div></div></section>
  <section className="priority-card"><div className="priority-copy"><span className="eyebrow">YOUR NEXT MOVE</span><h3>{nextTask?nextTask.title:"Nothing urgent is queued."}</h3><p>{nextTask?nextTask.subject+" · "+nextTask.minutes+" min":nextExam?"Your next exam is "+nextExam.name+". Add a study session to start preparing.":"Add a study session and AvenroOS will put it here."}</p></div><div className="priority-actions">{nextTask?<><button className="primary-btn" onClick={()=>p.navigate("study")}>Open task <ChevronRight size={16}/></button><button className="ghost-btn" onClick={()=>p.setTasks(all=>all.map(x=>x.id===nextTask.id?{...x,done:true}:x))}>Mark done</button></>:<button className="primary-btn" onClick={p.onAddTask}><Plus size={16}/> Add task</button>}</div></section>
  <div className="section-heading"><div><h3>Today</h3><p>Start here. Everything else can wait.</p></div><button className="ghost-btn" onClick={p.onAddTask}><Plus size={16}/> Add task</button></div>
  <div className="two-col dashboard-primary-grid">
   <section className="panel"><div className="panel-head"><div><h3>Today's study plan</h3><p>{todayTasks.length} sessions scheduled</p></div><button className="text-btn" onClick={()=>p.navigate("study")}>View all</button></div><div className="task-list">{todayTasks.map(t=><TaskRow key={t.id} task={t} toggle={()=>p.setTasks(all=>all.map(x=>x.id===t.id?{...x,done:!x.done}:x))} onEdit={()=>p.onEditTask(t)} onDelete={()=>p.onDeleteTask(t.id)}/>)}</div></section>
   <section className="panel"><div className="panel-head"><div><h3>Upcoming exams</h3><p>{nextExam?"Your next academic deadline is here.":"Add an exam to keep it on your radar."}</p></div><button className="text-btn" onClick={()=>p.navigate("exams")}>View all</button></div>{p.exams.map(e=><div className="exam-mini" key={e.id}><div className="date-box"><strong>{new Date(e.date+"T12:00:00").getDate()}</strong><span>{new Date(e.date+"T12:00:00").toLocaleString("en",{month:"short"})}</span></div><div className="grow"><strong>{e.name}</strong><span>{e.subject+" · "+e.progress+"% prepared"}</span><div className="progress"><i style={{width:e.progress+"%"}}/></div></div></div>)}</section>
  </div>
  <section className="stats-grid dashboard-secondary-stats"><Stat icon={<Check/>} label="Study tasks" value={p.completed+"/"+p.tasks.length+" complete"}/><Stat icon={<TrendingUp/>} label="Score average" value={p.scoreAverage+"%"}/><Stat icon={<CalendarDays/>} label="Upcoming exams" value={String(p.exams.length)}/></section>
  <section className="mission-strip"><div className="mission-icon"><Flame size={22}/></div><div><span>YOUR WHY</span><strong>{p.journey}</strong></div><button onClick={()=>p.navigate("journey")}>Open journey <ChevronRight size={16}/></button></section>
 </div>
}
function Study(p:{tasks:Task[];setTasks:Dispatch<SetStateAction<Task[]>>;onAdd:()=>void;onEditTask:(task:Task)=>void;onDeleteTask:(id:number)=>void;onFocus:(task:Task)=>void}){const [filter,setFilter]=useState("All");const subjects=["All",...Array.from(new Set(p.tasks.map(t=>t.subject)))];const shown=filter==="All"?p.tasks:p.tasks.filter(t=>t.subject===filter);return <div className="stack"><PageIntro title="Study command center" text="Turn your syllabus into small, finishable sessions." action={<button className="primary-btn" onClick={p.onAdd}><Plus size={17}/> Add study session</button>}/><div className="filter-row">{subjects.map(s=><button key={s} className={filter===s?"filter active":"filter"} onClick={()=>setFilter(s)}>{s}</button>)}</div><section className="panel"><div className="panel-head"><div><h3>Study sessions</h3><p>Tap a session when it is done.</p></div><span className="count-pill">{shown.filter(t=>t.done).length+"/"+shown.length}</span></div><div className="task-list large">{shown.map(t=><TaskRow key={t.id} task={t} toggle={()=>p.setTasks(all=>all.map(x=>x.id===t.id?{...x,done:!x.done}:x))} onEdit={()=>p.onEditTask(t)} onDelete={()=>p.onDeleteTask(t.id)} onFocus={()=>p.onFocus(t)} detailed/>)}</div></section></div>}
function Exams(p:{exams:Exam[];setExams:Dispatch<SetStateAction<Exam[]>>;onAdd:()=>void;selectedExamId:number|null;setSelectedExamId:(id:number|null)=>void}){
 return <div className="stack"><PageIntro title="Exam control" text="Know what's coming and how ready you actually are." action={<button className="primary-btn" onClick={p.onAdd}><Plus size={17}/> Add exam</button>}/>
  <div className="exam-grid">{p.exams.map(e=><section className="panel exam-card exam-card-clickable" key={e.id} onClick={()=>p.setSelectedExamId(e.id)}>
   <div className="exam-card-top"><div className="date-box"><strong>{new Date(e.date+"T12:00:00").getDate()}</strong><span>{new Date(e.date+"T12:00:00").toLocaleString("en",{month:"short"})}</span></div><button className="icon-btn" aria-label={"Delete "+e.name} onClick={event=>{event.stopPropagation();p.setExams(all=>all.filter(x=>x.id!==e.id));if(p.selectedExamId===e.id)p.setSelectedExamId(null)}}><X size={16}/></button></div>
   <span className="tag">{e.subject}</span><h3>{e.name}</h3><p>{e.portion||"No lessons added yet."}</p>
   <div className="progress-label"><span>Preparation</span><strong>{e.progress+"%"}</strong></div><div className="progress"><i style={{width:e.progress+"%"}}/></div>
   <div className="exam-meta"><span>{e.lessons.filter(l=>l.done).length}/{e.lessons.length} lessons studied</span><span>{e.revisionRounds} revisions · {e.practiceTests} practice tests</span></div>
  </section>)}</div>
  {p.selectedExamId!==null&&p.exams.some(e=>e.id===p.selectedExamId)&&<ExamDetail key={p.selectedExamId} exam={p.exams.find(e=>e.id===p.selectedExamId)!} setExams={p.setExams} close={()=>p.setSelectedExamId(null)}/>}
 </div>
}
function ExamDetail(p:{exam:Exam;setExams:Dispatch<SetStateAction<Exam[]>>;close:()=>void}){
 const e=p.exam,studied=e.lessons.filter(l=>l.done).length,progress=e.lessons.length?Math.round(studied/e.lessons.length*100):0;
 const [newLesson,setNewLesson]=useState(""),[weakAreas,setWeakAreas]=useState(e.weakAreas),[revision,setRevision]=useState(String(e.revisionRounds)),[practice,setPractice]=useState(String(e.practiceTests)),[confidence,setConfidence]=useState(String(e.confidence));
 const update=(patch:Partial<Exam>)=>p.setExams(all=>all.map(x=>x.id===e.id?normalizeExam({...e,...patch}):x));
 const toggleLesson=(id:number)=>{const lessons=e.lessons.map(l=>l.id===id?{...l,done:!l.done}:l);p.setExams(all=>all.map(x=>x.id===e.id?normalizeExam({...e,lessons}):x));};
 const addLesson=()=>{const title=newLesson.trim();if(!title)return;const lessons=[...e.lessons,{id:Date.now(),title,done:false}];p.setExams(all=>all.map(x=>x.id===e.id?normalizeExam({...e,lessons,portion:lessons.map(l=>l.title).join(", ")}):x));setNewLesson("");};
 const removeLesson=(id:number)=>{const lessons=e.lessons.filter(l=>l.id!==id);p.setExams(all=>all.map(x=>x.id===e.id?normalizeExam({...e,lessons,portion:lessons.map(l=>l.title).join(", ")}):x));};
 return <div className="panel exam-detail"><div className="exam-detail-head"><div><span className="eyebrow">EXAM PROGRESS</span><h3>{e.name} · {e.subject}</h3><p>{e.date}</p></div><button className="icon-btn" onClick={p.close} aria-label="Close exam progress"><X size={17}/></button></div>
  <div className="exam-progress-hero"><div><span>Progress</span><strong>{progress}%</strong></div><div className="progress"><i style={{width:progress+"%"}}/></div></div>
  <div className="exam-kpis"><div><span>Lessons studied</span><strong>{studied}</strong><small>of {e.lessons.length}</small></div><div><span>Lessons left</span><strong>{Math.max(0,e.lessons.length-studied)}</strong><small>to complete</small></div><div><span>Revisions</span><strong>{e.revisionRounds}</strong><small>rounds</small></div><div><span>Practice tests</span><strong>{e.practiceTests}</strong><small>completed</small></div></div>
  <div className="exam-detail-grid">
   <section><div className="panel-head"><div><h4>Lessons</h4><p>Progress is calculated from completed lessons.</p></div></div><div className="lesson-list">{e.lessons.map(l=><div className={l.done?"lesson-row done":"lesson-row"} key={l.id}><button className="check-btn" onClick={()=>toggleLesson(l.id)} aria-label={l.done?"Mark lesson incomplete":"Mark lesson complete"}>{l.done?<Check size={14}/>:null}</button><span>{l.title}</span><button className="icon-btn" onClick={()=>removeLesson(l.id)} aria-label={"Remove "+l.title}><Trash2 size={14}/></button></div>)}</div>
    <div className="add-lesson"><input value={newLesson} onChange={event=>setNewLesson(event.target.value)} placeholder="Add new lesson"/><button className="primary-btn small" onClick={addLesson}><Plus size={15}/> Add</button></div></section>
   <section className="exam-side-controls"><label className="field"><span>Revision rounds</span><input type="number" min="0" value={revision} onChange={event=>{setRevision(event.target.value);update({revisionRounds:Math.max(0,Number(event.target.value)||0)})}}/></label><label className="field"><span>Practice tests completed</span><input type="number" min="0" value={practice} onChange={event=>{setPractice(event.target.value);update({practiceTests:Math.max(0,Number(event.target.value)||0)})}}/></label><label className="field"><span>Confidence (0–5)</span><input type="number" min="0" max="5" value={confidence} onChange={event=>{setConfidence(event.target.value);update({confidence:Math.min(5,Math.max(0,Number(event.target.value)||0))})}}/></label><label className="field"><span>Weak areas / notes</span><textarea value={weakAreas} onChange={event=>{setWeakAreas(event.target.value);update({weakAreas:event.target.value})}} placeholder="Topics to revisit..."/></label></section>
  </div>
 </div>
}

function UpdateControl(){
 const [status,setStatus]=useState<"idle"|"checking"|"updated"|"latest"|"error">("idle");
 const check=async()=>{setStatus("checking");try{const changed=await window.__studentosUpdate?.();setStatus(changed?"updated":"latest")}catch{setStatus("error")}};
 const text=status==="checking"?"Checking the latest AvenroOS deployment…":status==="updated"?"New version installed. Your current section will be restored.":status==="latest"?"You're up to date.":"Check whether a newer AvenroOS deployment is available.";
 return <SettingBlock title="App updates" text={text} right={<button className="ghost-btn" disabled={status==="checking"} onClick={()=>void check()}>{status==="checking"?"Checking…":"Check for updates"}</button>}/>;
}
function Scores(p:{scores:Score[];setScores:Dispatch<SetStateAction<Score[]>>;onAdd:()=>void}){
 const [selectedTest,setSelectedTest]=useState<string|null>(null);
 const grouped=p.scores.reduce((acc,s)=>{const name=s.test.trim()||"Assessment";if(!acc[name])acc[name]={test:name,scores:[],date:s.date};acc[name].scores.push(s);if(s.date>acc[name].date)acc[name].date=s.date;return acc;},{} as Record<string,{test:string;scores:Score[];date:string}>);
 const assessments=Object.values(grouped).map(g=>{const total=g.scores.reduce((sum,s)=>sum+s.obtained,0),max=g.scores.reduce((sum,s)=>sum+s.max,0);return {...g,total,max,percent:max?Math.round(total/max*100):0};}).sort((a,b)=>a.date.localeCompare(b.date));
 const total=p.scores.reduce((sum,s)=>sum+s.obtained,0),max=p.scores.reduce((sum,s)=>sum+s.max,0),overall=max?Math.round(total/max*100):0;
 const points=assessments.map((a,i)=>({x:assessments.length===1?160:12+i*(296/(assessments.length-1)),y:68-a.percent*.52,percent:a.percent}));
 const line=points.map(point=>point.x+","+point.y).join(" ");
 const change=assessments.length>1?assessments[assessments.length-1].percent-assessments[assessments.length-2].percent:null;
 return <div className="stack">
  <PageIntro title="Score tracker" text="Organise marks by assessment and see how your results change over time." action={<button className="primary-btn" onClick={p.onAdd}><Plus size={17}/> Add score</button>}/>
  <div className="stats-grid"><Stat icon={<Gauge/>} label="Overall recorded" value={overall+"%"}/><Stat icon={<Trophy/>} label="Assessments" value={String(assessments.length)}/></div>
  <section className="panel score-trend-panel"><div className="panel-head"><div><h3>Performance trend</h3><p>Combined percentage across your assessments.</p></div>{change!==null&&<div className={change>=0?"score-trend-change positive":"score-trend-change negative"}>{change>0?"+":""}{change}% <span>vs previous</span></div>}</div>
   {assessments.length>0?<><svg className="score-trend-chart" viewBox="0 0 320 82" role="img" aria-label="Assessment percentage trend graph"><line x1="8" y1="68" x2="312" y2="68" className="score-chart-axis"/><line x1="8" y1="42" x2="312" y2="42" className="score-chart-grid"/><line x1="8" y1="16" x2="312" y2="16" className="score-chart-grid"/>{points.length>1&&<polyline points={line} className="score-chart-line"/>}{points.map((point,i)=><circle key={assessments[i].test} cx={point.x} cy={point.y} r="3.5" className="score-chart-point"><title>{assessments[i].test}: {point.percent}%</title></circle>)}</svg><div className="score-trend-labels"><span>{assessments[0].test}</span><span>{assessments[assessments.length-1].test}</span></div>{assessments.length===1&&<p className="score-trend-hint">Add another assessment to see whether your score is improving.</p>}</>:<p className="empty-state">Add your first assessment to start tracking your progress.</p>}
  </section>
  <section className="stack score-assessments"><div className="panel-head"><div><h3>Your assessments</h3><p>Choose an assessment to see its subject-wise marks.</p></div></div>
   {assessments.length===0?<section className="panel empty-state">No scores recorded yet. Add an assessment to get started.</section>:assessments.slice().reverse().map(a=><section className="panel assessment-card" key={a.test}>
    <button type="button" className="assessment-card-trigger" aria-expanded={selectedTest===a.test} onClick={()=>setSelectedTest(selectedTest===a.test?null:a.test)}>
     <span className="assessment-card-copy"><strong>{a.test}</strong><small>{a.scores.length} subject{a.scores.length===1?"":"s"} · {a.date}</small></span><span className="assessment-card-percent">{a.percent}%</span><span className="assessment-card-open">{selectedTest===a.test?"Close":"View scores"} <ChevronRight size={16}/></span>
    </button>
    {selectedTest===a.test&&<div className="assessment-subjects"><div className="assessment-subject-head"><span>Subject</span><span>Marks</span><span>Percentage</span><span/></div>{a.scores.slice().sort((x,y)=>x.subject.localeCompare(y.subject)).map(s=><div className="assessment-subject-row" key={s.id}><strong>{s.subject}</strong><span>{s.obtained}/{s.max}</span><strong>{s.max?Math.round(s.obtained/s.max*100):0}%</strong><button className="icon-btn" aria-label={"Delete "+s.subject+" score"} onClick={()=>p.setScores(all=>all.filter(x=>x.id!==s.id))}><X size={15}/></button></div>)}<div className="assessment-total"><span>Total</span><strong>{a.total}/{a.max}</strong><strong>{a.percent}%</strong></div></div>}
   </section>)}
  </section>
 </div>;
}
function Focus(p:{seconds:number;minutes:number;setMinutes:(x:number)=>void;running:boolean;setRunning:(x:boolean)=>void;taskTitle?:string;reset:(minutes?:number)=>void}){const m=Math.floor(p.seconds/60).toString().padStart(2,"0"),s=(p.seconds%60).toString().padStart(2,"0");const [draft,setDraft]=useState(String(p.minutes));useEffect(()=>{if(!p.running)setDraft(String(p.minutes))},[p.minutes,p.running]);const applyDuration=(value:string)=>{setDraft(value);if(value==="")return;const numeric=Number(value);if(!Number.isFinite(numeric))return;const next=Math.min(180,Math.max(1,Math.floor(numeric)));p.setMinutes(next);if(!p.running)p.reset(next)};const commitDuration=()=>{const numeric=Number(draft);const next=Number.isFinite(numeric)&&numeric>0?Math.min(180,Math.max(1,Math.floor(numeric))):1;setDraft(String(next));p.setMinutes(next);if(!p.running)p.reset(next)};const step=(delta:number)=>{const current=Number(draft)||p.minutes;const next=Math.min(180,Math.max(1,current+delta));setDraft(String(next));p.setMinutes(next);if(!p.running)p.reset(next)};return <div className="focus-page"><div className="focus-card"><div className="hero-kicker"><Clock3 size={15}/> FOCUS MODE</div><h2>{m+":"+s}</h2><p>{p.taskTitle?<>Working on <strong>{p.taskTitle}</strong>. Stay with it until the block ends.</>: "One focused block. One clear objective."}</p><div className="focus-actions"><button className="primary-btn" onClick={()=>p.setRunning(!p.running)}>{p.running?"Pause":"Start focus"}</button><button className="ghost-btn" onClick={()=>p.reset()}>Reset</button></div><div className="focus-duration"><label htmlFor="focus-minutes">Session length</label><div className="duration-control"><button type="button" className="duration-step" aria-label="Decrease session length by 1 minute" disabled={p.running||p.minutes<=1} onClick={()=>step(-1)}>−</button><input id="focus-minutes" type="text" inputMode="numeric" pattern="[0-9]*" value={draft} disabled={p.running} onChange={e=>applyDuration(e.target.value.replace(/\D/g,"").slice(0,3))} onBlur={commitDuration} onKeyDown={e=>{if(e.key==="Enter")e.currentTarget.blur()}} aria-describedby="focus-duration-help"/><button type="button" className="duration-step" aria-label="Increase session length by 1 minute" disabled={p.running||p.minutes>=180} onClick={()=>step(1)}>+</button><span>minutes</span></div><div className="duration-presets">{[15,25,45,60,90].map(v=><button key={v} type="button" className={p.minutes===v?"duration-preset active":"duration-preset"} disabled={p.running} onClick={()=>{setDraft(String(v));p.setMinutes(v);p.reset(v)}}>{v}m</button>)}</div></div><div className="focus-note" id="focus-duration-help"><Zap size={17}/> Choose any focus length from 1–180 minutes.</div></div></div>}function Journey(p:{journey:string;setJourney:(s:string)=>void;completed:number;exams:Exam[];scoreAverage:number}){const [editing,setEditing]=useState(false),[draft,setDraft]=useState(p.journey);return <div className="stack"><PageIntro title="Your journey" text="Give the next phase of school a name that means something to you."/><section className="journey-card"><div className="journey-badge"><Target size={27}/></div><div className="grow"><span className="eyebrow">CURRENT JOURNEY</span>{editing?<div className="inline-edit"><input value={draft} onChange={e=>setDraft(e.target.value)}/><button className="primary-btn small" onClick={()=>{p.setJourney(draft);setEditing(false)}}>Save</button></div>:<h2>{p.journey}</h2>}<p>Keep this objective visible when deciding what deserves your attention.</p></div>{!editing&&<button className="ghost-btn" onClick={()=>setEditing(true)}>Edit</button>}</section><div className="journey-grid"><Stat icon={<Check/>} label="Study sessions done" value={String(p.completed)}/><Stat icon={<TrendingUp/>} label="Recorded score level" value={p.scoreAverage+"%"}/><Stat icon={<CalendarDays/>} label="Exams on radar" value={String(p.exams.length)}/></div></div>}
function SettingsPage(p:{journey:string;setJourney:(s:string)=>void;classLevel:string;setClassLevel:(s:string)=>void;mode:"anonymous"|"account";onSignIn:()=>void;accountError:string;displayName:string;avatarUrl:string;onProfileSave:(name:string,file?:File)=>Promise<string>;onLogout:()=>Promise<void>|void;onDeleteAccount:()=>Promise<string>}) {
 const [objective,setObjective]=useState(p.journey),[grade,setGrade]=useState(p.classLevel),[name,setName]=useState(p.displayName),[profileMessage,setProfileMessage]=useState(""),[savingProfile,setSavingProfile]=useState(false),[deleting,setDeleting]=useState(false);
 const fileInput=useRef<HTMLInputElement>(null);
 const [selectedImageUrl,setSelectedImageUrl]=useState("");
 useEffect(()=>()=>{if(selectedImageUrl)URL.revokeObjectURL(selectedImageUrl)},[selectedImageUrl]);
 const chooseImage=(file?:File)=>{if(!file){setSelectedImageUrl("");return;}if(selectedImageUrl)URL.revokeObjectURL(selectedImageUrl);setSelectedImageUrl(URL.createObjectURL(file));};
 const saveProfile=async()=>{setSavingProfile(true);const message=await p.onProfileSave(name,fileInput.current?.files?.[0]);setProfileMessage(message||"Profile saved.");setSavingProfile(false);if(!message&&fileInput.current){fileInput.current.value="";setSelectedImageUrl("");}};
 const deleteAccount=async()=>{if(!window.confirm("Permanently delete your AvenroOS account and all saved data? This cannot be undone."))return;setDeleting(true);const message=await p.onDeleteAccount();setDeleting(false);setProfileMessage(message);};
 return <div className="stack"><PageIntro title="Settings" text="Make AvenroOS yours. Your profile choices shape what you see."/>
 <section className="panel settings-panel">
  {p.mode==="account"&&<SettingBlock title="Your profile" text="Update your name or choose a new profile image. Images are saved under your account." right={<button className="ghost-btn" disabled={savingProfile} onClick={saveProfile}>{savingProfile?"Saving…":"Save profile"}</button>}>
   <div className="profile-editor"><button className="profile-image-button" type="button" aria-label="Choose profile image" onClick={()=>fileInput.current?.click()}>{selectedImageUrl||p.avatarUrl?<img src={selectedImageUrl||p.avatarUrl} alt="Profile preview"/>:<UserRound size={28}/>}<span className="profile-edit-badge" aria-hidden="true"><Pencil size={13}/></span></button><input ref={fileInput} className="visually-hidden" id="profile-image-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" aria-label="Choose profile image" onChange={e=>chooseImage(e.target.files?.[0])}/><label>Display name<input className="setting-input" value={name} maxLength={60} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label></div>{profileMessage&&<div className={profileMessage==="Profile saved."?"auth-success":"auth-error settings-auth-error"}>{profileMessage}</div>}
  </SettingBlock>}
  <SettingBlock title="Profile & preferences" text="Choose the class or grade you want AvenroOS to display. You can change this anytime." right={<span className="status-pill"><span className="dot"/> Personalised</span>}>
   <div className="preference-row"><label>Class / grade<select className="setting-input" value={grade} onChange={e=>{setGrade(e.target.value);p.setClassLevel(e.target.value)}}><option value="">Not set</option>{Array.from({length:12},(_,i)=><option key={i+1} value={String(i+1)}>Class {i+1}</option>)}<option value="College">College</option></select></label></div>
  </SettingBlock>
  <SettingBlock title="Session mode" text={p.mode==="account"?"Your AvenroOS workspace is connected to your account and syncs your changes.":"Anonymous mode keeps this session in memory only. Sign up anytime to keep your workspace across sessions."} right={<span className="status-pill"><span className="dot"/> {p.mode==="account"?"Account synced":"Anonymous"}</span>}/>
  <SettingBlock title="Journey objective" text="This is the main objective shown around AvenroOS." right={<button className="ghost-btn" onClick={()=>p.setJourney(objective)}>Save</button>}><input className="setting-input" value={objective} onChange={e=>setObjective(e.target.value)}/></SettingBlock>
  <SettingBlock title="Account & sync" text={p.mode==="account"?"Your account is connected. AvenroOS saves your workspace to the cloud as you make changes.":"Create or sign in to an account to keep your AvenroOS workspace synced across sessions."} right={p.mode==="account"?<button className="ghost-btn" onClick={()=>void p.onLogout()}><LogOut size={15}/> Log out</button>:<button className="primary-btn setting-signin" onClick={p.onSignIn}>Sign up & sync <ChevronRight size={15}/></button>}>
   {p.accountError&&<div className="auth-error settings-auth-error">{p.accountError}</div>}
  </SettingBlock>
  <UpdateControl />
  {p.mode==="account"&&<SettingBlock title="Delete account" text="Permanently remove your account, synced workspace, and profile image. This cannot be undone." right={<button className="danger-btn" disabled={deleting} onClick={deleteAccount}>{deleting?"Deleting…":"Delete account"}</button>}/>}
  <SettingBlock title="Data" text={p.mode==="account"?"Your tasks, exams, scores, journey and profile preferences are stored in your account database.":"Anonymous data stays in memory and is not uploaded to a cloud account."} right={<span className="muted">{p.mode==="account"?"Cloud saved":"Local only"}</span>}/>
 </section></div>
}
function SettingBlock(p:{title:string;text:string;right:ReactNode;children?:ReactNode}){return <div className="setting-block"><div className="grow"><h3>{p.title}</h3><p>{p.text}</p>{p.children}</div><div>{p.right}</div></div>}
function Stat(p:{icon:ReactNode;label:string;value:string}){return <div className="stat-card"><div className="stat-icon">{p.icon}</div><div><span>{p.label}</span><strong>{p.value}</strong></div></div>}
function TaskRow(p:{task:Task;toggle:()=>void;onEdit:()=>void;onDelete:()=>void;onFocus?:()=>void;detailed?:boolean}){return <div className={p.task.done?"task-row done":"task-row"}><button className="check-btn" onClick={p.toggle} aria-label={p.task.done?"Mark incomplete":"Mark complete"}>{p.task.done?<Check size={15}/>:null}</button><div className="grow"><strong>{p.task.title}</strong><span>{p.task.subject+(p.detailed?" · "+p.task.date:"")}</span></div><span className="minutes">{p.task.minutes+"m"}</span><div className="task-actions">{p.onFocus&&<button className="task-action" onClick={p.onFocus} aria-label={"Focus on "+p.task.title} title="Start focus"><Zap size={14}/></button>}<button className="task-action" onClick={p.onEdit} aria-label={"Edit "+p.task.title} title="Edit"><Pencil size={14}/></button><button className="task-action danger" onClick={p.onDelete} aria-label={"Delete "+p.task.title} title="Delete"><Trash2 size={14}/></button></div></div>}
function PageIntro(p:{title:string;text:string;action?:ReactNode}){return <div className="page-intro"><div><h2>{p.title}</h2><p>{p.text}</p></div>{p.action}</div>}
function Modal(p:{title:string;close:()=>void;children:ReactNode}){return <div className="modal-backdrop" onMouseDown={p.close}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><h3>{p.title}</h3><button className="icon-btn" onClick={p.close}><X/></button></div>{p.children}</div></div>}
function ModalActions(p:{close:()=>void;save:()=>void}){return <div className="modal-actions"><button className="ghost-btn" onClick={p.close}>Cancel</button><button className="primary-btn" onClick={p.save}>Save</button></div>}
function FormInput(p:{label:string;value:string;onChange:(s:string)=>void;placeholder?:string;type?:string}){return <label className="field"><span>{p.label}</span><input type={p.type||"text"} value={p.value} onChange={e=>p.onChange(e.target.value)} placeholder={p.placeholder}/></label>}
function TaskModal(p:{close:()=>void;add?:(t:Task)=>void;task?:Task;save?:(t:Task)=>void}){const editing=!!p.task;const [title,setTitle]=useState(p.task?.title||"");const [subject,setSubject]=useState(p.task?.subject||"Maths");const [minutes,setMinutes]=useState(String(p.task?.minutes||30));const [date,setDate]=useState(p.task?.date||today);const submit=()=>{const task:Task={id:p.task?.id||Date.now(),title:title.trim()||"Untitled study session",subject:subject.trim()||"Other",date,done:p.task?.done||false,minutes:Math.max(1,Number(minutes)||30)};if(editing)p.save?.(task);else p.add?.(task)};return <Modal title={editing?"Edit study session":"Add study session"} close={p.close}><FormInput label="Session" value={title} onChange={setTitle} placeholder="e.g. Trigonometry practice"/><FormInput label="Subject" value={subject} onChange={setSubject}/><div className="form-two"><FormInput label="Minutes" value={minutes} onChange={setMinutes} type="number"/><FormInput label="Date" value={date} onChange={setDate} type="date"/></div><ModalActions close={p.close} save={submit}/></Modal>}
function ScoreModal(p:{close:()=>void;add:(s:Score)=>void}){const [subject,setSubject]=useState("Maths"),[test,setTest]=useState(""),[obtained,setObtained]=useState(""),[max,setMax]=useState("40");return <Modal title="Record a score" close={p.close}><FormInput label="Subject" value={subject} onChange={setSubject}/><FormInput label="Assessment" value={test} onChange={setTest} placeholder="Unit test"/><div className="form-two"><FormInput label="Marks" value={obtained} onChange={setObtained} type="number"/><FormInput label="Out of" value={max} onChange={setMax} type="number"/></div><ModalActions close={p.close} save={()=>p.add({id:Date.now(),subject,test:test||"Assessment",obtained:Number(obtained)||0,max:Number(max)||40,date:today})}/></Modal>}
function ExamModal(p:{close:()=>void;add:(e:Exam)=>void}){const [name,setName]=useState(""),[subject,setSubject]=useState("Maths"),[date,setDate]=useState("2026-10-15"),[portion,setPortion]=useState("");const submit=()=>{const lessons=portion.split(",").map(title=>title.trim()).filter(Boolean).map((title,i)=>({id:Date.now()+i,title,done:false}));p.add(normalizeExam({id:Date.now(),name:name||"New exam",subject,date,portion:portion.trim(),lessons,progress:0,revisionRounds:0,practiceTests:0,confidence:0,weakAreas:""}));};return <Modal title="Add exam" close={p.close}><FormInput label="Exam name" value={name} onChange={setName}/><FormInput label="Subject" value={subject} onChange={setSubject}/><FormInput label="Date" value={date} onChange={setDate} type="date"/><FormInput label="Lessons / chapters" value={portion} onChange={setPortion} placeholder="Separate lessons with commas"/><small className="form-help">AvenroOS calculates progress from the lessons you add. You can add or remove lessons after creating the exam.</small><ModalActions close={p.close} save={submit}/></Modal>}
function App(){
 const [screen,setScreen]=useState<"welcome"|"app">("welcome");
 const [mode,setMode]=useState<"anonymous"|"account">("anonymous");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [authOpen,setAuthOpen]=useState(false);
 const [anonymousSetupOpen,setAnonymousSetupOpen]=useState(false);
 const [accountSetupOpen,setAccountSetupOpen]=useState(false);
 const [authMode,setAuthMode]=useState<"signin"|"signup">("signin");

 useEffect(()=>{
  let active=true;
  if(!supabase){setLoading(false);return;}

  const hydrateSession=async(session:any)=>{
   if(!session||!active)return;
   try{
    const user=session.user;
    const cloud=await loadCloudData(user.id);
    if(!active)return;
    window.__studentosData=cloud;
    window.__studentosEmail=user.email||"";
    window.__studentosUserId=user.id;
    sessionStorage.removeItem("studentos_pending_signup");
    setMode("account");
    setScreen("app");
   }catch(error){console.error("AvenroOS session hydration failed",error)}
  };

  // Let Supabase own browser/PWA session persistence. Its client already stores
  // and refreshes the session in localStorage, so keeping a second refresh-token
  // backup can race with token rotation and make a valid session look signed out.
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
   if(session){
    void hydrateSession(session);
   }else if(event==="SIGNED_OUT"&&active){
    window.__studentosData=undefined;
    window.__studentosEmail="";
    window.__studentosUserId="";
    setMode("anonymous");
    setScreen("welcome");
   }
  });

  void (async()=>{
   try{
    const {data,error}=await supabase.auth.getSession();
    if(error)console.error("AvenroOS session load failed",error);
    if(data.session)await hydrateSession(data.session);
   }catch(error){console.error("AvenroOS boot failed",error)}
   if(active)setLoading(false);
  })();

  return()=>{active=false;subscription.unsubscribe()};
 },[]);

 const enterAnonymous=()=>{setAnonymousSetupOpen(true)};
 const finishAccountSetup=async(displayName:string,_journey:string,_classLevel:string)=>{const data={...(window.__studentosData||blankData()),displayName:displayName.trim()||"User",spacesVersion:1};window.__studentosData=data;setAccountSetupOpen(false);sessionStorage.removeItem("studentos-page");if(window.__studentosUserId)await saveCloudData(window.__studentosUserId,data)};
 const finishAnonymousSetup=(displayName:string,_journey:string,_classLevel:string)=>{const data=blankData();data.displayName=displayName.trim()||"User";window.__studentosData=data;window.__studentosEmail="";window.__studentosUserId="";sessionStorage.removeItem("studentos-page");setAnonymousSetupOpen(false);setMode("anonymous");setScreen("app")};
 const exit=async()=>{if(supabase&&mode==="account")await supabase.auth.signOut();window.__studentosData=undefined;window.__studentosEmail="";window.__studentosUserId="";setMode("anonymous");setScreen("welcome")};
 const deleteAccount=async()=>{if(!supabase)return "Supabase is not connected.";const {error:deleteError}=await supabase.functions.invoke("delete-studentos-account",{method:"POST"});if(deleteError)return deleteError.message||"Account deletion failed.";await exit();return "";};

 const finishCloudSession=async(user:{id:string;email?:string|null})=>{const anonymousSnapshot=mode==="anonymous"?window.__studentosData:undefined;const cloud=anonymousSnapshot?anonymousSnapshot:await loadCloudData(user.id);if(anonymousSnapshot)await saveCloudData(user.id,cloud);window.__studentosData=cloud;window.__studentosEmail=user.email||"";window.__studentosUserId=user.id;const needsSetup=sessionStorage.getItem("studentos_pending_signup")==="1";sessionStorage.removeItem("studentos_pending_signup");setMode("account");setScreen("app");setAuthOpen(false);if(needsSetup)setAccountSetupOpen(true)};

 const social=async(provider:"google"|"notion")=>{
  setError("");
  if(authMode==="signup")sessionStorage.setItem("studentos_pending_signup","1");else sessionStorage.removeItem("studentos_pending_signup");
  if(!supabase){setError("Cloud sign-in needs the AvenroOS Supabase project connected.");return;}
  const {error:e}=await supabase.auth.signInWithOAuth({provider,options:{redirectTo:window.location.origin,scopes:undefined}});
  if(e)setError(e.message);
 };
 const emailAuth=async(email:string,code?:string):Promise<boolean>=>{
  setError("");
  if(!code){if(authMode==="signup")sessionStorage.setItem("studentos_pending_signup","1");else sessionStorage.removeItem("studentos_pending_signup");}
  if(!supabase){setError("Supabase is not connected yet. Add the AvenroOS Supabase environment variables first.");return false;}
  if(code){
   const result=await supabase.auth.verifyOtp({email,token:code.trim(),type:"email"});
   if(result.error){setError(result.error.message);return false;}
   if(result.data.session?.user){await finishCloudSession(result.data.session.user);return true;}
   setError("Verification succeeded, but no active session was returned. Please try again.");return false;
  }
  const result=await supabase.auth.signInWithOtp({email,options:{shouldCreateUser:true,emailRedirectTo:window.location.origin}});
  if(result.error){setError(result.error.message);return false;}
  return true;
 };

 if(loading)return <div className="welcome-shell auth-loading"><div><div className="auth-icon"><img src={AVENROOS_ICON} alt="" aria-hidden="true" /></div><strong>Loading AvenroOS…</strong></div></div>;
 if(screen==="app")return <AvenroOSApp mode={mode} onExit={exit} onDeleteAccount={deleteAccount} onSignIn={()=>{setAuthMode("signup");setAuthOpen(true);setScreen("welcome")}}/>;
 return <div className="welcome-shell">
  <header className="welcome-nav"><div className="welcome-brand"><div className="brand-mark"><img src={AVENROOS_ICON} alt="" aria-hidden="true" /></div><strong>AvenroOS</strong></div><div className="welcome-nav-actions"><button className="nav-auth-link" onClick={enterAnonymous}>Try anonymously</button><button className="nav-auth-btn" onClick={()=>{setAuthMode("signup");setAuthOpen(true)}}>Get started <ChevronRight size={16}/></button></div></header>
  <Welcome onAnonymous={enterAnonymous} openAuth={(m)=>{setAuthMode(m);setAuthOpen(true)}} onSocial={social} error={error}/>
  {anonymousSetupOpen&&<AnonymousSetupModal close={()=>setAnonymousSetupOpen(false)} continueSetup={finishAnonymousSetup} account={false}/>} {accountSetupOpen&&<AnonymousSetupModal close={()=>setAccountSetupOpen(false)} continueSetup={finishAccountSetup} account={true}/>}
  {authOpen&&<AuthModal mode={authMode} setMode={setAuthMode} close={()=>{setAuthOpen(false);setError("")}} onSocial={social} onEmail={emailAuth} error={error}/>}
 </div>
}

function AnonymousSetupModal(p:{close:()=>void;continueSetup:(displayName:string,journey:string,classLevel:string)=>void|Promise<void>;account:boolean}){const [name,setName]=useState("");return <div className="modal-backdrop auth-backdrop" onMouseDown={p.close}><div className="auth-card auth-modal setup-modal" onMouseDown={e=>e.stopPropagation()}><button className="auth-close icon-btn" onClick={p.close} aria-label="Close"><X size={18}/></button><div className="auth-icon"><img src={AVENROOS_ICON} alt="" aria-hidden="true"/></div><span className="eyebrow">A NEW WORKSPACE STARTS HERE</span><h1>{p.account?"Welcome to AvenroOS":"Explore AvenroOS"}</h1><p>Give your profile a name. Next, you'll create your first Space and choose the tools that belong in it.</p><label className="field"><span>What should we call you? (optional)</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoFocus/></label><div className="modal-actions"><button className="ghost-btn" onClick={p.close}>Not now</button><button className="primary-btn" onClick={()=>void p.continueSetup(name,"","")}>Create my first Space <ChevronRight size={16}/></button></div></div></div>}
function AuthModal(p:{mode:"signin"|"signup";setMode:(m:"signin"|"signup")=>void;close:()=>void;onSocial:(x:"google"|"notion")=>void;onEmail:(email:string,code?:string)=>Promise<boolean>;error:string}){
 const [email,setEmail]=useState(""),[code,setCode]=useState(""),[codeSent,setCodeSent]=useState(false);
 const errorIsSent=p.error==="CODE_SENT";
 const sendCode=async()=>{if(!email.trim())return;const ok=await p.onEmail(email.trim());if(ok)setCodeSent(true)};
 const verify=async()=>{if(code.trim().length!==6)return;await p.onEmail(email.trim(),code.trim())};
 return <div className="modal-backdrop auth-backdrop" onMouseDown={p.close}><div className="auth-card auth-modal auth-reference-modal" onMouseDown={e=>e.stopPropagation()}>
  <button className="auth-close icon-btn" onClick={p.close} aria-label="Close"><X size={18}/></button>
  <div className="auth-icon"><img src={AVENROOS_ICON} alt="" aria-hidden="true" /></div>
  <h1>Log in or sign up</h1>
  <p>Save your AvenroOS workspace in the cloud and pick up where you left off on any device.</p>
  <button className="social-btn google-auth" onClick={()=>p.onSocial("google")}><span className="google-g">G</span> Continue with Google <ChevronRight size={16}/></button>
  <button className="social-btn notion-auth" onClick={()=>p.onSocial("notion")}><span className="notion-mark">N</span> Continue with Notion <ChevronRight size={16}/></button>
  <div className="auth-divider"><span>OR</span></div>
  {!codeSent ? <>
   <label className="field"><span>Email address</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" autoFocus/></label>
   <button className="primary-btn auth-submit reference-continue" onClick={sendCode} disabled={!email.trim()}>Send verification code <ChevronRight size={17}/></button>
  </> : <>
   <label className="field"><span>Verification code</span><input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="6-digit code" autoFocus/></label>
   <p className="auth-code-hint">We sent a verification code to <strong>{email}</strong>.</p>
   <button className="primary-btn auth-submit reference-continue" onClick={verify} disabled={code.length!==6}>Verify & continue <ChevronRight size={17}/></button>
   <button className="text-btn auth-resend" onClick={sendCode}>Resend code</button>
   <button className="text-btn auth-change-email" onClick={()=>{setCode("");setCodeSent(false)}}>Use a different email</button>
  </>}
  {errorIsSent?<div className="auth-success">Verification code sent. Check your email.</div>:p.error&&<div className="auth-error">{p.error}</div>}
  <div className="auth-switch">{p.mode==="signup"?<><span>Already have an account?</span><button onClick={()=>p.setMode("signin")}>Log in</button></>:<><span>New to AvenroOS?</span><button onClick={()=>p.setMode("signup")}>Sign up</button></>}</div>
  <small className="auth-note">Email sign-in uses a one-time verification code. No password is required.</small>
 </div></div>
}

function Welcome(p:{onAnonymous:()=>void;openAuth:(m:"signin"|"signup")=>void;onSocial:(x:"google"|"notion")=>void;error:string}){
 const [intro,setIntro]=useState(true);
 useEffect(()=>{const t=window.setTimeout(()=>setIntro(false),1200);return()=>window.clearTimeout(t)},[]);
 const start=()=>p.openAuth("signup");
 return <>{intro&&<div className="landing-intro-v2" aria-hidden="true"><div className="landing-intro-mark"><img src={AVENROOS_ICON} alt="" aria-hidden="true"/></div><div className="landing-intro-word">AVENROOS</div><div className="landing-intro-line"/></div>}
 <main className="welcome-main-v2">
 <section className="landing-hero-v2"><div className="landing-hero-copy"><div className="landing-eyebrow"><span/> SPACES FOR EVERYTHING YOU DO</div><h1>Make room for<br/><em>what matters.</em></h1><div className="landing-punchline">One flexible home for projects, learning, goals and ideas.</div><p>AvenroOS brings your plans, projects, learning and ideas into one organised workspace. Choose the Spaces you need, create your own, and keep your world moving in one place.</p><div className="landing-actions-v2"><button className="landing-primary-v2" onClick={start}>Create your workspace <ChevronRight size={17}/></button><button className="landing-text-v2" onClick={p.onAnonymous}>Explore anonymously <ArrowUpRight size={16}/></button></div><div className="landing-proof-v2"><span>START WITH TEMPLATES</span><i/><span>MAKE IT YOURS</span><i/><span>ONE CONNECTED WORKSPACE</span></div></div>
 <div className="landing-stage-v2"><div className="stage-orbit stage-orbit-a"/><div className="stage-orbit stage-orbit-b"/><div className="stage-glow"/><div className="stage-label">YOUR WORKSPACE <span>●</span></div><div className="stage-window"><div className="stage-top"><div className="stage-brand"><div className="stage-mark"><img src={AVENROOS_ICON} alt="" aria-hidden="true"/></div> AVENROOS</div><span>ONE PLACE · YOUR WAY</span></div><div className="stage-body"><span className="stage-kicker">YOUR SPACES</span><h2>Everything in<br/><b>its right place.</b></h2><div className="stage-focus"><div><span>STUDY</span><strong>04 tools</strong></div><div><span>PROJECTS</span><strong>03 active</strong></div><div><span>KNOWLEDGE</span><strong>12 notes</strong></div></div><div className="stage-line"><span>YOUR WORKSPACE</span><b>BUILT AROUND YOU</b><i><em/></i></div></div></div><div className="stage-float stage-score"><TrendingUp size={14}/><span>Progress</span><b>All in view</b></div><div className="stage-float stage-mission"><Target size={14}/><span>Next step</span><b>Keep moving</b></div></div></section>
 <section className="landing-manifesto-v2"><div className="manifesto-index">01 / THE PRINCIPLE</div><div><h2>Ready when you are.<br/><em>Never one-size-fits-all.</em></h2><p>AvenroOS starts with useful, purpose-built Spaces. Add the ones that fit, create your own when you need something different, and keep everything in one place without building a system from scratch.</p></div></section>
 <section className="landing-modules-v2" id="spaces"><div className="module-heading"><span>02 / YOUR WORKSPACES</span><h2>Different parts of life.<br/><em>One connected system.</em></h2><p className="catalog-intro">Choose a ready-made Space or create a workspace of your own. Each one has a clear purpose and a focused set of tools.</p></div><div className="module-grid-v2">
 <article className="module-large"><div className="module-number">01 / LEARNING</div><BookOpen/><h3>Study</h3><p>Keep learning organised with subject-based tasks, assignments, exam preparation, scores and focused sessions.</p><div className="module-demo"><span>INSIDE STUDY</span><b>Tasks · Exams · Scores</b><small>Preparation, performance and focus</small></div></article>
 <article className="module-dark"><div className="module-number">02 / WELLBEING</div><Gauge/><h3>Workout</h3><p>Keep routines, training notes and session records together. Build a consistent practice you can review.</p><div className="module-demo"><span>INSIDE WORKOUT</span><b>Routines & session logs</b><small>Training plans · Milestones</small></div></article>
 <article className="module-dark"><div className="module-number">03 / GETTING THINGS DONE</div><Command/><h3>Projects</h3><p>Give each project a home. Capture the goal, organise next actions and keep progress visible.</p><div className="module-demo"><span>INSIDE PROJECTS</span><b>Ideas → Actions</b><small>Project notes · Progress</small></div></article>
 <article className="module-accent"><div className="module-number">04 / THINKING</div><BookOpen/><h3>Knowledge</h3><p>Collect notes, references and useful ideas in a place you can return to whenever you need them.</p><div className="module-demo"><span>INSIDE KNOWLEDGE</span><b>A library of what you learn</b><small>Notes · Collections · Ideas</small></div></article>
 <article className="module-wide"><div><div className="module-number">05 / YOUR SYSTEM</div><Sparkles/><h3>Custom Spaces</h3><p>Need something different? Create a Space with your own name, purpose and icon. Your workspace can grow as your priorities change.</p></div><div className="journey-demo"><span>YOUR WORKSPACE</span><b>Built around the way you work.</b><i><em/></i></div></article></div></section>
 <section className="landing-manifesto-v2 landing-how"><div className="manifesto-index">03 / HOW IT WORKS</div><div><h2>A useful start.<br/><em>Room to make it yours.</em></h2><div className="landing-steps"><div><b>01</b><strong>Choose a template</strong><p>Add a ready-made Space with a clear purpose.</p></div><div><b>02</b><strong>Make your own</strong><p>Create a custom Space whenever your needs don't fit a template.</p></div><div><b>03</b><strong>Keep it connected</strong><p>Bring your Spaces together in one workspace and switch between them easily.</p></div></div></div></section>
 <section className="landing-close-v2"><span>04 / BEGIN</span><h2>Your system.<br/><em>Your direction.</em></h2><div className="landing-close-actions"><button className="landing-primary-v2" onClick={start}>Build your workspace <ChevronRight size={17}/></button><button className="landing-text-v2" onClick={p.onAnonymous}>Explore first <ArrowUpRight size={16}/></button></div></section>
 <footer className="landing-footer"><div className="welcome-brand"><div className="brand-mark"><img src={AVENROOS_ICON} alt="" aria-hidden="true"/></div><strong>AvenroOS</strong></div><span>One home for your plans, projects and ideas.</span><button onClick={start}>Get started <ChevronRight size={15}/></button></footer>
 </main></>}


const spaceTemplates:Space[]=[
{id:"template-workout",name:"Workout",icon:"activity",description:"Plan training, log sessions and organise routines.",kind:"template",items:[],enabled:true},
{id:"template-projects",name:"Projects",icon:"layers",description:"Turn ideas into projects and track next steps.",kind:"template",items:[],enabled:true},
{id:"template-knowledge",name:"Knowledge",icon:"book",description:"Collect useful notes, references and ideas.",kind:"template",items:[],enabled:true}
];
function SpacesPage(p:{spaces:Space[];setSpaces:Dispatch<SetStateAction<Space[]>>;openSpace:(id:string)=>void;onCreate:()=>void}){
 const [tab,setTab]=useState<"templates"|"your">("templates");
 const added=(id:string)=>p.spaces.some(x=>x.id===id||x.id.startsWith(id+"-"));
 const add=(t:Space)=>{if(!added(t.id)){p.setSpaces(all=>[...all,{...t,id:t.id+"-"+Date.now(),items:[]}]);setTab("your")}};
 const icon=(n:string)=>n==="activity"?<Gauge/>:n==="layers"?<Command/>:n==="book"?<BookOpen/>:<Sparkles/>;
 return <div className="stack spaces-page"><PageIntro title="Make AvenroOS yours" text="Start with a ready-made Space or create one that fits the way you work." action={<button className="primary-btn" onClick={p.onCreate}><Plus size={16}/> Create a Space</button>}/>
 <div className="spaces-tabs"><button className={tab==="templates"?"active":""} onClick={()=>setTab("templates")}>Explore templates</button><button className={tab==="your"?"active":""} onClick={()=>setTab("your")}>Your Spaces <span>{p.spaces.length}</span></button></div>
 {tab==="templates"?<><div className="space-feature-banner"><div><span className="eyebrow">A WORKSPACE THAT ADAPTS</span><h2>One system.<br/><em>Your way of working.</em></h2><p>Add the Spaces that fit, create your own when you need something different, and keep everything together.</p></div><div className="space-feature-mark"><Command size={46}/></div></div><div className="space-template-grid">
 <article className="space-template-card study-template"><div className="space-card-icon"><BookOpen/></div><span className="eyebrow">LEARNING & EDUCATION</span><h3>Study</h3><p>Assignments, subject tasks, exams, scores and focused study sessions in one dedicated area.</p><ul><li>Study task planner</li><li>Exam preparation tracker</li><li>Assessment scores & trends</li><li>Focus timer</li></ul><button className="space-add-btn" onClick={p.onCreate}>Set up Study Space <ChevronRight size={15}/></button></article>
 {spaceTemplates.map(t=><article className="space-template-card" key={t.id}><div className="space-card-icon">{icon(t.icon)}</div><span className="eyebrow">READY-MADE SPACE</span><h3>{t.name}</h3><p>{t.description}</p><ul>{(t.name==="Workout"?["Training routines","Session notes","Milestones"]:t.name==="Projects"?["Project ideas","Action items","Progress notes"]:["Quick notes","Reference lists","Ideas to revisit"]).map(x=><li key={x}>{x}</li>)}</ul><button className="space-add-btn" onClick={p.onCreate}>Set up {t.name} Space <Plus size={15}/></button></article>)}
 </div><div className="space-custom-prompt"><div><span className="eyebrow">SOMETHING DIFFERENT?</span><h3>Make a Space of your own.</h3><p>Choose a name, pick an icon and create a place for the things you want to organise.</p></div><button className="ghost-btn" onClick={p.onCreate}>Create custom Space <ArrowUpRight size={15}/></button></div></>:<div className="space-owned-grid">{p.spaces.length===0?<div className="empty-state-card"><Sparkles/><h3>Your Spaces will appear here.</h3><p>Add a template or create a custom Space to get started.</p><button className="primary-btn" onClick={()=>setTab("templates")}>Explore templates</button></div>:p.spaces.map(x=><article className="space-owned-card" key={x.id}><div className="space-card-icon">{icon(x.icon)}</div><span className="eyebrow">{x.kind==="custom"?"CUSTOM SPACE":"TEMPLATE SPACE"}</span><h3>{x.name}</h3><p>{x.description}</p><div className="space-owned-meta">{x.items.length} entries</div><div className="space-owned-actions"><button className="primary-btn" onClick={()=>p.openSpace(x.id)}>Open Space <ChevronRight size={15}/></button><button className="icon-btn" title={x.enabled?"Hide from sidebar":"Show in sidebar"} onClick={()=>p.setSpaces(all=>all.map(y=>y.id===x.id?{...y,enabled:!y.enabled}:y))}>{x.enabled?<Check size={16}/>:<Plus size={16}/>}</button><button className="icon-btn" title="Delete Space" onClick={()=>{if(window.confirm("Delete "+x.name+" and its entries?"))p.setSpaces(all=>all.filter(y=>y.id!==x.id))}}><Trash2 size={16}/></button></div></article>)}</div>}</div>
}
function SpaceDetail(p:{space?:Space;setSpaces:Dispatch<SetStateAction<Space[]>>;back:()=>void;openStudyTool:(page:Page)=>void}){
 const [draft,setDraft]=useState("");
 if(!p.space)return <div className="empty-state-card"><h3>This Space is unavailable.</h3><button className="primary-btn" onClick={p.back}>Back to Spaces</button></div>;
 const widgets=p.space.widgets||["notes","checklist","progress"];
 const saveData=(key:string,value:string[])=>p.setSpaces(all=>all.map(x=>x.id===p.space!.id?{...x,widgetData:{...(x.widgetData||{}),[key]:value}}:x));
 const updateItem=(value:string)=>{if(!value.trim())return;p.setSpaces(all=>all.map(x=>x.id===p.space!.id?{...x,items:[value.trim(),...x.items]}:x));setDraft("")};
 return <div className="stack space-detail-page"><PageIntro title={p.space.name} text={p.space.description} action={<button className="ghost-btn" onClick={p.back}>All Spaces</button>}/>
 <section className="space-detail-intro"><span className="eyebrow">{p.space.template==="custom"?"YOUR CUSTOM SPACE":(p.space.template||"SPACE").toUpperCase()+" SPACE"}</span><h2>{p.space.purpose||p.space.description}</h2><p>This Space is yours to shape. Add widgets, update your progress and keep related work together.</p></section>
 {p.space.template==="study"&&<div className="study-space-tools"><button onClick={()=>p.openStudyTool("study")}><BookOpen/> Study sessions</button><button onClick={()=>p.openStudyTool("exams")}><CalendarDays/> Exams</button><button onClick={()=>p.openStudyTool("scores")}><TrendingUp/> Scores</button><button onClick={()=>p.openStudyTool("focus")}><Clock3/> Focus</button><button onClick={()=>p.openStudyTool("journey")}><Target/> Journey</button></div>}
 <div className="space-widget-grid">{widgets.map((widget,i)=><SpaceWidget key={p.space!.id+"-"+widget+"-"+i} type={widget} index={i} data={p.space!.widgetData?.[widget]||[]} save={value=>saveData(widget,value)}/>)}</div>
 <section className="panel space-entry-panel"><div className="panel-head"><div><h3>Quick entries</h3><p>Capture anything that belongs in this Space.</p></div></div><form className="space-entry-form" onSubmit={e=>{e.preventDefault();updateItem(draft)}}><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Add a note, idea or next action…" aria-label="New Space entry"/><button className="primary-btn" type="submit" disabled={!draft.trim()}><Plus size={16}/> Add entry</button></form>{p.space.items.length===0?<div className="empty-state"><Sparkles/><p>No entries yet. Add your first one above.</p></div>:<div className="space-entry-list">{p.space.items.map((item,i)=><div className="space-entry-row" key={p.space!.id+"-"+i}><span>{item}</span><button className="icon-btn" aria-label={"Remove "+item} onClick={()=>p.setSpaces(all=>all.map(x=>x.id===p.space!.id?{...x,items:x.items.filter((_,j)=>j!==i)}:x))}><Trash2 size={15}/></button></div>)}</div>}</section></div>
}
function calculateArithmetic(expression:string):number{
 const tokens=expression.match(/(?:\d+(?:\.\d*)?|\.\d+)|[()+*/%-]/g)||[];
 if(tokens.join("")!==expression.replace(/\s+/g,""))throw Error("Invalid input");
 let pos=0;
 const factor=():number=>{const token=tokens[pos++];if(token==="+")return factor();if(token==="-")return -factor();if(token==="("){const value=expr();if(tokens[pos++]!==")")throw Error("Missing )");return value;}const value=Number(token);if(!Number.isFinite(value)||token===undefined)throw Error("Invalid number");return value};
 const term=():number=>{let value=factor();while(["*","/","%"].includes(tokens[pos])){const op=tokens[pos++],right=factor();if((op==="/"||op==="%")&&right===0)throw Error("Divide by zero");value=op==="*"?value*right:op==="/"?value/right:value%right;}return value};
 const expr=():number=>{let value=term();while(tokens[pos]==="+"||tokens[pos]==="-"){const op=tokens[pos++],right=term();value=op==="+"?value+right:value-right;}return value};
 const result=expr();if(pos!==tokens.length||!Number.isFinite(result))throw Error("Invalid expression");return result;
}
function SpaceWidget(p:{type:string;index:number;data:string[];save:(value:string[])=>void}){
 const [draft,setDraft]=useState("");
 const [timerRunning,setTimerRunning]=useState(false);
 const [timerSeconds,setTimerSeconds]=useState(Number(p.data[0]??(p.type==="stopwatch"?0:1500)));
 const [calc,setCalc]=useState("");
 const [now,setNow]=useState(()=>new Date());
 useEffect(()=>{if(!timerRunning)return;const id=window.setInterval(()=>setTimerSeconds(v=>Math.max(0,v-1)),1000);return()=>window.clearInterval(id)},[timerRunning]);
 useEffect(()=>{if(timerSeconds===0)setTimerRunning(false)},[timerSeconds]);
 useEffect(()=>{if(p.type!=="clock")return;const id=window.setInterval(()=>setNow(new Date()),1000);return()=>window.clearInterval(id)},[p.type]);
 const titles:Record<string,string>={progress:"Progress tracker",checklist:"Checklist",notes:"Notes",goal:"Goal tracker",habit:"Habit tracker",counter:"Counter",calendar:"Calendar & deadlines",links:"Bookmarks & links",tasks:"Task list",text:"Text block",timer:"Focus timer",chart:"Progress chart",countdown:"Countdown",files:"Resource list",priority:"Priority matrix",quicktask:"Quick task inbox",schedule:"Daily schedule",timeblocks:"Time blocking",reminders:"Reminders",pomodoro:"Pomodoro timer",stopwatch:"Stopwatch",timelog:"Time log",quicknote:"Quick note",reading:"Reading list",clock:"Live clock",calculator:"Calculator",ambient:"Ambient focus"};
 const title=titles[p.type]||"Workspace widget";
 const percent=Math.max(0,Math.min(100,Number(p.data[0]||0)));
 const add=()=>{if(!draft.trim())return;p.save([...(p.data||[]),draft.trim()]);setDraft("")};
 const itemList=(placeholder:string,checkable=false)=><><form className="widget-add-form" onSubmit={e=>{e.preventDefault();add()}}><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder={placeholder}/><button className="icon-btn" type="submit" disabled={!draft.trim()} aria-label="Add item"><Plus/></button></form><div className="widget-list">{(p.data||[]).slice(p.type==="timelog"?1:0).map((item,i)=>{const checked=item.startsWith("[x] "),label=checked?item.slice(4):item;return <div key={i}><span className={checked?"widget-item-checked":""}>{label}</span>{checkable&&<button className="icon-btn" onClick={()=>p.save(p.data.map((v,j)=>j===i?(checked?label:"[x] "+label):v))} aria-label="Toggle complete"><Check size={14}/></button>}<button className="icon-btn" onClick={()=>p.save(p.data.filter((_,j)=>j!==i))} aria-label="Remove item"><Trash2 size={14}/></button></div>})}</div></>;
 if(p.type==="progress"||p.type==="goal"||p.type==="chart")return <section className="panel space-widget"><div className="widget-heading"><span className="widget-icon"><TrendingUp/></span><div><h3>{title}</h3><p>Update your current progress</p></div></div><div className="widget-progress-number">{percent}%</div><div className="progress"><i style={{width:percent+"%"}}/></div><input aria-label="Progress percentage" type="range" min="0" max="100" value={percent} onChange={e=>p.save([e.target.value])}/></section>;
 if(p.type==="counter")return <section className="panel space-widget"><div className="widget-heading"><span className="widget-icon"><Gauge/></span><div><h3>{title}</h3><p>Keep a simple running count</p></div></div><div className="widget-counter"><button onClick={()=>p.save([String(Math.max(0,Number(p.data[0]||0)-1))])}>−</button><strong>{p.data[0]||"0"}</strong><button onClick={()=>p.save([String(Number(p.data[0]||0)+1)])}>+</button></div></section>;
 if(p.type==="habit")return <section className="panel space-widget"><div className="widget-heading"><span className="widget-icon"><Flame/></span><div><h3>{title}</h3><p>Mark today's habit as complete</p></div></div><button className={"habit-toggle "+(p.data[0]===today?"done":"")} onClick={()=>p.save([p.data[0]===today?"":today])}>{p.data[0]===today?"Completed today":"Mark complete today"}</button></section>;
 if(["timer","pomodoro","stopwatch"].includes(p.type)){const initial=p.type==="pomodoro"?1500:p.type==="stopwatch"?0:1500;return <section className="panel space-widget"><div className="widget-heading"><span className="widget-icon"><Clock3/></span><div><h3>{title}</h3><p>{p.type==="pomodoro"?"25 minutes focus · 5 minutes break":p.type==="stopwatch"?"Measure elapsed time":"A focused session in this Space"}</p></div></div><div className="space-timer-display">{String(Math.floor(timerSeconds/60)).padStart(2,"0")}:{String(timerSeconds%60).padStart(2,"0")}</div><div className="space-timer-actions"><button className="primary-btn" onClick={()=>{if(timerRunning){setTimerRunning(false);p.save([String(timerSeconds)])}else{if(timerSeconds===0)setTimerSeconds(initial);setTimerRunning(true)}}}>{timerRunning?"Pause":"Start"}</button><button className="ghost-btn" onClick={()=>{setTimerRunning(false);setTimerSeconds(initial);p.save([String(initial)])}}>Reset</button>{p.type==="pomodoro"&&<button className="ghost-btn" onClick={()=>{setTimerRunning(false);setTimerSeconds(300);p.save(["300"])}}>Break</button>}</div></section>}
 if(p.type==="calendar"||p.type==="countdown")return <section className="panel space-widget"><div className="widget-heading"><span className="widget-icon"><CalendarDays/></span><div><h3>{title}</h3><p>{p.type==="countdown"?"Count down to an important date":"Keep an important date visible"}</p></div></div><input type="date" value={p.data[0]||""} onChange={e=>p.save([e.target.value])}/>{p.type==="countdown"&&p.data[0]&&<div className="widget-progress-number">{Math.ceil((new Date(p.data[0]+"T00:00:00").getTime()-new Date(today+"T00:00:00").getTime())/86400000)} days</div>}</section>;
 if(p.type==="notes"||p.type==="text"||p.type==="quicknote")return <section className="panel space-widget"><div className="widget-heading"><span className="widget-icon"><Pencil/></span><div><h3>{title}</h3><p>Write and keep your thoughts</p></div></div><textarea rows={p.type==="quicknote"?2:4} value={p.data[0]||""} onChange={e=>p.save([e.target.value])} placeholder="Start writing…"/></section>;
 if(p.type==="clock")return <section className="panel space-widget"><div className="widget-heading"><span className="widget-icon"><Clock3/></span><div><h3>{title}</h3><p>Your device's local time</p></div></div><div className="space-timer-display">{now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"})}</div><div className="widget-clock-date">{now.toLocaleDateString([], {weekday:"long",day:"numeric",month:"long"})}</div></section>;
 if(p.type==="calculator")return <section className="panel space-widget"><div className="widget-heading"><span className="widget-icon"><Gauge/></span><div><h3>{title}</h3><p>Basic arithmetic</p></div></div><input value={calc} onChange={e=>setCalc(e.target.value)} placeholder="e.g. (24 + 6) / 3" aria-label="Calculation"/><button className="ghost-btn" onClick={()=>{try{const expr=calc.trim();if(!/^[0-9+*/().% -]+$/.test(expr))throw Error();const result=calculateArithmetic(expr)setCalc(String(Number(result.toFixed(8))))}catch{setCalc("Invalid expression")}}}>Calculate</button></section>;
 if(p.type==="ambient")return <section className="panel space-widget ambient-widget"><div className="widget-heading"><span className="widget-icon"><Sparkles/></span><div><h3>{title}</h3><p>A quieter space to pause and reset</p></div></div><div className="ambient-orb"/><p className="ambient-caption">Breathe in. Focus on one thing. Begin when ready.</p></section>;
 if(p.type==="timelog")return <section className="panel space-widget"><div className="widget-heading"><span className="widget-icon"><Clock3/></span><div><h3>{title}</h3><p>Record activity and minutes spent</p></div></div><form className="widget-add-form" onSubmit={e=>{e.preventDefault();if(!draft.trim())return;p.save([String(Number(p.data[0]||0)+1),...(p.data.slice(1)),draft.trim()]);setDraft("")}}><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Activity — 30 min"/><button className="icon-btn" type="submit" disabled={!draft.trim()} aria-label="Log time"><Plus/></button></form><div className="widget-progress-number">{p.data[0]||"0"} entries</div><div className="widget-list">{p.data.slice(1).map((x,i)=><div key={i}>{x}<button className="icon-btn" onClick={()=>p.save([String(Math.max(0,Number(p.data[0]||0)-1)),...p.data.slice(1).filter((_,j)=>j!==i)])}><Trash2 size={14}/></button></div>)}</div></section>;
 if(p.type==="priority")return <section className="panel space-widget"><div className="widget-heading"><span className="widget-icon"><Target/></span><div><h3>{title}</h3><p>Sort what matters first</p></div></div>{itemList("Add a priority…",true)}</section>;
 if(p.type==="schedule"||p.type==="timeblocks")return <section className="panel space-widget"><div className="widget-heading"><span className="widget-icon"><CalendarDays/></span><div><h3>{title}</h3><p>Add a time and activity (e.g. 09:00 — Planning)</p></div></div>{itemList("Time — activity…")}</section>;
 if(p.type==="quicktask"||p.type==="tasks"||p.type==="checklist"||p.type==="reminders"||p.type==="reading"||p.type==="links"||p.type==="files")return <section className="panel space-widget"><div className="widget-heading"><span className="widget-icon">{p.type==="links"?<ArrowUpRight/>:<Check/>}</span><div><h3>{title}</h3><p>{p.type==="links"?"Save a useful URL":p.type==="files"?"Keep resource names or references":p.type==="reading"?"Track things to read":"Add items and check them off"}</p></div></div>{itemList(p.type==="links"?"Paste a URL…":p.type==="reading"?"Add a title…":"Add an item…",["tasks","checklist","quicktask","reminders","reading"].includes(p.type))}</section>;
 return <section className="panel space-widget"><div className="widget-heading"><span className="widget-icon"><Check/></span><div><h3>{title}</h3><p>Keep this tool in your Space</p></div></div>{itemList("Add an item…")}</section>;
}

const widgetGroups=[
 {id:"tasks",name:"Tasks & to-do",widgets:[
 {id:"tasks",name:"Task list",description:"Capture actions and mark them complete."},
 {id:"checklist",name:"Checklist",description:"Tick off steps in a simple list."},
 {id:"priority",name:"Priority matrix",description:"Sort tasks by importance and urgency."},
 {id:"quicktask",name:"Quick task capture",description:"A fast inbox for things to do."}
 ]},
 {id:"calendar",name:"Calendar & time management",widgets:[
 {id:"calendar",name:"Calendar & deadlines",description:"Choose and keep an important date."},
 {id:"countdown",name:"Countdown",description:"See how many days remain until a date."},
 {id:"schedule",name:"Daily schedule",description:"Plan events and time slots."},
 {id:"timeblocks",name:"Time blocking",description:"Plan what you'll work on and when."},
 {id:"reminders",name:"Reminder list",description:"Keep upcoming reminders in one place."}
 ]},
 {id:"focus",name:"Focus & time tracking",widgets:[
 {id:"timer",name:"Focus timer",description:"Run and pause a focused session."},
 {id:"pomodoro",name:"Pomodoro timer",description:"Work and break in repeating intervals."},
 {id:"stopwatch",name:"Stopwatch",description:"Measure elapsed time."},
 {id:"timelog",name:"Time log",description:"Record how long activities take."}
 ]},
 {id:"notes",name:"Notes & reference",widgets:[
 {id:"notes",name:"Notes",description:"Write and save longer notes."},
 {id:"quicknote",name:"Quick note",description:"Capture a short thought instantly."},
 {id:"links",name:"Bookmarks & links",description:"Save and open useful URLs."},
 {id:"files",name:"Resource list",description:"Keep names of files and references."},
 {id:"reading",name:"Reading list",description:"Track things you want to read."},
 {id:"text",name:"Text block",description:"Add instructions or reference text."}
 ]},
 {id:"ambient",name:"Ambient & utility",widgets:[
 {id:"clock",name:"Live clock",description:"Keep the current time visible."},
 {id:"calculator",name:"Calculator",description:"Do quick arithmetic inside your Space."},
 {id:"ambient",name:"Ambient focus",description:"A calm breathing visual to create a quieter focus moment."},
 {id:"progress",name:"Progress bar",description:"Track a percentage or milestone."},
 {id:"goal",name:"Goal tracker",description:"See how close you are to a target."},
 {id:"habit",name:"Habit tracker",description:"Mark a daily habit complete."},
 {id:"counter",name:"Counter",description:"Track a simple running number."},
 {id:"chart",name:"Progress chart",description:"Visualise a simple percentage."}
 ]}
];
const widgetCatalog=widgetGroups.flatMap(group=>group.widgets);

const spacePresets=[
 {id:"study",name:"Study",icon:"book",purpose:"Organise learning, assignments and exam preparation.",widgets:["progress","checklist","tasks","notes","calendar","timer"]},
 {id:"workout",name:"Workout",icon:"activity",purpose:"Plan routines and keep track of training sessions.",widgets:["progress","habit","checklist","notes","calendar","countdown"]},
 {id:"projects",name:"Projects",icon:"layers",purpose:"Plan projects, manage next steps and review progress.",widgets:["progress","tasks","checklist","notes","calendar","links"]},
 {id:"knowledge",name:"Knowledge",icon:"book",purpose:"Collect useful notes, ideas and reference material.",widgets:["notes","links","text","checklist","files"]}
];
function CreateSpaceWizard(p:{close:()=>void;create:(space:Space)=>void}){
 const [step,setStep]=useState(1),[name,setName]=useState(""),[purpose,setPurpose]=useState(""),[template,setTemplate]=useState("custom"),[widgets,setWidgets]=useState<string[]>(["notes","checklist","progress"]),[icon,setIcon]=useState("sparkles");
 const selected=spacePresets.find(x=>x.id===template);
 const chooseTemplate=(id:string)=>{setTemplate(id);const preset=spacePresets.find(x=>x.id===id);if(preset){setName(preset.name);setPurpose(preset.purpose);setIcon(preset.icon);setWidgets(preset.widgets)}else{setWidgets(["notes","checklist","progress"]);setIcon("sparkles")}};
 const toggle=(id:string)=>setWidgets(all=>all.includes(id)?all.filter(x=>x!==id):[...all,id]);
 const finish=()=>p.create({id:"space-"+Date.now(),name:name.trim(),description:purpose.trim(),purpose:purpose.trim(),icon,kind:template==="custom"?"custom":"template",template,items:[],widgets,widgetData:{},enabled:true});
 return <div className="modal-backdrop" onMouseDown={p.close}><div className="modal create-space-wizard" onMouseDown={e=>e.stopPropagation()}><button className="auth-close icon-btn" onClick={p.close} aria-label="Close"><X size={18}/></button><div className="wizard-progress"><span>CREATE A SPACE</span><b>STEP {step} OF 3</b><i><em style={{width:(step/3*100)+"%"}}/></i></div>
 {step===1?<><span className="eyebrow">FIRST, GIVE IT A HOME</span><h2>What are you creating?</h2><p>Every Space has its own purpose. You can change these details later.</p><label className="field"><span>Space name</span><input autoFocus maxLength={36} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Study, Side project, Reading…"/></label><label className="field"><span>What's this Space for?</span><textarea rows={3} maxLength={180} value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="Describe what you want to organise or keep track of…"/></label><div className="wizard-actions"><button className="primary-btn" disabled={!name.trim()||!purpose.trim()} onClick={()=>setStep(2)}>Continue <ChevronRight size={16}/></button></div></>:step===2?<><span className="eyebrow">CHOOSE YOUR STARTING POINT</span><h2>How would you like to build it?</h2><p>Start with a ready-made setup, or choose your own widgets.</p><div className="wizard-template-grid">{spacePresets.map(x=><button key={x.id} className={"wizard-template "+(template===x.id?"selected":"")} onClick={()=>chooseTemplate(x.id)}><span>{x.icon==="book"?<BookOpen/>:x.icon==="activity"?<Gauge/>:<Command/>}</span><strong>{x.name}</strong><small>{x.purpose}</small></button>)}<button className={"wizard-template "+(template==="custom"?"selected":"")} onClick={()=>chooseTemplate("custom")}><span><Sparkles/></span><strong>Build my own</strong><small>Choose each widget yourself.</small></button></div><div className="wizard-actions"><button className="ghost-btn" onClick={()=>setStep(1)}>Back</button><button className="primary-btn" onClick={()=>setStep(3)}>Choose widgets <ChevronRight size={16}/></button></div></>:<><span className="eyebrow">MAKE IT USEFUL</span><h2>Pick your widgets.</h2><p>{selected?"We've selected a useful starting set for "+selected.name+". Add or remove anything.":"Choose the tools you want in this Space. You can change them later."}</p><div className="widget-picker-groups">{widgetGroups.map(group=><section className="widget-picker-group" key={group.id}><h3>{group.name}</h3><div className="widget-picker-grid">{group.widgets.map(x=><button key={x.id} className={"widget-picker-item "+(widgets.includes(x.id)?"selected":"")} onClick={()=>toggle(x.id)}><span className="widget-picker-check">{widgets.includes(x.id)?<Check size={14}/>:<Plus size={14}/>}</span><strong>{x.name}</strong><small>{x.description}</small></button>)}</div></section>)}</div><div className="wizard-actions"><button className="ghost-btn" onClick={()=>setStep(2)}>Back</button><button className="primary-btn" disabled={!widgets.length} onClick={finish}>Create {name} Space <ChevronRight size={16}/></button></div></>}
 </div></div>
}

function pageTitle(p:Page){return {dashboard:"Home",spaces:"Your Spaces","space-detail":"Your Space",study:"Study",exams:"Exams",scores:"Scores",focus:"Focus",journey:"Journey",settings:"Settings"}[p]}

export default App;