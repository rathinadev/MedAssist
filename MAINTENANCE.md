# 🛠 MedAssist Maintenance Guide (Subtree Sync)

This project uses a **Monorepo** structure for the master repository, while allowing `backend`, `frontend`, and `mobile-app` to exist as independent repositories for individual team members.

## 🔄 Syncing with Individual Repos

Whenever you make changes in your monorepo and want to push them to the specific student repositories, use the following commands:

### 1. Backend
```bash
git subtree push --prefix=backend backend-origin main
```

### 2. Frontend
```bash
git subtree push --prefix=frontend frontend-origin main
```

### 3. Mobile App
```bash
git subtree push --prefix=mobile-app mobile-origin main
```

---

## 📥 Pulling Changes from Team Members

If a team member pushes a change directly to their repo and you want to bring it into your monorepo:

### 1. Backend
```bash
git subtree pull --prefix=backend backend-origin main --squash
```

### 2. Frontend
```bash
git subtree pull --prefix=frontend frontend-origin main --squash
```

### 3. Mobile App
```bash
git subtree pull --prefix=mobile-app mobile-origin main --squash
```

---

## 📜 Why Subtrees?
Unlike submodules, subtrees are **not** pointers. The code is physically part of your repository. 
- **Pros**: Easy setup, single history, no `git submodule update` required.
- **Commands**: Just remember `git subtree push` and `git subtree pull`.

---
<p align="center">MedAssist Master Repository Controller</p>
