// ============================================================
// Global Application State
// ============================================================
const state = {
    selectedFile: null,
    apiResult: null,
    scoreHistory: [],
    roadmapCompleted: new Set(),
    totalRoadmapItems: 0,
    tipIndex: 0,
};

// ============================================================
// Pro Tips Rotation
// ============================================================
const proTips = [
    "Use action verbs like \"Led\", \"Architected\", and \"Delivered\" to strengthen your bullet points.",
    "Tailor your resume for every application — generic resumes score 30% lower on ATS.",
    "Quantify achievements: numbers (%, $, x faster) dramatically increase recruiter interest.",
    "Include exact keywords from the job description — ATS systems match terms literally.",
    "Keep formatting simple: avoid tables, text boxes, and headers/footers in your resume.",
    "A one-page resume is ideal for < 10 years experience; two pages for senior roles.",
    "Put your most relevant skills within the first third of your resume for maximum ATS weight.",
    "Spell out acronyms at least once: \"Machine Learning (ML)\" catches both variations.",
    "Include LinkedIn URL and GitHub (if applicable) — recruiters check these within 90 seconds.",
    "Remove objective statements — replace with a 3-line professional summary instead.",
];

// ============================================================
// Mock Demo Data
// ============================================================
const demoData = {
    match_score: 87,
    rating: "Strong Match",
    summary: "The candidate exhibits a highly aligned technical profile for a Senior Full-Stack Engineer, showcasing robust experience in Javascript/Typescript frameworks and microservices. The core alignment gaps are primarily surrounding cloud architectures (AWS/GCP orchestration) and specific modern CI/CD automation practices.",
    category_scores: [
        { category: "Skills Alignment", score: 92, feedback: "Excellent coverage of primary technical stack keywords, including React, Node.js, and TypeScript." },
        { category: "Experience Relevance", score: 85, feedback: "Strong record of designing scalable backends and complex interactive dashboard architectures." },
        { category: "Formatting & Structure", score: 95, feedback: "Chronological order is clear, sections are structured cleanly, and typography hierarchy is pristine." },
        { category: "Education & Certifications", score: 75, feedback: "Possesses a Bachelor of Science in Computer Science, but lacks specific cloud architecture credentials." }
    ],
    strengths: [
        "Advanced proficiency in React, TypeScript, Node.js, and SQL databases.",
        "Demonstrated experience leading feature development for systems handling high concurrent traffic.",
        "Clean, professional resume presentation with high keyword readability."
    ],
    gaps: [
        "No mention of Docker, Kubernetes, or containerization tools.",
        "Lacks detailed examples of CI/CD pipeline ownership (e.g., GitHub Actions, Jenkins).",
        "Limited metrics showing quantifiable scale (e.g., percentage improvements in performance)."
    ],
    recommendations: [
        "Integrate containerization skills (Docker/Kubernetes) in a dedicated technical skills grid.",
        "Quantify professional milestones with specific growth percentages, page-speed benchmarks, or server latency reductions.",
        "Refine work history bullet points to focus on ownership of the deployment pipeline alongside codebase development."
    ],
    keywords: [
        { keyword: "React",      present: true,  importance: "high" },
        { keyword: "Node.js",    present: true,  importance: "high" },
        { keyword: "TypeScript", present: true,  importance: "high" },
        { keyword: "SQL",        present: true,  importance: "medium" },
        { keyword: "REST APIs",  present: true,  importance: "medium" },
        { keyword: "Docker",     present: false, importance: "high" },
        { keyword: "AWS",        present: false, importance: "high" },
        { keyword: "CI/CD",      present: false, importance: "medium" },
        { keyword: "Kubernetes", present: false, importance: "low" },
        { keyword: "GraphQL",    present: true,  importance: "low" }
    ],
    bullet_improvements: [
        {
            original: "Built APIs in Node.js and worked on the React frontend dashboard.",
            improved: "Architected scalable Node.js REST APIs reducing server response times by 32%, and engineered responsive React dashboards handling 50k+ daily active users.",
            reason: "Added measurable performance metrics, action verbs (Architected, Engineered), and clarified scale of engagement."
        },
        {
            original: "Responsible for deployments and fixing database bugs.",
            improved: "Automated deployment processes and optimized SQL query execution, resulting in 40% faster staging releases and a 15% reduction in production database bugs.",
            reason: "Swapped weak responsibility descriptions with proactive verb phrases and quantified optimization outcomes."
        },
        {
            original: "Collaborated with engineers and designers to build products.",
            improved: "Partnered with cross-functional teams of 8+ engineers and designers to scope, develop, and deliver high-impact web products on time.",
            reason: "Quantified team size to showcase project scope and highlighted lifecycle ownership (delivered on time)."
        }
    ]
};

// ============================================================
// DOM Ready
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

    /* ---- Panel & Nav references ---- */
    const navWorkspaceBtn  = document.getElementById("nav-workspace-btn");
    const navTailorBtn     = document.getElementById("nav-tailor-btn");
    const navHistoryBtn    = document.getElementById("nav-history-btn");
    const navHelpBtn       = document.getElementById("nav-help-btn");
    const returnWorkspaceBtn = document.getElementById("return-workspace-btn");
    const backToInputBtn   = document.getElementById("back-to-input-btn");

    const inputPanel   = document.getElementById("input-panel");
    const loadingPanel = document.getElementById("loading-panel");
    const resultsPanel = document.getElementById("results-panel");
    const historyPanel = document.getElementById("history-panel");
    const helpPanel    = document.getElementById("help-panel");
    const tailorPanel  = document.getElementById("tailor-panel");
    const panels = [inputPanel, loadingPanel, resultsPanel, historyPanel, helpPanel, tailorPanel];

    /* ---- File Upload ---- */
    const dropZone       = document.getElementById("drop-zone");
    const resumeFileInput = document.getElementById("resume-file");
    const fileDetails    = document.getElementById("file-details");
    const fileNameEl     = document.getElementById("file-name");
    const fileSizeEl     = document.getElementById("file-size");
    const removeFileBtn  = document.getElementById("remove-file-btn");

    /* ---- Tailor File Upload & Form ---- */
    let tailorSelectedFile = null;
    const tailorDropZone       = document.getElementById("tailor-drop-zone");
    const tailorResumeFileInput = document.getElementById("tailor-resume-file");
    const tailorFileDetails    = document.getElementById("tailor-file-details");
    const tailorFileNameEl     = document.getElementById("tailor-file-name");
    const tailorFileSizeEl     = document.getElementById("tailor-file-size");
    const tailorRemoveFileBtn  = document.getElementById("tailor-remove-file-btn");
    const tailorJdTextarea     = document.getElementById("tailor-jd-text");
    const tailorJdCharCount    = document.getElementById("tailor-jd-char-count");
    const tailorBtn            = document.getElementById("tailor-btn");
    const tailorCoverLetterBtn = document.getElementById("tailor-cover-letter-btn");
    const tailorResultSection  = document.getElementById("tailor-result-section");
    const tailorResultText     = document.getElementById("tailor-result-text");
    const tailorResultTitle    = document.getElementById("tailor-result-title");
    const tailorCopyBtn        = document.getElementById("tailor-copy-btn");
    const tailorDownloadPdfBtn = document.getElementById("tailor-download-pdf-btn");

    /* ---- Form ---- */
    const jdTextarea   = document.getElementById("jd-text");
    const jdCharCount  = document.getElementById("jd-char-count");
    const analyzeBtn   = document.getElementById("analyze-btn");
    const loadDemoBtn  = document.getElementById("load-demo-btn");

    /* ---- Results ---- */
    const resMatchScore        = document.getElementById("res-match-score");
    const resRatingBadge       = document.getElementById("res-rating-badge");
    const resSummary           = document.getElementById("res-summary");
    const categoryScoresList   = document.getElementById("category-scores-list");
    const resStrengths         = document.getElementById("res-strengths");
    const resGaps              = document.getElementById("res-gaps");
    const resMatchingKeywords  = document.getElementById("res-matching-keywords");
    const resMissingKeywords   = document.getElementById("res-missing-keywords");
    const resBulletImprovements = document.getElementById("res-bullet-improvements");
    const resRecommendations   = document.getElementById("res-recommendations");
    const printPdfBtn          = document.getElementById("print-pdf-btn");

    /* ---- Improve banner ---- */
    const improveBanner       = document.getElementById("improve-banner");
    const improveBannerText   = document.getElementById("improve-banner-text");
    const goToActionStepsBtn  = document.getElementById("go-to-action-steps-btn");
    const dismissBannerBtn    = document.getElementById("dismiss-banner-btn");

    /* ---- Error banner ---- */
    const extractionErrorBanner = document.getElementById("extraction-error-banner");
    const dismissErrorBtn       = document.getElementById("dismiss-error-btn");
    if (dismissErrorBtn && extractionErrorBanner) {
        dismissErrorBtn.addEventListener("click", () => {
            extractionErrorBanner.style.display = "none";
        });
    }

    /* ---- Mini stats ---- */
    const statKeywordsMatch   = document.getElementById("stat-keywords-match");
    const statKeywordsMissing = document.getElementById("stat-keywords-missing");
    const statRewrites        = document.getElementById("stat-rewrites");

    /* ---- Roadmap progress ---- */
    const roadmapProgressFill  = document.getElementById("roadmap-progress-fill");
    const roadmapProgressCount = document.getElementById("roadmap-progress-count");

    /* ---- History ---- */
    const scoreHistoryList  = document.getElementById("score-history-list");
    const historyEmptyState = document.getElementById("history-empty-state");

    /* ---- Sidebar stats ---- */
    const statAnalyses  = document.getElementById("stat-analyses");
    const statBestScore = document.getElementById("stat-best-score");
    const statAvgScore  = document.getElementById("stat-avg-score");

    /* ---- Log Console ---- */
    const logConsole  = document.getElementById("log-console");
    const systemStatus = document.getElementById("system-status");

    /* ---- Tips ticker ---- */
    const tipsText = document.getElementById("tips-text");

    // Initialize
    let activeNavTab = navWorkspaceBtn;
    startTipsTicker();

    /* ============================================================
       View Navigation Logic
       ============================================================ */
    function showPanel(targetPanel) {
        panels.forEach(p => p.classList.remove("active"));
        targetPanel.classList.add("active");
        document.querySelector(".main-content").scrollTop = 0;
    }

    function setActiveNav(navBtn) {
        if (activeNavTab) activeNavTab.classList.remove("active");
        navBtn.classList.add("active");
        activeNavTab = navBtn;
    }

    navWorkspaceBtn.addEventListener("click", () => {
        setActiveNav(navWorkspaceBtn);
        if (state.apiResult) {
            showPanel(resultsPanel);
        } else {
            showPanel(inputPanel);
        }
    });

    navTailorBtn.addEventListener("click", () => {
        setActiveNav(navTailorBtn);
        showPanel(tailorPanel);
    });

    navHistoryBtn.addEventListener("click", () => {
        setActiveNav(navHistoryBtn);
        showPanel(historyPanel);
    });

    navHelpBtn.addEventListener("click", () => {
        setActiveNav(navHelpBtn);
        showPanel(helpPanel);
    });

    returnWorkspaceBtn.addEventListener("click", () => {
        setActiveNav(navWorkspaceBtn);
        showPanel(inputPanel);
    });

    backToInputBtn.addEventListener("click", () => {
        state.apiResult = null;
        setActiveNav(navWorkspaceBtn);
        showPanel(inputPanel);
    });

    /* ============================================================
       Tips Ticker
       ============================================================ */
    function startTipsTicker() {
        setInterval(() => {
            state.tipIndex = (state.tipIndex + 1) % proTips.length;
            // Remove animation class, force reflow, re-add to retrigger keyframe
            tipsText.classList.remove('tip-animate');
            void tipsText.offsetHeight; // force reflow
            tipsText.textContent = proTips[state.tipIndex];
            tipsText.classList.add('tip-animate');
        }, 6000);
    }

    /* ============================================================
       Drag & Drop File Upload
       ============================================================ */
    dropZone.addEventListener("click", () => resumeFileInput.click());

    ["dragenter", "dragover"].forEach(ev => {
        dropZone.addEventListener(ev, (e) => {
            e.preventDefault(); e.stopPropagation();
            dropZone.classList.add("dragover");
        }, false);
    });

    ["dragleave", "drop"].forEach(ev => {
        dropZone.addEventListener(ev, (e) => {
            e.preventDefault(); e.stopPropagation();
            dropZone.classList.remove("dragover");
        }, false);
    });

    dropZone.addEventListener("drop", (e) => {
        const files = e.dataTransfer.files;
        if (files.length) handleFileSelect(files[0]);
    });

    resumeFileInput.addEventListener("change", (e) => {
        const files = e.target.files;
        if (files.length) handleFileSelect(files[0]);
    });

    function handleFileSelect(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'pdf' && ext !== 'docx') {
            alert("Format unsupported. Please upload a PDF or Microsoft Word DOCX file.");
            return;
        }
        state.selectedFile = file;
        fileNameEl.textContent = file.name;
        fileSizeEl.textContent = formatBytes(file.size);
        dropZone.style.display = "none";
        fileDetails.style.display = "flex";
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
    }

    removeFileBtn.addEventListener("click", () => {
        state.selectedFile = null;
        resumeFileInput.value = "";
        dropZone.style.display = "block";
        fileDetails.style.display = "none";
    });

    /* ============================================================
       Tailor Drag & Drop File Upload
       ============================================================ */
    tailorDropZone.addEventListener("click", () => tailorResumeFileInput.click());

    ["dragenter", "dragover"].forEach(ev => {
        tailorDropZone.addEventListener(ev, (e) => {
            e.preventDefault(); e.stopPropagation();
            tailorDropZone.classList.add("dragover");
        }, false);
    });

    ["dragleave", "drop"].forEach(ev => {
        tailorDropZone.addEventListener(ev, (e) => {
            e.preventDefault(); e.stopPropagation();
            tailorDropZone.classList.remove("dragover");
        }, false);
    });

    tailorDropZone.addEventListener("drop", (e) => {
        const files = e.dataTransfer.files;
        if (files.length) handleTailorFileSelect(files[0]);
    });

    tailorResumeFileInput.addEventListener("change", (e) => {
        const files = e.target.files;
        if (files.length) handleTailorFileSelect(files[0]);
    });

    function handleTailorFileSelect(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'pdf' && ext !== 'docx') {
            alert("Format unsupported. Please upload a PDF or Microsoft Word DOCX file.");
            return;
        }
        tailorSelectedFile = file;
        tailorFileNameEl.textContent = file.name;
        tailorFileSizeEl.textContent = formatBytes(file.size);
        tailorDropZone.style.display = "none";
        tailorFileDetails.style.display = "flex";
    }

    tailorRemoveFileBtn.addEventListener("click", () => {
        tailorSelectedFile = null;
        tailorResumeFileInput.value = "";
        tailorDropZone.style.display = "block";
        tailorFileDetails.style.display = "none";
    });

    tailorJdTextarea.addEventListener("input", () => {
        const count = tailorJdTextarea.value.length;
        tailorJdCharCount.textContent = `${count.toLocaleString()} character${count !== 1 ? 's' : ''}`;
    });

    /* ============================================================
       JD Character Counter
       ============================================================ */
    jdTextarea.addEventListener("input", () => {
        const count = jdTextarea.value.length;
        jdCharCount.textContent = `${count.toLocaleString()} character${count !== 1 ? 's' : ''}`;
    });

    /* ============================================================
       Terminal Logger
       ============================================================ */
    function clearLogs() { logConsole.innerHTML = ""; }

    function writeLog(text, delay = 0) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const line = document.createElement("p");
                line.className = "log-line";
                line.textContent = `> ${text}`;
                logConsole.appendChild(line);
                logConsole.scrollTop = logConsole.scrollHeight;
                resolve();
            }, delay);
        });
    }

    async function runSimulatedLoading(fileName) {
        clearLogs();
        await writeLog("Initializing secure optimization engine...", 100);
        await writeLog(`Reading document structure: ${fileName}`, 400);
        await writeLog("Verifying text extraction integrity indices...", 400);
        await writeLog("Isolating character streams and metadata payload...", 400);
        await writeLog("Compressing buffer array and routing connection...", 300);
        await writeLog("Opening pipeline context to Google Gemini AI API...", 500);
        await writeLog("Uploading matching parameters and job specifications...", 600);
        await writeLog("Evaluating core syntax matrix and semantics...", 800);
        await writeLog("Scoring qualifications alignment ratio...", 800);
        await writeLog("Identifying missing semantic keyword clusters...", 700);
        await writeLog("Generating tailored experience recommendations...", 700);
        await writeLog("Validating response schema matching...", 400);
        await writeLog("Synthesizing dashboard widgets... complete.", 300);
    }

    /* ============================================================
       Animated Counter Helper
       ============================================================ */
    function animateCounter(el, targetValue, duration = 1200) {
        const start = 0;
        const startTime = performance.now();
        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
            el.textContent = Math.round(start + (targetValue - start) * ease);
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    /* ============================================================
       Sidebar Stats Update
       ============================================================ */
    function updateSidebarStats() {
        const count = state.scoreHistory.length;
        statAnalyses.textContent = count;
        if (count === 0) {
            statBestScore.textContent = "—";
            statAvgScore.textContent = "—";
        } else {
            const scores = state.scoreHistory.map(h => h.score);
            statBestScore.textContent = Math.max(...scores) + "%";
            const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            statAvgScore.textContent = avg + "%";
        }
    }

    /* ============================================================
       Score History Panel
       ============================================================ */
    function addToHistory(data, fileName) {
        const entry = {
            score: data.match_score,
            rating: data.rating,
            fileName: fileName || "Resume",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        state.scoreHistory.unshift(entry);
        renderHistory();
        updateSidebarStats();
    }

    function renderHistory() {
        // Always remove existing history items first
        const existingItems = scoreHistoryList.querySelectorAll(".score-history-item");
        existingItems.forEach(el => el.remove());

        if (state.scoreHistory.length === 0) {
            historyEmptyState.style.display = "block";
            return;
        }
        historyEmptyState.style.display = "none";

        state.scoreHistory.forEach(entry => {
            const tier = entry.score >= 80 ? "hs-high" : entry.score >= 50 ? "hs-medium" : "hs-low";
            const ratingStyle = entry.score >= 80
                ? "color:var(--color-success);background:var(--color-success-bg);border:1px solid var(--color-success-border);padding:3px 10px;border-radius:50px;font-size:0.72rem;font-weight:700;text-transform:uppercase;"
                : entry.score >= 50
                    ? "color:var(--color-warning);background:var(--color-warning-bg);border:1px solid rgba(201,168,76,0.2);padding:3px 10px;border-radius:50px;font-size:0.72rem;font-weight:700;text-transform:uppercase;"
                    : "color:var(--color-error);background:var(--color-error-bg);border:1px solid var(--color-error-border);padding:3px 10px;border-radius:50px;font-size:0.72rem;font-weight:700;text-transform:uppercase;";

            const item = document.createElement("div");
            item.className = "score-history-item";
            item.innerHTML = `
                <div class="history-score-badge ${tier}">${entry.score}%</div>
                <div class="history-meta">
                    <h5>${entry.fileName}</h5>
                    <p>Analyzed at ${entry.timestamp}</p>
                </div>
                <span style="${ratingStyle}">${entry.rating}</span>
            `;
            scoreHistoryList.appendChild(item);
        });
    }

    /* ============================================================
       Roadmap Progress Tracker
       ============================================================ */
    function updateRoadmapProgress() {
        const total = state.totalRoadmapItems;
        const done  = state.roadmapCompleted.size;
        const pct   = total > 0 ? (done / total) * 100 : 0;
        roadmapProgressFill.style.width = pct + "%";
        roadmapProgressCount.textContent = `${done} / ${total} done`;
    }

    /* ============================================================
       Improve Banner Logic
       ============================================================ */
    function updateImproveBanner(score) {
        if (score < 60) {
            // Build a more specific message based on score range
            let msg = "";
            if (score < 30) {
                msg = `Your score is very low (${score}%) — this resume is unlikely to pass ATS screening. Follow the Action Steps below and apply the AI tailoring suggestions to make significant improvements.`;
            } else {
                msg = `Your score is ${score}% — just below the recommended 60% threshold. Apply the AI suggestions in the Action Steps tab to push past the ATS cutoff and reach recruiters.`;
            }
            improveBannerText.textContent = msg;
            improveBanner.classList.add("visible");
        } else {
            improveBanner.classList.remove("visible");
        }
    }

    goToActionStepsBtn.addEventListener("click", () => {
        // Switch to Action Steps tab
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        const improvementsTabBtn = document.querySelector('[data-tab="tab-improvements"]');
        if (improvementsTabBtn) {
            improvementsTabBtn.classList.add("active");
            document.getElementById("tab-improvements").classList.add("active");
        }
        // Scroll the main-content container (not document root) to the tabs
        const mainContent = document.querySelector(".main-content");
        const tabsContainer = document.querySelector(".tabs-container");
        if (mainContent && tabsContainer) {
            const offset = tabsContainer.offsetTop - mainContent.offsetTop - 20;
            mainContent.scrollTo({ top: offset, behavior: "smooth" });
        }
    });

    dismissBannerBtn.addEventListener("click", () => {
        improveBanner.classList.remove("visible");
    });

    /* ============================================================
       Data Binding & Dynamic Dashboard Rendering
       ============================================================ */
    function renderDashboard(data, fileName) {
        state.apiResult = data;
        state.roadmapCompleted.clear();

        // 1. Overall Match Score & Badge
        resMatchScore.textContent = "0";
        resRatingBadge.textContent = data.rating;
        resRatingBadge.className = "rating-badge";
        if (data.match_score >= 80) {
            resRatingBadge.classList.add("rating-high");
        } else if (data.match_score >= 50) {
            resRatingBadge.classList.add("rating-medium");
        } else {
            resRatingBadge.classList.add("rating-low");
        }

        // Animate score counter
        animateCounter(resMatchScore, data.match_score, 1400);

        // SVG Radial Gauge fill animation
        const circle = document.querySelector(".progress-ring__circle");
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        const offset = circumference - (data.match_score / 100) * circumference;
        setTimeout(() => { circle.style.strokeDashoffset = offset; }, 150);

        // 2. Summary
        resSummary.textContent = data.summary;

        // 3. Category Scores
        categoryScoresList.innerHTML = "";
        data.category_scores.forEach(cat => {
            const barGroup = document.createElement("div");
            barGroup.className = "category-bar-group";
            barGroup.innerHTML = `
                <div class="category-header">
                    <span class="category-name">${cat.category}</span>
                    <span class="category-score">${cat.score}%</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <div class="category-feedback">${cat.feedback}</div>
            `;
            categoryScoresList.appendChild(barGroup);
            setTimeout(() => {
                barGroup.querySelector(".progress-fill").style.width = `${cat.score}%`;
            }, 200);
        });

        // 4. Strengths & Gaps
        resStrengths.innerHTML = "";
        data.strengths.forEach(str => {
            const li = document.createElement("li");
            li.textContent = str;
            resStrengths.appendChild(li);
        });

        resGaps.innerHTML = "";
        data.gaps.forEach(gap => {
            const li = document.createElement("li");
            li.textContent = gap;
            resGaps.appendChild(li);
        });

        // 5. Keywords (Keywords Tab)
        resMatchingKeywords.innerHTML = "";
        resMissingKeywords.innerHTML = "";

        let matchCount   = 0;
        let missingCount = 0;

        data.keywords.forEach(kw => {
            const tag = document.createElement("div");
            tag.className = `keyword-tag ${kw.present ? 'tag-match' : 'tag-missing'}`;
            tag.innerHTML = `
                ${kw.keyword}
                <span class="keyword-importance importance-${kw.importance}">${kw.importance}</span>
            `;
            if (kw.present) {
                resMatchingKeywords.appendChild(tag);
                matchCount++;
            } else {
                resMissingKeywords.appendChild(tag);
                missingCount++;
            }
        });

        if (matchCount === 0) {
            resMatchingKeywords.innerHTML = `<p class="info-text">No matching keywords found. Try refining your resume content.</p>`;
        }
        if (missingCount === 0) {
            resMissingKeywords.innerHTML = `<p class="info-text">Perfect match! No critical keywords are missing.</p>`;
        }

        // Update mini stats with animation
        setTimeout(() => animateCounter(statKeywordsMatch,   matchCount,   800), 300);
        setTimeout(() => animateCounter(statKeywordsMissing, missingCount, 800), 400);
        setTimeout(() => animateCounter(statRewrites, data.bullet_improvements.length, 800), 500);

        // 6. Bullet Point Tailoring
        resBulletImprovements.innerHTML = "";
        data.bullet_improvements.forEach((bullet, index) => {
            const card = document.createElement("div");
            card.className = "bullet-rewrite-card";
            card.innerHTML = `
                <div class="bullet-header">
                    <h4>Tailored Experience Rewrite #${index + 1}</h4>
                    <button class="btn-copy" data-text="${encodeURIComponent(bullet.improved)}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy Tailored Bullet
                    </button>
                </div>
                <div class="bullet-body">
                    <div class="comparison-row">
                        <div class="bullet-column">
                            <span class="label-original">Original Outline</span>
                            <div class="bullet-text bg-original">"${bullet.original}"</div>
                        </div>
                        <div class="bullet-column">
                            <span class="label-tailored">Optimized Metric Rewrite</span>
                            <div class="bullet-text bg-tailored">"${bullet.improved}"</div>
                        </div>
                    </div>
                    <div class="bullet-reasoning">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top:2px;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <p><strong>Recruiter Commentary:</strong> ${bullet.reason}</p>
                    </div>
                </div>
            `;
            resBulletImprovements.appendChild(card);
        });

        // Copy button logic
        resBulletImprovements.querySelectorAll(".btn-copy").forEach(btn => {
            btn.addEventListener("click", () => {
                const text = decodeURIComponent(btn.getAttribute("data-text"));
                navigator.clipboard.writeText(text).then(() => {
                    const orig = btn.innerHTML;
                    btn.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Copied!
                    `;
                    btn.style.color = "var(--color-success)";
                    setTimeout(() => {
                        btn.innerHTML = orig;
                        btn.style.color = "";
                    }, 2000);
                });
            });
        });

        // 7. Recommendations / Roadmap (with click-to-complete)
        resRecommendations.innerHTML = "";
        state.totalRoadmapItems = data.recommendations.length;

        data.recommendations.forEach((rec, index) => {
            const item = document.createElement("div");
            item.className = "roadmap-item";
            item.dataset.index = index;
            item.innerHTML = `
                <div class="roadmap-index">${index + 1}</div>
                <div class="roadmap-text roadmap-text-val">${rec}</div>
                <svg class="roadmap-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
            item.addEventListener("click", () => {
                const idx = parseInt(item.dataset.index);
                const textEl = item.querySelector('.roadmap-text-val');
                if (state.roadmapCompleted.has(idx)) {
                    state.roadmapCompleted.delete(idx);
                    item.classList.remove("completed");
                    if (textEl) textEl.style.textDecoration = '';
                    item.style.opacity = '';
                } else {
                    state.roadmapCompleted.add(idx);
                    item.classList.add("completed");
                    if (textEl) textEl.style.textDecoration = 'line-through';
                    item.style.opacity = '0.5';
                }
                updateRoadmapProgress();
            });
            resRecommendations.appendChild(item);
        });

        updateRoadmapProgress();

        // 8. Improve banner
        updateImproveBanner(data.match_score);

        // 9. Add to history
        addToHistory(data, fileName || (state.selectedFile ? state.selectedFile.name : "Demo Resume"));
    }

    /* ============================================================
       Interactive Dashboard Tabs
       ============================================================ */
    const tabButtons  = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(btn.getAttribute("data-tab")).classList.add("active");
        });
    });

    /* ============================================================
       Load Demo Action
       ============================================================ */
    loadDemoBtn.addEventListener("click", () => {
        showPanel(resultsPanel);
        renderDashboard(demoData, "demo_resume.pdf");
    });

    /* ============================================================
       Print Report
       ============================================================ */
    printPdfBtn.addEventListener("click", () => { window.print(); });

    /* ============================================================
       Analyze Resume (API Call)
       ============================================================ */
    analyzeBtn.addEventListener("click", async () => {
        if (!state.selectedFile) {
            alert("Please upload your resume file (PDF or DOCX) first.");
            return;
        }

        const jdText = jdTextarea.value.trim();
        if (!jdText) {
            alert("Please paste the target job description to match against.");
            return;
        }

        if (extractionErrorBanner) {
            extractionErrorBanner.style.display = "none";
        }

        systemStatus.textContent = "Processing Resume";
        systemStatus.className   = "badge loading";
        showPanel(loadingPanel);

        const simulatedLogsPromise = runSimulatedLoading(state.selectedFile.name);

        const formData = new FormData();
        formData.append("resume", state.selectedFile);
        formData.append("jd", jdText);

        try {
            const apiPromise = fetch("/api/analyze", {
                method: "POST",
                body: formData
            });

            const [response] = await Promise.all([apiPromise, simulatedLogsPromise]);

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Server returned an error analysis evaluation.");
            }

            const data = await response.json();
            renderDashboard(data, state.selectedFile.name);

            await writeLog("Synthesizing dashboard widgets... complete.", 100);
            setTimeout(() => {
                systemStatus.textContent = "Analysis Complete";
                systemStatus.className   = "badge";
                showPanel(resultsPanel);
            }, 1000);

        } catch (error) {
            console.error("Analysis error:", error);
            await writeLog(`CRITICAL PIPELINE EXCEPTION: ${error.message}`, 100);
            await writeLog("Halting process. Review key inputs and try again.", 200);

            systemStatus.textContent = "Analysis Failed";
            systemStatus.className   = "badge";

            setTimeout(() => {
                showPanel(inputPanel);
                const errorText = document.getElementById("extraction-error-text");
                if (extractionErrorBanner && errorText) {
                    errorText.textContent = error.message;
                    extractionErrorBanner.style.display = "flex";
                } else {
                    alert(error.message);
                }
            }, 2500);
        }
    });

    /* ============================================================
       Tailor Resume (API Call)
       ============================================================ */
    tailorBtn.addEventListener("click", async () => {
        if (!tailorSelectedFile) {
            alert("Please upload your resume file (PDF or DOCX) first.");
            return;
        }

        const jdText = tailorJdTextarea.value.trim();
        if (!jdText) {
            alert("Please paste the target job description to match against.");
            return;
        }

        const originalBtnText = tailorBtn.innerHTML;
        tailorBtn.innerHTML = '<div class="spinner-glow" style="width:16px;height:16px;border-width:2px;margin-right:8px;display:inline-block;vertical-align:middle;"></div> Generating...';
        tailorBtn.disabled = true;
        tailorResultSection.style.display = "none";

        const formData = new FormData();
        formData.append("resume", tailorSelectedFile);
        formData.append("jd", jdText);

        try {
            const response = await fetch("/api/tailor", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Server returned an error during tailoring.");
            }

            const data = await response.json();
            tailorResultText.textContent = data.rewritten_resume;
            tailorResultTitle.textContent = "Optimized Resume";
            tailorResultSection.style.display = "block";
            tailorDownloadPdfBtn.style.display = "flex";
            
            // Scroll to results
            tailorResultSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error("Tailoring error:", error);
            alert(error.message);
        } finally {
            tailorBtn.innerHTML = originalBtnText;
            tailorBtn.disabled = false;
        }
    });

    tailorCopyBtn.addEventListener("click", () => {
        const text = tailorResultText.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const orig = tailorCopyBtn.innerHTML;
            tailorCopyBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied!
            `;
            tailorCopyBtn.style.color = "var(--color-success)";
            setTimeout(() => {
                tailorCopyBtn.innerHTML = orig;
                tailorCopyBtn.style.color = "";
            }, 2000);
        });
    });

    /* ============================================================
       Generate Cover Letter (API Call)
       ============================================================ */
    tailorCoverLetterBtn.addEventListener("click", async () => {
        if (!tailorSelectedFile) {
            alert("Please upload your resume file (PDF or DOCX) first.");
            return;
        }

        const jdText = tailorJdTextarea.value.trim();
        if (!jdText) {
            alert("Please paste the target job description to match against.");
            return;
        }

        const originalBtnText = tailorCoverLetterBtn.innerHTML;
        tailorCoverLetterBtn.innerHTML = '<div class="spinner-glow" style="width:16px;height:16px;border-width:2px;margin-right:8px;display:inline-block;vertical-align:middle;"></div> Generating...';
        tailorCoverLetterBtn.disabled = true;
        tailorResultSection.style.display = "none";

        const formData = new FormData();
        formData.append("resume", tailorSelectedFile);
        formData.append("jd", jdText);

        try {
            const response = await fetch("/api/cover-letter", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Server returned an error during cover letter generation.");
            }

            const data = await response.json();
            tailorResultText.textContent = data.cover_letter;
            tailorResultTitle.textContent = "Generated Cover Letter";
            tailorResultSection.style.display = "block";
            tailorDownloadPdfBtn.style.display = "flex";
            
            // Scroll to results
            tailorResultSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error("Cover letter error:", error);
            alert(error.message);
        } finally {
            tailorCoverLetterBtn.innerHTML = originalBtnText;
            tailorCoverLetterBtn.disabled = false;
        }
    });

    tailorDownloadPdfBtn.addEventListener("click", () => {
        window.print();
    });
});
