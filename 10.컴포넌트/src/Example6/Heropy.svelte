<script>
  import {setContext, getContext} from 'svelte'
  import Anderson from "./Anderson.svelte";

  const pocketMoney = 10000
  // 자식에게는 사용할 수 있지만, 형제, 부모에게는 사용할 수 없다.
  setContext('pm', pocketMoney)
  const pm = getContext('pm');
</script>

<h1 style="color: red">
  Heropy({pm})
</h1>
<ul>
  <li>
    <!-- pocketMoney 을 Anderson에서 Neo에게 전달 -->
    <!-- props를 사용할때 Neo에게 전달하기 위해 불가피하게 Anderson을 통해 전달해야함 -->
    <!-- ContextAPI를 이용해서 heropy에서 neo에게 바로 전달할 수 있다. -->
    <Anderson />
  </li>
</ul>
