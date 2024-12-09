<script>
  import {user} from './example2_store'

  // readable 읽기전용이기 때문에 get, set이 없다.
  console.log(user)
  // 자동 구독, user 객체 데이터가 출력된다.
  console.log($user)
  </script>

<button on:click={() => {
  $user.name = 'neo'
}}> Click!
</button>
<!-- 클릭 시 읽기전용이기 때문에 오류가 발생 -->
<!-- index.mjs:153 Uncaught TypeError: store.set is not a function
    at HTMLButtonElement.click_handler (Readable.svelte:7:20) -->



  <h2>{$user.name}</h2>