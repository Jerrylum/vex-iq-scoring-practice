import { BluePin, OrangePin, RedPin, type Pin } from "./Element";
import type { PinColor } from "./Scene";
import {
  BeamWithColumnsCase,
  BeamWithTwoBottomColumnsCase,
  JustBeamOnFloorCase,
} from "./structure/BeamOnFloorStructure";
import {
  BlueSquareGoalEmptyCase,
  BlueSquareGoalWithOneColumnCase,
} from "./structure/BlueSquareGoal";
import {
  BlueTriangleGoalEmptyCase,
  BlueTriangleGoalWithColumnsCase,
} from "./structure/BlueTriangleGoal";
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
import { StacksOnFloorCase } from "./structure/StacksOnFloorStructure";
import {
  StandoffGoalBeamPlacedCase,
  StandoffGoalEmptyCase,
  StandoffGoalOneColumnCase,
} from "./structure/StandoffGoalStructure";
import { StartingPinCase } from "./structure/StartingPinStructure";

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
    const pin = generateRandomPin();
    if (pin.color !== preferredBottomColor || Math.random() < 0.2) {
      pins.push(pin);
    } else {
      i--;
    }
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
        Math.random() < 0.5 ? generatePinsWithPreferredBottom(3, "orange") : [],
        true,
        Math.random() < 0.5 ? generatePinsWithPreferredBottom(3, "orange") : [],
        true,
        Math.random() < 0.5 ? generatePinsWithPreferredBottom(3, "orange") : [],
        true,
        Math.random() < 0.5 ? generatePinsWithPreferredBottom(3, "orange") : [],
        true
      );
    }
  } else if (level === "medium") {
    return new FloorGoalWithColumnsCase(
      Math.random() < 0.5 ? generatePinsWithPreferredBottom(3, "orange") : [],
      true,
      Math.random() < 0.5 ? generatePinsWithPreferredBottom(3, "orange") : [],
      true,
      Math.random() < 0.5 ? generatePinsWithPreferredBottom(3, "orange") : [],
      true,
      Math.random() < 0.5 ? generatePinsWithPreferredBottom(3, "orange") : [],
      true
    );
  } else {
    return new FloorGoalWithColumnsCase(
      generatePins(2, 3),
      Math.random() < 0.8,
      generatePins(2, 3),
      Math.random() < 0.8,
      generatePins(2, 3),
      Math.random() < 0.8,
      generatePins(2, 3),
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
      Math.random() < 0.5 ? generatePinsWithPreferredBottom(3, "red") : [],
      Math.random() < 0.5 ? generatePinsWithPreferredBottom(3, "red") : []
    );
  }
}

export function generateRandomBlueTriangleGoalStructureCase(level: Level) {
  // for easy: empty case 20% or columns case 80%
  // otherwise: columns case 100%
  const caseType = Math.random();
  if (level === "easy") {
    if (caseType < 0.2) {
      return new BlueTriangleGoalEmptyCase();
    } else {
      return new BlueTriangleGoalWithColumnsCase(
        generatePinsWithPreferredBottom(3, "blue"),
        [],
        []
      );
    }
  } else {
    return new BlueTriangleGoalWithColumnsCase(
      generatePinsWithPreferredBottom(3, "blue"),
      Math.random() < 0.5 ? generatePinsWithPreferredBottom(3, "blue") : [],
      Math.random() < 0.5 ? generatePinsWithPreferredBottom(3, "blue") : []
    );
  }
}

export function generateRandomStartingPinStructureCase(level: Level) {
  // for easy: untouched case 20% or touched case 80%
  // otherwise: one column case 100%
  const caseType = Math.random();
  if (level === "easy") {
    if (caseType < 0.8) {
      return new StartingPinCase(false, false, false, false);
    }
  }
  return new StartingPinCase(
    Math.random() < 0.5,
    Math.random() < 0.5,
    Math.random() < 0.5,
    Math.random() < 0.5
  );
}

export function generateRandomBeamOnFloorStructureCase(level: Level) {
  const caseType = Math.random();
  if (level === "easy") {
    if (caseType < 0.7) {
      return new JustBeamOnFloorCase();
    } else {
      return new BeamWithColumnsCase(
        generatePins(1, 2),
        generatePins(1, 2),
        generatePins(1, 2)
      );
    }
  } else {
    if (caseType < 0.3) {
      const bottomLength = Math.floor(Math.random() * 2) + 1;
      return new BeamWithTwoBottomColumnsCase(
        generatePins(bottomLength, bottomLength),
        generatePins(bottomLength, bottomLength),
        generatePins(1, 2)
      );
    } else if (caseType < 0.6) {
      return new BeamWithColumnsCase(
        [],
        generatePins(1, 2),
        generatePins(1, 2)
      );
    } else {
      return new BeamWithColumnsCase(
        generatePins(1, 2),
        generatePins(1, 2),
        generatePins(1, 2)
      );
    }
  }
}

export function generateRandomStacksOnFloorCase(
  difficulty: "easy" | "medium" | "hard",
  availableRed: number,
  availableBlue: number,
  availableOrange: number
): StacksOnFloorCase {
  // Determine number of stacks based on difficulty and available resources
  let maxStacks: number;
  let pinsPerStack: number[];

  switch (difficulty) {
    case "easy":
      maxStacks = Math.floor(Math.random() * 2);
      pinsPerStack = Array.from(
        { length: maxStacks },
        () => Math.floor(Math.random() * 2) + 2
      );
      break;
    default:
      maxStacks = Math.floor(Math.random() * 4);
      pinsPerStack = Array.from(
        { length: maxStacks },
        () => Math.floor(Math.random() * 2) + 2
      );
      break;
  }

  // Adjust maxStacks based on available resources
  const totalPinsNeeded = pinsPerStack
    .slice(0, maxStacks)
    .reduce((a, b) => a + b, 0);
  const totalPinsAvailable = availableRed + availableBlue + availableOrange;

  if (totalPinsNeeded > totalPinsAvailable) {
    // Reduce stacks if not enough resources
    maxStacks = Math.min(maxStacks, Math.floor(totalPinsAvailable / 2));
  }

  // Ensure at least 0 stacks (can be empty)
  maxStacks = Math.max(0, maxStacks);

  const stacks: Pin[][] = [];
  const availableColors: Array<() => Pin> = [];

  if (availableRed > 0) {
    for (let i = 0; i < availableRed; i++) {
      availableColors.push(() => new RedPin());
    }
  }
  if (availableBlue > 0) {
    for (let i = 0; i < availableBlue; i++) {
      availableColors.push(() => new BluePin());
    }
  }
  if (availableOrange > 0) {
    for (let i = 0; i < availableOrange; i++) {
      availableColors.push(() => new OrangePin());
    }
  }

  // Shuffle available colors for randomness
  availableColors.sort(() => Math.random() - 0.5);

  let colorIndex = 0;

  for (let i = 0; i < maxStacks; i++) {
    const stackSize = pinsPerStack[i] || 2;
    const stack: Pin[] = [];

    // Try to use different colors in each stack for variety
    const usedColorsInStack = new Set<string>();

    for (let j = 0; j < stackSize && colorIndex < availableColors.length; j++) {
      const colorFactory = availableColors[colorIndex];
      if (!colorFactory) continue;

      const pin = colorFactory();

      // Try to avoid using same color twice in a stack if possible
      if (
        usedColorsInStack.has(pin.color) &&
        colorIndex < availableColors.length - 1
      ) {
        // Look ahead for a different color
        for (
          let k = colorIndex + 1;
          k < Math.min(colorIndex + 10, availableColors.length);
          k++
        ) {
          const nextFactory = availableColors[k];
          if (!nextFactory) continue;

          const nextPin = nextFactory();
          if (!usedColorsInStack.has(nextPin.color)) {
            // Swap
            const temp = availableColors[colorIndex];
            const swapFactory = availableColors[k];
            if (temp && swapFactory) {
              availableColors[colorIndex] = swapFactory;
              availableColors[k] = temp;
            }
            break;
          }
        }
      }

      const finalFactory = availableColors[colorIndex];
      if (finalFactory) {
        const finalPin = finalFactory();
        stack.push(finalPin);
        usedColorsInStack.add(finalPin.color);
      }
      colorIndex++;
    }

    if (stack.length > 0) {
      stacks.push(stack);
    }
  }

  return new StacksOnFloorCase(stacks);
}
