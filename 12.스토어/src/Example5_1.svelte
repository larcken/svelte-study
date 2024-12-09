<script>
  import {fruits} from './fruits.js'

  let value
</script>

<input bind:value />

<button on:click={() => fruits.setItem(value)}>
  Add fruit!  
</button>
<button on:click={() => console.log(fruits.getList())}>
  Log fruit list!
</button>

<ul>
  {#each $fruits as {id, name} (id)}
    <li>{name}</li>
  {/each}
</ul>