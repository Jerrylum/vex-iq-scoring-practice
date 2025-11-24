import { BluePin, OrangePin, RedPin, StandoffGoalBeamPlacedCase, StandoffGoalEmptyCase, StandoffGoalOneColumnCase, type Pin } from "./Element";
import type { PinColor } from "./Scene";

export type Level = "easy" | "medium" | "hard";

export function generateRandomPin(): Pin {
  switch (Math.floor(Math.random() * 3)) {
    case 0:
      return new RedPin();
    case 1:
      return new BluePin();
    case 2:
      return new OrangePin();
    default:
      throw new Error("Invalid pin color");
  }
}

export function generatePins(minCount: number, maxCount: number) {
  const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
  const pins = [];
  for (let i = 0; i < count; i++) {
    pins.push(generateRandomPin());
  }
  return pins;
}

export function generateRandomStandoffGoalStructureCase(level: Level) {
  // TODO
  // for easy: empty case 50% or one stack case 50%
  // for medium: one stack case 50% or beam place case 50%
  // for hard: beam place case 100%
  const caseType = Math.random();
  if (level === "easy") {
    if (caseType < 0.5) {
      return new StandoffGoalEmptyCase();
    } else {
      return new StandoffGoalOneColumnCase(generatePins(1, 2));
    }
  } else if (level === "medium") {
    if (caseType < 0.5) {
      return new StandoffGoalOneColumnCase(generatePins(1, 2));
    } else {
      return new StandoffGoalBeamPlacedCase(generatePins(1, 2), generatePins(0, 2), generatePins(0, 2));
    }
  } else {
    return new StandoffGoalBeamPlacedCase(generatePins(0, 2), generatePins(0, 2), generatePins(0, 2));
  }
};
