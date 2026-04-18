import { Howl } from "howler";

export const sounds = {
  question: new Howl({
    src: ["/sounds/question.mp3"],
    volume: 0.5,
  }),
  select: new Howl({
    src: ["/sounds/question.mp3"], // временно същия звук
    volume: 0.3,
  }),
};