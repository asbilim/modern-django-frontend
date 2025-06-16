# Django Modern Admin

Django Modern Admin is an open-source project that provides a sleek, modern, and highly customizable administrative interface for Django projects, built with Next.js, shadcn/ui, and Tailwind CSS. It aims to replace the standard Django admin with a more user-friendly and feature-rich frontend, while still leveraging the power and flexibility of Django's backend.

## ✨ Features

- **Modern UI**: A beautiful and responsive interface built with Next.js and the best-in-class shadcn/ui component library.
- **Dynamic Model Views**: Automatically generates list, create, and edit views for your Django models.
- **AI-Powered Generation**:
  - **Content Generation**: In any model's form view, use the "Generate with AI" button to populate fields based on a natural language prompt. The system is smart enough to understand your model's schema for accurate data creation.
  - **AI Utilities**: A dedicated "AI Tools" section with utilities like a secure password generator.
- **Customizable**: Configure navigation, model display, and more through simple configuration files.
- **Dark Mode**: Supports light and dark themes.
- **Internationalization**: Ready for multi-language support with next-intl.

## 🚀 Getting Started

### Prerequisites

- Node.js and npm/yarn/pnpm
- A running Django backend serving the admin API.

### Environment Variables

Create a `.env.local` file in the root of your frontend project and add the following variables. These are necessary for connecting to your Django backend and enabling AI features.

```
# The base URL of your Django backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# OpenRouter API Key for AI features
OPEN_ROUTER_API_KEY=sk-or-v1-...

# (Optional) Specify AI models to use
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct
OPENROUTER_MODEL_FALLBACK=mistralai/devstral-small
AI_TEMPERATURE=0.8
```

### Installation & Running

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-repo/django-modern-admin.git
    cd django-modern-admin
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Project Status & Roadmap

The project is currently in an **alpha** stage. Core functionalities are in place, but it is still under active development.

### Current Stage

- [x] User authentication (JWT-based with refresh tokens).
- [x] Dynamic generation of model list, create, and edit pages.
- [x] AI-powered content generation for forms.
- [x] AI Tools page with a password generator.
- [x] Basic dashboard homepage displaying model categories.
- [x] Dark mode and theme persistence.
- [x] Internationalization setup.

### What's Next?

Here are some of the features and improvements planned for the near future:

- **Advanced Form Fields**: More complex field types like rich text editors and improved relation handling.
- **Dashboard Widgets**: Customizable widgets for the main dashboard page to show stats and charts.
- **More AI Tools**: Expanding the AI utilities section with tools for content summarization, translation, and more.
- **In-depth Customization**: Allowing users to define custom actions and views for their models directly from the frontend configuration.
- **Comprehensive Testing**: Increasing test coverage for both frontend and backend components.
- **Detailed Documentation**: Providing more in-depth guides on configuration and customization.

## 🤝 Contributing

Contributions are welcome! If you have suggestions or want to contribute to the code, please feel free to open an issue or submit a pull request.

## Reusability & Creating Your Own Admin

This project is designed to be a reusable template for building modern admin interfaces for any Django project. You can easily create your own version by following these steps.

### 1. Use as a GitHub Template

The best way to start is by using this repository as a GitHub template.

1.  Navigate to the main page of the repository on GitHub.
2.  Click the **"Use this template"** button.
3.  Choose **"Create a new repository"**.
4.  Select an owner, provide a repository name, and click **"Create repository from template"**.

This will create a new repository with the same file structure but without the commit history, giving you a clean start.

### 2. Customization Checklist

After creating your repository, you'll want to customize it. Here is a checklist of files to update:

- **`.env.local`**: This is the most important step. Create this file (copy from `.env.example` if it exists) and set the `NEXT_PUBLIC_API_URL` to point to your Django backend. Also, add your `OPEN_ROUTER_API_KEY` for AI features.
- **`lib/config.ts`**:
  - Update `name`, `description`, and `repositoryUrl` to match your project.
  - To disable the blog feature, set `blog: { enabled: false, ... }`.
- **`package.json`**: Change the `name`, `description`, and `author` fields.
- **`public/` directory**: Replace `logo.svg` and `favicon.ico` with your own branding.
- **`README.md`**: Update this README file to describe your project.

### 3. Advanced: Creating a CLI (Cookiecutter)

For maximum reusability, you could create a dedicated CLI tool (e.g., `create-modern-admin`) that scaffolds a new project interactively. This is similar to how `create-next-app` works.

This involves:

- Using a tool like [**`inquirer`**](https://www.npmjs.com/package/inquirer) to prompt the user for configuration values (project name, API URL, etc.).
- Using a templating engine like [**EJS**](https://ejs.co/) or Handlebars to replace variables (e.g., `<%= projectName %>`) in the template files.
- Publishing the CLI tool to npm.

This is a more advanced step but provides the most seamless experience for creating new projects from your template.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
