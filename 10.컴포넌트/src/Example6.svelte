<script>
  // Getter & Setter
  // getContext & setContext
  import {getContext} from 'svelte'
  import Heropy from "./Example6/Heropy.svelte";
  import Evan from "./Example6/Evan.svelte";
  import Lewis from "./Example6/Lewis.svelte";
  
  const pm = getContext('pm');
</script>

<h1>App({pm})</h1>
<div>
  <Heropy />
  <Lewis />
  <Evan />
</div>

<style>
  h1 {
    font-size: 50px;
  }
  div {
    padding-left: 50px;
  }
</style>