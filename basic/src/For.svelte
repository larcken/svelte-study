<script>
	let name = 'FOR';
	let fruits = ['Apple', 'Banana', 'Mango', 'Cherry', 'Orange']
	function deleteFruit() {
		fruits = fruits.slice(1)
	}
</script>

<h1>{name} example</h1>
<button on:click={deleteFruit}>
	Eat it!
</button>
<ul>
	{#each fruits as fruit}
		<li>{fruit}</li>	
	{/each}
</ul>

