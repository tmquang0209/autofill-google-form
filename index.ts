import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";

interface Question {
    question: string;
    answers: string[];
}

const nextTranslate: string[] = ["Tiếp", "Next"];
const formUrl: string = "";

const specialQuestions: Question[] = [
    {
        question: "What is your preferred mode of transportation?",
        answers: ["Car", "Bike", "Public Transport", "Walking"],
    },
];

async function timeout(ms: number = 5000) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function launchBrowser(): Promise<Browser> {
    return await puppeteer.launch({ headless: false, channel: "chrome" });
}

async function navigateToPage(page: Page, url: string): Promise<void> {
    await page.goto(url);
    await page.waitForSelector("form");
}

async function clickNextButton(page: Page): Promise<void> {
    const nextButtons = await page.$$("span.NPEfkd.RveJvd.snByac");
    for (let button of nextButtons) {
        const text = await button.evaluate((el) => el.textContent);
        if (nextTranslate.includes(text?.trim() || "")) {
            await button.evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
            await timeout(500);
            await button.click();

            await timeout(1000);
            break;
        }
    }
}

async function answerQuestions(page: Page): Promise<void> {
    const questions: ElementHandle[] = await page.$$("div[role='listitem']");
    for (const question of questions) {
        try {
            const questionHeading = await question.$("div[role='heading']");
            if (!questionHeading) {
                console.warn("⚠️ Could not find question heading!");
                continue;
            }

            const questionText: string | null = await questionHeading.evaluate((el) => el.textContent);
            const cleanQuestion = questionText?.replace("*", "").trim();
            console.log("Question:", cleanQuestion);

            if (specialQuestions.some((q) => q.question === cleanQuestion)) {
                console.log("🔥 Special question detected!");
                const specialQuestion = specialQuestions.find((q) => q.question === cleanQuestion);
                if (specialQuestion) {
                    await answerSpecialQuestions(page, specialQuestion.answers);
                    continue;
                }
            }

            await answerMultipleChoice(question);
            await answerCheckboxes(question);
            // await answerInputs(question);
        } catch (error) {
            console.error("❌ Error processing question:", error);
        }
    }
}

async function answerSpecialQuestions(page: Page, answersTarget: string[]): Promise<void> {
    const presentations = await page.$$("span[role='presentation']");
    for (let presentation of presentations) {
        const randomIndex = Math.floor(Math.random() * answersTarget.length);
        const selectedAnswer = answersTarget[randomIndex];
        console.log("Selected Answer:", selectedAnswer);

        // div[role='radio'] has data-value attribute to match the answer
        const answers = await presentation.$$("div[role='radio']");
        for (let answer of answers) {
            const optionValue = await answer.evaluate((el) => el.getAttribute("data-value"));
            if (optionValue === selectedAnswer) {
                await answer.evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
                await timeout(500);
                await answer.click();
                console.log("✅ Answer clicked:", selectedAnswer);
                break;
            }
        }
    }
}

async function answerMultipleChoice(question: ElementHandle): Promise<void> {
    const presentations = await question.$$("span[role='presentation']");
    if (presentations.length > 0) {
        for (let presentation of presentations) {
            const answers = await presentation.$$("div[role='radio']");
            if (answers.length > 0) {
                let randomIndex = Math.floor(Math.random() * answers.length);
                let selectedAnswer = answers[randomIndex];

                // Check if the selected option is "__other_option__"
                const optionValue = await selectedAnswer.evaluate((el) => el.getAttribute("data-value"));
                if (optionValue === "__other_option__" && randomIndex > 0) {
                    randomIndex--; // Select the radio button above instead
                    selectedAnswer = answers[randomIndex];
                }

                // Scroll into view before clicking
                await selectedAnswer.evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
                await timeout(500);

                const isVisible = await selectedAnswer.evaluate((el) => {
                    const rect = el.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0;
                });

                if (isVisible) {
                    await selectedAnswer.click();
                    await timeout(500);
                } else {
                    console.warn("⚠️ Cannot click this element!");
                }
            }
        }
    }
}

async function answerCheckboxes(question: ElementHandle): Promise<void> {
    const checkboxes = await question.$$("div[role='checkbox']");
    if (checkboxes.length > 0) {
        const numSelections = Math.floor(Math.random() * Math.min(3, checkboxes.length)) + 1;
        const selected = new Set<number>();

        while (selected.size < numSelections) {
            const index = Math.floor(Math.random() * checkboxes.length);
            if (!selected.has(index)) {
                selected.add(index);

                await checkboxes[index].evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
                await timeout(500);
                await checkboxes[index].click();
            }
        }
    }
}

// async function answerInputs(question: ElementHandle): Promise<void> {
//     const inputs = await question.$$("input");
//     if (inputs.length > 0) {
//         const randomIndex = Math.floor(Math.random() * inputs.length);
//         const inputField = inputs[randomIndex];

//         await inputField.evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
//         await new Promise((resolve) => setTimeout(resolve, 500));
//         await inputField.click();
//         await inputField.type("Test Answer");
//     }
// }

async function submitForm(page: Page): Promise<void> {
    const submitButton = await page.$("div.uArJ5e.UQuaGc.Y5sE8d.VkkpIf.QvWxOd");
    if (submitButton) {
        await submitButton.evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
        await new Promise((resolve) => setTimeout(resolve, 500));
        await submitButton.click();
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
}

(async () => {
    const times = 100;

    for (let i = 1; i <= times; i++) {
        const browser = await launchBrowser();
        const page = await browser.newPage();
        page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

        try {
            await navigateToPage(page, formUrl);

            await clickNextButton(page);
            await answerQuestions(page);
            await clickNextButton(page);
            await answerQuestions(page);
            await submitForm(page);

            await new Promise((resolve) => setTimeout(resolve, 2000));
            const timestamp = new Date().getTime();
            await page.screenshot({ path: `./screenshots/screenshot_${timestamp}.png` });
            console.log("Screenshot saved as:", `screenshot_${timestamp}.png`);
        } catch (error) {
            console.error("Error during form processing:", error);
        } finally {
            await browser.close();
            // clear cache
            await timeout(1000);
        }
    }
})();
