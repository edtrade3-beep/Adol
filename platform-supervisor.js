const { spawn } = require("node:child_process");
const path = require("node:path");

const projectRoot = __dirname;
const entryFile = path.join(projectRoot, "server.js");
const restartDelayMs = 3000;

let child = null;
let shuttingDown = false;

function log(message) {
  const stamp = new Date().toLocaleString("en-US", { hour12: false });
  console.log(`[platform-supervisor ${stamp}] ${message}`);
}

function startServer() {
  if (shuttingDown) return;

  log("Starting platform server...");

  child = spawn(process.execPath, [entryFile], {
    cwd: projectRoot,
    env: {
      ...process.env,
      HTTP_PROXY: "",
      HTTPS_PROXY: "",
      ALL_PROXY: ""
    },
    stdio: "inherit",
    windowsHide: false
  });

  child.on("exit", (code, signal) => {
    const status = signal ? `signal ${signal}` : `code ${code}`;
    child = null;

    if (shuttingDown) {
      log(`Server exited during shutdown (${status}).`);
      process.exit(typeof code === "number" ? code : 0);
      return;
    }

    log(`Server exited unexpectedly (${status}). Restarting in ${restartDelayMs / 1000}s...`);
    setTimeout(startServer, restartDelayMs);
  });

  child.on("error", (error) => {
    log(`Failed to start server: ${error.message}`);
  });
}

function stopServer(signal = "SIGTERM") {
  shuttingDown = true;

  if (!child) {
    process.exit(0);
    return;
  }

  log(`Stopping platform server with ${signal}...`);
  child.kill(signal);

  setTimeout(() => {
    if (child) {
      log("Server did not exit in time. Forcing shutdown.");
      child.kill("SIGKILL");
    }
    process.exit(0);
  }, 5000);
}

process.on("SIGINT", () => stopServer("SIGINT"));
process.on("SIGTERM", () => stopServer("SIGTERM"));
process.on("SIGHUP", () => stopServer("SIGHUP"));

startServer();
