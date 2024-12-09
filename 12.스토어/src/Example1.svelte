<script>
  import WritableMethods from "./WritableMethods.svelte";
  import WritableMethods2 from "./WritableMethods.svelte";

  let toggle = true
</script>

<button on:click={() => toggle = !toggle}>
  Toggle
</button>

{#if toggle}
  <!-- 수동 구독 -->
  <!-- <WritableMethods />     -->
   <!-- 자동구독 -->
    <WritableMethods2 />
{/if}