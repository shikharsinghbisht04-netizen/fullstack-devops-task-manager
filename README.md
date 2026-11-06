# Full-Stack App with Jenkins CI/CD

React + Node.js/Express + MongoDB, built, tested, packaged and deployed by the `Jenkinsfile`.

## 1. One-time setup (on your computer)

```bash
cd backend  && npm install && cd ..     # creates backend/package-lock.json
cd frontend && npm install && cd ..     # creates frontend/package-lock.json
git init && git add . && git commit -m "initial commit"
```
Commit the two `package-lock.json` files: the pipeline and the Dockerfiles use `npm ci`, which needs them.

Quick local check (optional):
```bash
cd backend && npm test && npm run lint
cd ../frontend && npm test && npm run lint && npm run build
```

## 2. Edit the placeholders in `Jenkinsfile`
`REGISTRY` (your Docker Hub user), `STAGING`, `PRODUCTION`, and the e-mail in the `post` block.

## 3. First run: validate only (no servers needed)
Push to a branch named `feature/first-run`. Only stages 1-8 run (build, test, package,
smoke test, scan). Deploy stages run only on `develop` and `main`.
If Trivy is not installed on the Jenkins host, install it or temporarily remove the
"Security Scan" stage.

## 4. Jenkins prerequisites
Plugins: Pipeline, Git, GitHub Branch Source (or GitLab), Docker Pipeline, Credentials Binding,
SSH Agent, JUnit, Timestamper, Workspace Cleanup, Mailer.
Credentials (IDs): `dockerhub-creds`, `deploy-ssh-key`.
The `jenkins` user must be in the `docker` group. Details: see the project report.

## 5. Target servers (staging / production)
Docker + Compose installed, SSH access for user `deploy`, folder `/opt/fullstack-app`
writable by that user. `docker login` once if the registry is private.
