"use client";

import { useEffect, useMemo, useState } from "react";

type Task = {
  id: number;
  title: string;
  notes: string;
  category: "Today" | "This week" | "Someday";
  done: boolean;
  starred: boolean;
};

const starterTasks: Task[] = [
  { id: 1, title: "Shape the opening scene", notes: "Find the feeling before finding the words.", category: "Today", done: false, starred: true },
  { id: 2, title: "Collect three color references", notes: "Look for warm shadows and surprising greens.", category: "Today", done: true, starred: false },
  { id: 3, title: "Make a tiny thing just for fun", notes: "No brief. No audience. Just follow the thread.", category: "This week", done: false, starred: false },
];

const categories: Task["category"][] = ["Today", "This week", "Someday"];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(starterTasks);
  const [activeCategory, setActiveCategory] = useState<Task["category"]>("Today");
  const [draft, setDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [selectedId, setSelectedId] = useState(1);
  const [dark, setDark] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("museboard-tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("museboard-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const visibleTasks = useMemo(
    () => tasks.filter((task) => task.category === activeCategory),
    [tasks, activeCategory],
  );
  const selectedTask = tasks.find((task) => task.id === selectedId) ?? visibleTasks[0];
  const completed = tasks.filter((task) => task.done).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  function addTask(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    const task: Task = { id: Date.now(), title: draft.trim(), notes: noteDraft.trim(), category: activeCategory, done: false, starred: false };
    setTasks((current) => [task, ...current]);
    setSelectedId(task.id);
    setDraft("");
    setNoteDraft("");
  }

  function updateTask(id: number, patch: Partial<Task>) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...patch } : task)));
  }

  return (
    <main className={dark ? "app dark" : "app"}>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">✳</span><span>MUSEBOARD</span></div>
        <p className="eyebrow">Your creative rhythm</p>
        <nav className="nav-list" aria-label="Task categories">
          {categories.map((category) => (
            <button className={activeCategory === category ? "nav-item active" : "nav-item"} key={category} onClick={() => setActiveCategory(category)}>
              <span>{category}</span><span className="count">{tasks.filter((task) => task.category === category && !task.done).length}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="progress-label"><span>Creative momentum</span><span>{progress}%</span></div>
          <div className="progress-track"><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
          <p className="microcopy">Small steps count. Keep going.</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div><p className="eyebrow">Tuesday, September 29</p><h1>Make room for good ideas.</h1></div>
          <div className="top-actions"><button className="icon-button" onClick={() => setFocusMode(!focusMode)} aria-label="Toggle focus mode">{focusMode ? "◉" : "◎"}</button><button className="icon-button" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? "☼" : "☾"}</button><div className="avatar">C</div></div>
        </header>
        <div className="content-grid">
          <div className="task-column">
            <div className="section-heading"><div><span className="section-kicker">{activeCategory}</span><h2>{visibleTasks.length} things in motion</h2></div><span className="spark">✦</span></div>
            <form className="add-form" onSubmit={addTask}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="What wants your attention?" aria-label="New task" /><button type="submit">Add <span>↗</span></button></form>
            <div className="task-list">
              {visibleTasks.map((task) => (
                <article className={selectedId === task.id ? "task-card selected" : "task-card"} key={task.id} onClick={() => setSelectedId(task.id)}>
                  <button className={task.done ? "check done" : "check"} onClick={(event) => { event.stopPropagation(); updateTask(task.id, { done: !task.done }); }} aria-label={task.done ? "Mark incomplete" : "Mark complete"}>{task.done ? "✓" : ""}</button>
                  <div className="task-copy"><h3 className={task.done ? "completed" : ""}>{task.title}</h3>{task.notes && <p>{task.notes}</p>}<span className="task-tag">{task.starred ? "✦ priority" : task.category.toLowerCase()}</span></div>
                  <button className={task.starred ? "star starred" : "star"} onClick={(event) => { event.stopPropagation(); updateTask(task.id, { starred: !task.starred }); }} aria-label="Star task">✦</button>
                </article>
              ))}
              {visibleTasks.length === 0 && <div className="empty-state"><span>✳</span><p>A blank page is a beginning.<br />Add the first thing.</p></div>}
            </div>
          </div>
          {!focusMode && <aside className="notes-panel"><div className="notes-heading"><span className="section-kicker">The margin</span><span>✎</span></div>{selectedTask ? <><h2>{selectedTask.title}</h2><textarea value={selectedTask.notes} onChange={(event) => updateTask(selectedTask.id, { notes: event.target.value })} placeholder="Leave a note for your future self..." /><div className="note-footer"><span>Autosaved locally</span><span>⌘ ↵</span></div></> : <p className="notes-placeholder">Select a task to leave it a note.</p>}<div className="prompt-card"><span className="prompt-mark">?</span><p>What would make this feel a little more like play?</p></div></aside>}
        </div>
      </section>
    </main>
  );
}
