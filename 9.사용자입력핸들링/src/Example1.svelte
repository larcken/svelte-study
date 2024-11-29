<script>
  let fruits = [
    {id:1, name: 'Apple'},
    {id:2, name: 'Banana'},
    {id:3, name: 'Cherry'}
  ]  

  function assign(fruit) {
    fruit.name += '!'
    fruits = fruits
    // $$invalidate(0, fruits);
  }

</script>


<section>
  {#each fruits as fruit (fruit.id) }
    <div on:click={() => assign(fruit)}>
        {fruit.name}
    </div>
  {/each}
</section>

<!-- 반복문 내에서는 굳이 반응성 코드를 작성하지 않아도 동작한다. -->
<section>
  {#each fruits as fruit (fruit.id) }
    <div on:click={() => fruit.name += '!'}>
        {fruit.name}
    </div>
  {/each}
   <!-- $$invalidate(0, each_value_1[fruit_index].name += "!", fruits); -->
</section>

<section>
  {#each fruits as {id, name} (id) }
    <div on:click={() => name += '!'}>
        {name}
    </div>
  {/each}
   <!-- $$invalidate(0, each_value[fruit_index].name += "!", fruits); -->
</section>

<!-- 반복문에서는 인라인 핸들러로 작성해도 반응성 코드를 작성하지 않아도 동작하는것을 알 수 있다. 
    인라인 핸들러를 권장한다 라고 이해하면 된다.
 -->