import express from "express";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

const QB = {
  frontend: {
    Beginner: ["What is the difference between HTML, CSS, and JavaScript?","What is the CSS box model?","What is the difference between let, const, and var?","What is a React component?","What does the useEffect hook do?","What is the difference between == and === in JavaScript?","What is a promise in JavaScript?","What is the DOM?"],
    Intermediate: ["Explain how the virtual DOM works in React.","What is event delegation in JavaScript?","What is the difference between controlled and uncontrolled components in React?","Explain CSS flexbox and when to use it over grid.","What is the difference between localStorage and sessionStorage?","What are React hooks and why were they introduced?","Explain the concept of closures in JavaScript.","What is CORS and how does it affect frontend development?"],
    Advanced: ["Explain React's reconciliation algorithm.","How would you optimize a React app that is re-rendering too often?","What are Web Workers and when would you use them?","Explain code splitting and lazy loading in React.","How does the JavaScript event loop work?","What is memoization and how do useMemo and useCallback work?","Explain the concept of micro-frontends.","How would you implement SSR in a React application?"],
  },
  backend: {
    Beginner: ["What is REST and what are the main HTTP methods?","What is the difference between SQL and NoSQL databases?","What is middleware in Express.js?","What is an API?","What is the difference between GET and POST requests?","What is JSON?","What is a database index?","What is authentication vs authorization?"],
    Intermediate: ["Explain JWT authentication and how it works.","What is database indexing and why is it important?","Explain the MVC design pattern.","What is CORS and how do you handle it in Node.js?","What is the difference between SQL joins: INNER, LEFT, RIGHT?","How does session-based authentication differ from token-based?","What is rate limiting and why is it important?","Explain the concept of database transactions."],
    Advanced: ["How would you design a rate limiting system?","Explain ACID properties in databases.","What is the N+1 query problem and how do you solve it?","How would you implement a caching layer in your backend?","Explain microservices architecture vs monolithic architecture.","How would you handle database migrations in production?","What is eventual consistency in distributed systems?","How do you prevent SQL injection attacks?"],
  },
  fullstack: {
    Beginner: ["What is the difference between frontend and backend development?","Explain the client-server model.","What is JSON and why is it used?","What is the purpose of a database in a web application?","What is an HTTP request and response cycle?","What is version control and why is Git important?","What is npm and what is it used for?","What is the difference between a web server and an application server?"],
    Intermediate: ["How do you handle authentication in a full stack application?","What is the difference between server-side and client-side rendering?","How would you handle file uploads in a Node.js and React application?","Explain how WebSockets work and when to use them.","What is GraphQL and how does it differ from REST?","How do environment variables work across frontend and backend?","What is the role of a reverse proxy like Nginx?","How do you manage state in a full stack application?"],
    Advanced: ["How would you design a scalable full stack application?","Explain CI/CD pipelines and how you would set one up.","How would you implement real-time notifications in a web app?","What are the security best practices for a full stack application?","How would you handle database migrations in production?","Explain the concept of containerization with Docker.","How would you implement a microservices architecture?","What is load balancing and how does it work?"],
  },
  dsa: {
    Beginner: ["What is the difference between an array and a linked list?","Explain what a stack is and give a real-world example.","What is a queue and how is it different from a stack?","What is Big O notation? Explain O(n) and O(1).","How do you reverse a string?","What is a binary search and when can you use it?","What is the difference between linear and binary search?","What is recursion? Give an example."],
    Intermediate: ["Explain how binary search works and its time complexity.","What is a hash table and how does it handle collisions?","Explain the difference between BFS and DFS graph traversal.","What is dynamic programming? Give an example problem.","How does merge sort work and what is its time complexity?","What is a binary tree and what are its traversal methods?","Explain the two-pointer technique with an example.","What is a heap and when would you use one?"],
    Advanced: ["Explain Dijkstra's algorithm and its time complexity.","What is a segment tree and when would you use it?","Explain the concept of backtracking with an example.","What is the difference between memoization and tabulation in DP?","How would you detect a cycle in a directed graph?","Explain the sliding window technique with an example.","What is a trie and what problems does it solve?","Explain the concept of topological sorting."],
  },
  system: {
    Beginner: ["What is system design?","What is the difference between vertical and horizontal scaling?","What is a load balancer and why is it used?","What is caching and why is it important?","What is a CDN and how does it work?","What is the difference between a monolith and microservices?","What is a database and when would you choose SQL vs NoSQL?","What is an API gateway?"],
    Intermediate: ["How would you design a URL shortener like bit.ly?","Explain the CAP theorem.","What is consistent hashing and why is it used?","How would you design a notification system?","What is sharding and when would you use it?","Explain the concept of message queues and when to use them.","How would you design a rate limiter?","What is eventual consistency?"],
    Advanced: ["How would you design Twitter or a social media feed?","How would you design a distributed cache like Redis?","Explain the design of a ride-sharing app like Uber.","How would you design a video streaming service like YouTube?","What is a distributed transaction and how do you handle it?","How would you design a search autocomplete system?","Explain the design of a distributed file system.","How would you design a real-time collaborative editing tool?"],
  },
  hr: {
    Beginner: ["Tell me about yourself.","Why do you want to work here?","What are your strengths and weaknesses?","Where do you see yourself in 5 years?","Why are you leaving your current job?","What motivates you?","How do you handle stress?","What do you know about our company?"],
    Intermediate: ["Tell me about a challenging project you worked on and how you handled it.","Describe a time when you had a conflict with a teammate. How did you resolve it?","Give an example of a time you showed leadership.","Tell me about a time you failed and what you learned from it.","How do you prioritize tasks when you have multiple deadlines?","Describe a time when you had to learn something quickly.","How do you handle feedback and criticism?","Tell me about a time you went above and beyond at work."],
    Advanced: ["How would you handle a situation where you disagree with your manager's technical decision?","Describe a time when you had to influence a team without having direct authority.","Tell me about the most complex technical problem you have solved.","How do you stay updated with new technologies and trends?","Describe a time you had to make a difficult decision with incomplete information.","How do you mentor junior developers?","Tell me about a time you improved a process or system significantly.","How do you balance technical debt with feature development?"],
  },
};

const KEYWORDS = {
  frontend: ["react","dom","css","javascript","component","hook","state","props","event","render","html","browser","async","promise","closure","prototype"],
  backend: ["api","server","database","rest","http","sql","nosql","authentication","middleware","node","express","cache","index","query","jwt","session"],
  fullstack: ["frontend","backend","api","database","server","client","rest","deploy","state","auth","http","component","middleware","render"],
  dsa: ["array","linked","tree","graph","hash","sort","search","complexity","recursion","dynamic","pointer","stack","queue","heap","time","space","algorithm"],
  system: ["scale","load","cache","database","availability","consistency","partition","replication","sharding","microservice","queue","cdn","latency","throughput"],
  hr: ["team","challenge","learn","communicate","project","deadline","conflict","solution","improve","collaborate","goal","achieve","experience","skill"],
};

const getQuestions = (role, difficulty) => {
  const r = (role || "").toLowerCase().replace(/\s+/g, "");
  const bank = QB[r] || QB["fullstack"];
  const qs = bank[difficulty] || bank["Intermediate"] || bank["Beginner"];
  return [...qs].sort(() => Math.random() - 0.5).slice(0, 8);
};

const evaluateLocally = (question, userAnswer, questionNumber, totalQuestions, role, allQuestions) => {
  const words = userAnswer.trim().split(/\s+/).filter(Boolean);
  const lower = userAnswer.toLowerCase();
  const roleKey = (role || "").toLowerCase().replace(/\s+/g, "");
  const kws = KEYWORDS[roleKey] || KEYWORDS["fullstack"];
  const matched = kws.filter(k => lower.includes(k)).length;
  const kwScore = Math.min(4, matched);
  let lengthScore = 0;
  if (words.length >= 80) lengthScore = 4;
  else if (words.length >= 40) lengthScore = 3;
  else if (words.length >= 20) lengthScore = 2;
  else if (words.length >= 8) lengthScore = 1;
  const bonus = (lower.includes("example") || lower.includes("such as") ? 1 : 0) + (lower.includes("because") || lower.includes("therefore") ? 1 : 0);
  const score = Math.max(2, Math.min(10, lengthScore + kwScore + bonus));
  const tier = score >= 8 ? 0 : score >= 5 ? 1 : 2;
  const feedbacks = [
    ["Excellent answer! You demonstrated strong understanding with relevant technical details.", "Great response! You covered the key concepts clearly and used good examples.", "Very strong answer — your explanation shows solid practical knowledge."],
    ["Good answer. Try to include more specific technical examples to strengthen it.", "Decent response — you covered the basics. Adding more depth would improve your score.", "You are on the right track. More keywords and real-world examples would help."],
    ["Your answer needs more detail. Try to explain the concept more thoroughly with examples.", "Partially addressed the question. Focus on the core technical concepts and explain why.", "Add more structure to your answer — define the concept, then explain with an example."],
  ];
  const feedback = feedbacks[tier][Math.floor(Math.random() * 3)];
  const correctAnswer = "A strong answer covers: the definition of the concept, how it works internally, when and why to use it, and a real-world example from your experience.";
  const isLast = Number(questionNumber) >= Number(totalQuestions);
  const nextQuestion = isLast ? null : (allQuestions && Array.isArray(allQuestions) ? allQuestions[Number(questionNumber)] || null : null);
  return { score, feedback, correctAnswer, followUp: "Can you give a real-world example from a project you have worked on?", nextQuestion };
};

const generateLocalReport = (history, role) => {
  const avg = parseFloat((history.reduce((s, h) => s + (Number(h.score) || 0), 0) / history.length).toFixed(1));
  const grade = avg >= 9 ? "A" : avg >= 7 ? "B" : avg >= 5 ? "C" : avg >= 3 ? "D" : "F";
  const strengths = avg >= 7 ? ["Strong conceptual understanding","Clear and structured communication","Good use of technical terminology"] : avg >= 5 ? ["Covered basic concepts well","Attempted all questions confidently","Shows practical awareness of topics"] : ["Attempted every question","Shows initiative to learn","Basic familiarity with the domain"];
  const improvements = avg >= 7 ? ["Add more real-world project examples","Explore edge cases and tradeoffs","Practice system design questions"] : avg >= 5 ? ["Strengthen core fundamentals","Use more technical keywords","Practice explaining with examples"] : ["Review fundamental concepts","Practice speaking answers out loud","Build more hands-on projects"];
  const topics = { frontend:["React Hooks & Lifecycle","JavaScript Closures & Async","CSS Layout & Responsive Design","Performance Optimization"], backend:["REST API Design","Database Indexing & Queries","JWT Auth & Security","Caching Strategies"], fullstack:["System Architecture","Auth Flow End-to-End","Database Design","Deployment & DevOps"], dsa:["Arrays & Two Pointers","Trees & Graph Traversal","Dynamic Programming","Sorting Algorithms"], system:["Scalability Patterns","CAP Theorem","Database Sharding","Microservices Design"], hr:["STAR Method Answers","Leadership Examples","Conflict Resolution","Career Goal Clarity"] };
  const roleKey = (role || "").toLowerCase().replace(/\s+/g, "");
  const studyTopics = topics[roleKey] || topics["fullstack"];
  const recommendation = avg >= 7 ? `You performed well in this ${role} interview. Focus on advanced topics and system design to reach the next level.` : avg >= 5 ? `You have a decent foundation in ${role}. Strengthen your core concepts and practice explaining with examples.` : `Keep practicing ${role} fundamentals. Build small projects and review the study topics below.`;
  return { overallScore: avg, grade, strengths, improvements, recommendation, studyTopics };
};

/* START */
router.post("/start", authenticateToken, async (req, res) => {
  try {
    const { role, difficulty } = req.body;
    console.log("📥 START:", { role, difficulty });
    if (!role || !difficulty) return res.status(400).json({ message: "role and difficulty are required" });
    const allQuestions = getQuestions(role, difficulty);
    console.log("✅ QUESTION:", allQuestions[0].slice(0, 60));
    res.json({ question: allQuestions[0], allQuestions });
  } catch (err) {
    console.error("❌ START ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

/* ANSWER */
router.post("/answer", authenticateToken, async (req, res) => {
  try {
    const { role, difficulty, question, answer, answerTranscript, questionNumber, totalQuestions, allQuestions } = req.body;
    console.log("📥 ANSWER:", { role, questionNumber, totalQuestions });
    if (!role || !difficulty || !question) return res.status(400).json({ message: "role, difficulty, and question are required" });
    const userAnswer = (answerTranscript || answer || "").trim();
    if (!userAnswer) return res.status(400).json({ message: "Answer cannot be empty" });
    const data = evaluateLocally(question, userAnswer, questionNumber, totalQuestions, role, allQuestions);
    console.log("✅ EVAL score:", data.score);
    res.json(data);
  } catch (err) {
    console.error("❌ ANSWER ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

/* REPORT */
router.post("/report", authenticateToken, async (req, res) => {
  try {
    const { role, difficulty, history } = req.body;
    console.log("📥 REPORT:", { role, historyLength: history?.length });
    if (!history || !Array.isArray(history) || history.length === 0) return res.status(400).json({ message: "history array is required" });
    const report = generateLocalReport(history, role);
    console.log("✅ REPORT grade:", report.grade);
    res.json(report);
  } catch (err) {
    console.error("❌ REPORT ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;