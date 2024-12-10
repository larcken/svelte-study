<script>
  import Heropy from "./Heropy.svelte";
  import Neo from "./Neo.svelte";

  let components = [
    {name: 'Heropy', comp: Heropy},
    {name: 'Neo', comp: Neo}
  ]

  let index = 1
  let selected = components[0].comp

</script>

{#each components as {name, comp}, i (name)}
  <label>
    <!-- <input type="radio" value={name} bind:group={selected} /> -->
    <input type="radio" value={comp} bind:group={selected} on:change={() => {index = i + 1}} />
    {name}
  </label>
{/each}

<!-- 동적으로 컴포넌트를 렌더링 -->

<!-- {#if selected === 'Heropy'}
  <Heropy />
{:else if selected === 'Neo'}
  <Neo />
{/if} -->


<!-- 조건이 많은 경우 같은 코드가 반복되며 정리하기가 어려움
이럴때 사용하는것이 svelte component -->
<!-- 여기의 this는 bind를 붙이지 않는다. -->
<svelte:component this={selected} {index} />

<h3>데이터 확인: </h3>
<div>{selected}</div>