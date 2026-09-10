/* ============================================================
   CAMPUSLINK — Main Application
   Route registration, app shell rendering, and initialization.
   ============================================================ */

const App = (() => {

  // Render the authenticated app shell (sidebar + topbar + main)
  function renderShell() {
    const app = document.getElementById('app');
    app.innerHTML = `
      ${Sidebar.render()}
      <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
      <div class="main-content">
        ${Topbar.render()}
        <main id="main" class="page">
          <div class="empty-state">
            <div class="empty-state-icon animate-pulse">⏳</div>
            <div class="empty-state-title">Loading...</div>
          </div>
        </main>
      </div>
    `;
    app.className = 'app-layout';

    // Attach component events
    Sidebar.attachEvents();
    Topbar.attachEvents();

    // Backdrop click closes sidebar
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.remove('open');
      });
    }
  }

  // Create an authenticated page renderer
  function authPage(renderFn) {
    return async () => {
      const currentRole = Store.getRole();
      const sidebarRole = document.getElementById('sidebar')?.dataset?.role;
      // Re-render shell if not present or if role changed
      if (!document.getElementById('main') || !document.querySelector('.app-layout') || sidebarRole !== currentRole) {
        renderShell();
      }
      // Update sidebar active state
      const currentRoute = Router.current();
      document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.route === currentRoute);
      });
      // Update topbar breadcrumb
      const crumb = document.querySelector('.topbar-breadcrumb span');
      if (crumb && currentRoute) {
        crumb.textContent = '/ ' + currentRoute.split('/').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
      }
      // Render page content
      await renderFn();
    };
  }

  // Register all routes
  function registerRoutes() {
    // Public routes
    Router.register('landing', LandingPage.render);
    Router.register('login', LoginPage.render);
    Router.register('register', RegisterPage.render);

    // Student routes
    Router.register('student/dashboard', authPage(StudentDashboard.render), { auth: true });
    Router.register('student/profile', authPage(StudentProfile.render), { auth: true });
    Router.register('student/readiness', authPage(StudentReadiness.render), { auth: true });
    Router.register('student/skill-gap', authPage(StudentSkillGap.render), { auth: true });
    Router.register('student/jobs', authPage(StudentJobs.render), { auth: true });
    Router.register('student/applications', authPage(StudentApplications.render), { auth: true });
    Router.register('student/resume', authPage(StudentResume.render), { auth: true });
    Router.register('student/interview', authPage(StudentInterview.render), { auth: true });
    Router.register('student/roadmap', authPage(StudentRoadmap.render), { auth: true });

    // Admin routes
    Router.register('admin/dashboard', authPage(AdminDashboard.render), { auth: true });
    Router.register('admin/students', authPage(AdminStudents.render), { auth: true });
    Router.register('admin/companies', authPage(AdminCompanies.render), { auth: true });
    Router.register('admin/drives', authPage(AdminDrives.render), { auth: true });
    Router.register('admin/scheduler', authPage(AdminScheduler.render), { auth: true });
    Router.register('admin/analytics', authPage(AdminAnalytics.render), { auth: true });
    Router.register('admin/interventions', authPage(AdminInterventions.render), { auth: true });

    // Recruiter routes
    Router.register('recruiter/dashboard', authPage(RecruiterDashboard.render), { auth: true });
    Router.register('recruiter/jobs', authPage(RecruiterJobs.render), { auth: true });
    Router.register('recruiter/matches', authPage(RecruiterMatches.render), { auth: true });
    Router.register('recruiter/pipeline', authPage(RecruiterPipeline.render), { auth: true });

    // Mentor routes
    Router.register('mentor/dashboard', authPage(MentorDashboard.render), { auth: true });
    Router.register('mentor/students', authPage(MentorStudents.render), { auth: true });
    Router.register('mentor/roadmaps', authPage(MentorRoadmaps.render), { auth: true });

    // 404 handler
    Router.onNotFound((path) => {
      if (Store.isAuthenticated()) {
        Router.navigate(Store.getRole() + '/dashboard');
      } else {
        Router.navigate('landing');
      }
    });
  }

  // Initialize the application
  function init() {
    registerRoutes();

    // Listen for role changes to re-render shell
    Store.subscribe('role', () => {
      if (Store.isAuthenticated()) {
        renderShell();
      }
    });

    // Start router
    Router.init();

    console.log('%c CAMPUSLINK ', 'background:#3b82f6;color:#fff;font-weight:800;font-size:14px;padding:4px 8px;border-radius:4px', 'AI-Powered Placement Intelligence Platform');
  }

  return { init, renderShell };
})();

// Boot the application
document.addEventListener('DOMContentLoaded', () => App.init());
