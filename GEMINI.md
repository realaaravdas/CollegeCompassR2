## Project Overview

This project is a Next.js application called "College Compass," an AI-powered college application tracker. It uses Firebase for the backend, Genkit with Google AI for AI features, and a variety of UI components from Radix UI and custom components. The application provides features for user authentication (login/registration) and managing a list of colleges.

**Key Technologies:**

*   **Framework:** Next.js
*   **Backend:** Firebase
*   **AI:** Genkit with Google AI
*   **UI:** Radix UI, Tailwind CSS, custom React components
*   **Language:** TypeScript

**Architecture:**

*   The application is structured as a standard Next.js project with the `src` directory.
*   The `src/app` directory contains the main pages and layouts.
*   The `src/components` directory contains reusable UI components.
*   The `src/contexts` directory manages the application's state.
*   The `src/lib` directory contains utility functions and configuration files.
*   The `src/ai` directory contains the Genkit AI flows.

## Building and Running

**1. Install Dependencies:**

```bash
npm install
```

**2. Run the Development Server:**

```bash
npm run dev
```

This will start the Next.js development server on `http://localhost:9002`.

**3. Run Genkit:**

To use the AI features, you need to run the Genkit development server:

```bash
npm run genkit:dev
```

**4. Build for Production:**

```bash
npm run build
```

**5. Run in Production:**

```bash
npm run start
```

## Development Conventions

*   **Linting:** The project uses Next.js's built-in ESLint configuration. To run the linter, use:

    ```bash
    npm run lint
    ```

*   **Type Checking:** The project uses TypeScript. To check for type errors, use:

    ```bash
    npm run typecheck
    ```
