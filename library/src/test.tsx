/** @jsx jsx */
import { TextSprite } from "./canvas/sprites";
import {jsx} from "./DomElement";

const direct = {
  onclick: true,
};

type anystr<K extends string> = {
  key: any;
}

type test =  {[key: string]: string} & {[key in keyof typeof direct]: GlobalEventHandlers[key]};


export default function () {return <span></span>};