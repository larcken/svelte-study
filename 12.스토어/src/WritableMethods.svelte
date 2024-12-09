<script>
  import {onDestroy} from 'svelte'
  import {count, name} from './store'

  console.log(count)

  let number
  let userName

  // 수동구독 방법
  const unsubscribeCount = count.subscribe((c) => {
    number = c
  })

  const unsubscribeCount2 = count.subscribe(() => {})
  const unsubscribeName = name.subscribe((n) => {
    userName = n
  })

  function increase() {
    // count.update((c) => {
    //   return c + 1
    // })
    count.update(c => c + 1)
  }

  function changeName() {
    // name.update(() => {return 'Neo'})
    name.set('Neo')
  }

  onDestroy(() => {
    // 구독 취소
    unsubscribeCount()
    unsubscribeCount2()
    unsubscribeName()
  })

</script>

<button 
  on:click={increase}
  on:click={changeName}>
  Click Me!
</button>

<h2>{number}</h2>
<h2>{userName}</h2>