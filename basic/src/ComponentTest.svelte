<script>
	let text = '';
	let fruits = ['Apple', 'Banana', 'Mango', 'Cherry', 'Orange']
</script>

<h2>
	Fruits
</h2>
<ul>
	{#each fruits as f}
		<li>{f}</li>
	{/each}
</ul>

<h2>
	Fruits reverse
</h2>
<ul>
	<!-- 
		전개연산자 (...) 
		새로운 배열로 만들어지게 됨
	-->
	{#each [...fruits].reverse() as f}
		<li>{f}</li>
	{/each}
</ul>

<h2>
	Fruits slice -2
</h2>
<ul>
	{#each fruits.slice(-2) as f}
		<li>{f}</li>
	{/each}
</ul>