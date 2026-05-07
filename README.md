# Git Workflow Guide
Welcome to the team! This document explains the standard Git workflow we follow for development. Please read it carefully before starting any task.

---

# Table of Contents
1. Introduction
2. Branching Strategy
3. Branch Types
4. Daily Workflow
5. Pulling Latest Changes
6. Creating a New Branch
7. Making Changes
8. Committing Changes
9. Pushing Your Branch
10. Creating a Pull Request (PR)
11. Handling Merge Conflicts
12. Important Rules
13. Useful Git Commands

---

# Introduction
We use Git for version control and collaboration. Every developer works on their own branch and submits changes through Pull Requests (PRs).

Main goals of this workflow:
- Keep the `main` branch stable
- Avoid code conflicts
- Maintain clean commit history
- Enable easier code reviews

---

# Branching Strategy

## Main Branches
| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `staging` | Pre-production testing branch |
| `develop` | Active development branch |

---

# Branch Types

## Feature Branches
Used for developing new features.

### Naming Format
```bash
feature/feature-name
```

## Hotfix Branches
Used for urgent fixes that need to go directly to production without waiting for the normal development cycle. Always branch off from `main` and must be merged back into both `main` and `develop`.

### Naming Format
```bash
hotfix/issue-description
```

### Example
```bash
hotfix/fix-login-token-expiry
hotfix/fix-payment-null-pointer
```