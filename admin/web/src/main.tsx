import { lazy, Suspense, useEffect, useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import type { Bootstrap } from "../../shared/types";
import { api, setCsrf } from "./api";
import { Alert, Icon, Loading } from "./components";
import "./style.css";
const Dashboard = lazy(() =>
  import("./Dashboard").then((module) => ({ default: module.Dashboard })),
);
const ResourcePage = lazy(() =>
  import("./ResourcePage").then((module) => ({ default: module.ResourcePage })),
);
const Reports = lazy(() =>
  import("./Reports").then((module) => ({ default: module.Reports })),
);
const ActionForm = lazy(() =>
  import("./Actions").then((module) => ({ default: module.ActionForm })),
);

function Login({ onLogin }: { onLogin: () => Promise<void> }) {
  const [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await api("/auth/login", {
        method: "POST",
        body: { username, password },
      });
      setPassword("");
      await onLogin();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <div className="login-brand">
        <span className="brand-logo">
          <Icon name="shield" size={28} />
        </span>
        <span>
          绯雨骑士团 <small>OPERATIONS</small>
        </span>
      </div>
      <div className="login-layout">
        <section className="login-story">
          <span className="eyebrow">FYQST CONTROL CENTER</span>
          <h1>
            每一次运营，
            <br />
            都有据可循。
          </h1>
          <p>
            连接玩家、内容与数据。
            <br />
            在同一个工作台，掌握区服的每一处变化。
          </p>
          <div className="login-lines" aria-hidden="true">
            <div />
            <div />
            <div />
            <span>01 / OPERATIONS</span>
          </div>
          <div className="login-note">
            <Icon name="shield" size={18} />
            <span>账号权限 · 操作审计 · 奖励审核</span>
          </div>
        </section>
        <section className="login-card">
          <span className="eyebrow">WELCOME BACK</span>
          <h2>登录运营后台</h2>
          <p>使用现有的后台管理员账号继续</p>
          <form onSubmit={submit}>
            <label>
              管理员账号
              <input
                autoComplete="username"
                required
                maxLength={50}
                autoFocus
                placeholder="输入管理员账号"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label>
              密码
              <input
                autoComplete="current-password"
                type="password"
                required
                maxLength={256}
                placeholder="输入登录密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && <Alert>{error}</Alert>}
            <button className="button primary" disabled={busy}>
              {busy ? "正在验证…" : "登录工作台"}
              <Icon name="arrow" size={16} />
            </button>
          </form>
          <div className="login-help">
            账号由项目管理员创建。首次配置请参阅项目的后台迁移文档。
          </div>
        </section>
      </div>
      <footer>
        FYQST · 运营控制台<span>轻量传输 / 按需加载</span>
      </footer>
    </div>
  );
}
function App() {
  const [boot, setBoot] = useState<Bootstrap | null>(),
    [initialError, setInitialError] = useState(""),
    [page, setPage] = useState(location.hash.slice(1) || "dashboard"),
    [server, setServer] = useState(
      Number(localStorage.getItem("fyqst.admin.server") || 1),
    ),
    [toast, setToast] = useState(""),
    [mobile, setMobile] = useState(false);
  const load = async () => {
    try {
      const result = await api<Bootstrap>("/bootstrap");
      setCsrf(result.csrf);
      setBoot(result);
      if (
        !result.servers.some((s) => Number(s.id) === server) &&
        result.servers.length
      )
        setServer(Number(result.servers[0].id));
    } catch (e) {
      if ((e as any).status === 401) setBoot(null);
      else setInitialError((e as Error).message);
    }
  };
  useEffect(() => {
    void load();
    const expired = () => {
      setCsrf("");
      setBoot(null);
    };
    const hash = () => setPage(location.hash.slice(1) || "dashboard");
    window.addEventListener("admin:unauthorized", expired);
    window.addEventListener("hashchange", hash);
    return () => {
      window.removeEventListener("admin:unauthorized", expired);
      window.removeEventListener("hashchange", hash);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  const navigate = (target: string) => {
    location.hash = target;
    setMobile(false);
  };
  if (initialError)
    return (
      <div className="initial-error">
        <Alert>{initialError}</Alert>
        <button className="button" onClick={() => location.reload()}>
          重试连接
        </button>
      </div>
    );
  if (boot === undefined) return <Loading />;
  if (boot === null) return <Login onLogin={load} />;
  const resource = boot.resources.find((r) => r.key === page);
  const sections = [...new Set(boot.resources.map((r) => r.section))];
  const hasReports = boot.permissions.some((p) => p.startsWith("reports."));
  const compose = boot.permissions.some(
    (p) => p === "mails.compose" || p === "mails.broadcast",
  );
  const title =
    page === "dashboard"
      ? "运营概览"
      : page === "reports"
        ? "数据报表"
        : page === "compose"
          ? "撰写运营邮件"
          : resource?.title || "页面不存在";
  return (
    <div className="app-shell">
      <aside className={"sidebar " + (mobile ? "open" : "")}>
        <a className="brand" href="#dashboard">
          <span className="brand-logo">
            <Icon name="shield" size={24} />
          </span>
          <div>
            绯雨骑士团<small>运营控制台</small>
          </div>
        </a>
        <div className="workspace-label">
          WORKSPACE <span>VP000</span>
        </div>
        <nav>
          <button
            className={"nav-item " + (page === "dashboard" ? "active" : "")}
            onClick={() => navigate("dashboard")}
          >
            <Icon name="grid" />
            <span>运营概览</span>
          </button>
          {sections.map((section) => (
            <div className="nav-section" key={section}>
              <div className="nav-section-label">{section}</div>
              {boot.resources
                .filter((r) => r.section === section)
                .map((r) => (
                  <button
                    key={r.key}
                    className={"nav-item " + (page === r.key ? "active" : "")}
                    onClick={() => navigate(r.key)}
                  >
                    <Icon
                      size={18}
                      name={
                        section === "玩家与社区"
                          ? "users"
                          : section === "内容与奖励"
                            ? "mail"
                            : section === "数据与报表"
                              ? "chart"
                              : "book"
                      }
                    />
                    <span>{r.title}</span>
                    {page === r.key && <i />}
                  </button>
                ))}
            </div>
          ))}
          {(hasReports || compose) && (
            <div className="nav-section">
              <div className="nav-section-label">工作工具</div>
              {compose && (
                <button
                  className={"nav-item " + (page === "compose" ? "active" : "")}
                  onClick={() => navigate("compose")}
                >
                  <Icon name="mail" size={18} />
                  撰写邮件
                </button>
              )}
              {hasReports && (
                <button
                  className={"nav-item " + (page === "reports" ? "active" : "")}
                  onClick={() => navigate("reports")}
                >
                  <Icon name="chart" size={18} />
                  数据报表
                </button>
              )}
            </div>
          )}
        </nav>
        <div className="sidebar-footer">
          <span className="live-dot" />
          Bun + TypeScript<span>WSL</span>
        </div>
      </aside>
      {mobile && (
        <div className="sidebar-backdrop" onClick={() => setMobile(false)} />
      )}
      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-button mobile-toggle"
            onClick={() => setMobile((v) => !v)}
            aria-label="展开菜单"
          >
            <Icon name="menu" />
          </button>
          <div className="breadcrumb">
            工作空间 <span>/</span> <strong>{title}</strong>
          </div>
          <div className="topbar-actions">
            <label className="server-picker">
              <span className="live-dot" />
              <select
                aria-label="选择区服"
                value={server}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setServer(id);
                  localStorage.setItem("fyqst.admin.server", String(id));
                }}
              >
                {boot.servers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.area}
                  </option>
                ))}
              </select>
            </label>
            <div className="user-avatar">
              {boot.user.displayName.slice(0, 1)}
            </div>
            <div className="user-label">
              <strong>{boot.user.displayName}</strong>
              <span>{boot.user.group}</span>
            </div>
            <button
              className="icon-button"
              aria-label="退出登录"
              onClick={async () => {
                try {
                  await api("/auth/logout", { method: "POST" });
                  setBoot(null);
                  setCsrf("");
                } catch (e) {
                  setToast((e as Error).message);
                }
              }}
            >
              <Icon name="logout" size={18} />
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {resource?.section || "FYQST OPERATIONS"}
              </div>
              <h1>{title}</h1>
              <p>
                {resource?.description ||
                  (page === "reports"
                    ? "按区服和日期查询真实业务数据，导出当前页结果。"
                    : page === "compose"
                      ? "通知与奖励统一提交审核，确认后由后台投递。"
                      : "所有运营工作，在此有序进行。")}
              </p>
            </div>
            <span className="page-date">
              {new Date().toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <Suspense fallback={<Loading />}>
            {page === "dashboard" ? (
              <Dashboard boot={boot} server={server} navigate={navigate} />
            ) : page === "reports" && hasReports ? (
              <Reports boot={boot} server={server} />
            ) : page === "compose" && compose ? (
              <section className="panel compose-panel">
                <ActionForm
                  kind="mail-compose"
                  boot={boot}
                  server={server}
                  onDone={setToast}
                />
              </section>
            ) : resource ? (
              <ResourcePage
                key={page + "-" + server}
                resource={resource}
                boot={boot}
                server={server}
                notify={setToast}
              />
            ) : (
              <Alert>页面不存在，或当前账号没有此页面的权限。</Alert>
            )}
          </Suspense>
          <footer className="page-footer">
            <span>FYQST 运营控制台</span>
            <span>按需读取 · 音频零传输</span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          {toast}
          <button
            aria-label="关闭提示"
            className="icon-button"
            onClick={() => setToast("")}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
