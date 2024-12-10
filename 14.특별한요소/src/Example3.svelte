<script>
  let key = ''
  let innerWidth
  let innerHeight
  let outerWidth
  let outerHeight
  let online
  let scrollX
  let scrollY
  // window.addEventListener('keydown', event => {
  //   key = event.key
  // })
</script>

<!-- window.addEventListener 로 script 작성한것과 같은 효과 -->
 <!-- window객체에 접근 및 수정(읽기전용이 아닌 요소만)이 가능 -->
<svelte:window 
      on:keydown={e => key = e.key} 
      bind:innerWidth={innerWidth}
      bind:innerHeight
      bind:outerWidth
      bind:outerHeight
      bind:online
      bind:scrollX
      bind:scrollY
/>

<h1>{key}</h1>
<div>innerWidth: {innerWidth}</div>
<div>innerHeight: {innerHeight}</div>
<div>outerWidth: {outerWidth}</div>
<div>outerHeight: {outerHeight}</div>
<div>online: {online}</div>
<input type="number" bind:value={scrollX} />
<input type="number" bind:value={scrollY} />
<div class="for-scroll"></div>

<style>
  .for-scroll {
    height: 2000px;
  }
</style>
