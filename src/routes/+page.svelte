<script lang="ts">
	import { onMount } from 'svelte';
	import { Scene } from '$lib/Scene';
	import { generateScenario, type Difficulty } from '$lib/SmartGenerator';

	let currentScene: Scene | null = null;
	let currentDifficulty = $state<Difficulty>('hard');
	let isLoading = $state(true);
	let isReloading = $state(false);
	let loadingMessage = $state('Loading scene...');

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

		console.log(
			`\n=== Scenario generation complete: ${scenario.structures.length} structures created ===\n`
		);
	}

	async function reloadScenario() {
		if (!currentScene || isReloading) return;

		isReloading = true;

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

	onMount(async () => {
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

		// Cleanup on unmount
		return () => {
			if (currentScene) {
				// Add any cleanup logic if needed
			}
		};
	});
</script>

<svelte:head>
	<title>Three.js STL Viewer</title>
</svelte:head>

<div class="relative h-screen w-screen overflow-hidden bg-[#1a1a1a]">
	<!-- Three.js container -->
	<div id="container" class="h-full w-full"></div>

	<!-- Difficulty selector -->
	<div class="absolute right-44 top-5 z-[100]">
		<select
			id="difficulty-select"
			class="cursor-pointer rounded-md border-none bg-blue-600 px-5 py-3 text-base text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
			value={currentDifficulty}
			onchange={handleDifficultyChange}
			disabled={isReloading}
		>
			<option value="easy">Easy</option>
			<option value="medium">Medium</option>
			<option value="hard">Hard</option>
		</select>
	</div>

	<!-- Reload button -->
	<button
		id="reload-button"
		class="absolute right-5 top-5 z-[100] cursor-pointer rounded-md border-none bg-green-600 px-6 py-3 text-base text-white shadow-md transition-all hover:bg-green-700 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md disabled:cursor-not-allowed disabled:bg-gray-400 disabled:transform-none"
		onclick={reloadScenario}
		disabled={isReloading}
	>
		{isReloading ? 'Loading...' : 'New Scenario'}
	</button>

	<!-- Loading message -->
	{#if isLoading}
		<div
			id="loading"
			class="absolute left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2 text-lg text-white"
			class:text-red-500={loadingMessage.includes('Failed')}
		>
			{loadingMessage}
		</div>
	{/if}
</div>

