<script>
  export let address
</script>

<ul>
  <li>
    {address.label}
    {#if address.children}
      {#each address.children as address}
        <!-- 재귀적으로 다시 호출한다. -->
        <svelte:self {address} />
      {/each}
    {/if}
  </li>
</ul>