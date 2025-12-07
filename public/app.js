// --- CONFIGURATION ---
// --- CONFIGURATION ---
const QUESTIONS = {
    fast: [
        {
            id: 'role',
            text: "What's your primary role?",
            options: [
                { label: "Frontend Developer", value: "frontend" },
                { label: "Backend Engineer", value: "backend" },
                { label: "Full Stack", value: "fullstack" },
                { label: "Data Scientist", value: "Data Science" },
                { label: "Machine Learning Engineer", value: "Machine Learning Engineer" },
                { label: "Vice President", value: "Vice President" },
                { label: "Product Manager", value: "Product Manager" }
            ]
        },
        {
            id: 'experience',
            text: "Years of experience?",
            options: [
                { label: "0-2 Years", value: "junior" },
                { label: "3-5 Years", value: "mid" },
                { label: "5+ Years", value: "senior" }
            ]
        },
        {
            id: 'officemode',
            text: "Preferred working style?",
            options: [
                { label: "Remote", value: "remote" },
                { label: "Hybrid", value: "hybrid" },
                { label: "On-site", value: "onsite" }
            ]
        },
        {
            id: 'location',
            text: "Target Job Location?",
            options: [
                { label: "US", value: "USA" },
                { label: "India", value: "India" },
                { label: "UK", value: "UK" }
            ]
        },
        {
            id: 'salary',
            text: "Expected Salary Range?",
            options: [
                { label: "Average", value: "Average" },
                { label: "Competitive", value: "Competitive" },
                { label: "Industry Leading", value: "Industry Leading" }
            ]
        },
        { id: 'dynamic_search', text: "Anything else you want to add in search?", options: [] },
        { id: 'search', text: "Searching for jobs... ⚡️", options: [] }
    ],
    deep: [
        {
            id: 'role',
            text: "What's your primary role?",
            options: [
                { label: "Frontend Developer", value: "frontend" },
                { label: "Backend Engineer", value: "backend" },
                { label: "Full Stack", value: "fullstack" },
                { label: "Data Scientist", value: "ML/Data Science" },
                { label: "Machine Learning Engineer", value: "Machine Learning Engineer" },
                { label: "Vice President", value: "Vice President" },
                { label: "Product Manager", value: "Product Manager" }

            ]
        },
        {
            id: 'experience',
            text: "Years of experience?",
            options: [
                { label: "0-2 Years", value: "junior" },
                { label: "3-5 Years", value: "mid" },
                { label: "5+ Years", value: "senior" }
            ]
        },
        {
            id: 'officemode',
            text: "Preferred working style?",
            options: [
                { label: "Remote", value: "remote" },
                { label: "Hybrid", value: "hybrid" },
                { label: "On-site", value: "onsite" }
            ]
        },
        {
            id: 'location',
            text: "Target Job Location?",
            options: [
                { label: "US", value: "USA" },
                { label: "India", value: "India" },
                { label: "UK", value: "UK" }
            ]
        },
        {
            id: 'salary',
            text: "Expected Salary Range?",
            options: [
                { label: "Average", value: "Average" },
                { label: "Competitive", value: "Competitive" },
                { label: "Industry Leading", value: "Industry Leading" }
            ]
        },
        { id: 'dynamic_search', text: "Anything else you want to add in search?", options: [] },
        { id: 'search', text: "Searching for jobs... ⚡️", options: [] }
    ]
};

// --- STATE ---
let state = {
    mode: null,      // 'fast' | 'deep'
    step: 0,         // Current question index
    history: [],     // Store user answers
    isTyping: false,
    resumeData: null, // Store API response from resume upload
    dynamicAnswer: null // Store "Anything else?" text response
};

// Timer Management (Fixes race conditions)
let activeTimers = [];

function setTrackedTimeout(fn, ms) {
    const id = setTimeout(() => {
        fn();
        // Remove from tracker after execution
        activeTimers = activeTimers.filter(t => t !== id);
    }, ms);
    activeTimers.push(id);
    return id;
}

function clearAllTimers() {
    activeTimers.forEach(id => clearTimeout(id));
    activeTimers = [];
}

// --- DOM ELEMENTS ---
const selectionScreen = document.getElementById('selectionScreen');
const chatScreen = document.getElementById('chatScreen');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const modeBadge = document.getElementById('modeBadge');

// --- EVENT LISTENERS ---
// Attached globally for the onclick in HTML to work
window.selectMode = (mode) => {
    // Stop any pending actions from previous interactions
    clearAllTimers();

    // CRITICAL: Ensure resume data is loaded from localStorage if not in state
    if (!state.resumeData) {
        const savedData = localStorage.getItem('jobPilotResumeData');
        if (savedData) {
            try {
                state.resumeData = JSON.parse(savedData);
                console.log("🔧 Loaded resume data from localStorage in selectMode:", state.resumeData);
            } catch (e) {
                console.error("Failed to parse resume data in selectMode:", e);
            }
        }
    }

    // Preserve resume data across mode selections
    const preservedResumeData = state.resumeData;
    const preservedDynamicAnswer = state.dynamicAnswer;

    state.mode = mode;
    state.step = 0;
    state.history = [];
    state.resumeData = preservedResumeData; // Restore
    state.dynamicAnswer = null; // Reset for new session

    console.log("🔄 Mode selected. Preserved resumeData:", state.resumeData);

    // UI Transitions
    selectionScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');

    // CLEAR CHAT HISTORY (Fixes phantom messages)
    chatMessages.innerHTML = '';

    // Apply specific mode theme (preserve light-theme if active)
    document.body.classList.remove('theme-fast', 'theme-deep');
    document.body.classList.add(`theme-${mode}`);

    // Update Badge
    modeBadge.textContent = mode === 'fast' ? 'Fast Mode' : 'Deep Analysis';

    // Start Interview
    updateProgress();
    startInteraction();
};

function updateProgress() {
    const bar = document.getElementById('progressBar');
    if (!state.mode) {
        bar.style.width = '0%';
        return;
    }

    const total = QUESTIONS[state.mode].length;
    // Calculate progress: Since the last item is the "Result/Search" phase, we want that to be 100%
    const progress = Math.min((state.step / (total - 1)) * 100, 100);
    bar.style.width = `${progress}%`;
}

window.toggleTheme = () => {
    document.body.classList.toggle('light-theme');
};

// Old resetApp removed (consolidated below)

document.addEventListener('DOMContentLoaded', () => {
    messageInput.focus();

    messageInput.addEventListener('input', () => {
        sendBtn.disabled = messageInput.value.trim() === '';
    });

    document.getElementById('chatForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleUserSubmit();
    });
});


async function startInteraction() {
    // 1. Avatar Build Sequence
    // await typeMessage("Building initial avatar...", 'bot');

    await typeMessage("Initial Avatar complete.", 'bot');
    showTyping(true);

    // Simulate REST call


    showTyping(false);
    // await typeMessage("Avatar complete.", 'bot');

    // 2. Welcome & First Question


    const welcomeMsg = state.mode === 'fast'
        ? "Fast mode activated. Let's find your next role in seconds."
        : "Deep Mind initialized. Let's explore your career potential together.";

    await typeMessage(welcomeMsg, 'bot');

    // Delay first question slightly for effect
    setTrackedTimeout(() => {
        askNextQuestion();
    }, 500);
}

function handleUserSubmit() {
    const text = messageInput.value.trim();
    if (!text || state.isTyping) return;

    // 1. Add User Message
    typeMessage(text, 'user'); // No await needed implies fire-and-forget for UI update
    state.history.push(text);

    // Check if this is the Dynamic Search Question
    const currentQ = QUESTIONS[state.mode][state.step];
    if (currentQ && currentQ.id === 'dynamic_search') {
        state.dynamicAnswer = text;
    }

    // 2. Clear Input
    messageInput.value = '';
    sendBtn.disabled = true;

    // 3. Process Next Step
    processNextStep();
}

function processNextStep() {
    showTyping(true);
    state.isTyping = true;

    // Dynamic delay based onmode
    const delay = state.mode === 'fast' ? 800 : 1500;

    setTrackedTimeout(() => {
        showTyping(false);
        state.isTyping = false;
        state.step++;
        askNextQuestion();
    }, delay);
}

async function askNextQuestion() {
    updateProgress();
    const questionList = QUESTIONS[state.mode];

    if (state.step < questionList.length) {
        const qData = questionList[state.step];

        // Wait for typing to finish before showing options
        await typeMessage(qData.text, 'bot');

        // Check for options
        if (qData.options && qData.options.length > 0) {
            renderOptions(qData.options);
        }

        // If it's the last "searching" message
        if (state.step === questionList.length - 1) {
            simulateResults();
        }
    }
}

function renderOptions(options) {
    const optionsContainer = document.createElement('div');
    optionsContainer.classList.add('options-container');

    options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn', 'stagger-item');
        btn.style.animationDelay = `${index * 50}ms`; // Stagger effect
        btn.innerText = opt.label;
        btn.onclick = () => handleOptionClick(opt);
        optionsContainer.appendChild(btn);
    });

    chatMessages.appendChild(optionsContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleOptionClick(selectedOpt) {
    // 1. Add User Message (Visual)
    typeMessage(selectedOpt.label, 'user');

    // 2. Store Structured Data
    const currentQ = QUESTIONS[state.mode][state.step];
    state.history.push({
        questionId: currentQ.id,
        questionText: currentQ.text,
        answerValue: selectedOpt.value,
        answerLabel: selectedOpt.label
    });

    // 3. Remove Options
    const optionsContainer = chatMessages.querySelector('.options-container');
    if (optionsContainer) optionsContainer.remove();

    // 4. Process Next Step
    processNextStep();
}

function generateAgentPayload() {
    // 1. Convert History Array to Key-Value Map
    const startTimestamp = new Date().toISOString();
    const interviewData = {};
    let locationPreference = "Any"; // Default

    state.history.forEach(entry => {
        if (typeof entry === 'object' && entry.questionId) {
            interviewData[entry.questionId] = {
                question: entry.questionText,
                answer: entry.answerValue,
                readable_answer: entry.answerLabel
            };

            // Extract specific top-level fields
            if (entry.questionId === 'location') {
                locationPreference = entry.answerValue;
            }
        }
    });

    // DEBUG: Check resume data state
    console.log("📋 DEBUG - state.resumeData:", state.resumeData);
    console.log("📋 DEBUG - localStorage resumeData:", localStorage.getItem('jobPilotResumeData'));

    // 2. Construct Final Payload
    return {
        persona: JSON.stringify(state.resumeData || {}),
        static_responses: JSON.stringify(interviewData),
        dynamic_responses: state.dynamicAnswer || "",
        mode: state.mode,
        region: locationPreference
    };
}

function showSkeletonLoader() {
    const container = document.createElement('div');
    container.id = 'skeleton-loader';
    container.classList.add('job-results-container');

    // Create 3 skeleton cards
    for (let i = 0; i < 3; i++) {
        const skeletonCard = document.createElement('div');
        skeletonCard.classList.add('job-card', 'skeleton-card');
        skeletonCard.style.animationDelay = `${i * 100}ms`;

        skeletonCard.innerHTML = `
            <div class="skeleton-header">
                <div class="skeleton-line skeleton-title"></div>
                <div class="skeleton-line skeleton-company"></div>
            </div>
            <div class="skeleton-details">
                <div class="skeleton-line skeleton-text"></div>
                <div class="skeleton-line skeleton-text"></div>
            </div>
            <div class="skeleton-description">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line" style="width: 60%;"></div>
            </div>
            <div class="skeleton-tags">
                <div class="skeleton-tag"></div>
                <div class="skeleton-tag"></div>
                <div class="skeleton-tag"></div>
            </div>
        `;

        container.appendChild(skeletonCard);
    }

    chatMessages.appendChild(container);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideSkeletonLoader() {
    const loader = document.getElementById('skeleton-loader');
    if (loader) loader.remove();
}

function simulateResults() {
    // showSkeletonLoader();
    showTyping(true);

    // Show Agent Trace button immediately
    showAgentTraceButton();

    setTrackedTimeout(async () => {

        // --- AGENT PAYLOAD GENERATION ---
        const finalPayload = generateAgentPayload();
        window.agentPayload = finalPayload;
        console.log("🤖 AGENT READY PAYLOAD:", finalPayload);

        // --- SEND TO AGENT ENDPOINT AND GET REAL RESPONSE ---
        let jobsData = []; // Fallback

        try {
            const apiBody = {
                ...finalPayload
            };

            const response = await fetch('https://ceo-main-medium-ids.trycloudflare.com/jobs/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiBody)
            });
            showTyping(false);
            const introMsg = state.mode === 'fast'
                ? "Matches found. Here are the top opportunities aligned with your velocity."
                : "Analysis complete. Based on your profile, these roles offer the highest career potential.";

            // await typeMessage(introMsg, 'bot');
            if (response.ok) {

                const apiResponse = await response.json();
                console.log("✅ Agent API Response:", apiResponse);


                if (apiResponse.jobs && Array.isArray(apiResponse.jobs)) {
                    await typeMessage(introMsg, 'bot');
                    jobsData = apiResponse.jobs;
                }
            } else {
                console.warn("API returned non-OK status, using fallback data");
            }

        } catch (e) {
            console.warn("API unreachable, using fallback data:", e);
        }

        // Remove skeleton loader and render real results
        hideSkeletonLoader();
        renderJobResults(jobsData);

    }, 2000);
}

function showAgentTraceButton() {
    const traceUrl = 'https://platform.openai.com/logs';

    const traceContainer = document.createElement('div');
    traceContainer.classList.add('trace-button-container');
    traceContainer.innerHTML = `
        <a href="${traceUrl}" target="_blank" class="standalone-trace-btn">
            🔍 View Agent Trace
            <span class="trace-subtitle">See request anatomy & agent activity</span>
        </a>
    `;

    chatMessages.appendChild(traceContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderJobResults(jobs) {
    // if(job=='')
    const container = document.createElement('div');
    container.classList.add('job-results-container');

    // Add horizontal scroll hint visibility
    container.addEventListener('scroll', () => {
        // Could add class for shadows etc.
    });

    jobs.forEach((job, index) => {
        const card = document.createElement('div');
        card.classList.add('job-card', 'stagger-item');
        card.style.animationDelay = `${index * 100}ms`;

        // Format Salary
        const formatSalary = (val) => val >= 1000 ? `${Math.round(val / 1000)}k` : val;
        const salaryText = (job.salary_min && job.salary_max)
            ? `${formatSalary(job.salary_min)} - ${formatSalary(job.salary_max)}`
            : "Competitive";

        // Truncate Description
        const desc = job.description.length > 100
            ? job.description.substring(0, 100) + '...'
            : job.description;

        card.innerHTML = `
            <div class="job-header">
                <h3>${job.title}</h3>
                <span class="company">${job.company}</span>
            </div>
            <div class="job-details">
                <span class="location">📍 ${job.location}</span>
                <span class="salary">💰 ${salaryText}</span>
            </div>
            <p class="job-description">${desc}</p>
            <div class="job-tags">
                ${job.skills_needed.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <a href="${job.url}" target="_blank" class="apply-btn">View Role →</a>
        `;

        container.appendChild(card);
    });

    chatMessages.appendChild(container);

    // Scroll to the start of the results
    setTrackedTimeout(() => {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// --- UI HELPERS ---
function typeMessage(text, sender) {
    return new Promise(resolve => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', `${sender}-message`);
        chatMessages.appendChild(msgDiv);

        // User messages are instant
        if (sender === 'user') {
            msgDiv.textContent = text;
            chatMessages.scrollTop = chatMessages.scrollHeight;
            resolve();
            return;
        }

        // Bot messages use typewriter effect
        let i = 0;
        const speed = 25; // ms per character

        function type() {
            if (i < text.length) {
                msgDiv.textContent += text.charAt(i);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                i++;
                setTrackedTimeout(type, speed);
            } else {
                resolve();
            }
        }

        // Start typing
        type();
    });
}

function showTyping(show) {
    if (show) {
        typingIndicator.classList.remove('hidden');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
        typingIndicator.classList.add('hidden');
    }
}

// --- FILE UPLOAD LOGIC ---
const uploadOverlay = document.getElementById('uploadOverlay');
const dropZone = document.getElementById('dropZone');
const fileStatus = document.getElementById('fileStatus');
const uploadBtn = document.querySelector('.upload-btn');

window.triggerUpload = () => {
    // Simulate file input click
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) handleFileUpload(file);
    };

    input.click();
};

// Old handleFileUpload removed (consolidated below)

// Drag and Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#667eea';
    dropZone.style.background = 'rgba(255,255,255,0.05)';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '';
    dropZone.style.background = '';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '';
    dropZone.style.background = '';

    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
});

// --- SESSION MANAGEMENT ---
document.addEventListener('DOMContentLoaded', () => {
    // Restore Resume Data if available
    const savedData = localStorage.getItem('jobPilotResumeData');
    if (savedData) {
        try {
            state.resumeData = JSON.parse(savedData);
            console.log("Restored Resume Data:", state.resumeData);
        } catch (e) {
            console.error("Failed to parse saved resume data");
        }
    }

    // Check if resume is already uploaded
    if (localStorage.getItem('jobPilotResume')) {
        // Skip upload, go straight to selection
        uploadOverlay.classList.add('hidden');
        selectionScreen.classList.remove('blurred');
    } else {
        // No resume? Ensure valid initial state
        uploadOverlay.classList.remove('hidden');
        selectionScreen.classList.add('blurred');
    }
});

window.triggerUpdateResume = () => {
    localStorage.removeItem('jobPilotResume');
    window.location.reload();
};

// --- TOAST NOTIFICATION ---
function showToast(title, message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '✅' : '⚠️';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTrackedTimeout(() => {
        toast.style.animation = 'slideOut 0.5s forwards';
        setTrackedTimeout(() => toast.remove(), 500);
    }, 4000);
}

// Store response globally as requested
window.uploadedResumeData = null;

async function handleFileUpload(file) {
    // 1. SHOW LOADING STATE (Blocking)
    fileStatus.textContent = `Analyzing ${file.name}...`;
    fileStatus.style.color = ''; // Reset color
    uploadBtn.disabled = true;
    dropZone.classList.add('uploading');

    // 2. UPLOAD
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('https://ceo-main-medium-ids.trycloudflare.com/avatar/build', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        console.log("Resume Upload Response:", data);

        // Check if response is successful
        if (!response.ok) {
            // Handle HTTP errors (including 412)
            const errorMessage = `Please send a valid resume`;

            fileStatus.textContent = errorMessage;
            fileStatus.style.color = '#ff4444';

            uploadBtn.disabled = false;
            dropZone.classList.remove('uploading');

            showToast("Upload Failed", errorMessage, "error");
            return; // Stay on upload page
        }

        // Store data
        state.resumeData = data;
        localStorage.setItem('jobPilotResumeData', JSON.stringify(data));
        window.uploadedResumeData = data;

        // DEBUG: Verify storage
        console.log("✅ DEBUG - Resume data stored in state:", state.resumeData);
        console.log("✅ DEBUG - Resume data stored in localStorage:", localStorage.getItem('jobPilotResumeData'));

        // Save session flag
        localStorage.setItem('jobPilotResume', 'true');

        // 3. SUCCESS UI
        fileStatus.textContent = "Upload Complete!";
        fileStatus.style.color = ''; // Reset to default
        dropZone.classList.remove('uploading');

        showToast("Persona Build Complete", "Resume analysis integrated into agent memory.");

        // Smooth transition close
        setTrackedTimeout(() => {
            uploadOverlay.classList.add('hidden');
            selectionScreen.classList.remove('blurred');
        }, 800);

    } catch (error) {
        console.error('Upload Error:', error);
        fileStatus.textContent = "Upload Failed. Please try again.";
        fileStatus.style.color = '#ff4444';

        uploadBtn.disabled = false;
        dropZone.classList.remove('uploading');

        showToast("Upload Failed", "Could not analyze resume. Using default calibration.", "error");
    }
}

// Update Reset to include Upload Overlay
// Update Reset to include Upload Overlay
window.resetApp = () => {
    // Call original reset
    state = { mode: null, step: 0, history: [], isTyping: false };

    // UI Reset
    selectionScreen.classList.remove('hidden');
    chatScreen.classList.add('hidden');
    chatMessages.innerHTML = '';

    // Remove mode-specific themes but keep global light/dark theme
    document.body.classList.remove('theme-fast', 'theme-deep');

    // Show Upload Overlay again? 
    // Logic: If resume is in session, show Selection screen directly.
    // If not (e.g. flushed manually), show Upload Overlay.

    if (localStorage.getItem('jobPilotResume')) {
        selectionScreen.classList.remove('blurred');
        // Keep overlay hidden
        uploadOverlay.classList.add('hidden');
    } else {
        uploadOverlay.classList.remove('hidden');
        selectionScreen.classList.add('blurred');
        fileStatus.textContent = '';
        uploadBtn.disabled = false;
    }
};

