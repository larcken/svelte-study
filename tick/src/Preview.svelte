<script>
	let name = 'world';

	function handler() {
		name = "handler!"
		const h1 = document.querySelector('h1')

		// Hello handler!가 아닌 Hello world가 찍힌다.
		// 기본적인 task가 수행되고 화면을 갱신하기 때문 (일종의 스벨트의 최적화 방식때문)
		// 이런 문제를 tick 을 사용해서 해결할 수 있다.
		console.log(h1.innerText)
	}
</script>

<h1 on:click={handler}>Hello {name}</h1>