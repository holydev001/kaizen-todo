"use client";

import { useEffect, useMemo, useState } from "react";

type TaskCategory = "Today" | "This week" | "Someday";
type Filter = "all" | "priority" | "open" | "done";
type View = "Home" | "Planner" | "History" | "Settings";

type Task = {
  id: number;
  title: string;
  notes: string;
  category: TaskCategory;
  done: boolean;
  starred: boolean;
};
type Profile = { name: string; avatarUrl?: string };
type Preferences = { activeView: View; dark: boolean };

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
const categories: TaskCategory[] = ["Today", "This week", "Someday"];
const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All tasks" },
  { value: "priority", label: "Priority" },
  { value: "open", label: "To do" },
  { value: "done", label: "Done" },
];
const tourSteps = [
  {
    eyebrow: "First, catch the spark",
    title: "A thought is enough to begin.",
    copy: "Use the open line in your workspace to catch an idea before it disappears. You can shape it later.",
  },
  {
    eyebrow: "Then, open the full story",
    title: "Details have their own place.",
    copy: "Open any task when you need its notes, timeframe, or editing tools. Your main workspace stays calm and easy to scan.",
  },
  {
    eyebrow: "Finally, protect your rhythm",
    title: "Make the space work your way.",
    copy: "Your progress, tasks, notes, and name stay in this browser. Switch themes whenever you need a quieter view.",
  },
];

function formatToday() {
  return new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(
    new Date(),
  );
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(starterTasks);
  const [activeView, setActiveView] = useState<View>("Home");
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [draft, setDraft] = useState("");
  const [draftCategory, setDraftCategory] = useState<TaskCategory>("Today");
  const [dark, setDark] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileNameDraft, setProfileNameDraft] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [focusTaskId, setFocusTaskId] = useState<number | null>(null);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [focusActive, setFocusActive] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [onboardingActive, setOnboardingActive] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [nameDraft, setNameDraft] = useState("");

  useEffect(() => {
    const savedTasks = window.localStorage.getItem("museboard-tasks");
    const savedProfile = window.localStorage.getItem("museboard-profile");
    const savedPreferences = window.localStorage.getItem("museboard-preferences");
    try {
      if (savedTasks) setTasks(JSON.parse(savedTasks) as Task[]);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile) as Profile;
        if (parsedProfile.name) {
          setProfile(parsedProfile);
          setProfileNameDraft(parsedProfile.name);
        }
      } else setOnboardingActive(true);
      if (savedPreferences) {
        const parsedPreferences = JSON.parse(savedPreferences) as Preferences;
        if (["Home", "Planner", "History", "Settings"].includes(parsedPreferences.activeView)) {
          setActiveView(parsedPreferences.activeView);
        }
        if (typeof parsedPreferences.dark === "boolean") setDark(parsedPreferences.dark);
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
    if (isLoaded) window.localStorage.setItem("museboard-tasks", JSON.stringify(tasks));
  }, [isLoaded, tasks]);

  useEffect(() => {
    if (!isLoaded) return;
    const preferences: Preferences = { activeView, dark };
    window.localStorage.setItem("museboard-preferences", JSON.stringify(preferences));
  }, [activeView, dark, isLoaded]);

  useEffect(() => {
    if (!focusActive || focusSeconds === 0) return;
    const timer = window.setInterval(() => setFocusSeconds((seconds) => seconds - 1), 1000);
    return () => window.clearInterval(timer);
  }, [focusActive, focusSeconds]);

  useEffect(() => {
    if (focusSeconds === 0) setFocusActive(false);
  }, [focusSeconds]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (activeFilter === "priority") return task.starred;
        if (activeFilter === "open") return !task.done;
        if (activeFilter === "done") return task.done;
        return true;
      }),
    [activeFilter, tasks],
  );
  const todayTasks = filteredTasks.filter((task) => task.category === "Today");
  const selectedTask = tasks.find((task) => task.id === selectedId) ?? null;
  const focusTask = tasks.find((task) => task.id === focusTaskId) ?? null;
  const completed = tasks.filter((task) => task.done).length;
  const openTasks = tasks.filter((task) => !task.done).length;
  const priorityTasks = tasks.filter((task) => task.starred && !task.done).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const firstName = profile?.name.trim().split(" ")[0] ?? "";
  const avatarInitial = firstName.slice(0, 1).toUpperCase() || "M";
  const activeTourStep = tourSteps[onboardingStep - 1];

  function addTask(event: React.FormEvent) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    const task: Task = {
      id: Date.now(),
      title,
      notes: "",
      category: draftCategory,
      done: false,
      starred: false,
    };
    setTasks((current) => [task, ...current]);
    setDraft("");
    setActiveView(draftCategory === "Today" ? "Home" : "Planner");
  }
  function updateTask(id: number, patch: Partial<Task>) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...patch } : task)));
  }
  function openTask(task: Task) {
    setSelectedId(task.id);
    setIsEditingTitle(false);
    setConfirmingDeleteId(null);
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
    setTasks((current) => current.filter((task) => task.id !== taskId));
    setSelectedId(null);
    setConfirmingDeleteId(null);
    setIsEditingTitle(false);
  }
  function startOnboarding(event: React.FormEvent) {
    event.preventDefault();
    const name = nameDraft.trim();
    if (!name) return;
    const nextProfile = { name };
    window.localStorage.setItem("museboard-profile", JSON.stringify(nextProfile));
    setProfile(nextProfile);
    setProfileNameDraft(name);
    setOnboardingStep(1);
  }
  function advanceOnboarding() {
    if (onboardingStep === tourSteps.length) {
      setOnboardingActive(false);
      return;
    }
    setOnboardingStep((step) => step + 1);
  }
  function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    const name = profileNameDraft.trim();
    if (!name) return;
    const nextProfile = { ...profile, name };
    window.localStorage.setItem("museboard-profile", JSON.stringify(nextProfile));
    setProfile(nextProfile);
    setProfileMessage("Saved on this device.");
  }
  function changeProfilePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 1_000_000) {
      setProfileMessage("Choose an image under 1 MB.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const avatarUrl = reader.result;
      if (typeof avatarUrl !== "string") return;
      const nextProfile = { ...profile, name: profile?.name ?? "Museboard", avatarUrl };
      window.localStorage.setItem("museboard-profile", JSON.stringify(nextProfile));
      setProfile(nextProfile);
      setProfileMessage("Photo saved on this device.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }
  function removeProfilePhoto() {
    if (!profile) return;
    const nextProfile = { name: profile.name };
    window.localStorage.setItem("museboard-profile", JSON.stringify(nextProfile));
    setProfile(nextProfile);
    setProfileMessage("Photo removed.");
  }
  function startFocusSession(task: Task) {
    setFocusTaskId(task.id);
    setFocusSeconds(25 * 60);
    setFocusActive(true);
  }
  function closeFocusSession() {
    setFocusTaskId(null);
    setFocusActive(false);
    setFocusSeconds(25 * 60);
  }
  function formatFocusTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  }

  function renderTask(task: Task) {
    return (
      <article className={task.done ? "task-row is-done" : "task-row"} key={task.id}>
        <button
          className={task.done ? "check done" : "check"}
          onClick={() => updateTask(task.id, { done: !task.done })}
          aria-label={task.done ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
          type="button"
        >
          {task.done ? "✓" : ""}
        </button>
        <div className="task-copy">
          <h3>{task.title}</h3>
          <div className="task-meta">
            <span>{task.category}</span>
            {task.starred && <span className="priority-label">Priority</span>}
          </div>
        </div>
        <button className="detail-button" onClick={() => openTask(task)} type="button">
          Open <span aria-hidden="true">↗</span>
        </button>
      </article>
    );
  }
  function renderEmpty(message: string) {
    return (
      <div className="empty-state">
        <span>⌁</span>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <main className={dark ? "app dark" : "app"}>
      <aside className={mobileNavOpen ? "sidebar mobile-open" : "sidebar"}>
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              ≋
            </span>
            <span>MUSEBOARD</span>
          </div>
          <button className="menu-cancel" onClick={() => setMobileNavOpen(false)} type="button">
            Cancel
          </button>
        </div>
        <p className="eyebrow">A creative task space</p>
        <nav className="nav-list" aria-label="Workspace sections">
          {(["Home", "Planner", "History", "Settings"] as View[]).map((view) => (
            <button
              className={activeView === view ? "nav-item active" : "nav-item"}
              key={view}
              onClick={() => {
                setActiveView(view);
                setMobileNavOpen(false);
              }}
              type="button"
            >
              <span>{view}</span>
              {view === "Home" && <span className="count">{openTasks}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="progress-label">
            <span>Weekly momentum</span>
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
            <p className="eyebrow">{formatToday()}</p>
            <h1>{firstName ? `Good to see you, ${firstName}.` : "Make room for good ideas."}</h1>
          </div>
          <div className="top-actions">
            <button
              className="mobile-menu"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
              type="button"
            >
              {mobileNavOpen ? "×" : "☰"}
            </button>
            <button
              className="icon-button"
              onClick={() => setDark((current) => !current)}
              aria-label="Toggle theme"
              type="button"
            >
              {dark ? "☼" : "☾"}
            </button>
            <button
              className="avatar avatar-button"
              onClick={() => setActiveView("Settings")}
              aria-label="Open settings"
              type="button"
            >
              {profile?.avatarUrl ? (
                <span
                  className="avatar-photo"
                  style={{ backgroundImage: `url(${profile.avatarUrl})` }}
                />
              ) : (
                avatarInitial
              )}
            </button>
          </div>
        </header>
        {activeView !== "Settings" && (
          <>
            <form className="capture-form" onSubmit={addTask}>
              <label className="sr-only" htmlFor="new-task">
                Add a new task
              </label>
              <input
                id="new-task"
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Capture something you want to make happen…"
                value={draft}
              />
              <label className="sr-only" htmlFor="task-timeframe">
                Task timeframe
              </label>
              <select
                id="task-timeframe"
                onChange={(event) => setDraftCategory(event.target.value as TaskCategory)}
                value={draftCategory}
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <button type="submit">
                Add task <span aria-hidden="true">↗</span>
              </button>
            </form>
            <div className="filter-bar" aria-label="Filter tasks">
              <span className="filter-label">Show</span>
              {filters.map((filter) => (
                <button
                  className={
                    activeFilter === filter.value ? "filter-button active" : "filter-button"
                  }
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </>
        )}
        {activeView === "Home" && (
          <>
            <section className="summary-grid" aria-label="Today at a glance">
              <div className="summary-card emphasis">
                <span className="section-kicker">Today&apos;s rhythm</span>
                <strong>{todayTasks.filter((task) => !task.done).length}</strong>
                <p>open tasks for today</p>
              </div>
              <div className="summary-card">
                <span className="section-kicker">Priority lane</span>
                <strong>{priorityTasks}</strong>
                <p>things worth protecting</p>
              </div>
              <div className="summary-card">
                <span className="section-kicker">Made progress</span>
                <strong>{progress}%</strong>
                <p>{completed} finished across your space</p>
              </div>
            </section>
            <section className="task-section" aria-labelledby="today-title">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">Today</span>
                  <h2 id="today-title">Your next small moves</h2>
                </div>
                <span className="section-note">{todayTasks.length} showing</span>
              </div>
              <div className="task-list">
                {todayTasks.length
                  ? todayTasks.map(renderTask)
                  : renderEmpty("Nothing here yet. Give one small thing a home.")}
              </div>
            </section>
          </>
        )}
        {activeView === "Planner" && (
          <section className="task-section" aria-labelledby="planner-title">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Planner</span>
                <h2 id="planner-title">Make space for what&apos;s next</h2>
              </div>
              <span className="section-note">{filteredTasks.length} showing</span>
            </div>
            <div className="planner-grid">
              {categories.map((category) => {
                const categoryTasks = filteredTasks.filter((task) => task.category === category);
                return (
                  <section
                    className="planner-column"
                    key={category}
                    aria-labelledby={`${category}-title`}
                  >
                    <h3 id={`${category}-title`}>{category}</h3>
                    <div className="task-list">
                      {categoryTasks.length ? (
                        categoryTasks.map(renderTask)
                      ) : (
                        <p className="planner-empty">A little breathing room.</p>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>
        )}
        {activeView === "History" && (
          <section className="task-section" aria-labelledby="history-title">
            <div className="section-heading">
              <div>
                <span className="section-kicker">History & horizons</span>
                <h2 id="history-title">The shape of your commitments</h2>
              </div>
            </div>
            <p className="section-intro">
              Today, this week, and someday live here as a gentle record of what you&apos;re
              carrying.
            </p>
            <div className="history-list">
              {categories.map((category) => {
                const categoryTasks = filteredTasks.filter((task) => task.category === category);
                const doneCount = categoryTasks.filter((task) => task.done).length;
                return (
                  <section className="history-row" key={category}>
                    <div>
                      <span className="section-kicker">{category}</span>
                      <h3>{categoryTasks.length} tasks</h3>
                    </div>
                    <p>{doneCount} complete</p>
                    <button onClick={() => setActiveView("Planner")} type="button">
                      View list <span aria-hidden="true">↗</span>
                    </button>
                  </section>
                );
              })}
            </div>
          </section>
        )}
        {activeView === "Settings" && (
          <section className="settings-section" aria-labelledby="settings-title">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Settings</span>
                <h2 id="settings-title">Hello, {firstName || "there"}.</h2>
              </div>
            </div>
            <form className="settings-form" onSubmit={saveProfile}>
              <section className="settings-block">
                <span className="section-kicker">Your profile</span>
                <div className="profile-editor">
                  <div className="profile-preview" aria-label="Current profile photo">
                    {profile?.avatarUrl ? (
                      <span
                        className="profile-photo"
                        style={{ backgroundImage: `url(${profile.avatarUrl})` }}
                      />
                    ) : (
                      avatarInitial
                    )}
                  </div>
                  <div className="photo-controls">
                    <label className="photo-button" htmlFor="profile-photo">
                      Choose photo
                    </label>
                    <input
                      accept="image/*"
                      className="sr-only"
                      id="profile-photo"
                      onChange={changeProfilePhoto}
                      type="file"
                    />
                    {profile?.avatarUrl && (
                      <button
                        className="text-button danger"
                        onClick={removeProfilePhoto}
                        type="button"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
                <label className="settings-label" htmlFor="profile-name">
                  Display name
                </label>
                <input
                  className="settings-input"
                  id="profile-name"
                  maxLength={40}
                  onChange={(event) => setProfileNameDraft(event.target.value)}
                  value={profileNameDraft}
                />
                <div className="settings-actions">
                  <span aria-live="polite">{profileMessage}</span>
                  <button className="save-button" type="submit">
                    Save changes
                  </button>
                </div>
              </section>
              <section className="settings-block theme-setting">
                <span className="section-kicker">Appearance</span>
                <div>
                  <h3>{dark ? "Dark theme" : "Light theme"}</h3>
                  <p>Choose the atmosphere that helps you focus.</p>
                </div>
                <button
                  className="theme-button"
                  onClick={() => setDark((current) => !current)}
                  type="button"
                >
                  Switch to {dark ? "light" : "dark"} <span aria-hidden="true">↗</span>
                </button>
              </section>
            </form>
          </section>
        )}
      </section>
      {focusTask && (
        <section className="focus-overlay" aria-label="Focus session">
          <div
            className="focus-session"
            role="dialog"
            aria-modal="true"
            aria-labelledby="focus-title"
          >
            <div className="focus-session-header">
              <span className="section-kicker">A quiet 25-minute session</span>
              <button className="close-button" onClick={closeFocusSession} type="button">
                End session ×
              </button>
            </div>
            <p className="focus-task-label">Your focus is</p>
            <h2 id="focus-title">{focusTask.title}</h2>
            <div
              className={focusSeconds === 0 ? "focus-clock complete" : "focus-clock"}
              aria-live="polite"
            >
              {focusSeconds === 0 ? "Done" : formatFocusTime(focusSeconds)}
            </div>
            <p className="focus-copy">
              {focusSeconds === 0
                ? "You held the space. Carry the feeling forward."
                : "One task. One small stretch of protected attention."}
            </p>
            <div className="focus-actions">
              {focusSeconds === 0 ? (
                <button className="complete-button" onClick={closeFocusSession} type="button">
                  Return to task
                </button>
              ) : (
                <button
                  className="complete-button"
                  onClick={() => setFocusActive((active) => !active)}
                  type="button"
                >
                  {focusActive ? "Pause session" : "Resume session"}
                </button>
              )}
              <button className="text-button" onClick={closeFocusSession} type="button">
                End early
              </button>
            </div>
          </div>
        </section>
      )}
      {selectedTask && (
        <section className="detail-overlay" aria-label="Task detail">
          <div
            className="task-detail"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-detail-title"
          >
            <header className="detail-header">
              <span className="section-kicker">Task detail</span>
              <button
                className="close-button"
                onClick={() => setSelectedId(null)}
                type="button"
                aria-label="Close task detail"
              >
                Close ×
              </button>
            </header>
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
                <div className="form-actions">
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
              <div className="detail-title-row">
                <h2 id="task-detail-title">{selectedTask.title}</h2>
                <button
                  className="text-button"
                  onClick={() => beginTitleEdit(selectedTask)}
                  type="button"
                >
                  Rename
                </button>
              </div>
            )}
            <div className="detail-controls">
              <label>
                <span>Timeframe</span>
                <select
                  onChange={(event) =>
                    updateTask(selectedTask.id, { category: event.target.value as TaskCategory })
                  }
                  value={selectedTask.category}
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <button
                className={selectedTask.starred ? "priority-toggle active" : "priority-toggle"}
                onClick={() => updateTask(selectedTask.id, { starred: !selectedTask.starred })}
                type="button"
              >
                {selectedTask.starred ? "Priority task" : "Make priority"}
              </button>
            </div>
            <label className="notes-label" htmlFor="task-notes">
              Notes
            </label>
            <textarea
              id="task-notes"
              onChange={(event) => updateTask(selectedTask.id, { notes: event.target.value })}
              placeholder="Add context, references, or the next small move…"
              value={selectedTask.notes}
            />
            <div className="detail-footer">
              <div className="detail-primary-actions">
                <button
                  className="focus-button"
                  onClick={() => startFocusSession(selectedTask)}
                  type="button"
                >
                  Focus for 25 min
                </button>
                <button
                  className={selectedTask.done ? "complete-button done" : "complete-button"}
                  onClick={() => updateTask(selectedTask.id, { done: !selectedTask.done })}
                  type="button"
                >
                  {selectedTask.done ? "Marked complete" : "Mark complete"}
                </button>
              </div>
              <div className="task-management" aria-live="polite">
                {confirmingDeleteId === selectedTask.id ? (
                  <div className="remove-confirmation">
                    <span>Remove from this device?</span>
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
                      Remove
                    </button>
                  </div>
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
            </div>
          </div>
        </section>
      )}
      {isLoaded && onboardingActive && (
        <section className="onboarding" aria-label="Museboard welcome tour">
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
                  A small, private corner for your ideas. Your name stays in this browser.
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
        </section>
      )}
    </main>
  );
}
