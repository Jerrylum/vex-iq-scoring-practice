import { BluePin, OrangePin, RedPin, type Pin } from "./Element";
import type { PinColor } from "./Scene";
import {
  BlueSquareGoalEmptyCase,
  BlueSquareGoalWithOneColumnCase,
} from "./structure/BlueSquareGoal";
import {
  FloorGoalEmptyCase,
  FloorGoalWithColumnsCase,
} from "./structure/FloorGoalStructure";
import {
  RedSquareGoalEmptyCase,
  RedSquareGoalWithOneColumnCase,
} from "./structure/RedSquareGoal";
import {
  RedTriangleGoalEmptyCase,
  RedTriangleGoalWithColumnsCase,
} from "./structure/RedTriangleGoal";
import {
  StandoffGoalBeamPlacedCase,
  StandoffGoalEmptyCase,
  StandoffGoalOneColumnCase,
} from "./structure/StandoffGoalStructure";

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
  const count =
    Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
  const pins = [];
  for (let i = 0; i < count; i++) {
    pins.push(generateRandomPin());
  }
  return pins;
}

export function generatePinsWithPreferredBottom(
  maxCount: number,
  preferredBottomColor: PinColor
) {
  const count = Math.floor(Math.random() * maxCount) + 1;
  const pins = [];
  if (preferredBottomColor === "red") {
    pins.push(new RedPin());
  } else if (preferredBottomColor === "blue") {
    pins.push(new BluePin());
  } else if (preferredBottomColor === "orange") {
    pins.push(new OrangePin());
  }
  for (let i = 0; i < count - 1; i++) {
    pins.push(generateRandomPin());
  }
  return pins as Pin[];
}

export function generateRandomStandoffGoalStructureCase(level: Level) {
  // for easy: empty case 50% or one stack case 50%
  // otherwise: beam place case 100%
  const caseType = Math.random();
  if (level === "easy") {
    if (caseType < 0.5) {
      return new StandoffGoalEmptyCase();
    } else {
      return new StandoffGoalOneColumnCase(generatePins(1, 2));
    }
  } else {
    if (caseType < 0.5) {
      return new StandoffGoalOneColumnCase(generatePins(1, 2));
    } else {
      return new StandoffGoalBeamPlacedCase(
        generatePins(0, 2),
        generatePins(0, 2),
        generatePins(0, 2)
      );
    }
  }
}

export function generateRandomFloorGoalStructureCase(level: Level) {
  // for easy: empty case 20% or stack cases 80%
  // medium: place case 100%
  // hard: place case 100% with 80% within area
  const caseType = Math.random();
  if (level === "easy") {
    if (caseType < 0.2) {
      return new FloorGoalEmptyCase();
    } else {
      return new FloorGoalWithColumnsCase(
        generatePins(1, 3),
        true,
        generatePins(1, 3),
        true,
        generatePins(1, 3),
        true,
        generatePins(1, 3),
        true
      );
    }
  } else if (level === "medium") {
    return new FloorGoalWithColumnsCase(
      generatePins(0, 3),
      true,
      generatePins(0, 3),
      true,
      generatePins(0, 3),
      true,
      generatePins(0, 3),
      true
    );
  } else {
    return new FloorGoalWithColumnsCase(
      generatePinsWithPreferredBottom(3, "orange"),
      Math.random() < 0.8,
      generatePinsWithPreferredBottom(3, "orange"),
      Math.random() < 0.8,
      generatePinsWithPreferredBottom(3, "orange"),
      Math.random() < 0.8,
      generatePinsWithPreferredBottom(3, "orange"),
      Math.random() < 0.8
    );
  }
}

export function generateRandomBlueSquareGoalStructureCase(level: Level) {
  // for easy: empty case 20% or one column case 80%
  // otherwise: one column case 100%
  const caseType = Math.random();
  if (level === "easy") {
    if (caseType < 0.2) {
      return new BlueSquareGoalEmptyCase();
    } else {
      return new BlueSquareGoalWithOneColumnCase(generatePins(1, 3));
    }
  } else {
    return new BlueSquareGoalWithOneColumnCase(
      generatePinsWithPreferredBottom(3, "blue")
    );
  }
}

export function generateRandomRedSquareGoalStructureCase(level: Level) {
  // for easy: empty case 20% or one column case 80%
  // otherwise: one column case 100%
  const caseType = Math.random();
  if (level === "easy") {
    if (caseType < 0.2) {
      return new RedSquareGoalEmptyCase();
    } else {
      return new RedSquareGoalWithOneColumnCase(generatePins(1, 3));
    }
  } else {
    return new RedSquareGoalWithOneColumnCase(
      generatePinsWithPreferredBottom(3, "red")
    );
  }
}

export function generateRandomRedTriangleGoalStructureCase(level: Level) {
  // for easy: empty case 20% or columns case 80%
  // otherwise: columns case 100%
  const caseType = Math.random();
  if (level === "easy") {
    if (caseType < 0.2) {
      return new RedTriangleGoalEmptyCase();
    } else {
      return new RedTriangleGoalWithColumnsCase(
        generatePinsWithPreferredBottom(3, "red"),
        [],
        []
      );
    }
  } else {
    return new RedTriangleGoalWithColumnsCase(
      generatePinsWithPreferredBottom(3, "red"),
      generatePinsWithPreferredBottom(3, "red"),
      generatePinsWithPreferredBottom(3, "red")
    );
  }
}
