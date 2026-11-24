const form = document.querySelector("#ask");

if (form) {
  const status = document.querySelector("#ask-status");
  const results = document.querySelector("#ask-results");
  const question = form.elements.question;
  const submit = form.querySelector("button");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    const value = question.value.trim();
    if (!value) {
      status.textContent = "Enter a question.";
      question.focus();
      return;
    }

    status.textContent = "Looking through the garden…";
    results.replaceChildren();
    submit.disabled = true;
    try {
      const response = await fetch("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: value }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok) {
        status.textContent = data.error;
        return;
      }
      status.textContent = data.passages.length ? "From the garden" : "No close match in these ideas.";
      for (const passage of data.passages) {
        const item = document.createElement("li");
        const quote = document.createElement("p");
        quote.textContent = passage.text;
        const link = document.createElement("a");
        link.href = passage.url;
        link.textContent = passage.title;
        item.append(quote, link);
        results.append(item);
      }
    } catch {
      status.textContent = "The garden couldn't answer right now. You can still browse the ideas.";
    } finally {
      submit.disabled = false;
    }
  });
}
