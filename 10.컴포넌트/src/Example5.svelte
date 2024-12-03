<script>
  import Parent from "./Parent.svelte";
  
  function handler(e) {
    // const e = event.detail.event
    console.log(e.currentTarget)
  }

  // Child > Parent > Example5 로 Parent에서 별다른 처리를 하지 않자 Example5로 이벤트가 전달됨
  // 하위 컴포넌트가 너무 많은 경우에는 그다지 유용하지 않고 store를 사용하는것이 좋다.
  // 1, 2 depth 정도로만 사용하자.
  function myEventHandler(e) {
    console.log(e.detail.myName)
  }

</script>

<Parent on:click={handler} on:myEvent={myEventHandler} />