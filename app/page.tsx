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

type Profile = {
  name: string;
};

const starterTasks: Task[] = [
  {
    id: 1,
    title: "Shape the opening scene",
    notes: "Find the feeling before finding the words.",
    category: "Today",
    done: false,
    starred: true,
  },
  {
    id: 2,
    title: "Collect three color references",
    notes: "Look for warm shadows and surprising greens.",
    category: "Today",
    done: true,
    starred: false,
  },
  {
    id: 3,
    title: "Make a tiny thing just for fun",
    notes: "No brief. No audience. Just follow the thread.",
    category: "This week",
    done: false,
    starred: false,
  },
];

const categories: Task["category"][] = ["Today", "This week", "Someday"];

const tourSteps = [
  {
    eyebrow: "First, catch the spark",
    title: "A thought is enough to begin.",
    copy: "Use the open line in your workspace to catch an idea before it disappears. You can shape it later.",
  },
  {
    eyebrow: "Then, leave yourself a margin",
    title: "Notes keep the why close.",
    copy: "Select a task and use its margin for references, half-formed thoughts, or the next small move.",
  },
  {
    eyebrow: "Finally, protect your rhythm",
    title: "Make the space work your way.",
    copy: "Your progress, tasks, notes, and name stay in this browser. Switch themes or enter focus mode whenever you need a quieter view.",
  },
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(starterTasks);
  const [activeCategory, setActiveCategory] = useState<Task["category"]>("Today");
  const [draft, setDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [selectedId, setSelectedId] = useState(1);
  const [dark, setDark] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [onboardingActive, setOnboardingActive] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [nameDraft, setNameDraft] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("museboard-tasks");
    const savedProfile = window.localStorage.getItem("museboard-profile");

    try {
      if (saved) setTasks(JSON.parse(saved));
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile) as Profile;
        if (parsedProfile.name) setProfile(parsedProfile);
      } else {
        setOnboardingActive(true);
      }
    } catch {
      window.localStorage.removeItem("museboard-tasks");
      window.localStorage.removeItem("museboard-profile");
      setOnboardingActive(true);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem("museboard-tasks", JSON.stringify(tasks));
  }, [isLoaded, tasks]);

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
    const task: Task = {
      id: Date.now(),
      title: draft.trim(),
      notes: noteDraft.trim(),
      category: activeCategory,
      done: false,
      starred: false,
    };
    setTasks((current) => [task, ...current]);
    setSelectedId(task.id);
    setDraft("");
    setNoteDraft("");
  }

  function updateTask(id: number, patch: Partial<Task>) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...patch } : task)));
  }

  function beginTitleEdit(task: Task) {
    setTitleDraft(task.title);
    setIsEditingTitle(true);
  }

  function saveTitle(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedTask || !titleDraft.trim()) return;
    updateTask(selectedTask.id, { title: titleDraft.trim() });
    setIsEditingTitle(false);
  }

  function deleteTask(taskId: number) {
    const nextTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(nextTasks);
    setSelectedId(nextTasks[0]?.id ?? 0);
    setIsEditingTitle(false);
    setConfirmingDeleteId(null);
  }

  function startOnboarding(event: React.FormEvent) {
    event.preventDefault();
    const name = nameDraft.trim();
    if (!name) return;

    const nextProfile = { name };
    window.localStorage.setItem("museboard-profile", JSON.stringify(nextProfile));
    setProfile(nextProfile);
    setOnboardingStep(1);
  }

  function advanceOnboarding() {
    if (onboardingStep === tourSteps.length) {
      setOnboardingActive(false);
      return;
    }
    setOnboardingStep((step) => step + 1);
  }

  const firstName = profile?.name.trim().split(" ")[0] ?? "";
  const avatarInitial = firstName.slice(0, 1).toUpperCase() || "M";
  const activeTourStep = tourSteps[onboardingStep - 1];

  return (
    <main className={dark ? "app dark" : "app"}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">✳</span>
          <span>MUSEBOARD</span>
        </div>
        <p className="eyebrow">Your creative rhythm</p>
        <nav className="nav-list" aria-label="Task categories">
          {categories.map((category) => (
            <button
              className={activeCategory === category ? "nav-item active" : "nav-item"}
              key={category}
              onClick={() => setActiveCategory(category)}
            >
              <span>{category}</span>
              <span className="count">
                {tasks.filter((task) => task.category === category && !task.done).length}
              </span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="progress-label">
            <span>Creative momentum</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="microcopy">Small steps count. Keep going.</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Tuesday, September 29</p>
            <h1>
              {firstName ? `Make room for good ideas, ${firstName}.` : "Make room for good ideas."}
            </h1>
          </div>
          <div className="top-actions">
            <button
              className="icon-button"
              onClick={() => setFocusMode(!focusMode)}
              aria-label="Toggle focus mode"
            >
              {focusMode ? "◉" : "◎"}
            </button>
            <button
              className="icon-button"
              onClick={() => setDark(!dark)}
              aria-label="Toggle theme"
            >
              {dark ? "☼" : "☾"}
            </button>
            <div className="avatar" aria-label={`${firstName || "Museboard"} profile`}>
              {avatarInitial}
            </div>
          </div>
        </header>
        <div className="content-grid">
          <div className="task-column">
            <div className="section-heading">
              <div>
                <span className="section-kicker">{activeCategory}</span>
                <h2>{visibleTasks.length} things in motion</h2>
              </div>
              <span className="spark">✦</span>
            </div>
            <form className="add-form" onSubmit={addTask}>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="What wants your attention?"
                aria-label="New task"
              />
              <button type="submit">
                Add <span>↗</span>
              </button>
            </form>
            <div className="task-list">
              {visibleTasks.map((task) => (
                <article
                  className={selectedId === task.id ? "task-card selected" : "task-card"}
                  key={task.id}
                  onClick={() => setSelectedId(task.id)}
                >
                  <button
                    className={task.done ? "check done" : "check"}
                    onClick={(event) => {
                      event.stopPropagation();
                      updateTask(task.id, { done: !task.done });
                    }}
                    aria-label={task.done ? "Mark incomplete" : "Mark complete"}
                  >
                    {task.done ? "✓" : ""}
                  </button>
                  <div className="task-copy">
                    <h3 className={task.done ? "completed" : ""}>{task.title}</h3>
                    {task.notes && <p>{task.notes}</p>}
                    <span className="task-tag">
                      {task.starred ? "✦ priority" : task.category.toLowerCase()}
                    </span>
                  </div>
                  <button
                    className={task.starred ? "star starred" : "star"}
                    onClick={(event) => {
                      event.stopPropagation();
                      updateTask(task.id, { starred: !task.starred });
                    }}
                    aria-label="Star task"
                  >
                    ✦
                  </button>
                </article>
              ))}
              {visibleTasks.length === 0 && (
                <div className="empty-state">
                  <span>✳</span>
                  <p>
                    A blank page is a beginning.
                    <br />
                    Add the first thing.
                  </p>
                </div>
              )}
            </div>
          </div>
          {!focusMode && (
            <aside className="notes-panel">
              <div className="notes-heading">
                <span className="section-kicker">The margin</span>
                <span>✎</span>
              </div>
              {selectedTask ? (
                <>
                  {isEditingTitle ? (
                    <form className="title-form" onSubmit={saveTitle}>
                      <label className="sr-only" htmlFor="task-title">
                        Task title
                      </label>
                      <input
                        autoFocus
                        id="task-title"
                        maxLength={120}
                        onChange={(event) => setTitleDraft(event.target.value)}
                        value={titleDraft}
                      />
                      <div className="title-form-actions">
                        <button
                          className="text-button"
                          onClick={() => setIsEditingTitle(false)}
                          type="button"
                        >
                          Cancel
                        </button>
                        <button className="text-button strong" type="submit">
                          Save title
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="task-title-row">
                      <h2>{selectedTask.title}</h2>
                      <button
                        className="edit-button"
                        onClick={() => beginTitleEdit(selectedTask)}
                        type="button"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                  <textarea
                    value={selectedTask.notes}
                    onChange={(event) => updateTask(selectedTask.id, { notes: event.target.value })}
                    placeholder="Leave a note for your future self..."
                  />
                  <div className="note-footer">
                    <span>Autosaved locally</span>
                    <span>⌘ ↵</span>
                  </div>
                  <div className="task-management" aria-live="polite">
                    {confirmingDeleteId === selectedTask.id ? (
                      <>
                        <p>Remove this task from this device?</p>
                        <div className="management-actions">
                          <button
                            className="text-button"
                            onClick={() => setConfirmingDeleteId(null)}
                            type="button"
                          >
                            Keep it
                          </button>
                          <button
                            className="text-button danger"
                            onClick={() => deleteTask(selectedTask.id)}
                            type="button"
                          >
                            Remove task
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        className="text-button danger"
                        onClick={() => setConfirmingDeleteId(selectedTask.id)}
                        type="button"
                      >
                        Remove task
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p className="notes-placeholder">Select a task to leave it a note.</p>
              )}
              <div className="prompt-card">
                <span className="prompt-mark">?</span>
                <p>What would make this feel a little more like play?</p>
              </div>
            </aside>
          )}
        </div>
      </section>
      {isLoaded && onboardingActive && (
        <section className="onboarding" aria-label="Museboard welcome tour">
          <div className="onboarding-mark">✳</div>
          <div className="onboarding-grid" aria-hidden="true" />
          <div
            className="onboarding-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
          >
            {onboardingStep === 0 ? (
              <form className="name-form" onSubmit={startOnboarding}>
                <p className="section-kicker">Welcome to Museboard</p>
                <h2 id="onboarding-title">What should we call you?</h2>
                <p className="onboarding-copy">
                  This is a small, private corner for your ideas. Your name stays in this browser.
                </p>
                <label htmlFor="name">Your name</label>
                <input
                  autoFocus
                  id="name"
                  maxLength={40}
                  onChange={(event) => setNameDraft(event.target.value)}
                  placeholder="e.g. Ada"
                  value={nameDraft}
                />
                <button className="onboarding-button" type="submit">
                  Begin gently <span>↗</span>
                </button>
              </form>
            ) : (
              <div className="tour-card">
                <div className="tour-progress">
                  <span>{String(onboardingStep).padStart(2, "0")} / 03</span>
                  <div className="tour-track">
                    <span style={{ width: `${(onboardingStep / tourSteps.length) * 100}%` }} />
                  </div>
                </div>
                <p className="section-kicker">{activeTourStep.eyebrow}</p>
                <h2 id="onboarding-title">{activeTourStep.title}</h2>
                <p className="onboarding-copy">{activeTourStep.copy}</p>
                <div className="tour-actions">
                  <button
                    className="text-button"
                    onClick={() => setOnboardingActive(false)}
                    type="button"
                  >
                    Skip tour
                  </button>
                  <button className="onboarding-button" onClick={advanceOnboarding} type="button">
                    {onboardingStep === tourSteps.length ? "Open my space" : "Next"} <span>↗</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <p className="onboarding-note">Everything here is saved only on this device.</p>
        </section>
      )}
    </main>
  );
}
