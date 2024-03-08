<script>
  let count = 0;
  

</script>

<button on:click={() => {count += 1}}>증가!</button>
<button on:click={() => {count -= 1}}>감소!</button>

<h2>{count}</h2>

<section>
  <h2>1. if</h2>
  {#if count >3 }
    <div>count &gt; 3</div>
  {/if}
</section>

<section>
  <h2>2. if else</h2>
  {#if count >3 }
    <div>count &gt; 3</div>
  {:else}
    <div>count &lt;= 3</div>
  {/if}
</section>

<section>
  <h2>3. if else if</h2>
  {#if count >3 }
    <div>count &gt; 3</div>
  {:else if count === 3}
    <div>count = 3</div>
  {:else}
    <div>count &lt;= 3</div>
  {/if}
</section>

<section>
  <!-- 다른 프레임워크에서는 다중 블록을 권하지 않지만 가상돔을 사용하지 않는 svelte의 경우에는 다중 블록을 사용해도 문제없다. -->
  <h2>4. 다중 블록</h2>
  {#if count >3 }
    {#if count === 5 }
      count = 5
    {:else}
      count &gt; 3
    {/if}
  {/if}
</section>


<style>
  section {
    border: 1px solid orange;
    margin: 10px;
  }
</style>