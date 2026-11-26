const toggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
document.getElementById('year').textContent = new Date().getFullYear();
// ========================================
// Load Projects from Spring Boot API
// ========================================

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, function (char) {
        const replacements = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return replacements[char];
    });
}

function getSafeURL(value) {
    try {
        const url = new URL(value);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
            return url.href;
        }
    } catch (error) {
        return '';
    }
}

async function loadProjects() {

    const projectsContainer = document.getElementById('projects-container');

    if (!projectsContainer) {
        return;
    }

    // Fallback projects: displayed whenever the backend is unavailable
    const fallbackProjects = [
        {
            title: 'Explore India - AEM Tourism Website',
            description: 'A tourism website developed as an Adobe Experience Manager learning project. It includes reusable components, page templates, content authoring, and custom component development to showcase Indian travel destinations.',
            technologies: 'Adobe Experience Manager 6.5, Java, HTL, Sling Models, OSGi, JCR, Maven',
            projectUrl: '',
            imageUrl: ''
        },
        {
            title: 'Distributed Task Scheduling Engine',
            description: 'Designed a distributed scheduler capable of executing scheduled jobs with retry mechanisms and fault-tolerant execution. Improved task execution throughput by approximately 40% using asynchronous processing and concurrent worker threads. Implemented distributed locking and job prioritization to prevent duplicate execution across multiple application instances. Built monitoring dashboards for job execution status, failures, and execution latency.',
            technologies: 'Java, Spring Boot, Redis, MySQL',
            projectUrl: '',
            imageUrl: ''
        },
        {
            title: 'API Rate Limiter & Authentication Gateway',
            description: 'Developed a centralized API gateway supporting JWT authentication, request validation, and role-based authorization. Implemented token bucket rate-limiting algorithms using Redis to efficiently manage high request volumes. Reduced unauthorized requests by enforcing secure authentication and centralized access policies. Designed reusable middleware components to simplify API security across multiple backend services.',
            technologies: 'Java, Spring Boot, Redis',
            projectUrl: '',
            imageUrl: ''
        }
    ];

    let projects = fallbackProjects;

    // Try to load projects from the backend
    try {

        const response = await fetch('http://localhost:8080/api/projects');

        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        const apiProjects = await response.json();

        // Use API projects only if the API returns actual projects
        if (Array.isArray(apiProjects) && apiProjects.length > 0) {
            projects = apiProjects;
        }

    } catch (error) {

        console.warn('Backend unavailable. Showing fallback projects:', error);
    }

    // Render the projects
    projectsContainer.innerHTML = projects.map(project => {

        const technologies = (project.technologies || '')
            .split(',')
            .map(tech => tech.trim())
            .filter(tech => tech !== '');

        const safeProjectURL = getSafeURL(project.projectUrl);
        const safeImageURL = getSafeURL(project.imageUrl);

        const projectLink = safeProjectURL
            ? `<a href="${escapeHTML(safeProjectURL)}" target="_blank" rel="noopener noreferrer" class="text-link">View Project ↗</a>`
            : '';

        const projectImage = safeImageURL
            ? `<img src="${escapeHTML(safeImageURL)}" alt="${escapeHTML(project.title)}" class="project-image">`
            : `
                <div class="project-art">
                    <span class="art-label">PROJECT PREVIEW</span>

                    <div class="browser-frame">
                        <div class="browser-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>

                        <div class="browser-lines">
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>

                        <div class="browser-blocks">
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                `;

        return `
            <article class="project-card reveal">

                ${projectImage}

                <div class="project-info">

                    <h3>${escapeHTML(project.title)}</h3>

                    <p>${escapeHTML(project.description)}</p>

                    <div class="chips">
                        ${technologies.map(tech =>
                            `<span class="chip">${escapeHTML(tech)}</span>`
                        ).join('')}
                    </div>

                    <div class="project-meta">
                        ${projectLink}
                    </div>

                </div>

            </article>
        `;

    }).join('');

    // Make dynamically-created cards visible
    projectsContainer.querySelectorAll('.reveal').forEach(card => {
        card.classList.add('visible');
    });
}

// Run when the page loads
loadProjects();