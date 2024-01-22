<script>
	import { storeName } from './store.js'
	
	import Hello from './Hello.svelte'
	import If from './If.svelte'
	import For from './For.svelte'
	import Event from './Event.svelte'
	import Event2 from './Event2.svelte'
	import ComponentTest from './ComponentTest.svelte'
	import Fruits from './Fruits.svelte'
	import Parent from './Parent.svelte'
	
	
	let name = 'asdseee';
	let a = 1;
	let b = 4;
  	let age = 80;
	function assign() {
		name = 'assign name';
		age = 77;
	}

	let fruits = ['Apple', 'Banana', 'Mango', 'Cherry', 'Orange', 'Tomato'];

	console.log(storeName)
	// store 에 저장한 값을 꺼내어 쓰고 싶을땐 $로 추가한다. (자동 구독 auto subscribe)
	console.log($storeName)

	$storeName = 'Test Store'
	
</script>
<style>
	h1 {color:red}
	.active {color:blue;}
</style>

<Parent />

<Fruits fr={fruits} />
<Fruits fr={fruits} reverse />
<Fruits fr={fruits} slice='-2' />
<Fruits fr={fruits} slice='0, 3' />

<ComponentTest />

<Event2 />

<h1>Hello {name}</h1>
{a} + {b} = {a+b}
<button on:click={() => name = 'ccccccccc'}>
	change!
</button>
<Hello/>

<h2 class={age < 85 ? 'active' : ''}>
	{age}
</h2>

<button on:click={() => age++}>
	age change!
</button>
<img src='' alt='{name}' />
<input type="text" bind:value={name} />
<button on:click={assign}>
	assign
</button>
<br>
<If />
<br>
<For />
<br>
<Event />