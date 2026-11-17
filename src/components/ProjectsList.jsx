import { useState } from 'react';
import '../App.css';
import { projects } from '../data/projects';
import { isSoundEnabled, playKeySound } from '../utils/audio';

function wrapWords(text) {
  return text.split(/(\s+)/).map((word, i) =>
    word.trim() ? <span className="word" key={i}>{word}</span> : word
  );
}

const CATEGORIES = [
  'All',
  'Backend & Distributed Systems',
  'AI & ML',
  'Full-Stack',
  'FinTech & Security',
  'HealthTech & AI',
  'Data Engineering',
  'AI & Cybersecurity'
];

function ProjectsList() {
  const [selectedCat, setSelectedCat] = useState('All');

  const filtered = selectedCat === 'All'
    ? projects
    : projects.filter((p) => p.category === selectedCat);

  const handleCatSelect = (cat) => {
    if (isSoundEnabled()) playKeySound();
    setSelectedCat(cat);
  };

  return (
    <section className="projects-list">
      <div className="projects-header-row">
        <h2>{wrapWords('Projects')}</h2>
        <span className="projects-count">[{filtered.length} found]</span>
      </div>

      {/* Category Filter Pills */}
      <div className="category-filter-bar">
        {CATEGORIES.map((cat) => {
          const count = cat === 'All'
            ? projects.length
            : projects.filter((p) => p.category === cat).length;
          const isActive = selectedCat === cat;
          return (
            <button
              key={cat}
              type="button"
              className={`cat-pill ${isActive ? 'active' : ''}`}
              onClick={() => handleCatSelect(cat)}
            >
              {cat} <span className="cat-pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      <ul className="projects-cards-grid">
        {filtered.map((project, idx) => (
          <li key={idx} className="project-card">
            <div className="project-card-header">
              <strong className="project-title">{project.title}</strong>
              <span className="project-category-tag">{project.category}</span>
            </div>

            <p className="project-desc">{project.description}</p>

            {project.tags && project.tags.length > 0 && (
              <div className="project-tags">
                {project.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="tech-tag">#{tag}</span>
                ))}
              </div>
            )}

            <div className="project-actions">
              {project.live_link && (
                <a
                  href={project.live_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-btn live"
                  onClick={() => isSoundEnabled() && playKeySound()}
                >
                  <span className="live-dot" /> Live Demo
                </a>
              )}
              {project.github_link && (
                <a
                  href={project.github_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-btn code"
                  onClick={() => isSoundEnabled() && playKeySound()}
                >
                  Code →
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ProjectsList;