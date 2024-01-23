<script>
	import {tick} from 'svelte'

	let name = 'world';

	async function handler() {
		name = "handler!"
		// tick 은 promise를 반환하기 때문에 비동기 (await)로 실행시켜줘야함.
		// 화면이 갱신될때까지 기다리고 나서 그 이후의 코드가 수행된다.
		// await를 붙여주기 위해선 function 앞에 async를 붙여줘야한다.
		// tick은 언제 어디서나 자유롭게 사용 가능.
		await tick();
		const h1 = document.querySelector('h1')
		console.log(h1.innerText)
	}
</script>

<h1 on:click={handler}>Hello {name}</h1>