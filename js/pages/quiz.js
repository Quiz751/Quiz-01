// Quiz Page JavaScript
class QuizManager {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.startTime = null;
        this.endTime = null;
        this.timerInterval = null;
        this.timeLimit = 15 * 60; // 15 minutes in seconds
        this.timeRemaining = this.timeLimit;
        
        this.initializeQuiz();
    }

    initializeQuiz() {
        this.loadSampleQuestions();
        this.setupEventListeners();
        this.animateQuizContainer();
        // Hide timer and question counter UI per requirements
        const quizInfo = document.querySelector('.quiz-info');
        if (quizInfo) {
            quizInfo.style.display = 'none';
        }
    }

    loadSampleQuestions() {
        // Get subject and chapter from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const subject = urlParams.get('subject') || 'mathematics';
        const chapter = urlParams.get('chapter') || 'algebra';
        
        // Update quiz title based on subject and chapter
        this.updateQuizTitle(subject, chapter);
        
        // Load questions based on subject and chapter
        if (chapter === 'complete') {
            this.questions = this.getQuestionsForCompleteSubject(subject);
        } else {
            this.questions = this.getQuestionsForChapter(subject, chapter);
        }

        // Initialize user answers array
        this.userAnswers = new Array(this.questions.length).fill(null);
    }
    
    updateQuizTitle(subject, chapter) {
        const quizTitle = document.getElementById('quizTitle');
        const subjectName = this.getSubjectDisplayName(subject);
        
        if (quizTitle) {
            if (chapter === 'complete') {
                quizTitle.textContent = `Complete ${subjectName} Quiz`;
            } else {
                const chapterName = this.getChapterDisplayName(chapter);
                quizTitle.textContent = `${subjectName} - ${chapterName} Quiz`;
            }
        }
    }
    
    getSubjectDisplayName(subject) {
        const subjectNames = {
            'mathematics': 'Mathematics',
            'science': 'Science',
            'history': 'History'
        };
        return subjectNames[subject] || 'General';
    }
    
    getChapterDisplayName(chapter) {
        const chapterNames = {
            'algebra': 'Algebra',
            'geometry': 'Geometry',
            'calculus': 'Calculus',
            'physics': 'Physics',
            'chemistry': 'Chemistry',
            'biology': 'Biology',
            'ancient': 'Ancient History',
            'medieval': 'Medieval History',
            'modern': 'Modern History'
        };
        return chapterNames[chapter] || 'General';
    }
    
    getQuestionsForChapter(subject, chapter) {
        const quizData = {
            mathematics: {
                algebra: [
                    {
                        id: 1,
                        question: "What is the value of x in the equation 2x + 5 = 13?",
                        options: ["3", "4", "5", "6"],
                        correct: 1,
                        explanation: "Solving: 2x + 5 = 13, so 2x = 8, therefore x = 4."
                    },
                    {
                        id: 2,
                        question: "What is the slope of the line y = 3x + 2?",
                        options: ["2", "3", "5", "6"],
                        correct: 1,
                        explanation: "In the equation y = mx + b, m is the slope. Here m = 3."
                    },
                    {
                        id: 3,
                        question: "What is (x + 3)(x - 3) equal to?",
                        options: ["x² - 9", "x² + 9", "x² - 6x + 9", "x² + 6x + 9"],
                        correct: 0,
                        explanation: "This is the difference of squares formula: (a + b)(a - b) = a² - b²."
                    },
                    {
                        id: 4,
                        question: "What is the solution to x² - 4 = 0?",
                        options: ["x = 2", "x = -2", "x = ±2", "x = 4"],
                        correct: 2,
                        explanation: "x² - 4 = 0, so x² = 4, therefore x = ±2."
                    },
                    {
                        id: 5,
                        question: "What is the y-intercept of y = 2x - 6?",
                        options: ["2", "-6", "6", "-2"],
                        correct: 1,
                        explanation: "In y = mx + b, b is the y-intercept. Here b = -6."
                    }
                ],
                geometry: [
                    {
                        id: 1,
                        question: "What is the sum of angles in a triangle?",
                        options: ["90°", "180°", "270°", "360°"],
                        correct: 1,
                        explanation: "The sum of interior angles in any triangle is always 180°."
                    },
                    {
                        id: 2,
                        question: "What is the area of a circle with radius 5?",
                        options: ["10π", "25π", "50π", "100π"],
                        correct: 1,
                        explanation: "Area of circle = πr² = π(5)² = 25π."
                    },
                    {
                        id: 3,
                        question: "What is the Pythagorean theorem?",
                        options: ["a + b = c", "a² + b² = c²", "a × b = c", "a - b = c"],
                        correct: 1,
                        explanation: "In a right triangle, a² + b² = c² where c is the hypotenuse."
                    },
                    {
                        id: 4,
                        question: "What is the volume of a cube with side length 3?",
                        options: ["9", "18", "27", "36"],
                        correct: 2,
                        explanation: "Volume of cube = side³ = 3³ = 27."
                    },
                    {
                        id: 5,
                        question: "What is the perimeter of a rectangle with length 8 and width 5?",
                        options: ["13", "26", "40", "80"],
                        correct: 1,
                        explanation: "Perimeter = 2(length + width) = 2(8 + 5) = 2(13) = 26."
                    }
                ],
                calculus: [
                    {
                        id: 1,
                        question: "What is the derivative of x²?",
                        options: ["x", "2x", "x²", "2x²"],
                        correct: 1,
                        explanation: "Using the power rule: d/dx(x²) = 2x."
                    },
                    {
                        id: 2,
                        question: "What is the integral of 2x?",
                        options: ["x²", "x² + C", "2x²", "2x² + C"],
                        correct: 1,
                        explanation: "∫2x dx = 2(x²/2) + C = x² + C."
                    },
                    {
                        id: 3,
                        question: "What is the limit of (x² - 1)/(x - 1) as x approaches 1?",
                        options: ["0", "1", "2", "undefined"],
                        correct: 2,
                        explanation: "Factor: (x² - 1)/(x - 1) = (x + 1)(x - 1)/(x - 1) = x + 1. As x→1, this approaches 2."
                    },
                    {
                        id: 4,
                        question: "What is the derivative of sin(x)?",
                        options: ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"],
                        correct: 0,
                        explanation: "The derivative of sin(x) is cos(x)."
                    },
                    {
                        id: 5,
                        question: "What is the integral of 1/x?",
                        options: ["ln(x)", "ln(x) + C", "1/x²", "x"],
                        correct: 1,
                        explanation: "∫(1/x) dx = ln|x| + C."
                    }
                ]
            },
            science: {
                physics: [
                    {
                        id: 1,
                        question: "What is Newton's First Law of Motion?",
                        options: ["F = ma", "An object at rest stays at rest", "Every action has an equal reaction", "Energy cannot be created or destroyed"],
                        correct: 1,
                        explanation: "Newton's First Law states that an object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force."
                    },
                    {
                        id: 2,
                        question: "What is the formula for kinetic energy?",
                        options: ["KE = mv", "KE = ½mv²", "KE = mgh", "KE = Fd"],
                        correct: 1,
                        explanation: "Kinetic energy is calculated as KE = ½mv², where m is mass and v is velocity."
                    },
                    {
                        id: 3,
                        question: "What is the speed of light in a vacuum?",
                        options: ["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10¹² m/s"],
                        correct: 1,
                        explanation: "The speed of light in a vacuum is approximately 3 × 10⁸ meters per second."
                    },
                    {
                        id: 4,
                        question: "What is the unit of force in the SI system?",
                        options: ["Joule", "Watt", "Newton", "Pascal"],
                        correct: 2,
                        explanation: "Force is measured in Newtons (N) in the SI system."
                    },
                    {
                        id: 5,
                        question: "What is the acceleration due to gravity on Earth?",
                        options: ["9.8 m/s²", "10 m/s²", "8.9 m/s²", "11 m/s²"],
                        correct: 0,
                        explanation: "The acceleration due to gravity on Earth is approximately 9.8 m/s²."
                    }
                ],
                chemistry: [
                    {
                        id: 1,
                        question: "What is the chemical symbol for water?",
                        options: ["H2O", "CO2", "NaCl", "O2"],
                        correct: 0,
                        explanation: "Water is H2O, consisting of two hydrogen atoms and one oxygen atom."
                    },
                    {
                        id: 2,
                        question: "What is the pH of a neutral solution?",
                        options: ["0", "7", "14", "10"],
                        correct: 1,
                        explanation: "A neutral solution has a pH of 7. pH below 7 is acidic, above 7 is basic."
                    },
                    {
                        id: 3,
                        question: "What is the atomic number of carbon?",
                        options: ["6", "12", "14", "16"],
                        correct: 0,
                        explanation: "Carbon has an atomic number of 6, meaning it has 6 protons in its nucleus."
                    },
                    {
                        id: 4,
                        question: "What type of bond forms between a metal and a non-metal?",
                        options: ["Covalent", "Ionic", "Metallic", "Hydrogen"],
                        correct: 1,
                        explanation: "Ionic bonds form between metals and non-metals through electron transfer."
                    },
                    {
                        id: 5,
                        question: "What is Avogadro's number?",
                        options: ["6.02 × 10²³", "6.02 × 10²⁴", "6.02 × 10²²", "6.02 × 10²⁵"],
                        correct: 0,
                        explanation: "Avogadro's number is 6.02 × 10²³, representing the number of particles in one mole."
                    }
                ],
                biology: [
                    {
                        id: 1,
                        question: "What is the powerhouse of the cell?",
                        options: ["Nucleus", "Mitochondria", "Ribosome", "Cell membrane"],
                        correct: 1,
                        explanation: "Mitochondria are often called the powerhouse of the cell because they produce ATP energy."
                    },
                    {
                        id: 2,
                        question: "What is the process by which plants make their own food?",
                        options: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"],
                        correct: 1,
                        explanation: "Photosynthesis is the process by which plants convert sunlight, water, and CO2 into glucose."
                    },
                    {
                        id: 3,
                        question: "What is the basic unit of heredity?",
                        options: ["Cell", "Gene", "Chromosome", "DNA"],
                        correct: 1,
                        explanation: "A gene is the basic unit of heredity that carries genetic information."
                    },
                    {
                        id: 4,
                        question: "What type of blood cells carry oxygen?",
                        options: ["White blood cells", "Red blood cells", "Platelets", "Plasma"],
                        correct: 1,
                        explanation: "Red blood cells contain hemoglobin and carry oxygen throughout the body."
                    },
                    {
                        id: 5,
                        question: "What is the largest organ in the human body?",
                        options: ["Liver", "Brain", "Skin", "Lungs"],
                        correct: 2,
                        explanation: "The skin is the largest organ in the human body, covering the entire external surface."
                    }
                ]
            },
            history: {
                ancient: [
                    {
                        id: 1,
                        question: "Which ancient civilization built the pyramids?",
                        options: ["Greeks", "Romans", "Egyptians", "Mayans"],
                        correct: 2,
                        explanation: "The ancient Egyptians built the pyramids as tombs for their pharaohs."
                    },
                    {
                        id: 2,
                        question: "What was the capital of the Roman Empire?",
                        options: ["Athens", "Rome", "Constantinople", "Alexandria"],
                        correct: 1,
                        explanation: "Rome was the capital of the Roman Empire, located in present-day Italy."
                    },
                    {
                        id: 3,
                        question: "Which ancient Greek city-state was known for its military prowess?",
                        options: ["Athens", "Sparta", "Corinth", "Thebes"],
                        correct: 1,
                        explanation: "Sparta was renowned for its military strength and warrior culture."
                    },
                    {
                        id: 4,
                        question: "What was the name of the first emperor of China?",
                        options: ["Confucius", "Qin Shi Huang", "Laozi", "Sun Tzu"],
                        correct: 1,
                        explanation: "Qin Shi Huang was the first emperor of unified China, ruling from 221-210 BCE."
                    },
                    {
                        id: 5,
                        question: "Which ancient wonder was located in Babylon?",
                        options: ["Great Pyramid", "Hanging Gardens", "Colossus of Rhodes", "Lighthouse of Alexandria"],
                        correct: 1,
                        explanation: "The Hanging Gardens of Babylon were one of the Seven Wonders of the Ancient World."
                    }
                ],
                medieval: [
                    {
                        id: 1,
                        question: "What was the feudal system?",
                        options: ["A religious hierarchy", "A social and economic system", "A military strategy", "A legal code"],
                        correct: 1,
                        explanation: "The feudal system was a social and economic structure based on land ownership and loyalty."
                    },
                    {
                        id: 2,
                        question: "Who was Charlemagne?",
                        options: ["A Viking king", "A French emperor", "A Roman general", "A Byzantine emperor"],
                        correct: 1,
                        explanation: "Charlemagne was a Frankish king who became the first Holy Roman Emperor."
                    },
                    {
                        id: 3,
                        question: "What was the Black Death?",
                        options: ["A war", "A famine", "A plague", "A drought"],
                        correct: 2,
                        explanation: "The Black Death was a devastating plague that swept through Europe in the 14th century."
                    },
                    {
                        id: 4,
                        question: "What was the Magna Carta?",
                        options: ["A religious text", "A legal document", "A military treaty", "A trade agreement"],
                        correct: 1,
                        explanation: "The Magna Carta was a legal document that limited the power of the English monarchy."
                    },
                    {
                        id: 5,
                        question: "Which empire was centered in Constantinople?",
                        options: ["Roman Empire", "Byzantine Empire", "Ottoman Empire", "Holy Roman Empire"],
                        correct: 1,
                        explanation: "The Byzantine Empire was centered in Constantinople (modern-day Istanbul)."
                    }
                ],
                modern: [
                    {
                        id: 1,
                        question: "When did World War I begin?",
                        options: ["1912", "1914", "1916", "1918"],
                        correct: 1,
                        explanation: "World War I began in 1914 with the assassination of Archduke Franz Ferdinand."
                    },
                    {
                        id: 2,
                        question: "Who was the first person to walk on the moon?",
                        options: ["Buzz Aldrin", "Neil Armstrong", "John Glenn", "Alan Shepard"],
                        correct: 1,
                        explanation: "Neil Armstrong was the first person to walk on the moon on July 20, 1969."
                    },
                    {
                        id: 3,
                        question: "What was the Berlin Wall?",
                        options: ["A defensive structure", "A border wall", "A monument", "A bridge"],
                        correct: 1,
                        explanation: "The Berlin Wall was a barrier that divided East and West Berlin during the Cold War."
                    },
                    {
                        id: 4,
                        question: "When did the Cold War end?",
                        options: ["1987", "1989", "1991", "1993"],
                        correct: 2,
                        explanation: "The Cold War ended in 1991 with the dissolution of the Soviet Union."
                    },
                    {
                        id: 5,
                        question: "What was the name of the first atomic bomb dropped on Japan?",
                        options: ["Little Boy", "Fat Man", "Trinity", "Manhattan"],
                        correct: 0,
                        explanation: "Little Boy was the first atomic bomb dropped on Hiroshima on August 6, 1945."
                    }
                ]
            }
        };
        
        // Return questions for the specific subject and chapter
        if (quizData[subject] && quizData[subject][chapter]) {
            return quizData[subject][chapter];
        }
        
        // Fallback to general questions if specific chapter not found
        return [
            {
                id: 1,
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"],
                correct: 2,
                explanation: "Paris is the capital and largest city of France."
            },
            {
                id: 2,
                question: "Which planet is known as the Red Planet?",
                options: ["Venus", "Mars", "Jupiter", "Saturn"],
                correct: 1,
                explanation: "Mars is often called the Red Planet due to iron oxide on its surface."
            },
            {
                id: 3,
                question: "What is the largest mammal in the world?",
                options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
                correct: 1,
                explanation: "The blue whale is the largest animal ever known to have lived on Earth."
            },
            {
                id: 4,
                question: "Who painted the Mona Lisa?",
                options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
                correct: 2,
                explanation: "Leonardo da Vinci painted the Mona Lisa between 1503-1519."
            },
            {
                id: 5,
                question: "What is the chemical symbol for gold?",
                options: ["Go", "Gd", "Au", "Ag"],
                correct: 2,
                explanation: "Au is the chemical symbol for gold, derived from the Latin word 'aurum'."
            }
        ];
    }

    getQuestionsForCompleteSubject(subject) {
        const quizData = {
            mathematics: {
                algebra: [
                    {
                        id: 1,
                        question: "What is the value of x in the equation 2x + 5 = 13?",
                        options: ["3", "4", "5", "6"],
                        correct: 1,
                        explanation: "Solving: 2x + 5 = 13, so 2x = 8, therefore x = 4."
                    },
                    {
                        id: 2,
                        question: "What is the slope of the line y = 3x + 2?",
                        options: ["2", "3", "5", "6"],
                        correct: 1,
                        explanation: "In the equation y = mx + b, m is the slope. Here m = 3."
                    },
                    {
                        id: 3,
                        question: "What is (x + 3)(x - 3) equal to?",
                        options: ["x² - 9", "x² + 9", "x² - 6x + 9", "x² + 6x + 9"],
                        correct: 0,
                        explanation: "This is the difference of squares formula: (a + b)(a - b) = a² - b²."
                    }
                ],
                geometry: [
                    {
                        id: 4,
                        question: "What is the sum of angles in a triangle?",
                        options: ["90°", "180°", "270°", "360°"],
                        correct: 1,
                        explanation: "The sum of interior angles in any triangle is always 180°."
                    },
                    {
                        id: 5,
                        question: "What is the area of a circle with radius 5?",
                        options: ["10π", "25π", "50π", "100π"],
                        correct: 1,
                        explanation: "Area of circle = πr² = π(5)² = 25π."
                    },
                    {
                        id: 6,
                        question: "What is the Pythagorean theorem?",
                        options: ["a + b = c", "a² + b² = c²", "a × b = c", "a - b = c"],
                        correct: 1,
                        explanation: "In a right triangle, a² + b² = c² where c is the hypotenuse."
                    }
                ],
                calculus: [
                    {
                        id: 7,
                        question: "What is the derivative of x²?",
                        options: ["x", "2x", "x²", "2x²"],
                        correct: 1,
                        explanation: "Using the power rule: d/dx(x²) = 2x."
                    },
                    {
                        id: 8,
                        question: "What is the integral of 2x?",
                        options: ["x²", "x² + C", "2x²", "2x² + C"],
                        correct: 1,
                        explanation: "∫2x dx = 2(x²/2) + C = x² + C."
                    },
                    {
                        id: 9,
                        question: "What is the limit of (x² - 1)/(x - 1) as x approaches 1?",
                        options: ["0", "1", "2", "undefined"],
                        correct: 2,
                        explanation: "Factor: (x² - 1)/(x - 1) = (x + 1)(x - 1)/(x - 1) = x + 1. As x→1, this approaches 2."
                    }
                ]
            },
            science: {
                physics: [
                    {
                        id: 1,
                        question: "What is Newton's First Law of Motion?",
                        options: ["F = ma", "An object at rest stays at rest", "Every action has an equal reaction", "Energy cannot be created or destroyed"],
                        correct: 1,
                        explanation: "Newton's First Law states that an object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force."
                    },
                    {
                        id: 2,
                        question: "What is the formula for kinetic energy?",
                        options: ["KE = mv", "KE = ½mv²", "KE = mgh", "KE = Fd"],
                        correct: 1,
                        explanation: "Kinetic energy is calculated as KE = ½mv², where m is mass and v is velocity."
                    },
                    {
                        id: 3,
                        question: "What is the speed of light in a vacuum?",
                        options: ["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10¹² m/s"],
                        correct: 1,
                        explanation: "The speed of light in a vacuum is approximately 3 × 10⁸ meters per second."
                    }
                ],
                chemistry: [
                    {
                        id: 4,
                        question: "What is the chemical symbol for water?",
                        options: ["H2O", "CO2", "NaCl", "O2"],
                        correct: 0,
                        explanation: "Water is H2O, consisting of two hydrogen atoms and one oxygen atom."
                    },
                    {
                        id: 5,
                        question: "What is the pH of a neutral solution?",
                        options: ["0", "7", "14", "10"],
                        correct: 1,
                        explanation: "A neutral solution has a pH of 7. pH below 7 is acidic, above 7 is basic."
                    },
                    {
                        id: 6,
                        question: "What is the atomic number of carbon?",
                        options: ["6", "12", "14", "16"],
                        correct: 0,
                        explanation: "Carbon has an atomic number of 6, meaning it has 6 protons in its nucleus."
                    }
                ],
                biology: [
                    {
                        id: 7,
                        question: "What is the powerhouse of the cell?",
                        options: ["Nucleus", "Mitochondria", "Ribosome", "Cell membrane"],
                        correct: 1,
                        explanation: "Mitochondria are often called the powerhouse of the cell because they produce ATP energy."
                    },
                    {
                        id: 8,
                        question: "What is the process by which plants make their own food?",
                        options: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"],
                        correct: 1,
                        explanation: "Photosynthesis is the process by which plants convert sunlight, water, and CO2 into glucose."
                    },
                    {
                        id: 9,
                        question: "What is the basic unit of heredity?",
                        options: ["Cell", "Gene", "Chromosome", "DNA"],
                        correct: 1,
                        explanation: "A gene is the basic unit of heredity that carries genetic information."
                    }
                ]
            },
            history: {
                ancient: [
                    {
                        id: 1,
                        question: "Which ancient civilization built the pyramids?",
                        options: ["Greeks", "Romans", "Egyptians", "Mayans"],
                        correct: 2,
                        explanation: "The ancient Egyptians built the pyramids as tombs for their pharaohs."
                    },
                    {
                        id: 2,
                        question: "What was the capital of the Roman Empire?",
                        options: ["Athens", "Rome", "Constantinople", "Alexandria"],
                        correct: 1,
                        explanation: "Rome was the capital of the Roman Empire, located in present-day Italy."
                    },
                    {
                        id: 3,
                        question: "Which ancient Greek city-state was known for its military prowess?",
                        options: ["Athens", "Sparta", "Corinth", "Thebes"],
                        correct: 1,
                        explanation: "Sparta was renowned for its military strength and warrior culture."
                    }
                ],
                medieval: [
                    {
                        id: 4,
                        question: "What was the feudal system?",
                        options: ["A religious hierarchy", "A social and economic system", "A military strategy", "A legal code"],
                        correct: 1,
                        explanation: "The feudal system was a social and economic structure based on land ownership and loyalty."
                    },
                    {
                        id: 5,
                        question: "Who was Charlemagne?",
                        options: ["A Viking king", "A French emperor", "A Roman general", "A Byzantine emperor"],
                        correct: 1,
                        explanation: "Charlemagne was a Frankish king who became the first Holy Roman Emperor."
                    },
                    {
                        id: 6,
                        question: "What was the Black Death?",
                        options: ["A war", "A famine", "A plague", "A drought"],
                        correct: 2,
                        explanation: "The Black Death was a devastating plague that swept through Europe in the 14th century."
                    }
                ],
                modern: [
                    {
                        id: 7,
                        question: "When did World War I begin?",
                        options: ["1912", "1914", "1916", "1918"],
                        correct: 1,
                        explanation: "World War I began in 1914 with the assassination of Archduke Franz Ferdinand."
                    },
                    {
                        id: 8,
                        question: "Who was the first person to walk on the moon?",
                        options: ["Buzz Aldrin", "Neil Armstrong", "John Glenn", "Alan Shepard"],
                        correct: 1,
                        explanation: "Neil Armstrong was the first person to walk on the moon on July 20, 1969."
                    },
                    {
                        id: 9,
                        question: "What was the Berlin Wall?",
                        options: ["A defensive structure", "A border wall", "A monument", "A bridge"],
                        correct: 1,
                        explanation: "The Berlin Wall was a barrier that divided East and West Berlin during the Cold War."
                    }
                ]
            }
        };
        
        // Combine questions from all chapters in the subject
        if (quizData[subject]) {
            const allQuestions = [];
            let questionId = 1;
            
            // Get questions from all chapters
            Object.values(quizData[subject]).forEach(chapterQuestions => {
                chapterQuestions.forEach(question => {
                    allQuestions.push({
                        ...question,
                        id: questionId++
                    });
                });
            });
            
            // Shuffle the questions to mix chapters
            return this.shuffleArray(allQuestions);
        }
        
        // Fallback to general questions
        return this.getQuestionsForChapter(subject, 'general');
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    setupEventListeners() {
        // Start quiz button
        const startBtn = document.getElementById('startQuizBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startQuiz());
        }

        // Navigation buttons
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        const submitBtn = document.getElementById('submitQuizBtn');

        if (prevBtn) prevBtn.addEventListener('click', () => this.previousQuestion());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextQuestion());
        if (submitBtn) submitBtn.addEventListener('click', () => this.submitQuiz());

        // Result page buttons
        const retakeBtn = document.getElementById('retakeQuizBtn');
        const viewAnswersBtn = document.getElementById('viewAnswersBtn');

        if (retakeBtn) retakeBtn.addEventListener('click', () => this.retakeQuiz());
        if (viewAnswersBtn) viewAnswersBtn.addEventListener('click', () => this.viewAnswers());
    }

    animateQuizContainer() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const quizContainer = document.querySelector('.quiz-container');
        
        if (!prefersReducedMotion && quizContainer) {
            quizContainer.style.opacity = '0';
            quizContainer.style.transform = 'scale(0.95) translateY(20px)';
            
            setTimeout(() => {
                quizContainer.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
                quizContainer.style.opacity = '1';
                quizContainer.style.transform = 'scale(1) translateY(0)';
            }, 100);
        } else if (quizContainer) {
            quizContainer.style.opacity = '1';
            quizContainer.style.transform = 'scale(1) translateY(0)';
        }
    }

    startQuiz() {
        this.startTime = new Date();
        this.timeRemaining = this.timeLimit;
        
        // Update quiz stats based on number of questions
        this.updateQuizStats();
        
        // Smooth transition from start screen to question screen
        this.transitionToQuestionScreen();
        
        // Timer disabled per requirements (hidden and not used)
        
        // Load first question
        this.loadQuestion(0);
        
        // Update progress
        this.updateProgress();
    }

    transitionToQuestionScreen() {
        const startScreen = document.getElementById('quizStartScreen');
        const questionScreen = document.getElementById('quizQuestionScreen');
        
        // Fade out start screen
        startScreen.style.transition = 'all 0.4s ease-out';
        startScreen.style.opacity = '0';
        startScreen.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            startScreen.style.display = 'none';
            questionScreen.style.display = 'block';
            questionScreen.style.opacity = '0';
            questionScreen.style.transform = 'translateY(30px)';
            
            // Fade in question screen
            setTimeout(() => {
                questionScreen.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                questionScreen.style.opacity = '1';
                questionScreen.style.transform = 'translateY(0)';
            }, 100);
        }, 400);
    }

    updateQuizStats() {
        const totalQuestions = this.questions.length;
        const questionCountElement = document.querySelector('.quiz-stat span');
        if (questionCountElement) {
            questionCountElement.textContent = `${totalQuestions} questions`;
        }
        
        // Update instructions
        const instructionsList = document.querySelector('.quiz-instructions ul');
        if (instructionsList) {
            instructionsList.innerHTML = `
                <li>You have 15 minutes to complete ${totalQuestions} questions</li>
                <li>Each question is worth ${Math.round(100 / totalQuestions)} points</li>
                <li>You can review and change answers before submitting</li>
                <li>Questions are randomly selected from all chapters</li>
            `;
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimer();
            
            if (this.timeRemaining <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    updateTimer() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const timerElement = document.getElementById('quizTimer');
        
        if (timerElement) {
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Change color when time is running low
            if (this.timeRemaining <= 60) {
                timerElement.style.color = 'var(--error)';
            } else if (this.timeRemaining <= 300) {
                timerElement.style.color = 'var(--warning)';
            }
        }
    }

    timeUp() {
        clearInterval(this.timerInterval);
        this.endTime = new Date();
        this.showResults();
    }

    loadQuestion(index) {
        if (index < 0 || index >= this.questions.length) return;
        
        this.currentQuestionIndex = index;
        const question = this.questions[index];
        
        // Animate question transition
        this.animateQuestionTransition(() => {
            // Update question text
            const questionTextEl = document.getElementById('questionText');
            if (questionTextEl) {
                questionTextEl.textContent = `${index + 1}. ${question.question}`;
            }
            
            // Generate options
            this.generateOptions(question);
            
            // Update navigation buttons
            this.updateNavigationButtons();
            
            // Update progress
            this.updateProgress();
        });
    }

    animateQuestionTransition(callback) {
        const questionCard = document.querySelector('.question-card');
        const optionsContainer = document.getElementById('questionOptions');
        
        // Fade out current question
        questionCard.style.transition = 'all 0.3s ease-out';
        questionCard.style.opacity = '0.6';
        questionCard.style.transform = 'translateX(-15px)';
        
        setTimeout(() => {
            // Execute callback (update content)
            callback();
            
            // Fade in new question
            questionCard.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            questionCard.style.opacity = '1';
            questionCard.style.transform = 'translateX(0)';
            
            // Animate options entrance
            const options = optionsContainer.querySelectorAll('.option-item');
            options.forEach((option, index) => {
                option.style.opacity = '0';
                option.style.transform = 'translateY(25px)';
                
                setTimeout(() => {
                    option.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    option.style.opacity = '1';
                    option.style.transform = 'translateY(0)';
                }, index * 120);
            });
        }, 300);
    }

    generateOptions(question) {
        const optionsContainer = document.getElementById('questionOptions');
        optionsContainer.innerHTML = '';
        
        // Ensure exactly 4 options are rendered
        const fourOptions = (question.options || []).slice(0, 4);
        fourOptions.forEach((option, index) => {
            const optionElement = document.createElement('button');
            optionElement.className = 'option-item';
            optionElement.innerHTML = `
                <span class="option-label">${String.fromCharCode(65 + index)}.</span>
                ${option}
            `;
            
            // Check if this option was previously selected
            if (this.userAnswers[this.currentQuestionIndex] === index) {
                optionElement.classList.add('selected');
            }
            
            optionElement.addEventListener('click', () => this.selectOption(index));
            optionsContainer.appendChild(optionElement);
        });
    }

    selectOption(optionIndex) {
        // Remove previous selection with animation
        const options = document.querySelectorAll('.option-item');
        options.forEach(option => {
            option.classList.remove('selected');
            option.style.transform = 'translateY(-3px) scale(1)';
        });
        
        // Add selection to clicked option with enhanced animation
        const selectedOption = options[optionIndex];
        selectedOption.classList.add('selected');
        selectedOption.style.transform = 'translateY(-3px) scale(1.02)';
        
        // Add ripple effect
        this.addRippleEffect(selectedOption);
        
        // Save answer
        this.userAnswers[this.currentQuestionIndex] = optionIndex;
        
        // Enable next button
        document.getElementById('nextQuestionBtn').disabled = false;
    }

    addRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.marginLeft = '-10px';
        ripple.style.marginTop = '-10px';
        ripple.style.pointerEvents = 'none';
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        const submitBtn = document.getElementById('submitQuizBtn');
        
        // Previous button
        prevBtn.disabled = this.currentQuestionIndex === 0;
        
        // Next/Submit button
        if (this.currentQuestionIndex === this.questions.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }
        
        // Enable next if current question is answered
        nextBtn.disabled = this.userAnswers[this.currentQuestionIndex] === null;
    }

    updateProgress() {
        // Progress bar removed per requirements
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.loadQuestion(this.currentQuestionIndex - 1);
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.loadQuestion(this.currentQuestionIndex + 1);
        }
    }

    submitQuiz() {
        if (confirm('Are you sure you want to submit the quiz? You cannot change your answers after submission.')) {
            clearInterval(this.timerInterval);
            this.endTime = new Date();
            this.showResults();
        }
    }

    showResults() {
        // Smooth transition from question screen to result screen
        this.transitionToResultScreen();
        
        // Calculate results
        const results = this.calculateResults();
        this.displayResults(results);
    }

    transitionToResultScreen() {
        const questionScreen = document.getElementById('quizQuestionScreen');
        const resultScreen = document.getElementById('quizResultScreen');
        
        // Fade out question screen
        questionScreen.style.opacity = '0';
        questionScreen.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            questionScreen.style.display = 'none';
            resultScreen.style.display = 'block';
            resultScreen.style.opacity = '0';
            resultScreen.style.transform = 'translateY(20px)';
            
            // Fade in result screen
            setTimeout(() => {
                resultScreen.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                resultScreen.style.opacity = '1';
                resultScreen.style.transform = 'translateY(0)';
            }, 50);
        }, 300);
    }

    calculateResults() {
        let correctAnswers = 0;
        const totalQuestions = this.questions.length;
        
        this.userAnswers.forEach((answer, index) => {
            if (answer === this.questions[index].correct) {
                correctAnswers++;
            }
        });
        
        const score = (correctAnswers / totalQuestions) * 100;
        const timeTaken = this.endTime ? Math.floor((this.endTime - this.startTime) / 1000) : 0;
        
        return {
            correct: correctAnswers,
            total: totalQuestions,
            score: Math.round(score),
            percentage: Math.round(score),
            timeTaken: this.formatTime(timeTaken)
        };
    }

    displayResults(results) {
        // Update result elements with animation
        this.animateStatValue('finalScore', results.score);
        document.getElementById('correctAnswers').textContent = `${results.correct}/${results.total}`;
        this.animateStatValue('percentage', `${results.percentage}%`);
        document.getElementById('timeTaken').textContent = results.timeTaken;
        
        // Update result title based on performance
        const resultTitle = document.getElementById('resultTitle');
        const resultSubtitle = document.getElementById('resultSubtitle');
        const resultIcon = document.querySelector('.result-icon svg');
        
        if (results.percentage >= 90) {
            resultTitle.textContent = 'Excellent Work!';
            resultSubtitle.textContent = 'Outstanding performance! You\'re a quiz master!';
            resultIcon.style.color = 'var(--success)';
        } else if (results.percentage >= 80) {
            resultTitle.textContent = 'Great Job!';
            resultSubtitle.textContent = 'Well done! You have a solid understanding.';
            resultIcon.style.color = 'var(--success)';
        } else if (results.percentage >= 70) {
            resultTitle.textContent = 'Good Effort!';
            resultSubtitle.textContent = 'Not bad! Keep practicing to improve.';
            resultIcon.style.color = 'var(--warning)';
        } else if (results.percentage >= 60) {
            resultTitle.textContent = 'Keep Learning!';
            resultSubtitle.textContent = 'You\'re on the right track. Study more and try again.';
            resultIcon.style.color = 'var(--warning)';
        } else {
            resultTitle.textContent = 'Try Again!';
            resultSubtitle.textContent = 'Don\'t give up! Review the material and retake the quiz.';
            resultIcon.style.color = 'var(--danger)';
        }
    }

    animateStatValue(elementId, finalValue) {
        const element = document.getElementById(elementId);
        const isPercentage = typeof finalValue === 'string' && finalValue.includes('%');
        const numericValue = isPercentage ? parseInt(finalValue) : finalValue;
        
        let currentValue = 0;
        const increment = numericValue / 50;
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= numericValue) {
                currentValue = numericValue;
                clearInterval(timer);
            }
            
            if (isPercentage) {
                element.textContent = Math.round(currentValue) + '%';
            } else {
                element.textContent = Math.round(currentValue);
            }
        }, 30);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    retakeQuiz() {
        // Reset quiz state
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.questions.length).fill(null);
        this.timeRemaining = this.timeLimit;
        this.startTime = null;
        this.endTime = null;
        
        // Clear timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Smooth transition back to start screen
        this.transitionToStartScreen();
        
        // Reset timer display
        const timerElement = document.getElementById('quizTimer');
        if (timerElement) {
            timerElement.textContent = '15:00';
            timerElement.style.color = 'var(--primary)';
        }
    }

    transitionToStartScreen() {
        const resultScreen = document.getElementById('quizResultScreen');
        const startScreen = document.getElementById('quizStartScreen');
        
        // Fade out result screen
        resultScreen.style.opacity = '0';
        resultScreen.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            resultScreen.style.display = 'none';
            startScreen.style.display = 'block';
            startScreen.style.opacity = '0';
            startScreen.style.transform = 'translateY(20px)';
            
            // Fade in start screen
            setTimeout(() => {
                startScreen.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                startScreen.style.opacity = '1';
                startScreen.style.transform = 'translateY(0)';
            }, 50);
        }, 300);
    }

    viewAnswers() {
        // This would typically open a modal or navigate to a review page
        alert('Answer review feature would be implemented here. This would show each question with the correct answer and explanation.');
    }
}

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', function() {
    new QuizManager();
});
