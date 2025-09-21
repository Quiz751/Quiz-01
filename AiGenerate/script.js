document.getElementById("subjectForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const loaderOverlay = document.getElementById('loaderOverlay');
    const container = document.getElementById("questionsContainer");
    const submitButton = document.querySelector('button[type="submit"]');

    // Show the full-screen loader
    loaderOverlay.classList.add('show');
    submitButton.disabled = true;
    container.innerHTML = ''; // Clear any previous error messages

    const subject = document.getElementById("subject").value;
    const topic = document.getElementById("topic").value;

    try {
        const response = await fetch("http://localhost:5678/webhook-test/14088136-62ca-4877-ab45-6e9e50fd6502", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject, topic })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server Error ${response.status}: ${errorText}`);
        }

        let data;
        try {
            data = await response.json();
        } catch {
            const text = await response.text();
            throw new Error(`Invalid JSON: ${text}`);
        }

        const quizDataForStorage = {
            title: `${topic} Quiz (AI Generated)`,
            questions: data.map((q, index) => ({
                id: `ai_${index + 1}`,
                question_text: q.question,
                option_a: q.options.a,
                option_b: q.options.b,
                option_c: q.options.c,
                option_d: q.options.d,
                correct_option: `option_${q.correct_answer.toLowerCase()}`,
                explanation: q.explanation
            }))
        };

        sessionStorage.setItem('quizai_generated_quiz', JSON.stringify(quizDataForStorage));

        // On success, the redirect will happen, and the loader will disappear with the old page
        window.location.href = '../quiz.html?mode=ai';

    } catch (error) {
        // If an error occurs, hide the loader and show the error message
        loaderOverlay.classList.remove('show');
        container.innerHTML = `<p style="color:red;">${error.message}</p>`;
        console.error("Fetch error:", error);
        submitButton.disabled = false;
    }
});