<script>
  import Totoro from "./Totoro.svelte";

  let toggle = false

</script>

<button on:click={()=>toggle = !toggle}>
  Toggle!
</button>

{#if toggle}
  <Totoro />
{/if}