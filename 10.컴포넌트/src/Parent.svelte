<script>
  // import {createEventDispatcher} from 'svelte'
  // const dispatch = createEventDispatcher()

  import App from './App.svelte';
import Child from './Child.svelte'

</script>

<h2>Parent!</h2>
<!-- <button on:click={event => 
  dispatch('click', {
    // event:event
    event
  })
}>
  Parent click!
</button> -->

<!-- 이벤트 포워딩 : 이벤트와 보간을 작성하지 않아도 기본적인 이벤트가 발생했을때 부모컴포넌트로 전달된다. -->
<button on:click>
  Parent click!
</button>

<Child on:myEvent />