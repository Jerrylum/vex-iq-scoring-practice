<script lang="ts">
	import { onMount } from 'svelte';
	import { Scene } from '$lib/Scene';
	import { generateScenario, type Difficulty } from '$lib/SmartGenerator';

	let currentScene: Scene | null = null;
	let currentDifficulty = $state<Difficulty>('hard');
	let isLoading = $state(true);
	let isReloading = $state(false);
	let loadingMessage = $state('Loading scene...');

	// Scoring state
	interface ScoringItem {
		name: string;
		points: number;
		count: number;
		actualCount: number;
	}

	let scoringItems = $state<ScoringItem[]>([
		{ name: 'Connected Pins', points: 1, count: 0, actualCount: 0 },
		{ name: 'Connected Beams', points: 10, count: 0, actualCount: 0 },
		{ name: '2-Color Stacks', points: 5, count: 0, actualCount: 0 },
		{ name: '3-Color Stacks', points: 15, count: 0, actualCount: 0 },
		{
			name: 'Stacks in Matching Goal and/or Connected to Beam',
			points: 10,
			count: 0,
			actualCount: 0
		},
		{ name: 'Stacks Placed on Standoff Goal', points: 10, count: 0, actualCount: 0 },
		{ name: 'Cleared Starting Pins', points: 2, count: 0, actualCount: 0 },
		{ name: 'Robots Contacting 2+ Scoring Objects', points: 2, count: 0, actualCount: 0 }
	]);

	let showAnswer = $state(false);
	let actualTotalScore = $state(0);
	let isPanelCollapsed = $state(false);

	$effect(() => {
		// Calculate actual total score from the scenario
		actualTotalScore = scoringItems.reduce((sum, item) => sum + item.actualCount * item.points, 0);
	});

	let userTotalScore = $derived(scoringItems.reduce((sum, item) => sum + item.count * item.points, 0));

	let isCorrect = $derived(userTotalScore === actualTotalScore);

	function incrementCount(index: number) {
		scoringItems[index].count++;
	}

	function decrementCount(index: number) {
		if (scoringItems[index].count > 0) {
			scoringItems[index].count--;
		}
	}

	function toggleAnswer() {
		showAnswer = !showAnswer;
	}

	function resetScoring() {
		scoringItems.forEach((item) => {
			item.count = 0;
		});
		showAnswer = false;
	}

	function togglePanel() {
		isPanelCollapsed = !isPanelCollapsed;
		// Wait for the panel transition to complete, then resize the canvas
		setTimeout(() => {
			if (currentScene) {
				currentScene.resize();
			}
		}, 350); // Slightly longer than the 300ms transition
	}

	async function generateNewScenario(scene: Scene) {
		console.log(`\n=== Generating new scenario (difficulty: ${currentDifficulty}) ===`);

		// Generate all structures with smart resource management
		const scenario = generateScenario(currentDifficulty);

		// Visualize all structures
		for (const structure of scenario.structures) {
			try {
				await structure.visualize(scene);
			} catch (error) {
				console.error('Failed to visualize structure:', error);
			}
		}

		console.log(`\n=== Scenario generation complete: ${scenario.structures.length} structures created ===\n`);

		const scoring = scenario.calculateScoring();
		// For now, set random values for demonstration
		scoringItems[0].actualCount = scoring.structures.reduce((sum, structure) => sum + structure.connectedPins, 0);
		scoringItems[1].actualCount = scoring.structures.reduce((sum, structure) => sum + structure.connectedBeams, 0);
		scoringItems[2].actualCount = scoring.structures.reduce((sum, structure) => sum + structure.twoColorStacks, 0);
		scoringItems[3].actualCount = scoring.structures.reduce((sum, structure) => sum + structure.threeColorStacks, 0);
		scoringItems[4].actualCount = scoring.structures.reduce((sum, structure) => sum + structure.matchingGoals, 0);
		scoringItems[5].actualCount = scoring.structures.reduce((sum, structure) => sum + structure.stacksPlacedOnStandoffGoal, 0);
		scoringItems[6].actualCount = scoring.startingPins;
		scoringItems[7].actualCount = scoring.contacted;
	}

	async function reloadScenario() {
		if (!currentScene || isReloading) return;

		isReloading = true;
		resetScoring();

		try {
			// Clear existing game objects
			currentScene.clearGameObjects();
			console.log('Cleared game objects, loading new scenario...');

			// Load new scenario
			await generateNewScenario(currentScene);

			console.log('New scenario loaded successfully');
		} catch (error) {
			console.error('Failed to reload scenario:', error);
		} finally {
			isReloading = false;
		}
	}

	function handleDifficultyChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		currentDifficulty = target.value as Difficulty;
		console.log(`Difficulty changed to: ${currentDifficulty}`);
	}

	onMount(() => {
		const init = async () => {
			try {
				// Create the scene instance
				currentScene = new Scene('container');

				// Initialize scene (loads field and preloads all models)
				await currentScene.initialize();

				// Load initial scenario
				await generateNewScenario(currentScene);

				isLoading = false;
			} catch (error) {
				console.error('Failed to initialize scene:', error);
				loadingMessage = 'Failed to load scene';
			}
		};
		init();
	});
</script>

<svelte:head>
	<title>VEX IQ Scoring Practice</title>
</svelte:head>

<div class="flex h-screen w-screen bg-black">
	<!-- Three.js container -->
	<div class="relative h-full flex-1 overflow-hidden">
		<div id="container" class="absolute top-0 left-0 h-full w-full"></div>

		<!-- Loading message -->
		{#if isLoading}
			<div
				id="loading"
				class="absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 text-lg text-white"
				class:text-red-500={loadingMessage.includes('Failed')}
			>
				{loadingMessage}
			</div>
		{/if}

		<!-- Mobile Panel Toggle Button (when collapsed) -->
		{#if isPanelCollapsed}
			<button
				class="absolute right-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#0076BB] text-white shadow-lg hover:bg-[#005a91] md:hidden"
				onclick={togglePanel}
				aria-label="Open scoring panel"
			>
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
				</svg>
			</button>
		{/if}
	</div>

	<!-- Scoring Panel -->
	<div
		class="relative flex h-full flex-col bg-[#1f2937] text-white shadow-2xl transition-all duration-300 max-md:absolute max-md:top-0 max-md:right-0 max-md:z-40"
		class:w-[400px]={!isPanelCollapsed}
		class:w-12={isPanelCollapsed}
		class:max-md:w-full={!isPanelCollapsed}
		class:max-md:hidden={isPanelCollapsed}
	>
		<!-- Collapse Button (Desktop) -->
		<button
			class="absolute top-4 -left-14 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-[#374151] text-xl text-white shadow-lg hover:bg-[#4b5563] max-md:hidden"
			onclick={togglePanel}
			aria-label={isPanelCollapsed ? 'Expand panel' : 'Collapse panel'}
		>
			{isPanelCollapsed ? '◀' : '▶'}
		</button>

		{#if !isPanelCollapsed}
			<!-- Panel Header -->
			<div class="flex-none border-b border-[#374151] bg-[#111827] p-3">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-bold">Scoring Panel</h2>
					<button class="rounded-md bg-[#888B95] px-2 py-1 text-xs hover:bg-[#6b6e76] md:hidden" onclick={togglePanel}> Close </button>
				</div>

				<!-- Difficulty and New Scenario Controls -->
				<div class="mt-3 flex gap-2">
					<select
						id="difficulty-select"
						class="flex-1 cursor-pointer rounded-md border-none bg-[#0076BB] px-3 py-2 text-sm text-white transition-colors hover:bg-[#005a91] disabled:cursor-not-allowed disabled:bg-[#888B95]"
						value={currentDifficulty}
						onchange={handleDifficultyChange}
						disabled={isReloading}
					>
						<option value="easy">Easy</option>
						<option value="medium">Medium</option>
						<option value="hard">Hard</option>
					</select>
					<button
						id="reload-button"
						class="cursor-pointer rounded-md border-none bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-[#888B95]"
						onclick={reloadScenario}
						disabled={isReloading}
					>
						{isReloading ? '...' : 'New'}
					</button>
				</div>
			</div>

			<!-- Scoring Items -->
			<div class="flex-1 overflow-y-auto p-2">
				<div class="grid grid-cols-2 gap-2">
					{#each scoringItems as item, index}
						<div class="rounded-lg bg-[#374151] p-2 shadow-md">
							<div class="mb-1 text-[10px] leading-tight font-medium text-gray-200">
								{item.name}
							</div>
							<div class="mb-1 text-center text-[10px] text-[#888B95]">
								{item.points} pts
							</div>
							<div class="flex items-center justify-center gap-1">
								<button
									class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-red-600 text-base font-bold transition-colors hover:bg-red-700 active:bg-red-800"
									onclick={() => decrementCount(index)}
								>
									−
								</button>
								<div class="min-w-10 text-center text-xl font-bold">{item.count}</div>
								<button
									class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-green-600 text-base font-bold transition-colors hover:bg-green-700 active:bg-green-800"
									onclick={() => incrementCount(index)}
								>
									+
								</button>
							</div>
							{#if showAnswer}
								<div
									class="mt-1 text-center text-[10px]"
									class:text-green-400={item.count === item.actualCount}
									class:text-red-400={item.count !== item.actualCount}
								>
									Correct: {item.actualCount}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Score Display and Actions -->
			<div class="flex-none border-t border-[#374151] bg-[#111827] p-3">
				<div class="mb-3 text-center">
					<div
						class="text-3xl font-bold"
						class:text-green-400={showAnswer && isCorrect}
						class:text-red-400={showAnswer && !isCorrect}
						class:text-white={!showAnswer}
					>
						{userTotalScore}
					</div>
					{#if showAnswer}
						<div class="mt-1 text-sm">
							{#if isCorrect}
								<span class="font-semibold text-green-400">✓ Correct!</span>
							{:else}
								<span class="font-semibold text-red-400">✗ Incorrect</span>
								<div class="mt-1 text-xs text-[#888B95]">Actual: {actualTotalScore} points</div>
							{/if}
						</div>
					{/if}
				</div>

				<div class="flex gap-2">
					<button
						class="flex-1 rounded-md bg-[#0076BB] px-3 py-2 text-sm font-semibold transition-colors hover:bg-[#005a91] active:bg-[#004570]"
						onclick={toggleAnswer}
					>
						{showAnswer ? 'Hide' : 'Check'}
					</button>
					<button
						class="flex-1 rounded-md bg-[#888B95] px-3 py-2 text-sm font-semibold transition-colors hover:bg-[#6b6e76] active:bg-[#575a63]"
						onclick={resetScoring}
					>
						Reset
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
