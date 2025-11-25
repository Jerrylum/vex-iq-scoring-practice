import type { Beam, Element, Pin } from './Element';

export interface StructureScoring {
	connectedPins: number;
	connectedBeams: number;
	twoColorStacks: number;
	threeColorStacks: number;
	matchingGoals: number;
	stacksPlacedOnStandoffGoal: number;
}

export function isNotTouching(e: Element): boolean {
	return !e.robot1Contacted && !e.robot2Contacted;
}

export function isStack(stack: Pin[], beam: Beam | null = null): boolean {
	return stack.length >= (beam ? 1 : 2) && stack.every(isNotTouching) && (!beam || isNotTouching(beam));
}

export function isStackMatchingGoal(stack: Pin[]): boolean {
	return isStack(stack) && stack[0]!.color === 'orange';
}

export function isTwoColorStack(stack: Pin[], beam: Beam | null = null): boolean {
	// the stack can be very high, but only contain two colors
	const colors = new Set<string>();
	for (const pin of stack) {
		colors.add(pin.color);
	}
	return colors.size === (beam ? 2 : 1) && isStack(stack, beam);
}

export function isThreeColorStack(stack: Pin[], beam: Beam | null = null): boolean {
	const colors = new Set<string>();
	for (const pin of stack) {
		colors.add(pin.color);
	}
	return colors.size >= (beam ? 2 : 1) && isStack(stack, beam);
}
