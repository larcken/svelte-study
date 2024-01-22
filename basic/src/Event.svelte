<script>
	// import {onMount} from 'svelte'
	
	let name = 'Event';
	let isRed = false;
	//현대 컴포넌트가 준비되면 실행하겠다.
	// onMount(() => {
	// 	const box = document.querySelector('.box');
	// 	box.addEventListener('click', () => {isRed = !isRed});	
	// })

	function leave(p) {
		name = p;
	}
	
	</script>
<style>
	.box {
		width: 300px;
		height: 150px;
		background-color: orange;
	}	
</style>

<h1>{name} example</h1>
<!-- <div class='box' 
	style='background-color: {isRed ? 'red' : 'orange'};'>
	Box!
</div> -->

<div class='box' 
	style='background-color: {isRed ? 'red' : 'orange'};'
	on:click={() => { isRed = !isRed }}
	on:mouseenter={() => name = 'enter'}
	on:mouseleave={() => {leave('test')}}>
	Box!
</div>


