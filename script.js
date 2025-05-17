// ======================
// MOBILE MENU TOGGLE
// ======================
const menuBtn = document.getElementById("menu-btn");
const navMenu = document.getElementById("nav-menu");

menuBtn.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  menuBtn.innerHTML = navMenu.classList.contains("active") ? 
    '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
});

// Close menu when clicking on a link
document.querySelectorAll("#nav-menu a").forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
  });
});

// ======================
// HEADER SCROLL EFFECT
// ======================
const header = document.getElementById("main-header");
window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// ======================
async function loadAutoNews() {
  const newsContainer = document.getElementById("auto-news-slideshow");
  const newsSourceInfo = document.getElementById("news-source-info");

  // Show loading placeholder
  newsContainer.innerHTML = `
    <div class="slide placeholder">
      <div class="slide-content" style="text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center;">
        <i class="fas fa-spinner fa-spin" style="font-size: 3rem; margin-bottom: 20px;"></i>
        <h3>Loading latest ocean news...</h3>
        <p>Fetching updates from Google News RSS feed</p>
      </div>
    </div>
  `;

  try {
    const response = await fetch('/news');
    if (!response.ok) throw new Error("Network response was not ok");

    const items = await response.json();

    if (!Array.isArray(items) || items.length === 0) throw new Error("No news items received.");

    newsContainer.innerHTML = "";

    if (newsSourceInfo) {
      const lastUpdated = new Date().toLocaleString();
      newsSourceInfo.innerHTML = `
        <div class="news-source">
          <p><i class="fas fa-rss"></i> Source: Google News | <i class="fas fa-calendar"></i> Last updated: ${lastUpdated}</p>
          <div class="news-verification">
            <button id="verify-news" class="btn-small"><i class="fas fa-check-circle"></i> Verify</button>
            <span id="verification-info" style="display: none;">
              <i class="fas fa-info-circle"></i> News is categorized using keywords (e.g., pollution, marine life).
            </span>
          </div>
        </div>
      `;

      document.getElementById("verify-news").addEventListener("click", () => {
        const info = document.getElementById("verification-info");
        info.style.display = info.style.display === "none" ? "inline" : "none";
      });
    }

    items.forEach(item => {
      // Use a static fallback image, can be replaced by actual images if available in RSS
      const imageUrl = "https://images.unsplash.com/photo-1439405326854-014607f694d7";
      
      // Clean description from HTML tags and limit length
      const cleanDescription = item.description
        ? item.description.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 100) + "..."
        : "Read more about this ocean news...";

      // Your RSS doesn't provide pubDate, so fallback to current date
      const pubDate = new Date().toLocaleDateString();

      newsContainer.innerHTML += `
        <div class="slide">
          <img src="${imageUrl}" alt="${item.title}" class="slide-img" onerror="this.src='${imageUrl}'">
          <div class="slide-content">
            <span class="news-date">${pubDate} | ${item.category}</span>
            <h3>${item.title}</h3>
            <p>${cleanDescription}</p>
            <a href="${item.link}" class="btn" target="_blank" rel="noopener noreferrer">Read More</a>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error loading news:", error);

    newsContainer.innerHTML = `
      <div class="slide">
        <img src="https://images.unsplash.com/photo-1546026423-cc4642628d2b" class="slide-img" alt="Coral Reef">
        <div class="slide-content">
          <h3>New Coral Reef Discovery</h3>
          <p>Scientists discovered a thriving coral reef in unexpected conditions.</p>
          <a href="#" class="btn">Read More</a>
        </div>
      </div>
    `;

    if (newsSourceInfo) {
      newsSourceInfo.innerHTML = `
        <div class="news-source">
          <p><i class="fas fa-exclamation-triangle"></i> Unable to fetch news. Showing fallback.</p>
          <button id="retry-news" class="btn-small"><i class="fas fa-sync"></i> Retry</button>
        </div>
      `;

      document.getElementById("retry-news").addEventListener("click", loadAutoNews);
    }
  }
}


// ======================
// SPECIES DATABASE
// ======================


// ======================
// QUIZ SECTION AUTOMATION
// ======================

// Function to fetch and display quiz questions
async function loadAutoQuiz() {
  try {
    // Using OpenTriviaDB API (Science: Nature category)
    const response = await fetch('https://opentdb.com/api.php?amount=3&category=17&difficulty=easy&type=multiple');
    const data = await response.json();
    
    const quizContainer = document.getElementById("auto-quiz-container");
    quizContainer.innerHTML = ''; // Clear placeholder
    
    if (data.results && data.results.length > 0) {
      data.results.forEach((question, index) => {
        // Decode HTML entities in questions/answers
        const decodedQuestion = decodeHTML(question.question);
        const decodedCorrect = decodeHTML(question.correct_answer);
        const decodedIncorrect = question.incorrect_answers.map(a => decodeHTML(a));
        
        // Combine and shuffle answers
        const allAnswers = [...decodedIncorrect, decodedCorrect]
          .sort(() => Math.random() - 0.5);
        
        quizContainer.innerHTML += `
          <div class="quiz-card">
            <div class="quiz-question">${index+1}. ${decodedQuestion}</div>
            <div class="quiz-options">
              ${allAnswers.map(answer => `
                <div class="quiz-option" 
                  ${answer === decodedCorrect ? 'data-correct="true"' : ''}>
                  ${answer}
                </div>
              `).join('')}
            </div>
            <div class="quiz-result"></div>
          </div>
        `;
      });
      
      // Reattach event listeners to new quiz options
      document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', function() {
          this.parentNode.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected');
          });
          this.classList.add('selected');
        });
      });
    } else {
      // Fallback quiz questions if API fails
      quizContainer.innerHTML = `
        <div class="quiz-card">
          <div class="quiz-question">1. Which of these marine animals is known for its intelligence and problem-solving abilities?</div>
          <div class="quiz-options">
            <div class="quiz-option">Jellyfish</div>
            <div class="quiz-option" data-correct="true">Octopus</div>
            <div class="quiz-option">Sea cucumber</div>
            <div class="quiz-option">Starfish</div>
          </div>
          <div class="quiz-result"></div>
        </div>
        <div class="quiz-card">
          <div class="quiz-question">2. What percentage of Earth's oxygen is produced by marine plants?</div>
          <div class="quiz-options">
            <div class="quiz-option">25%</div>
            <div class="quiz-option">40%</div>
            <div class="quiz-option" data-correct="true">70%</div>
            <div class="quiz-option">90%</div>
          </div>
          <div class="quiz-result"></div>
        </div>
        <div class="quiz-card">
          <div class="quiz-question">3. Which of the following is NOT a major threat to coral reefs?</div>
          <div class="quiz-options">
            <div class="quiz-option">Ocean acidification</div>
            <div class="quiz-option">Rising sea temperatures</div>
            <div class="quiz-option">Plastic pollution</div>
            <div class="quiz-option" data-correct="true">Increased marine plant growth</div>
          </div>
          <div class="quiz-result"></div>
        </div>
      `;
      
      // Attach event listeners to fallback quiz options
      document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', function() {
          this.parentNode.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected');
          });
          this.classList.add('selected');
        });
      });
    }
  } catch (error) {
    console.error('Error loading quiz:', error);
    // Display fallback quiz if there's an error (same as above)
  }
}

// Helper function to decode HTML entities
function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

// ======================
// INITIALIZATION
// ======================

// Load content when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadAutoNews();
  loadAutoQuiz();
  loadSpeciesInfo();
  
  // Check answers button functionality
  document.getElementById('check-answers').addEventListener('click', function() {
    let correctCount = 0;
    const quizCards = document.querySelectorAll('.quiz-card');
    
    quizCards.forEach(card => {
      const selectedOption = card.querySelector('.selected');
      const correctOption = card.querySelector('[data-correct="true"]');
      const resultDisplay = card.querySelector('.quiz-result');
      
      if (selectedOption) {
        if (selectedOption === correctOption) {
          selectedOption.classList.add('correct');
          correctCount++;
          resultDisplay.textContent = "Correct!";
          resultDisplay.style.color = "#4cd137";
        } else {
          selectedOption.classList.add('incorrect');
          correctOption.classList.add('correct');
          resultDisplay.textContent = "Incorrect! The correct answer is highlighted.";
          resultDisplay.style.color = "#e74c3c";
        }
        resultDisplay.style.display = "block";
      }
    });
    
    // Show overall score
    alert(`You got ${correctCount} out of ${quizCards.length} correct!`);
  });
});
