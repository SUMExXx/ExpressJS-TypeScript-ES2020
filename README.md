# Express TypeScript Starter (ES2020)

A powerful and modern template for building scalable Express.js applications using TypeScript, targeting ES2020. Includes support for SASS, static assets, debugging, and a well-structured backend directory layout.

---

## 📦 Features

- 🚀 TypeScript (`ES2020`) support
- 🧠 Clean architecture: `routers`, `controllers`, `models`, `utils`, etc.
- 🎯 `tsconfig-paths` and `tsc-alias` for path aliasing
- 🌐 Static asset support (`public/`, `storage/`)
- 🎨 SASS support with auto-watch
- 🧹 ESLint + Auto-fix + Type-checking
- 🔁 Dev server with `nodemon` and `concurrently`
- ✅ Jest testing setup (watch mode supported)

---

## 🧬 Folder Structure

```
src/
├── controllers/
├── data/
├── models/
├── public/
├── routers/
├── storage/
├── types/
├── utils/
└── index.ts         # App entry point
```

---

## 🚀 Scripts

| Script              | Description                                              |
|---------------------|----------------------------------------------------------|
| `npm run dev`       | Starts TypeScript + debug server with auto-reload       |
| `npm run build`     | Builds TypeScript and applies path alias fixes          |
| `npm start`         | Builds and serves the app in production                 |
| `npm run lint`      | Runs ESLint and TypeScript type-checking                |
| `npm run test`      | Runs all tests using Jest with coverage report          |
| `npm run watch`     | Watches SASS, TypeScript, and restarts server           |
| `npm run watch-ts`  | Watches and compiles TypeScript                         |
| `npm run watch-sass`| Watches and compiles `main.scss` to `dist/`             |
| `npm run serve`     | Runs compiled JS via Node (with path support)           |
| `npm run serve-debug`| Debug version of `serve` with inspector                |
| `npm run watch-test`| Runs Jest in watch mode                                 |

---

## ⚙️ Environment Setup

Create a `.env` file in the root:

```env
PORT=3000
NODE_ENV=development
```

---

## 🧪 Development

```bash
npm install
npm run dev
```

---

## 🛠️ Build and Run Production

```bash
npm run build
npm start
```

---

## 🔧 Linting

```bash
npm run lint
```

---

## ✅ Testing

```bash
npm run test
```

Or for continuous test watching:

```bash
npm run watch-test
```

---

## 📜 License

MIT — use freely for your own projects.

---

## 👨‍💻 Author

Made with ❤️ by [Suman Debnath](https://github.com/SUMExXx)
test
