# Contributing to FourthChat

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
- [Development Setup](#development-setup)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. By participating, you are expected to uphold this commitment. Please be respectful and constructive in all interactions.

## I Have a Question

Before you ask a question, please search for existing [Issues](https://github.com/Mentter-Labs/fourthchat/issues) that might help you. If you find a suitable issue but still need clarification, you can add your question there.

If you still need to ask a question:

1. Open an [Issue](https://github.com/Mentter-Labs/fourthchat/issues/new)
2. Use the "Question" label
3. Provide as much context as you can about your situation

## I Want To Contribute

### Reporting Bugs

#### Before Submitting a Bug Report

- Make sure you are using the latest version
- Check if there is already a bug report for your issue
- Collect information about the bug:
  - Stack trace (if applicable)
  - OS, Platform and Version
  - Node.js version
  - Steps to reproduce the issue

#### How to Submit a Good Bug Report

We use GitHub issues to track bugs. If you run into a bug:

1. Open an [Issue](https://github.com/Mentter-Labs/fourthchat/issues/new)
2. Use the "Bug" label
3. Describe the expected vs actual behavior
4. Provide steps to reproduce
5. Include any relevant logs or screenshots

### Suggesting Enhancements

Enhancement suggestions are welcome! Before creating one:

1. Check if the enhancement has already been suggested
2. Think about whether the enhancement fits the project's scope
3. Consider if you could implement this yourself and submit a PR

To suggest an enhancement:

1. Open an [Issue](https://github.com/Mentter-Labs/fourthchat/issues/new)
2. Use the "Enhancement" label
3. Explain your use case and why this enhancement would be useful
4. Be as detailed as possible

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - should only require a few lines of code
- `help wanted` - issues that need attention

## Development Setup

### Prerequisites

- **Node.js**: v18 or later
- **Docker**: For running PostgreSQL and Qdrant locally

### Getting Started

1. **Fork the repository** and clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/fourthchat.git
   cd fourthchat
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the required services**:
   ```bash
   docker compose up -d
   ```

5. **Run database migrations**:
   ```bash
   npx drizzle-kit push
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

### Running Tests

```bash
npm run lint
npm run build
```

## Style Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### File Organization

- Components go in `/components`
- API routes go in `/app/api`
- Database-related code goes in `/lib`
- Shared utilities go in `/lib`

## Commit Messages

We follow conventional commits. Format:

```
<type>: <description>

[optional body]

[optional footer]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat: add knowledge base search functionality
fix: resolve chat streaming issue on slow connections
docs: update README with new setup instructions
```

---

Thank you for contributing to FourthChat! 🎉
