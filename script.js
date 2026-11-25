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

    try {

        const response = await fetch('http://localhost:8080/api/projects');

        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        const projects = await response.json();

        if (projects.length === 0) {
            projectsContainer.innerHTML =
                '<p class="small-note">No projects available yet.</p>';
            return;
        }

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

        // Make the dynamically-created cards visible
        projectsContainer.querySelectorAll('.reveal').forEach(card => {
            card.classList.add('visible');
        });

    } catch (error) {

        console.error('Error loading projects:', error);

        projectsContainer.innerHTML =
            '<p class="small-note">Unable to load projects. Please try again later.</p>';
    }
}

// Run when the page loads
loadProjects();