import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

export async function startStaticServer(rootDir, port = 0, mountPath = "") {
  const root = resolve(rootDir);
  const mount = mountPath.replace(/\/+$/, "");
  const server = createServer(async (req, res) => {
    try {
      let pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      if (mount) {
        if (pathname === mount) pathname = "/";
        else if (pathname.startsWith(`${mount}/`)) pathname = pathname.slice(mount.length);
      }
      let filePath = join(root, normalize(pathname).replace(/^[/\\]+/, ""));
      if (!filePath.startsWith(root)) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" }).end("forbidden");
        return;
      }
      const info = await stat(filePath).catch(() => null);
      if (info?.isDirectory()) filePath = join(filePath, "index.html");
      const body = await readFile(filePath);
      res.writeHead(200, {
        "Content-Type": MIME[extname(filePath).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(body);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("not found");
    }
  });
  await new Promise((done) => server.listen(port, "127.0.0.1", done));
  return { server, base: `http://127.0.0.1:${server.address().port}/` };
}
