import { Howl } from "howler";

export const sounds = {
  start: new Howl({
    src: ["/sounds/start.mp3"],
    volume: 0.6,
  }),
  select: new Howl({
    src: ["/sounds/question.mp3"],
    volume: 0.4,
  }),
};