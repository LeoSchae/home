import { Renderer2DSVG } from "./canvas/context";

const r = new Renderer2DSVG(500, 500);
document.getElementsByTagName("main")[0].append(r.svg.toString());
