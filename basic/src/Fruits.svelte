<script>
	// Props : 바깥에서 파라미터를 전달 받을때 사용
	// export 를 붙여주면 컴포넌트를 사용할때 주입할 수 있는 파라미터가 된다.
	export let fr
	export let reverse
	export let slice
	let name = ''

	let computedFruits = []
	if (reverse) {
		computedFruits = [...fr].reverse();
		name = '(reverse)'
	} else if (slice) {
		// slice => '-2', '0, 3'
		computedFruits = fr.slice(...slice.split(','))
		name = `slice ${slice}`
	} else {
		computedFruits = fr;
	}	
</script>

<h2>
	Fruits Component {name}
</h2>
<ul>
	{#each computedFruits as f}
		<li>{f}</li>
	{/each}
</ul>