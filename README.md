# Automated Form Filling with Puppeteer

## 📌 Introduction
This project is an **automated form-filling system** built with **Puppeteer** and **TypeScript**. It automates interactions with Google Forms, including:

- Navigating to a form URL
- Clicking the **Next** button to proceed through sections
- Answering multiple-choice and checkbox questions randomly
- Submitting the form and capturing a screenshot of the confirmation page

## 🚀 Features
- **Headless Browser Automation**: Uses Puppeteer to control Chrome.
- **Randomized Responses**: Ensures diverse form submissions.
- **Screenshot Capture**: Saves the result after form submission.
- **Error Handling**: Logs warnings for missing elements.

## 🛠️ Setup & Installation
### **1️⃣ Install Dependencies**
Run the following command to install required packages:

```sh
yarn install
```

Or if using `npm`:

```sh
npm install
```

### **2️⃣ Configure TypeScript (Optional)**
Ensure you have a `tsconfig.json` file with basic TypeScript settings.

```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### **3️⃣ Run the Script**
To execute the form-filling automation:

```sh
yarn start
```

Or with `npm`:

```sh
npm run start
```

## 🔧 Configuration
Modify the formUrl variable in index.ts to target a different Google Form:

```typescript
await navigateToPage(page, formUrl);
```

You can also customize:
- Answering logic (e.g., predefined answers instead of random choices)
- Adding support for text input questions
- Enhancing error handling and logging

## 📝 Future Improvements
- Add support for more input types (text, dropdowns, etc.)
- Implement logging to save form submission details
- Improve UI interaction handling for dynamic forms

## 🤝 Contributing
Feel free to fork this repository and submit pull requests for improvements.

## 📄 License
This project is licensed under the **MIT License**.

---

🚀 Happy Automating!
