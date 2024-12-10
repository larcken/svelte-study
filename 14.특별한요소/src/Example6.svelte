<script>
  import Tiger from "./Tiger.svelte";

  let tiger

  function handler() {
    // 기본적으로는 컴포넌트의 옵션에 접근할 수 없다.
    // svelte:options 의 accessors 속성으로 접근할 수 있다.
    console.log(tiger)
    console.log(tiger.name)
    console.log(tiger.getAge())
  }
</script>

<button on:click={handler}>
  Toggle!
</button>
<Tiger bind:this={tiger} />