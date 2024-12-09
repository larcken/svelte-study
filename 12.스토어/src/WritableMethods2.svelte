<script>
  import {count, name} from './store'

  console.log(count)

  // 자동 구독 방법

  function increase() {
    $count += 1
  }

  function changeName() {
    $name = 'Neo'
  }

</script>

<button 
  on:click={increase}
  on:click={changeName}>
  Click Me!
</button>

<h2>{$count}</h2>
<h2>{$name}</h2>