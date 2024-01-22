<script>
	let name1 = 'world1';
	let toggle = false;

	if(toggle) {
		
	}
	// 시작은 #, 중간은 :, 끝은 /
	

</script>

<button on:click={() => {toggle = !toggle}}>
	toggle
</button>

{#if toggle}
	<h1>Hello {name1}</h1>
{:else}
	<div>
		No name!
	</div>
{/if}
	
