<script>
	import Something from "./Something.svelte"
	let toggle = false;

	// lifecycle.js 파일에 등록한 라이프사이클 모듈을 불러온다.
	// 공통으로 라이프사이클 함수를 호출할때 유용하다.
	import {lifecycle, delayRender} from './lifecycle.js'
	
	let done = delayRender();
	lifecycle();

	import Something2 from "./Something2.svelte"

</script>

<!-- 라이프 사이클 start -->
<button on:click={() => {toggle = !toggle}}>
	Toggle
</button>

{#if toggle}
	<Something />
{/if}
<!-- 라이프 사이클 end -->

<!-- 라이프 사이클 모듈화 start -->
{#if $done}
	<h1>Hello Lifecycle!</h1>
{/if}

<Something2 />
<!-- 라이프 사이클 모듈화 end -->
