# ✈️ Job Pilot

**AI-Powered Career Navigation System**

Job Pilot is an intelligent job search assistant that leverages AI to match candidates with their ideal career opportunities. Upload your resume, answer a few questions, and let our agent find the perfect roles tailored to your experience and preferences.

---

## 🌟 Features

- **🤖 AI-Powered Matching**: Advanced agent analyzes your resume and preferences to find optimal job matches
- **⚡ Dual Search Modes**:
  - **Fast Search**: Lightning-quick matches based on core criteria (~2 minutes)
  - **Deep Analysis**: Comprehensive career profiling with culture fit assessment (~10 minutes)
- **📄 Resume Intelligence**: Automated resume parsing and persona building
- **🎯 Smart Filtering**: Filter by role, experience level, location, work mode, and salary expectations
- **🔍 Agent Trace**: Real-time visibility into agent request anatomy and API activity
- **🎨 Modern UI**: Sleek, minimalist design with dark/light theme support
- **📱 Responsive**: Works seamlessly across desktop and mobile devices

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd job-pilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 📖 How to Use

### 1. **Upload Your Resume**

When you first launch Job Pilot, you'll be prompted to upload your resume:

- **Supported formats**: PDF, DOC, DOCX
- **What happens**: Our AI agent analyzes your resume to build your professional persona
- **Privacy**: Your data is processed securely and used only for job matching

> **Note**: If the upload fails with an error message, ensure you're uploading a valid resume with professional experience, skills, and career history.

---

### 2. **Select Your Search Mode**

Choose between two search modes based on your needs:

#### ⚡ **Fast Search**
- Quick matches based on core criteria
- Ideal for: Active job seekers who want immediate results
- Duration: ~2 minutes

#### 🧠 **Deep Analysis**
- Holistic career profiling and culture fit assessment
- Ideal for: Career changers or those seeking the perfect fit
- Duration: ~10 minutes

---

### 3. **Answer the Questions**

The AI will guide you through a series of questions:

1. **Primary Role**: Frontend, Backend, Full Stack, Data Science, ML Engineer
2. **Experience Level**: Junior (0-2 years), Mid (3-5 years), Senior (5+ years)
3. **Work Mode**: Remote, Hybrid, On-site
4. **Location**: USA, India, UK, or custom
5. **Salary Expectations**: Average, Competitive, Industry Leading
6. **Additional Preferences**: Free-text input for specific requirements

---

### 4. **View Results**

Once the search completes, you'll see:

- **Job Cards**: Curated list of matching opportunities
- **Job Details**: Title, company, location, salary range, required skills
- **Quick Actions**: 
  - **View Role →**: Opens the job posting in a new tab
  - **🔍 View Agent Trace**: See the agent's request anatomy and API activity

---

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 16.0.7 (React 19.2.0)
- **Language**: TypeScript 5.x
- **Styling**: Vanilla CSS with CSS Variables
- **Build Tool**: Turbopack (Next.js built-in)

### Project Structure

```
job-pilot/
├── public/
│   ├── app.js           # Main application logic
│   ├── style.css        # Global styles and themes
│   ├── skeleton.css     # Loading skeleton styles
│   └── index.html       # Entry point
├── src/
│   └── app/             # Next.js app directory
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

### Key Components

#### **State Management** (`app.js`)
- Interview flow state machine
- Resume data persistence (localStorage)
- API response caching

#### **API Integration**
- **Resume Upload**: `POST /avatar/build`
- **Job Search**: `POST /jobs/search`
- **Agent Trace**: `GET /trace`

#### **Theming System**
- CSS Variables for dynamic theming
- Mode-specific accents (Fast = Green, Deep = Purple)
- Light/Dark theme toggle

---

## 🎨 Customization

### Changing API Endpoints

Update the API URLs in `public/app.js`:

```javascript
// Resume upload endpoint
const response = await fetch('https://your-api.com/avatar/build', {
    method: 'POST',
    body: formData
});

// Job search endpoint
const response = await fetch('https://your-api.com/jobs/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apiBody)
});
```

### Modifying Questions

Edit the `QUESTIONS` object in `public/app.js`:

```javascript
const QUESTIONS = {
    fast: [
        {
            id: 'role',
            text: "What's your primary role?",
            options: [
                { label: "Frontend Developer", value: "frontend" },
                // Add more options...
            ]
        },
        // Add more questions...
    ]
};
```

### Theme Colors

Modify CSS variables in `public/style.css`:

```css
:root {
    --bg-color: #000000;
    --surface-color: #0f0f0f;
    --text-primary: #ffffff;
    --accent-color: #ffffff;
}
```

---

## 🔧 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production-ready application |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint for code quality checks |

### Development Workflow

1. Make changes to files in `public/` or `src/`
2. Changes are automatically reflected (hot reload)
3. Test in both light and dark themes
4. Test both Fast and Deep modes
5. Verify error handling with invalid resumes

---

## 🐛 Troubleshooting

### Upload Fails with 412 Error

**Issue**: "The uploaded document does not appear to be a resume/CV"

**Solution**: Ensure your file is a valid resume containing:
- Professional experience
- Skills and competencies
- Career history
- Education (optional but recommended)

### Jobs Not Loading

**Issue**: Search completes but no jobs appear

**Solution**: 
1. Check browser console for API errors
2. Verify API endpoint is accessible
3. Check network tab for response status
4. Ensure API returns `{ jobs: [...] }` format

### Theme Not Switching

**Issue**: Light/dark toggle doesn't work

**Solution**:
1. Clear browser cache
2. Check if `toggleTheme()` function is defined
3. Verify CSS variables are properly set

---

## 📝 API Response Format

### Resume Upload Response (Success)
```json
{
  "name": "John Doe",
  "skills": ["JavaScript", "React", "Node.js"],
  "experience": "5 years",
  "education": "BS Computer Science"
}
```

### Resume Upload Response (Error)
```json
{
  "detail": "The uploaded document does not appear to be a resume/CV..."
}
```

### Job Search Response
```json
{
  "jobs": [
    {
      "title": "Senior Frontend Developer",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "salary_min": 120000,
      "salary_max": 180000,
      "description": "We are looking for...",
      "skills_needed": ["React", "TypeScript", "CSS"],
      "url": "https://example.com/job/123"
    }
  ]
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by AI-driven job matching algorithms
- Designed for modern job seekers

---

## 📞 Support

For issues, questions, or feature requests, please open an issue in the repository.

---

**Made with ❤️ for job seekers everywhere**
