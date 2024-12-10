<script>
  import {afterUpdate} from 'svelte'
  export let name
  // 기존 fruit === 새로운 fruit
  // afterUpdate 동작하지 않음

  let updateCount = 0

  // 업데이트가 발생된 후 호출
  afterUpdate(() => {
    updateCount += 1

  })
</script>

<!-- 비교했는데 같은 데이터면 변하지 않는다.
변한 경우에만 발생 -->
<!-- <svelte:options immutable /> -->

<!-- name 으로 변경하는 경우 변경되는것이 없어서 업데이트가 되지 않음 -->
<div>{name} ({updateCount})</div>