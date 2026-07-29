/* Local preview server: node tests/serve.mjs [port] */
import { startStaticServer } from "./static-server.mjs";

const port = Number(process.argv[2]) || 4173;
const { base } = await startStaticServer(process.cwd(), port);
console.log(`몽글 놀이터 미리보기: ${base}`);
console.log("종료하려면 Ctrl+C 를 누르세요.");
